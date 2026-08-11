# Checking Invariants

In Chapter 1 we introduced the distinction between the _static_ and _dynamic_ views of a program. The compiler checks the static view: it reads your source code, analyses your types, and flags inconsistencies before the program runs. But a program that passes the type checker can still produce the wrong results. Types tell you what _kind_ of value a function returns; they do not tell you whether that value is _correct_.

The properties a correct program must maintain beyond its types are called **invariants**. This chapter is about working with them: what an invariant is, how to identify the invariants in a problem, how to record them in a function's documentation so they can be detected later, and how to test whether the invariant holds.

In this course we will mainly focus on what are known as **unit tests**, as they test individual units of a program, usually at the function level.

## What Is an Invariant?

An **invariant** is a property that must hold for a value or a computation to be meaningful. Typically, and in this class, invariants focus on properties that the type system cannot express or enforce. 

We have already met an invariant. In the previous chapter, the `Song` type carried this comment:

```typescript
type Song = {
  title: string;
  artist: string;
  durationSeconds: number; // must be positive
};
```

The comment is hinting at work the type cannot do: `number` includes `-30`, but real songs cannot have negative durations. Precisely, the invariant is: `durationSeconds` must be positive. Note that the type checker will accept an object even though it violates this invariant:

```typescript
// passes the type checker; violates the invariant
const broken: Song = {
  title: "Song A",
  artist: "Artist 1",
  durationSeconds: -30
};
```

This object has the right _shape_, so the static type check passes. But its _meaning_ is wrong, i.e. it violates the invariant. In this case, any code that trusts the invariant can behave incorrectly. Imagine a function summing the durations in a playlist: a negative duration would decrease a value one would expect to be monotonically increasing. When an invariant fails, a value can no longer be trusted by the operations built on it, even though the code may type check.

Invariants are everywhere once you look for them: durations are positive, percentage scores sit between 0 and 100, counts are whole numbers. None of these facts appear in the types `number`, `number`, `number`. They are constraints that exist in the space between what the type allows and what the problem requires.

<details class="tooltip deep-dive">
<summary>Course Preview: Could We Statically Check Invariants?</summary>
In the previous chapters, we saw how types allowed us to bring enforcement that in CPSC 110 we had to trust. In CPSC 210, invariants capture what we cannot check solely through types---unfortunately, those won't be statically enforceable. This is where we bring in dynamic checking of invariants, through testing.

But some of the invariants we have aren't too complicated: if we can enforce that `x` is a `number` statically, why can we not enforce that `x > 10` statically? We won't cover that in CPSC 210, but if this question is interesting to you, you may be interesting in learning more about the fields of _formal verification_ (CPSC 513, 539S) and _programming languages_ (CPSC 311, 411, 509, 511) in the future.
</details>

## Identifying Invariants

At the function level, invariants attach in two places: to a function's inputs and to its output. For the rest of this chapter we will work with a single running example:

> As the campus library, I want late fees computed from how many days late a book is returned, with a short grace period and a capped maximum, so that patrons are charged fairly and predictably.

Concretely, the library's late-fee policy is: a book returned up to 2 days late incurs no fee; after that grace period, the fee is $0.50 for each additional day; and the total fee never exceeds $10. 

A function computing the fee will have this signature:

```typescript
lateFee(daysLate: number): number
```

A **precondition** is an invariant that must be true of the arguments when the function is called. The parameter type admits any number: `-4`, `3.7`, `40000`. But `daysLate` is a count of days, so the function is only meaningful when `daysLate` is a whole number and at least 0. That restriction is the **precondition** on `daysLate`.

A **postcondition** is an invariant about what the function guarantees about its result, _assuming the precondition held_. The return type says only `number`, but the policy promises more: the fee is never negative, and it never exceeds $10. Each of those guarantees is a **postcondition**.

To identify these in your own functions, you need to examine the _gap_ between the _type_ you have included in a signature and the type's _meaning_:

- Identifying **preconditions**: For each parameter, ask: _of all the values this type allows, which are meaningful?_ Any restriction you state is a precondition. Look for ranges, wholeness, non-empty strings, and relationships between parameters (for example, `min <= max`).
- Identifying **postconditions**: For the result, ask: _what can the caller rely on beyond the return type?_ Any guarantee you state is a postcondition.

A useful invariant statement has three qualities. It is _precise_: terms must be backed by definitions; words like "valid" or "sensible" without qualification are not valuable. It is _testable_: you can programmatically validate whether the invariant is true. And it is _operational_: it is strong enough that an implementation can rely on it.

For example, consider the invariant stated as: `daysLate is reasonable`. This is not precise, testable, or operational: it cannot be checked or relied upon.

In contrast, the invariant `daysLate is a whole number and daysLate >= 0` can be turned directly into tests. 


## Documenting Invariants

Unlike types, which the compiler's type-checker checks, the compiler does not know about, nor check the invariants that restrict the values in your code.  The only way a caller, a test author, or a future maintainer can detect invariants later is if they are _written down where the function lives_. That is, in its documentation. 

We record invariants in the function's **doc comment**, alongside its purpose. Doc comments precede function declarations, and are formatted within `/** <text comments> */`. Details relevant to the `@param` elements passed to a function and the `@return` value are also included. For `lateFee`, the full documented function is:

```typescript
/**
 * Computes the fee (in dollars) for a library book returned
 * daysLate days after its due date.
 *
 * The first 2 days are a grace period: no fee is charged.
 * After the grace period, the fee is $0.50 for each additional
 * day. The total fee never exceeds $10.
 *
 * Precondition: daysLate is a whole number and daysLate >= 0.
 *
 * @param {number} daysLate the number of days past the due date
 * @returns {number} the fee in dollars, between 0 and 10
 */
function lateFee(daysLate: number): number
```

<details class="tooltip ts-tips">
<summary>Function Doc Comments</summary>

In TypeScript, `//` comments out the rest of a line. Anything between `/_` and `_/` is also a comment, and these comments can span multiple lines.

For function doc comments in this course, we'll use syntax that's consistent with [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html):
```typescript
/**
 * Here you put a summary of the function foo
 *
 * Precondition: list any preconditions
 * Postcondition: list any precondition
 * 
 * @param {typeofParam1} param1Name a description of param1Name's purpose
 * @param {typeofParam2} param2Name a description of param2Name's purpose
 * @returns {typeofReturn} describe what the return value expresses
 */
 function foo(param1Name: typeofParam1, param2Name: typeofParam2): typeofReturn
```
</details>

The `Precondition:` line restricts `daysLate` to the meaningful subset of `number`, and the clause "the total fee never exceeds $10" is a postcondition on the result. 

Together, a function's documented preconditions and postconditions are often called its **contract**: the caller promises the preconditions, and the function promises the postconditions in return. Writing the contract down is not bureaucracy; it is what makes the invariants detectable. The doc comment is where a test author will look to decide what to check, and as we will see below, every clause of a well-written contract becomes a test.

<details class="tooltip link-110">
<summary>Invariants</summary>

You wrote invariants in CPSC 110 too; they lived in your data definitions and signatures. A signature using `Natural` instead of `Number` was a precondition (whole and non-negative): the `daysLate` precondition above is exactly `Natural`. Likewise, an interval data definition like:

```racket
; Fee is Number[0, 10]
; interp. a late fee in dollars
```

was an invariant statement: the type is Number, and the meaningful subset is 0 to 10. TypeScript's types are checked, but they cannot express intervals, so these statements move into the function's doc comment instead.

</details>

## Checking Invariants With Tests

Tests are commonly kept separate from the code they validate. In all of the code we look at in this course, in line with common best practice, production code is stored in the `src/` directory and all tests are stored in the `test/` directory. The `test/` directory can contain any number of test files, often in 1:1 correspondence with the files being tested in `src/`. 

Within each test file is a number of individual test cases. Each test case has a name and a body. The name describes what the test is checking; the body is a single **assertion**. The `checkExpect` call we have been using in this course is an example of an **assertion**. 

In the contract above, the late fee grace period is two days long. A concrete test case that checks this, by ensuring that `lateFee(2)` returns `0`, looks like:

```typescript
test("no fee at the grace boundary", checkExpect(() => lateFee(2), 0));
```

Assertions are the core of any test case: they validate that a dynamic behaviour emits the expected output for a given input. The `checkExpect` assertion takes two arguments: a no-argument function wrapping the expression to evaluate, and the expected result. If the two values are equal, the test passes silently. If they differ, the framework reports what was expected and what was produced, pointing you to the failing test by name.

Each test case holds exactly one check. This keeps the name of the case an accurate description of the one behaviour it validates, and it means a failing suite tells you how many distinct expectations are broken rather than stopping at the first one inside a case.

<details class="tooltip link-110">
<summary>Tests vs <code>check-expect</code></summary>

ISL used `check-expect` as a standalone expression at the top level of a file. TypeScript's `test` wrapper is a small change in form: it names the check so the framework can report it. The underlying idea is the same: write down what you expect and let the framework compare.

```racket
(check-expect (late-fee 2) 0)
```

</details>

<details class="tooltip ts-tips">
<summary>Running Tests</summary>

`test`, `checkExpect`, and `checkError` are provided by the course toolkit; each test file imports them at the top of the file with: 
```typescript
import {
    test,
    checkExpect,
    checkError
} from "@ubccpsc/210-toolkit/testing";
```

To run the tests, you can either open the testing feature within your IDE (we will demo this in class), or open the terminal view within your IDE (also an in-class demo) and execute `pnpm test`. The **terminal** is a text-based interface where you type commands to direct your computer to perform tasks for you, where the input and output are textual. 

When executed by either your IDE or your terminal command, the test framework executes every test case it can find in the `test/` directory. Passing test cases are printed in green; failing test cases are printed in red, along with what was expected and what was returned.
</details>

## The Testing Process

So far we have treated tests as something you write for code that already exists. When you are learning, it is strongly recommended that you write the tests _first_. Writing tests first forces you to think about the expected behaviours of the **code under test**, that is the code your test case is validating, before you spend time implementing it. 

Having a precise set of input/output pairs is extremely helpful when you are implementing the code. Before writing the implementation you can execute your tests to confirm they fail; once the implementation has been correctly created, the tests should pass. Confirming that a test fails first is what makes its eventual pass a meaningful signal. A test that passes even when you haven't implemented the function is meaningless. 

For `lateFee` we are already in a position to do this. We have not written a line of the implementation, but the contract we documented above gives us everything we need: each clause from the function documentation becomes a test.

```typescript
test("no fee on the day a book comes due",
    checkExpect(() => lateFee(0), 0)
);

test("no fee at the end of the grace period",
    checkExpect(() => lateFee(2), 0)
);

test("fee accrues on the first charged day",
    checkExpect(() => lateFee(3), 0.50)
);

test("fee accrues for each further day",
    checkExpect(() => lateFee(12), 5.00)
);

test("fee never exceeds the maximum",
    checkExpect(() => lateFee(30), 10.00)
);
```

The precondition also guides us towards situations that may not result in a valid output. Since the precondition says `daysLate >= 0`, what happens if we pass `-5` is undefined: the caller has broken their half of the bargain, and the function promises nothing in return. We'll return to what should happen when a precondition is violated anyway, and how to test for such erroneous behaviours, at the end of this chapter.

To run these tests, `lateFee` must at least exist; otherwise the compiler will refuse to execute the program at all. So we begin with a **stub**: a function with the right signature that returns a clearly wrong value.

```typescript
function lateFee(daysLate: number): number {
    return -1;  // stub
}
```

We chose `-1` deliberately. A fee is never negative, so every test is guaranteed to fail against the stub. (Had the stub returned `0`, the grace-period tests would have passed before we wrote any real code.) Running the suite now shows five failing tests. This step is important: a test that cannot fail checks nothing, and we have just confirmed that all of ours can fail when they are expected to. Running these tests results in:

```
✗ no fee on the day a book comes due
      Expected: 0
      Received: -1
✗ no fee at the end of the grace period
      Expected: 0
      Received: -1
✗ fee accrues on the first charged day
      Expected: 0.5
      Received: -1
✗ fee accrues for each further day
      Expected: 5
      Received: -1
✗ fee never exceeds the maximum
      Expected: 10
      Received: -1
```

<details class="tooltip link-110">
<summary>HtDF is Test-Driven Development</summary>

This is the same ordering as the How to Design Functions recipe from CPSC 110: signature, purpose, and stub first, then _examples_, written as `check-expect`s, before you write the function body. What CPSC 110 called examples, we now call tests. The discipline of recording expected behaviour before implementing it carries over unchanged.
</details>

Now we implement the function. The precondition and postconditions give us an idea of which conditions to put in our `if` statement.  

```typescript
function lateFee(daysLate: number): number {
    if (daysLate <= 2) {
        return 0;
    }
    return 0.5 * (daysLate - 2);
}
```
And if we run the tests again:
```
✓ no fee on the day a book comes due
✓ no fee at the end of the grace period
✓ fee accrues on the first charged day
✓ fee accrues for each further day
✗ fee never exceeds the maximum
      Expected: 10
      Received: 14
```


Four tests pass, but the last fails. The failure report tells us exactly where to look: `lateFee(30)` produced `14`. Re-reading the specification reveals the problem: our implementation handles the grace period and the per-day charge, but we forgot the maximum entirely. The fix adds the missing behaviour:

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
<details class="tooltip exercise">
<summary>Where's <code>else</code>?</summary>

`lateFee` is written with no `else` cases, but this is not the only way to write the function. Rewrite `lateFee` such that all statements are nested within an `if` or `else`. You'll need more than one statement in some of the blocks.
</details>

All five tests now pass:
```
✓ no fee on the day a book comes due
✓ no fee at the end of the grace period
✓ fee accrues on the first charged day
✓ fee accrues for each further day
✓ fee never exceeds the maximum
```

Notice what did _not_ change: the tests. They were correct all along, because they were written from the specification, and so the requirement our implementation forgot had nowhere to hide. If we had written our tests _after_ the implementation, by reading our own code and checking that it does what it appears to do, we would probably not have thought to test the maximum: the first prototype of `lateFee` contained  no hint that a maximum should exist. Tests written first keep the specification in charge; tests written after tend to mirror the code, mistakes included.


<details class="tooltip ts-tips">
<summary>Recall: <code>const</code> </summary>

`const` introduces a named value. Here `fee` names the result of the per-day calculation so it can be compared against the maximum and then returned. A `const` cannot be reassigned after it is defined.
</details>

<details class="tooltip deep-dive">
<summary>Tests as Executable Specifications</summary>

A test suite written before the implementation acts as an _executable specification_: a precise, runnable description of the intended behaviour. This is more valuable than a written description alone, because the computer can verify whether your implementation matches it, every time you run the suite.
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

We wrote the `lateFee` suite by instinct: read the specification, turn each clause into a test. That instinct served us well, but instinct alone does not tell you when a suite is _complete enough_. Two systematic techniques, **equivalence class partitioning** and **boundary value analysis**, turn that instinct into a method.

### Equivalence Class Partitioning

The most direct way to choose test inputs is to divide the input space into **equivalence classes**: groups of inputs that the specification says should be handled the same way. You then choose at least one **representative**  from each class.

The `lateFee` specification divides its input into three classes:

| Class | Inputs | Behaviour |
|---|---|---|
| Grace period | 0 to 2 | Fee is 0 |
| Accruing | 3 to 21 | Fee grows by $0.50 per day |
| Capped | 22 and up | Fee is exactly $10 |

Note where the table begins: at 0, with no negative inputs anywhere. We got starting at 0 directly from `daysLate >= 0` in the precondition. The invariant we wrote in the doc comment defines the input space the suite must cover; without it, we would not know whether `lateFee(-5)` was a missing class or a meaningless input.

Look back at the suite we wrote: it contains a representative from each class: `lateFee(0)` and `lateFee(2)` for the grace period, `lateFee(3)` and `lateFee(12)` for accrual, `lateFee(30)` for the cap. This suite caught our missing-maximum fault because it had a representative from the capped class, and that is precisely the class the implementation forgot.

Within a class, one representative is as informative as another. `lateFee(12)` and `lateFee(15)` both exercise the accruing class; testing both adds almost no confidence beyond testing one. Counting tests is therefore a poor measure of a suite: a suite of `lateFee(5)`, `lateFee(8)`, and `lateFee(15)` has three checks but covers only one class, and would have passed our buggy, cap-free implementation without complaint. What matters is covering the _classes_, not accumulating checks.

<details class="tooltip deep-dive">
<summary>Equivalence Classes are Only Derived From the Specification</summary>

In Chapter 1, we defined a **branch** as the side of an if-statement that was taken when executed on an input. A **path** is the sequence of branches that are taken when a program executes on a given input. 

Two inputs belong to the same class when the _specification_ says they should behave the same way, not when they happen to take the same path through the code you wrote. In our buggy implementation, `lateFee(12)` and `lateFee(30)` took the same path through the code; classes derived from that implementation would have merged them, and the fault would have survived. Classes derived from the specification kept them apart, which is exactly why the fault was caught.
</details>

### Boundary Value Analysis

Equivalence class partitioning identifies the regions to test. **Boundary value analysis** identifies _where_ within those regions to look most carefully: at the edges, where one class meets the next.

Bugs cluster at boundaries, because boundaries are implemented with comparisons, and comparisons are easy to get wrong by one. `lateFee` has two boundaries: between days 2 and 3 (grace ends, accrual begins) and between days 21 and 22 (accrual reaches the maximum). A boundary-focused suite checks the last input on each side:

```typescript
test("last free day", checkExpect(() => lateFee(2), 0));
test("first charged day", checkExpect(() => lateFee(3), 0.50));
test("last accruing day", checkExpect(() => lateFee(21), 9.50));
test("first day at the maximum", checkExpect(() => lateFee(22), 10.00));
```

Consider a near-miss implementation in which the grace check was written `daysLate <= 3` instead of `daysLate <= 2`. 
```typescript
// Near-miss implementation example
function lateFee(daysLate: number): number {
    if (daysLate <= 3) { // bug here
        return 0;
    }
    const fee = 0.5 * (daysLate - 2);
    if (fee > 10) {
        return 10;
    }
    return fee;
}
```

This fault is visible at exactly one input: `lateFee(3)` returns `0` instead of `0.50`. Every other value in the entire domain, including a mid-class representative like `lateFee(12)`, behaves correctly. 

Our original suite does catch this fault, but only by luck: we happened to choose the boundary value `3` as a representative of the accruing class. Had we chosen `4` and `12` instead, every test we wrote would have passed. 

This example is the essence of boundary value analysis: off-by-one faults are often invisible everywhere except at a single input value, so those values must be in the suite by design rather than by chance.

The whole input space, drawn as a line: three equivalence classes, separated by the two boundaries the suite must pin down.

```svgbob
grace       accruing ( $0.50 / day )             capped ( $10 )
*-----------*------------------------------------*------------------->
0 days      2 days                               22 days      overdue
            :                                    :
            :                                    :            
            boundary                             boundary
            ( 2 -> 3 )                           ( 21 -> 22 )
```
<!-- caption="Figure 03.01: The three equivalence classes for daysLate." -->

## Expected and Unexpected Errors

Not all failures are alike. Think about a bank account: an account whose balance is negative is in a state the system should never allow, so if one is ever observed, the program itself is broken. But a customer trying to withdraw more than their balance is not unusual at all; it is a normal interaction the design must anticipate. 

The first is an **unexpected error**: an invariant has been violated, and no further computation on that data can be trusted. The second is an **expected error**: an unsuccessful but entirely foreseeable outcome that belongs in the function's contract. The two kinds are handled differently, and tested differently.

To see both kinds in one place, we extend the library example. The library allows each book loan to be renewed at most twice:

```typescript
type Loan = {
  title: string;
  // invariant: a whole number, 0 <= renewalsRemaining <= 2
  renewalsRemaining: number;
};
```

Trying to renew a loan that has no renewals remaining is an _expected_ error: it will happen at the front desk every day, and the contract should say exactly what the caller gets. 

How do we encode an expected error? We could encode the result as a `null` value: but `null` is not descriptive, and `null` is an overloaded concept in many languages. We could also model this expected error by returning `-1` (since that would never be a valid `lateFee` value anyways). But, this would open clients to simple unexpected math errors summing `lateFee` calls, if they were not careful and did not check if the return value is `-1` in their code. 

So that we can be clear about the failure, and rely on the typechecker to check whether errors are correctly handled, we introduce a _result type_:

```typescript
type Result<T, E> =
  | { ok: true, value: T }
  | { ok: false, error: E };
```

`Result` is generic over two type parameters: `T` is the type of a successful value, and `E` is the type of the error. This is the same tagged-union idea from the previous chapter, with `ok` as the discriminator: a caller checks `ok` to learn whether it received a `value` or an `error`. We will express _expected_ errors with an error result type.

By contrast: a `Loan` whose `renewalsRemaining` is `-1`, is an _unexpected_ error. No sequence of correct operations can produce it, so if `renewalsRemaining` is `-1`, something else has already gone wrong. 

We detect unexpected errors and signal them to our program using the `assert` function. These calls look like `assert(<condition>, <description>)`. When an **assert** fails, the program is immediately terminated with the provided description. 

<details class="tooltip ts-tips">
<summary><code>assert</code></summary>

Calling the `assert` function:
```typescript
assert(<condition>, <description>)
```
evaluates `<condition>`. If `<condition>` is true, the program continues to execute as if `assert` was not there. If `<condition>` is false, the program will terminate and print out `<description>`.

A tricky thing about asserts: the `<condition>` describes what _should hold_, while `<description>`, which is only printed out when `<condition>` fails, usually describes what _did not_ hold. 

`assert` is not part of the TypeScript language itself. In this course we use the standard `assert` function provided by the Node runtime:

```typescript
import assert from "node:assert/strict";
```

Many TypeScript/JavaScript frameworks provide their own `assert`-like functions as well, and any of them serves the same role. By the end of Part 2, you'll know how to implement `assert` yourself, so you'll be able to use this concept in whatever code you write. 
</details>

The presence of assertions in the implementation like this can make the code much easier to write and debug, because your implementation can trust that the invariants are valid for the remainder of the function. This helps reduce defensive checks you might otherwise need to make in your code. `assert` also communicates to other developers that these are checks for valid input, rather than checks part of the core program logic. 

```typescript
/**
 * Renews a loan, consuming one renewal.
 *
 * Precondition: loan satisfies the Loan invariant.
 * Postcondition: if any renewals remain, returns ok: true with a new
 * Loan with one fewer renewal remaining; otherwise returns ok: false
 * with an explanatory error.
 *
 * @param {Loan} loan the loan to renew
 * @returns {Result<Loan, string>} the renewed Loan on success, or an
 * error explaining why the loan could not be renewed
 */
function renew(loan: Loan): Result<Loan, string> {
    assert(loan.renewalsRemaining >= 0, "Loan invariant violated: negative renewals");
    assert(loan.renewalsRemaining <= 2, "Loan invariant violated: too many renewals");

    if (loan.renewalsRemaining === 0) {
        // expected: running out of renewals is a normal outcome
        return { ok: false, error: "No further loan renewals available" };
    }
    return {
        ok: true,
        value: {
            title: loan.title,
            renewalsRemaining: loan.renewalsRemaining - 1
        }
    };
}
```

Note where the `assert` calls live: unlike `checkExpect`, which sits in `test/` and probes chosen inputs from the outside, `assert` sits in the source code in `src/` and is evaluated on _every_ execution of the function, whoever the caller is. Halting may seem drastic, but it is the right response to an impossible state.

At the start of this chapter, we saw that operations built on a value whose invariant has failed quietly produce nonsense. For instance, `lateFee(5.5)` returns a value, even though late fees are only defined as whole numbers.  An assertion _stops_ the program at the _first sign of corruption_, before the nonsense can spread or be written somewhere permanent. This is the behaviour we deferred earlier in the chapter: when a caller _violates_ a precondition, an `assert` is how the function _refuses to continue_. 

<details class="tooltip deep-dive">
<summary>Failing with User-Specified Inputs: Give More Detail</summary>

One relaxation to the `assert` approach is for functions that take _user-specified input_. Rather than crashing, user-specified input is often explicitly validated and rejected as expected errors (because in practice, it is useful to expect users to do unreasonable things). 

For example, when you pass an TypeScript program with invalid syntax to `tsc`, it tells you where an error is, rather than raising an error that says only `SyntaxError`.  
</details>

To write tests for errors, we must be clear about the difference between unexpected and expected errors. The expected error is a _documented outcome_: the postcondition names the exact value the caller receives (an `ok: false` result carrying the reason), so we test it with `checkExpect`, the same way we test every other clause of the contract:

```typescript
const fresh: Loan = { title: "Clean Code", renewalsRemaining: 2 };
const exhausted: Loan = { title: "Clean Code", renewalsRemaining: 0 };

test("renewal succeeds while renewals remain",
    checkExpect(() => renew(fresh), {
        ok: true,
        value: { title: "Clean Code", renewalsRemaining: 1 }
    })
);

test("renewal is refused when no renewals remain",
    checkExpect(() => renew(exhausted), {
        ok: false,
        error: "No further loan renewals available"
    })
);
```

The values each check needs are named above the tests rather than inside them, because the body of a test case is a single check.

The unexpected error has no value to compare against, because the correct behaviour is to not produce a value at all. For this we use `checkError`, which runs the function it is given and passes only if an error occurs; if the call completes normally, the test _fails_:

```typescript
const corrupted: Loan = { title: "Clean Code", renewalsRemaining: -1 };

test("renew halts on a loan that violates the non-negative invariant",
    checkError(() => renew(corrupted))
);
```

<details class="tooltip ts-tips">
<summary><code>checkError</code></summary>

In 
```typescript
checkError(() => <expression>);
```
the `() => <expression>` is an _anonymous function_, the same thunk `checkExpect` uses around the expression under test, written as a single expression with no braces so its value is returned implicitly. `checkError` executes that function and checks whether an error occurs during execution. If one does, `checkError` passes; if the call completes normally, `checkError` fails. The usual form is:
```typescript
checkError(() => functionUnderTest(arg1, arg2));
```

For example, in the above, 
```typescript
checkError(() => renew(corrupted));
```
`checkError` calls `renew(corrupted)` and checks whether an error occurs. Note that it checks only _that_ an error occurred, not which one: in this course a `checkError` states that the call must fail, and the test's description records why.

The wrapper is what makes this work. Were the call written directly as an argument, as in `checkError(renew(corrupted))`, `renew(corrupted)` would execute, and fail, while the arguments were being evaluated, before `checkError` was ever called, halting the entire execution of the test suite. Delaying the call until the check decides to run it is why both `checkExpect` and `checkError` take a function rather than a value.
</details>
<details class="tooltip link-110">
<summary>Higher-Order Functions</summary>

`checkExpect` and `checkError` are higher-order functions, so called because they take a function as an argument. You've seen this before, notably in `map`, `filter`, and `fold`.
</details>

In short:

**Expected errors** should be tested analogously to how a user would interact with a function, which means we should use `checkExpect`: a refused renewal is not a malfunction but a specified result, and the contract tells you exactly what value to expect. 

**Unexpected errors** though are almost always the result of programming errors, which means validating them with `checkError` is more appropriate, since you're ensuring the program is refusing to process erroneous requests. 

As a rule of thumb, if the specification describes the outcome, check the outcome; if the outcome should be impossible, check that the program halts.


## Triangulating Quality: Type Checking, Testing, and Assertions

Types give us structure, but tests give us confidence. The type checker and the test suite operate at different times. The type checker works _statically_ on the source code, ruling out whole categories of invalid calls before the program runs. Tests work _dynamically_, verifying specific behaviours by executing the function. They are complementary approaches: a program that passes every type check can still return the wrong value for a given input. But, a program that passes all its tests may still fail on an input the test suite did not evaluate. The combination is what gives confidence: types narrow the space of programs that can even be written, and tests verify that the program you wrote does what you intended.

Documented invariants are the bridge between the two. The preconditions and postconditions in a function's doc comment record exactly the part of the specification the compiler cannot see, and they are exactly what the tests should check. Assertions add a third layer of protection: where types check structure before the program runs and tests probe chosen inputs from the outside, assertions watch the invariants from inside the implementation, on every execution. 

An invariant that is written down can be turned into a test suite and into assertions; an invariant that lives only in someone's head cannot be checked by anything.



<details class="tooltip exercise">
  <summary>Exercise: Parking Fees</summary>

Practise this chapter's concepts on a new problem: write a contract, derive tests from it, and implement against them.

> As a parking garage, I want to compute the parking fee by counting how many whole hours a car is parked, with a free first hour and a daily maximum, so that drivers are charged fairly and predictably.

The policy states that parking is free for the first hour; after that, each additional hour costs $4; and the total never exceeds $24. The function will have the signature <span class="hint">`parkingFee(hours: number): number`</span>.

1. Write the contract. Document `parkingFee` with a doc comment giving its purpose, a precondition (<span class="hint">`hours` is a whole number and `hours >= 0`</span>), a postcondition (<span class="hint">the fee is between 0 and 24</span>), and `@param`/`@returns` lines.
2. Derive the tests first. Use equivalence class partitioning to find the input classes the policy treats alike, and pick one representative of each. Then use boundary value analysis to add the edges: where the free hour ends, and where the cap is reached.
3. Stub `parkingFee` so it returns a clearly wrong value, run your tests, and confirm they all fail.
4. Implement `parkingFee`, run the tests again, and confirm they pass.
5. Guard the precondition. Decide what should happen when the precondition is violated, for example <span class="hint">`parkingFee(-1)`</span>. Add an `assert` for it, and write a `checkError` test that confirms the violation is caught.

</details>
