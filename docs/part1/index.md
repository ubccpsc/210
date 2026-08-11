# Part 1: Foundations of Software Construction

> Software exists to solve real problems. These chapters are about building solutions that work, and using a language that helps you get them right.

You already know how to program, and you already know that programs can go wrong. Part 1 builds on that groundwork and lays the foundations of software construction that apply across a broad set of programming languages. 

We will cover two concerns across Part 1. The first concern is **capability**: the building blocks a real program needs, from structured data to collections, changing state, and communication with files and services. You know many building blocks already; the new building blocks you will learn signal a shift to **imperative programming**. We will see just how far we can get with these building blocks in [Chapter 4](./04_maintaining-invariants), which will motivate the introduction of object-oriented programming in [Part 2](../part2/index).  Along the way we will learn TypeScript, a language with more capabilities, and that checks far more of your work, than the teaching languages in CPSC 110.


The second concern is **correctness**: specifying what a program should do precisely enough that the language, the tests, or you can confirm that it does. In CPSC 110 you learned to defend against mistakes through _discipline_: you documented each function's signature, you wrote examples before the function bodies, and you followed design recipes carefully. That discipline worked, but almost none of it was _enforced_. A signature that said `(@signature Number -> String)` was a promise you made to yourself, but the language did not check it. TypeScript will allow us to _enforce_ many more correctness properties. We will be careful to separate three kinds of assurance: guarantees the compiler can check before the program runs, behaviours that can only be confirmed by running it, and promises that still rest on the discipline of the programmer.
 


Our programs in Part 1 stay small enough that one person can hold the whole design in their head. That assumption is what allows personal discipline to uphold the promises the language cannot. Part 2 moves beyond this size restriction and asks what happens when programs, teams, and lifetimes outgrow any one person.

## Intended Learning Objectives

By the end of Part 1, you will be able to:

1. _Model information as precise types_, designing data definitions whose structure drives the code that operates on them.
2. _Specify behaviour with contracts and invariants, and construct tests_ that target the cases most likely to reveal faults, then judge whether a suite adequately covers them.
3. _Decide how each property should be corroborated_, whether by the type system, by tests and assertions, or by controlling how values are created, design code that enforces the invariants the language cannot, and communicate the failures it cannot prevent.
4. _Reason about state and time_, tracing how references, scope, and mutation determine what a change affects, and weighing the trade-offs of mutation, side effects, and asynchronous computation.
5. _Build working programs_ that combine these ideas to process collections and interact with files and web services.

## Building on CPSC 110

We introduce TypeScript by scaffolding from the teaching languages you already know. Where a concept is familiar we point at its teaching language counterpart; where it differs we call the difference out explicitly. Many of the ideas are not new. Designing data, breaking a problem into functions, and writing examples before code all carry over. What changes is how much the language records and checks for you. The central change is the **type**: in CPSC 110, a signature like `(@signature Number -> String)` was an annotation the language ignored. 

In TypeScript the signature is a _checked part_ of the program. With this checking, a whole slew of mistakes become errors reported before the program runs rather than bugs discovered afterward.

<details class="tooltip link-110">
<summary>Discipline in CPSC 110</summary>

The ideas of correctness are not new; the enforcement is. In CPSC 110, a data definition like `; Score is Number[0, 100]` expressed exactly the kind of constraint we care about in this part. But nothing stopped you from constructing a `Score` of `150`; the comment relied entirely on every programmer reading and respecting it. Part 1 examines which of those constraints the language can now enforce for us, and what to do about the ones it cannot.
</details>

## Layered Correctness

A type communicates _intent_: a well-designed type tells the next reader exactly which values are valid, and the compiler enforces that intent before the program runs. But types describe _structure_, and many correctness properties are about _meaning_. A balance must stay non-negative, a course grade must sit between 0 and 100, and a binary search tree must keep its keys in order. A value can have exactly the right shape and still be meaningless. The properties that must hold beyond the types are called **invariants**, and the assumptions and guarantees a function documents, its preconditions and postconditions, are its **contract**.

Identifying these properties and confirming them are separate tasks. The separation follows the boundary between the **static** and **dynamic** views of a program. The static view is the source text, which the compiler can analyse without running it. That is where types are checked. The dynamic view is the program as it runs, taking on actual values and following particular paths. Whether it computes the _right_ answer is a dynamic question, and can only be answered by running the code. These mechanisms form layers, and each guards against a failure the others cannot see:

- **Types** establish what shapes of data are allowed.
- **Contracts** state what behaviour each function assumes and promises.
- **Invariants** state what must remain true of the data at all times.
- **Tests** execute the code, choosing which inputs and paths to exercise.
- **Assertions** check that the code's behaviour matches what was expected.



No layer is sufficient on its own. A program can be perfectly typed and still compute the wrong answer; a contract can be precisely worded and silently violated; a test suite can pass while another part of the program produces invalid data. A passing test is evidence about the particular runs you tried; a type check or a maintained invariant is a claim about every run. Distinguishing the assurance you hold from the assurance you only hope for is a central part of engineering.

<details class="tooltip deep-dive">
<summary>How Guarantees Fail</summary>

Five failure modes account for most broken guarantees, and each corresponds to a missing layer:

1. _Over-trusting types_: assuming that type-correct means semantically correct.
2. _Vague contracts_: wording like "valid" or "correct" with no explicit criteria, leaving a promise no one can check.
3. _Unowned representation_: exposing the raw shape of the data so clients can bypass the safe operations entirely.
4. _Happy-path tests_: checking typical outputs but never whether the invariants survive more diverse operations.
5. _Weak assertions_: confirming only that a call returned something, without carefully verifying that the behaviour was correct.

When you find a bug that "should have been impossible," it is usually worth asking which of these five is responsible.
</details>

One concern remains. An invariant the language cannot check must still be kept true, and this requires control over creation. If any code can build a value, every such place is an opportunity to break the invariant. In [Chapter 4](./04_maintaining-invariants), we'll see how we can use encapsulation to keep values hidden using _only the language features_ you already know from CPSC 110. In Part 2, we learn about a new language feature that provides encapsulation more directly, but the idea is the same as in Chapter 4: protecting an invariant shapes how the code is organised.



## Chapter Overview

Part 1 covers four broad themes across nine chapters.

**The language and its data:**

1. [Learning a New Programming Language](./01_new-language) introduces TypeScript from Intermediate Student Language: types as a checked mechanism, the compiler, statements like `if` and `return`, and the static and dynamic views the rest of the part builds on.
2. [Using Types to Model Problems](./02_model-types) designs precise data: compound types, unions for distinct cases, and recursive structure, with functions whose shape follows the shape of the data.

**Correctness:**

3. [Checking Invariants](./03_checking-invariants) records contracts and invariants, derives tests from them using equivalence classes and boundary values, and uses assertions to catch impossible states.
4. [Maintaining Invariants](./04_maintaining-invariants) keeps an invariant true for the life of a program by controlling creation with a constructor function and hiding state inside a closure.

**The capabilities of real programs:**

5. [Arrays and Iteration](./05_arrays) introduces collections and the operations over them: `map`, `filter`, `reduce`, and `find`, with the `for of` loop beneath them.
6. [Mutation and Side Effects](./06_state-mutation) adds state that changes over time, along with the references, aliasing, scope, and side effects that come with it.
7. [Asynchronous Effects and Time](./07_async) reaches outside the program to files and web services, where a result arrives only after a wait, using promises and `async`/`await`.

**Handling and verifying failure:**

8. [Designing for Failure](./08_errors) treats failure as part of a function's contract, choosing between returning a failure the type checker forces callers to confront and throwing an exception that propagates to a handler above.
9. [Verifying Behaviour](./09_verification) moves from the course toolkit to the assertion vocabulary of a real test framework, partitions inputs and outputs, and uses coverage and regression to judge whether a suite checks enough.

## Toward Part 2: Designing and Enforcing Abstractions

Part 1 ends with promises the language cannot check and a technique for keeping these promises through disciplined design. Part 2 moves that approach into the code itself: classes bundle data together with the operations allowed on it, and encapsulation puts the representation out of reach so an invariant cannot be broken from outside. From there it builds the vocabulary for abstractions that others can depend on: interfaces that state a contract, implementations that can stand in for one another, and designs that stay open to extension as requirements change.
