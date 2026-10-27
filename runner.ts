import { chromium, type BrowserContext } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { STACKS, type Challenge, type StackId } from './stacks';

export const TESTDOJO_URL = process.env.TESTDOJO_URL || 'https://testdojo.testverse.workers.dev';
const CDP_PORT = Number(process.env.TESTDOJO_CDP_PORT || 9222);
const BUILD_TIMEOUT_MS = 5 * 60_000;
const RUN_TIMEOUT_MS = 3 * 60_000;

type CommandResult = { code: number | null; timedOut: boolean; tail: string };

const TAIL_LINES = 25;

/**
 * Runs a shell command, streaming its output into the job log and keeping the
 * last lines, so a failure message can show the learner what went wrong.
 */
function runCommand(command: string, cwd: string, timeoutMs: number): Promise<CommandResult> {
  return new Promise((done) => {
    console.log(`\n$ ${command}`);
    let output = '';
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        TESTDOJO_URL,
        // Playwright (any language) connects with this...
        TESTDOJO_CDP: `http://127.0.0.1:${CDP_PORT}`,
        // ...and Selenium attaches to the same browser with this.
        TESTDOJO_DEBUGGER: `127.0.0.1:${CDP_PORT}`,
        // Learners drive the browser the checks started; never download another.
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1'
      }
    });
    const collect = (chunk: Buffer, stream: NodeJS.WriteStream) => {
      stream.write(chunk);
      output = (output + chunk.toString()).slice(-20_000);
    };
    child.stdout.on('data', (chunk) => collect(chunk, process.stdout));
    child.stderr.on('data', (chunk) => collect(chunk, process.stderr));
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.on('close', (code) => {
      clearTimeout(timer);
      const tail = output.trimEnd().split(/\r?\n/).slice(-TAIL_LINES).join('\n');
      done({ code, timedOut, tail });
    });
  });
}

function withOutput(message: string, tail: string): string {
  return tail ? `${message}\n\nLast lines of output:\n${tail}` : message;
}

export type Run = { context: BrowserContext; failure: string | null; close: () => Promise<void> };

/**
 * Builds the learner's project, starts a browser, and runs their program
 * against it. Returns the still-open browser so the check can inspect what
 * their program left behind.
 */
export async function runLearnerProgram(challenge: Challenge): Promise<Run> {
  const stackId = process.env.STACK as StackId;
  const stack = STACKS[stackId];
  if (!stack) throw new Error(`Unknown STACK "${process.env.STACK}". Expected one of: ${Object.keys(STACKS).join(', ')}`);
  const cwd = join(resolve(process.env.SOLUTION_DIR || '../learner'), stack.dir);

  const build = await runCommand(stack.build, cwd, BUILD_TIMEOUT_MS);
  if (build.code !== 0) {
    throw new Error(
      withOutput(build.timedOut ? 'Building your project took too long.' : 'Your project failed to build.', build.tail)
    );
  }

  // A plain Chrome with nothing else attached, so the learner's program gets
  // the browser exactly as a real test would. (When Playwright launched it,
  // its own session skewed the page metrics and Selenium's clicks missed.)
  const chrome = await startChrome();
  try {
    const run = await runCommand(stack.run(challenge), cwd, RUN_TIMEOUT_MS);
    let failure: string | null = null;
    if (run.timedOut) failure = withOutput('Your program was still running after 3 minutes, so it was stopped.', run.tail);
    else if (run.code !== 0) failure = withOutput('Your program exited with an error.', run.tail);

    // Only now does the checker connect, to inspect what the program left behind.
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
    return {
      context: browser.contexts()[0],
      failure,
      close: async () => {
        await browser.close().catch(() => {});
        chrome.kill();
      }
    };
  } catch (error) {
    chrome.kill();
    throw error;
  }
}

// Selenium needs a real Chrome so its driver matches; CI sets CHROME_CHANNEL=chrome.
function chromeExecutable(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.env.CHROME_CHANNEL === 'chrome') {
    return process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : '/usr/bin/google-chrome';
  }
  return chromium.executablePath();
}

async function startChrome(): Promise<ChildProcess> {
  const chrome = spawn(
    chromeExecutable(),
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), 'testdojo-'))}`,
      '--window-size=1280,900',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  // Wait until the debugging port answers.
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) return chrome;
    } catch {
      /* not listening yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  chrome.kill();
  throw new Error('Chrome did not start. This is a problem with the checks, not your code.');
}
