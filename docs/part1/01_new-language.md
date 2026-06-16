# Learning a New Programming Language

This chapter introduces TypeScript, the language we use for the rest of the course. Much of CPSC 110 carries over; what is new is mostly a matter of how things are written down and how much the language checks for you.

To make the transition concrete, we scaffold from the teaching languages you learned in 110. Each new concept is related back to the idea it corresponds to in the teaching languages, and the differences are called out as they arise. The next language you learn may offer no such scaffolding, and that is fine. Having built these comparisons once, you will know which questions to ask of any new language. If you came from another language this still applies, and if that language was Python, the notion of **types** will be new to you as well.

For brevity's sake, we'll use the term BSL ([Beginning Student Language](https://docs.racket-lang.org/htdp-langs/beginner.html)) as shorthand for the teaching languages used in CPSC 110.

## Software Systems and Programming Languages

Every software system is written in a programming language, and every language has to provide the same handful of basic capabilities: ways to name values, to make decisions, to repeat work, and to describe the data the program operates on.

The most obvious way languages differ is **syntax**. Syntax represents the required formatting and structure you must follow to express your thoughts in a way the computer can understand. 

<details class="tooltip link-110">
<summary>A Difference in Syntax: Prefix vs Infix</summary>

In BSL, to add 2 and 3, we write:

```racket
(+ 2 3)
```

In TypeScript we write:

```typescript
2 + 3
```

While the characters are different (syntax), both have exactly the same meaning. In programming languages, we call that meaning *semantics*.

More precisely, we would call any syntax where the operator appears before the operands `(+ 2 3)` or `+ 2 3` *prefix* syntax. When the operator appears between the operands, such as `2 + 3`, we call this *infix* syntax. 

In BSL, *all* syntax was prefix. In TypeScript, most basic operations (e.g., addition, comparison) are written in infix syntax.
</details>


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

We will expand on function declarations later in this chapter.

## Types as a Language Mechanism

In BSL you documented type information as comments. A function's signature, like `; Number -> String`, told the reader what the function expected (a value representing a `Number`) and produced (a value representing a `String`). However, the language *did not check* that those types were honoured. If you passed a string where a number was expected, the language did not object; the mistake surfaced later, when you ran the program and it did not do what you expected.

<details class="tooltip deep-dive">
  <summary>Basic Types: <code>number</code>, <code>string</code>, and <code>boolean</code></summary>

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

In CPSC 110, DrRacket executed your program the moment you pressed `Run`. TypeScript adds a step that must be performed before your code can be executed. Before your program runs, it is analysed and transformed by a **compiler**, a program called `tsc`.

<!--- : that (1) checks your source code and ensures that the types are used consistently, then (2) transforms your input code into executable output code. --->

In particular, at the start of compilation, `tsc` invokes a **type checker**, whose job is to check whether your program is consistent with the declared types (i.e., has no **type errors**). If `tsc` finds a type error, it reports an error that you _must_ fix before your code can be executed.

<details class="tooltip ts-tips">
  <summary>Anatomy of a Type Error</summary>

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

This changes when errors in your program are surfaced to you. In BSL and other dynamically-typed languages (e.g. Python), a type mistake surfaces *while the program runs*, and only if you happened to execute code that hits that type mistake. These are **runtime** errors, because they happen at the *time* the program *runs*. Sometimes you'll see the term **dynamic**: this means the same thing as **runtime**. 

In TypeScript, the `tsc` compiler checks your types *first*, before execution. Any type errors in your *entire program* are flagged to you to fix before your code can execute.  This is what is meant when we say that types help catch bugs "before runtime": the compiler is the thing doing the catching, before you execute (i.e., run) your program. We call these errors, and any other errors that are flagged *before running* the program, **static** errors. 

<details class="tooltip deep-dive">
  <summary>Tools for Writing Source Code</summary>

Because the compiler is now part of how you write code, you should write TypeScript in an Integrated Development Environment (**IDE**) rather than a plain text editor. Visual Studio Code is a free IDE you can download, and will be used for both the midterms and final exam, so getting used to that one would be a good idea. But you can also use other IDEs like WebStorm (which is free for students as well).

An IDE runs the language's type checker continuously in the background as you type and shows each error in place, on the line that caused it, the moment it appears. You no longer have to run `tsc` by hand and read through a list of errors; you see the same static checks reported right where you are working, which tightens the feedback loop as you write your code and make it work correctly. Live type checking is the feature that matters most to us today, but as the course continues we will engage with other features within the IDE as well.
</details>

## Control Flow Statements (<code>if</code> and <code>return</code>)


There are two main kinds of syntax in all programming languages: expressions and statements. BSL is built almost entirely from **expressions**. Every chunk of BSL code is evaluated to produce a value, and that value is passed into the expression that contains it. 

TypeScript has expressions too, but it adds a second kind of construct: the **statement**. A statement's purpose is not to evaluate to a single value; it performs an action, such as making a decision or returning from a function. Often this action can change program **state**: *state* includes the names that are defined (e.g., variable or function names), and the values those names take on. A TypeScript program is written as a sequence of statements that run in order.

We saw one type of statement already: the function definition. Today we will introduce two more kinds of statements. 

#### <code>if</code> statements

The `if` statement chooses whether to run a block of code based on a condition. Unlike BSL's `cond`, it does not evaluate to a value, it only directs which code runs. The `if` statement is the most basic **control flow** statement in most languages. By directing how the program executes, the `if` controls the flow of execution.

TODO: this abstract form is already in the 'if and block statement' details block; this might as well transition to build up the `letterGrade` function (return A/F, return A/B/F, etc.)

The most basic if block is shown below; if the `<condition>` is `true`, the code in `(A)` will execute, followed by the code in `(B)`. If `<condition>` is false, `(A)` is _not_ executed, the program jumps straight to `(B)`. The `if` only guards code within the if statement, so `(B)` will always execute, regardless of the outcome of the `if` statement, because it appears below it.

```typescript
if (<condition>) {
    // (A)
}
// (B)
```

<!--- note: code in between { } forms a block, not always a basic block. There could be another if statement in the block, and it would be a block but not a basic block. I don't think we need to introduce basic blocks yet.  --->

<!--- A contiguous sequence of expressions and statements that will always execute in order in a programming language is known as a **block**. In TypeScript, these represent statements between a `{` until the next branch statement (e.g, `if`) is encountered, or a closing `}` is encountered. This means that several statements could be included at `(A)`, and all would be executed in order if `<condition>` were `true`. ---->

`(A)` need not be only a single statement. Notice the `if` is followed by curly braces: `{` and `}`. These curly braces designate a **block**, which can contain a sequence of statements. This means that several statements could be included at `(A)`, and they would be executed in order if `<condition>` were `true`.


`if` statements (in TypeScript, and most languages) are extremely flexible and expressive. The most explicit extension to the example above involves the `else` statement. This means that if `<condition>` is true, `(A)` executes, followed by `(C)`, but if `<condition>` is false, `(B)` executes, followed by `(C)`.

```typescript
if (<condition>) {
    // (A)
} else {
    // (B)
}
// (C)
```

The two sides of the if statement are referred to as **branches**.
When, in a certain run, `<condition>` evaluates to true and we execute `(A)`, we call this taking the **then-branch**. On the other hand, when 


<details class="tooltip ts-tips"> 
<summary><code>if</code> Statements and Block Statements</summary>

A block statement is started by `{` and `}`. It groups together a list of statements:

```typescript
{ 
   s_1;
   s_2;
   s_3;
}
```
so that first `s_1` will run, then `s_2` will run, etc. It can group together any number of statements. In general typescript, if you separate your statements with `;`, you can write them on the same line, and the meaning is the same: `{ s_1; s_2; s_3 }`. However, in this course, we will always put statements on separate lines for clarity.

If statements have two forms. First, the `if` (no else) statement:
```typescript
if (<condition>)
   <then-statement>
```

where `<condition>` is an expression that evaluates to a boolean, and `<then-statement>` is another statement. If `<condition>` is true, `<then-statement>` will be run, otherwise, it will be skipped. The parentheses around `<condition>` are **necessary**.

While technically `<then-statement>` need not be a block, in this class we will always make it a block statement, as this improves clarity:

```typescript
if (<condition>) {
   <block-contents>
}
```

The second form of `if` runs `<then-statement>` if `<condition>` is true, and runs `<else-statement>` if `<condition>` is false:

```typescript
if (<condition>)
   <then-statement>
else
   <else-statement>
```

Again, in the course we will always make `<then-statement>` and `<else-statement>` block statements:

```typescript
if (<condition>) {
   <then-block-contents>
} else {
   <else-block-contents>
}
```

There is one exception to this: we will allows `<else-statement>` to not be a block when it is another if statement. This allows us to create multi-condition statements, by chaining together `if-else` statements:

```typescript 
// else if version
if (<condition-1>) {
   <cond-1-then-block-contents>
} else if (<condition-2>) { // second if statement starts here
   <cond-2-then-block-contents>
} else {
   <cond-2-else-block-contents>
}
```

This `else if` syntax is clear enough that we don't add `{` around the second if statement. But the program would behave the same way if we did: 

```typescript 
// nested ifs version
if (<condition-1>) {
   <cond-1-then-block-contents>
} else {
   if (<condition-2>) { // second if statement starts here
       <cond-2-then-block-contents>
   } else {
   <cond-2-else-block-contents>
   }
}
```

Again, this is only a difference in *syntax*.

</details>


`if` statements can also be chained to ensure subsequent conditions hold before directing the control flow of the program. Let's use this to build up our `letterGrade` function:

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

In the code above once a true branch of one of the `if` statements is taken, no other code is executed. We've written what we intend in each branch---but how do we capture  "funtion should evaluate to" in TypeScript?

#### <code>return</code> statements

The `return` keyword is necessary to make functions in TypeScript return values.  The `return` statement hands a value back to whoever called the function and stops the function there. 

<details class="tooltip ts-tips">
<summary><code>return</code> Statements</summary>

`return e;` evaluates the expression `e` to a value `v` (i.e., `2 + 3` to `5`), stops executing the function there, and returns this `v` to the caller of the function.

For instance, if `return e;` is in the function `foo`, wherever the call `foo()` appears, when we execute `return e;` within `foo`, `foo` evaluates `e` to `v`, and the call to `foo()` is then replaced with `v`.

The `return` statement only makes sense if it appears in a function definition (or method defintion, which we'll see in Part 2).

</details>


The simplest example of a return statement looks like the function `getString` below; in this case the `return` statement ensures we always return the string `"STRING"` when this function is executed:

```typescript
function getString(): string {
    return "STRING";
}
```

To finish `letterGrade` and specify what `letterGrade` should evaluate to, we'll need to add `return` statements to the body.


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


<details class="tooltip link-110">
<summary><code>if</code> vs <code>cond</code> vs the Ternary (<code>?</code>) Operator</summary>

`if` operates very similarly to `cond`. 

An equivalent BSL function to `letterGrade` looks like:

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

the TypeScript version says the same thing with statements: each `cond` clause becomes an `if` whose body returns that clause's value, and `else` becomes the final `return`. The behaviour is identical; what changed is that you spell out the control flow step-by-step rather than as a single expression.

The core difference between `if` and `cond` is that `cond` is an expression: `cond` evaluates to one value. The bodies of the functions you defined in BSL contained a single expression `e` (above,`e` is the `cond` expression) and `(letter-grade 87)` simply evaluates `e` with `87` in the place of `score`. 

In TypeScript, a function body is not a single expression: it is a list of statements which will be run in order. TypeScript functions will not return a value unless they are told to by a `return` statement. Later, we'll see that we might want to write functions that have no `return` statements at all. 

There does exist an expression in TypeScript that behaves like a 1-condition `cond`. It is called the **ternary operator**, and takes 3 operands (thus the "ternary"):
```typescript
<condition> ? <then-expression> : <else-expression>
```

Unlike an `if` statement, the `<then-expression>` and `<else-expression>` in the ternary operator must be single expressions. The single-expression limitation, and confusions that sometimes arise from the ternary operator's compact notation, are two reasons why it can often be preferable to just use `if` statements explicitly instead of `?`.

</details>


## Static and Dynamic Views of a Program

There are two natural perspectives through which you can view any program. The **static** view is what you see when you look at your source code. It is fixed text sitting in a file, and it can be read and analysed *without being executed*. Types you write down in a function signature are static, as is the overall structure of your code. The compiler works entirely in this static world, and it can check your types before the program runs.

But we do not just write programs for them to sit as text on a filesystem. We write programs to do things, which gives rise to the **dynamic** view of the program. When the code *executes*, it is run on some actual *inputs*, which cause variables in the code to take on different values, and control flow statements to follow different branches. Which branch an `if` takes, what a variable holds at a given moment, and how many times a piece of code runs are dynamic facts, decided as the program runs and often different from one run to the next.

Keeping these two views apart is useful because different kinds of problems appear in each. The compiler can rule out a whole class of mistakes statically, just by reading the text, but it cannot know what will happen once the program runs on a given input. That is why static checking, however good, never removes the need to run and test a program, a theme we will return to throughout the course.

## Validating the Dynamic View With Testing


While the TypeScript compiler checks the static view of the program, we need to check the dynamic view ourselves. We do this through a process called *testing*. 

In Part 1 of this course, we will use a `checkExpect` (TODO: describe checkExpect as an assertion mechanism.)mechanism to validate that our program does not contain known errors when it executes dynamically. For example, to ensure that `letterGrade(88)` evaluates to `"A"`, we can write the following check:


```typescript
checkExpect(letterGrade(88), "A");
```

This cannot be checked statically; we must execute the `checkExpect` statement to verify the program behaviour. If the the two arguments to `checkExpect` evaluate to the same value the program will execute successfully; if it does not, the program will crash with an error that describes the expected behaviour that was violated.

TODO: add a TS details block on the mechanics of a test case (test name, checkExpect, <condition>, "message")

Suppose we had a more fine-grained expectation of how letter grades should be computed and wrote the following check:

```typescript
checkExpect(letterGrade(95), "A+");
```

In this case the program would crash, because `letterGrade(95)` evaluates to `"A"` in our current implementation. The type system cannot detect this failure statically; we rely on tests written and executed dynamically to detect this fault. 

TypeScript does not natively have a checkExpect. It is a utility we've built for Part 1. To use it, we must put it in a full test case, like this:

```typescript
test("Return an A for a score of 88", () => {
    checkExpect(letterGrade(88), "A");
});
```


The first parameter to `test` is a string that describes the test case. The second parameter `() =>` is new syntax: what it is doing is creating an *anonymous* **arrow function**, and that function is being passed as a parameter to `test` so the testing framework can control the execution of the test.


<details class="tooltip ts-tips">
<summary>Arrow Functions</summary>
Arrow functions have two forms. The first has a single expression in its body:

```typescript
(x: X, y: Y, b: Z) => <return-exp>
```
this defines an anonymous function with  3 parameters (`x`, `y`, `b` of types `X`, `Y`, `Z`), which, when called, evaluates the expression `<return-exp>` with the given argument values, and return the resulting value.

The second form has a block expression in its body:

```typescript
(x: X, y: Y, b: Z) => {
    s_1;
    s_2;
    s_3;
}
```

which can contain any number of statements. To return a value in this case, the `return` statement must be used.  


</details>


<details class="tooltip link-110">
<summary>Lambdas</summary>

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


(TODO if time permits, a "reading code" exercise that would go nicely either at the end if the `if` secion or in the testing section is debugging the following code:
```typescript
function toPassFail(s: number): string {
    if (s > 0) 
        if (s > 50) 
          return "PASS";
        if (s <= 50) 
          return "FAIL";
    else 
          return "NEGATIVE";

}
```
gives a n idea as why we want to put curly braces everywhere)

(TODO: maybe an exercise asking them to write down any vocabulary that was new to them and prepare questions for class/OH?)