# Part 2: Defining Abstractions

> Once a system grows beyond what one person can keep track of, a design has to keep working as the system changes.

In [Part 1](../part1/index), programs were small enough for one person to keep the whole design in mind. We maintained invariants with carefully written constructor functions and with _programmer discipline_ about how objects were created and changed.

Part 2 widens the scope. Real software is built by teams, maintained for years, and solves problems too large for one person. No single person can keep track of every contributor, remember the whole history of the code, or review all of it. We cannot assume that other programmers will use our code correctly, or that every invariant will survive through discipline alone.

So we move from _programmer discipline_ to encoding invariants _in the language_ itself. When classes and the abstractions built around them encode the invariants, the language enforces them instead of each programmer's care, and the way programmers coordinate becomes an explicit part of the design.

<details class="tooltip link-110">
<summary>Programmer Discipline vs Enforcement</summary>

Recall that in CPSC 110, the _signature_ recorded type information, but the teaching languages did not enforce it. [Part 1](../part1/index) showed the shift from the unenforced signature in CPSC 110:

```racket
(@signature Number -> Number)
(define (double n) (* n 2))
; no issues statically, causes a runtime error: '*: expects a number, given "Clearly not a number"'
(double "Clearly not a number")
```

to the _typed_ signature in TypeScript, which the type checker enforces:

```typescript
function double(n: number): number {
    return n * 2;
}
// static error: "Argument of type 'string' is not assignable to parameter of type 'number'"
double("Clearly not a number");
```

This is a shift from programmer discipline (in CPSC 110, _assuming_ callers would respect the signature) to enforcement by the language. The type checker reports the error before the program runs, and it also reports it in the right place. The mistake is the call that passes a string as `n`, not the `*` inside `double`, which is where the CPSC 110 error appeared.

In Part 2, we'll see the same shift, but with more complex constraints than type signatures.

</details>

This part develops _class-based_ abstractions as the mechanism for enforcing invariants. Across seven chapters, we define classes, decompose systems into cohesive units, hide what is free to change, separate what a class means from how it stores it, depend on abstractions through interfaces, organise classes into hierarchies, and write code that keeps working as new types are added.

## Intended Learning Objectives

By the end of Part 2, you will be able to:

1. _Design classes that own and protect state_, using constructors, access modifiers, and methods to maintain invariants inside the object.
2. _Decompose a problem into cohesive classes_, so each unit has a clear responsibility and the relationships among units are explicit.
3. _Use encapsulation and interfaces to hide change_, exposing only the operations clients need while keeping representations free to evolve.
4. _Keep an implementation free to change_, distinguishing what an abstraction means from how it is represented, and judging what each commitment a class avoids costs it in return.
5. _Apply polymorphism and extension deliberately_, so new behaviour can be added by introducing new classes rather than reopening code that already works.

## Chapter Overview

Part 2 covers three connected themes across seven chapters.

#### Building abstractions:

1. [Building Abstractions with Classes](./01_abstraction) introduces classes as the direct language support for bundling state with the operations that maintain it.
2. [Decomposing Systems into Cohesive Classes](./02_decomposition) shows how to split a system into classes and responsibilities that belong together.

#### Hiding what can change:

3. [Encapsulating What Varies](./03_encapsulation) uses access control to keep a representation private, so the invariant that makes an object meaningful cannot be broken from outside.
4. [Preserving Implementation Freedom with Abstract Values](./04_flexibility) treats the freedom to change an implementation as something a design can lose, showing how a careless comparison gives it away and how far it extends beyond the representation.
5. [Defining Boundaries with Interfaces](./05_boundaries) establishes narrow contracts that let clients depend on a stable shape rather than on a concrete implementation.

#### Designing for growth:

6. [Extending Behaviour Through Polymorphism](./06_extension) uses inheritance and overriding to let related classes share behaviour while varying the parts that differ.
7. [Growing Systems with the Open/Closed Principle](./07_ocp) brings the design ideas together and shows how polymorphism lets software grow by adding new code instead of rewriting code that already works.

## Toward [Part 3](../part3/index): Evolution

Part 2 ends with a design goal that matters most for large systems: fixing problems and adding features without changing the existing code around them. [Part 3](../part3/index) builds on this. It examines how systems are composed from interchangeable pieces, how dependencies are managed so that concrete implementations can be supplied from outside, and how a codebase can stay open to new extensions while remaining manageable across modules and teams.
