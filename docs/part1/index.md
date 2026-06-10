# RTH NOTE: this is a rough draft that we shouldn't bother editing until the part1 readings are all done so they can forward reference towards all of them in a coherent story.

# Part 1: Contracts and Safety

> Preventing bugs before programs execute.

You already know how to program, and you already know that programs go wrong. In CPSC 110 you learned to defend against mistakes through discipline: you documented each function's signature, you wrote examples before the body, and you followed the design recipes carefully. That discipline worked, but almost none of it was checked for you. A signature comment that said `Number -> String` was a promise you made to yourself, and the language would not notice if you broke it.

Part 1 is about moving as much of that discipline as possible into the language and tools, so that whole categories of bugs are caught *before the program ever runs*. Along the way we will be precise about which guarantees can be checked automatically, which must be validated by running the program, and which remain promises that careful programmers make to one another.

## Learning Objectives

Conceptual:

1. Explain why type checkers exist and how they prevent bugs before a program runs.
2. Explain how the design of types determines the structure of programs.
3. Describe the complementary roles of static checking and testing.
4. Distinguish structural correctness from semantic correctness.
5. Explain what contracts and invariants guarantee, and why maintaining an invariant requires controlling construction and updates.

Applied:

1. Translate problem descriptions into precise type definitions.
2. Declare function signatures with precise type information, and implement them using case analysis and recursion.
3. Derive tests from a specification using equivalence classes and boundary values.
4. Write contracts for functions and identify the invariants in a data model.
5. Use module boundaries to control how values are constructed and updated, and evaluate whether an API is sufficient to preserve its invariants.

## Types: Making Intent Checkable

The first and most powerful mechanism is the **type**. When we write programs, we represent information as data, and choosing that representation precisely is one of the most important design decisions we make. A well-designed type communicates *intent*: it tells the next reader (including future you) exactly which values are valid. And because TypeScript checks types with a compiler, that intent is *enforced*: passing the wrong kind of value, accessing a property that does not exist, or forgetting to handle a case becomes an error reported before the program runs, rather than a bug discovered after.

Types do more than catch mistakes. The shape of your data determines the shape of the code that processes it: data with distinct cases leads to code that analyses cases, and data with recursive structure leads to recursive code. Design the types well and the functions that operate on them become straightforward to write; design them poorly and the code will be muddled too. This connection between data design and code structure is a theme we will return to throughout the course.

<details class="tooltip link-110">
<summary>Discipline in CPSC 110</summary>

The ideas are not new—the enforcement is. In CPSC 110, a data definition like `; Score is Number[0, 100]` expressed exactly the kind of constraint we care about in this part. But nothing stopped you from constructing a `Score` of `150`; the comment relied entirely on every programmer reading and respecting it. Part 1 examines which of those constraints the language can now enforce for us, and what to do about the ones it cannot.
</details>

## Testing: Checking What Types Cannot

Types are checked statically, by reading the program text, and that is both their power and their limit. A type can guarantee that `letterGrade` returns a `string`; it cannot guarantee that the string is the *right* one. Whether a program behaves correctly is a dynamic question, and answering it requires actually running the code.

This is where **testing** comes in. Tests record the behavior a function should have and verify it on every run, catching the faults that no type checker can see—and catching them again, later, when a change quietly breaks something that used to work. Types and tests are not competitors; they patrol different territory, and Part 1 will show you how to use each where it is strong.

## Contracts and Invariants: Correctness Beyond Shape

Even together, types and tests leave a gap. Types are very good at describing *structure*: this object has these properties, this function accepts and returns these kinds of values. But many correctness properties are about *meaning*, not structure. A course grade must stay within 0–100. A binary search tree must keep every key in the left subtree smaller than the key at the node. A value can have exactly the right shape and still be nonsense.

To handle these we introduce two ideas. A **contract** is a precise behavioral description of a function: what it assumes about its inputs (its *preconditions*) and what it guarantees about its outputs (its *postconditions*). An **invariant** is a property of a data structure that must hold for every valid value, at all times. Contracts and invariants pick up where types leave off—they capture the semantic rules that make data meaningful, not merely well-shaped.

That raises an immediate question: if the language cannot check an invariant, who maintains it? The answer is that maintenance must be *owned*. If any code anywhere can construct or modify a value, then every such site is a chance to break its invariant. By controlling construction and updates through a trusted set of functions—a **module** boundary—we shrink the code responsible for an invariant from the whole program down to a few functions that can be carefully checked. This is our first encounter with *encapsulation*, an idea that will dominate the rest of the course.

<details class="tooltip deep-dive">
<summary>Why "safety"?</summary>

We call this part *Contracts and Safety* because the mechanisms in it share one goal: establishing guarantees that hold for **every** execution of the program, not just the executions we happened to observe. A passing test is evidence about particular runs; a type check, a contract, or a maintained invariant is a claim about all of them. Knowing which kind of assurance you hold—and which you merely hope for—is much of what separates engineering from optimism.
</details>

## Layered Correctness (This is really synthesis for this part; could be its own reading if needed)

The mechanisms above are not competing answers to the same question; they are layers of a single strategy, and each layer guards against a failure the others cannot see:

- **Types** establish what shapes of data are allowed.
- **Contracts** state what behavior each function assumes and promises.
- **Invariants** state what must remain true of the data at all times.
- **Tests** check whether those promises actually hold when the program runs.

No layer is sufficient on its own. A program can be perfectly typed and still compute the wrong answer; a contract can be precisely worded and silently violated; a test suite can pass while one overlooked corner of the program quietly fabricates invalid data. Remove a layer, and a specific kind of failure walks through the gap it leaves.

Ownership is what binds the layers together. Contracts and invariants are, in the end, still promises—and a team can write beautiful contracts and careful functions, then lose every guarantee by letting any code anywhere construct the data directly. Ownership turns local discipline into global reliability: when only a small, trusted set of functions can create and transform a value, preserving its invariant becomes enforceable rather than aspirational. This layered model is not just the story of Part 1; it is a frame the entire course keeps returning to.

<details class="tooltip deep-dive">
<summary>How guarantees fail</summary>

Four failure modes account for most broken guarantees, and each corresponds to a missing layer:

1. **Over-trusting types** — assuming that type-correct means semantically correct.
2. **Vague contracts** — wording like "valid" or "correct" with no explicit criteria, leaving a promise no one can check.
3. **Unowned representation** — exporting the raw shape of the data so clients can bypass the safe operations entirely.
4. **Happy-path tests** — checking typical outputs but never whether the invariants survive a sequence of operations.

When you find a bug that "should have been impossible," it is usually worth asking which of these four let it in.
</details>

## The Road Through Part 1

Part 1 begins by introducing TypeScript itself, scaffolding from the BSL you already know: where a concept is familiar we will point at its BSL counterpart, and where it differs we will call the difference out explicitly. From there the part follows the arc sketched above: designing precise types and the functions that operate on them; testing the dynamic behavior that types cannot reach; and writing the contracts, invariants, and module boundaries that protect meaning, not just shape.

Throughout Part 1 our programs stay small—small enough that one person can hold the whole design in their head, and small enough that personal discipline can plausibly maintain every promise the types cannot check. In Part 2 we will let go of that assumption and ask what happens when programs, teams, and lifetimes grow beyond what any individual can manage. When that happens, the ideas of Part 1 are not replaced—they are re-expressed. Data with distinct cases, handled here through case analysis, returns as class hierarchies; module-level ownership returns as class-level encapsulation; contracts return as the expectations and guarantees of methods. The vocabulary changes; the design logic does not.

