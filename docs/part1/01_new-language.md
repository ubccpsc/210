# Learning a new language

## Motivation

You already know how to program. In CPSC 110 (or equivalent course) you learned to design data, write functions, and reason about how a program is written using a teaching language (BSL). The core skills you learned previously are not tied to the lanugage you learned them with. Ideas like values, functions, conditionals, and data carry across every language; what changes is how each language writes them down and how much it checks your work for you. In this course we will use TypeScript, and we will introduce it by scaffolding from BSL. Where a concept is familiar we will point at the BSL idea it corresponds to, and where a concept differs from BSL we will call it out explicitly. Since all languages are related, if your first programming language was something other than BSL, that's ok too.

## Software systems and programming languages

Every software system is written in a programming language, and every language has to provide the same handful of basic functionality: ways to name values, to make decisions, to repeat work, and to describe the data the program operates on.

The most obvious way languages differ is **syntax**. Syntax represent the required formatting and structure you must follow to express your thoughts in a way the computer can understand. A more important way languages differ though is in the **mechanisms the language enforces for you**. A language can check things about your program before it ever runs, or it can leave those checks to you. This is where TypeScript differs most from BSL: TypeScript makes **types** an explicit, checked part of the program, it evaluates and transforms your source code with a **compiler** before the program executes. The compiler catches many common programming mistakes and makes it easier to build large systems. 

## Quick function primer

TBD: what is a function, what does it look like

TBD: need to include how to call a function, because the type part below requires it

Functions provide a basic unit for containing functionality within a program. Function declarations are straightforward:

```typescript
function letterGrade() {
    // function body
}
```

The portion of the function name after the word `function` and before the first `{` is called its **signature**. When a function is called, its body is executed. The function above can be called by:

```typescript
letterGrade();
```

We will expand on function declarations more later in this reading.

## Types as a language mechanism

In BSL you documented types information as comments. A function's signature, like `Number -> String`, told the reader what the function expected (a value representing a `Number`) and produced (a value representing a `String`), but the language did not check that those types were honoured. If you passed a string where a number was expected, the language did not object; the mistake surfaced later, when you ran the program and it did not do what you expected.

In TypeScript you annotate each value with its type directly in the code, and the language checks those annotations for you when you invoke the compiler. This does two things. First, the type communicates intent: a well-chosen type tells the next reader exactly which kinds of values are valid. Second, the type is enforced by a type checker within the compiler. Using the wrong kind of value becomes an error the compiler reports, rather than a bug you discover later. A whole category of mistakes is caught before the program runs.

Extending our function signature above, we add the abilty to be passed a `score` that we want to calculate the corresponding letter grade for. The values that are passed to the function are called arguments or parameters.

The type checker only helps where types are written down. In TypeScript the inputs and output of every function are annotated: each parameter gets a type, and so does the return value. These are the similar places you would have written type comments in BSL. 

For example, a function signature for a function called `letterGrade` is shown below. Types are described following the `:` character. In this case, `letterGrade` takes a single paramater called `score` that must be a `number`. The return type is placed after a `:` after the parameter list; in this case the function returns a value that is always a `string`:

```typescript
function letterGrade(score: number): string
```

In BSL, this function would have captured the same type information like: 

```racket
; Number -> String
; produce the letter grade for a percentage score
(define (letter-grade score) ... )
```

<details class="tooltip deep-dive">
  <summary>Basic types: `number`, `string`, and `boolean`</summary>

TypeScript provides several basic types to describe individual values. Three of the most common are `number`, `string`, and `boolean`. `number` is the standard numeric type that can be used for both integer (e.g., `3`) and floating point (e.g., `3.14`) values. `string` is used to describe textual data; these values are enclosed in either single quotes `'CPSC'` or double quotes `"CPSC"`, although it is best practice to be consistent about the kind of quote used in a program. `boolean` values provide means for capturing whether a value is `true` or `false`.

As the course progresses we will examine a few more basic types, and will spend considerable time describing how to design and construct complex types.
</details>

<!-- type inference is intentionally deferred to 01-data/05 (the type checker lecture) -->

<!-- 
TODO remove?

<details class="tooltip ts-tips">
  <summary>Annotating a function</summary>

```typescript
function letterGrade(score: number): string {
  if (score >= 90) {
    return "A";
  }
  if (score >= 80) {
    return "B";
  }
  return "F";
}
```

These annotations are not just documentation. If a caller writes `letterGrade("ninety")`, the language reports an error, because `"ninety"` is a `string` and the parameter is declared as a `number`.

</details>

TODO: combine with above?

<details class="tooltip deep-dive">
  <summary>Coming from BSL</summary>

The same function in BSL carried its types in the signature comment, where they documented the function but were not checked:

```racket
; Number -> String
; produce the letter grade for a percentage score
(define (letter-grade score)
  (cond
    [(>= score 90) "A"]
    [(>= score 80) "B"]
    [else "F"]))
```

The `Number -> String` line becomes `(score: number): string` in TypeScript. The information is the same; the difference is that TypeScript holds you to it.

</details>
-->

## Compilation

In CPSC 110, DrRacket executed your program the moment you pressed `Run`. TypeScript adds a step that must be performed before your code can be executed. Before your program runs, it is evaluated and transformed by **compiler**, a program called `tsc`, that checks your source code and ensures that the types are used consistently. If `tsc` finds a violation, it reports an error that you _must_ fix before your code can be executed.

<details class="tooltip ts-tips">
  <summary>Anatomy of a type error</summary>

Here are a few lines of code that call the `letterGrade` function signature we described above, and whether the compiler would allow them or they would result in an error:

```typescript
letterGrade(85);        // ok: 85 is a number
letterGrade(92.35);     // ok: 92.35 is a number
letterGrade("eighty");  // compilation error (A)
letterGrade(false);     // compilation error (B)
```

One nice thing about the compiler is that it will tell you both where the error is, and what is wrong with your code. For the two errors above, the compiler will point to the file and line number and give the following two messages:

```
(A) Argument of type 'string' is not assignable to parameter of type 'number'.
(B) Argument of type 'boolean' is not assignable to parameter of type 'number'.

```

Until the invalid calls to `letterGrade` are fixed the code will not be executable.
</details>

This changes when errors in your program are surfaced to you: in BSL a type mistake surfaced while the program was running, and only if you happened to exercise that path. In TypeScript, the compiler checks your types first and any inconsistencies in your entire program are flagged to you to fix before your code can execute. This is what is meant when we say that types catch bugs "before runtime": the compiler is the thing doing the catching.

<details class="tooltip deep-dive">
<summary>Tools for writing source code</summary>

Because the compiler is now part of how you write code, you should write TypeScript in an Integrated Development Environment (**IDE**) rather than a plain text editor. Visual Studio Code is a free IDE you can download, and will be used for both the midterms and final exam, so getting used to that one would be a good idea. But you can also use other IDEs like WebStorm (which is free for students as well).

An IDE runs the language's type checker continuously in the background as you type and shows each error in place, on the line that caused it, the moment it appears. You no longer have to run `tsc` by hand and read through a list of errors; you see the same static checks reported right where you are working, which tightens the feedback loop as you write your code and make it work correctly. Live type checking is the feature that matters most to us today, but as the course continues we will engage in other features within the IDE as well.
</details>

## Control flow statements

There are two main kinds of syntax in all programming languages: expressions and statements. BSL is built almost entirely from **expressions**. Every chunk of BSL code is evaluated to produce a value, and that value is passed into the expression that contains it. TypeScript has expressions too, but it adds a second kind of construct: the **statement**. A statement does not produce a value; it performs an action, such as making a decision or returning from a function. A TypeScript program is written as a sequence of statements that run in order.

Today we will introduce two kinds of statements. The `if` statement chooses whether to run a block of code based on a condition. Unlike BSL's `cond`, it does not evaluate to a value, it only directs which code runs. The `if` statement is the most basic **control flow** statement in most languages. By directing how the program executes, the `if` controls the flow of execution.

The most basic if block is shown below; if the `<condition>` is `true`, the code in `(A)` will execute, followed by the code in `(B)`. If `<condition>` is false, `(A)` is _not_ executed, the program jumps straight to `(B)`. Remember, in TypeScript, code is executed from the top down, so `(B)` will always execute, regardless of the outcome of the `if` statement, because it appears below it.

```typescript
if (<condition>) {
    // (A)
}
// (B)
```

<details class="tooltip ts-tips">
  <summary>Applying `if` to `letterGrade`</summary>

`if` statements (in TypeScript, and most languages) are extremely flexible and expressive. The most explicit extension to the example above involves the `else` statement. This means that if `<condition>` is true, `(A)` executes, followed by `(C)`, but if `<condition>` is false, `(B)` executes, followed by `(C)`.

```typescript
if (<condition>) {
    // (A)
} else {
    // (B)
}
// (C)
```

These statements can also be chained to ensure subsequent conditions hold before directing the control flow of the program. In this example, once a true branch of one of the `if` statements is taken, no other code is executed. This code has one important flaw, that we will discuss below.

```typescript
function letterGrade(score: number): string {
    if (score >= 80) {
        // function should evauate to "A"
    } else if (score >= 68) {
        // function should evauate to "B"
    } else if (score >= 55) {
        // function should evauate to "C"
    } else if (score >= 50) {
        // function should evauate to "D"
    } else {
        // function should evauate to "F"
    }
}
```
<details>

Another control flow statement is performed by the `return` keyword. The `return` statement hands a value back to whoever called the function and stops the function there. Because `if` does not produce a value, you combine the two: inside each branch you `return` the value for that case. This is a real change in how control flow is written, so it is worth reading these constructs carefully even though the underlying logic is the same as the `cond` you already know. The simplest example of a return statement looks like the function `getString` below; in this case the `return` statement ensures we always return the value `STRING` when this function is executed:

```typescript

function getString(): string {
    return "STRING";
}

<details class="tooltip ts-tips">
  <summary>Combining `if` and `return` for `letterGrade`</summary>

The problem with our `letterGrade` function above is that it never actually returned the corresponding letter grade for the given `score`. Here we see the final function:

```typescript
function letterGrade(score: number): string {
    if (score >= 80) {
        return "A";
    } else if (score >= 68) {
        return "B";
    } else if (score >= 55) {
        return "C";
    } else if (score >= 50) {
        return "D";
    } else {
        return "F";
    }
}
```

Each `return` exits the function immediately, so the order of the checks matters: a score of 95 is caught by the first `if` and never reaches the others.

An equivalent BSL function would look like:

```racket
(cond
  [(>= score 90) "A"]
  [(>= score 68) "B"]
  [(>= score 55) "C]
  [(>= score 50) "D"]
  [else "F"])
```

The TypeScript version says the same thing with statements: each `cond` clause becomes an `if` whose body returns that clause's value, and `else` becomes the final `return`. The logic is identical; what changed is that you spell out the control flow step by step rather than as a single expression.
</details>


## Static and dynamic views of a program

TBD: build this around `checkExpect`

There are two natural perspectives through which you can view any program. The **static** view is what you see when you look at your source code. It is fixed text sitting in a file, and it can be read and analysed without being executed. The types, the structure of your functions, and the way the pieces fit together are all static properties, because they are true of the text itself. The compiler works entirely in this static world, which is exactly why it can check your types before the program runs.

But we do not just write programs for them to sit as text on a filesystem. We write programs to do things, which gives rise to the **dynamic** view of the program. When the code executes it takes on actual values, follows particular paths, and produces behaviour that unfolds over time. Which branch an `if` takes, what a variable holds at a given moment, and how many times a piece of code runs are dynamic facts, decided as the program runs and often different from one run to the next.

Keeping these two views apart is useful because different problems live in each. The compiler can rule out a whole class of mistakes statically, just by reading the text, but it cannot know what will actually happen once the program runs. That is why static checking, however good, never removes the need to run and test a program, a theme we will return to throughout the course.

While the TypeScript compiler checks static values for us, we need to check dynamic properties ourselves. We do this through a process called testing. Similar to CPSC 110, we will use a `checkExpect` mechanism to validate that our program does not contain known errors when it executes dynamically. For example, to ensure that `95` evaluates to `"A"`, we can write the following check:

```typescript
checkExpect(letterGrade(88), "A");
```

This cannot be checked statically; we must execute the `checkExpect` statement to verify the program behaviour. If `letterGrade` satisfies this behaviour, the program will execute successfully, if it does not the program will crash.

Suppose we had a more fine-grained expectation of how letter grades should be computed and wrote the following check:

```typescript
checkExpect(letterGrade(95), "A+");
```

In this case the program would crash, because `letterGrade(90)` evaluates to `"A"` in our current implementation. The type system cannot detect this failure statically, we rely on tests written and executed dynamically to detect this fault.

## Moving forward in this course

Learning TypeScript is not starting over. The way you design data, break a problem into functions, and reason about behaviour is the same as in CPSC 110. What is new is mostly enforcement and form. Types are written into the program and checked rather than left in a comment. Control flow is written with statements like `if` and `return` rather than as a single expression. Mapping constructs in a new language back to the ideas you already know from prior languages is what makes new languages quick to pick up. While this transition can be tricky this first time, each subsequent language you learn will be easier and easier.
