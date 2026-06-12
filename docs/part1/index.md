# Part 1: Foundations of Software Construction

> Software exists to solve real problems. These chapters are about building solutions that work, and using a language that helps you get them right.

You already know how to program, and you already know that programs can go wrong. In CPSC 110 you learned to defend against mistakes through discipline: you documented each function's signature, you wrote examples before the function bodies, and you followed design recipes carefully. That discipline worked, but almost none of it was enforced. A signature comment that said `Number -> String` was a promise you made to yourself, and neither the language nor any other tool checked it.

Part 1 builds on that groundwork and lays the foundations of software construction that apply across a broad set of programming languages. Along the way we will learn TypeScript, a language that checks far more of your work than BSL did. Two concerns develop together across these chapters. The first is **correctness**: specifying what a program should do precisely enough that the language, the tests, or you can confirm that it does. The second is **capability**: the building blocks a real program needs, from structured data to collections, changing state, and communication with files and services. Throughout, we are careful to separate three kinds of assurance: guarantees the compiler can check before the program runs, behaviours that can only be confirmed by running it, and promises that still rest on the discipline of the programmer.

Our programs in Part 1 stay small enough that one person can hold the whole design in their head. That assumption is what allows personal discipline to uphold the promises the language cannot. Part 2 moves beyond this size restriction and asks what happens when programs, teams, and lifetimes outgrow any one person.

## Building on CPSC 110

TypeScript is introduced by scaffolding from the BSL you already know. Where a concept is familiar we point at its BSL counterpart; where it differs we call the difference out explicitly. Many of the ideas are not new. Designing data, breaking a problem into functions, and writing examples before code all carry over. What changes is how much the language records and checks for you. The central change is the **type**: in BSL a signature like `; Number -> String` was a comment the language ignored, while in TypeScript it is a checked part of the program, and a whole category of mistakes becomes an error reported before the program runs rather than a bug discovered afterward.

<details class="tooltip link-110">
<summary>Discipline in CPSC 110</summary>

The ideas are not new; the enforcement is. In CPSC 110, a data definition like `; Score is Number[0, 100]` expressed exactly the kind of constraint we care about in this part. But nothing stopped you from constructing a `Score` of `150`; the comment relied entirely on every programmer reading and respecting it. Part 1 examines which of those constraints the language can now enforce for us, and what to do about the ones it cannot.
</details>

## Layered Correctness

A type communicates *intent*: a well-designed type tells the next reader exactly which values are valid, and the compiler enforces that intent before the program runs. But types describe *structure*, and many correctness properties are about *meaning*. A balance must stay non-negative, a course grade must sit between 0 and 100, and a binary search tree must keep its keys in order. A value can have exactly the right shape and still be meaningless. The properties that must hold beyond the types are called **invariants**, and the assumptions and guarantees a function documents, its preconditions and postconditions, are its **contract**.

Identifying these properties and confirming them are separate tasks. The separation follows the boundary between the **static** and **dynamic** views of a program. The static view is the source text, which the compiler can analyse without running it. That is where types are checked. The dynamic view is the program as it runs, taking on actual values and following particular paths. Whether it computes the *right* answer is a dynamic question, and can only be answered by running the code. These mechanisms form layers, and each guards against a failure the others cannot see:

- **Types** establish what shapes of data are allowed.
- **Contracts** state what behaviour each function assumes and promises.
- **Invariants** state what must remain true of the data at all times.
- **Tests and assertions** check that those promises actually hold when the program runs.

No layer is sufficient on its own. A program can be perfectly typed and still compute the wrong answer; a contract can be precisely worded and silently violated; a test suite can pass while another part of the program produces invalid data. A passing test is evidence about the particular runs you tried; a type check or a maintained invariant is a claim about every run. Distinguishing the assurance you hold from the assurance you only hope for is a central part of engineering.

One concern remains. An invariant the language cannot check must still be kept true, and this requires control over creation. If any code can build a value, every such place is an opportunity to break the invariant. Chapter 4 restricts creation to a single constructor function and hides the data inside a closure, so the only way to produce or change a value is through operations that preserve the invariant. This is encapsulation built by hand. Part 2 provides it as a language feature, but the idea is the one you meet here: protecting an invariant shapes how the code is organised.

<details class="tooltip deep-dive">
<summary>How guarantees fail</summary>

Four failure modes account for most broken guarantees, and each corresponds to a missing layer:

1. **Over-trusting types**: assuming that type-correct means semantically correct.
2. **Vague contracts**: wording like "valid" or "correct" with no explicit criteria, leaving a promise no one can check.
3. **Unowned representation**: exposing the raw shape of the data so clients can bypass the safe operations entirely.
4. **Happy-path tests**: checking typical outputs but never whether the invariants survive a sequence of operations.

When you find a bug that "should have been impossible," it is usually worth asking which of these four is responsible.
</details>

## The Chapters

Part 1 covers three broad themes across seven chapters.

**The language and its data.**

1. [Learning a New Programming Language](./01_new-language) introduces TypeScript from BSL: types as a checked mechanism, the compiler, statements like `if` and `return`, and the static and dynamic views the rest of the part builds on.
2. [Using Types to Model Problems](./02_model-types) designs precise data: compound types, unions for distinct cases, and recursive structure, with functions whose shape follows the shape of the data.

**Correctness.**

3. [Checking Invariants](./03_checking-invariants) records contracts and invariants, derives tests from them using equivalence classes and boundary values, and uses assertions to catch impossible states.
4. [Maintaining Invariants](./04_maintaining-invariants) keeps an invariant true for the life of a program by controlling creation with a constructor function and hiding state inside a closure.

**The capabilities of real programs.**

5. [Arrays and Iteration](./05_arrays) introduces collections and the operations over them: `map`, `filter`, `reduce`, and `find`, with the `for of` loop beneath them.
6. [Mutation and Side Effects](./06_state-mutation) adds state that changes over time, along with the references, aliasing, scope, and side effects that come with it.
7. [Asynchronous Effects and Time](./07_async) reaches outside the program to files and web services, where a result arrives only after a wait, using promises and `async`/`await`.

## Learning Objectives

By the end of Part 1, you should be able to:

1. **Model information as precise types**, designing data definitions whose structure drives the code that operates on them.
2. **Specify behaviour with contracts and invariants, and construct tests** that target the cases most likely to reveal faults, then judge whether a suite genuinely covers them.
3. **Decide how each property should be guaranteed**, whether by the type system, by tests and assertions, or by controlling how values are created, and design code that enforces the invariants the language cannot.
4. **Reason about state and time**, tracing how references, scope, and mutation determine what a change affects, and weighing the trade-offs of mutation, side effects, and asynchronous computation.
5. **Build working programs** that combine these ideas to process collections and interact with files and web services.

## Toward Part 2: Designing & Enforcing Abstractions

Throughout Part 1 our programs stay small, small enough that one person can hold the whole design in their head, and small enough that personal discipline can plausibly maintain every promise the types cannot check. In Part 2 we relax that assumption and ask what happens when programs, teams, and lifetimes grow beyond what any individual can manage. When that happens, the ideas of Part 1 are not replaced; they are re-expressed. Data with distinct cases, handled here through case analysis, returns as class hierarchies; the constructor-and-closure encapsulation of Chapter 4 returns as classes that keep their own state private; contracts return as the expectations and guarantees of methods. The vocabulary changes; the design logic does not.
