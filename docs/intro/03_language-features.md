# Uncovered Language Features

TypeScript is a large, full-featured industrial language. In this course we have taught you the main language features that will translate to most modern programming languages. But we have chosen to leave some aspects of the language out that either are not broadly available in all languages or can complicate learning more than their value is worth.

You will still meet the features below in other people's code, in library documentation, and in whatever a generative tool hands you. This chapter describes each one and gives the reason we have kept it out of the handbook, so you can recognise them without being surprised by their absence. Nothing here is required.

A high-level list of concepts we have intentionally decided not to talk about in this course include:

* Type inference
* Structural typing
* `enum`
* `any`
* Tuple return types
* `...`
* Truthiness
* `??`
* `instanceof`
* `switch`
* `break` and `continue`

## Type Inference

TypeScript can often work out a type without being told. The compiler reads the initialiser and infers the type of the name from it:

```typescript
const age = 30;              // inferred as number
const listener = "Alice";    // inferred as string
const isActive = true;       // inferred as boolean
```

Inference also flows through calls. Because `add` declares that it returns a `number`, the compiler knows what `result` holds:

```typescript
function add(a: number, b: number): number {
    return a + b;
}

const result = add(2, 3);   // inferred as number
result.toUpperCase();       // error: Property 'toUpperCase' does not exist on type 'number'
```

We annotate everything anyway. A parameter is the one place inference cannot help, because there is no initialiser to infer from, and the compiler settings used in this course reject an unannotated one outright:

```typescript
function greet(name) {           // error: parameter 'name' implicitly has an 'any' type
    return "Hello, " + name;     // the return type is still inferred, correctly, as string
}
```

Beyond that, a return type that is only inferred can change silently when the body changes, whereas one that is written down is a promise to callers, in the same way the doc comments in Part 1 record a contract. A written type is also a message to the next reader, who should not have to run the compiler to learn what a name holds. Finally, the habit transfers: most typed languages require the annotations that TypeScript merely permits.

There is one deliberate exception in the textbook. An arrow function passed to an array operation leaves its parameter unannotated, because the compiler already knows the element type of the array it is working on. That is a local convenience at a call site, not a change of policy about declarations.

Ultimately, while type inference decrease the amount of text you need to encode, type annotations make code easier for a person to read and understand. For this reason we will explicitly encode types as much as possible in this course.

## Structural Typing

TypeScript decides whether two types are compatible by comparing their _shape_, not their names. Two types with the same members are interchangeable:

```typescript
type Point = { x: number; y: number };
type Vector = { x: number; y: number };

const p: Point = { x: 1, y: 2 };
const v: Vector = p;             // allowed: Point and Vector have the same shape
```

A value also satisfies a type when it carries more properties than the type requires, but never when it carries fewer:

```typescript
type User = { name: string; email: string };

const extra = { name: "Alice", email: "alice@example.com", age: 30 };
const ok: User = extra;          // allowed: every required property is present

const partial = { name: "Bob" };
const bad: User = partial;       // error: property 'email' is missing
```

We leave this out because it is atypical. Most statically typed languages, Java and C# among them, work the other way: a value belongs to a type only if it was declared to, which is called _nominal_ typing. TypeScript's behaviour follows from JavaScript, where an object is simply a collection of properties and nothing records which type it was meant to be. Building your intuition on the structural rule would not transfer to the next language you learn. It also has a consequence we would rather not rely on: a class can satisfy an interface without ever declaring that it implements it. The handbook always writes `implements` regardless, because declaring the intent is what makes it visible to a reader.

## `enum`

An `enum` names a fixed set of related constants:

```typescript
enum Light {
    Red,
    Yellow,
    Green
}

const signal: Light = Light.Red;
```

By default the members are numbered from zero, so `Light.Red` is `0` and `Light.Green` is `2`. Members can also be given explicit values, most usefully strings:

```typescript
enum Light {
    Red = "red",
    Yellow = "yellow",
    Green = "green"
}
```

Part 1 models a fixed set of choices as a union of string literals instead, `type TrafficLight = "red" | "green" | "yellow"`, which does the same job with less machinery. An `enum` is also unusual among TypeScript's constructs in that it is not purely a type: it emits a real object into the compiled JavaScript, so it leaves a footprint at runtime where every other type we write is erased. A numeric enum's values are opaque once the program is running, too, since logging or storing `signal` yields `0` rather than anything that says "red", whereas a literal union's values are the strings you wrote. The literal union also composes with the tagged unions from the modelling chapter, where the `kind` property that distinguishes the cases is exactly such a set of literals.

## `any`

The `any` type turns the type checker off for a value. Anything may be assigned to it, and it may be used as anything:

```typescript
let value: any = 30;
value = "thirty";            // allowed: any accepts anything
value.toUpperCase();         // allowed at compile time; crashes at run time if value is a number
```

We *never* write any in this course, because it discards exactly the guarantee Part 1 is built on. The type checker is the mechanism that turns a promise into an enforced constraint, and `any` opts a value out of it while still looking like a type annotation. It also spreads: a value typed `any` makes every expression derived from it unchecked too, so a single `any` can quietly disable checking across a whole calculation. `any` exists so that large untyped JavaScript codebases can adopt TypeScript gradually, which is a real need and not one you have. When you are tempted to reach for it, the useful question is the modelling question from Part 1: what _are_ the values this name can hold?

## Tuple Return Types

A tuple type describes an array of fixed length in which each position has its own type. Its most common use is returning more than one value from a function:

```typescript
function minMax(values: number[]): [number, number] {
    let low = values[0];
    let high = values[0];
    for (const value of values) {
        if (value < low) {
            low = value;
        }
        if (value > high) {
            high = value;
        }
    }
    return [low, high];
}

const range = minMax([3, 9, 1]);
const low = range[0];        // 1, by position
const high = range[1];       // 9, by position
```

The positions carry no names, so a caller has to know from somewhere else that index `0` is the minimum and index `1` the maximum. Nothing in the type `[number, number]` says which is which, and because both are numbers the compiler cannot detect a caller that reads them in the wrong order. The failure is silent, and it is exactly the kind of mistake types are supposed to prevent.

Returning an object instead names each value, and the compiler checks the names:

```typescript
function minMax(values: number[]): { low: number; high: number } {
    // ... as above ...
    return { low: low, high: high };
}

const range = minMax([3, 9, 1]);
range.low;                   // named, and checked
range.lowest;                // error: property 'lowest' does not exist
```

This is the same argument the modelling chapter made for grouping related values into a compound type rather than passing them separately: the shape of the data should say what each part means. Tuples do earn their place when the positions are genuinely symmetric and conventional, a coordinate pair being the usual example, but a named type is rarely the worse choice.

## Spread and Rest (`...`)

The `...` notation copies the contents of one array or object into another, or gathers a variable number of arguments into an array:

```typescript
const more = [...songs, newSong];              // a new array: every song, then newSong
const updated = { ...config, port: 4000 };     // a new object, with port replaced

function logAll(...messages: string[]): void { // any number of arguments, collected
    for (const message of messages) {
        console.log(message);
    }
}
```

The spread forms are useful, but the copy it makes is _shallow_. `[...songs]` produces a new array holding the very same `Song` objects, so mutating one of those songs is still visible through both arrays. That distinction is the subject of the mutation chapter, and it is better addressed with explicit copying, where what is and is not duplicated stays visible. The rest form has a separate cost: a function that takes `...messages` no longer states how many arguments it expects, which is exactly the information its signature is supposed to give a caller.

## Truthiness

TypeScript inherits from JavaScript the rule that any value may be used where a condition is expected. An `if` does not require a `boolean`; it converts whatever it is given into one. Values that convert to `true` are called **truthy**, and those that convert to `false` are called **falsy**. The falsy values are few: `false`, `0`, `NaN`, `""` (the empty string), `null`, and `undefined`. Everything else is truthy, including an empty array and an empty object.

```typescript
if (songs.length) {          // runs when the length is anything but 0
    // ...
}

if (name) {                  // runs when name is not "", null, or undefined
    // ...
}
```

We write conditions that are already boolean instead: a comparison such as `songs.length > 0`, a call to a method that returns a `boolean` such as `isFull()`, or an explicit test against `null` or `undefined`. The `=== false` form you see throughout Part 1 comes from the same instinct.

The first reason is that a truthy test does not say what it is testing. `if (songs.length)` asks a reader to recall which numbers are falsy before they can tell what the branch means, whereas `if (songs.length > 0)` states the condition outright.

The second reason is that the falsy values include ones that are often perfectly legitimate, and then the shorthand is not a matter of style but a bug:

```typescript
/** Formats a temperature for display. */
function label(tempCelsius: number): string {
    if (tempCelsius) {
        return tempCelsius + " degrees";
    }
    return "unavailable";     // also returned for a genuine reading of 0
}
```

A reading of `0` is a real temperature, and this function reports it as missing. The same trap catches an empty string a user really did submit, and an array index of `0` that really did match. Each of those is a case the specification has an opinion about, and a truthy test quietly merges it with the absent case.

Finally, the habit is consistent with most other languages. Many languages, Java and C# among them, require a condition to be a boolean and reject `if (count)` outright, so writing the comparison is what they would have demanded of you anyway.

## Nullish Coalescing (`??`)

The nullish coalescing operator evaluates to its left operand unless that operand is `null` or `undefined`, in which case it evaluates to its right:

```typescript
function displayName(name: string | null): string {
    return name ?? "anonymous";
}
```

It is a narrower version of `||`, and the difference between them is the reason it exists. `||` falls back whenever its left operand is falsy in the sense just described, so a legitimate zero gets replaced by the default:

```typescript
const port = configuredPort ?? 3000;    // a configured 0 is kept
const wrong = configuredPort || 3000;   // a configured 0 becomes 3000
```

We leave it out because it is a shorthand for a check you can already write, and writing the check keeps the absent case where a reader can see it:

```typescript
if (name === null) {
    return "anonymous";
}
return name;
```

Part 1 treats a missing value as a case the specification usually has something to say about, which is why `null` and `undefined` are handled as explicit branches. `??` makes a fallback so cheap to write that it becomes easy to supply one without deciding whether the absent case deserved handling of its own. Its companion `?.`, called optional chaining, has the same character: `config?.host` produces `undefined` instead of throwing when `config` is absent, which is convenient and equally quiet about the case it just skipped.

## `instanceof`

The `instanceof` operator asks, at run time, whether an object was created from a particular class or from one of its subclasses. TypeScript uses the answer to narrow the type within the branch:

```typescript
if (channel instanceof SmsNotifier) {
    channel.wasDelivered();      // allowed: channel is known to be an SmsNotifier here
}
```

We leave it out because it undoes the move that Part 2 spends most of its chapters making. An `instanceof` chain over the implementations of an interface is the tag-switch in different syntax: the caller asks which concrete class it was handed and branches on the answer, which is the dependency on concrete types that the coupling chapter warns about, and the shape that the Open/Closed Principle replaces. When behaviour has to differ by kind, the difference belongs in a method that each class implements, so dispatch does the branching and no caller has to ask.

There are two reasonable exceptions, both of them cases where the type system has lost track of a value rather than a design having failed to commit. The first is a `catch` block, where the caught value has no useful type because anything at all can be thrown, so a handler that wants to read an error's `message` has to establish first that it has one. The error handling chapter sidesteps this by logging the whole caught value, but real handlers often need the narrowing. The second is the edge of the program, where data arrives from a file or a service and nothing about its type has been checked yet, which is a subject of Part 3.

## `switch`

A `switch` selects among cases of a single value:

```typescript
switch (light) {
    case "red":
        stop();
        break;
    case "green":
        go();
        break;
    default:
        slow();
}
```

Every `switch` can be written as the `if`/`else if` chain from the first chapter, so it adds a second construct for a job you can already do. It also brings a failure mode of its own: a case that omits `break` falls through into the next one and runs it too, which is legal, occasionally intended, and a classic source of bugs. The deeper reason is that a `switch` on a tag is usually a design smell rather than a syntax choice. Part 2 replaces exactly this shape with polymorphism, where each case becomes a class carrying its own behaviour and the branching disappears, so we would rather you learn to recognise the shape than get comfortable writing it.

## `break` and `continue`

Inside a loop, `break` leaves it immediately and `continue` skips to the next pass:

```typescript
for (const song of songs) {
    if (song.durationSeconds === 0) {
        continue;                  // skip this song
    }
    if (song.title === target) {
        break;                     // stop searching
    }
}
```

Both are convenient, and occasionally a `break` really is the clearest way to stop a search. We leave them out because a loop whose exit conditions all appear in its header is easier to reason about: you can read the header and know when the loop ends, without scanning the body for the statements that might end it early. Each `break` or `continue` also adds a path through the loop, and the testing chapters ask you to enumerate those paths in order to judge whether a suite covers them. In most cases where you would reach for one, the array operations from the iteration chapter express the intent directly: `find` stops at the first match, and `filter` skips the elements you do not want.
