# Verifying the invariant
 
### Motivation
 
 "This class enforces its invariant" is a claim until we verify it. Tests validate invariants directly, covering expected and unexpected behaviours. Tests document invariants as checkable contracts, supporting trust now and evolvability later, when the implementation changes but the contract should not. Testability serves as a feedback loop into prior design choices.




 ### MATERIAL THAT SHOULD BE COVERED

 * extend equivalence class partitioning to input/output partitioning
 * describe equivalence class partitioning on more complex / real world types
 * describe white box testing
 * talk about the strengths and weaknesses of white box testing compared to black box testing

Bring this up to here:

## Regression Testing

A program is not finished when it first passes its tests. Code changes over time: bugs get fixed, features get added, and working code gets reorganized. Every change is an opportunity to introduce a **regression**—a change that breaks behavior that previously worked.

Tests protect against regressions. Suppose that months later, a teammate decides to tidy up `lateFee`. They notice that at `daysLate = 2` the formula `0.5 * (daysLate - 2)` evaluates to `0` anyway, check that value by hand, and conclude the grace-period branch is redundant:

```typescript
function lateFee(daysLate: number): number {
    const fee = 0.5 * (daysLate - 2);
    if (fee > 10) {
        return 10;
    }
    return fee;
}
```

Their manual spot-check was correct—`lateFee(2)` still returns `0`—but the change is wrong: `lateFee(0)` now returns `-1`. The test suite catches it immediately, because the grace-period test still asserts `checkExpect(lateFee(0), 0)`. The suite knew something the spot-check missed.

This is the second job of a test suite, and over the life of a program it is the more important one. Tests do not just help you get the code right the first time; they keep it right as it changes. Re-running the full suite after any change—even a change that "obviously" cannot break anything—is what makes it safe to keep improving a program. The effort of writing tests pays off every time the code changes.


## White-Box Testing

Everything so far has been **black-box testing**: we derived every test from the specification, treating the implementation as a box we cannot see into. Black-box tests check that the function does what it promises.

**White-box testing** takes the complementary view. Once an implementation exists, we can read it and ask a different question: do our tests actually *exercise* the code that was written? Reading the code reveals its branches, and each branch is a place a fault could hide untested.

Here is our finished `lateFee` again, with its branches identified:

```typescript
function lateFee(daysLate: number): number {
    if (daysLate <= 2) {
        return 0;                       // branch 1: grace period
    }
    const fee = 0.5 * (daysLate - 2);
    if (fee > 10) {
        return 10;                      // branch 2: capped
    }
    return fee;                         // branch 3: accruing
}
```

Now map the test suite onto the branches: `lateFee(0)` and `lateFee(2)` execute branch 1, `lateFee(30)` executes branch 2, and `lateFee(3)` and `lateFee(12)` execute branch 3. Every branch is exercised by at least one test, so no part of this implementation runs only when no test is watching.

### Coverage

**Coverage** makes the white-box question measurable: how much of the program's code does the test suite actually execute? The most practical form is **branch coverage**: the fraction of branches executed by at least one test.

Our suite executes all three branches of `lateFee`, for 100% branch coverage. If we deleted the maximum-fee test, branch 2 would never execute during testing: coverage drops to 2 of 3 branches, and a coverage report points at the exact lines no test reaches. That is what coverage is for—it finds the parts of your code that your suite silently ignores.

But coverage has a sharp limit, and our own example demonstrates it. Recall the buggy implementation from earlier, the one missing the cap. It had only two branches—and our grace-period and accrual tests executed both of them. Its branch coverage was 100%, *and it was wrong*. Coverage could not reveal the fault, because the fault was not an untested branch; it was a missing one. Coverage measures the code you wrote, not the code the specification required.

This is why white-box testing supplements black-box testing but never replaces it. Reading the code tells you whether your tests reach what is there; only the specification can tell you what ought to be there.
