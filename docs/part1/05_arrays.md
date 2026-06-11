# Arrays and Iteration

Much of the data programs work with arrives as a *sequence*: the messages in an inbox, the transactions on an account, the students in a course, the readings from a sensor. Because sequences are so common, every programming language provides a built-in data structure for them: the **array**, an ordered collection of elements that can be accessed by position and that knows its own size. C, Java, Rust, Python, and TypeScript all provide arrays (Python calls them lists), and an engineer moving between languages can rely on them being there.

We have already built a sequence by hand. In [Using Types to Model Problems](./02_model-types) we defined a recursive `Playlist` and wrote a recursive function every time we wanted to count, total, or search it. That worked, but we had to re-invent the same traversal pattern in every function. Patterns this common are exactly what languages provide explicit support for to make work easier. Arrays come with the traversal operations already written for transforming, selecting, and searching sequences. This reading introduces arrays, those built-in operations, and then the general mechanism underneath them all: iteration.

## A Day of Temperature Readings

We will work with a single running example throughout this reading:

> As a weather-station operator, I want to summarise a day of hourly temperature readings, so that I can publish accurate daily reports without computing them by hand.

Each reading records the hour it was taken and the temperature at that moment:

```typescript
type Reading = {
  // invariant: a whole number, 0 <= hour <= 23
  hour: number;
  tempCelsius: number;
};
```

A day's data is a sequence of these readings, which we will store in an array.

## Creating and Accessing Arrays

An array type is written by adding `[]` to the element type: `Reading[]` is an array of `Reading` objects, and `number[]` is an array of numbers. An array is created with an **array literal**: the elements, separated by commas, between square brackets.

```typescript
const day: Reading[] = [
    { hour: 6,  tempCelsius: -4 },
    { hour: 9,  tempCelsius: -1 },
    { hour: 12, tempCelsius: 3 },
    { hour: 15, tempCelsius: 8 },
    { hour: 18, tempCelsius: 2 },
    { hour: 21, tempCelsius: -2 }
];

// creates an array with no elements
const empty: number[] = [];
```

Every element of an array has the same type, and the compiler enforces it: trying to put a `string` into a `Reading[]` is a type error, and anything you take *out* of a `Reading[]` is known to be a `Reading`.

Elements are accessed by their **index**, their position counting from zero, and the number of elements is available in the `length` property:

```typescript
const first = day[0];        // { hour: 6, tempCelsius: -4 }
const second = day[1];       // { hour: 9, tempCelsius: -1 }
const count = day.length;    // 6
```

<details class="tooltip link-110">
<summary>Lists in BSL</summary>

The array literal plays the role of `list` from CPSC 110: `[ -4, -1, 3 ]` is the counterpart of `(list -4 -1 3)`. Underneath, BSL lists were built from `cons` cells, which is exactly the recursive structure we rebuilt as `LinkedList` in an earlier reading. Arrays package the same idea as a single built-in type, with direct access to any position by index.

</details>

<details class="tooltip ts-tips">
<summary>Array Type Notation</summary>

`Reading[]` can also be written `Array<Reading>`; the two notations mean exactly the same type, and the second uses the generics syntax from the modelling reading. In this course we use the `Reading[]` form, which is shorter and is the form you will see most often in practice.

</details>

## The Built-In Array Operations

Arrays come with operations that cover the most common things a program does with a sequence. Each operation takes a function as its input: you describe what should happen to *one element*, and the operation applies that description across the whole array for you. The four we use most are `map`, `filter`, `reduce`, and `find`. These four operations capture some of the most common tasks we perform on arrays. `map` is used to uniformly transform every element of an array into a new array. `filter` returns a subset of an array. `find` locates one element in an array. `reduce` summarizes an array. 

Because these operations take functions as inputs, we need a compact way to write a function where it is needed.

<details class="tooltip ts-tips">
<summary>Arrow Functions</summary>

An **arrow function** is a compact way to write a function as a value. The parameters come first, then `=>`, then an expression whose value is returned automatically:

```typescript
(reading) => reading.tempCelsius > 0
```

This is a function that takes one parameter and returns a `boolean`. You have already seen the zero-parameter form: the `() =>` wrapper used by `test` and `checkError`. The parameter has no type annotation because TypeScript infers it: when an arrow function is passed to an array operation, the compiler already knows the element type of the array, so it knows `reading` is a `Reading`.

</details>

<details class="tooltip link-110">
<summary>You Used These in CPSC 110</summary>

Built-in list abstractions are not new to you: CPSC 110 introduced `map`, `filter`, and `foldr`, with `lambda` for writing the per-element function. The TypeScript versions are the same ideas with different syntax: the operation is called with dot notation on the array, and `lambda` becomes the arrow.

```racket
(map (lambda (r) (* r 2)) (list 1 2 3))     ; (list 2 4 6)
(filter positive? (list -1 2 -3))           ; (list 2)
(foldr + 0 (list 1 2 3))                    ; 6, like reduce
```

</details>

### Transforming Every Element with `map`

`map` applies a function to every element and returns a **new array** of the results, in the same order. The original array is not changed. Our forecasters publish in Fahrenheit, so we convert every reading:

```typescript
const fahrenheit: number[] = day.map(reading => reading.tempCelsius * 9 / 5 + 32);
// fahrenheit contains [24.8, 30.2, 37.4, 46.4, 35.6, 28.4]
```

The result of a `map` always has the same length as the input; only the elements are transformed. Notice the types: mapping a `Reading[]` through a function that returns a `number` produces a `number[]`.

<details class="tooltip deep-dive">
<summary>The Recursion <code>map</code> Replaces</summary>

For the recursive `LinkedList<T>` from the modelling reading, the same transformation has to be written by hand. (The parameter `f` is typed with the same arrow used to write one: `(t: T) => U` is the type of a function from `T` to `U`.)

```typescript
function mapList<T, U>(list: LinkedList<T>, f: (t: T) => U): LinkedList<U> {
    if (list.kind === "empty") {
        return { kind: "empty" };
    } else {
        return { kind: "node", head: f(list.head), tail: mapList(list.tail, f) };
    }
}
```

If you compare this carefully with `day.map(f)`, you will see that `map` performs exactly the same steps; it just hides the traversal. You supply only the per-element transformation, and the structure-following work that this function spells out is done for you.

</details>

### Keeping Some Elements with `filter`

`filter` returns a new array containing only the elements for which the given function returns `true`. The report needs to know which hours were below freezing:

```typescript
const freezing: Reading[] = day.filter(reading => reading.tempCelsius < 0);
// [{ hour: 6, tempCelsius: -4 }, { hour: 9, tempCelsius: -1 }, { hour: 21, tempCelsius: -2 }]
```

A `filter` never changes the elements themselves; it only selects which ones appear in the result, so a `Reading[]` filters to a (possibly shorter) `Reading[]`.

### Combining Elements with `reduce`

`map` and `filter` produce arrays; `reduce` collapses an array into a single value. It carries an **accumulator** through the array: for each element, a combining function takes the accumulator so far and the current element, and produces the next accumulator. `reduce` takes two arguments: the combining function, and the accumulator's starting value.

```typescript
const totalCelsius: number = day.reduce((sum, reading) => sum + reading.tempCelsius, 0);
// 6
```

With `reduce` and `length` we can write, document, and test a summary function in the style of the previous readings:

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
    const total = day.reduce((sum, reading) => sum + reading.tempCelsius, 0);
    return total / day.length;
}
```

```typescript
test("mean temperature over the day", () => {
    checkExpect(meanTemp(day), 1);
});
```

The precondition matters here in exactly the way the previous reading described: `meanTemp` of an empty array would divide by zero, so the contract excludes that input.

### Searching with `find`

`find` returns the *first* element for which the given function returns `true`. The report wants the first hour the temperature rose above freezing:

```typescript
const thaw = day.find(reading => reading.tempCelsius > 0);
// { hour: 12, tempCelsius: 3 }
```

If no element matches, `find` returns `undefined`, and its return type says so: searching a `Reading[]` produces a `Reading | undefined`. This is a deliberate language design choice. Recall the two absence values from the modelling reading: `null` is a deliberate "no value here" that we choose when designing our own types, while `undefined` is the language's own value for "nothing was provided". TypeScript's built-in operations consistently use `undefined` for their "not found" results, and `find` follows that convention. Either way the protection is the same: the union type forces every caller to consider the case where nothing matched.

```typescript
test("find returns undefined when nothing matches", () => {
    checkExpect(day.find(reading => reading.tempCelsius > 30), undefined);
});
```

### Chaining Operations

These operations also support chaining, and are frequently combined to perform more complex tasks. Because `map` and `filter` return new arrays, the result of one operation can immediately feed the next. The mean of only the above-freezing temperatures:

```typescript
const aboveFreezing = day.filter(reading => reading.tempCelsius > 0);
const meanAbove = aboveFreezing.reduce((sum, reading) => sum + reading.tempCelsius, 0) / aboveFreezing.length;
// 13 / 3
```

Each named operation tells the reader the shape of the step: a `filter` produces a subset, a `map` produces transformed elements, a `reduce` produces one value. A chain of them reads as a short description of the computation.

## Writing Your Own Loops

`map`, `filter`, `reduce`, and `find` are commonly used, but are also extremely prescriptive. `map` always produces one output per input; `filter` always visits every element and keeps the matches; `find` always stops at the first match. Many computations fit one of those shapes, but not all of them do. When a computation does not match a named pattern, for example because it relates elements to one another rather than examining each one on its own, we need the general mechanism that the built-in operations are themselves made of: a **loop**.

The loop we use is the `for of` statement. It runs its body once for each element of an array, in order, binding the element to a name:

```typescript
for (const reading of day) {
    // body runs once per reading, in order
}
```

Like the `if` statement from the first reading, `for of` is a statement: it produces no value, it directs the flow of execution. This is a new construct relative to CPSC 110, where every repetition was expressed with recursion.

<details class="tooltip link-110">
<summary>Loops Replace the Recursive Traversal</summary>

In CPSC 110 you traversed a list by calling the function again on `(rest lst)` until you reached `empty`. A `for of` loop performs the same traversal as a statement: visit each element in order, then stop. The traversal you used to spell out with a recursive call is performed by the statement itself.

</details>

To see a loop doing what `find` does, here is a search written by hand:

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

The `return` inside the loop body exits the whole function the moment a match is found, so later elements are never visited. This is exactly what `find` does for you: `find` is a loop someone else already wrote. The same is true of `map`, `filter`, and `reduce`. The built-in operations are not magic; they are packaged loops, and knowing how to write the loop means you can build the patterns the language did not provide.

Some questions cannot be answered by any of the named operations. Every operation above examines elements one at a time: the function you hand to `map`, `filter`, or `find` receives a single element and nothing else. Some questions are instead about how elements relate to *each other*. Suppose quality control asks: did the station ever report the same temperature at two different hours?

<details class="tooltip ts-tips">
<summary>Evaluating equality with <code>===</code></summary>
There are several ways to evaluate equality with differing amounts of rigour in TypeScript. We will _always_ use `===` (often called _triple equals_) in CPSC 210. Using this operator ensures that two values are ***strictly equal***. Here are some examples.

```typescript
checkExpect(1 === 1, true);
checkExpect(true === true, true);
checkExpect("cpsc210" === "cpsc210", true);
checkExpect(1 === "1", false);              // number 1 compared to string "1"
checkExpect(true === "true", false);        // boolean true compared to string "true"
```

We do this because it is almost always the case that when we want a 2, we want the number 2, not the string "2", or we would have used "2". Some examples of why this can be confusing with non-strict equality (`==`) can be seen below. These unexpected values are never visible statically; they only surface when you run the program, which often leads to surprises. Because of this we will encourage you to always use `===` in this course.

```typescript
checkExpect(1 == 1, true);                  // as expected
checkExpect(1 == "1", true);                // number 1 is considered the same as string "1"
checkExpect(true == true, true);            // as expected
checkExpect(true == 1, true);               // true is considered the same as the number 1
```
</details>

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

Loops nest: for each `first` reading, the inner loop walks the whole array looking for a *different* hour reporting the *same* temperature. The comparison involves two elements at once, which is exactly what the named operations cannot express, because the functions they take see one element at a time. (It is technically possible to contort `find` into answering this, with one search nested inside another, but the result is much harder to read than the loop that says what it means.)

```typescript
test("no temperature repeats in our day", () => {
    checkExpect(hasRepeatedTemperature(day), false);
});

test("a repeated temperature is detected", () => {
    const repeats: Reading[] = [
        { hour: 3, tempCelsius: 5 },
        { hour: 6, tempCelsius: 9 },
        { hour: 9, tempCelsius: 5 }
    ];
    checkExpect(hasRepeatedTemperature(repeats), true);
});
```

Loops have a second strength we are not ready to use yet: values that change as the loop runs, allowing a running tally to be carried from one element to the next. Doing that requires changing existing values, which is the subject of the next reading.

Prefer the named operation whenever the task is exactly a transform, a selection, a summary, or a first-match search. The name tells every future reader the shape of the computation at a glance, and the traversal it performs has no room for the small mistakes a hand-written loop can contain. Write a loop when the computation does not fit a named pattern: when it relates elements to one another, like the repeated-temperature check, or when one pass must answer a question no single named operation can. The named operations say *what*; the loop is for when you must control *how*.

## On Iteration

Arrays give sequences built-in support in the language, and their operations package the traversals we used to write by hand: `map` to transform, `filter` to select, `reduce` to summarise, `find` to search, with `for of` underneath them all for the computations that fit no named pattern. Notice one property everything in this reading shared: none of these operations changed `day`. Every `map` and `filter` produced a new array, every `reduce` produced a new value, and even our hand-written loops only read the elements they visited; the original readings were never touched. This reflects a general principle of program design that runs through this course: once a pattern is understood and reliable, it is packaged up so it never needs to be re-derived, and we get to focus on *what* to compute instead of *how* to traverse. What happens when programs *do* change existing values, and why that calls for so much care, is the subject of the next reading.

