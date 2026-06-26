# Part 2: Defining Abstractions

> When a system grows beyond one person's attention, the question is no longer whether a design works, but whether it can keep working as it changes.

In Part 1, we saw programs small enough for one person to keep the whole design in their mental model. We maintained invariants by careful factory function design and by personal *programmer discipline* about how objects were constructed and modified.

In Part 2, we expand our scope. Real software is built by teams, is maintained for years, and solves problems too large for any one person to tackle alone. In real software systems, the contributor count exceeds what an individual can manage, the longevity of the codebase exceeds what an individual can remember, and the code volume exceeds what an individual can audit. All of this means we cannot trust that other programmers will use the code we write correctly, or that every invariant will survive by discipline alone.

In response, we move from *programmer discipline* to encoding invariants *in the language* itself. By encoding invariants into classes and their associated abstractions, we shift the burden of consistency from individual care to *language enforcement* and from ad hoc coordination to explicit design.

<details class="tooltip link-110"> 
<summary>Programmer Discipline vs Enforcement</summary>

Recall in CPSC 110, the *signature* encoded type information. But the teaching languages did not enforce this signature. In Part 1, we saw the shift from the uninforced signature in CPSC 110:

```racket
(@signature Number -> Number)
(define (double n) (* n 2))  
; no issues statically, causes a runtime error: '*: expects a number, given "Clearly not a number"'
(double "Clearly not a number") 
```

To the *typed* signature in TypeScript, which is enforced by the typechecker.

```typescript
function double(n: number): number {
    return n * 2;  
}
// static error: "Argument of type 'string' is not assignable to parameter of type 'number'"
double("Clearly not a number") 

```

This is a shift from programmer discipline (in CPSC 110, *assuming* callers of the function would respect the signature) to enforcement by the language. In addition to the type checker giving us a static error, so the code will not fail at runtime, we see that the error is more accurate: the issue was not in passing a number to the `*` operator, but in passing a string as parameter `n`.  

In Part 2, we'll see the same shift, but with more complex constraints than type signatures. 
 
</details>

In this module we develop *class-based* abstractions as the mechanism for invariant enforcement. Across eight lectures, we define classes, decompose systems into cohesive units, verify their invariants, design how failures are communicated, hide what is free to change, depend on abstractions through interfaces, organize classes into hierarchies, and write code that continues to apply as new types arrive.

## Intended Learning Objectives

By the end of Part 2, you will be able to:

1. _Design classes that own and protect state_, using constructors, access modifiers, and methods to maintain invariants inside the object.
2. _Decompose a problem into cohesive classes_, so each unit has a clear responsibility and the relationships among units are explicit.
3. _Verify class behaviour with tests and errors_, deciding when a failure should be prevented, asserted, or communicated as part of the API.
4. _Use encapsulation and interfaces to hide change_, exposing only the operations clients need while keeping representations free to evolve.
5. _Apply polymorphism and extension deliberately_, so new behaviour can be added by introducing new classes rather than reopening code that already works.

## Chapter Overview

Part 2 covers four connected themes across eight chapters.

**Building abstractions:**

1. [The Class as a Unit of Abstraction](./01_abstraction) introduces classes as the direct language support for bundling state with the operations that maintain it.
2. [Cohesive Decomposition](./02_decomposition) shows how to split a system into classes and responsibilities that belong together.

**Making class-based code reliable:**

3. [Verifying Behaviour](./04_verification) develops tests for class behaviour and discusses how to check that an object continues to respect its promises.
4. [Error Handling](./03_errors) asks how class-based APIs should communicate failure when a precondition is violated or a request cannot be completed.

**Hiding what can change:**

5. [Encapsulation](./05_encapsulation) uses access control to keep representations private and preserve class invariants.
6. [Interfaces as Explicit Boundaries](./06_boundaries) defines narrow contracts that let clients depend on a stable shape rather than on a concrete implementation.

**Designing for growth:**

7. [Polymorphism Through Class Extension](./07_extension) uses inheritance and overriding to let related classes share behaviour while varying the parts that differ.
8. [The Open/Closed Principle](./08_ocp) brings the design ideas together and shows how polymorphism lets software grow by adding new code instead of rewriting code that already works.

## Toward Part 3: Design for Evolution

Part 2 ends with a design goal that is crucial for large systems: we need the ability to fix problems and add new features without impacting all of the existing code within the rest of the system. Part 3 extends this further: We examine at how systems are composed from interchangeable pieces, how dependencies are managed so that concrete implementations can be supplied from the outside, and how a codebase can remain open to new extensions while staying manageable across modules and teams.
