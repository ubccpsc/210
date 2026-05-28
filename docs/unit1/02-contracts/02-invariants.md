# Invariants

An invariant is a property that must always hold for valid values of a data structure.

If an invariant fails, the structure may still have the right type shape, but we can no longer trust operations built on it.

## 1. What Is an Invariant?

Think of an invariant as a safety rule for states.

Examples:

- list length is non-negative
- queue front and back pointers are consistent
- BST ordering property holds at every node

Invariant reasoning lets us treat operations as safe building blocks.

## 2. BST Invariant (Running Example)

For each node with key k:

- every key in the left subtree is less than k
- every key in the right subtree is greater than k
- both subtrees are themselves valid BSTs

This is recursive and global.
It is not enough to check only immediate children.

## 3. The Invariant Lifecycle: Establish, Use, Preserve

The same discipline from accumulator invariants generalizes well:

1. Establish
Create initial values that satisfy the invariant.

2. Use
Rely on the invariant to simplify implementation.

3. Preserve
After every operation, produce a value that still satisfies the invariant.

For BST operations:

- empty constructor establishes invariant
- lookup exploits ordering to prune search
- insert/remove must preserve ordering recursively

## 4. Why Naked Functions Are Fragile

If the representation type is fully visible, any client can construct a shape-correct but invalid value.

Then even correct functions can behave unpredictably, because their precondition was silently violated.

So invariant preservation is not only about writing careful functions.
It is also about controlling who can create and modify values.

## 5. Local Checks vs Global Guarantees

A common mistake is replacing invariant design with scattered runtime checks.

Runtime checks are useful, but they do not replace a coherent invariant strategy.

Good approach:

- state one clear invariant
- design API so valid construction is easy and invalid construction is hard
- keep operations small and contract-driven

## 6. Writing Useful Invariant Statements

Strong invariant statements are:

1. Precise
No vague words like valid or sensible without definitions.

2. Testable
You can write checks for them in tests or assertions.

3. Operational
They are strong enough to support function implementations.

Weak:

```text
tree is well-formed
```

Strong:

```text
For every node n:
- all keys in n.left are < n.key
- all keys in n.right are > n.key
- n.left and n.right satisfy the same property
```

## 7. Practical Preservation Checklist

When writing an operation over invariant-bearing data:

1. State precondition invariant explicitly.
2. Handle base cases that trivially preserve invariant.
3. In recursive cases, assume recursive calls preserve invariant.
4. Rebuild results so the invariant still holds at the current level.
5. State postcondition invariant explicitly.

This mirrors proof by induction and keeps code and reasoning aligned.

## Summary

Invariants are global semantic guarantees.
They require:

- clear statements
- disciplined operation design
- and, crucially, ownership of construction and mutation paths

The next reading focuses on that ownership problem and how modules solve it.
