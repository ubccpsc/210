# RTH: I think this material will go in part 2 and does not need migration during the part1 effort

# Owning Invariants with Modules

If invariants matter, we must control how values are created and updated.

That control is ownership.
Modules are one of the most important tools for enforcing it.

## 1. Why Ownership Is Necessary

Suppose we export a raw tree representation type.
Clients can build object literals directly.

Even if all exported operations preserve the BST invariant, client code can still bypass those operations and inject invalid values.

Result:

- your functions are correct only for valid inputs
- clients can still provide invalid inputs
- the invariant is no longer reliable globally

## 2. Module Boundary as a Trust Boundary

A good module separates:

- internal representation (private)
- external API (public)

Only the module should be able to construct representation values directly.
Clients should use constructors and operations that preserve invariants.

Design principle:

If clients cannot create invalid states, many bugs disappear.

## 3. Implementing Modules with Closure-Based Objects

Return object values containing operations, with representation captured in closure.

High-level pattern:

1. Keep tree value in a local closure variable.
2. Return methods like insert/get/has.
3. Each method returns a new wrapped value or updates internal state (depending on style).

This bundles data and behavior, and naturally centralizes invariant maintenance.

## 4. API Design for Invariant Ownership

When designing a module API, ask:

1. How are valid values created?
Usually through one constructor such as empty.

2. Which operations can change values?
Only those that preserve invariant should be exported.

3. Is representation leaked?
If yes, clients may bypass invariant-preserving operations.

4. Are contracts visible?
Each exported function should state preconditions and guarantees.

## 5. Example Contract Sketches for a BST Module

empty:

```text
Post: returns a valid empty BST
```

insert(tree, key, value):

```text
Pre: tree is a valid BST
Post:
- result is a valid BST
- result binds key to value
- all other bindings preserved
```

get(tree, key):

```text
Pre: tree is a valid BST
Post: returns absence/presence result consistent with tree contents
```

## 6. Tradeoffs

Encapsulation and ownership add design complexity.

You may need:

- helper functions inside module
- wrappers and conversion helpers
- more deliberate API shape

But the payoff is significant:

- stronger guarantees for clients
- fewer invalid states
- cleaner reasoning about correctness

## 7. Bridge to OOP

Module ownership and class ownership are closely related.

In this section, ownership is enforced by module scope and exported functions.
Later in OOP, ownership is often enforced by class methods and visibility modifiers.

Same idea, different mechanism:

- protect representation
- expose safe operations
- preserve invariant after each operation

## Summary

Invariants do not maintain themselves.
They require ownership.

Modules give us that ownership by controlling construction and update paths.
If invariant correctness matters, module boundaries should be part of the design, not an afterthought.
