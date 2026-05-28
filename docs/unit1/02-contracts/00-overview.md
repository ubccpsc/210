# Contracts and Invariants

In the previous section, we used types to model data precisely and guide program design.
That was a major step forward, but it is not the whole story.

In this section, we ask a harder question:

How do we guarantee that values are not only the right shape, but also semantically valid?

## Why This Section Exists

TypeScript types are very good at describing structure:

- this object has these properties
- this value is one of these union cases
- this function accepts and returns these types

But many correctness properties are about meaning, not just structure.

Example:

- A binary search tree must satisfy ordering constraints for every node.
- A bank account balance might be required to stay non-negative.
- A course grade might be constrained to the range 0-100.

These constraints are called invariants.

## Running Example: BST

This module uses binary search trees as a running example.

Core BST invariant:

- all keys in the left subtree are less than the node key
- all keys in the right subtree are greater than the node key

A value can have the right object shape and still break this invariant.
That is exactly the gap between type correctness and semantic correctness.

## The Big Ideas

This section introduces four connected ideas:

1. Limits of types
Types capture shape, but not every semantic rule.

2. Contracts
Functions need precise behavioral descriptions: assumptions and guarantees.

3. Invariants
A data structure should maintain a predicate that is always true for valid states.

4. Ownership through modules
If invariants matter, creation and updates must be controlled through a trusted API.

## Learning Objectives

Conceptual:

1. Distinguish structural correctness from semantic correctness.
2. Explain what a contract is and why it complements types.
3. Explain invariants as global guarantees over data.
4. Explain why invariant ownership requires encapsulation.

Applied:

1. Write contracts for selected functions.
2. Identify invariants in a given data model.
3. Use module boundaries to control construction and update operations.
4. Evaluate whether an exported API is sufficient to preserve invariants.

## Connection to Course Direction

This module is the bridge from pure shape-based modeling to disciplined program design.

Later, when we move toward object-oriented design, we will revisit the same ideas:

- contracts become method-level expectations and guarantees
- invariants become class invariants
- module ownership becomes object ownership

The vocabulary changes; the design logic does not.