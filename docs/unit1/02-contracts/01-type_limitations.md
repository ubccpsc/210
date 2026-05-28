# Limits of Types and the Need for Contracts

Types are essential, but they are not enough.

This reading explains why we need contracts in addition to type annotations.

## 1. Types Capture Structure, Not Full Meaning

TypeScript can verify structural facts:

- this value is a number
- this object has required properties
- this union case is handled

But many program properties are semantic.

Consider a binary tree node:

```ts
type Node<T> = {
	key: number;
	value: T;
	left: Node<T> | null;
	right: Node<T> | null;
};
```

This type says nothing about ordering.
The following value has the right shape but is not a valid BST:

```ts
const notABST: Node<string> = {
	key: 10,
	value: "root",
	left: { key: 99, value: "bad", left: null, right: null },
	right: null,
};
```

So:

- type check: passes
- semantic check: fails

## 2. What a Contract Adds

A contract specifies behavior that types alone cannot express.

For a function, a contract usually has two parts:

1. Preconditions
What must be true when the function is called.

2. Postconditions
What the function guarantees on return, assuming preconditions held.

Example contract sketch for insertion into a BST:

```text
insert(tree, key, value)

Pre:
- tree satisfies BST invariant

Post:
- result satisfies BST invariant
- result contains key
- if key was present, value at key is replaced
- all other bindings are preserved
```

Types alone cannot express all of that.

## 3. Why This Matters in TypeScript

TypeScript uses structural typing.
If a value has the right shape, it is often accepted.

That is powerful and practical, but it means semantic properties must be maintained by design discipline:

- good contracts
- careful API boundaries
- invariants that are stated and preserved

## 4. Contracts Are Not Just Comments

A contract should influence implementation and testing.

Implementation:

- each branch should preserve postconditions
- helper functions should have smaller contracts

Testing:

- include examples for normal cases
- include edge cases and boundary cases
- include invariant-focused tests

If a contract is written but never used to guide design or tests, it is not doing its job.

## 5. Typical Contract Patterns

You will repeatedly use these patterns:

1. Constructor/Factory contract
Guarantee produced values satisfy invariant.

2. Observer contract
Read-only operation does not change invariants.

3. Transformer contract
Output preserves invariant and implements intended change.

4. Error/absence contract
Specify what happens when data is missing.

## 6. Avoid a Common Misunderstanding

Misunderstanding:
If my program type-checks, then my design is correct.

Correction:
Type-checking is necessary but not sufficient.

You need both:

- static structure checks via types
- semantic behavior checks via contracts and invariant reasoning

## Summary

Types answer: Is this value shaped correctly?
Contracts answer: Is this function behavior correct?

Both are required for reliable software.