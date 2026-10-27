# TestDojo challenge checks

The official checks for the [TestDojo automation challenges](https://testdojo.dev/challenges).

**You don't need to clone or change this repo.** When you press **Run test** on TestDojo, the
workflow in your challenge repo downloads these checks fresh, so everyone is checked the same way.

## How a check works

1. The checker builds your project (Maven, pip, .NET or npm, depending on your language).
2. It starts a Chrome browser.
3. **Your program** connects to that browser and does the task. The "TestDojo setup" lines at the
   top of your file handle the connection.
4. When your program finishes, the checker inspects what it left in the browser and decides
   whether you passed.

Because the checker only looks at the result in the browser, the same checks work for Selenium
and Playwright in every language.

| Framework | Languages |
|---|---|
| Selenium | Java, Python, C# |
| Playwright | JavaScript, TypeScript, Java |

You're welcome to read the checks (`tests/`) to see exactly what's verified. How each language is
built and run is in `stacks.ts`.
