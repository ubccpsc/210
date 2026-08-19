# What This Course Assumes You Know

The main prerequisite for CPSC 210 is CPSC 110. This textbook is written with that prerequisite knowledge in mind. It does not re-teach that material, but it leans on it constantly: the chapters ahead assume you have designed data before writing code, derived a function's shape from the shape of its input, and written down what you expected a function to produce before you produced it. For students entering CPSC 210 without having taken CPSC 110, this chapter tries to bring that pre-requisite knowledge together for you to review in advance. We also hope having it here will help students who _did_ take CPSC 110 to review and reference their past knowledge and apply it to this course.

Throughout the textbook, purple deep dives highlight links to prior knowledge. This chapter is an index to those call-outs, gathered before you need them rather than scattered across the textbook.

What we are asking you to bring forward is a way of thinking rather than a language. CPSC 110 is taught in a set of teaching languages built on Racket, and the code in this chapter is written in them, but almost nothing we rely on is about how those languages are spelled. The ideas below are the part that matters, and each of them reappears in this course in a new language, TypeScript. If the notation in the examples is unfamiliar, there is a short guide to it near the end of this chapter; you can read the ideas first and look up the syntax afterwards.

<details class="tooltip deep-dive">
<summary>If You Came Through CPSC 103 and CPSC 107</summary>

The two paths cover much the same ground and use different words for parts of it. CPSC 103 gives you the design recipes, data definitions, and testing discipline under the same names. CPSC 107 gives you the functional material: higher-order functions, closures, recursion over recursively defined data.

What differs is vocabulary and notation. This textbook's call-outs are written in the CPSC 110 teaching languages, so the code in them will look unfamiliar even where the concept is not. Read the prose in those call-outs and treat the Racket as illustration; nothing in the rest of the textbook requires you to write it.

</details>

## Working Systematically

If there is one claim CPSC 110 exists to make, it is this one: getting from a problem statement to a working program is a process you can follow, not a flash of insight you wait for. When you are stuck, the answer is to ask what step you are on and what that step asks you to do next.

That claim shows up in three places, and we would like you to arrive with all three.

_Design is systematic._ Deciding how to represent the information in a problem is not guesswork. There is a small vocabulary of forms to choose between, the choice is driven by the shape of the information, and the choice is written down where the next reader can find it.

_Construction is systematic._ Once the data is described, the structure of the code that consumes it follows from that description. You do not invent the branches; you read them off. When you do not know how to start, the shape of what you are consuming will tell you.

_Testing is systematic._ Test cases are derived, not improvised. The description of the data says how many cases there are and where their edges lie, so "have I tested enough?" becomes a question with an answer rather than a feeling.

The recipes you followed in CPSC 110 are these three claims made operational. They break an intimidating question ("how do I write this program?") into a sequence of small ones, each with a definite answer, each producing something you can check before moving on.

CPSC 210 does not grade you on following a recipe, and this textbook does not ask you to write out templates. What it does assume is that you have internalised what the recipes were for: _describe the thing before you build it, and let the description drive both the building and the checking._ Every part of this textbook is a variation on that. Part 1 describes data with types and behaviour with tests. Part 2 describes what a class promises before deciding how it delivers. Part 3 describes the contract a system publishes to people you will never meet.

## Modelling: From Information to Data

Before any code exists there is a distinction CPSC 110 makes early and never drops: **information** is what exists in the problem domain, and **data** is how you chose to represent it inside the program. Getting from one to the other is **modelling**, and it is a design activity with real consequences, not a transcription step.

The consequences are easiest to see when the same information admits more than one representation. A song's duration is three minutes and thirty seconds. You could model that as a count of seconds:

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

Both represent the same information, and neither is simply better. The first makes arithmetic trivial, since adding two durations is just `+`, but leaves display as work to do. The second reads well and makes display trivial, but every calculation has to normalise, and it allows values like `(make-duration 3 90)` that represent nothing at all.

That last point is the one to think about. The first model cannot express an invalid duration, because every natural number is a valid number of seconds. The second can, so it needs a rule, "seconds is under 60", that lives in the interpretation and nowhere else.

This is what makes modelling design work rather than clerical work. You are choosing which operations become easy, which become awkward, and which invalid states become expressible. Choosing a representation that cannot express nonsense is generally worth paying for, and that idea runs through the whole textbook: [Using Types to Model Problems](../part1/02_model-types) asks how much of your intent a type can be made to carry, and Part 2 asks the same question of classes.

The interpretation line is where the model is recorded. `Natural` says which values are members; `interp. the length of a track in seconds` says what membership _means_. Without the second line, `210` is just a number, and the next person to read your code has to guess whether it is seconds, or milliseconds, or track number 210.

## Describing a Class of Values

The **How to Design Data** recipe, HtDD, is the systematic part of modelling. Different kinds of information call for different kinds of description, and CPSC 110 gives you a fixed set of forms to choose between. Recognising which form fits the information in front of you is the design decision; writing it down is bookkeeping.

- **Atomic data**, a single indivisible value: a number, a string, a boolean.
- **Intervals**, an atomic type narrowed to a range, as in `Number[0, 10]`, or `Natural` for whole non-negative numbers.
- **Enumerations**, a fixed and finite set of distinct values.
- **Itemisations**, several cases of different kinds gathered into one definition. This becomes a **tagged union** in Part 1.
- **Compound data**, several pieces of information that travel together and only make sense together, as with the `duration` structure above.
- **Self-referential data**, a definition that mentions itself, which is how you describe information whose size you do not know in advance. A list of songs is either empty, or one song followed by a list of songs.
- **Mutual reference**, two or more definitions that refer to one another, as with a tree whose nodes hold lists of trees.

Choosing the form is not a formality: it is where you decide what the pieces of your problem are, which of them belong together, and which are the same thing in different states. Every one of these forms reappears in this textbook, usually with a type the compiler checks in place of a comment it ignores.

## Invariants: The Part the Language Did Not Check

An **invariant** is a property that must hold for a value to be meaningful. Not a property a program happens to maintain, but one that has to be true or the value makes no sense: a late fee is never negative, a playlist always holds at least one track, a booking's start date never falls after its end date.

Every program has invariants. What differs between languages, and between courses, is whether there is anywhere to write them down. In many languages there is not, so they live in the author's head, or in a comment nobody updates, or in a scattering of defensive checks added after something went wrong. CPSC 110 is unusual in giving them a home, and this textbook gives them two chapters, so it is worth setting out carefully whether or not it is already familiar.

In the teaching languages, invariants live in data definitions and signatures. An interval data definition states one directly:

```racket
;; Fee is Number[0, 10]
;; interp. a late fee in dollars
```

The type is `Number`, and the meaningful subset is 0 to 10. Values outside that range are not unusual fees; they are not fees at all.

A signature can state one too. Writing `Natural` rather than `Number` for a parameter is a **precondition**: it says the function is meaningful only for whole, non-negative inputs, and says nothing at all about what happens otherwise. The `seconds is under 60` clause in the duration model above is the same kind of statement, as is a definition saying that a playlist is never empty.

Here is what matters most for CPSC 210: _nothing enforced any of it._

The teaching languages do not check interval definitions or preconditions. A `Fee` of `150` can be built. A `Natural` function can be called with `-3`. `(make-duration 3 90)` is a value the language accepts without complaint. Structures made with `define-struct` cannot be modified once built, so nothing corrupts a valid value later, but nothing validates one as it is created and nothing hides its fields, so a caller can construct a value that contradicts the interpretation written directly above the definition.

Invariants were therefore kept by discipline: building values only through your own helper functions, and respecting signatures that the language treated as comments. For one author working in one file, that mostly holds. It stops holding as soon as a program has more code, more authors, or a longer life than one person's attention can cover.

Where that discipline fails is the subject of much of Part 1 and Part 2. [Checking Invariants](../part1/03_checking-invariants) sorts out which constraints a type can now enforce and what to do about the rest, since a checked type still cannot express an interval, a non-empty list, or a relationship between two fields. [Maintaining Invariants](../part1/04_maintaining-invariants) routes creation through a constructor that validates. [Encapsulating What Varies](../part2/03_encapsulation) hides the representation so that outside code cannot reach past the operations you provide. Taken together, they trade programmer discipline for language enforcement.

## The Shape of the Data Determines the Shape of the Code

This is the mechanism that makes construction systematic, and if you carry one technical idea forward from CPSC 110, we would like it to be this one.

Once the data is described, the structure of a function that consumes it is not a matter of invention. It follows from the description. An itemisation with three cases becomes a body with three branches. A compound value becomes a body that pulls out the fields. A self-referential definition becomes a **natural recursion**: a call to the same function on the smaller part.

```racket
;; ListOfSong -> Natural
;; produce the number of songs in los
(define (count-songs los)
  (cond [(empty? los) 0]
        [else (+ 1 (count-songs (rest los)))]))
```

The shape of that function was not chosen; it was derived from the shape of the data. That is what a **template** is: the skeleton the data definition dictates, written down before you think about the specific problem at hand. Two consequences follow you into this course:

The first is that structure is derivable. When you do not know how to start, look at the shape of what you are consuming; it will tell you what the branches are.

The second is that the dependency runs both ways. If every function's shape comes from a data definition, then changing that definition means revisiting every function derived from it, however unrelated those functions are to your reason for changing it. You felt this in CPSC 110 as tedium. In 210 it is one of the central concerns of the course, and we call it **coupling**. [Coupling and Dependencies](../part3/01_coupling) describes this effect, arriving between classes rather than between functions and data definitions.

## Designing a Function

The **How to Design Functions** recipe, HtDF, is the order in which the questions get asked:

1. _Signature._ What types go in and what type comes out.
2. _Purpose._ One line saying what the function produces, not how.
3. _Stub._ A definition with the right name and arity that returns a value of the right type, so the file runs.
4. _Examples._ Concrete input-and-expected-output pairs.
5. _Template._ The skeleton, derived from the data definition of the input.
6. _Body._ The implementation, filling in the template until the examples pass.

The ordering is the point. Each step is answerable using only what the previous steps produced, so you are never facing the whole problem at once. Signature and purpose are a decision about _what_, taken before you are allowed to think about _how_. The step that matters most for what follows is the fourth, and it is the subject of the next section.

## Testing Systematically

Most people arriving at this course have written a test. Fewer have written one _before_ the code it tests, and fewer still have _derived_ a set of test cases from a description rather than thinking some up. Those last two are the habits CPSC 110 builds, and they are the ones this textbook assumes you bring.

Three separate ideas sit underneath that, and they are worth pulling apart.

_An expectation written as code is checked every time._ An expectation held in your head is checked once, badly, by you. This much is common to any testing practice.

_Examples written first do work that examples written afterwards cannot._ Deciding what a function should produce, before deciding how it will produce it, forces you to understand the problem while your attention is still on the problem rather than on your code. It also gives you a check that is known to fail before the implementation exists, which is what makes its eventual pass mean something. A test written afterwards, against code you have just convinced yourself is correct, tends to encode what the code does rather than what it should do. This ordering is test-driven development under an earlier name.

_Which examples to write is a question with an answer._ This is the idea most easily missed, and the next section is about it.

### Where Examples Come From

Test cases are derived, not invented. If you have previously chosen cases by intuition, or written tests until it felt like enough, this is where to slow down.

The description of the data does the work. Each form of data definition says how many cases there are and where they sit:

- An _enumeration or itemisation_ needs an example per case. Three cases, three examples, and the count is checkable.
- An _interval_ needs its edges. `Number[0, 10]` invites examples at 0 and at 10, because mistakes cluster at boundaries rather than in the comfortable middle.
- _Self-referential data_ needs the base case and at least one recursive case, since those exercise the two branches the template produced.

This is the same systematic instinct as the design steps. The description tells you what the cases are, so "have I tested enough?" becomes a question you can reason about instead of a feeling you wait to have.

Invariants pay off a second time here, because the invariant on a function's input _defines_ the space the tests have to cover. Without `Fee is Number[0, 10]`, there is no way to tell whether a test at `-5` is a case you forgot or an input that means nothing, and no suite can be judged complete against a boundary that nobody wrote down.

[Checking Invariants](../part1/03_checking-invariants) gives that reasoning its formal names: **equivalence class partitioning** and **boundary value analysis** are what "one per case" and "check the edges" become when stated precisely.

### Saying More Than "Equal"

CPSC 110 also provides a family of checks, and the idea behind the family is that an assertion can state something more precise than equality:

```racket
(check-expect (late-fee 2) 0)
(check-within (average '(1 2)) 1.5 0.001)
(check-member-of (pick-one '("a" "b")) "a" "b")
(check-range (score-of test) 0 100)
(check-error (require-section cat "missing") "no section with id")
```

That a number is close enough; that a value is one of several; that an expression must fail at all. Choosing the check that says what you actually mean is a small design decision, and it pays off at the moment a test fails, because the report names the thing you meant rather than an inequality you have to interpret. [Verifying Behaviour](../part1/09_verification) reaches for a much larger vocabulary of the same kind, and goes on to ask how you judge whether a suite checks enough.

## Arbitrary-Sized Information

How you use lists will be different in this course compared to CPSC 110. A list in the teaching languages is self-referential data: `empty`, or an element followed by a list. That description is why traversing one means recursion (handle the empty case, handle the first element, recur on the rest), and why there is no way to jump to the middle. The recursion was not a technique layered on top of lists; it was the shape of the data showing through.

CPSC 210 mostly uses arrays, which hold the same information but allow direct access to any position, and loops, which perform in one statement the traversal you used to spell out as a recursive call. Because that swap can make the underlying structure invisible, the recursive form is rebuilt explicitly as a `LinkedList` type in [Using Types to Model Problems](../part1/02_model-types) before [Arrays and Iteration](../part1/05_arrays) replaces it.

## Abstraction: Noticing Commonality

CPSC 110 introduces abstraction as a response to something you can see: two functions that are identical except in one place. You then write a single function with that place as a parameter.

```racket
(map (lambda (r) (* r 2)) (list 1 2 3))     ; (list 2 4 6)
(filter positive? (list -1 2 -3))           ; (list 2)
(foldr + 0 (list 1 2 3))                    ; 6
```

Two ideas are bundled together here. The first is that a function can be a value: passed as an argument, stored, returned. The second is that a function can be described without committing to the types it works over, which is what a signature like `(X -> Y) (listof X) -> (listof Y)` says about `map`.

Abstraction is arguably the subject of Part 2 of this textbook, though it arrives in a different form: instead of parameterising a function over an operation, you define an interface and let each implementation supply its own. The question being asked is the same: what varies, and can it be named and extracted? The type-parameter idea returns directly through generics.

## Scope, and Functions That Remember

`local` introduces definitions visible only inside one expression:

```racket
(define (make-counter n)
  (local [(define (increment) (make-counter (+ n 1)))
          (define (get-count) n)]
    (make-counter-interface increment get-count)))
```

The inner functions can see `n`, the parameter of the enclosing function, and they go on seeing it after `make-counter` has returned. A function bundled with the bindings it can see is a **closure**.

`n` is reachable by `increment` and `get-count` and by nothing else; the only way anyone else can affect it is by going through the operations you provided. That is information hiding, built by hand out of scope, and it is also the first mechanism you had for making an invariant impossible to violate rather than merely documented. [Maintaining Invariants](../part1/04_maintaining-invariants) makes the comparison directly, and Part 2 builds classes on the same intuition.

## Reasoning About What a Program Does

In the teaching languages, a name is bound once. `(define course-name "CPSC 110")` associates a name with a value, and nothing later can change it. That sounds like a restriction, but it has value: any name can be replaced by the value it stands for, anywhere, without changing what the program means. A program can therefore be understood by substitution, working outwards one step at a time, and that is exactly what DrRacket's stepper shows you. The stepper was a teaching tool, and it was also the first debugger you may have used: when a value came out wrong, stepping showed the point where it stopped being what you expected.

What the stepper taught you is valuable: when something is wrong, find the earliest point at which it is wrong, and look at what happened immediately before. [Debugging and Fault Localization](../part3/05_debugging) is that skill applied under harder conditions, where the program holds state, the stack is deep, and you have to choose where to look because nothing can show you everything.

Giving up single binding is the most significant change in Part 1, and [Mutation and Side Effects](../part1/06_state-mutation) works through this difference deliberately for that reason. Once a name can be reassigned, it can no longer be replaced by "its value", because which value it holds depends on where the program has got to. It also means a structure can be corrupted after it was built, which is why invariants need more protection here than a comment.

## Working on What You Cannot Finish Yet

The **wish list** is the other CPSC 110 habit, and it is a piece of engineering discipline rather than a language feature. When a function needs a helper that does not exist, you write down the helper's signature and purpose, call it as though it were finished, and carry on with the function you set out to write.

This allowed you to work at one level of detail at a time, which is the only way anyone works on something larger than a page. It also means that for as long as the helper is unwritten, its signature and purpose are the whole of what anyone can rely on: a contract standing in for an implementation.

This textbook uses the idea in three ways. [Defining Boundaries with Interfaces](../part2/05_boundaries) makes that arrangement permanent and enforced. [Designing APIs to Provide Data and Services](../part3/03_api_design) turns the contract outward, to readers who are strangers rather than yourself an hour later. And [Adding New Features](../part3/06_new_features) uses it in reverse, as the discipline for reading an unfamiliar system.

## Signalling Failure

`error` stops the program with a message:

```racket
(define (require-section catalogue id)
  (cond [(false? (find-section catalogue id)) (error "no section with id" id)]
        [else (find-section catalogue id)]))
```

Raising an error is often what a violated invariant deserves, and `check-error` was how you tested for it. TypeScript's `throw` is the same idea with more machinery around it: failures can be caught, they carry types, and deciding which failures deserve one is a design question rather than a reflex. [Designing for Failure](../part1/08_errors) takes that up.

## The Notation

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

## What CPSC 110 Covered That This Textbook Does Not Lean On

CPSC 110 covers a good deal of material that CPSC 210 never uses directly. Knowing it will not hurt, and not remembering it will not hold you back:

- _World programs_, `big-bang`, and the HtDW recipe.
- _Generative recursion_ and the search problems built on it.
- _Accumulators_ and _tail recursion_.
- _Graphs_ and graph search.

These are not omitted because they are not important. They are the algorithmic strand of CPSC 110, and it is CPSC 221 rather than this course that picks that material up. What CPSC 210 takes from CPSC 110 is the design perspective: modelling information before representing it, deriving code from that description, and deriving the tests from it as well.

## What Actually Changes

If it helps to know where the friction will be, these are the genuine shifts rather than the notational ones:

- _Part of your description becomes enforced._ A type is checked before the program runs, so a whole class of mistake stops being possible. The invariants a type still cannot express, such as an interval, a non-empty list, or a relationship between two fields, are exactly what Part 1 and Part 2 spend their time protecting.
- _Mutation exists._ Names can be reassigned and structures modified in place. This buys efficiency and expressiveness, and costs you both the ability to reason by substitution and the guarantee that a value built valid stays valid.
- _Data arrives from outside._ In CPSC 110 every value your functions consumed was one your own code had built, usually a few lines earlier. Once data comes from a file, a service, or a person, a data definition is a hope until something checks it.
- _Programs outlive the problem they were written for._ The design recipe assumed a fixed problem and delivered code already in a standard shape, so there was never anything to tidy up. Real systems change after they are written, and each change arrives without a recipe saying where it belongs. That is why Part 3 spends a chapter on putting a design back into a shape that fits what the system has since become.

## Where Each Idea Returns

| From CPSC 110 | Where the textbook picks it up |
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
| The wider family of checks | [Verifying Behaviour](../part1/09_verification) |
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
