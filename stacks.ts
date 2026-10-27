/**
 * How each framework + language is built and run. Kept in the checks repo,
 * not in learners' repos, so nobody can change how their code is executed.
 */
export type StackId =
  | 'selenium-java'
  | 'selenium-python'
  | 'selenium-csharp'
  | 'playwright-js'
  | 'playwright-ts'
  | 'playwright-java';

export type Stack = {
  /** Folder in the learner's repo. */
  dir: string;
  /** Installs dependencies and compiles. Not timed against the challenge. */
  build: string;
  /** Runs the learner's program for a challenge. */
  run: (challenge: Challenge) => string;
};

export type Challenge = {
  /** Java/C# class name, e.g. RegistrationRookie */
  className: string;
  /** Python file, e.g. registration_rookie.py */
  pythonFile: string;
  /** JavaScript/TypeScript file stem, e.g. registration-rookie */
  scriptName: string;
};

export const STACKS: Record<StackId, Stack> = {
  'selenium-java': {
    dir: 'selenium-java',
    build: 'mvn -B -q compile',
    run: (c) => `mvn -B -q exec:java -Dexec.mainClass=${c.className}`
  },
  'selenium-python': {
    dir: 'selenium-python',
    build: 'python -m pip install -q -r requirements.txt',
    run: (c) => `python ${c.pythonFile}`
  },
  'selenium-csharp': {
    dir: 'selenium-csharp',
    build: 'dotnet build -nologo -v q',
    run: () => 'dotnet run --no-build'
  },
  'playwright-js': {
    dir: 'playwright-js',
    build: 'npm install --no-audit --no-fund --loglevel=error',
    run: (c) => `node ${c.scriptName}.js`
  },
  'playwright-ts': {
    dir: 'playwright-ts',
    build: 'npm install --no-audit --no-fund --loglevel=error',
    run: (c) => `npx tsx ${c.scriptName}.ts`
  },
  'playwright-java': {
    dir: 'playwright-java',
    build: 'mvn -B -q compile',
    run: (c) => `mvn -B -q exec:java -Dexec.mainClass=${c.className}`
  }
};
