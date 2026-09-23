# Checking Invariants

In [Chapter 1](./01_new-language) we introduced the distinction between the _static_ and _dynamic_ views of a program. The compiler checks the static view: it reads your source code, analyses your types, and flags inconsistencies before the program runs. But a program that passes the type checker can still produce the wrong results. Types tell you what _kind_ of value a function returns, but not whether that value is _correct_.

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
The previous chapters showed how types enforce what CPSC 110 could only trust. Invariants capture what types alone cannot check, and in this course they cannot be enforced statically. Instead, we check them dynamically, through testing.

But some of the invariants we have aren't too complicated: if we can enforce that `x` is a `number` statically, why can we not enforce that `x > 10` statically? We won't cover that in CPSC 210, but if this question is interesting to you, you may be interested in learning more about the fields of _formal verification_ (CPSC 513, 539S) and _programming languages_ (CPSC 311, 411, 509, 511) in the future.
</details>

## Identifying Invariants

At the function level, invariants attach in two places: to a function's inputs and to its output. For the rest of this chapter we will work with a single running example:

> As the campus library, I want late fees computed from how many days late a book is returned, with a short grace period and a capped maximum, so that patrons are charged fairly and predictably.

Concretely, the library's late-fee policy is that a book returned up to 2 days late incurs no fee. After that grace period, the fee is $0.50 for each additional day, and the total fee never exceeds $10.

A function computing the fee will have this signature:

```typescript
lateFee(daysLate: number): number
```

A **precondition** is an invariant that must be true of the arguments when the function is called. The parameter type admits any number: `-4`, `3.7`, `40000`. But `daysLate` is a count of days, so the function is only meaningful when `daysLate` is a whole number and at least 0. That restriction is the **precondition** on `daysLate`.

A **postcondition** is an invariant about what the function guarantees about its result, _assuming the precondition held_. The return type says only `number`, but the policy promises more: the fee is never negative, and it never exceeds $10. Each of those guarantees is a **postcondition**.

To identify these in your own functions, you need to examine the _gap_ between the _type_ you have included in a signature and the type's _meaning_:

- Identifying **preconditions**: For each parameter, ask: _of all the values this type allows, which are meaningful?_ Any restriction you state is a precondition. Look for ranges, wholeness, non-empty strings, and relationships between parameters (for example, `min <= max`).
- Identifying **postconditions**: For the result, ask: _what can the caller rely on beyond the return type?_ Any guarantee you state is a postcondition.

A useful invariant statement has three qualities. It is _precise_: terms must be backed by definitions, and words like "valid" or "sensible" without qualification are not useful. It is _testable_: you can programmatically validate whether the invariant is true. And it is _operational_: it is strong enough that an implementation can rely on it.

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
 * Postcondition: list any postconditions
 * 
 * @param {typeofParam1} param1Name a description of param1Name's purpose
 * @param {typeofParam2} param2Name a description of param2Name's purpose
 * @returns {typeofReturn} describe what the return value expresses
 */
 function foo(param1Name: typeofParam1, param2Name: typeofParam2): typeofReturn
```
</details>

The `Precondition:` line restricts `daysLate` to the meaningful subset of `number`, and the clause "the total fee never exceeds $10" is a postcondition on the result.

Together, a function's documented preconditions and postconditions are often called its **contract**: the caller promises the preconditions, and the function promises the postconditions in return. Writing the contract down is what makes the invariants detectable. The doc comment is where a test author will look to decide what to check, and as we will see below, every clause of a well-written contract becomes a test.

<details class="tooltip link-110">
<summary>Invariants</summary>

You wrote invariants in CPSC 110 too, in your data definitions and signatures. A signature using `Natural` instead of `Number` was a precondition (whole and non-negative): the `daysLate` precondition above is exactly `Natural`. Likewise, an interval data definition like:

```racket
; Fee is Number[0, 10]
; interp. a late fee in dollars
```

was an invariant statement: the type is Number, and the meaningful subset is 0 to 10. TypeScript's types are checked, but they cannot express intervals, so these statements move into the function's doc comment instead.

</details>

## Testing Invariants

Tests are commonly kept separate from the code they validate. In all of the code we look at in this course, in line with common best practice, production code is stored in the `src/` directory and all tests are stored in the `test/` directory. The `test/` directory can contain any number of test files, often in 1:1 correspondence with the files being tested in `src/`.

Within each test file is a number of individual test cases. Each test case has a name and a body. The name describes what the test is checking, and the body is a single **assertion**. The `checkExpect` call we have been using in this course is an example of an **assertion**.

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

`test` and `checkExpect` are provided by the course toolkit, and each test file imports them at the top of the file with:
```typescript
import {
    test,
    checkExpect
} from "@ubccpsc/210-toolkit/testing";
```

To run the tests, you can either open the testing feature within your IDE (we will demo this in class), or open the terminal view within your IDE (also an in-class demo) and execute `pnpm test`. The **terminal** is a text-based interface where you type commands to direct your computer to perform tasks for you, where the input and output are textual.

When executed by either your IDE or your terminal command, the test framework executes every test case it can find in the `test/` directory. Passing test cases are printed in green, and failing test cases are printed in red, along with what was expected and what was returned.
</details>

## The Testing Process

So far we have treated tests as something you write for code that already exists. When you are learning, it is strongly recommended that you write the tests _first_. Writing tests first forces you to think about the expected behaviours of the **code under test**, that is the code your test case is validating, before you spend time implementing it.

A precise set of input/output pairs is very helpful when implementing the code. Before writing the implementation, run your tests to confirm they fail. Once the implementation has been correctly created, the tests should pass. Confirming that a test fails first is what makes its eventual pass a meaningful signal. A test that passes even when you haven't implemented the function is meaningless.

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

The precondition also guides us towards situations that may not result in a valid output. Since the precondition says `daysLate >= 0`, what happens if we pass `-5` is undefined: the caller has broken their half of the bargain, and the function promises nothing in return. We return to what a function should do about inputs like this at the end of this chapter.

To run these tests, `lateFee` must at least exist, or the compiler will refuse to execute the program at all. So we begin with a **stub**: a function with the right signature that returns a clearly wrong value.

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

Now we implement the function. The preconditions and postconditions give us an idea of which conditions to put in our `if` statement.

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

Notice what did _not_ change: the tests. They were correct all along, because they were written from the specification, and so the requirement our implementation forgot had nowhere to hide. If we had written our tests _after_ the implementation, by reading our own code and checking that it does what it appears to do, we would probably not have thought to test the maximum: the first prototype of `lateFee` contained no hint that a maximum should exist. Tests written first follow the specification, while tests written afterwards tend to mirror the code, mistakes included.


<details class="tooltip ts-tips">
<summary>Recall: <code>const</code> </summary>

`const` introduces a named value. Here `fee` names the result of the per-day calculation so it can be compared against the maximum and then returned. A `const` cannot be reassigned after it is defined.
</details>

<details class="tooltip deep-dive">
<summary>Tests as Executable Specifications</summary>

A test suite written before the implementation acts as an _executable specification_: a precise, runnable description of the intended behaviour. This is more useful than a written description alone, because the computer can check whether your implementation matches it, every time you run the suite.
</details>

<!--
The full process, then:

1. Read the specification and write tests that capture each promised behaviour.
2. Stub the function and run the tests, confirming that every test fails.
3. Implement the function.
4. Run the tests again. If any fail, use the failure reports to find and fix the fault.
5. Repeat until the suite passes.
-->

## Deriving Tests

We wrote the `lateFee` suite by instinct: read the specification, turn each clause into a test. That instinct served us well, but instinct alone does not tell you when a suite is _complete enough_. Two systematic techniques, **equivalence class partitioning** and **boundary value analysis**, turn that instinct into a method.

### Equivalence Classes

The most direct way to choose test inputs is to divide the input space into **equivalence classes**: groups of inputs that the specification says should be handled the same way. You then choose at least one **representative**  from each class.

The `lateFee` specification divides its input into three classes:

| Class | Inputs | Behaviour |
|---|---|---|
| Grace period | 0 to 2 | Fee is 0 |
| Accruing | 3 to 21 | Fee grows by $0.50 per day |
| Capped | 22 and up | Fee is exactly $10 |

Note where the table begins: at 0, with no negative inputs anywhere. We got starting at 0 directly from `daysLate >= 0` in the precondition. The invariant we wrote in the doc comment defines the input space the suite must cover. Without it, we would not know whether `lateFee(-5)` was a missing class or a meaningless input.

Look back at the suite we wrote: it contains a representative from each class: `lateFee(0)` and `lateFee(2)` for the grace period, `lateFee(3)` and `lateFee(12)` for accrual, `lateFee(30)` for the cap. This suite caught our missing-maximum fault because it had a representative from the capped class, and that is precisely the class the implementation forgot.

Within a class, one representative is as informative as another. `lateFee(12)` and `lateFee(15)` both exercise the accruing class, so testing both adds almost no confidence beyond testing one. Counting tests is therefore a poor measure of a suite: a suite of `lateFee(5)`, `lateFee(8)`, and `lateFee(15)` has three checks but covers only one class, and would have passed our buggy, cap-free implementation without complaint.

<details class="tooltip deep-dive">
<summary>Equivalence Classes are Only Derived From the Specification</summary>

In [Chapter 1](./01_new-language), we defined a **branch** as the side of an if-statement that was taken when executed on an input. A **path** is the sequence of branches that are taken when a program executes on a given input.

Two inputs belong to the same class when the _specification_ says they should behave the same way, not when they happen to take the same path through the code you wrote. In our buggy implementation, `lateFee(12)` and `lateFee(30)` took the same path through the code, so classes derived from that implementation would have merged them, and the fault would have survived. Classes derived from the specification kept them apart, which is why the fault was caught.
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
<!-- caption="The three equivalence classes for daysLate." -->

## Erroneous Outcomes

Every call to a function has one of two outcomes. A **successful outcome** is the one the function exists to produce. An **erroneous outcome** is any other result. Think about a bank account. A customer trying to withdraw more than their balance is not unusual, and the design must anticipate it. An erroneous outcome like this is not a bug. It is a foreseeable result that belongs in the function's contract, so the caller knows it can happen and what they will receive when it does. Because it is part of the contract, it is tested like every other clause.

To see both outcomes in one place, we extend the library example. The library allows each book loan to be renewed at most twice:

```typescript
type Loan = {
  title: string;
  // invariant: a whole number, 0 <= renewalsRemaining <= 2
  renewalsRemaining: number;
};
```

Renewing a loan that still has renewals left is the successful outcome. Trying to renew a loan that has no renewals remaining is an erroneous outcome. It happens often, so the contract should say exactly what the caller gets back.

How do we encode an erroneous outcome? We could return `null`: but `null` is not descriptive, and `null` is an overloaded concept in many languages. We could return a special value, say a `Loan` whose `renewalsRemaining` is `-1`. But a special value is easy to mistake for a real one: a caller who forgets to check for `-1` carries on computing with a loan that does not exist, and nothing in the types warns them.

So that we can be clear about the outcome, and rely on the type checker to check that both outcomes are handled, we introduce a _result type_:

```typescript
type Result<T, E> = { ok: true, value: T } | { ok: false, error: E };
```

`Result` is generic over two type parameters: `T` is the type of a successful value, and `E` is the type of the error. This is the same tagged-union idea from the previous chapter, with `ok` as the discriminator: a caller checks `ok` to learn whether it received a `value` or an `error`. A successful outcome is an `ok: true` result carrying the value, and an erroneous outcome is an `ok: false` result carrying an explanation. Because the function's return type is `Result<Loan, string>` rather than `Loan`, the compiler will not let a caller use the `value` without first checking `ok`, so the erroneous outcome cannot be overlooked by accident.

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
    if (loan.renewalsRemaining === 0) {
        // running out of renewals is an erroneous outcome the contract anticipates
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

Both outcomes are _documented_ in the postcondition, and the postcondition names the exact value the caller receives in each case. So both are tested the same way, with `checkExpect`, exactly as we tested every clause of the `lateFee` contract:

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

<details class="tooltip link-110">
<summary>Higher-Order Functions</summary>

`checkExpect` is a higher-order function, so called because it takes a function as an argument. You've seen this before in CPSC 110, notably in `map`, `filter`, and `fold`.
</details>

A refused renewal is not a malfunction but a specified result. The second test confirms that `renew` produces the result the contract specifies. There is nothing special about testing an erroneous outcome: if the contract describes the outcome, check the outcome.

### Precondition Violations

What about a call that breaks the precondition: `renew` on a `Loan` whose `renewalsRemaining` is `-1`, or `lateFee(-5)`? These are neither successful nor erroneous outcomes, because the contract says nothing about them. The caller has broken their half of the bargain, and the function promises nothing in return. Our `lateFee` returns `1.75` for `lateFee(5.5)`, a number with no meaning under the policy, and this is not a defect in `lateFee`: `5.5` was never a permitted input. There is nothing to test, because there is no specified behaviour to test against.

This is why the choice between a precondition and an erroneous outcome is a design decision. A precondition keeps a function simple, and is appropriate when every caller is code you control and can trust to respect the restriction. An erroneous outcome costs a check and a `Result`, and is appropriate when callers cannot be trusted to respect the restriction. This is especially important when a value arrives from somewhere you cannot trust: a user, a file, a network, or another system. In that case the restriction belongs in the contract: the function checks the input and returns `ok: false`, so the caller receives a clear result instead of a meaningless one. Whichever you choose, write it down: a restriction that appears in neither the precondition nor the postcondition protects no one.

<details class="tooltip deep-dive">
<summary>Failing with User-Specified Inputs: Give More Detail</summary>

Functions that take _user-specified input_ should almost always report bad input as an erroneous outcome rather than rely on a precondition, because in practice it is useful to expect users to do unreasonable things. The error should also say enough to fix the problem. For example, when you pass a TypeScript program with invalid syntax to `tsc`, it tells you where the error is, rather than reporting only `SyntaxError`.
</details>


#### Triangulating Quality: Type Checking and Testing

The type checker and the test suite operate at different times. The type checker works _statically_ on the source code, ruling out whole categories of invalid calls before the program runs. Tests work _dynamically_, checking specific behaviours by executing the function. They are complementary approaches: a program that passes every type check can still return the wrong value for a given input. And a program that passes all its tests may still fail on an input the test suite did not evaluate. The combination is what gives confidence: types narrow the space of programs that can even be written, and tests validate that the program you wrote does what you intended.

Documented invariants bridge between the two. The preconditions and postconditions in a function's doc comment record exactly the part of the specification the compiler cannot see, and they are exactly what the tests should check.

An invariant that is written down can be turned into a test suite, but one that lives only in someone's head cannot be checked by anything.



<details class="tooltip exercise">
  <summary>Exercise: Parking Fees</summary>

Practise this chapter's concepts on a new problem: write a contract, derive tests from it, and implement against them.

> As a parking garage, I want to compute the parking fee by counting how many whole hours a car is parked, with a free first hour and a daily maximum, so that drivers are charged fairly and predictably.

Parking is free for the first hour. After that, each additional hour costs $4, and the total never exceeds $24. The function will have the signature <span class="hint">`parkingFee(hours: number): number`</span>.

1. Write the contract. Document `parkingFee` with a doc comment giving its purpose, a precondition (<span class="hint">`hours` is a whole number and `hours >= 0`</span>), a postcondition (<span class="hint">the fee is between 0 and 24</span>), and `@param`/`@returns` lines.
2. Derive the tests first. Use equivalence class partitioning to find the input classes the policy treats alike, and pick one representative of each. Then use boundary value analysis to add the edges: where the free hour ends, and where the cap is reached.
3. Stub `parkingFee` so it returns a clearly wrong value, run your tests, and confirm they all fail.
4. Implement `parkingFee`, run the tests again, and confirm they pass.
5. Handle bad input. Decide what should happen when a caller supplies an input outside the precondition, for example <span class="hint">`parkingFee(-1)`</span>. Turn it into an erroneous outcome: change the return type to <span class="hint">`Result<number, string>`</span>, document the error in the contract, and write a `checkExpect` test that confirms `parkingFee(-1)` returns `ok: false`.

</details>
