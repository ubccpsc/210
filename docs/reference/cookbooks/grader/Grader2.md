# Understanding the Grading Report

This document explains the report you see after you click `Save & Grade` on a lecture activity, lab, or exam.

The grader is a pipeline of six checks that run in order. Each check gets a card on the report, every card has a status, and the blue headline at the top summarises the quality of your submission. The report is designed to be read from the top down: fixing errors higher in the report will improve the odds of the steps lower in the report doing better. 

While the main goal of the report is to provide formative feedback for you to learn how your solution can be improved, the best means of success is always focusing on the specification, and your own test suite, rather than treating the grader as a task list.

<!-- TODO: save the report screenshot as img/report.png, then uncomment:
![A grading report with every check passing](img/report.png)
-->

## Reading the Report

### The Headline

The banner at the top gives a one-line summary. There are four:

- _Getting Started._ Major correctness gaps remain. Focus on the highest-priority category feedback first.
- _Taking Shape._ Some core pieces are working, but important gaps remain.
- _On Track._ Core behaviour is mostly in place. Use the remaining feedback to refine.
- _You Got This._ Core competency is demonstrated. Review any remaining feedback to polish details.

Which one you see depends on your score, and the thresholds are set per assignment. The headline tells you roughly how far along you are; the cards below tell you what to do next.

### The Cards

Each of the six checks has a card, and each card shows one of three statuses:

- _OK_ (green). The check ran and found nothing to fix.
- _Needs work_ (amber). The check ran and found problems. The details are listed under the card.
- _Not checked_ (grey). The check could not run. Usually this is because an earlier check failed, and the message under the card says why.

The two axes are deliberately separate. A grey card is not a failure; it means the grader had nothing to say yet. Once the earlier problem is fixed, the grey cards will run.

Some cards show a count beside the status, such as `12/12` on Test Results. Counts appear only where the assignment chooses to show them.

## The Six Checks

The checks run in this order, and the order matters: each one assumes the ones before it passed.

### Course Policy

_What it checks._ Your `src/` and `test/` files are scanned for terms the course does not allow. There are two groups:

- Comments that silence the tools we grade with: `biome-ignore`, `eslint-disable`, `ts-expect-error`, and `istanbul ignore`. Suppressing a warning is not the same as fixing it.
- Synchronous file operations such as `readFileSync`, `writeFileSync`, `existsSync`, and `mkdirSync`. The course uses asynchronous I/O throughout, and the synchronous variants defeat what the asynchrony chapter is teaching.

_Why it exists._ These are shortcuts that would let a submission pass the later checks without doing the work the assignment asks for.

_If it fails._ Grading stops here and every other card shows Not checked. The card lists each prohibited term with its file and line. Remove them and resubmit. This card takes priority over everything else on the report.

### Build

_What it checks._ Your code is compiled with the TypeScript compiler, using the course's own `tsconfig.json` rather than any copy in your workspace.

_Why it exists._ Code that does not compile cannot be tested, so nothing after this point can run. This is the same static check described in the textbook's Part 1: the compiler catches a class of mistakes before the program ever runs.

_If it fails._ Grading stops here. Every compile error is listed with its file and line. These are the same errors VSCode shows you with red underlines, so you should rarely be surprised by this card; run `pnpm build` in your workspace before submitting and it will tell you the same thing. See the [VSCode cookbook](../vscode/VSCode) for where to find them in the editor.

### Lint

_What it checks._ Your code is checked by Biome, the course linter, for style and formatting problems.

_Why it exists._ Consistent formatting is part of code quality, and the linter enforces it so that people do not have to.

_If it fails._ Grading continues. Lint problems do not stop the later checks from running, and they do not affect your score directly. Most are fixable automatically: run `pnpm lint:fix` in your workspace, or use the quick-fix lightbulb in VSCode. Fix them anyway; a clean Lint card is expected on every submission, and lint problems in a project are graded.

### Test Results

_What it checks._ Your own tests, in `test/`, are run against your own code, in `src/`. Every test is listed, and the count shows how many pass.

_Why it exists._ This is the check you can reproduce exactly in your workspace with `pnpm test`. It confirms that your suite runs cleanly on the grader, and it makes sure you have written tests at all. Tests are part of the deliverable, and this is where that becomes visible.

_If it fails._ Grading continues. The card lists which tests failed and why. A test marked `test.todo` or `test.skip` shows as pending; those are not failures, but a suite where every test is pending has not run anything, and the card will say so.

This card does not count toward your score. A green Test Results card tells you your tests pass on your code. Whether your code is correct, and whether your tests are any good, are the next two cards.

### Code Correctness

_What it checks._ Your `src/` directory is copied into our solution project, replacing ours, and our tests are run against it. These are private tests you cannot see.

_Why it exists._ Your own tests can only check the behaviour you thought of. Ours check the behaviour the assignment requires. If yours pass and ours fail, your implementation has a gap that your tests did not cover.

_If it fails._ Grading continues. The card shows a small number of hints describing what went wrong, in general terms, without revealing the private tests. It does not show a count, so you will not know how many tests remain. This is deliberate: the aim is not to reverse-engineer our suite but to go back to the specification, work out which required behaviour you are missing, and write a test of your own that exposes it. Once your test fails, you know what to fix.

### Test Strength

_What it checks._ Your `test/` directory is copied into our solution project, replacing ours, and your tests are run in two rounds.

First they run against our correct solution. All of your tests should pass, because the solution is right. If any fail, your tests are asserting something the specification does not require, and this card shows Not checked with the failing tests listed. Fix those tests before anything else.

Then they run against several copies of the solution into which we have deliberately introduced a bug: a flipped comparison, a wrong return value, a missing branch. A good test suite fails on each broken copy, because at least one test notices the bug. A weak suite passes them all, because nothing it asserts was affected.

_Why it exists._ A test that never fails is not doing anything. This check measures whether your tests would catch a real mistake, which is what tests are for. It is the direct counterpart of Code Correctness: that card tests your code against our tests, and this one tests your tests against our code.

_If it fails._ Grading continues. The card gives a small number of hints about what kind of bug your tests missed, again without counts. The fix is always the same: add a test that asserts the behaviour the hint points at. Think about what the specification promises that your current tests do not check.

## Where the Grade Comes From

The first four checks are gates. They have to pass, and Course Policy and Build will stop grading if they do not, but on their own they contribute nothing to the score. All OK on those four means the grader was able to evaluate your work, not that the work is right.

The score comes from the last two cards, and they are mirror images of each other:

| Check | We keep | You supply | Question answered |
|---|---|---|---|
| Code Correctness | our tests | your `src/` | Does your code do what is required? |
| Test Strength | our code | your `test/` | Would your tests notice if it did not? |

This is why the course treats tests as part of the work rather than as an afterthought. The quality of your tests is one of the two things the grader scores, and a submission with correct code and no tests scores badly.

## Using the Report as Feedback

The report is designed for resubmission. A few habits make it more useful.

_Read it top to bottom, and fix the first card that is not OK._ The order is the dependency order. There is no point studying a Code Correctness hint while the Build card is amber, because the hint may be about code that never compiled.

_Reproduce what you can locally._ Course Policy, Build, Lint, and Test Results can all be checked in your workspace before you submit, with `pnpm build`, `pnpm lint`, and `pnpm test`. If those are clean locally, the first four cards will be OK, and every submission tells you something about the two cards that matter.

_Treat a Code Correctness hint as a prompt to write a test._ The hint says roughly what is wrong. Turn that into a test of your own, watch it fail, then fix the code. You end up with both the fix and the test that protects it, which is what a stronger Test Strength card needs anyway.

_Treat a Test Strength hint as a missing assertion._ The hint says what kind of bug slipped past. Ask what the specification promises about that behaviour, and write the test that checks it.

_Do not chase every hint._ The cards show only a few hints at a time, and the number of remaining problems is hidden on purpose. The report is not a checklist to empty. It is pointing at the part of the specification you have not yet covered, and covering it properly usually clears several hints at once.
