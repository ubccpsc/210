# What This Course Assumes You Know

The main prerequisites for CPSC 210 are CPSC 110 and CPSC 121. This textbook is written with that knowledge in mind. It does not re-teach that material, but it leans on it constantly: this textbook assumes you have designed data before writing code, derived a function's shape from the shape of its input, and written down what you expected a function to produce before you produced it. For students entering CPSC 210 without having taken CPSC 110, this page tries to bring that pre-requisite knowledge together for you to review in advance. We also hope having it here will help students who _did_ take CPSC 110 to review and reference their past knowledge and apply it to this course.

Throughout the textbook, purple deep dives highlight links to prior knowledge. This chapter is an index to those call-outs, gathered before you need them rather than scattered across the textbook.

The main thing we are asking you to recall is a way of _thinking_ rather than _language syntax_. CPSC 110 is taught in a set of teaching languages built on Racket, and the code in this document is written in them. But the ideas are what matter.

<details class="tooltip deep-dive">
<summary>If You Came Through CPSC 103 and CPSC 107</summary>

The two paths cover much the same ground and use different words for parts of it. CPSC 103 provides the design recipes, data definitions, and testing discipline under the same names. CPSC 107 provides the functional material: higher-order functions, closures, recursion over recursively defined data. While the notation and syntax will differ, the important concepts are all the same.


</details>

## Working Systematically

CPSC 110's main claim is that getting from a problem statement to a working program is a process you can follow. When you are stuck, you ask what step you are on and what that step asks for next. This is operationalized around three activities:

_Describing._ Writing down what the program deals with and what it should do: what the information is, how it is represented, what must always be true of it, and what each function promises.

_Constructing._ Deriving the code from those descriptions. The shape of the data determines the shape of the function, so if you do not know how to start, the description tells you what the branches are.

_Checking._ Confirming the result is right. Examples are written before the code they test, the cases to write come from the description, and you can follow a value through a program.

The design recipes make these three activities second nature. The **How to Design Functions** recipe, HtDF, is the clearest example. It looks like a list of six steps:

1. _Signature._ What types go in and what type comes out.
2. _Purpose._ One line saying what the function produces, not how.
3. _Stub._ A definition with the right name and arity that returns a value of the right type, so the file runs.
4. _Examples._ Concrete input-and-expected-output pairs.
5. _Template._ The skeleton, derived from the data definition of the input.
6. _Body._ The implementation, filling in the template until the examples pass.

But those six steps are only three kinds of activities. Steps 1 and 2 _describe_. Step 4 _checks_. Steps 5 and 6 _construct_. Step 3 is scaffolding that keeps the file running while the rest is unfinished. In this process, the order matters. Each step can be answered using only what the earlier steps produced, so you never face the whole problem at once.

CPSC 210 does not grade you on following a recipe, and this textbook does not ask you to write out templates. What it does assume is that you have internalised what the recipes were for: _describe the thing before you build it, and let the description drive both the building and the checking._

Every part of this textbook is a variation on that process. Part 1 describes data with types and behaviour with tests. Part 2 describes what a class promises before deciding how it delivers. Part 3 describes the contract a system publishes to people to use within their own systems.

## Describing: Saying What Before How

Everything in this section is something you write down before you write code: a data definition, an interpretation, an invariant, a signature, a purpose. CPSC 110 spends much of its time here, because constructing and checking both depend on having a description to work from.

### Modelling: From Information to Data

CPSC 110 considers **information** is what exists in the problem domain, and **data** is how you represent it in the program. Moving from one to the other is **modelling**, and is a design activity.

This is important because information can usually be represented in multiple ways. For example, a song's duration is three minutes and thirty seconds. You could model that as a count of seconds:

```racket
;; Duration is Natural
;; interp. the length of a track in seconds
(define D1 210)
```

or as minutes and seconds kept apart:

```racket
(define-struct duration (minutes seconds))
;; Duration is (make-duration Natural Natural)
;; interp. the length of a track, where seconds is under 60
(define D1 (make-duration 3 30))
```

Both represent the same information. The first makes arithmetic trivial, since adding two durations is just `+`, but makes display harder. The second makes display trivial, but every calculation has to normalise times.

This is what makes modelling design an explicit task. You choose which operations become easy, which become awkward, and which invalid values become possible. A representation that cannot express nonsense is usually worth the cost, and that idea runs through the textbook: [Using Types to Model Problems](../part1/02_model-types) asks how much of your intent a type can be made to check, and Part 2 asks the same question of classes.

### Describing a Class of Values

The **How to Design Data** recipe, HtDD, is the systematic part of modelling. Different kinds of information call for different kinds of description, and CPSC 110 gives you a fixed set of forms to choose between.

- **Atomic data**, a single indivisible value: a number, a string, a boolean.
- **Intervals**, an atomic type narrowed to a range, as in `Number[0, 10]`, or `Natural` for whole non-negative numbers.
- **Enumerations**, a fixed and finite set of distinct values.
- **Itemisations**, several cases of different kinds gathered into one definition. 
- **Compound data**, several pieces of information that travel together and only make sense together, as with the `duration` structure above.
- **Self-referential data**, a definition that mentions itself, which is how you describe information whose size you do not know in advance. 
- **Mutual reference**, two or more definitions that refer to one another, as with a tree whose nodes hold lists of trees.

Choosing the form is where you decide what the pieces of your problem are, which belong together, and which are the same thing in different states. Every one of these forms reappears in this textbook, usually with a type the compiler checks in place of a comment it ignores.

### Invariants: The Part the Language Did Not Check

An **invariant** is a property that must hold for a value to be meaningful. If it does not hold, the value makes no sense.  Every program has invariants. What differs between languages is whether there is any way to explicitly capture them. In many languages there is not, so they end up in the author's head, in a comment, or in defensive checks added after something went wrong. CPSC 110 gives them a place, and in 210 they are covered in two chapters.

In the teaching languages, invariants live in data definitions and signatures. An interval data definition states one directly:

```racket
;; Fee is Number[0, 10]
;; interp. a late fee in dollars
```

The type is `Number`, and the meaningful subset is 0 to 10. Values outside that range are not fees.

A signature can state one too. Writing `Natural` rather than `Number` for a parameter is a **precondition**: the function is meaningful only for whole, non-negative inputs, and says nothing about what happens otherwise. The `seconds is under 60` clause in the duration model above is the same kind of statement, as is a definition saying that a playlist is never empty.

Here is what matters most for CPSC 210: _nothing enforced the invariants._

The teaching languages do not check interval definitions or preconditions. A `Fee` of `150` can be built. A `Natural` function can be called with `-3`. `(make-duration 3 90)` is a value the language accepts without complaint.

Structures made with `define-struct` cannot be modified once built, so nothing corrupts a valid value later. But nothing validates one as it is created either, so a caller can build a value that contradicts the interpretation written directly above it.

Invariants were therefore kept by discipline: building values only through your own helper functions, and respecting signatures the language treated as comments. That works for one author in one file but is insufficient when a program has more code, more authors, or a longer deployed life.

Much of Part 1 and Part 2 is about what to do when that discipline is not enough:

- [Checking Invariants](../part1/03_checking-invariants) sorts out which constraints a type can enforce and what to do about the rest. A checked type still cannot express an interval, a non-empty list, or a relationship between two fields.
- [Maintaining Invariants](../part1/04_maintaining-invariants) routes creation through a constructor that validates.
- [Encapsulating What Varies](../part2/03_encapsulation) hides the representation so that outside code cannot reach past the operations you provide.

Taken together, they trade programmer discipline for language enforcement.

### Working on What You Cannot Finish Yet

The _wish list_ is a habit, not a language feature. When a function needs a helper that does not exist, you write down the helper's signature and purpose, call it as though it were finished, and carry on with the function you set out to write.

This lets you work on one detail at a time. It also means that while the helper is unwritten, its signature and purpose are all anyone can rely on: a contract standing in advance of an implementation.

This textbook uses the idea in three ways. [Defining Boundaries with Interfaces](../part2/05_boundaries) makes that arrangement permanent and enforced. [Designing APIs to Provide Data and Services](../part3/03_api_design) turns the contract outward, to readers who are strangers rather than yourself an hour later. And [Adding New Features](../part3/06_new_features) uses it in reverse, as the discipline for reading an unfamiliar system.

## Constructing: From Description to Code

Construction is usually top-down in CPSC 110: a description you have already written determines the shape of the code, and you read that structure  rather than inventing it. Sometimes it is bottom-up, when several functions differ in only one place and the common part is worth naming.

### The Shape of the Data Determines the Shape of the Code

This is the core technical idea we would like you to carry forward from CPSC 110. Once the data is described, the structure of a function that consumes it follows from that description. An itemisation with three cases becomes a body with three branches. A compound value becomes a body that pulls out the fields. A self-referential definition becomes a **natural recursion**: a call to the same function on the smaller part.

```racket
;; ListOfSong -> Natural
;; produce the number of songs in los
(define (count-songs los)
  (cond [(empty? los) 0]
        [else (+ 1 (count-songs (rest los)))]))
```

The shape of that function was not chosen; it came from the shape of the data. A **template** is that skeleton, written down before you think about the specific problem. This has two implications:

The first is that structure is derivable. When you do not know how to start, look at the shape of what you are consuming; it will tell you what the branches are.

The second is that the dependency runs both ways. If every function's shape comes from a data definition, then changing that definition means revisiting every function derived from it, however unrelated they are to your reason for the change. 

In CPSC 110 this was tedious. In CPSC 210 it is one of the central design concerns of the course, and we call it **coupling**. [Coupling and Dependencies](../part3/01_coupling) describes the same effect between classes rather than between functions and data definitions.

### Arbitrary-Sized Information

How you use lists will be different in this course than CPSC 110. A list in the teaching languages is self-referential data: `empty`, or an element followed by a list. That description is why traversing one means recursion (handle the empty case, handle the first element, recur on the rest), and why there is no way to jump to the middle. The recursion was the shape of the data showing through.

CPSC 210 mostly uses arrays, which hold the same information but allow direct access to any position, and loops, which perform in one statement the traversal you used to spell out as a recursive call.

### Abstraction: Noticing Commonality

CPSC 110 introduces abstraction as a response to something you can see: two functions that are identical except in one place. You then write a single function with that place as a parameter.

```racket
(map (lambda (r) (* r 2)) (list 1 2 3))     ; (list 2 4 6)
(filter positive? (list -1 2 -3))           ; (list 2)
(foldr + 0 (list 1 2 3))                    ; 6
```

Two ideas come together here. The first is that a function can be a value: passed as an argument, stored, returned. The second is that a function can be described without committing to the types it works over, which is what a signature like `(X -> Y) (listof X) -> (listof Y)` says about `map`.

Part 2 is largely about abstraction, in a different form: instead of parameterising a function over an operation, you define an interface and let each implementation supply its own. The question is the same: what varies, and can it be named and extracted? The type-parameter idea returns as generics.

### Scope and Closures

`local` introduces definitions visible only inside one expression:

```racket
(define (make-counter n)
  (local [(define (increment) (make-counter (+ n 1)))
          (define (get-count) n)]
    (make-counter-interface increment get-count)))
```

The inner functions can see `n`, the parameter of the enclosing function, and they go on seeing it after `make-counter` has returned. A function bundled with the bindings it can see is a **closure**.

`n` is reachable by `increment` and `get-count` and nothing else, so the only way to change it is through the operations you provided. That is information hiding built out of scope, and the first way you had of making an invariant impossible to violate rather than merely documented. [Maintaining Invariants](../part1/04_maintaining-invariants) makes the comparison directly, and Part 2 builds classes on the same intuition.

## Checking: Knowing It Is Right

Checking is not something that happens after the code is finished. Examples come before implementations, the cases to write come from the same descriptions that shaped the code, and raising an error is how a program reports a violated invariant.

### Testing Systematically

Most people arriving at this course have written a test. Fewer have written one _before_ the code it tests, and fewer still have _derived_ a set of test cases from a description rather than thinking some up. Three ideas sit underneath how we think about testing.

_An expectation written as code is checked every time._ An expectation held in your head is checked once, manually. This much is common to any testing practice.

_Examples written first do work that examples written afterwards cannot._ Deciding what a function should produce, before deciding how it will produce it, forces you to understand the problem before you start thinking about your code. A test written afterwards, against code you have just convinced yourself is correct, tends to encode what the code does rather than what it should do. 

_Which examples to write is a question with an answer._ This is the idea most easily missed, and the next section is about it.

#### Where Examples Come From

Test cases are derived, not invented. If you have previously chosen cases by intuition, or written tests until it felt like enough, this is where to slow down. The description of the data does the work. Each form of data definition says how many cases there are:

- An _enumeration or itemisation_ needs an example per case. Three cases, three examples, and the count is checkable.
- An _interval_ needs its edges. `Number[0, 10]` invites examples at 0 and at 10, because mistakes cluster at boundaries rather than in the comfortable middle.
- _Self-referential data_ needs the base case and at least one recursive case, since those exercise the two branches the template produced.

[Checking Invariants](../part1/03_checking-invariants) gives that reasoning its formal names: **equivalence class partitioning** and **boundary value analysis** are what "one per case" and "check the edges" become when stated precisely.

#### Saying More Than "Equal"

CPSC 110 also provides a family of checks, and the idea behind the family is that an assertion can state something more precise than equality:

```racket
(check-expect (late-fee 2) 0)
(check-within (average '(1 2)) 1.5 0.001)
(check-member-of (pick-one '("a" "b")) "a" "b")
(check-range (score-of test) 0 100)
(check-error (require-section cat "missing") "no section with id")
```

A number is close enough; a value is one of several; an expression must fail. Choosing the check that says what you mean matters most when a test fails, because the report then names the problem rather than showing an inequality you have to interpret. [Chapter 9](../part1/09_validation) has a much larger vocabulary of the same kind, and goes on to ask how you judge whether a suite checks comprehensively enough.

### Signalling Failure

`error` stops the program with a message:

```racket
(define (require-section catalogue id)
  (cond [(false? (find-section catalogue id)) (error "no section with id" id)]
        [else (find-section catalogue id)]))
```

Raising an error is often what should happen when an invariant is violated, and `check-error` was how you tested for it. TypeScript's `throw` is the same idea with formal language-provided mechanisms: failures can be caught, they carry types, and deciding which failures deserve one is a design question rather than a reflex. [Designing for Failure](../part1/08_errors) covers this process.

### Reasoning About What a Program Does

In the teaching languages, a name is bound once. `(define course-name "CPSC 110")` associates a name with a value, and nothing later can change it. That sounds like a restriction, but it has value: any name can be replaced by the value it stands for, anywhere, without changing what the program means. A program can therefore be understood by substitution, one step at a time, and that is what DrRacket's stepper shows you.

The stepper was a teaching tool, and it was also the first debugger you may have used: when a value came out wrong, stepping showed the point where it stopped being what you expected.

[Debugging and Fault Localization](../part3/05_debugging) builds upon the stepper, applied under harder conditions, where the program holds state, the stack is deep, and you have to choose where to look.

Giving up single binding is the most significant change in Part 1, which is why [Mutation and Side Effects](../part1/06_state-mutation) works through it slowly. Once a name can be reassigned, it can no longer be replaced by "its value", because which value it holds depends on where the program has got to.

## Building on CPSC 121

CPSC 110 gave you a process for building software. CPSC 121 gave you the vocabulary for stating precisely what must be true of a program and arguing that it stays true. This textbook uses that vocabulary throughout, but in English rather than notation, which makes the connection easy to miss.

Seven ideas from CPSC 121 appear in this textbook, none under their CPSC 121 names.

### An Invariant Is a Predicate

The invariants in Part 1 are quantified statements, written in English. "No two readings share the same day and hour" is a claim about _all_ pairs of readings. "The collection contains no duplicates" says there is no such pair. A precondition is a predicate over a function's arguments, and a postcondition is a predicate over its result.

Two points from CPSC 121 matter in practice. First, the negation of "every element satisfies P" is "some element does not satisfy P", not "every element fails P". Get this wrong and your checks and error messages report a different condition from the one that failed.

Second, a constraint relating two fields, such as a booking whose start must not fall after its end, is a two-place predicate. It cannot be enforced by validating each field on its own.

An invariant stated as a predicate can be asserted in a constructor and tested; a vague one cannot. [Checking Invariants](../part1/03_checking-invariants) and [Maintaining Invariants](../part1/04_maintaining-invariants) apply this directly.

### Establishing and Preserving an Invariant Is an Induction

[Maintaining Invariants](../part1/04_maintaining-invariants) states the rule in two parts: the invariant must be _established_ when a value is created, and every operation that produces a new value from an old one must _preserve_ it. It concludes that every value that ever exists is valid. That conclusion is an induction: construction is the base case, each operation is the inductive step, and the result holds for every state the program ever reaches, without listing them. This is why a few checks in a constructor are enough to guarantee a property for the lifetime of the program.

The same argument appears in [Using Types to Model Problems](../part1/02_model-types), which observes that a recursion over a playlist terminates because every playlist ends in the empty case. That is structural induction: the argument follows how the data was built, and it holds because the data definition allows no other way to build it.

In practice, this changes the question to ask when reviewing a class: not whether each method works, but whether any operation can break the invariant. One unguarded operation breaks the inductive step, and the guarantee fails for every state after it.

### Choosing a Set Is a Modelling Decision

A `Set` holds each value at most once and can tell you whether a value is in it. [Encapsulating What Varies](../part2/03_encapsulation) changes a guest list from an array to a `Set` because the class was maintaining a uniqueness invariant by hand, and a set enforces that on its own. So choosing between an array and a set is a modelling decision: are order and repetition part of the information, or just a side effect of how it is stored?

Sets also underlie testing. Equivalence class partitioning in [Validating Behaviour](../part1/09_validation) divides the inputs into classes where any member is as good as any other. A partition is disjoint and covering: covering is why one input per class is enough, and disjointness is why the number of classes is the number of tests you need.

### Every Condition Is a Proposition

Every `if` tests a proposition, and compound conditions combine them with the connectives CPSC 121 gave truth tables for. This has two consequences.

The first is negation. Rewriting `!(a && b)` as `!a || !b` is a logical equivalence, and getting it wrong still compiles and still returns a value, so the fault is easy to miss.

The second is coverage. [Validating Behaviour](../part1/09_validation) asks for tests that reach every branch, and finding an input that reaches a branch means working backwards from its condition to values that make it true. When a branch is never taken, either no test tries those values or no such values exist.

One difference from CPSC 121: TypeScript stops evaluating `&&` and `||` as soon as the result is known. Unlike in a truth table, the operands cannot be reordered freely; a check that a value exists must come before the use that depends on it.

### Numbers Are Stored, and Storage Is Finite

CPSC 121 covers how numbers are represented in binary. That is why `(11 / 20) * 100` evaluates to `55.00000000000001` in TypeScript: one fifth has no finite binary expansion, for the same reason one third has no finite decimal expansion, so the stored value differs from the exact value before any arithmetic happens. [Learning a New Programming Language](../part1/01_new-language) covers the consequences.

### A Stateful Object Is a Machine With States

CPSC 121 introduces finite automata: a finite set of states, transitions driven by input, and distinguished accepting states. An object that holds state has the same structure. [Asynchronous Effects and Time](../part1/07_async) has a direct example: a promise has exactly three states and settles once and only once. Fulfilled and rejected have no outgoing transitions, which is why a settled promise cannot change and why attaching a handler to one still works.

The same view applies to the types in [Mutation and Side Effects](../part1/06_state-mutation) and Part 2. Ask which states a value can be in, which transitions are allowed, and which are one-way, and you get a diagram you can draw and check. An invariant, in these terms, says that no state outside the intended set is reachable.

### Programs Run on a Machine

The last part of CPSC 121 builds a working computer: memory, the fetch-decode-execute cycle, and Big-O notation for cost. CPSC 210 does no complexity analysis, but it does assume the model underneath: a program is instructions running against a memory hierarchy, and different operations cost wildly different amounts. [Asynchronous Effects and Time](../part1/07_async) depends on that: it traces a file read down through the runtime and the operating system and back. Asynchronous code exists because disk and network access are far slower than memory, so a program cannot afford to stop and wait.

## Reference

Things to consult rather than read through: how to read the notation in the examples above, what each prerequisite course covers that this textbook does not use, what changes in CPSC 210, and where each idea reappears.

### The Notation

Little of the above depends on how the teaching languages are written, but the examples do, so here is the short version.

_Everything is prefix._ The operator comes first, inside parentheses, and the operands follow. There is no precedence to remember, because the parentheses say what groups with what.

```racket
(+ 2 3)
(> score 80)
(string-append "CPSC " "210")
```

TypeScript writes most operators between their operands instead. This is the first difference you will meet and the least important one.

`define` binds a name to a value or defines a function. `cond` chooses between answers, one clause per case, with `else` last; `if` does the same for two cases. `lambda` builds a function without naming it, at the point where it is needed, and becomes TypeScript's arrow syntax. `local` scopes definitions to a single expression.

```racket
(define (letter-grade score)
  (cond [(>= score 80) "A"]
        [(>= score 68) "B"]
        [(>= score 55) "C"]
        [(>= score 50) "D"]
        [else "F"]))
```

_Numbers are exact._ Dividing two integers yields an exact rational: `(/ 35 50)` is `7/10`, not `0.7`, and multiplying that by `100` gives exactly `70`. TypeScript has a single `number` type that stores a binary approximation, so the order of your arithmetic starts to matter and equality on computed decimals stops being reliable. [Learning a New Programming Language](../part1/01_new-language) covers the consequences.

### Shifts from CPSC 110

There are some significant changes in how we think about computation in CPSC 210 compared to CPSC 110::

- _Part of your description becomes enforced._ A type is checked before the program runs, so a whole class of mistake stops being possible. The invariants a type still cannot express, such as an interval, a non-empty list, or a relationship between two fields, are exactly what Part 1 and Part 2 spend their time protecting.
- _Mutation exists._ Names can be reassigned and structures modified in place. This buys efficiency and expressiveness, and costs you both the ability to reason by substitution and the guarantee that a value built valid stays valid.
- _Data arrives from outside._ In CPSC 110 every value your functions consumed was one your own code had built, usually a few lines earlier. Once data comes from a file, a service, or a person, a data definition is a hope until something checks it.
- _Programs outlive the problem they were written for._ The design recipe assumed a fixed problem and delivered code already in a standard shape, so there was never anything to tidy up. Real systems change after they are written, and each change arrives without a recipe saying where it belongs. That is why Part 3 spends a chapter on putting a design back into a shape that fits what the system has since become.

### 110: Revisited

| CPSC CPSC 110 Topic | CPSC 210 Topic Extension |
| --- | --- |
| Modelling information as data | [Using Types to Model Problems](../part1/02_model-types) |
| Data definitions and their forms | [Using Types to Model Problems](../part1/02_model-types) |
| Interpretations and what they record | [Using Types to Model Problems](../part1/02_model-types) |
| Templates derived from data | [Using Types to Model Problems](../part1/02_model-types) |
| Prefix notation, `cond`, `if` | [Learning a New Programming Language](../part1/01_new-language) |
| Exact numbers | [Learning a New Programming Language](../part1/01_new-language) |
| `lambda` | [Learning a New Programming Language](../part1/01_new-language) |
| Intervals and `Natural` as invariants | [Checking Invariants](../part1/03_checking-invariants) |
| Examples before implementation | [Checking Invariants](../part1/03_checking-invariants) |
| Deriving examples from the data definition | [Checking Invariants](../part1/03_checking-invariants) |
| Functions as values | [Checking Invariants](../part1/03_checking-invariants) |
| Structures that nothing validated on construction | [Maintaining Invariants](../part1/04_maintaining-invariants) |
| Scope, closures, and hiding state | [Maintaining Invariants](../part1/04_maintaining-invariants) |
| Self-referential data | [Arrays and Iteration](../part1/05_arrays) |
| `map`, `filter`, `foldr` | [Arrays and Iteration](../part1/05_arrays) |
| Recursive traversal | [Arrays and Iteration](../part1/05_arrays) |
| Reasoning by substitution | [Mutation and Side Effects](../part1/06_state-mutation) |
| `error` and `check-error` | [Designing for Failure](../part1/08_errors) |
| The wider family of checks | [Validating Behaviour](../part1/09_validation) |
| Data and operations kept apart | [Building Abstractions with Classes](../part2/01_abstraction) |
| Invariants kept by discipline alone | [Encapsulating What Varies](../part2/03_encapsulation) |
| The wish list as a contract | [Defining Boundaries with Interfaces](../part2/05_boundaries) |
| Branching over the cases of a type | [Extending Behaviour Through Polymorphism](../part2/06_extension) |
| The cost of adding a case | [Growing Systems with the Open/Closed Principle](../part2/07_ocp) |
| Data definitions and the ripple | [Coupling and Dependencies](../part3/01_coupling) |
| Data you built yourself | [Consuming Data and Services by Using APIs](../part3/02_consuming_data) |
| Signatures and purpose statements | [Designing APIs to Provide Data and Services](../part3/03_api_design) |
| Why code never needed cleaning up | [Code Quality and Refactoring](../part3/04_refactoring) |
| The stepper | [Debugging and Fault Localization](../part3/05_debugging) |
| The wish list, in reverse | [Adding New Features](../part3/06_new_features) |

### 121: Revisited

| CPSC 121 Topic | CPSC 210 Topic Extension |
| --- | --- |
| Predicate logic and quantified claims | [Checking Invariants](../part1/03_checking-invariants) |
| Preconditions and postconditions as predicates | [Maintaining Invariants](../part1/04_maintaining-invariants) |
| Induction, base case and inductive step | [Maintaining Invariants](../part1/04_maintaining-invariants) |
| Structural induction over recursive definitions | [Using Types to Model Problems](../part1/02_model-types) |
| Sets, membership, and uniqueness | [Encapsulating What Varies](../part2/03_encapsulation) |
| Partitions as disjoint and covering | [Validating Behaviour](../part1/09_validation) |
| Propositional connectives and negation | [Learning a New Programming Language](../part1/01_new-language) |
| Truth tables and satisfying assignments | [Validating Behaviour](../part1/09_validation) |
| Binary representation of numbers | [Learning a New Programming Language](../part1/01_new-language) |
| Finite state machines | [Mutation and Side Effects](../part1/06_state-mutation) |
| States, transitions, and absorbing states | [Asynchronous Effects and Time](../part1/07_async) |
| The machine underneath the program | [Asynchronous Effects and Time](../part1/07_async) |
