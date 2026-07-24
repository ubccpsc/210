# CPSC 210: Software Construction
The goal of this course is to teach you to design, build, and update multi-file software. Designing such  software requires breaking down an imprecise problem statement into programmable pieces. Building requires you to implement code that fits that design, and validate that the code does what it is intended to do. Updating requires you to understand the intent of the update, identify what part of the code needs updating, and perform this update in a manner that maintains the design of the code base. 
 
Core to doing all these tasks is the skill of **code fluency**. When you are fluent in a natural language, you can write, read, listen, and speak in that language without requiring lengthy translation in your head. Code fluency aims to get you to the same place with code. We want you to be able to easily translate ideas in your head to concrete code; we want you to be able to read code and grasp the underlying logic and design. As with any natural language, getting to this place requires you to read and write a lot of code.

Unlike a natural language, you probably won't be *speaking* code or *listening* code, per-se. But software rarely exists in a vacuum: it exists to accomplish some task. Users will use it without looking at the code. But fellow maintainers will interact with the code directly. To *speak* code and design to other, you'll need to get familiar with language *about* code. In CPSC 210, you'll learn this language as you go. We'll introduce you to both the practice of coding and the language to describe that practice. 

<details class="tooltip deep-dive">
  <summary>The Language of Coding
  </summary>
  
  By the end of the course, you'll understand what these terms mean: *type-driven development*, *test-driven development*, *functional programming*, *imperative programming*, *object-oriented programming*, *functions*, *expressions*, *statements*, *types*, *structs*, *values* *classes*, *recursion*, *iteration*, *object*, *primitives*, *unit test*, *cohesion*, *coupling*. (TODO:  add other terms, organize into order)
    
   Don't worry, we won't quiz you on these! We want you to learn these terms for the long run through applying them, rather than through flash card definitions.    
 
 <details open class="tooltip exercise">
  <summary>Exercise: What do you know?
  </summary>
    
   Some of these words may be familiar to you already—which ones? Try writing down a definition for them yourself, before starting the course. This will reveal the current boundaries of your knowledge. (*Don't peek at existing definitions before trying to write your own: else you won't find the boundary!*)
    
   Revisit the exercise again as we cover the material throughout the course, to assess how the boundaries of your knowledge are pushing out.       
</details>
</details>

If you've ever become fluent in a natural language as an adult, you'll know this takes time. We expect you'll continue developing code fluency throughout your studies. To jump-start your code fluency in CPSC 210, we'll be asking you to read and write *a lot* of code.

## Choice of Programming Language

In this course, you'll be writing code in [TypeScript](https://www.typescriptlang.org/).
 
We're using TypeScript for this course because it allows us to cover many different programming paradigms (functional, imperative, object-oriented) and coding structures. In particular, it allows us to gradually build up these concepts and have you understand each part, rather than asking you to trust strange syntax ahead of time. 

As of 2026, TypeScript is also used widely in the software industry, particularly in web development. We chose it instead of JavaScript because TypeScript includes **types** as a first-class feature. Types are a core programming concept, and we find it easier to discuss them when they are explicitly part of the language. Types are also common in many programming languages (C, C++, Java, Rust, Go, Swift, Haskell, etc.), and being comfortable with them will help you pick up one of these typed languages. 

<details class="tooltip deep-dive">
  <summary>Typed Languages</summary>
  
   Nearly all programming languages have types; any variable `x` takes on a value (say, `3`) that has a type (say, `number` or `integer`). A **typed language** (more precisely: **statically-typed** or **strongly-typed**), in contrast with an **untyped language** (more precise: **dynamically-typed**) has those types written in the code explicitly. These types allow us to catch more bugs before the program runs, and communicate more precisely what the code does.
</details>

If you don't know TypeScript, this reader will introduce relevant TypeScript syntax as we go. Beyond that, it's up to you to learn: we won't dwell on explaining the syntax in lecture or exercises. 

<details class="tooltip ts-tips">
  <summary>Semicolons</summary>
  
   In the TypeScript presented in the reader, we'll put semicolons after single-line statements. For instance:
   
   ```typescript
   function five(): number {
      return 3 + 2;
   }
   ```
   
   Semicolons are actually optional in TypeScript, so this is the same code:
   
   ```typescript
   function five(): number {
      return 3 + 2
   }
   ``` 
   
   But, we'll include semicolons in all our code examples for clarity.
   
</details>

That being said, we *will* explain the coding concepts *behind* the syntax. Those concepts will help you learn new programming languages as you go on in your studies.


## Using This Book

We'll assume in lecture you've read the book chapters as indicated on the course website. We'll cover the key points in lecture, but we'll devote most of lecture to writing and reading code. The reader is intended to provide you with the authority on what we covered in lecture. We'll provide lecture slides, but those should be a subset of what's discussed in the reader.

You'll have noticed this reader includes some nested content. All this nested content is intended as a *parenthetical*: it's relevant to what's discussed in the main text, but the main text is designed to be readable without expanding this content.

<details class="tooltip deep-dive">
  <summary>Deep Dives</summary>
  
  Deep dives are our catch-all parenthetical: they're things we would *like* to tell you, but we recognize are divergent from the main point we are trying to make.
</details>

 <details class="tooltip exercise">
  <summary>Exercises
  </summary>
     
   Exercises will contain precise instructions to prompt you to engage with the content. Note that finishing the exercises on their own isn't enough to understanding the content; that's what the lecture exercises, labs, and project are for. We'll simply insert book exercises when we see a particularly good opportunity to grow your understanding with a simple task.
    
   Here's an exercise: find the other exercise on this page.
</details>

<details class="tooltip ts-tips">
  <summary>TypeScript Tips</summary>
 
 TypeScript Tips will give you information about TypeScript, particularly about its syntax. We talk about the syntax in parenthetical to better separate the coding concepts (the main text) from syntax (in parentheticals like these). Here's a recursive `fib` in TypeScript:
 
 ```typescript
 function fib(n: number): number {
    if (n <= 1) {
        return n;
    }
    
    return fib(n-1) + fib(n-2);
 }
 ```
</details>

<details class="tooltip link-110">
  <summary>Links To Prior Knowledge</summary>
 
 These links will explicitly remind you of CPSC 110 concepts that are relevant to the material at hand. If you've taken CPSC 103+107, the high-level concepts should be familiar to you. However, any code examples we'll give here will be in the CPSC 110 teaching languages.* 
 
 These links are purple in honour of DrRacket's blue-and-red logo. Here's a `fib` you can contrast with the TypeScript in the TypeScript Tip above.
 
 ```racket
 (define (fib n) 
    (cond [(<= n 1) n]
          [else (+ (fib (- n 1) (- n 2))])
 ```
 
 **We'll format the code with Markdown's `racket` option, but it will be in the teaching languages.*
</details>

Each chapter in this textbook corresponds to one in-class lecture. Each lecture will be accompanied by an active learning activity, provided to registered students through a PrairieLearn workspace (see course webpage for links). While the textbook chapters are standalone resources, they are most effective if read prior to each lecture.

## Course Structure

The course is separated into 3 parts.

In Part 1, you will learn how to build software that is correct even when developers make mistakes. Along the way, you will learn the core of a new programming language, TypeScript. Along the way, you will learn *imperative programming*, a programming style which is common to many programming languages. Some keywords for Part 1 include: *types*, *statements* (`if`, `return`, `for`), *pre-conditions*, *post-conditions*, *assertion*, *mutation*, *side effects*, *asynchronous* development, *exception*, and *tests*.

In Part 2, you will learn how to design software split into distinct components, and how to make those components *interact* with each other without *negatively interfering* with each other. Along the way, you will learn *object-oriented programming*, a programming style Java is well-known for, but that exists in most popular programming languages. Some keywords for Part 2 include: *classes*, *constructor*, *method*, *cohesion*, *information hiding*, *interface*, *inheritance*, *polymorphism*.

In Part 3, you will learn how to work with and on software systems that interact with software in wholly different code bases. Here we will scale to handling software you did not fully write yourself: nearly all software engineering done in practice is of this type. Some keywords for Part 3 include: *coupling*, *readability*, *complexity*, *refactoring*, *API*, *REST*, and *fault localization*.

## Getting Started

For term-specific logistics and syllabus, refer to the course website.
