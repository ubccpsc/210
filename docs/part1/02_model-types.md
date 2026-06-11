# Using Types to Model Problems

In the last reading we used types to annotate individual values: a parameter was a `number`, a function returned a `string`, and the compiler checked that we used them consistently. That is enough when a program passes around single, unrelated values, but real information rarely arrives one value at a time.

Consider a song. A song is not one value; it is a title, an artist, and a duration that only mean something together. With only primitive types we would carry these as three separate values and have to remember, everywhere, that they belong to the same song. Nothing would stop us from pairing one song's title with another's duration, or forgetting the duration entirely, or passing an artist where a title was expected (both are strings, so the compiler would stay silent). The information has a shape, and primitive annotations cannot capture it.

Other information cannot be expressed with primitives at all. A playlist is *either empty or a song followed by another playlist*: it has distinct cases, and it can be any length. No single `number` or `string` means "either nothing, or a song and then more songs."

This reading introduces the tools to describe information like this: **compound types** that group related values into one, model alternatives as distinct cases, and capture self-referential structure. Writing such a description down as a **data definition** does two things at once: it gives the program a shape to follow, and it lets the compiler hold us to that shape, catching whole classes of mistakes before the program runs. This is the data-definition design you practised in CPSC 110, now written directly in the language and checked by the compiler.

## Assigning Values to Names

Before we build values of any type, we need a way to name them. In TypeScript we assign a value to a name with `const`: the name comes first, then its type, then `=`, then the value.

```typescript
const courseName: string = "CPSC 210";
const credits: number = 4;
```

A name introduced with `const` cannot be reassigned to a different value later: `courseName` will always refer to that one string. Every value in this reading is named with `const`; names whose values are meant to change come later, when we look at mutation.

Two values are worth knowing from the start because they stand for the *absence* of a value: `null` and `undefined`. `null` represents a deliberate "no value here", such as the result of a lookup that finds nothing. `undefined` is the value a name has when nothing has been assigned to it yet. Each is its own type, and both become useful in combination with other types, as we will see when a function may or may not find a result.

```typescript
const noMatch: null = null;
const notSet: undefined = undefined;
```

<details class="tooltip deep-dive">
  <summary>Coming from BSL</summary>

This is the job `define` did in CPSC 110. Where you wrote `(define course-name "CPSC 210")` to bind a name to a value, TypeScript writes the same binding as `const courseName: string = "CPSC 210"`, adding a type annotation that the compiler checks.

</details>

## Modelling Information as Data

A **data definition** is a precise description of which values are allowed. Designing one is not guesswork; it follows a systematic process that turns a natural-language description of a problem into a type:

1. Identify the main entities
2. Identify any distinct cases
3. Determine what information each case needs
4. Translate into a TypeScript type
5. Write examples to check your model
6. Look for generalisation

The rest of this reading works through the examples below, from the simplest to the most involved. As we go we will meet the building blocks TypeScript provides: primitive values for atomic facts, restricted values for fixed choices, types that group related values together, unions for distinct cases, and self-reference for recursive structure.

<details class="tooltip deep-dive">
  <summary>Coming from BSL</summary>

This is the data-definition step of the design recipe from CPSC 110. There you described a class of values in a comment before writing any function; here you write the same description as a type the compiler can enforce, rather than a comment it ignores.

</details>

## Traffic Lights

> As a driver, I want the intersection's signal to be exactly one of red, yellow, or green, so that I always know whether to stop, slow down, or go.

1. **Entities:** the signal at an intersection.
2. **Cases:** it shows one of three colours: red, yellow, or green.
3. **Information per case:** none; a colour is a bare label that carries nothing beyond itself.
4. **Translate:** a value that is one of a fixed set of labels is exactly a union of string literals.
5. **Examples:** one valid colour, plus an invalid one to confirm the type is enforced.
6. **Generalisation:** none; a small enumeration stands on its own.

<details class="tooltip ts-tips">
  <summary>A union of literals</summary>

A union of literal values restricts a type to exactly those values. The `|` is read as "or":

```typescript
type TrafficLight = "red" | "green" | "yellow";

const light: TrafficLight = "red";   // ok
const broken: TrafficLight = "blue"; // error: "blue" is not a TrafficLight
```

Numbers work as literals too, so the same idea models any fixed set of values:

```typescript
type HttpStatus = 200 | 301 | 404 | 500;
```

</details>

## Shuffle Modes

> As a listener, I want to set playback to one of off, on, or repeat-one, so that I can control how my music is ordered.

A shuffle mode has the very same shape as a traffic light: one entity, with a small fixed set of label cases and no information attached to any of them (steps 1 to 3). It therefore translates to another union of string literals (step 4), and there is nothing to generalise (step 6).

<details class="tooltip ts-tips">
  <summary>Another literal union</summary>

```typescript
type ShuffleMode = "off" | "on" | "repeat-one";

const mode: ShuffleMode = "on"; // ok
```

</details>

## Songs

> As a listener, I want each song to carry its title, artist, and length, so that I can see what is playing and how long it will last.

### 1. Entities

The only entity here is a **song**.

### 2. Cases

A song has just one case: every song has the same shape, so there are no alternatives to distinguish.

### 3. Information per Case

A song carries three facts: a `title`, an `artist`, and a duration in seconds.

### 4. Translate

A song's facts belong together, so we describe their shape with a **type**, which lists named properties and their types. It helps to keep two words apart: a *type* describes a shape, but it is not itself a value. `Song` is the shape. An actual song is an **object**: a value that has that shape, an _instance_ of the type. We create an object by writing an **object literal**, listing the properties directly between braces; there is no `makeSong` function to call.

<details class="tooltip ts-tips">
  <summary>The `Song` type</summary>

```typescript
type Song = {
  title: string;
  artist: string;
  durationSeconds: number; // must be positive
};
```

The type cannot express that a duration must be positive, so we record that constraint in a comment and rely on tests to enforce it.

</details>

<details class="tooltip deep-dive">
  <summary>Coming from BSL</summary>

A `Song` type plays the role of a structure definition. Where CPSC 110 had `(define-struct song (title artist duration))` and built a value with `(make-song title artist duration)`, TypeScript describes the same grouping with a type and builds a value by writing an object literal directly.

</details>

### 5. Examples

An object is an instance of its type, and each object is its own independent value. Below, `song1` and `song2` are two separate songs that share the `Song` type.

<details class="tooltip ts-tips">
  <summary>Two `Song` objects</summary>

```typescript
const song1: Song = {
  title: "Song A",
  artist: "Artist 1",
  durationSeconds: 200
};

const song2: Song = {
  title: "Song B",
  artist: "Artist 2",
  durationSeconds: 180
};
```

</details>

### 6. Generalisation

A song is a single fixed shape, so there is nothing to generalise.

## Playlists

> As a listener, I want to build an ordered list of songs of any length, so that I can queue up exactly the music I want to hear.

This example builds on the `Song` type from above, and exercises every step in full.

### 1. Entities

The nouns give us a **playlist**, built from the **song** we just modelled.

### 2. Cases

A playlist has two distinct cases: it is empty or non-empty.

### 3. Information per Case

The empty case needs no information; knowing that it is empty is the whole story. The non-empty case needs two things: its first song, and the rest of the playlist after that song. That last piece, the rest, is itself a playlist, so this definition is **recursive**.

### 4. Translate

A playlist has cases, so we model it as a **tagged union**: a union of one type per case, where each case carries a shared **discriminator** property (here `kind`) set to a different constant. Checking the discriminator tells both us and the compiler which case we are in, and therefore which properties are available.

<details class="tooltip ts-tips">
  <summary>A tagged union for `Playlist`</summary>

```typescript
type Playlist = EmptyPlaylist | NonEmptyPlaylist;

type EmptyPlaylist = {
  kind: "empty";
};

type NonEmptyPlaylist = {
  kind: "songs";
  first: Song;
  rest: Playlist;
};
```

`EmptyPlaylist` carries no song data; `NonEmptyPlaylist` carries the first `Song` and the rest of the playlist. The `rest` property has type `Playlist` again, and that self-reference is what lets one type describe a playlist of any length.

</details>

Reading a `kind` back to recover which case you are looking at can feel indirect, since the case is something the value already is. A more direct mechanism becomes available once these definitions become classes, where we can ask an object what it is and let each kind carry its own behaviour. We return to this when we reach polymorphism in a later reading.

### 5. Examples

With the type written, we build concrete examples from the songs we already have. If they are easy to construct, the design fits; if they are awkward, the model is probably too complicated. These examples also become the data our tests run against later.

<details class="tooltip ts-tips">
  <summary>Example playlists</summary>

```typescript
const empty: Playlist = { kind: "empty" };

const oneTrack: Playlist = {
  kind: "songs",
  first: song1,
  rest: empty
};

const twoTracks: Playlist = {
  kind: "songs",
  first: song1,
  rest: { kind: "songs", first: song2, rest: empty }
};
```

Because an object is a value like any other, `oneTrack` reuses the `empty` object we already named rather than building a fresh one; only the new node in `twoTracks` has to be written out.

</details>

### 6. Generalisation

A playlist is one instance of a more general shape: a list of any element type. If a program needed lists of several different things, we would write that shape once and let it take the element type as a **parameter**, written in angle brackets.

<details class="tooltip ts-tips">
  <summary>Generic types</summary>

A type parameter lets one definition serve many content types:

```typescript
type LinkedList<T> =
  | { kind: "empty" }
  | { kind: "node"; head: T; tail: LinkedList<T> };
```

A playlist would then be a `LinkedList<Song>` and a leaderboard a `LinkedList<number>`. We keep the concrete `Playlist` from above so its `kind` labels stay readable, but it describes exactly the same values. Reach for generics only when you see real duplication; until then they add abstraction without benefit.

</details>

## Functions Follow Data Shapes

With the data defined, writing functions over it is far less open-ended than it first appears, because the structure of the code mirrors the structure of the data. The data definition provides a template: if the data has distinct cases, the function branches on the case; if the data is recursive, the function is recursive. This is why the modelling work pays off, as a precise data definition has already done much of the design of the functions that consume it.

<details class="tooltip deep-dive">
  <summary>Coming from BSL</summary>

This is the template step of the design recipe. In CPSC 110 the shape of a data definition dictated the shape of the function that consumed it: an itemisation became a `cond` with one clause per case, and a self-referential definition became a natural recursion. The same correspondence holds in TypeScript.

</details>

### Branching on the Case

When data has multiple cases, a function analyses which case it has and responds to each. We do this with a compound `if`/`else` chain: one branch per case, testing the discriminator for a tagged union, or the value itself for a union of literals.

Checking the discriminator also unlocks the case's data. This is called **type narrowing**: once you have tested that `p.kind === "songs"`, the compiler knows that `p.first` and `p.rest` exist and lets you use them, while preventing you from reaching for properties the other case does not have.

<details class="tooltip ts-tips">
  <summary>Branching with `if`/`else`</summary>

An `if`/`else` chain over a union of literals, one branch per value:

```typescript
function action(light: TrafficLight): string {
  if (light === "red") {
    return "stop";
  } else if (light === "yellow") {
    return "slow down";
  } else {
    return "go";
  }
}
```

The same idea on a tagged union, branching on `kind`. After the check, the matching case's properties are available:

```typescript
function firstTitle(p: Playlist): string | null {
  if (p.kind === "empty") {
    return null;
  } else {
    return p.first.title; // p.first is known to exist here
  }
}
```

</details>

### Recurring over the Structure

A recursive data definition leads to a recursive function. The function handles the base case directly (an empty playlist) and the recursive case by combining the first element with the result of calling itself on the rest. Because every value ends in the empty case, the recursion is guaranteed to terminate.

The same template solves a whole family of problems: counting elements, accumulating a total, and building a new structure all share the shape "handle empty, otherwise combine `first` with the recursion on `rest`."

<details class="tooltip ts-tips">
  <summary>Recursive functions over a `Playlist`</summary>

Counting and accumulating:

```typescript
function countSongs(p: Playlist): number {
  if (p.kind === "empty") {
    return 0;                       // base case
  } else {
    return 1 + countSongs(p.rest);  // recursive case
  }
}

function totalDuration(p: Playlist): number {
  if (p.kind === "empty") {
    return 0;
  } else {
    return p.first.durationSeconds + totalDuration(p.rest);
  }
}
```

Building a new playlist from an old one, here keeping only the longer songs:

```typescript
function keepLongSongs(p: Playlist, minSeconds: number): Playlist {
  if (p.kind === "empty") {
    return { kind: "empty" };
  } else if (p.first.durationSeconds >= minSeconds) {
    return { kind: "songs", first: p.first, rest: keepLongSongs(p.rest, minSeconds) };
  } else {
    return keepLongSongs(p.rest, minSeconds);
  }
}
```

The shape is not unique to lists. A tree branches into two recursive calls instead of one:

```typescript
type BinaryTree = Leaf | Branch;
type Leaf = { kind: "leaf"; value: number };
type Branch = { kind: "branch"; left: BinaryTree; right: BinaryTree };

function sum(tree: BinaryTree): number {
  if (tree.kind === "leaf") {
    return tree.value;
  } else {
    return sum(tree.left) + sum(tree.right);
  }
}
```

</details>

## What the Types Can Catch

Modelling the data this way is not just tidy; it changes what can go wrong. Because the types describe the exact shape of the information, the compiler rejects code that does not respect that shape, and it does so before the program ever runs.

<details class="tooltip ts-tips">
  <summary>Mistakes the compiler now catches</summary>

Given the `Song` and `Playlist` types, each of these is rejected at compile time:

```typescript
// a required field is missing
const bad1: Song = { title: "A", artist: "B" };
// error: property 'durationSeconds' is missing

// a field has the wrong type
const bad2: Song = { title: "A", artist: "B", durationSeconds: "200" };
// error: 'string' is not assignable to 'number'

// reaching for data the case may not have
function firstSong(p: Playlist): Song {
  return p.first;
  // error: 'first' does not exist on an empty playlist
}
```

Without the types, none of these would be caught until the program ran, if they were caught at all.

</details>

The types rule out whole categories of mistakes statically, but they cannot check that a function computes the *right* answer. For that we still write tests. As in CPSC 110, we use `checkExpect` to state what a call should produce and have it verified when the program runs.

<details class="tooltip ts-tips">
  <summary>Testing behaviour with `checkExpect`</summary>

Using the example playlists from above:

```typescript
checkExpect(countSongs(empty), 0);
checkExpect(countSongs(twoTracks), 2);
checkExpect(totalDuration(twoTracks), 380);
```

These run the functions and confirm they produce the expected values. The compiler guarantees the shapes line up; `checkExpect` guarantees the answers are right.

</details>

## The Centrality of Abstraction

A precise data definition is the foundation everything else rests on. It catches mistakes early, it mirrors the structure of the problem, and it drives the structure of the code that consumes it: once the data is modelled, the functions largely follow its shape. In this reading we followed one process across a sequence of examples, from a simple enumeration through a song to a recursive playlist, and then wrote functions whose shape follows the data's shape.

From here, Part 1 builds directly on this work: writing functions that are themselves generic, deriving tests from the structure of data, and leaning further on the type checker. Later, when we move to object-oriented programming, the tagged unions you wrote here become class hierarchies; the underlying ideas carry over even as the syntax changes.
