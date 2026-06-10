# Verifying the invariant
 
### Motivation
 
 "This class enforces its invariant" is a claim until we verify it. Tests validate invariants directly, covering expected and unexpected behaviours. Tests document invariants as checkable contracts, supporting trust now and evolvability later, when the implementation changes but the contract should not. Testability serves as a feedback loop into prior design choices.




 ### MATERIAL THAT SHOULD BE COVERED

 * extend equivalence class partitioning to input/output partitioning
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