# Learning a New Programming Language

TypeScript is the language we use for the rest of the course. Much of CPSC 110 carries over. What is new is mostly a matter of how things are written down and how much the language checks for you.

To make the transition concrete, we scaffold from the teaching languages you learned in 110. Each new concept is related back to the idea it corresponds to in the teaching languages, and the differences are called out as they arise. The next language you learn may offer no such scaffolding, and that is fine. Having built these comparisons once, you will know which questions to ask of any new language. If you came from another language this still applies, and if that language was Python, types that are checked before the program runs may be new to you as well.

For brevity's sake, we'll use the term ISL ([Intermediate Student Language with Lambdas](https://docs.racket-lang.org/htdp-langs/intermediate-lam.html)) as shorthand for the teaching languages used in CPSC 110. Many ISL features are also present in BSL ([Beginner Student Language](https://docs.racket-lang.org/htdp-langs/beginner.html)).

## Programming Languages

Every software system is written in a programming language, and every language has to provide the same handful of basic capabilities: ways to name values, to make decisions, to repeat work, and to describe the data the program operates on.

One obvious way languages differ is **syntax**. Syntax is the set of rules for how a program must be written so that the computer can read it. In ISL every operation was written prefix, `(+ 2 3)`; TypeScript writes most of them infix, `2 + 3`.


A more important difference is what the language enforces for you. A language can check things about your program before it ever runs, or it can leave those checks to you.

Enforcement mechanisms are where TypeScript differs most from ISL. TypeScript makes types an explicit, checked part of the program, and it analyses and transforms your source code with a **compiler** before the program executes. The compiler catches many common programming mistakes and makes it easier to build large systems.

Another big difference is that TypeScript primarily expresses control flow using statements, which differ from the expressions you used in ISL.


## Types in TypeScript

In ISL you documented type information as comments. A function's signature, like `(@signature Number -> String)`, told the reader what the function expected (a value representing a `Number`) and produced (a value representing a `String`). However, the language did not check that those types were honoured. If you passed a string where a number was expected, the language did not object. The mistake surfaced later, when you ran the program and it did not do what you expected.

<details class="tooltip ts-tips">
  <summary>Basic Types: <code>number</code>, <code>string</code>, and <code>boolean</code></summary>

TypeScript provides several basic types to describe individual values. Three of the most common are `number`, `string`, and `boolean`. `number` is the standard numeric type, used for both integer (such as `3`) and floating point (such as `3.14`) values. `string` describes textual data. String values are enclosed in either single quotes `'CPSC'` or double quotes `"CPSC"`, although it is best practice to be consistent about the kind of quote used in a program. `boolean` has two values, `true` and `false`.

As the course progresses we will examine a few more basic types, and will spend considerable time describing how to design and construct complex types.
</details>

<details class="tooltip ts-tips">
  <summary>Arithmetic on <code>number</code> Values</summary>

TypeScript's basic arithmetic operators are each written in the infix style described above:

```typescript
2 + 3;    // 5,   addition
5 - 2;    // 3,   subtraction
4 * 3;    // 12,  multiplication
7 / 2;    // 3.5, division
7 % 2;    // 1,   remainder
```

`/` is always floating-point division, so `7 / 2` is `3.5`, not `3`; ISL\'s `quotient`, which divides and discards the fraction, has no TypeScript counterpart.

</details>

<details class="tooltip link-110">
<summary>Exact Numbers in ISL, Inexact Numbers in TypeScript</summary>

In ISL, dividing two integers gives an exact rational number. `(/ 35 50)` is exactly `7/10`, and `(* (/ 35 50) 100)` is exactly `70`. Racket keeps the fraction rather than converting it to a decimal, so arithmetic on whole numbers stays exact however you order the operations.

TypeScript has a single `number` type, and it stores values as a binary approximation of the decimal you wrote. Most decimals cannot be represented exactly in binary, in the same way that `1/3` cannot be written exactly as a decimal:

```typescript
(11 / 20) * 100;    // 55.00000000000001, not 55
(29 / 50) * 100;    // 57.99999999999999, not 58
```

Two consequences follow, and both apply to any language that stores numbers this way:

- Order your arithmetic so that division comes last. `(11 * 100) / 20` gives exactly `55`, because the multiplication happens while the values are still whole numbers.
- Be careful comparing computed decimal values for exact equality. A test that expects `(11 / 20) * 100` to equal `55` fails, even though the difference is tiny.

</details>

In TypeScript you write types directly in the code, and the language checks those annotations for you when you invoke the compiler. This does two things:

- First, the type communicates intent: a well-chosen type tells the next reader exactly which kinds of values are valid.
- Second, the type is enforced by a **type checker** within the compiler. The compiler reports a value of the wrong type as an error, so you do not have to discover the bug by running the program.

<!--- NOTE arguments and parameters are covered in 110: https://cs110.students.cs.ubc.ca/reference/glossary.html --->

Functions are the basic unit for organising the code in a program. A function declaration starts with the word `function`; the part of the declaration before the first `{` is its **signature**, and the braces hold its body, which runs when the function is called. Consider a function `letterGrade` that takes a numeric `score` out of 100 and produces the matching letter grade. Recall that the named inputs a function declares (such as `score`) are its **parameters**, and the actual values passed in when it is called are its **arguments**.

The following signature says that `letterGrade` takes a single parameter called `score` that must be a `number`, and always returns a `string`:

```typescript
letterGrade(score: number): string
```

<details class="tooltip ts-tips">
<summary>Function Signatures in TypeScript</summary>
The function signature:

```typescript
fn(x: X, y: Y, z: Z): A
```
defines a function with the name `fn`, with parameters: `x` of type `X`, `y` of type `Y`, and `z` of type `Z`. It also specifies that `fn` returns a value of type `A`. A function signature can have any number of parameters.

Parameter types come after the parameter they type, separated by a `:`. The return type is placed after the parameter list, following a second `:`.
</details>

The type checker works from the types you write down, along with the types it can infer from them. In this course we write a type for the inputs and output of every function. Each parameter gets a type, and so does the return value. These are the same places you would have written type comments in ISL.

<details class="tooltip link-110">
<summary>Signatures in ISL</summary>

In ISL, we would have captured the `letterGrade` type information as a comment in the signature:

```racket
; Number -> String
; produce the letter grade for a percentage score
(define (letter-grade score) ... )
```
or a signature annotation:

```racket
(@signature Number -> String)
; produce the letter grade for a percentage score
(define (letter-grade score) ... )
```

But either way, ISL does not use the signature to check that `letter-grade` is invoked correctly.

```racket
; no error reported before running the program
(letter-grade "Hello")
```

</details>

## Compiling and Checking

In CPSC 110, DrRacket executed your program the moment you pressed `Run`. TypeScript adds a step before your code runs. The program is first analysed and transformed by a compiler, a program called `tsc`.

<!--- : that (1) checks your source code and ensures that the types are used consistently, then (2) transforms your input code into executable output code. --->

At the start of compilation, `tsc` invokes a type checker, whose job is to check whether your program is consistent with the declared types (that is, has no **type errors**). If `tsc` finds a type error, it reports it. Treat a program with type errors as broken, and fix every error the compiler reports before you run the code. Some tools, such as the test runner, will still run a program that has type errors, but its types no longer tell you anything about how it behaves.

<details class="tooltip ts-tips">
  <summary>Anatomy of a Type Error</summary>

Here are a few lines of code that call the `letterGrade` function whose signature we described above, and whether the compiler would allow them or they would result in an error:

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

Fix both calls before you run the program.
</details>

The compiler sits between the source you write and the program that runs, and it is where type errors are caught before anything executes:

```plantuml
@startuml
skinparam defaultTextAlignment center
skinparam activityDiamondBackgroundColor #fff3c4
start
:TypeScript File
(.ts);
:tsc
Compiler; <<#f5f5dc>>
if (Compiles &
Type Checks?) then (Yes)
  :JavaScript File
(.js); <<#d6f5d6>>
  :Browser/Node
Runtime;
  stop
else (No)
  :Static Error
Invalid Program; <<#ffd6d6>>
  stop
endif
@enduml
```
<!-- caption="How <code>tsc</code> type checks and transforms TypeScript before it can execute. Green marks the output of a program that compiles, and red marks a program the compiler rejects." -->

<details class="tooltip deep-dive">
  <summary>Tools for Writing Source Code</summary>

Because the compiler is now part of how you write code, you should write TypeScript in an Integrated Development Environment (**IDE**) rather than a plain text editor. Visual Studio Code is a free IDE, and it is the one used on the midterms and the final exam, so it is a good one to learn. You can also use other IDEs, such as WebStorm (also free for students). Your IDE runs the type checker continuously as you type and marks each error on the line that caused it; the [VSCode cookbook](../reference/cookbooks/vscode/VSCode) shows where to find those reports and how to run tests.

</details>

## Control Flow Statements

Most programming languages have two main kinds of construct: expressions and statements. ISL is built almost entirely from **expressions**. Every chunk of ISL code is evaluated to produce a value, and that value is passed into the expression that contains it.

TypeScript has expressions too, but it adds a second kind of construct: the **statement**. A statement does not evaluate to a value. It performs an action, such as making a decision or returning from a function. A TypeScript program is written as a sequence of statements that run in order.

We have already seen one kind of statement, the function declaration. This section introduces two more.

### `if` Statements

The `if` statement chooses whether to run a block of code based on a condition. Unlike ISL's `cond`, it does not evaluate to a value. It only directs which code runs. Statements that direct which code runs next are called **control flow** statements, and `if` is the most basic one in most languages.

A basic `if` statement is shown below. If the condition `grade >= 50` is `true`, the code labelled `// (A)` will execute. If the condition `grade >= 50` is `false`, the code labelled `// (B)` will execute.

<!--- not talking about executing stuff after the if statement, because it kind of conflicts with returns ---->

```typescript
if (grade >= 50) {
    // (A) handle passing grade
} else {
    // (B) handle failing grade
}
```

<!--- note: code in between { } forms a block, not always a basic block. There could be another if statement in the block, and it would be a block but not a basic block. I don't think we need to introduce basic blocks yet.  --->

<!--- A contiguous sequence of expressions and statements that will always execute in order in a programming language is known as a **block**. In TypeScript, these represent statements between a `{` until the next branch statement (e.g, `if`) is encountered, or a closing `}` is encountered. This means that several statements could be included at `(A)`, and all would be executed in order if `<condition>` were `true`. ---->

Right now `(A)` and `(B)` are comments rather than concrete code, and they stand for any sequence of statements. The curly braces `{}` designate a **block**, which can contain a sequence of statements. So several statements could go at `// (A)` or `// (B)`. We'll give a concrete example once we introduce another type of statement.

The two sides of the `if` statement are called **branches**. When the condition (`grade >= 50` above) evaluates to `true` and we execute `// (A)`, the run takes the **then-branch**. When the condition evaluates to `false` and we execute `// (B)`, the run takes the **else-branch**.

Often we only want to run code when a condition is true. In that case the `else` can be left out:

```typescript
if (grade >= 50) {
    // code to run if grade is passing
}
```


<details class="tooltip ts-tips">
<summary><code>if</code> Statements and Block Statements</summary>

A block statement starts with `{` and ends with `}`. It groups together a list of statements:

```typescript
{
   <statement-1>;
   <statement-2>;
   <statement-3>;
}
```
so that first `<statement-1>` will run, then `<statement-2>` will run, etc. It can group together any number of statements. The `<>` marks a place where any statement can go, and is not part of TypeScript's syntax.


`if` statements have two forms. First, the `if` (no else) statement:
```typescript
if (<condition>)
   <then-statement>
```

where `<condition>` is an expression that evaluates to a boolean, and `<then-statement>` is another statement. If `<condition>` is true, `<then-statement>` runs. Otherwise, it is skipped. The parentheses around `<condition>` are necessary.

While technically `<then-statement>` need not be a block, in this course we will always make it a block statement, as this improves clarity:

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

There is one exception. We allow `<else-statement>` to be another `if` statement without a block around it. This lets us chain `if-else` statements to test several conditions in turn:

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


</details>

A chain of `if` statements tests its conditions one after another until one holds, which is what `letterGrade` needs:

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

In the code above, once one condition is true and its branch runs, none of the other branches run. We've written what we intend in each branch, but how do we say what the function should evaluate to in TypeScript?

### `return` Statements

A TypeScript function returns a value only through a `return` statement. The **`return`** statement hands a value back to whoever called the function and stops the function there.

<details class="tooltip ts-tips">
<summary><code>return</code> Statements</summary>

`return <expression>;` evaluates the expression `<expression>` to a value `v` (for example, `2 + 3` to `5`), stops executing the function there, and returns this `v` to the caller of the function.

For instance, if the function `foo` contains `return <expression>;`, then when that statement runs, `foo` evaluates `<expression>` to `v`, and the call `foo()` is replaced with `v`.

The `return` statement only makes sense if it appears in a function definition (or a method definition, which [Chapter 10](../part2/01_abstraction#class-functionality) introduces).
</details>

The simplest example of a return statement is in the function `getString` below, which always returns the string `"STRING"`:

```typescript
function getString(): string {
    return "STRING";
}
```

To finish `letterGrade`, we add a `return` statement to each branch:

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
<summary><code>if</code> vs <code>cond</code></summary>

`if` works much like `cond`.

An equivalent ISL function to `letterGrade` looks like:

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

The TypeScript version says the same thing with statements: each `cond` clause becomes an `if` whose body returns that clause's value, and `else` becomes the final `return`. The behaviour is identical. What changed is that you spell out the control flow step by step rather than as a single expression.

The core difference between `if` and `cond` is that `cond` is an expression: `cond` evaluates to one value. The bodies of the functions you defined in ISL contained a single expression `e` (above, `e` is the `cond` expression) and `(letter-grade 87)` evaluates `e` with `87` in the place of `score`.

In TypeScript, a function body is not a single expression: it is a list of statements which will be run in order. TypeScript functions will not return a value unless they are told to by a `return` statement. Later, we'll see that we might want to write functions that have no `return` statements at all.


</details>

<details class="tooltip exercise">
<summary>Exercise: <code>{}</code> for Clarity</summary>

In this course, we will use block statements as the statement after any `if` conditions. In the wild, you may see `if` statements that aren't followed by `{`. You should be able to read those as well.

Consider the following piece of code:
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
1. Suggest three inputs you would pass to `toPassFail` to check its behaviour.
2. Without executing the code, predict, for each input, what `toPassFail` would return.
3. Execute `toPassFail(i)` for each input `i` you've decided on. Does its return value match your prediction? Why or why not?

<!-- Potential unverified solution:

```typescript
import { test, checkExpect } from "@ubccpsc/210-toolkit/testing";

test("60 passes", checkExpect(() => toPassFail(60), "PASS"));
test("20 fails", checkExpect(() => toPassFail(20), "FAIL"));
test("-5 is reported as FAIL, not NEGATIVE", checkExpect(() => toPassFail(-5), "FAIL"));
```

Three inputs cover the three apparent cases: `60`, `20` and `-5`. Read by its indentation, the code seems to return `"PASS"`, `"FAIL"` and `"NEGATIVE"`. It returns `"PASS"`, `"FAIL"` and `"FAIL"`. Without braces, the outer `if (s > 0)` governs only the one statement after it, `if (s > 50) return "PASS";`. The second inner `if` is a separate statement that runs for every input, and the `else` belongs to it, the nearest `if`, not to the outer one. So `"NEGATIVE"` is returned only when `s > 50` is false and `s <= 50` is false, which never happens. Blocks would make the intended structure the actual structure.
-->

</details>

### Combining Conditions

`letterGrade` never writes down the lower bound of a grade. Its `"B"` branch runs only when `score >= 68` is `true` and `score >= 80` was `false`, so the chain tests `score < 80` without saying so. A condition that has to stand on its own must say both parts, and the **logical operators** build one condition out of others:

- `a && b` ("and") is `true` only when `a` and `b` are both `true`.
- `a || b` ("or") is `true` when at least one of `a` and `b` is `true`.
- `!a` ("not") is `true` when `a` is `false`.

A function that reports whether a score earns a `"B"`, with no earlier branch to rule out the higher grades, needs both bounds in one condition:

```typescript
function isB(score: number): boolean {
    return score >= 68 && score < 80;
}

isB(70);    // evaluates to true
isB(80);    // evaluates to false: the first comparison is true, but the second is not
isB(67);    // evaluates to false: the first comparison is false
```

`&&` and `||` evaluate their left operand first, and skip the right one when the left already settles the answer: `false && b` is `false` whatever `b` is, and `true || b` is `true`. This is called **short-circuit evaluation**, and it lets the left operand guard the right one. In this course, both operands are always expressions that evaluate to a `boolean`.

We rarely write `!`. A condition such as `found === false`, or `found !== true` where that reads more naturally, states what is being tested, whereas `!found` asks the reader to work it out. The comparison is more visible to a new reader, so that is the form you will see throughout the textbook.

<details class="tooltip link-110">
<summary><code>and</code>, <code>or</code> and <code>not</code></summary>

These are ISL's `and`, `or` and `not`, written between their operands instead of before them. The ISL version of `isB` is:

```racket
; Number -> Boolean
; produce true if score earns a B
(define (is-b? score)
  (and (>= score 68) (< score 80)))
```

ISL's `and` and `or` also stop as soon as the answer is settled, so short-circuit evaluation is not new either. What is new is that TypeScript allows operands that are not booleans. The [Uncovered Language Features](../reference/language-features#truthiness) page explains what happens then, and why we keep our operands boolean.

</details>

## Static and Dynamic Views

There are two natural perspectives through which you can view any program. The **static** view is what you see when you look at your source code. It is fixed text sitting in a file, and it can be read and analysed without being executed. Types you write down in a function signature are static, as is the overall structure of your code. The compiler works entirely in this static world, and it can check your types before the program runs.

But we do not just write programs for them to sit as text on a filesystem. We write programs to do things, which gives rise to the **dynamic** view of the program. When the code executes, it is run on some actual inputs, which cause variables in the code to take on different values, and control flow statements to follow different branches. Which branch an `if` takes, what a variable holds at a given moment, and how many times a piece of code runs are dynamic facts, decided as the program runs and often different from one run to the next.

The two views also explain when errors appear. In ISL and other dynamically typed languages (such as Python), a type mistake surfaces while the program runs, and only if you happened to execute code that hits that type mistake. These are **runtime** errors, because they happen at the time the program runs. You will also see them called dynamic errors.

In TypeScript, the `tsc` compiler checks the types of your entire program first, before any of it runs. This is what it means for types to catch bugs "before runtime". We call these errors, and any other errors reported before running the program, static errors.

Keeping these two views apart is useful because different kinds of problems appear in each. The compiler can rule out a whole category of mistakes statically, just by reading the text, but it cannot know what will happen once the program runs on a given input. So static checking, however good, never removes the need to run and test a program. We return to this theme throughout the course.

## Testing the Dynamic View

While the TypeScript compiler checks the static view of the program, we need to check the dynamic view ourselves. We do this through a process called _testing_.

To begin with, we test with `checkExpect`, a function that runs an expression and checks whether its value matches the value we expect. A check is always given a name and handed to `test`, which registers it with the testing framework. For example, to ensure that `letterGrade(88)` evaluates to `"A"`, we can write the following test:

```typescript
test("Score of 88 returns an A", checkExpect(() => letterGrade(88), "A"));
```

This cannot be checked statically, so we must run the test to check the program's behaviour. If the call produces the expected value, the check passes. If they differ, the check fails with an error that describes the expected behaviour that was violated.

TypeScript has no built-in `checkExpect`. We built it for this course to match CPSC 110 and to need less syntax than most testing libraries.

<details class="tooltip ts-tips">
<summary>Anatomy of a <code>checkExpect</code></summary>

A `checkExpect` takes two arguments:

```typescript
checkExpect(() => <actual>, <expected>);
```

`<actual>` is an expression whose value you want to check. This is usually a call to the function under test, such as `letterGrade(88)`. It is wrapped in `() =>`, an _anonymous_ **arrow function** (a syntax we explain below), so that the expression is not evaluated where you write it: `checkExpect` decides when to run it. A parameterless function that wraps up a computation this way is called a **thunk**, programming jargon from the 1960s glossed as the past tense of _think_: an expression already thought about, set aside to be evaluated when it is needed. `<expected>` is the value you are claiming that expression should produce, such as `"A"`.

Note that there are no braces around `<actual>`, and no `return` in front of it. An arrow function written this way implicitly returns the value of its single expression, as the Arrow Functions tooltip below explains. With braces, `() => { letterGrade(88) }` returns nothing, and the compiler reports a type error for that check, because a thunk that returns nothing cannot be compared with `"A"`.

</details>

<details class="tooltip ts-tips">
<summary>Anatomy of a Test Case</summary>

A test case gives a check a name and registers it with the testing framework by passing it to `test`. Both `test` and `checkExpect` are provided by the course toolkit, imported once at the top of a test file:

```typescript
import { test, checkExpect } from "@ubccpsc/210-toolkit/testing";

test(<description>, checkExpect(() => <actual>, <expected>));
```

`test` takes two arguments. `<description>` is a string that names the case, such as `"Score of 88 returns an A"`. It is printed in the test output, so it should state what the case checks. The second argument is the check that forms the body of the test. Each test case holds exactly one `checkExpect`, so a test that fails always names the single expectation that was violated.


</details>

Suppose we had a more fine-grained expectation of how letter grades should be computed and wrote the following test:

```typescript
test("Score of 95 returns an A+", checkExpect(() => letterGrade(95), "A+"));
```

In this case the test would fail, because `letterGrade(95)` evaluates to `"A"` in our current implementation.

<details class="tooltip ts-tips">
<summary>Arrow Functions</summary>
An arrow function with a single expression in its body is written:

```typescript
(x: X, y: Y, z: Z) => <return-exp>
```

This defines an anonymous function with 3 parameters (`x`, `y`, `z` of types `X`, `Y`, `Z`), which, when called, evaluates the expression `<return-exp>` with the given argument values, and returns the resulting value. There is no `return` keyword here, and there are no braces: a single-expression arrow function _implicitly returns_ the value of its expression. This is the form the thunks we pass to `checkExpect` take until Chapter 6.


</details>

<details class="tooltip link-110">
<summary>Lambdas</summary>

You have seen anonymous functions before: in CPSC 110 they were called **lambda expressions**. When you wrote a `lambda` to pass to an abstract function like `filter`, you were creating a function without naming it, right at the place it was needed:

```racket
(filter (lambda (n) (> n 5)) (list 3 6 9))
```

TypeScript's arrow syntax does the same job: `(n: number) => n > 5` means the same thing as `(lambda (n) (> n 5))`. The `() =>` in the check above is a lambda that takes no parameters, like `(lambda () ...)`. The expression under test is wrapped in an anonymous function so that it can be handed to `checkExpect` and executed later, just as `filter` decided when to call your lambda.

A function like `checkExpect` or `filter`, which takes another function as an argument, is called a **higher-order function**. You used several in CPSC 110, including `map`, `filter`, and `foldr`.
</details>

#### Learning New Languages

Much of what you learned in CPSC 110 carries over to TypeScript: the way you design data, break a problem into functions, and reason about behaviour.

What is new is mostly enforcement and form. We write types into the program and `tsc` checks them, rather than leaving them in an unchecked comment. We write conditional control flow with statements like `if` and `return`, rather than as a single `cond` expression.

<details class="tooltip exercise">
  <summary>Exercise: Battery Status</summary>

_Note: End-of-chapter exercises will contain hints hidden like so: <span class="hint">hello I'm a hint!</span>. In general, these hints hide design decisions that, by the end of the course, we expect you to be able to make on your own. However, if you are going through the exercise for the first time and want coding practice, you can reveal the hints._

Put this chapter's pieces together on a new problem: a typed function, an `if`/`return` chain, and a test.

> As a phone user, I want the battery percentage shown as a status word, so that I can tell at a glance how urgently I need to charge.

Write a function called `batteryStatus` that turns a battery percentage number into a status string. The function should return `"critical"` for numbers below 10, `"low"` from 10 up to (but not including) 30, `"ok"` from 30 up to 80, and `"full"` for 80 or above.

1. Write the function signature, <span class="hint">naming the parameter `percent` with the type `number`, and using `string` as the return type.</span>
2. Implement the body <span class="hint">with a chain of `if` / `else if` / `else` statements,</span> <span class="hint">each branch `return`ing the right status.</span> The order of the statements will matter here!
3. Write one `test` per status, each holding a single `checkExpect`, choosing one representative percentage per case. Predict each result before running the tests, then run them.
4. What does the compiler report if you call `batteryStatus("low")`? Decide before you try it, then confirm.

<!-- Potential unverified solution:

```typescript
import { test, checkExpect } from "@ubccpsc/210-toolkit/testing";

function batteryStatus(percent: number): string {
    if (percent < 10) {
        return "critical";
    } else if (percent < 30) {
        return "low";
    } else if (percent < 80) {
        return "ok";
    } else {
        return "full";
    }
}

test("5 percent is critical", checkExpect(() => batteryStatus(5), "critical"));
test("20 percent is low", checkExpect(() => batteryStatus(20), "low"));
test("50 percent is ok", checkExpect(() => batteryStatus(50), "ok"));
test("90 percent is full", checkExpect(() => batteryStatus(90), "full"));
test("10 percent is low (boundary)", checkExpect(() => batteryStatus(10), "low"));
test("30 percent is ok (boundary)", checkExpect(() => batteryStatus(30), "ok"));
test("80 percent is full (boundary)", checkExpect(() => batteryStatus(80), "full"));
```

Step 4: the call `batteryStatus("low")` does not compile. The compiler reports `Argument of type 'string' is not assignable to parameter of type 'number'`, so the mistake is caught before the program runs.
-->

</details>
