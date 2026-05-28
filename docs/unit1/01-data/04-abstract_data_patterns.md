# Abstract Patterns over Data (Arrays)

In the previous readings, we modeled sequential data as a recursive union type, and wrote recursive functions to work with it:

```ts
type LinkedList<T> = Empty | NonEmpty<T>;
type Empty = { kind: "empty" };
type NonEmpty<T> = { kind: "non-empty"; head: T; tail: LinkedList<T> };

function length<T>(list: LinkedList<T>): number {
  if (list.kind === "empty") return 0;
  else return 1 + length(list.tail);
}

function map<T, U>(list: LinkedList<T>, f: (t: T) => U): LinkedList<U> { ... }
```

Patterns like this are common enough that TypeScript provides a built-in abstraction for sequential data—**arrays**—with the most common operations already included. This reading introduces arrays and the mechanism that makes them work: functions as object properties.

## A Note on Function Properties

So far, every object property we've used has held a data value—a number, string, boolean, or nested object. But a property can hold _any_ value, including a function:

```ts
const mathUtils = {
  double: (n: number) => n * 2,
  isEven: (n: number) => n % 2 === 0,
};
```

`mathUtils` is an ordinary object. Its `double` and `isEven` properties happen to hold functions instead of data.

You call a function property the same way you access any property—with dot notation—but you add parentheses and arguments to invoke it:

```ts
const result = mathUtils.double(5);  // 10
const check = mathUtils.isEven(4);   // true
```

Arrays provide these operations as part of the language.

> **Note:** We're introducing the mechanism here without exploring all its implications. When we reach object-oriented programming, we'll revisit what it means more deeply for behavior to "belong to" data.

## Arrays: TypeScript's Built-in List Abstraction

`Array<T>` is a generic type that represents a sequential list of elements all of type `T`. You can also write it as `T[]`—both mean the same thing.

An array literal uses square brackets:

```ts
type Song = { title: string; artist: string; durationSeconds: number };

const song1: Song = { title: "Song A", artist: "Artist 1", durationSeconds: 180 };
const song2: Song = { title: "Song B", artist: "Artist 2", durationSeconds: 200 };
const song3: Song = { title: "Song C", artist: "Artist 3", durationSeconds: 220 };

const playlist: Array<Song> = [song1, song2, song3];
```

Individual elements are accessed by their **index**, counting from zero:

```ts
const first = playlist[0];   // song1
const second = playlist[1];  // song2
```

The number of elements is stored in the `length` property—a data property, not a function, so no parentheses:

```ts
const count = playlist.length;  // 3
```

## Built-in Operations: `map`, `filter`, `reduce`

Arrays come with function properties that cover the most common list-processing patterns. These replace the recursive functions you would otherwise write by hand.

### `map`: transform each element

`map` applies a function to every element and returns a new array of the results:

```ts
const titles: Array<string> = playlist.map(song => song.title);
// ["Song A", "Song B", "Song C"]
```

Compare to the recursive version from the previous reading:

```ts
// What you'd write for LinkedList<T>:
function map<T, U>(list: LinkedList<T>, f: (t: T) => U): LinkedList<U> {
  if (list.kind === "empty") return { kind: "empty" };
  else return { kind: "non-empty", head: f(list.head), tail: map(list.tail, f) };
}
```

`Array.map` abstracts over the recursion. You supply only the per-element transformation; the traversal is handled for you.
If you compare these carefully, you’ll see that `Array.map` is performing exactly the same steps as the recursive version—it just hides the traversal.

### `filter`: keep elements that match a condition

`filter` returns a new array containing only the elements for which the given function returns `true`. The original array is unchanged:

```ts
const longSongs: Array<Song> = playlist.filter(song => song.durationSeconds > 190);
// [song2, song3]
```

### `reduce`: combine all elements into a single value

`reduce` is the most general of the three. It processes elements one at a time, carrying an **accumulator** value forward through each step:

```ts
const totalDuration: number = playlist.reduce(
  (total, song) => total + song.durationSeconds,
  0  // starting value of the accumulator
);
// 600
```

The first argument is the combining function—given the current accumulator and the current element, produce the next accumulator. The second argument is the accumulator's starting value.

This corresponds to the kind of accumulator pattern you might write as a recursive helper.

## Chaining Operations

Because `map` and `filter` each return a new array, you can chain them directly:

```ts
// Total duration of songs longer than 3 minutes
const result = playlist
  .filter(song => song.durationSeconds > 180)
  .reduce((total, song) => total + song.durationSeconds, 0);
// 420
```

Each step produces a value that the next step can operate on.

## The Abstraction Benefit

| Goal | Recursive approach | Array approach |
|------|--------------------|----------------|
| Transform each element | write `map` | `.map(f)` |
| Select a subset | write `filter` | `.filter(pred)` |
| Produce a single value | write recursive accumulator | `.reduce(f, init)` |

Arrays abstract over the recursion so you can focus on **what** you want to compute rather than **how** to traverse the list. This is a general principle in program design: once a pattern is understood and reliable, we package it up so it doesn't need to be re-derived every time.

## Summary

- Object properties can hold functions as well as data; you call them with dot notation and parentheses
- `Array<T>` (or `T[]`) is TypeScript's built-in sequential list type
- Elements are accessed by zero-based index; `length` gives the element count
- `map`, `filter`, and `reduce` are built-in function properties that replace hand-written recursive list traversals
- Operations can be chained since `map` and `filter` return new arrays

You'll learn more array operations in Lab 1.

<!--
(This will be in lab 1)
Spread operator
The spread operator is used to expand an array into its individual items.
It's written as ...

it can be used to make a copy of the array, or to add new items to the end
-->