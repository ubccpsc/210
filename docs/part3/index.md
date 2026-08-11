# Part 3: Enabling Evolution

> Build systems that you are able to evolve, and evolve systems you did not build.

A working system is not finished. Requirements keep arriving after the first release, the data a program consumes changes shape, the services it depends on come and go, and the code outlives the attention of the people who wrote it. [Part 1](../part1/index) built programs that work; [Part 2](../part2/index) built abstractions that protect their invariants as systems grow. Part 3 focuses on what happens next: changing software that already exists, without breaking what it already does.

This changes your initial starting point. In Parts 1 and 2 you mostly wrote new code into workspaces over which you had full control. From here on, the more common situation is the professional one: the system already exists, much of its code was written by someone else (or by you, months ago, which amounts to the same thing), and you are tasked with fixing, improving, or extending it while ensuring that the rest of the system keeps working.

This part of the course is oriented around three high-level questions. The first is structure: how do the pieces of a system depend on one another, and what does a change to one of them cost the others? Judging that dependency structure deliberately, the way Part 2 judged cohesion, is our first task. The second question is around boundaries: how does a program consume data and services it does not control, and how does it publish a contract of its own for others to build on? This is also where Part 2's open question is settled, since code that depends on a contract rather than a class still needs somebody to decide which implementation it receives. The third question is practice: the everyday workflows of evolution, judging and improving code quality, localizing and fixing faults, and adding features, all protected by the verification habits we established in Part 2.

<details class="tooltip deep-dive">
<summary>Where the Time Goes</summary>

Most professional software effort goes to systems that already exist. Building something new from an empty repository (often called **greenfield development**) is the exception; understanding, repairing, and extending a running system is the everyday work of the field. The skills in this part are the ones that work requires, whichever tools, teams, or code generators are involved.

</details>

## Intended Learning Objectives

By the end of Part 3, you will be able to:

1. _Trace and manage the dependencies among classes and modules_, judging coupling the way Part 2 judged cohesion, and directing dependencies toward abstractions rather than concrete classes.

2. _Isolate the dependencies you do not control_, defining contracts of your own for external libraries and services, and supplying implementations from outside so that the same code serves production and tests.

3. _Exchange data across the program's edge_, consuming files and web services, converting between JSON text and typed values, and validating outside data before the rest of the program relies on it.

4. _Design and evolve APIs as contracts_, exposing small, stable surfaces and judging which changes are compatible with existing clients and which break them.

5. _Carry out the everyday work of evolution_, localizing and fixing faults, refactoring behind a regression suite, and adding features by extension rather than disturbance.

## Chapter Overview

Part 3 covers three connected themes across six chapters, one per lecture.

#### Structuring systems for change:

1. _Coupling and Dependencies_ provides an alternate viewpoint to our earlier cohesion discussion. Cohesion asked whether the pieces of one class belong together; coupling asks how tightly separate classes and modules are bound to each other. This chapter makes dependencies visible, shows how tight coupling turns a small change into a cascade through the system, and develops the habits that keep coupling low: narrow interfaces, dependencies that point at abstractions, and modules that can be understood and tested on their own.

#### Working across boundaries:

2. _Consuming Data and Services_ takes the position of a client: we call an API, and somebody else decides what it does. Programs rarely own all their data, and it arrives from libraries, from files, and from web services. This chapter converts JSON text into typed values and validates it the moment it crosses into the program, so that everything past the edge works only with values whose invariants are established. It also settles the question Part 2 left open, isolating what we do not control behind a contract of our own and supplying the implementation from outside.

3. _Designing APIs_ looks at the same boundary from the other side, publishing a contract for clients we cannot see and cannot coordinate with. It covers choosing a small surface, designing operations that are easy to use and hard to misuse, documenting behaviour precisely, and judging which changes existing clients can survive.

#### The practice of change:

4. _Code Quality and Refactoring_ originates from a fact of long-lived systems: working code can still be hard to work on. This chapter develops judgement about internal quality, readability, complexity, and the smells that signal trouble, and introduces refactoring: improving structure without changing behaviour, with the regression testing practice from Part 2 used to provide trust that the system remains working as expected.

5. _Debugging and Fault Localization_ treats a bug report as a claim that the system misbehaves, usually far from the fault that causes it. The chapter looks at systematic debugging: reproducing the failure, forming and testing hypotheses, localizing the fault, and fixing and verifying the original problem has been resolved.

6. _Adding New Features_ closes with feature requests, and with the observation that a feature's cost depends less on the feature than on whether the design anticipated it. It looks at the process of extending systems: reading unfamiliar code, finding the extension points the existing design left open, creating one where none exists, planning and making the change, and, as with debugging, verifying that everything that worked before still works.

## Beyond CPSC 210

The introduction to this textbook claimed that construction skill matters because someone must decide what to build, judge whether it is correct, and keep it changeable, no matter who or what writes the code. Parts 1 and 2 built that judgement for programs and their abstractions; Part 3 applies it to deployed, long-lived systems, which is where most time is spent. The courses that follow build outward from here, and each of them assumes what this textbook has practised: that you can read code you did not write, state precisely what it should do, and change it with confidence.

