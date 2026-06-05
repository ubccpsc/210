# Modelling Information as Data

A data definition is a precise description of what values are allowed.

The following process gives concrete steps for translating a natural language description of a problem into a data definition.

1. Identify the main entities
2. Identify distinct cases
3. Determine which information each case needs
4. Look for recursive structure
5. Translate into a data definition using `type`
6. Write examples to check your understanding
7. Look for generalization

The following sections go into additional detail for each step.
A running example is given to illustrate each step based on the following description in the music playing domain:

"A playlist is either empty or a song followed by another playlist"

## Step 1: Identifying Entities

Read through the description to identify nouns. These are good candidates for the entities that will populate your model.

In the example above, `playlist` and `song` are nouns that we will represent as entities.

## Step 2: Identifying Distinct Cases

Are there different kinds of the entity? Sometimes a single entity may have different representations or "cases."

Some key signal words to look for are: **one of**, **either**, **or**, **sometimes**, **can be**.

In our example, the phrase "A playlist is **either empty or** a song followed by another playlist" immediately signals two distinct cases:

- **Case 1**: An empty playlist
- **Case 2**: A playlist with at least one song (and more playlists after)

These are fundamentally different-—an empty playlist has no songs, while the other case always has at least one. This distinction is crucial for how we'll write code to process playlists.

## Step 3: Determining which information each case needs

For each distinct case, identify what information is needed to fully describe that case.

In our playlist example:

- **Empty case**: No information needed-—we just need to know it's empty.
- **Non-empty case**: We need:
  - The first song (which itself needs a title, artist, duration, etc.)
  - The rest of the playlist (which could itself be empty or have more songs)

Notice that the "rest of the playlist" is just another playlist. This is a hint that recursion is involved.

## Step 4: Identifying recursive structure

Does an entity refer to itself? Can the problem be decomposed into smaller instances of the same problem?

In our example, "a song followed by **another playlist**" explicitly mentions a playlist again. This means:

- A non-empty playlist contains a song **and another playlist**
- That second playlist could itself be empty or non-empty
- If it's non-empty, it contains a song and yet another playlist
- And so on...

This self-referential structure is **recursion**. Without recursion, we could only represent fixed-length lists. With recursion, we can represent lists of any length.

To indentify recursion in a problem, look for:

- Explicit self-reference in the description ("...followed by another [entity]")
- Phrases suggesting decomposition ("...of which each contains...")
- Examples that build from smaller pieces

## Step 5: Express as TypeScript Data Types

Now that we understand the structure of our data, we translate it into TypeScript types. TypeScript provides several tools for this:

<!--NCB: should introduce const and type keywords-->
<!--NCB: null should be introduced as well: it is both a type and a value-->

### 1. Simple Atomic Values

The building blocks are primitive types: number, string, boolean.

```ts
const age: number = 10;
const name: string = "John";
const isAbsent: boolean = true;
```

For our playlist definition, songs need atomic values:

- `title: string`—--the song's name
- `artist: string`—--who wrote/performed it
- `durationSeconds: number`—--how long it plays

### 2. Restricted Values

Sometimes a value isn't just "any string" or "any number"-—it's restricted to specific values.

#### Enumerations: Fixed set of values

When a value can only be one of a few specific choices, use a union of literals:

```ts
type TrafficLight = "red" | "green" | "yellow";

const light: TrafficLight = "red";  // ✓
const invalid: TrafficLight = "blue";  // ✗ Type error
```

The `|` operator means "or"--—a `TrafficLight` must be one of these three exact strings. Numbers and booleans work too:

```ts
type HttpStatus = 200 | 301 | 404 | 500;
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;  // Sunday through Saturday
```

For playlists, we could restrict shuffle modes:

```ts
type ShuffleMode = "off" | "on" | "repeat-one";
```

#### Intervals and Constraints

While TypeScript doesn't have built-in interval types, we can document constraints with comments:

```ts
/**
 * Duration in seconds. Must be positive.
 */
type Duration = number;

/**
 * A percentage between 0 and 100.
 */
type Percentage = number;
```

### 3. Structured Data: Objects  <!--Or is it Compound Data-->

When you need to group related values together, use an object type:

```ts
type Song = {
  title: string;
  artist: string;
  durationSeconds: number;
};

const song: Song = {
  title: "Blinding Lights",
  artist: "The Weeknd",
  durationSeconds: 200
};
```

An object is a collection of named properties. The type specifies what properties exist and what type each property must be.

<!--Move optional properties somewhere else-->
**Optional properties** are marked with `?`:

```ts
type Song = {
  title: string;
  artist: string;
  durationSeconds: number;
  featuringArtist?: string;  // optional
};

// Both of these are valid:
const solo: Song = { title: "A", artist: "B", durationSeconds: 180 };
const featured: Song = { title: "A", artist: "B", durationSeconds: 180, featuringArtist: "C" };
```

### 4. Variant Data: Tagged Unions (Discriminated Unions)

When an entity has **distinct cases** (from Step 2), use a union type with a discriminator property:

```ts
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

The `kind` property is the **discriminator**-it tells us which case we're looking at. Notice:

- `EmptyPlaylist` has `kind: "empty"` (no song information needed)
- `NonEmptyPlaylist` has `kind: "songs"` (includes the first song and the rest)

When you receive a `Playlist`, you check the `kind` to know which properties are available:

```ts
function getFirstSong(p: Playlist): Song | null {
  if (p.kind === "empty") {
    return null;  // No first song
  } else {
    // p.kind === "songs"
    return p.first;  // We know `first` exists here
  }
}
```

This pattern is called a **discriminated union** or **tagged union**. It's the idiomatic way in TypeScript to handle multiple cases because:

1. The type checker can verify you handle every case
2. The type checker knows which properties are available in each branch
3. The code is clear and easy to read

### 5. Recursive Data

A type can refer to itself:

```ts
type Playlist = EmptyPlaylist | NonEmptyPlaylist;

type NonEmptyPlaylist = {
  kind: "songs";
  first: Song;
  rest: Playlist;  // ← refers back to Playlist!
};
```

This allows `Playlist` to represent lists of any length:

- An empty playlist: `{ kind: "empty" }`
- A playlist with 1 song: `{ kind: "songs", first: song1, rest: { kind: "empty" } }`
- A playlist with 2 songs: `{ kind: "songs", first: song1, rest: { kind: "songs", first: song2, rest: { kind: "empty" } } }`
- And so on...

**Why recursion matters**: Without recursion, we'd need separate types for "playlist of 1 song," "playlist of 2 songs," etc. With recursion, one type handles any length.


## Step 6: Check your model with examples

Once you've written your types, create some concrete examples to verify they capture what you intend.

```ts
// Define a reusable Song example
const song1: Song = { title: "Song A", artist: "Artist 1", durationSeconds: 200 };
const song2: Song = { title: "Song B", artist: "Artist 2", durationSeconds: 180 };

// Empty playlist
const empty: Playlist = { kind: "empty" };

// Playlist with one song
const oneTrack: Playlist = {
  kind: "songs",
  first: song1,
  rest: { kind: "empty" }
};

// Playlist with two songs
const twoTracks: Playlist = {
  kind: "songs",
  first: song1,
  rest: {
    kind: "songs",
    first: song2,
    rest: { kind: "empty" }
  }
};
```

Creating examples serves multiple purposes:
1. **Validates your type design** — If you can't easily create examples, your types might be overcomplicated
2. **Catches mistakes early** — You might discover missing properties or incorrect restrictions
3. **Documents usage** — Examples show how to correctly use your types
4. **Serves as test data** — These examples can be used in tests later

## Step 7: Look for Generalization

Often, you'll find that several types have the same structure, just with different content. TypeScript's **generics** let you define a type once and reuse it.

### Generics: Parameterized Types

A generic type is a type that takes other types as parameters. The most common example is a list or container:

```ts
// A pair of any two types
type Pair<A, B> = {
  first: A;
  second: B;
};

const stringPair: Pair<string, string> = { first: "hello", second: "world" };
const mixedPair: Pair<string, number> = { first: "age", second: 30 };
```

For playlists, if we want to support playlists of different item types, we could generalize:

```ts
type LinkedList<T> = Empty | NonEmpty<T>;

type Empty = {
  kind: "empty";
};

type NonEmpty<T> = {
  kind: "non-empty";
  head: T;
  tail: LinkedList<T>;
};
```

Now we can create playlists of songs, numbers, or anything else:

```ts
type Playlist = LinkedList<Song>;
type NumberList = LinkedList<number>;
type StringList = LinkedList<string>;
```

### When to use generics

Generics are useful when:
- You have code that operates on the **structure** of data, but doesn't care about the **content**
- Multiple types would have identical definitions except for one or two property types
- You want to build reusable data structures

Don't overuse generics—they add complexity. Use them when you notice a clear pattern of duplication.

### Note on OOP progression

In later modules, we'll see that **discriminated unions** (Step 4) are the functional programming way of handling multiple cases. When we transition to object-oriented programming, these will become **class hierarchies**. The concepts remain the same, but the syntax changes.

---

## Summary

A good data definition:
1. **Is precise** — It describes exactly what values are allowed, catching mistakes early
2. **Reflects the problem** — The structure of your type mirrors the structure of the domain
3. **Drives the code** — Once your types are defined, writing the functions that operate on them becomes straightforward
4. **Is reusable** — Through generics and composition, you can build increasingly sophisticated data structures from simple pieces