# Synthesis: Contracts and Invariant Ownership

This section connected four ideas into one design workflow:

1. Types describe structure.
2. Contracts describe behavior.
3. Invariants describe always-true semantic rules over states.
4. Modules enforce ownership so invariants can actually be trusted.

None of these ideas is sufficient alone.
Together, they provide a practical correctness strategy.

## 1. The Core Gap

TypeScript can reject many mistakes early, but it cannot encode every semantic property directly.

That gap appears whenever correctness depends on meaning rather than shape.

BST ordering is the running example:

- shape can be checked by types
- ordering requires contracts and invariant reasoning

## 2. The Combined Design Pattern

For data structures with semantic constraints, use this pattern:

1. Define representation type.
2. State invariant precisely.
3. Define contracts for each operation.
4. Encapsulate representation behind a module boundary.
5. Export only invariant-preserving operations.
6. Test both behavior and invariant preservation.

If one step is missing, guarantees weaken substantially.

## 3. Why Ownership Is the Turning Point

A team can write beautiful contracts and careful functions, then lose guarantees by exposing raw constructors.

Ownership is what turns local discipline into global reliability.

If only trusted code can create and transform values, invariant preservation becomes enforceable rather than aspirational.

## 4. Common Failure Modes

1. Over-trusting types
Assuming type-correct means semantically correct.

2. Vague contracts
Using wording like valid or correct without explicit criteria.

3. Unowned representation
Exporting raw shapes that let clients bypass safe APIs.

4. Tests without invariant focus
Checking only happy-path outputs and not semantic constraints.

## 5. Practical Checklist

Before shipping an invariant-bearing module, ask:

1. Is the invariant written in precise, testable language?
2. Does every exported mutator preserve the invariant?
3. Can client code fabricate invalid representation values?
4. Are absence/error cases contractually clear?
5. Do tests include invariant-preservation checks after operation sequences?

If any answer is no, your guarantees are incomplete.

## 6. Looking Ahead

This section sets up the next phase of the course:

- In functional style, ownership is often module-level.
- In object-oriented style, ownership often moves to classes and methods.

The core responsibility remains unchanged:

state valid data rules, preserve them after every operation, and design APIs that make invalid states difficult or impossible to construct.

## Final Summary

Reliable software requires layered correctness:

- Types for shape
- Contracts for behavior
- Invariants for semantic consistency
- Ownership for enforceability

That layered model is a recurring theme for the rest of the course.