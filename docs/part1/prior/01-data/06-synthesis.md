# RTH: incorporated in the second half of part1/index.md (could be pulled out at the end once part1 is done)

# Synthesis: Information as Data

## The Big Picture

The readings in this section are all about the same central idea: the shape of data and the shape of code are deeply connected.

We started by learning how to model information precisely.
Then we saw that the structure of the data determines the structure of the functions that operate on it.
Then we looked at a type checker, which helps enforce those designs.
Then we stepped back and looked at built-in abstractions such as arrays, and finally at how to derive tests from the specification and the data itself.

These are not separate topics. They are different layers of the same design discipline.
They are also the foundation of language fluency in this course: understanding what each feature contributes to design, correctness, and maintainability.

## The Design Process

The data-modeling process gave us a systematic way to move from a problem description to a type definition:

1. Identify entities.
2. Identify distinct cases.
3. Determine information per case.
4. Look for recursive structure.
5. Express the model as types.
6. Check the model with examples.
7. Look for generalization.

That process is the foundation for everything else in the section.

## Data, Code, and Built-In Abstractions

The same structure-driven logic applies to the functions we write.

| Data shape | Typical code pattern |
|------------|----------------------|
| Primitive values | Use directly in computations |
| Objects | Access properties |
| Unions | Case analysis with `switch` or `if` |
| Recursive types | Recursive functions with base cases |
| Generic types | Generic functions parameterized by type |
| Repeated sequential patterns | Built-in abstractions like arrays |

Arrays are an important example of abstraction: instead of re-writing recursive list traversal every time, we use operations like `map`, `filter`, and `reduce`.
That is a recurring theme in programming: once a pattern becomes common enough, we build a language mechanism around it.

The same is true for functions as object properties.
When behavior is packaged with data, we can use it directly through the object interface rather than writing separate traversal code each time.

## Type Checking Is Necessary, Not Sufficient

The type checker gives us strong guarantees about structure.
It helps us avoid accessing missing properties, forgetting union cases, or writing ill-typed recursive code.

But it does not prove the semantic correctness of a function.
That is why we also need contracts, invariants, and tests in later sections.

The course will keep returning to this same idea:

- types tell us what shapes are allowed
- contracts tell us what behavior is promised
- invariants tell us what must always remain true
- tests tell us whether the promised behavior actually holds

## Functional and Object-Oriented Views

In this section, variants are modeled with discriminated unions and handled with case analysis.

That is the functional view.

Later, the same design ideas will show up again in object-oriented form, where class hierarchies and methods play a similar role.

The underlying idea does not change.
We are still representing the same distinctions in the problem domain; we are just choosing a different way to organize the code.

## Common Mistakes to Avoid

One common mistake is overusing `any`.
It can make a program look flexible while quietly removing the guarantees that types are supposed to provide.

Another is using optional properties when a real union would better represent the domain.
If there are truly different cases, it is usually better to model them explicitly.

Another is forgetting that built-in abstractions are doing real work for you.
Arrays, for example, are not just syntax sugar; they package an entire family of common operations.

Finally, it is easy to believe that if the types are correct, the program is correct.
That is not enough.
Types are a powerful layer of correctness, but they are only one layer.

## Looking Ahead

This section set up several later topics in the course:

- **Abstract patterns over data** — How arrays package common sequential operations
- **Testing from data and functions** — How to derive tests from structure, boundaries, and outcomes
- **Contracts** — How to describe and enforce behavior beyond types
- **Invariants and ownership** — How to preserve meaning across updates
- **OOP** — How the same design ideas reappear in class-based form

Each later topic builds on the same foundation: understand the data first, and the rest of the program becomes much easier to reason about.

## Summary

Designing programs with types is a discipline:

1. Model precisely.
2. Code structurally.
3. Reuse built-in abstractions when patterns become common.
4. Verify automatically with the type checker.
5. Test behavior that types cannot prove.
6. Think functionally first, then relate those ideas to OOP later.
7. Build language fluency by connecting syntax, abstractions, and design intent.

That is the main story of this section.
