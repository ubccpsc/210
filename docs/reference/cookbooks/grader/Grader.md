# Grading Cookbook

This document explains the report you see after you click `Save & Grade` on a lecture activity, lab, or exam.

The grader is a pipeline of six checks that run in order. Each check gets a card on the report, every card has a status, and the blue headline at the top summarises the quality of your submission. The report is designed to be read from the top down: fixing errors higher in the report will improve the odds of the steps lower in the report doing better.

**IMPORTANT:** While the main goal of the report is to provide formative feedback for you to learn how your solution can be improved, the best means of success is always focusing on the specification, and your own test suite, rather than treating the grader as a task list.

<!-- TODO: some screenshots
[A grading report with every check passing](img/report.png)
-->

## Reading the Report

### The Headline

The banner at the top gives a one-line summary, often referred to as a bucket. There are four:

- _Getting Started._ Major correctness gaps remain. Very little of the required specification has been completed.
- _Taking Shape._ Some core pieces are working, but important gaps remain.
- _On Track._ Core behaviour is mostly in place.
- _You Got This._ Core competency is demonstrated.

This overview tells you roughly how far along you are; the cards below provide clues about how to improve your solution.

### Why Buckets Instead of a Number

The headline is deliberately coarse. There are four buckets rather than a percentage, and the scored cards do not show how many hidden tests remain.

This comes from our own research on autograders. When a grader reports a precise score and lists every failing test, students tend to use it as a debugger: change something, resubmit, see whether the number went up, repeat. That loop can reach a high score without having to actually think about the intended specification, which is what real software engineers do continually. This also sets up an environment that diverges from real development: real systems do not have hidden test suites; engineers must carefully and thoughtfully reason their way to correct solutions to their problems.

We studied replacing points with four buckets in CPSC 310, across two terms and more than 700 students. With buckets, students submitted less often and reflected more between each attempt. They wrote fewer tests but better ones: coverage went up by 9% and their suites caught 5% more defective solutions. But at the same time, they wrote 22% less code with almost no loss in correctness. This means students also wasted less time chasing the last few points, the chase for which we believe does not improve overall understanding or learning.

Students said the buckets gave them a clearer sense of where their work stood, and they used office hours to talk about design rather than to chase individual test cases. The details are in [Chin, Kerr, Bradley, and Holmes, _Can Alternative Grading Improve Student Interactions In Automatically Graded Programming Assignments?_, ACM Transactions on Computing Education 26(1), 2026](https://www.cs.ubc.ca/~rtholmes/papers/toce_2025_chin.pdf).

The unit of progress this grader measures is a bucket, not a point. Use the clues on the cards to work out which part of the specification you have not covered, fix it properly, and resubmit when you have something worth checking.

### The Cards

Each of the six checks has a card, and each card shows one of three statuses:

- _OK_ (green). The check ran and found nothing to fix.
- _Needs work_ (amber). The check ran and found problems. The details are listed under the card.
- _Not checked_ (grey). The check could not run. Usually this is because an earlier check failed, and the message under the card says why.

A grey card is not a failure; it means the grader had nothing to say yet. Once the earlier problem is fixed, the grey cards will run. Some cards show a count beside the status, such as `12/12` on Test Results.

## The Six Checks

The checks run in a specific order. Some steps can make it so subsequent steps cannot continue.

### Course Policy

_What it checks._ Your `src/` and `test/` files are scanned for terms the course does not allow. There are two groups:

- Comments that silence the tools we grade with: `biome-ignore`, `eslint-disable`, `ts-expect-error`, and `istanbul ignore`. Suppressing a warning is not the same as fixing it.
- Synchronous file operations such as `readFileSync`, `writeFileSync`, `existsSync`, and `mkdirSync`. The course uses asynchronous I/O, and the synchronous variants are not appropriate in deployed practice.

_Why it exists._ These are shortcuts that would let a submission pass the later checks without doing the assigned work.

_If it fails._ Grading stops here and every other card shows Not checked. The card lists each prohibited term with its file and line. Remove them and resubmit. This card takes priority over everything else on the report.

### Build

_What it checks._ Your code is compiled with the TypeScript compiler, using the course's own `tsconfig.json` rather than any copy in your workspace.

_Why it exists._ Code that does not compile cannot be tested, so nothing after this point can run. This is the same static check described in the textbook's Part 1: the compiler catches a class of mistakes before the program ever runs.

_If it fails._ Grading stops here. Every compile error is listed with its file and line. These are the same errors VSCode shows you with red underlines, so you should rarely be surprised by this card. Before submitting to the autograder you should check the VSCode Problems View (or run `pnpm build`).

### Lint

_What it checks._ Your code is checked by Biome, the course linter, for formatting, style, and common mistakes such as unused variables.

_Why it exists._ The linter catches problems before they become bugs, and it keeps code consistent and readable across a whole codebase. Most real teams run linters for the same reason: when every file follows the same conventions, code is more consistent, readable, and less error-prone.

_If it fails._ Grading continues. Lint is not graded, and lint problems do not stop the later checks from running. Fix them anyway: most are fixable automatically with `pnpm lint:fix` in your workspace, or with the quick-fix lightbulb in VSCode, and resolving them will often help you avoid subtle errors.

### Test Results

_What it checks._ Your own tests, in `test/`, are run against your own code, in `src/`. Every test is listed, and the count shows how many pass.

_Why it exists._ This is the check you can reproduce exactly in your workspace with the Testing View (or `pnpm test`). This step exists to confirm that your suite runs cleanly on the grader, and it makes sure you have written tests at all.

_If it fails._ Grading continues. The card lists which tests failed and why. A test marked `test.todo` or `test.skip` shows as pending, not as a failure.

This card does not count toward your score. A green Test Results card tells you your tests pass on your code. Whether your code is correct, and whether your tests are any good, are the next two cards.

### Code Correctness

_What it checks._ Your `src/` directory is copied into our solution project, and _our_ tests are run against _your solution_.

_Why it exists._ Your own tests can only check the behaviour you thought of. Ours check the behaviour the assignment specifies. If your tests pass and our tests fail, your implementation has a gap that your tests did not cover.

_If it fails._ Grading continues. The card shows a small number of hints describing what went wrong, in general terms, without revealing the private tests. It will often not show a count, so you will not know how many tests remain. This is deliberate: the aim is not to reverse-engineer our suite but to go back to the specification, work out which required behaviour your suite is missing, and write a test of your own that exposes it. Once your test fails, you know what to fix.

### Test Strength

_What it checks._ Your `test/` directory is copied into our solution project, replacing ours, and your tests are run in two rounds.

First they run against our correct solution. If all of your tests are correct, they should all pass, because the solution also faithfully implements the specification. If any of your tests fail, your tests are asserting something the specification does not say. The card will then show Not checked with the failing tests listed. Fix those tests before anything else.

Then your tests are executed against several copies of the solution into which we have deliberately introduced a bug: a flipped comparison, a wrong return value, a missing branch. A strong test suite fails on each broken copy, because at least one test notices the bug. Conversely, a weak test suite is oblivious to the bugs we have introduced.

_Why it exists._ A test that never fails has no value. This check measures whether your tests would catch a real mistake, which is what tests are for. It is the direct counterpart of Code Correctness: that card tests _your_ code against _our_ tests, and this one tests _your_ tests against _our_ code.

_If it fails._ Grading continues. The card gives a small number of hints about what kind of bug your tests missed. The fix is always the same: revisit the specification, reason about how your test suite is insufficient, and add a test that asserts the missed behaviour.

## Where the Grade Comes From

Two of the first four checks are gates. Course Policy violations and Build errors will stop grading, meaning only the lowest bucket can be awarded.

The determination of the overall bucket comes from the last two cards, and they are mirror images of each other:

| Check | We keep | You supply | Question answered |
|---|---|---|---|
| Code Correctness | our tests | your `src/` | Does your code do what is required? |
| Test Strength | our code | your `test/` | Would your tests notice if it did not? |

Real code must work, and the only way to keep it working over time is with rigorous testing. This is why testing is deeply integrated into the evaluation methodology of the course.

## Using the Report as Feedback

The report is most useful when you read it as feedback on your work rather than as a list of things to do. A few habits help.

_Read it top to bottom, and fix the first card that is not OK._ The order is the dependency order. There is no point studying a Code Correctness hint while the Build card is amber, because the hint may be about code that never compiled.

_Reproduce what you can locally._ Course Policy, Build, Lint, and Test Results can all be checked in your workspace before you submit, with `pnpm build`, `pnpm lint`, and `pnpm test`. If those are clean locally, the first four cards will be OK, and every submission tells you something about the two cards that matter.

_Treat a Code Correctness hint as a prompt to write a test._ The hint is a clue about what is wrong, not a description of the test that failed. Turn that into a test of your own, watch it fail, then fix the code.

_Treat a Test Strength hint as a missing assertion._ The hint says what kind of bug slipped past. Ask what the specification promises about that behaviour, and write the test that checks it.

_Do not chase every hint._ The cards show only a few hints at a time, and your time is precious. The report is not a checklist to empty. Each hint points at a part of the specification you have not yet covered, and covering it properly, with your own tests, usually clears several hints at once.
