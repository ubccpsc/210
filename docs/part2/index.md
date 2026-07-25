# Part 2: Defining Abstractions

> When a system grows beyond one person's attention, the question is no longer whether a design works, but whether it can keep working as it changes.

In Part 1, we saw programs small enough for one person to keep the whole design in their mental model. We maintained invariants by careful factory function design and by personal *programmer discipline* about how objects were constructed and modified.

In Part 2, we expand our scope. Real software is built by teams, is maintained for years, and solves problems too large for any one person to tackle alone. In real software systems, the contributor count exceeds what an individual can manage, the longevity of the codebase exceeds what an individual can remember, and the code volume exceeds what an individual can audit. All of this means we cannot trust that other programmers will use the code we write correctly, or that every invariant will survive by discipline alone.

In response, we move from *programmer discipline* to encoding invariants *in the language* itself. By encoding invariants into classes and their associated abstractions, we shift the burden of consistency from individual care to *language enforcement* and from ad hoc coordination to explicit design.

<details class="tooltip link-110"> 
<summary>Programmer Discipline vs Enforcement</summary>

Recall in CPSC 110, the *signature* encoded type information. But the teaching languages did not enforce this signature. In Part 1, we saw the shift from the unenforced signature in CPSC 110:

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

In this module we develop *class-based* abstractions as the mechanism for invariant enforcement. Across seven lectures, we define classes, decompose systems into cohesive units, hide what is free to change, separate what a class means from how it stores it, depend on abstractions through interfaces, organise classes into hierarchies, and write code that continues to apply as new types arrive.

## Intended Learning Objectives

By the end of Part 2, you will be able to:

1. _Design classes that own and protect state_, using constructors, access modifiers, and methods to maintain invariants inside the object.
2. _Decompose a problem into cohesive classes_, so each unit has a clear responsibility and the relationships among units are explicit.
3. _Use encapsulation and interfaces to hide change_, exposing only the operations clients need while keeping representations free to evolve.
4. _Keep an implementation free to change_, distinguishing what an abstraction means from how it is represented, and judging what each commitment a class avoids costs it in return.
5. _Apply polymorphism and extension deliberately_, so new behaviour can be added by introducing new classes rather than reopening code that already works.

## Chapter Overview

Part 2 covers three connected themes across seven chapters.

**Building abstractions:**

1. [Building Abstractions with Classes](./01_abstraction) introduces classes as the direct language support for bundling state with the operations that maintain it.
2. [Decomposing Systems into Cohesive Classes](./02_decomposition) shows how to split a system into classes and responsibilities that belong together.

**Hiding what can change:**

3. [Encapsulating What Varies](./03_encapsulation) uses access control to keep a representation private, so the invariant that makes an object meaningful cannot be broken from outside.
4. [Preserving Implementation Freedom with Abstract Values](./04_flexibility) treats the freedom to change an implementation as something a design can lose, showing how a careless comparison gives it away and how far it extends beyond the representation.
5. [Defining Boundaries with Interfaces](./05_boundaries) establishes narrow contracts that let clients depend on a stable shape rather than on a concrete implementation.

**Designing for growth:**

6. [Extending Behaviour Through Polymorphism](./06_extension) uses inheritance and overriding to let related classes share behaviour while varying the parts that differ.
7. [Growing Systems with the Open/Closed Principle](./07_ocp) brings the design ideas together and shows how polymorphism lets software grow by adding new code instead of rewriting code that already works.

## Toward Part 3: Design for Evolution

Part 2 ends with a design goal that is crucial for large systems: we need the ability to fix problems and add new features without impacting all of the existing code within the rest of the system. Part 3 extends this further: we examine how systems are composed from interchangeable pieces, how dependencies are managed so that concrete implementations can be supplied from the outside, and how a codebase can remain open to new extensions while staying manageable across modules and teams.
