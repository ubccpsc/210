# Testing

We previously introduced the distinction between the static and dynamic views of a program. The compiler checks the static view: it reads your source code, analyses your types, and flags inconsistencies before the program runs. But a program that passes the type checker can still produce the wrong results. Types tell you what *kind* of value a function returns; they do not tell you whether that value is *correct*. That gap is filled by automated testing. In this course we will mainly focus on what are known as unit tests, as they test individual units of a program, usually at the individual function level.

## Anatomy of a Test Suite

Tests are commonly held separate from the code they validate. In all of the code we look at in this course, in line with common best practice, product code is stored in the `src/` directory and all tests are stored in the `test/` directory. The `test/` directory can contain any number of test files, often in 1:1 correspondence with the files being tested in `src/`. Within each test file is a number of individual test cases. Each test case has a name and a body. The name describes what the test is checking; the body contains one or more assertions. The `checkExpect` call we have been using in this course is an example of an assertion. A concrete test case that ensures `letterGrade(88)` returns `"A"` looks like:

```typescript
test("letterGrade returns A for a score of 88", () => {
    checkExpect(letterGrade(88), "A");
});
```

Assertions are the core of any test case: these validate that a dynamic behaviour emits the expected output for a given input. The `checkExpect` assertion takes two arguments: an expression to evaluate, and the expected result. If the two values are equal, the test passes silently. If they differ, the framework reports what was expected and what was actually produced, pointing you to the failing test by name.

<details class="tooltip link-110">
<summary>Tests in BSL</summary>

BSL used `check-expect` as a standalone expression at the top level of a file. TypeScript's `test` wrapper is a small change in form: it names the test and groups related checks together. The underlying idea—write down what you expect and let the framework compare—is the same.

```racket
(check-expect (letter-grade 88) "A")
```

</details>

<details class="tooltip ts-tips">
<summary>Running tests</summary>

Tests in this course are run with `pnpm test` from the terminal, or using the IDE's test-running feature. The test framework executes every test case it can find in the `test/` directory. Test cases are aggregated by the files that contain them. Passing test cases are printed in green; failing test cases are printed in red, along with what was expected and what was actually returned.
</details>

## The Testing Process

So far we have treated tests as something you write for code that already exists. In practice, the order is often reversed: we write the tests _first_. Writing tests first forces you to think about what expected behaviours are for some *code under test* (CUT), before you spend time implementing it. Having a precise set of input/output pairs is extremely helpful when you are implementing the code. Before writing the implementation you can execute your tests to ensure they fail; once the implementation has been correctly created, the test should pass. By ensuring the test fails first helps us to ensure that having that same test case pass is providing useful signal.

For the rest of this reading we will work with a single running example. Suppose the campus library asks us to implement its late-fee policy:

```typescript
/**
 * Computes the fee (in dollars) for a library book returned
 * daysLate days after its due date.
 *
 * The first 2 days are a grace period: no fee is charged.
 * After the grace period, the fee is $0.50 for each additional
 * day. The total fee never exceeds $10.
 *
 * Precondition: daysLate is a whole number and daysLate >= 0
 */
function lateFee(daysLate: number): number
```

The specification alone gives us everything we need to write tests before we write its implementation. Each clause from the function documentation becomes a test:

```typescript
test("no fee during the grace period", () => {
    checkExpect(lateFee(0), 0);
    checkExpect(lateFee(2), 0);
});

test("fee accrues for each day after the grace period", () => {
    checkExpect(lateFee(3), 0.50);
    checkExpect(lateFee(12), 5.00);
});

test("fee never exceeds the maximum", () => {
    checkExpect(lateFee(30), 10.00);
});
```

To run these tests, `lateFee` must at least exist—otherwise the compiler will refuse to execute the program at all. So we begin with a **stub**: a function with the right signature that returns a clearly wrong value.

```typescript
function lateFee(daysLate: number): number {
    return -1;  // stub
}
```

We chose `-1` deliberately. A fee is never negative, so every test is guaranteed to fail against the stub. (Had the stub returned `0`, the grace-period test would have passed before we wrote any real code.) Running the suite now shows three failing tests. This step matters more than it looks: a test that cannot fail checks nothing, and we have just confirmed that all of ours can.

<details class="tooltip link-110">
<summary>You have done this before</summary>

This is the same ordering as the How to Design Functions recipe from CPSC 110: signature, purpose, and stub first, then *examples*—written as `check-expect`s—before you write the function body. What CPSC 110 called examples, we now call tests. The discipline of recording expected behavior before implementing it carries over unchanged.
</details>

Now we implement the function and run the tests again:

```typescript
function lateFee(daysLate: number): number {
    if (daysLate <= 2) {
        return 0;
    }
    return 0.5 * (daysLate - 2);
}
```

```
✓ no fee during the grace period
✓ fee accrues for each day after the grace period
✗ fee never exceeds the maximum
      Expected: 10
      Received: 14
```

Two tests pass, but the third fails. The failure report tells us exactly where to look: `lateFee(30)` produced `14`. Re-reading the specification reveals the problem—our implementation handles the grace period and the per-day charge, but we forgot the maximum entirely. The fix adds the missing behavior:

```typescript
function lateFee(daysLate: number): number {
    if (daysLate <= 2) {
        return 0;
    }
    const fee = 0.5 * (daysLate - 2);
    if (fee > 10) {
        return 10;
    }
    return fee;
}
```

All three tests now pass. Notice what did *not* change: the tests. They were correct all along, because they were written from the specification—and so the requirement our implementation forgot had nowhere to hide. If we had written our tests *after* the implementation, by reading our own code and checking that it does what it appears to do, would we have thought to test the maximum? Probably not: the code contains no hint that a maximum should exist. Tests written first keep the specification in charge; tests written after tend to mirror the code, mistakes included.

<details class="tooltip ts-tips">
<summary>The <code>const</code> keyword</summary>

`const` introduces a named value. Here `fee` names the result of the per-day calculation so it can be compared against the maximum and then returned. A `const` cannot be reassigned after it is defined.
</details>

<details class="tooltip deep-dive">
<summary>Tests as executable specifications</summary>

A test suite written before the implementation acts as an *executable specification*—a precise, runnable description of the intended behavior. This is more valuable than a written description alone, because the computer can verify whether your implementation matches it, every time you run the suite.
</details>

<!--
The full process, then:

1. Read the specification and write tests that capture each promised behavior.
2. Stub the function and run the tests, confirming that every test fails.
3. Implement the function.
4. Run the tests again. If any fail, use the failure reports to find and fix the fault.
5. Repeat until the suite passes.
-->

## Deriving Tests from the Specification

We wrote the `lateFee` suite by instinct: read the specification, turn each clause into a test. That instinct served us well, but instinct alone does not tell you when a suite is *complete enough*. Two systematic techniques—equivalence class partitioning and boundary value analysis—turn that instinct into a method.

## Equivalence Class Partitioning

The most direct way to choose test inputs is to divide the input space into **equivalence classes**: groups of inputs that the specification says should be handled the same way. You then choose at least one **representative** from each class.

The `lateFee` specification divides its input into three classes:

| Class | Inputs | Behavior |
|---|---|---|
| Grace period | 0–2 | fee is 0 |
| Accruing | 3–21 | fee grows by $0.50 per day |
| Capped | 22 and up | fee is exactly $10 |

Look back at the suite we wrote: it contains a representative from each class—`lateFee(0)` and `lateFee(2)` for the grace period, `lateFee(3)` and `lateFee(12)` for accrual, `lateFee(30)` for the cap. It is no accident that this suite caught our missing-maximum fault: the suite had a representative from the capped class, and that is precisely the class the implementation forgot.

Within a class, one representative is as informative as another. `lateFee(12)` and `lateFee(15)` both exercise the accruing class; testing both adds almost no confidence beyond testing one. Counting tests is therefore a poor measure of a suite: a suite of `lateFee(5)`, `lateFee(8)`, and `lateFee(15)` has three assertions but covers only one class—and would have passed our buggy, cap-free implementation without complaint. What matters is covering the *classes*, not accumulating assertions.

<details class="tooltip deep-dive">
<summary>Classes come from the specification, not the implementation</summary>

Two inputs belong to the same class when the *specification* says they should behave the same way—not when they happen to take the same path through the code you wrote. In our buggy implementation, `lateFee(12)` and `lateFee(30)` took the same path through the code; classes derived from that implementation would have merged them, and the fault would have survived. Classes derived from the specification kept them apart, which is exactly why the fault was caught.
</details>

## Boundary Value Analysis

Equivalence class partitioning identifies the regions to test. **Boundary value analysis** identifies *where* within those regions to look most carefully: at the edges, where one class meets the next.

Bugs cluster at boundaries, because boundaries are where comparisons live—and comparisons are easy to get wrong by one. `lateFee` has two boundaries: between days 2 and 3 (grace ends, accrual begins) and between days 21 and 22 (accrual reaches the maximum). A boundary-focused test checks the last input on each side:

```typescript
test("fee changes exactly at the class boundaries", () => {
    checkExpect(lateFee(2), 0);      // last free day
    checkExpect(lateFee(3), 0.50);   // first charged day
    checkExpect(lateFee(21), 9.50);  // last accruing day
    checkExpect(lateFee(22), 10.00); // first day at the maximum
});
```

To see why these tests earn their place, consider a near-miss implementation in which the grace check was written `daysLate <= 3` instead of `daysLate <= 2`. Every test we have written so far passes against it—except `checkExpect(lateFee(3), 0.50)`, which fails because the faulty function returns `0`. In fact, `3` is the *only* input in the entire domain where this fault is visible. A representative from the middle of the class, like `lateFee(12)`, sails past it.

That is the essence of boundary value analysis: off-by-one faults are often invisible everywhere except at a single input value, so that value must be in the suite.

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

## Testing and Types Together

The type checker and the test suite operate at different times: The type checker works statically on the source code, ruling out whole categories of invalid calls before the program runs. Tests work dynamically, verifying specific behaviors by actually executing the function. They are complementary approaches: a program that passes every type check can still return the wrong value for a given input. A program that passes all its tests may still fail on an input the test suite did not evaluate. The combination is what gives confidence: types narrow the space of programs that can even be written, and tests verify that the program you wrote does what you intended.
