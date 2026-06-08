# Part 2: Defining Abstractions

In Part 1, programs were small enough for one person to keep an understanding of the code in their mental model. We maintained invariants by careful factory function design and by personal *programmer discipline* about how objects were constructed and modified.

In Part 2, we expand our scope. Real software is built by teams, is maintained for years, and solves problems too large for any one person to tackle alone. Three forces contribute to making real software systems different from smaller programs: (1) contributor count exceeds what an individual can manage, (2) duration exceeds what an individual can remember, (3) and code volume exceeds what an individual can audit. These result (COMMENT: somewhat unclear sentence...) in unmanageable complexity, lost understandability, and brittle evolvability. All of this means we cannot trust that other programmers will use the code we write correctly (programmer discipline). 

In response to these challenges, we move from programmer discipline to encoding invariants in the language itself. By encoding invariants into types (COMMENT: is this from Part 1 or Part 2?), we shift the burden of consistency from individual care to language enforcement. 

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

In this module we develop class-based abstractions as the mechanism for invariant enforcement. Across eight lectures, we define classes, decompose systems into cohesive units, verify their invariants, design how failures are communicated, hide what is free to change, depend on abstractions through interfaces, organize classes into hierarchies, and write code that continues to apply as new types arrive.