# Checking Invariants

We previously introduced the distinction between the static and dynamic views of a program. The compiler checks the static view: it reads your source code, analyses your types, and flags inconsistencies before the program runs. But a program that passes the type checker can still produce the wrong results. Types tell you what *kind* of value a function returns; they do not tell you whether that value is *correct*.

The properties a correct program must maintain beyond its types are called **invariants**. This reading is about working with them: what an invariant is, how to identify the invariants in a problem, how to record them in a function's documentation so they can be detected later, and how to check them with automated tests. In this course we will mainly focus on what are known as unit tests, as they test individual units of a program, usually at the function level.

## What Is an Invariant?

An **invariant** is a property that must hold for a value or a computation to be meaningful, but that the type system cannot express or enforce. We have already met one. In the previous reading, the `Song` type carried this comment:

```typescript
type Song = {
  title: string;
  artist: string;
  durationSeconds: number; // must be positive
};
```

The comment is doing work the type cannot: `number` includes `-30`, but no real song has a negative duration. The type checker happily accepts an object that violates the rule:

```typescript
// passes the type checker; violates the invariant
const broken: Song = {
  title: "Song A",
  artist: "Artist 1",
  durationSeconds: -30
};
```

This object has the right *shape*, so the static check passes. But its *meaning* is wrong, and any code that trusts it, say, a function summing the durations in a playlist, will quietly produce nonsense. When an invariant fails, a value can no longer be trusted by the operations built on it, even though every type check passes.

Invariants are everywhere once you look for them: a duration is positive, a percentage score sits between 0 and 100, a count is a whole number, a list of registered students contains no duplicates. None of these facts appear in the types `number`, `number`, `number`, and `string[]`. They live in the gap between what the type allows and what the problem means.

## Identifying Invariants

At the function level, invariants attach in two places: to a function's inputs and to its output.

For the rest of this reading we will work with a single running example. Suppose the campus library asks us to implement its late-fee policy: a book returned up to 2 days late incurs no fee; after that grace period, the fee is $0.50 for each additional day; and the total fee never exceeds $10. The function computing the fee will have this signature:

```typescript
lateFee(daysLate: number): number
```

A **precondition** is what must be true of the arguments when the function is called. The parameter type admits any number: `-4`, `3.7`, `40000`. But `daysLate` is a count of days, so the function is only meaningful when `daysLate` is a whole number and at least 0. That restriction is the precondition.

A **postcondition** is what the function guarantees about its result, assuming the precondition held. The return type says only `number`, but the policy promises more: the fee is never negative, and it never exceeds $10. Those guarantees are postconditions.

To identify these in your own functions, interrogate the gap between type and meaning:

- For each parameter, ask: *of all the values this type allows, which are actually meaningful?* Any restriction you state is a precondition. Look for ranges, wholeness, non-empty strings, and relationships between parameters (for example, `min <= max`).
- For the result, ask: *what can the caller rely on beyond the return type?* Any guarantee you state is a postcondition.

A useful invariant statement has three qualities. It is **precise**: no vague words like "valid" or "sensible" without definition. It is **testable**: you can write a check for it. And it is **operational**: it is strong enough that an implementation can actually rely on it.

```text
Weak:   daysLate is reasonable
Strong: daysLate is a whole number and daysLate >= 0
```

The weak form cannot be checked or relied upon; the strong form can be turned directly into tests.

## Documenting Invariants

The compiler cannot see invariants, so the only way a caller, a test author, or a future maintainer can detect them later is if they are written down where the function lives: in its documentation. We record them in the function's doc comment, alongside its purpose. For `lateFee`, the full documented function is:

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

The `Precondition:` line restricts `daysLate` to the meaningful subset of `number`, and the clause "the total fee never exceeds $10" is a postcondition on the result. Together, a function's documented preconditions and postconditions are often called its **contract**: the caller promises the preconditions, and the function promises the postconditions in return. Writing the contract down is not bureaucracy; it is what makes the invariants detectable. The doc comment is where a test author will look to decide what to check, and as we will see below, every clause of a well-written contract becomes a test.

<details class="tooltip link-110">
<summary>Invariants in BSL</summary>

You wrote invariants in CPSC 110 too; they lived in your data definitions and signatures. A signature using `Natural` instead of `Number` was a precondition (whole and non-negative): the `daysLate` precondition above is exactly `Natural`. Likewise, an interval data definition like:

```racket
; Fee is Number[0, 10]
; interp. a late fee in dollars
```

was an invariant statement: the type is Number, and the meaningful subset is 0 to 10. TypeScript's types are checked, but they cannot express intervals, so these statements move into the function's doc comment instead.

</details>

## Checking Invariants With Tests

Tests are commonly kept separate from the code they validate. In all of the code we look at in this course, in line with common best practice, production code is stored in the `src/` directory and all tests are stored in the `test/` directory. The `test/` directory can contain any number of test files, often in 1:1 correspondence with the files being tested in `src/`. Within each test file is a number of individual test cases. Each test case has a name and a body. The name describes what the test is checking; the body contains one or more assertions. The `checkExpect` call we have been using in this course is an example of an assertion. A concrete test case that ensures `letterGrade(88)` returns `"A"` looks like:

```typescript
test("letterGrade returns A for a score of 88", () => {
    checkExpect(letterGrade(88), "A");
});
```

Assertions are the core of any test case: they validate that a dynamic behaviour emits the expected output for a given input. The `checkExpect` assertion takes two arguments: an expression to evaluate, and the expected result. If the two values are equal, the test passes silently. If they differ, the framework reports what was expected and what was actually produced, pointing you to the failing test by name.

<details class="tooltip link-110">
<summary>Tests in BSL</summary>

BSL used `check-expect` as a standalone expression at the top level of a file. TypeScript's `test` wrapper is a small change in form: it names the test and groups related checks together. The underlying idea is the same: write down what you expect and let the framework compare.

```racket
(check-expect (letter-grade 88) "A")
```

</details>

<details class="tooltip ts-tips">
<summary>Running tests</summary>

`test`, `checkExpect`, and `checkError` are provided by the course toolkit; each test file imports them at the top with `import { test, checkExpect, checkError } from "@course/toolkit";`. (The toolkit's `assert`, which we meet at the end of this reading, is imported the same way by files in `src/`.) Tests in this course are run with `pnpm test` from the terminal, or using the IDE's test-running feature. The test framework executes every test case it can find in the `test/` directory. Test cases are aggregated by the files that contain them. Passing test cases are printed in green; failing test cases are printed in red, along with what was expected and what was actually returned.
</details>

## The Testing Process

So far we have treated tests as something you write for code that already exists. In practice, the order is often reversed: we write the tests _first_. Writing tests first forces you to think about the expected behaviours of the *code under test* before you spend time implementing it. Having a precise set of input/output pairs is extremely helpful when you are implementing the code. Before writing the implementation you can execute your tests to confirm they fail; once the implementation has been correctly created, the tests should pass. Confirming that a test fails first is what makes its eventual pass a meaningful signal.

For `lateFee` we are already in a position to do this. We have not written a line of the implementation, but the contract we documented above gives us everything we need: each clause from the function documentation becomes a test.

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

The precondition also tells us what we do *not* test. There is no test for `lateFee(-5)`, because the contract places that input out of bounds: a caller who passes it has broken their half of the bargain, and the function promises nothing in return. What should happen when a precondition is violated anyway is a real question, and we return to it at the end of this reading.

To run these tests, `lateFee` must at least exist; otherwise the compiler will refuse to execute the program at all. So we begin with a **stub**: a function with the right signature that returns a clearly wrong value.

```typescript
function lateFee(daysLate: number): number {
    return -1;  // stub
}
```

We chose `-1` deliberately. A fee is never negative, so every test is guaranteed to fail against the stub. (Had the stub returned `0`, the grace-period test would have passed before we wrote any real code.) Running the suite now shows three failing tests. This step matters more than it looks: a test that cannot fail checks nothing, and we have just confirmed that all of ours can.

<details class="tooltip link-110">
<summary>You have done this before</summary>

This is the same ordering as the How to Design Functions recipe from CPSC 110: signature, purpose, and stub first, then *examples*, written as `check-expect`s, before you write the function body. What CPSC 110 called examples, we now call tests. The discipline of recording expected behaviour before implementing it carries over unchanged.
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

Two tests pass, but the third fails. The failure report tells us exactly where to look: `lateFee(30)` produced `14`. Re-reading the specification reveals the problem: our implementation handles the grace period and the per-day charge, but we forgot the maximum entirely. The fix adds the missing behaviour:

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

All three tests now pass. Notice what did *not* change: the tests. They were correct all along, because they were written from the specification, and so the requirement our implementation forgot had nowhere to hide. If we had written our tests *after* the implementation, by reading our own code and checking that it does what it appears to do, would we have thought to test the maximum? Probably not: the code contains no hint that a maximum should exist. Tests written first keep the specification in charge; tests written after tend to mirror the code, mistakes included.

<details class="tooltip ts-tips">
<summary>The <code>const</code> keyword</summary>

`const` introduces a named value. Here `fee` names the result of the per-day calculation so it can be compared against the maximum and then returned. A `const` cannot be reassigned after it is defined.
</details>

<details class="tooltip deep-dive">
<summary>Tests as executable specifications</summary>

A test suite written before the implementation acts as an *executable specification*: a precise, runnable description of the intended behaviour. This is more valuable than a written description alone, because the computer can verify whether your implementation matches it, every time you run the suite.
</details>

<!--
The full process, then:

1. Read the specification and write tests that capture each promised behaviour.
2. Stub the function and run the tests, confirming that every test fails.
3. Implement the function.
4. Run the tests again. If any fail, use the failure reports to find and fix the fault.
5. Repeat until the suite passes.
-->

## Deriving Tests from the Specification

We wrote the `lateFee` suite by instinct: read the specification, turn each clause into a test. That instinct served us well, but instinct alone does not tell you when a suite is *complete enough*. Two systematic techniques, equivalence class partitioning and boundary value analysis, turn that instinct into a method.

### Equivalence Class Partitioning

The most direct way to choose test inputs is to divide the input space into **equivalence classes**: groups of inputs that the specification says should be handled the same way. You then choose at least one **representative** from each class.

The `lateFee` specification divides its input into three classes:

| Class | Inputs | Behavior |
|---|---|---|
| Grace period | 0 to 2 | fee is 0 |
| Accruing | 3 to 21 | fee grows by $0.50 per day |
| Capped | 22 and up | fee is exactly $10 |

Note where the table begins: at 0, with no negative inputs anywhere. That left edge was drawn by the documented precondition. The invariant we wrote in the doc comment defines the input space the suite must cover; without it, we would not know whether `lateFee(-5)` was a missing class or a meaningless input.

Look back at the suite we wrote: it contains a representative from each class: `lateFee(0)` and `lateFee(2)` for the grace period, `lateFee(3)` and `lateFee(12)` for accrual, `lateFee(30)` for the cap. It is no accident that this suite caught our missing-maximum fault: the suite had a representative from the capped class, and that is precisely the class the implementation forgot.

Within a class, one representative is as informative as another. `lateFee(12)` and `lateFee(15)` both exercise the accruing class; testing both adds almost no confidence beyond testing one. Counting tests is therefore a poor measure of a suite: a suite of `lateFee(5)`, `lateFee(8)`, and `lateFee(15)` has three assertions but covers only one class, and would have passed our buggy, cap-free implementation without complaint. What matters is covering the *classes*, not accumulating assertions.

<details class="tooltip deep-dive">
<summary>Classes come from the specification, not the implementation</summary>

Two inputs belong to the same class when the *specification* says they should behave the same way, not when they happen to take the same path through the code you wrote. In our buggy implementation, `lateFee(12)` and `lateFee(30)` took the same path through the code; classes derived from that implementation would have merged them, and the fault would have survived. Classes derived from the specification kept them apart, which is exactly why the fault was caught.
</details>

### Boundary Value Analysis

Equivalence class partitioning identifies the regions to test. **Boundary value analysis** identifies *where* within those regions to look most carefully: at the edges, where one class meets the next.

Bugs cluster at boundaries, because boundaries are where comparisons live, and comparisons are easy to get wrong by one. `lateFee` has two boundaries: between days 2 and 3 (grace ends, accrual begins) and between days 21 and 22 (accrual reaches the maximum). A boundary-focused test checks the last input on each side:

```typescript
test("fee changes exactly at the class boundaries", () => {
    checkExpect(lateFee(2), 0);      // last free day
    checkExpect(lateFee(3), 0.50);   // first charged day
    checkExpect(lateFee(21), 9.50);  // last accruing day
    checkExpect(lateFee(22), 10.00); // first day at the maximum
});
```

To see why these tests earn their place, consider a near-miss implementation in which the grace check was written `daysLate <= 3` instead of `daysLate <= 2`. This fault is visible at exactly one input: `lateFee(3)` returns `0` instead of `0.50`. Every other value in the entire domain, including a mid-class representative like `lateFee(12)`, behaves correctly.

Our original suite does catch this fault, but only by luck: we happened to choose the boundary value `3` as a representative of the accruing class. Had we chosen `4` and `12` instead, every test we wrote would have passed. That is the essence of boundary value analysis: off-by-one faults are often invisible everywhere except at a single input value, so those values must be in the suite by design rather than by chance.

## Expected and Unexpected Errors

Not all failures are alike. Think about a bank account: an account whose balance is negative is in a state the system should never allow, so if one is ever observed, the program itself is broken. But a customer trying to withdraw more than their balance is not unusual at all; it is a normal interaction the design must anticipate. The first is an **unexpected error**: an invariant has been violated, and no further computation on that data can be trusted. The second is an **expected error**: an unsuccessful but entirely foreseeable outcome that belongs in the function's contract. The two kinds are handled differently, and tested differently.

To see both kinds in one place, we extend the library example. The library allows each book loan to be renewed at most twice:

```typescript
type Loan = {
  title: string;
  // invariant: a whole number, 0 <= renewalsRemaining <= 2
  renewalsRemaining: number;
};
```

Trying to renew a loan that has no renewals remaining is an *expected* error: it will happen at the front desk every day, and the contract should say exactly what the caller gets. While we could encode the result as a `null` value, it is not descriptive as `null` is often an overloaded concept in many lanugages. 

Instead, we introduce a result type so we can be clear about the failure:

```typescript
type Result<T, E> =
  | { ok: true, value: T }
  | { ok: false, error: E };
```

A `Loan` whose `renewalsRemaining` is `-1`, by contrast, is an *unexpected* error: no sequence of correct operations can produce it, so if it appears, something else has already gone wrong. We can detect unexpected errors and signal them to our program using the `assert` operator. `assert` causes the program to immedeatly terminate.

```typescript
/**
 * Renews a loan, consuming one renewal.
 *
 * Precondition: loan satisfies the Loan invariant
 * Postcondition: if any renewals remain, returns a new Loan with
 * one fewer renewal remaining; otherwise returns null
 */
function renew(loan: Loan): Result<Loan, string> {
    assert(loan.renewalsRemaining >= 0, "Loan invariant violated: negative renewals");
    assert(loan.renewalsRemaining <= 2, "Loan invariant violated: too many renewals");

    if (loan.renewalsRemaining === 0) {
        // expected: running out of renewals is a normal outcome
        return { ok: false, "No further loan renewals available" }
    }
    return {
        ok: true, 
        value: {
        title: loan.title,
        renewalsRemaining: loan.renewalsRemaining - 1
    };
}
```

The two `assert` calls at the top are **assertions**: checks placed inside the implementation that halt the program immediately, with an error, if their condition is false. `assert` takes the condition to check and a message to report when the check fails. Note where it lives: unlike `checkExpect`, which sits in `test/` and probes chosen inputs from the outside, `assert` sits in `src/` and is evaluated on *every* execution of the function, whoever the caller is. Halting may seem drastic, but it is the right response to an impossible state. We saw at the start of this reading that operations built on a value whose invariant has failed quietly produce nonsense; an assertion stops the program at the first sign of corruption, before the nonsense can spread or be written somewhere permanent. This is also the answer to the question we deferred earlier: when a caller violates a precondition, an assertion is how the function refuses to continue.

Now the tests, and a distinction worth being careful about. The expected error is a *documented outcome*: the postcondition names the exact value the caller receives (`null`), so we test it with `checkExpect`, the same way we test every other clause of the contract:

```typescript
test("renewal succeeds while renewals remain", () => {
    const fresh: Loan = { title: "Clean Code", renewalsRemaining: 2 };
    checkExpect(renew(fresh), {ok: true, value: { title: "Clean Code", renewalsRemaining: 1 }});
});

test("renewal is refused when no renewals remain", () => {
    const exhausted: Loan = { title: "Clean Code", renewalsRemaining: 0 };
    checkExpect(renew(exhausted), {ok: false, error: "No further loan renewals available" });
});
```

The unexpected error has no value to compare against, because the correct behaviour is to not produce a value at all. For this we use `checkError`, which runs the function it is given and passes only if an error occurs; if the call completes normally, the test *fails*:

```typescript
test("renew halts on a loan that violates non-negative invariant", () => {
    const corrupted: Loan = { title: "Clean Code", renewalsRemaining: -1 };
    checkError(renew(corrupted), "Loan invariant violated: negative renewals");
});
```

Expected errors should be tested analagously to how a user would interact with a function, which means we should use `checkExpect`: a refused renewal is not a malfunction but a specified result, and the contract tells you exactly what value to expect. Unexpected errors though are almost always the result of programming errors, which means validating them with `checkError` is more appropriate, since you're ensuring the program is refusing to process erroneous requests. As a rule of thumb, if the specification describes the outcome, check the outcome; if the outcome should be impossible, check that the program halts.

<details class="tooltip deep-dive">
<summary>Richer expected errors</summary>

Returning `null` says only that the operation did not succeed; it cannot say why. When a function has several distinct failure reasons that callers need to tell apart, the same tagged-union idea from the previous reading applies to results: return `{ kind: "renewed", loan: ... } | { kind: "refused", reason: ... }`, and the type checker will force callers to branch on the outcome. Languages also provide a separate mechanism, exceptions, for signalling errors across many levels of a program at once; we look at it later in the course.
</details>

## Testing and Types Together

The type checker and the test suite operate at different times: the type checker works statically on the source code, ruling out whole categories of invalid calls before the program runs. Tests work dynamically, verifying specific behaviours by actually executing the function. They are complementary approaches: a program that passes every type check can still return the wrong value for a given input. A program that passes all its tests may still fail on an input the test suite did not evaluate. The combination is what gives confidence: types narrow the space of programs that can even be written, and tests verify that the program you wrote does what you intended.

Documented invariants are the bridge between the two. The preconditions and postconditions in a function's doc comment record exactly the part of the specification the compiler cannot see, and they are exactly what the tests exist to check. Assertions add a third layer of protection: where types check structure before the program runs and tests probe chosen inputs from the outside, assertions watch the invariants from inside the implementation, on every execution. A contract that is written down can be turned into a suite and into assertions; an invariant that lives only in someone's head cannot be checked by anything.
