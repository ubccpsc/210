# Designing Functions that Operate on Data

Once you've designed your data types, writing the functions that operate on them becomes straightforward. The structure of your data directly determines the structure of your code.

## Principle: Structure-Driven Design

The key insight is this: **the code structure mirrors the data structure**.

- If your data has distinct cases, your code uses `switch` or `if`/`else` to handle each case
- If your data is recursive, your code uses recursion to process it
- If your data is generic, your functions are generic

This makes code natural to write and easy to understand—there's no guesswork.

## Case Analysis with `switch` and `if`/`else`

When your data has multiple cases (discriminated unions), you analyze which case you have and respond accordingly.

### Simple example with enums

```ts
type TrafficLight = "red" | "green" | "yellow";

function action(light: TrafficLight): string {
  switch (light) {
    case "red":
      return "stop";
    case "yellow":
      return "slow down";
    case "green":
      return "go";
  }
}
```

TypeScript's type checker ensures you've handled all cases. If you forget a case or add a new case without updating this function, you'll get a type error.

### Case analysis on tagged unions

With more complex data (tagged unions), you check the discriminator property:

```ts
type Playlist = EmptyPlaylist | NonEmptyPlaylist;

type EmptyPlaylist = { kind: "empty" };
type NonEmptyPlaylist = { kind: "songs"; first: Song; rest: Playlist };
type Song = { title: string; artist: string; durationSeconds: number };

function getLength(p: Playlist): number {
  switch (p.kind) {
    case "empty":
      return 0;
    case "songs":
      return 1 + getLength(p.rest);  // Notice: also recursive!
  }
}
```

Or with `if`/`else`:

```ts
function getFirstSongTitle(p: Playlist): string | null {
  if (p.kind === "empty") {
    return null;
  } else {
    return p.first.title;
  }
}
```

**Type narrowing**: Once you check `p.kind === "songs"`, TypeScript knows that `p.first` and `p.rest` exist. The type checker prevents accessing properties that don't exist in that branch.

## Recursion Over Data

When your data is recursive, your functions often are too.

### Simple recursion: count elements

```ts
function countSongs(p: Playlist): number {
  if (p.kind === "empty") {
    return 0;  // Base case: empty list has 0 songs
  } else {
    return 1 + countSongs(p.rest);  // Recursive case: 1 + count of the rest
  }
}

const myPlaylist: Playlist = {
  kind: "songs",
  first: { title: "A", artist: "B", durationSeconds: 180 },
  rest: {
    kind: "songs",
    first: { title: "C", artist: "D", durationSeconds: 200 },
    rest: { kind: "empty" }
  }
};

console.log(countSongs(myPlaylist));  // 2
```

### Recursion with accumulation: sum values

```ts
function totalDuration(p: Playlist): number {
  if (p.kind === "empty") {
    return 0;
  } else {
    return p.first.durationSeconds + totalDuration(p.rest);
  }
}
```

### Recursion that transforms data: extract all titles

```ts
function getAllTitles(p: Playlist): string[] {
  if (p.kind === "empty") {
    return [];  // Base case: no titles
  } else {
    return [p.first.title, ...getAllTitles(p.rest)];  // Current title + titles from rest
  }
}
```

### Recursive case analysis: handling nested structure

Sometimes you need to do case analysis at each level of recursion:

```ts
type BinaryTree = Leaf | Branch;
type Leaf = { kind: "leaf"; value: number };
type Branch = { kind: "branch"; left: BinaryTree; right: BinaryTree };

function sum(tree: BinaryTree): number {
  if (tree.kind === "leaf") {
    return tree.value;  // Base case: leaf is just a value
  } else {
    return sum(tree.left) + sum(tree.right);  // Recursive case: sum both subtrees
  }
}
```

## Generic Functions

When your data types are generic, your functions often are too.

### Example: a generic length function

```ts
type LinkedList<T> = Empty | NonEmpty<T>;
type Empty = { kind: "empty" };
type NonEmpty<T> = { kind: "non-empty"; head: T; tail: LinkedList<T> };

// This function works on LinkedList of ANY type T
function length<T>(list: LinkedList<T>): number {
  if (list.kind === "empty") {
    return 0;
  } else {
    return 1 + length(list.tail);
  }
}

// Works for a list of numbers:
const numbers: LinkedList<number> = {
  kind: "non-empty",
  head: 10,
  tail: { kind: "non-empty", head: 20, tail: { kind: "empty" } }
};
console.log(length(numbers));  // 2

// Works for a list of strings:
const words: LinkedList<string> = {
  kind: "non-empty",
  head: "hello",
  tail: { kind: "non-empty", head: "world", tail: { kind: "empty" } }
};
console.log(length(words));  // 2
```

Notice that `length` doesn't care what `T` is—it only cares about the structure of `LinkedList<T>`.

### Generic functions with operations

```ts
// Transform each element
function map<T, U>(list: LinkedList<T>, f: (t: T) => U): LinkedList<U> {
  if (list.kind === "empty") {
    return { kind: "empty" };
  } else {
    return {
      kind: "non-empty",
      head: f(list.head),
      tail: map(list.tail, f)
    };
  }
}

// Usage:
const doubled = map(numbers, (n) => n * 2);
const uppercased = map(words, (w) => w.toUpperCase());
```

### When to use type parameters

Type parameters (`<T>`, `<A, B>`, etc.) are useful when:
- Your function operates on the **structure** of data, not its contents
- You want to write the function once and use it with many types
- The function doesn't need to inspect or manipulate the wrapped type

## Pattern: Case Analysis Followed by Recursion

Very often, you combine both patterns:

```ts
type Expr = Num | Add | Mul;
type Num = { kind: "num"; value: number };
type Add = { kind: "add"; left: Expr; right: Expr };
type Mul = { kind: "mul"; left: Expr; right: Expr };

// Evaluate a mathematical expression
function evaluate(expr: Expr): number {
  switch (expr.kind) {
    case "num":
      return expr.value;  // Case 1: just return the number
    case "add":
      return evaluate(expr.left) + evaluate(expr.right);  // Case 2: recursively evaluate both sides
    case "mul":
      return evaluate(expr.left) * evaluate(expr.right);  // Case 3: recursively evaluate both sides
  }
}

// Usage:
const expression: Expr = {
  kind: "add",
  left: { kind: "num", value: 3 },
  right: { kind: "mul", left: { kind: "num", value: 4 }, right: { kind: "num", value: 5 } }
};
console.log(evaluate(expression));  // 3 + (4 * 5) = 23
```

This pattern—case analysis at each level, with recursion to handle sub-structures—is fundamental to working with recursive data types.

---

## Summary

Writing functions to operate on data is straightforward when your types are well-designed:

1. **Case analysis** — Use `switch` or `if`/`else` to handle each case in a union
2. **Recursion** — Structure your recursive functions to mirror your recursive data
3. **Generics** — Write functions that work on the structure, parameterized over content
4. **Combine** — Most functions use case analysis + recursion together

The type structure drives the code structure, making correct implementations natural to write.
