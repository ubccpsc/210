# Learning a New Programming Language

(TODO: BSL/ISL Teaching Languages? Won't change for now. We could say at the top we'll use "BSL" to refer to all the teaching languages)

You already know how to program. In CPSC 110 (or equivalent course) you learned to design data, write functions, and reason about how a program is written using a teaching language (BSL). 

The core skills you learned previously are not tied to the language you learned them with. Ideas like *values*, *variables*, *functions*, *conditionals*, and *data* carry across every language. What changes is how each language *writes them down* and how much *it checks* your work for you. 

In this course we will use TypeScript, and we will introduce it by scaffolding from BSL. Where a concept is familiar we will point at the BSL idea it corresponds to, and where a concept differs from BSL we will call it out explicitly. You may not be provided such explicit scaffolding for the next language you learn; that will be ok! Having seen this scaffolding once, you'll have an idea of which comparisons to your prior knowledge are necessary to learn a new language. 

Since all languages are related, if your first programming language was something other than BSL, that's ok too. In particular, if your first language was Python, the notion of **types** will be new to you as well.

## Software Systems and Programming Languages

Every software system is written in a programming language, and every language has to provide the same handful of basic capabilities: ways to name values, to make decisions, to repeat work, and to describe the data the program operates on.

The most obvious way languages differ is **syntax**. Syntax represents the required formatting and structure you must follow to express your thoughts in a way the computer can understand. 

<details class="tooltip link-110">
<summary>A Difference in Syntax</summary>

In BSL, to add 2 and 3, we write:

```racket
(+ 2 3)
```

In TypeScript we write:

```typescript
2 + 3
```

While the characters are different (syntax), both have exactly the same meaning. In programming languages, we call that meaning *semantics*.
</details>

(TODO: prefix vs infix?)

A more important way languages differ though is in the **mechanisms the language enforces for you**. A language can check things about your program before it ever runs, or it can leave those checks to you. 

Enforcement mechanisms are where TypeScript differs most from BSL. TypeScript makes **types** an explicit, checked part of the program, and it analyses and transforms your source code with a **compiler** before the program executes. The compiler catches many common programming mistakes and makes it easier to build large systems. 

Another big difference is that TypeScript primarily expresses control flow using **statements**, which differ from the expressions you used in BSL.



## Quick Primer on Functions

Functions provide a basic unit for containing functionality within a program. Function declarations are straightforward:

```typescript
function letterGrade() {
    // function body
}
```

The part of the declaration after the word `function` and before the first `{` is called its **signature**. When a function is called, its body is executed. The function above can be called by:

```typescript
letterGrade();
```

We will expand on function declarations later in this reading.

## Types as a Language Mechanism

In BSL you documented type information as comments. A function's signature, like `; Number -> String`, told the reader what the function expected (a value representing a `Number`) and produced (a value representing a `String`). However, the language *did not check* that those types were honoured. If you passed a string where a number was expected, the language did not object; the mistake surfaced later, when you ran the program and it did not do what you expected.

<details class="tooltip deep-dive">
  <summary>Basic types: <code>number</code>, <code>string</code>, and <code>boolean</code></summary>

TypeScript provides several basic types to describe individual values. Three of the most common are `number`, `string`, and `boolean`. `number` is the standard numeric type that can be used for both integer (e.g., `3`) and floating point (e.g., `3.14`) values. `string` is used to describe textual data; these values are enclosed in either single quotes `'CPSC'` or double quotes `"CPSC"`, although it is best practice to be consistent about the kind of quote used in a program. `boolean` values provide means for capturing whether a value is `true` or `false`.

As the course progresses we will examine a few more basic types, and will spend considerable time describing how to design and construct complex types.
</details>


In TypeScript you annotate each value with its type *directly in the code*, and the language checks those annotations for you when you invoke the compiler. This does two things:

- First, the type communicates *intent*: a well-chosen type tells the next reader exactly which kinds of values are valid. 
- Second, the type is *enforced* by a **type checker** within the compiler. The compiler will report a wrong type of value as an error, rather than leaving it for you to discover the bug when you run the program. A whole category of mistakes is caught before the program runs.


<!--- NOTE arguments and parameters are covered in 110: https://cs110.students.cs.ubc.ca/reference/glossary.html --->

Extending our `letterGrade` example above, we will add the ability to pass in a numerical `score` out of 100 that we want to calculate the corresponding letter grade for. Recall that the named inputs a function declares (such as `score`) are its **parameters**, and the actual values passed in when it is called are its **arguments**. 

The following declares the function `letterGrade`, which takes a single parameter called `score` that must be a `number`. Further, the function returns a value that is always a `string`:
 
```typescript
letterGrade(score: number): string
```

<details class="tooltip ts-tips">
<summary>Function Signatures in TypeScript</summary>
The function signature:

```typescript
fn(x: X, y: Y, b: Z): A
```
defines a function with the name `fn`, with parameters: `x` of type `X`, `y` of type `Y`, and `b` of type `Z`. It also specifies that `fn` returns a value of type `A`. A function signature can have any number of parameters. 

Parameter types come after the parameter they type, separated by a `:`. The return type is placed after the parameter list, following a second `:`.

</details>



Note that the type checker *only* helps where types are *written down*. In TypeScript we type the inputs and output of every function: each parameter gets a type, and so does the return value. These are the same places you would have written type comments in BSL.

<details class="tooltip link-110">
<summary>Type Comments in BSL</summary>

In BSL, we would have captured the `letterGrade` type information as a comment in the signature:

```racket
; Number -> String
; produce the letter grade for a percentage score
(define (letter-grade score) ... )
```

But BSL does not use the signature to check that `letter-grade` is invoked correctly.

```racket
; no error reported before running the program
(letter-grade "Hello")  
```

</details>








## Compilation and Type Checking

In CPSC 110, DrRacket executed your program the moment you pressed `Run`. TypeScript adds a step that must be performed before your code can be executed. Before your program runs, it is analysed and transformed by a **compiler**, a program called `tsc`, that checks your source code and ensures that the types are used consistently. In particular, at the start of compilation, `tsc` invokes a **type checker**, whose job is to check whether your program is consistent with the declared types (i.e., has no **type errors**). If `tsc` finds a type error, it reports an error that you _must_ fix before your code can be executed.

<details class="tooltip ts-tips">
  <summary>Anatomy of a type error</summary>

Here are a few lines of code that call the `letterGrade` function signature we described above, and whether the compiler would allow them or they would result in an error:

```typescript
letterGrade(85);        // ok: 85 is a number
letterGrade(92.35);     // ok: 92.35 is a number
letterGrade("eighty");  // compilation error (A)
letterGrade(false);     // compilation error (B)
```

The compiler will tell you both where the error is and what is wrong with your code. For the two errors above, the compiler will point to the file and line number and give the following two messages:

```
(A) Argument of type 'string' is not assignable to parameter of type 'number'.
(B) Argument of type 'boolean' is not assignable to parameter of type 'number'.
```

The computer will not be able to execute the program until the invalid calls to `letterGrade` are fixed.
</details>

This changes when errors in your program are surfaced to you. In BSL and other dynamically-typed languages (e.g. Python), a type mistake surfaces while the program was running, and only if you happened to execute code that hits that type mistake.

In TypeScript, the compiler checks your types *first*, before execution. Any type errors in your *entire program* are flagged to you to fix before your code can execute. This is what is meant when we say that types help catch bugs "before runtime" (also termed *statically*): the compiler is the thing doing the catching, before you execute (i.e., run) your program. 

<details class="tooltip deep-dive">
  <summary>Tools for writing source code</summary>

Because the compiler is now part of how you write code, you should write TypeScript in an Integrated Development Environment (**IDE**) rather than a plain text editor. Visual Studio Code is a free IDE you can download, and will be used for both the midterms and final exam, so getting used to that one would be a good idea. But you can also use other IDEs like WebStorm (which is free for students as well).

An IDE runs the language's type checker continuously in the background as you type and shows each error in place, on the line that caused it, the moment it appears. You no longer have to run `tsc` by hand and read through a list of errors; you see the same static checks reported right where you are working, which tightens the feedback loop as you write your code and make it work correctly. Live type checking is the feature that matters most to us today, but as the course continues we will engage with other features within the IDE as well.
</details>

## Control Flow Statements (<code>if</code> and <code>return</code>)

(TODO: to discuss: should we flip the tooltips with the tooltips giving the details of how if works and the examples in text being the running example? but no, statements are big enough we should describe them not in a tooltip...)

There are two main kinds of syntax in all programming languages: expressions and statements. BSL is built almost entirely from **expressions**. Every chunk of BSL code is evaluated to produce a value, and that value is passed into the expression that contains it. 

TypeScript has expressions too, but it adds a second kind of construct: the **statement**. A statement does not produce a value; it performs an action (TODO: discuss definition), such as making a decision or returning from a function. A TypeScript program is written as a sequence of statements that run in order.

Today we will introduce two kinds of statements. The `if` statement chooses whether to run a block of code based on a condition. Unlike BSL's `cond`, it does not evaluate to a value, it only directs which code runs. The `if` statement is the most basic **control flow** statement in most languages. By directing how the program executes, the `if` controls the flow of execution.

The most basic if block is shown below; if the `<condition>` is `true`, the code in `(A)` will execute, followed by the code in `(B)`. If `<condition>` is false, `(A)` is _not_ executed, the program jumps straight to `(B)`. The `if` only guards code within the if statement, so `(B)` will always execute, regardless of the outcome of the `if` statement, because it appears below it.

A contiguous sequence of expressions and statements that will always execute in order in a programming language is known as a **basic block**. In TypeScript, these represent statements following `{` until the next branch statement (e.g, `if`) is encountered, or a closing `}` is encountered. This means that several statements could be included at `(A)`, and all would be executed in order if `<condition>` were `true`.

```typescript
if (<condition>) {
    // (A)
}
// (B)
```

`if` statements (in TypeScript, and most languages) are extremely flexible and expressive. The most explicit extension to the example above involves the `else` statement. This means that if `<condition>` is true, `(A)` executes, followed by `(C)`, but if `<condition>` is false, `(B)` executes, followed by `(C)`.

```typescript
if (<condition>) {
    // (A)
} else {
    // (B)
}
// (C)
```

<details class="tooltip ts-tips">
  <summary>Applying <code>if</code> to <code>letterGrade</code></summary>

`if` statements can also be chained to ensure subsequent conditions hold before directing the control flow of the program. In this example, once a true branch of one of the `if` statements is taken, no other code is executed. This code has one important flaw, that we will discuss below.

```typescript
function letterGrade(score: number): string {
    if (score >= 80) {
        // function should evaluate to "A"
    } else if (score >= 68) {
        // function should evaluate to "B"
    } else if (score >= 55) {
        // function should evaluate to "C"
    } else if (score >= 50) {
        // function should evaluate to "D"
    } else {
        // function should evaluate to "F"
    }
}
```
</details>

Another control flow statement is performed by the `return` keyword. The `return` statement hands a value back to whoever called the function and stops the function there. Because `if` does not produce a value, you combine the two: inside each branch you `return` the value for that case. This is a real change in how control flow is written, so it is worth reading these constructs carefully even though the underlying logic is the same as the `cond` you already know. The simplest example of a return statement looks like the function `getString` below; in this case the `return` statement ensures we always return the string `"STRING"` when this function is executed:

```typescript
function getString(): string {
    return "STRING";
}
```

<details class="tooltip ts-tips">
  <summary>Combining <code>if</code> and <code>return</code> to <code>letterGrade</code></summary>

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
; Number -> String
; produce the letter grade for a percentage score
(define (letter-grade score)
  (cond
    [(>= score 80) "A"]
    [(>= score 68) "B"]
    [(>= score 55) "C"]
    [(>= score 50) "D"]
    [else "F"]))
```

The TypeScript version says the same thing with statements: each `cond` clause becomes an `if` whose body returns that clause's value, and `else` becomes the final `return`. The logic is identical; what changed is that you spell out the control flow step by step rather than as a single expression.


(TODO: something like. right now the typescript is significantly more wordy than cond in 110! but return will help us flexibly express different patterns of control flow further down the line? eh, you could express those things in BSL as well) 
</details>


(TODO: could give an exercise on re-writing the typescript without "else if"?)


## Static and Dynamic Views of a Program

There are two natural perspectives through which you can view any program. The **static** view is what you see when you look at your source code. It is fixed text sitting in a file, and it can be read and analysed *without being executed* (no execution is the key). The types, the structure of your functions, and the way the pieces fit together are all static properties, because they are true of the text itself. The compiler works entirely in this static world, which is exactly why it can check your types before the program runs.

But we do not just write programs for them to sit as text on a filesystem. We write programs to do things, which gives rise to the **dynamic** view of the program. When the code *executes*, it takes on actual values, follows particular paths(TODO: do they know what paths are), and produces behaviour that unfolds over time. Which branch (TODO: we should define what a control branch is. the only mentions of branches in the [110 glossary](https://cs110.students.cs.ubc.ca/reference/glossary.html) are with regard to trees? conditionals are discussed as: "A cond expression first evaluates the first question,")an `if` takes, what a variable holds at a given moment, and how many times a piece of code runs are dynamic facts, decided as the program runs and often different from one run to the next.

Keeping these two views apart is useful because different kinds of problems appear in each. The compiler can rule out a whole class of mistakes statically, just by reading the text, but it cannot know what will actually happen once the program runs. That is why static checking, however good, never removes the need to run and test a program, a theme we will return to throughout the course.

## Validating the Dynamic View With Testing


While the TypeScript compiler checks the static view of the program, we need to check dynamic view ourselves. We do this through a process called *testing*. 

Similar to CPSC 110, in Part 1 of this course, we will use a `checkExpect` (TODO: describe checkExpect as an assertion mechanism.)mechanism to validate that our program does not contain known errors when it executes dynamically. For example, to ensure that `letterGrade(88)` evaluates to `"A"`, we can write the following check:


```typescript
checkExpect(letterGrade(88), "A");
```

This cannot be checked statically; we must execute the `checkExpect` statement to verify the program behaviour. If `letterGrade` satisfies this behaviour, the program will execute successfully; if it does not, the program will crash with an error that describes the expected behaviour that was violated.

Suppose we had a more fine-grained expectation of how letter grades should be computed and wrote the following check:

```typescript
checkExpect(letterGrade(95), "A+");
```

In this case the program would crash, because `letterGrade(95)` evaluates to `"A"` in our current implementation. The type system cannot detect this failure statically; we rely on tests written and executed dynamically to detect this fault. 


In reality, this isn't quite a complete example; a full test case looks like this:

```typescript
test("Return an A for a score of 88", () => {
    checkExpect(letterGrade(88), "A");
});
```

The first parameter to `test` is a string that describes the test case. The second parameter `() =>` is new syntax: what it is doing is creating an **anonymous function**, and that function is being passed as a parameter to `test` so the testing framework can control the execution of the test.


(TODO: details TS to explain syntax)



<details class="tooltip link-110">
<summary>Anonymous Functions are Lambdas</summary>

You have seen anonymous functions before: in CPSC 110 they were called **lambda expressions**. When you wrote a `lambda` to pass to an abstract function like `filter`, you were creating a function without naming it, right at the place it was needed:

```racket
(filter (lambda (n) (> n 5)) (list 3 6 9))
```

TypeScript's arrow syntax does the same job: `(n) => n > 5` means the same thing as `(lambda (n) (> n 5))`. The `() =>` in the test above is simply a lambda that takes no parameters, like `(lambda () ...)`. The body of the test is wrapped in an anonymous function so that it can be handed to `test` and executed later, just as `filter` decided when to call your lambda.
</details>

## Learning New Languages

Learning TypeScript is not starting over. The way you design data, break a problem into functions, and reason about behaviour is the same as in CPSC 110. 

What is new is mostly *enforcement* and *form*. In terms of *enforcement*, we write types into the program and `tsc` checks them, rather than leaving them in an unchecked comment. In terms of *form*, we write conditional control flow  with statements like `if` and `return`, rather than as a single `cond` expression. 

Mapping constructs in a new language back to the ideas you already know from prior languages is what makes new programming languages quick to pick up. While this transition can be tricky this first time, with each subsequent language you learn, it will be easier and easier.
