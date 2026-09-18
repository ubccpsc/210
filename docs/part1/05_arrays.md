# Arrays and Iteration

It is common for programs to work with data represented as a _sequence_. The messages in an inbox, the transactions on an account, the students in a course, the readings from a sensor all naturally lend themselves to be a sequence of items. Because sequences are so common, most programming languages provide a built-in data structure for them. This is called an **array**, an ordered collection of elements that can be accessed by position. C, Java, Rust, Python, and TypeScript all provide arrays (Python calls them lists), and every language has similar features for working with them.

We have already hand-built a mechanism for tracking a sequence. In [Using Types to Model Problems](./02_model-types) we defined a recursive `Playlist` and wrote a recursive function every time we wanted to count, total, or search it. That worked, but we had to re-write the same traversal pattern in every function. Since sequences are so common, languages provide support for the most common traversal patterns.

In TypeScript, arrays come with the traversal operations already written for transforming, selecting, and searching sequences. This chapter introduces arrays, those built-in operations, and then iteration, the general mechanism underneath them all.

## A Day of Temperature Readings

This chapter uses a single running example:

> As a weather-station operator, I want to summarise a day of hourly temperature readings, so that I can publish accurate daily reports without computing them by hand.

Each weather reading records the hour it was taken and the temperature at that time. The day's weather data is a sequence of these readings.

```typescript
type Reading = {
  // invariant: a whole number, 0 <= hour <= 23
  hour: number;
  tempCelsius: number;
};
```

## Creating and Accessing Arrays

An array is denoted by appending `[]` to the element type: `Reading[]` is an array of `Reading` objects. An array is created with an **array literal**: the elements, separated by commas, between square brackets.

```typescript
// create an array containing 6 Reading elements
const day: Reading[] = [
    { hour: 6,  tempCelsius: -4 },
    { hour: 9,  tempCelsius: -1 },
    { hour: 12, tempCelsius: 3 },
    { hour: 15, tempCelsius: 8 },
    { hour: 18, tempCelsius: 2 },
    { hour: 21, tempCelsius: -2 }
];

// create an empty array
const empty: number[] = [];
```

<details class="tooltip ts-tips">
<summary>Array Types and Literals</summary>

The type `X[]` designates an array of elements of type `X`. `X[]` can also be written `Array<X>`. The two notations mean the same type, the second using the generics syntax from [Chapter 2](./02_model-types). In this course we use the shorter and more common `X[]` form.


An array literal is an expression:
```typescript
[<expression-1>, <expression-2>, <expression-3>]
```

which creates an array with `<expression-i>` as the `i`-th element. It can contain any number of elements, including zero.

</details>

<details class="tooltip link-110">
<summary>Lists in ISL</summary>

The array literal plays the role of `list` from CPSC 110: `[ -4, -1, 3 ]` is the counterpart of `(list -4 -1 3)`. ISL lists were built from `cons` cells, which is exactly the recursive structure we rebuilt as `LinkedList` previously. Arrays package the same idea as a single built-in type, with direct access to any position by index.

</details>


The compiler enforces that every element of an array has the same type. Trying to put a `string` into a `Reading[]` is a type error, and anything you take _out_ of a `Reading[]` is guaranteed to be a `Reading`. Array elements are accessed by their **index**. This is represented by their position counting from zero. The number of elements in the array is available through its `length` property:

```typescript
const first = day[0];        // { hour: 6, tempCelsius: -4 }
const second = day[1];       // { hour: 9, tempCelsius: -1 }
const count = day.length;    // 6
```

The `day` array is represented in memory as a row of six cells, one per index. The cells do not contain the `Reading` objects themselves; each cell holds a _reference_ to a separate `Reading` that lives elsewhere. An index like `day[0]` identifies a memory location that contains a reference that points to where the object itself resides in memory. We will introduce _references_ in detail in [Chapter 6](./06_state-mutation).

<!-- graph playground:
hhttps://dreampuf.github.io/GraphvizOnline/?engine=dot
-->
```graphviz
digraph readingArray {
  rankdir = LR;
  
  compound = true;

  subgraph cluster_day_container {
    day [shape = record, label = "<c0> [0] | <c1> [1] | <c2> [2] | <c3> [3] | <c4> [4] | <c5> [5]"];
  }

  r0 [shape = record, label = "hour: 6 | tempCelsius: -4"];
  r1 [shape = record, label = "hour: 9 | tempCelsius: -1"];
  r2 [shape = record, label = "hour: 12 | tempCelsius: 3"];
  r3 [shape = record, label = "hour: 15 | tempCelsius: 8"];
  r4 [shape = record, label = "hour: 18 | tempCelsius: 2"];
  r5 [shape = record, label = "hour: 21 | tempCelsius: -2"];

  day:c0 -> r0;
  day:c1 -> r1;
  day:c2 -> r2;
  day:c3 -> r3;
  day:c4 -> r4;
  day:c5 -> r5;

  dl [shape = plaintext, label = "day"];
  e0 [shape = plaintext, label = "day[0]"];
  e1 [shape = plaintext, label = "day[1]"];

  dl -> day: nw [lhead=cluster_day_container];
  e0 -> day:c0
  e1 -> day:c1;
}
```
<!-- caption="Each cell holds a reference to a separate Reading object, which can be accessed by its index." -->


## The Built-In Array Operations

TypeScript provides _operations_ that cover the most common things a program does with a sequence. Each operation takes a function as its input. The input function describes what should happen to _one element_, and the operation applies the function across the whole array. The input functions will usually be declared with arrow functions (lambdas), which we saw in [Chapter 1](./01_new-language).

The four most commonly-used operations are `map`, `filter`, `reduce`, and `find`. `map` transforms every element, `filter` keeps a subset, `find` locates one element, and `reduce` summarises the array. A fifth, `toSorted`, puts the elements in order.


<details class="tooltip ts-tips">
<summary>Calling Array Operations</summary>

Given an array `a`, we call an operation with `a.operation(fun)`. `fun` is the function that says what to do with each element, usually an arrow function: `(elem: ElemType) => <expression>`.

</details>

<details class="tooltip link-110">
<summary> <code>map</code>, <code>filter</code>, <code>foldr</code> </summary>

CPSC 110 also had built-in sequence abstractions: `map`, `filter`, and `foldr`, with `lambda` for writing the per-element function. The TypeScript versions are the same ideas with different syntax: the operation is called with dot notation on the array, and `lambda` becomes the arrow.

```racket
(map (lambda (r) (* r 2)) (list 1 2 3))     ; (list 2 4 6)
(filter positive? (list -1 2 -3))           ; (list 2)
(foldr + 0 (list 1 2 3))                    ; 6, like reduce
```

</details>

### `map`: Transforming

`map` applies a function to every element and returns a _new array_ containing the results, in the same order. The original array is not changed. For example, our forecasters publish in Fahrenheit, so we convert every Celsius reading to Fahrenheit:

```typescript
const fahrenheit: number[] = day.map((reading: Reading) => reading.tempCelsius * 9 / 5 + 32);
// fahrenheit contains [24.8, 30.2, 37.4, 46.4, 35.6, 28.4]
```

The result of a `map` always has the same length as the input. Mapping a `Reading[]` through a function that returns a `number` produces a `number[]`.

<details class="tooltip deep-dive">
<summary>Replacing Recursion With <code>map</code></summary>

For the recursive `LinkedList<T>` from [Chapter 2](./02_model-types), the same operation had to be written by hand. The parameter `f` has type `(t: T) => U`, which denotes a function converting from `T` to `U`.

```typescript
function mapList<T, U>(list: LinkedList<T>, f: (t: T) => U): LinkedList<U> {
    if (list.kind === "empty") {
        return { kind: "empty" };
    } else {
        return { kind: "node", head: f(list.head), tail: mapList(list.tail, f) };
    }
}
```

Compared with `day.map(f)`, this performs the same steps; `map` just hides the traversal. You supply the per-element transformation, and the traversal is taken care of by the language.

</details>

### `filter`: Selecting

`filter` returns a new array containing only the elements for which the given function returns `true`. For example, the report needs to know which hours were below freezing:

```typescript
const freezing: Reading[] = day.filter((reading: Reading) => reading.tempCelsius < 0);
// [{ hour: 6, tempCelsius: -4 }, { hour: 9, tempCelsius: -1 }, { hour: 21, tempCelsius: -2 }]
```

`filter` never changes the elements; it only selects which appear in the result, so a `Reading[]` filters to an often shorter `Reading[]`.

### `reduce`: Combining

`map` and `filter` produce arrays; `reduce` collapses an array into a single value. It carries an **accumulator** through the array: for each element, a combining function takes the accumulator's current value and the current element, and produces an updated accumulator. `reduce` takes two arguments: the combining function, and the accumulator's starting value. For example, if we wanted to know the sum of the Celsius values across all of the readings:

```typescript
const totalCelsius: number = day.reduce((sum: number, reading: Reading) => sum + reading.tempCelsius, 0);
// 6
```

With `reduce` and `length` we can write a summary function in the style of the previous chapters:

```typescript
/**
 * Computes the mean temperature across a day of readings.
 *
 * Precondition: day contains at least one reading.
 *
 * @param {Reading[]} day the readings to summarise
 * @returns {number} the mean of the temperatures in day
 */
function meanTemp(day: Reading[]): number {
    const total: number = day.reduce((sum: number, reading: Reading) => sum + reading.tempCelsius, 0);
    return total / day.length;
}
```

```typescript
test("mean temperature over the day", checkExpect(() => meanTemp(day), 1));
```


### `find`: Searching

`find` returns the _first_ element for which the given function returns `true`. If no element matches, `find` returns `undefined` as specified by its return type. For example, if we wanted to find the first hour the temperature rose above freezing:

```typescript
const thaw: Reading | undefined = day.find((reading: Reading) => reading.tempCelsius > 0);
// { hour: 12, tempCelsius: 3 }
```

[Chapter 2](./02_model-types) introduced two absence values: `null`, which we choose when designing our own types, and `undefined`, the language's own value for "nothing was provided". TypeScript's built-in operations use `undefined` for "not found", and `find` follows that convention. The union type forces every caller to consider the case where nothing matched.

```typescript
test("find returns undefined when nothing matches",
    checkExpect(
        () => day.find((reading: Reading) => reading.tempCelsius > 30),
        undefined
    )
);
```

### The Function Argument

In the examples above, the function argument is always an anonymous function whose body is a single expression. It does not have to be. The function argument can be an anonymous function with statements in its body:

```typescript
const totalTemps: number = day.reduce((sum: number, reading: Reading) => {
    const total = sum + reading.tempCelsius;
    return total;
}, 0);
```

or the name of a function with the right signature:

```typescript
function addTemp(sum: number, reading: Reading): number {
    return sum + reading.tempCelsius;
}

const totalTemps: number = day.reduce(addTemp, 0);
```

A named `function` is clearer when the computation gets more complex, for example when it needs several `if` statements. The name `addTemp` also tells the reader what the operation is for.


### Chaining Operations

The array operations are chainable. Because `map` and `filter` return new arrays, the result of one can feed directly into the next. For example, to take the mean of only the above-freezing temperatures:

```typescript
const aboveFreezing: Reading[] = day.filter(
    (reading: Reading) => reading.tempCelsius > 0
);
const meanAbove: number = aboveFreezing.reduce(
    (sum: number, reading: Reading) => sum + reading.tempCelsius, 0
) / aboveFreezing.length;
// 13 / 3
```

Each named operation tells the reader the shape of the step: a `filter` produces a subset, a `map` produces transformed elements, a `reduce` produces one value. A chain of them reads as a short description of the computation.

### `toSorted`: Ordering

`toSorted` returns a _new array_ containing the same elements in a chosen order. Like `map` and `filter`, it leaves the original array unchanged. Its function argument is different from the others: a **comparator** takes _two_ elements and returns a number saying which should come first. A negative number means the first argument comes before the second, a positive number means it comes after, and zero means either order is fine (although the in-data order is what is used by default). For numbers, `a - b` orders ascending and `b - a` orders descending. For example, to list the day's readings coldest first:

```typescript
const coldestFirst: Reading[] = day.toSorted(
    (a: Reading, b: Reading) => a.tempCelsius - b.tempCelsius
);
// hours 6, 21, 9, 18, 12, 15
```

```typescript
test("readings ordered coldest first",
    checkExpect(() => coldestFirst.map((reading: Reading) => reading.hour), [6, 21, 9, 18, 12, 15])
);
```

When two elements compare as equal, `toSorted` keeps them in the order they had in the input. If that is not the order you want, the comparator needs a second rule for breaking ties, and a comparator with several rules is clearer as a named function. This one orders warmest first and, among equal temperatures, the earlier hour first:

```typescript
function warmerThenEarlier(a: Reading, b: Reading): number {
    if (a.tempCelsius !== b.tempCelsius) {
        return b.tempCelsius - a.tempCelsius;
    }
    return a.hour - b.hour;
}

const warmestFirst: Reading[] = day.toSorted(warmerThenEarlier);
// hours 15, 12, 18, 9, 21, 6
```

Always pass a comparator. Called without one, `toSorted` converts each element to a string and orders those, so `[10, 9, 2].toSorted()` is `[10, 2, 9]`, because `"10"` comes before `"2"`.

<!--
<details class="tooltip ts-tips">
<summary><code>sort</code> and <code>toSorted</code></summary>

Arrays also have `sort`, which takes the same comparator but reorders the array _in place_ and returns that same array rather than a new one. `toSorted` was added to the language so that ordering could be done without changing anything, which is why this chapter uses it. In-place changes are the subject of the [next chapter](./06_state-mutation).

</details>
-->

## Writing Your Own Loops

`map`, `filter`, `reduce`, and `find` are commonly used, but they are prescriptive. `map` always produces one output per input; `filter` always visits every element and keeps the matches; `find` always stops at the first match. While these are broadly useful, you will often need something that does not fit these operations.

When a computation does not match a named pattern, for example because it relates elements to one another rather than examining each one on its own, we need a general mechanism that the built-in operations are themselves made of: a **loop**. The loop we use is the `for of` statement. It runs its body once for each element of an array, in order, binding the element to a name:

```typescript
for (const reading of day) {
    // body runs once per reading, in order
}
```

<details class="tooltip ts-tips">
<summary><code>for of</code> loops</summary>

A `for of` loop of the form:

```typescript
for(<var-declaration> of <iterable>){
   <statement-1>;
   <statement-2>;
} 
```
is a statement that executes as follows, for each element of `<iterable>`:

1. Assigns the element to the name declared by `<var-declaration>`. That is, if `<var-declaration>` is `const x`, each element of iterable will be assigned to the name `x`.
2. Runs the statements in the body of the for loop (here, `<statement-1>; <statement-2>;`) in order.

This means the body of the `for of` loop will execute `n` times, where `n` is the number of elements in `<iterable>`. Since the `for of` loop is a statement, `for of` loops can be nested (for example, `<statement-i>` can be another loop).

</details>

Like the `if` statement from the first chapter, `for of` is a statement: it produces no value; it only directs the flow of execution. This is a _new construct_ relative to CPSC 110.

<details class="tooltip link-110">
<summary>Loops Replace Recursive Traversal</summary>

In CPSC 110 you traversed a list by calling the function again on `(rest lst)` until you reached `empty`. A `for of` loop performs the same traversal as a statement. The loop visits each element in order, then stops. The traversal you used to spell out with a recursive call is performed by the statement itself.

</details>

The loop below does what `find` does:

```typescript
function firstAbove(day: Reading[], threshold: number): Reading | undefined {
    for (const reading of day) {
        if (reading.tempCelsius > threshold) {
            return reading; // stop the search at the first match
        }
    }
    return undefined; // every reading was checked; none matched
}
```

The `return` inside the loop body exits the whole function the moment a match is found, so later elements are never visited. This is exactly what `find` does. Knowing how to write the loop means you can build the patterns the language does not provide.

Every operation above examines elements one at a time: the function you hand to `map`, `filter`, or `find` receives a single element and nothing else. Some questions are about how elements relate to _each other_. Suppose quality control asks: did the station ever report the same temperature at two different hours?

```typescript
/**
 * Determines whether any two readings taken at different hours
 * report the same temperature.
 *
 * @param {Reading[]} day the readings to examine
 * @returns {boolean} true if any temperature repeats, false otherwise
 */
function hasRepeatedTemperature(day: Reading[]): boolean {
    for (const first of day) {
        for (const second of day) {
            if (first.hour !== second.hour) {
                if (first.tempCelsius === second.tempCelsius) {
                    return true; // a repeat; stop the whole search
                }
            }
        }
    }
    return false; // every pair was checked; no repeats found
}
```

Here the loops nest: for each `first` reading, the inner loop walks the whole array looking for a _different_ hour (the outer `if`) reporting the _same_ temperature. The comparison involves two elements at once, which the named operations cannot express because their functions see one element at a time.

```typescript
const repeats: Reading[] = [
    { hour: 3, tempCelsius: 5 },
    { hour: 6, tempCelsius: 9 },
    { hour: 9, tempCelsius: 5 }
];

test("no temperature repeats in our day",
    checkExpect(() => hasRepeatedTemperature(day), false)
);

test("a repeated temperature is detected",
    checkExpect(() => hasRepeatedTemperature(repeats), true)
);
```

Which should you use? Prefer the named operation whenever the task is exactly a transform (`map`), a selection (`filter`), a summary (`reduce`), or a first-match search (`find`). The operation tells every reader what the computation does, and it will be less error-prone than a hand-written loop.

In contrast, write a loop when the computation does not fit a named pattern: when it relates elements to one another, or when one pass must answer a question no single named operation can. The named operations say _what_ they are doing. Loops are for when you must control _how_ it is done.

## Reading and Writing JSON

Programs frequently send and receive data. They save it to files, send it across the network to other machines, and exchange it with programs written in entirely different languages. To do any of that, the data has to be captured in a format that is agreed on ahead of time. A commonly used format is **JSON**, short for *J*ava*S*cript *O*bject *N*otation. You have already seen some JSON files in this course with different metadata files the learning activities (e.g., `package.json` and `tsconfig.json`).

JSON's syntax is almost exactly the object and array literals you have been writing. Every JSON value is one of a small, fixed set of kinds. Four of them are the primitive values you already know, written just as they are in TypeScript:

- `string`: always in double quotes: `"CPSC 210"`
- `number`, with no distinction drawn between integers and decimals: `4`, `-273.15`
- `boolean`: `true` or `false`
- `null`, for the deliberate absence of a value: `null`

The other two kinds are containers that hold other values, which is what lets JSON describe structured data.

**A JSON object** groups related values together inside `{ }`:

```json
{
  "hour": 6,
  "tempCelsius": -4,
  "freezing": true
}
```

Each entry has two parts separated by a `:`. The name on the left, `"hour"`, is the **key**. The value on the right, `6`, is what is recorded for that key. A key is always a string. Each key is _unique_ within an object.

**A JSON array** is an ordered list of values inside `[ ]`:

```json
[ -4, -1, 3, 8, 2, -2 ]
```

The values in an array can be any JSON value, including objects:

```json
[
  { "hour": 6, "tempCelsius": -4 },
  { "hour": 9, "tempCelsius": -1 },
  { "hour": 12, "tempCelsius": 3 }
]
```

JSON is flexible because values nest. The value filed under a key, or sitting in an array, may itself be an object or an array, and those may hold further objects and arrays. That is all of JSON: four primitive values, objects, and arrays, nested as required to describe data.

<details class="tooltip deep-dive">
<summary>A Complete JSON Document</summary>

A full weather-station report brings every kind together at once:

```json
{
  "stationId": "YVR-2",
  "active": true,
  "location": {
    "name": "Vancouver International Airport",
    "latitude": 49.19,
    "longitude": -123.18
  },
  "elevationMetres": 4,
  "readings": [
    { "hour": 6, "tempCelsius": -4, "note": null },
    { "hour": 9, "tempCelsius": -1, "note": "frost reported" }
  ],
  "tags": [ "coastal", "automated" ]
}
```

The whole document is one object. The value under `"location"` is a second object, nested inside the first. The value under `"readings"` is an array of objects, and inside one of those, `"note"` is `null` for the reading with no note and a string for the one that has it. The value under `"tags"` is an array of strings. Every value, at every depth, is one of the kinds above.

</details>

JSON only contains text. It cannot contain functions or variables. This simplicity is why JSON is so widely used. Because JSON is not tied to a specific language, a Python program can produce it, a file can store it, and your TypeScript program can consume it. The two sides only need to agree on the shape of the data. The readability of JSON data also makes it helpful for engineers as they can read the files without special tools.

The same property means a program cannot work with JSON as values directly. Two built-in functions convert between the notation and TypeScript values.

`JSON.stringify` goes from a value to text. Give it any array, object, or primitive and it returns a string in JSON notation:

```typescript
const day: Reading[] = [
    { hour: 6, tempCelsius: -4 },
    { hour: 12, tempCelsius: 3 }
];

const text: string = JSON.stringify(day);
// '[{"hour":6,"tempCelsius":-4},{"hour":12,"tempCelsius":3}]'
```

The output is compact and hard to read. When a person has to read it, as with a configuration file, a third argument adds indentation:

```typescript
JSON.stringify(day, null, 4);   // the same data, indented by four spaces
```

`JSON.parse` transforms data the other way, from text back to a value:

```typescript
const restored = JSON.parse(text);
```

`restored` now holds an array of objects, which the named operations we have been discussing can act upon.

Two cautions follow from JSON being nothing but text. The first is that _the conversion is lossy in one direction_. JSON has no notation for a date, `undefined`, or a function, so `JSON.stringify` drops them without complaint. A value that goes through `stringify` and back through `parse` equals the original only when everything in it was a kind JSON can express. The second is that _`JSON.parse` cannot know what the text contains_. The text is not available until the program runs, so the compiler cannot inspect it or give the result a meaningful type. An annotation does not fix this:

```typescript
const readings: Reading[] = JSON.parse(text);   // hoped for, not checked
```

The compiler accepts that line and then checks every later use of `readings` against a type nobody verified. If the text came from a file somebody edited by hand, from another team's program, or from an older version of the format, the values may be nothing like `Reading`, and the compiler has no way to know. For now, work with JSON your own code produced, where the shapes are known. Data from somewhere you do not control must be checked before it is trusted; we will examine this in [Part 3](../part3/index). Reading and writing JSON _files_ is covered in lab.

## On Iteration

Arrays give sequences built-in support in the language, and their operations package the traversals we used to write by hand: `map` to transform, `filter` to select, `reduce` to summarise, `find` to search, `toSorted` to order, with `for of` underneath them all for the computations that fit no named pattern.

One property everything in this chapter shared: none of these operations changed `day`, our array of daily temperatures. Every `map`, `filter`, and `toSorted` produced a new array, every `reduce` produced a new value, and even our hand-written loops only read the elements they visited; the original readings were never changed. What happens when programs _do_ change existing values, and why that calls for so much care, is the subject of the next chapter.

<details class="tooltip exercise">
  <summary>Exercise: Summarising an Order</summary>

Practise this chapter's tools using `map`, `filter`, `reduce`, `find`, `toSorted`, and a `for of` on a new collection.

> As an online shop, I want to summarise a customer's order, so that I can show line items, totals, and stock problems at a glance.

Each item in an order records a name, a unit price, and a quantity:

```typescript
type Item = {
    name: string;
    price: number;    // unit price in dollars
    quantity: number; // how many were ordered
};
```

Write a small example `order` of three or four items to test against, then write these functions. Use the named operation whenever one fits, and a loop only when none does:

1. `names(order: Item[]): string[]`; return the name of every item, <span class="hint">using `map`</span>.
2. `affordable(order: Item[], max: number): Item[]`; return the items whose `price` is at most `max`, <span class="hint">using `filter`.</span>
3. `orderTotal(order: Item[]): number`; return the total cost, summing `price * quantity` across the order, <span class="hint">using `reduce`.</span>
4. `firstOutOfStock(order: Item[]): Item | undefined`; return the first item with a `quantity` of 0, <span class="hint">using `find` (remember what `find` returns when nothing matches).</span>
5. `cheapestFirst(order: Item[]): Item[]`; return the items ordered by `price`, lowest first, and for equal prices by `name` alphabetically, <span class="hint">using `toSorted` with a comparator that has two rules; for strings, `a < b` tells you whether `a` comes first.</span>
6. `hasDuplicateName(order: Item[]): boolean`; return `true` if any two items share the same `name`. <span class="hint">This one compares items to one another, which the named operations cannot express, so you will want to use a `for of` loop for this task.</span>

Write a `test` holding a single `checkExpect` for each function against your example order, <span class="hint">including a case for `firstOutOfStock` where nothing is out of stock</span>.

</details>
