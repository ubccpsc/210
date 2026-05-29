# Designing Tests from Data and Functions

Types tell us what values are allowed. They do not, by themselves, tell us that a function behaves correctly.

That is why we still need tests.

The good news is that tests do not have to be guessed. If you read the specification carefully and look at the data definition, the important cases usually reveal themselves.

## Why This Matters

A test suite should do more than check the happy path. It should make visible the cases that matter in the domain:

- different input shapes
- boundary values
- conditions that change behavior
- relationships between inputs
- different possible outcomes

The point is not to test everything. The point is to test the distinctions that matter.

This reading gives us a course-wide way of thinking about those distinctions.

## Input Partitioning

The first and most common source of tests is the structure of the input itself.

If a type has multiple cases, those cases usually deserve separate tests. If a type is recursive, you usually want at least one test for the base case and one for a recursive case. If an object has properties that affect behavior, those properties often suggest additional partitions.

This is the idea behind **input partitioning** and **equivalence class partitioning**: group inputs that should behave the same way, then choose at least one representative from each group.

For example, a `Playlist` has a different shape when it is empty than when it has songs. Those are different input partitions, and both should be tested.

## Boundary Value Analysis

Some bugs only show up at the edges.

That is why we also look for **boundary values**: values that are just inside, just outside, or exactly on a meaningful boundary.

This matters for numbers, sizes, balances, lengths, and any other domain with limits. If a function accepts a number of songs, then `0`, `1`, and a larger number may all deserve separate tests. If a function only works for a natural number, then a value just below the valid range may be just as useful as a value in the middle.

Input partitioning and boundary value analysis usually work together. Partitions tell us which regions matter; boundaries tell us where those regions are most likely to fail.

## Output Partitioning

Sometimes the interesting distinctions are not in the input, but in the output.

That is when **output partitioning** helps. Instead of asking only what goes in, we also ask what distinct results can come out.

This is especially useful for functions that can succeed or fail, return different shapes of values, or produce special-case outputs. If the result space has meaningful cases, those cases should be represented in the test suite too.

## Relationships and Decisions

Not every test comes from a partition of a single input.

Some functions depend on relationships between inputs: whether a key is present, whether one value matches another, or whether a quantity stays within another quantity. Other functions make decisions internally, so each branch in the function should be reflected in the tests.

These are the tests that remind us the specification is about behavior, not just shape.

## Worked Example: Searching a BST

Suppose we are testing this function:

Suppose we are testing this function:

```ts
function has<T>(tree: BST<T>, key: number): boolean {
	if (tree === null) {
		return false;
	}
	if (key === tree.key) {
		return true;
	}
	return key < tree.key ? has(tree.left, key) : has(tree.right, key);
}
```

The input partitions come from the data structure: the tree might be empty, it might have one node, or it might have several nodes.

The boundary values come from the ordering behavior: a searched key might match the root, be smaller than the root, or be larger than the root. If the key is present, it might be found in the left subtree or the right subtree.

The output partition is also simple but important: `has` returns either `true` or `false`. Both outcomes need to appear in the test suite.

Here is one small test set that covers those distinctions:

```ts
const empty = bst.empty<string>();
const tree = bst.insert(bst.insert(bst.insert(empty, 3, "root"), 1, "left"), 5, "right");

test("has returns false on empty tree", () => {
	checkExpect(bst.has(empty, 3), false);
});

test("has finds the root key", () => {
	checkExpect(bst.has(tree, 3), true);
});

test("has finds a key in the left subtree", () => {
	checkExpect(bst.has(tree, 1), true);
});

test("has finds a key in the right subtree", () => {
	checkExpect(bst.has(tree, 5), true);
});

test("has returns false for a missing key", () => {
	checkExpect(bst.has(tree, 4), false);
});
```

The important thing is not the exact tree. The important thing is that each test stands for a real distinction in the specification.

## Choosing Representative Tests

A good representative test is small, clear, and meaningfully different from the others.

For recursive data, a very common pattern is to test:

- the empty case
- the smallest non-empty case
- a larger case

That often catches structural mistakes quickly.

For bounded numeric data, a good test set often includes:

- a value below the boundary
- a value exactly on the boundary
- a value above the boundary

For functions with multiple outcomes, try to cover each one at least once.

## Common Mistakes

One common mistake is testing only the happy path. That can make a test suite look complete even when it misses the cases most likely to fail.

Another mistake is leaning too heavily on random tests. Random tests can be helpful, but they are not a substitute for deliberate case selection.

A third mistake is forgetting recursive structure. One non-empty example is often not enough for a recursive function. Base cases and deeper recursive cases both matter.

Finally, it is easy to test what feels convenient instead of what the specification actually promises. Good tests follow the spec, not just the implementation.

## A Practical Habit

When you write tests, keep this short checklist in mind:

1. What input shapes matter?
2. What boundaries matter?
3. What relationships between inputs matter?
4. What outcomes matter?
5. What small examples cover those distinctions?

If you can answer those questions, you usually have enough to build a solid test suite.

## Summary

Your data definition tells you not only how to write your code, but also what tests you need.

The course-wide habit is to derive tests from the specification and the data:

- look for structure
- look for boundaries
- look for relationships
- look for distinct outcomes
- choose small representative examples

We will keep using this way of thinking throughout the course, especially as the programs become more complex.