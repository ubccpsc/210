# Arrays and Iteration


CONTENT HERE

### WORKING NOTES:

NOTE: 

* Need to show how to instantiate arrays (use the syntactic sugar string[] since `Array<string>` requires `new` and we don't want to get there yet)
* We will start with `map`, `filter`, `reduce`, and `find` (call out that find returns `undefined` when nothing is found, and this is chosen intentionally instead of null) 
* Transition into `for of` loops to introduce iteration and contrast esp to filter and find; need a story for why iteration even exists if you can do everything with map/filter etc.


# Lecture 4: Abstraction with Arrays

## Before Lecture

In Lecture 2, we learned how to model sequences using a recursive data definition like `LinkedList<T>`. This allowed us to represent lists of any size and write functions that operate over them.

While this approach works well, it can become cumbersome—--each function requires us to explicitly follow the recursive structure. Because this pattern is so common, programming languages provide built-in ways to simplify it.

In this lecture, we'll see how **arrays provide an abstraction over this pattern,** allowing us to express the same ideas more directly.

📖 **Read:**

- [Abstract Patterns over Data](https://ubccpsc.github.io/210/part1/01-data/04-abstract_data_patterns.html)

💡 **As you read, think about:**

- Where does recursion appear in list-processing functions?
- What part of the pattern stays the same across different functions?
- What work does `map` do for you?

---

## In Lecture

We will:

- revisit recursive list processing and identify common patterns
- introduce arrays as a built-in representation of sequences
- connect recursive functions to `map`, `filter`, and `reduce`
- practice writing programs using these abstractions


---

## After Lecture

Arrays give us a powerful way to abstract over common patterns when working with sequences.

Previously, our data definitions gave us structure and safety—but we still had to explicitly write the recursive traversal in every function. With operations like `map`, `filter`, and `reduce`, we can often avoid writing the traversal explicitly and instead focus on what we want to compute for each element.

This is an important shift:

> from describing how to process a structure to describing what result we want to produce

As we move forward, we'll continue building on this idea of abstraction to organize more complex programs.