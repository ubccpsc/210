# RTH: mostly migrated to part1/index.md

# Designing with Data

Programs are built from both data and computation, and the two are tightly connected.
When we choose a data representation, we are also choosing the shape of the code that will process it.
That is why the design of data is one of the most important decisions we make.
In this course, code fluency grows through understanding these design choices.

## Why Types Matter

When we write programs, we represent information as data. Representing this data _precisely_ is one of the most important design decisions we make, because:

1. **Types communicate intent** — A well-designed type tells other programmers (and future you) exactly what values are valid and what operations make sense. Instead of guessing, the type system enforces a contract.

2. **Types prevent bugs** — Many bugs arise from using data incorrectly: passing the wrong kind of value to a function, trying to access a property that doesn't exist, or forgetting to handle a case. A type checker catches these mistakes _before_ you run your code.

3. **Type structure drives code structure** — The shape of your data determines how you'll process it. If you design your types well, writing the functions that operate on them becomes straightforward. If your types are muddled, your code will be too.

4. **Common patterns can be abstracted** — Once a data pattern appears often enough, a language can provide a built-in abstraction for it. Arrays are one example of this: instead of writing recursive list functions by hand every time, we can use array operations such as `map`, `filter`, and `reduce`.

5. **Tests still matter** — Types catch many mistakes, but they do not prove that a function behaves correctly. We still need tests to check behavior, boundaries, and relationships that types cannot express.

## Learning Objectives

Conceptual:

1. Understand why type checkers exist and how they prevent bugs
2. Understand that **the design of types determines the structure of our programs**
3. Learn to represent information precisely using primitive types, objects, and unions
4. Recognize recursive structure in problem descriptions and model it with recursive types
5. Build code fluency by connecting TypeScript features to the design problems they solve

Applied:

1. Follow a systematic process for translating problem descriptions into type definitions
2. Declare function signatures with precise type information
3. Write functions using case analysis and recursion
4. Recognize when a common pattern is better handled by a built-in abstraction such as arrays
5. Derive tests from data structure, boundaries, and specification
6. Use the TypeScript type checker to validate your designs
