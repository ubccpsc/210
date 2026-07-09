# Part 3: Enabling Evolution

> Build systems that you are able to evolve, and evolve systems you did not build.

A working system is not finished. Requirements keep arriving after the first release, the data a program consumes changes shape, the services it depends on come and go, and the code outlives the attention of the people who wrote it. Part 1 built programs that work; Part 2 built abstractions that protect their invariants as systems grow. Part 3 focuses on what happens next: changing software that already exists, without breaking what it already does.

This changes your initial starting point. In Parts 1 and 2 you mostly wrote new code into workspaces over which you had full control. From here on, the more common situation is the professional one: the system already exists, much of its code was written by someone else (or by you, months ago, which amounts to the same thing), and you are tasked with fixing, improving, or extending it while ensuring that the rest of the system keeps working.

This part of the course is oriented around three high-level questions. The first is structure: how do the pieces of a system depend on one another, and who constructs and connects them? Part 2 ended by noticing that some code, somewhere, must still name the concrete classes it assembles; managing that dependency structure deliberately is our first task. The second question is around boundaries: how does a program exchange data with files, services, and clients it does not control, and how does it publish a contract of its own? The third question is practice: the everyday workflows of evolution, judging and improving code quality, localizing and fixing faults, and adding features, all protected by the verification habits we established in Part 2.

<details class="tooltip deep-dive">
<summary>Where the Time Goes</summary>

Most professional software effort goes to systems that already exist. Building something new from an empty repository (often called **greenfield development**) is the exception; understanding, repairing, and extending a running system is the everyday work of the field. The skills in this part are the ones that work requires, whichever tools, teams, or code generators are involved.

</details>

## Intended Learning Objectives

By the end of Part 3, you will be able to:

1. _Trace and manage the dependencies among classes and modules_, judging coupling the way Part 2 judged cohesion, and directing dependencies toward abstractions rather than concrete classes.

2. _Compose a system from interchangeable parts_, concentrating construction and wiring at the program's boundary so that implementations can be swapped without editing the code that uses them.

3. _Exchange data across the program's edge_, consuming files and web services, converting between JSON text and typed values, and validating outside data before the rest of the program relies on it.

4. _Design and evolve APIs as contracts_, exposing small, stable surfaces and judging which changes are compatible with existing clients and which break them.

5. _Carry out the everyday work of evolution_, localizing and fixing faults, refactoring behind a regression suite, and adding features by extension rather than disturbance.

## Chapter Overview

Part 3 covers three connected themes across seven chapters, one per lecture.

#### Structuring systems for change:

1. _Coupling and Dependencies_ provides an alternate viewpoint to our earlier cohesion discussion. Cohesion asked whether the pieces of one class belong together; coupling asks how tightly separate classes and modules are bound to each other. This chapter makes dependencies visible, shows how tight coupling turns a small change into a cascade through the system, and develops the habits that keep coupling low: narrow interfaces, dependencies that point at abstractions, and modules that can be understood and tested on their own.

2. _Composing Systems_ examines a key question Part 2 left open: somewhere, some code must still construct the concrete objects and wire them together. This chapter concentrates that construction at the program's boundary and introduces dependency injection, the mechanism behind the Dependency Inversion Principle, for supplying implementations from outside. The same wiring that assembles the production system also assembles test doubles and plugins, which is what makes the pieces genuinely interchangeable. (**RTH: i'm not sure about this one. I wouldn't be surprised if we decided one of the other topics would be better turned into two lectures instead of forcing this one in (and maybe DI could be explicitly added to 310)**)

#### Working across boundaries:

3. _Consuming Data and Services_ examines how integrate systems with the outside world. Programs rarely own all their data: it arrives from files, from REST and other web APIs, and from other programs. This chapter converts between JSON text and typed values, and validates data the moment it crosses into the program, so that everything past the edge works only with values whose invariants are already established. 

4. _Designing APIs_ looks at boundaries from the other perspective. Consuming an API means reading one side of a promise; this chapter designs the other side, for clients you cannot see and cannot coordinate with. It covers choosing a small, stable surface, documenting behaviour precisely, and evolving an API deliberately.

#### The practice of change:

5. _Code Quality and Refactoring_ originates from a fact of long-lived systems: working code can still be hard to work on. This chapter develops judgement about internal quality, readability, complexity, and the smells that signal trouble, and introduces refactoring: improving structure without changing behaviour, with the regression testing practice from Part 2 used to provide trust that the system remains working as expected.

6. _Debugging and Fault Localization_ treats a bug report as a claim that the system misbehaves, usually far from the fault that causes it. The chapter looks at systematic debugging: reproducing the failure, forming and testing hypotheses, localizing the fault, and fixing and verifying the original problem has been resolved.

7. _Adding Features_ closes with feature requests. It looks at the process of extending systems staring with reading unfamiliar code, finding affordances within the existing design left, planning a change, making the change, and as with debugging, verifying that everything that worked before still works.

## Beyond CPSC 210

The introduction to this handbook claimed that construction skill matters because someone must decide what to build, judge whether it is correct, and keep it changeable, no matter who or what writes the code. Parts 1 and 2 built that judgement for programs and their abstractions; Part 3 applies it to deployed, long-lived systems, which is where most time is spent. The courses that follow build outward from here, and each of them assumes what this handbook has practised: that you can read code you did not write, state precisely what it should do, and change it with confidence.

