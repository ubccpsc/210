---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

# hero:
#   name: "CPSC 210 Course Reader"
#   actions:
#     - theme: brand
#       text: Markdown Examples
#       link: /markdown-examples
#     - theme: alt
#       text: API Examples
#       link: /api-examples

# features:
#   - title: Developing Language Fluency
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#     link: /00-introduction/00-overview
#   - title: Designing with Data
#     details: All programs consume and transform data. This topic introduces how to represent information as types and design functions of those types.
#     link: /01-data/00-overview
#   - title: Contracts and Invariants
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#     link: /02-contracts/00-overview
---

# Course Overview: Building from Fundamentals to OOP

This course is organized around one core belief:

Good software design starts with fundamentals.

We begin with precise data modeling and function design, then progressively add richer tools for managing complexity. The final destination is object-oriented programming (OOP), presented as a powerful way of organizing the same core ideas at larger scales.

## How to use the reader effectively

TBD

## Why This Course Is Structured This Way

The course emphasizes design ideas that transfer across features and paradigms:

- represent information precisely
- derive code structure from data structure
- reason about correctness with contracts and tests
- control complexity through abstraction and modularity

This gives you a durable model of programming that supports both language fluency and software design.

## The Arc of the Course

### 1. Types and Data-Oriented Design

We start by modeling information with types.
You will learn how unions, objects, recursion, and generics shape both your data and your functions.

Key outcome:
you can move from a problem description to a clear data model and a correct function structure.

### 2. Built-In Abstractions over Common Patterns

Once patterns become common, we do not keep rewriting them from scratch.
You will see how arrays and their operations (`map`, `filter`, `reduce`) package recurring list-processing patterns.

Key outcome:
you recognize when to use language abstractions to reduce boilerplate while keeping the design clear.

### 3. Testing and Behavioral Reasoning

Types catch many mistakes, but not all semantic errors.
You will learn to derive tests systematically from data structure, boundaries, relationships, and expected outcomes.

Key outcome:
you can justify test suites based on the specification rather than guesswork.

### 4. Contracts, Invariants, and Ownership

As systems grow, we need stronger guarantees about behavior and state.
You will learn how contracts describe function behavior, invariants capture always-true properties, and module boundaries help preserve those invariants.

Key outcome:
you can design APIs that make correct usage easier and incorrect usage harder.

### 5. Mutation and State

Not all problems are naturally solved with immutable transformations.
You will study when mutation is useful, what risks it introduces, and how to manage those risks with disciplined design.

Key outcome:
you can reason about changing state without losing correctness.

### 6. Object-Oriented Programming

Finally, we transition to OOP.
This style can represent certain problem domains more directly and can scale more naturally to larger systems with long-lived state and interacting components.

Crucially, OOP is built on the same fundamentals from earlier in the course:

- data modeling still matters
- contracts still matter
- invariants still matter
- testing still matters

Key outcome:
you understand OOP as a principled extension of foundational design ideas, not as a disconnected set of features.

## What You Should Expect

By the end of the course, you should be able to:

1. Design data and functions from clear specifications.
2. Use type information to guide implementation decisions.
3. Build meaningful tests for behavioral correctness.
4. Enforce correctness with contracts and invariants.
5. Choose between functional and object-oriented organization based on the problem.

Throughout the course, you will learn language features in the context of design decisions.
The goal is to build a durable toolkit that works across languages, paradigms, and larger software systems.



