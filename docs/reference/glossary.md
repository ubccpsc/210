# Glossary

The vocabulary of software construction can look like a language of its own for its own sake. It is not. Engineers build systems no one person can fully comprehend, and much of their work is therefore reaching agreement with others about code. Terms like _invariant_ or _coupling_ compress a paragraph of explanation into something two people can say in a code review and mean the same thing. Precise names also make distinctions visible: _fault_, _error_, and _failure_ pick out three different things, and _refactoring_ means restructuring code without changing its behaviour. So this glossary is less a list of words than an index of distinctions, the ones that let you describe what would otherwise stay vague.

Terms introduced in **bold** throughout the textbook, linked to the section where each is first introduced.

<!-- Not every bold span belongs here. Terms deliberately kept out are left in
     place as commented-out entries marked "EXCLUDED, do not re-add", with the
     reason attached, so a later pass does not silently reinstate them.
     Search this file for EXCLUDED to see them all. -->

[A](#a) [B](#b) [C](#c) [D](#d) [E](#e) [F](#f) [G](#g) [H](#h) [I](#i) [J](#j) [K](#k) [L](#l) [M](#m) [N](#n) [O](#o) [P](#p) [Q](#q) [R](#r) [S](#s) [T](#t) [U](#u) [V](#v) [W](#w)

## A

- **Abstract** — [Extending Behaviour Through Polymorphism § Abstract Base Classes](/part2/06_extension#abstract-base-classes)
- **Abstract Value** — [Preserving Implementation Freedom with Abstract Values § What Makes a Change Safe](/part2/04_flexibility#what-makes-a-change-safe)
- **Abstraction** — [Building Abstractions with Classes § Classes and Constructors](/part2/01_abstraction#classes-and-constructors)
- **Access Modifier** — [Encapsulating What Varies § Hiding the Representation](/part2/03_encapsulation#hiding-the-representation)
- **Accumulator** — [Arrays and Iteration § <code>reduce</code>: Combining](/part1/05_arrays#reduce-combining)
- **Adapter** — [Consuming Data and Services by Using APIs § Isolating Dependencies](/part3/02_consuming_data#isolating-dependencies)
- **Aggregation** — [Decomposing Systems into Cohesive Classes § Delegation Through Composition and Aggregation](/part2/02_decomposition#delegation-through-composition-and-aggregation)
- **Aliases** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **API** — [Consuming Data and Services by Using APIs](/part3/02_consuming_data#consuming-data-and-services-by-using-apis)
- **Arguments** — [Learning a New Programming Language § Types in TypeScript](/part1/01_new-language#types-in-typescript)
- **Array** — [Arrays and Iteration](/part1/05_arrays#arrays-and-iteration)
- **Array Literal** — [Arrays and Iteration § Creating and Using Arrays](/part1/05_arrays#creating-and-using-arrays)
- **Arrow Function** — [Learning a New Programming Language § Testing the Dynamic View](/part1/01_new-language#testing-the-dynamic-view)
- **Assert** — [Checking Invariants § Precondition Violations](/part1/03_checking-invariants#precondition-violations)
- **Assertion** — [Checking Invariants § Testing Invariants](/part1/03_checking-invariants#testing-invariants)
- **Assignment** — [Mutation and Side Effects § Reassignment](/part1/06_state-mutation#reassignment)

## B

- **Base Class** — [Extending Behaviour Through Polymorphism § Abstract Base Classes](/part2/06_extension#abstract-base-classes)
- **Behaviour-Driven Development** — [Validating Behaviour § From `checkExpect` to `expect`](/part1/09_validation#from-checkexpect-to-expect)
<!-- EXCLUDED, do not re-add. Was a bold list label in Chapter 13's Immutable
     Values; the book uses "binding" in its everyday sense from Chapter 2 on.
- **Binding** — [Preserving Implementation Freedom with Abstract Values § Immutable Values](/part2/04_flexibility#immutable-values)
-->
- **Block** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Block Scope** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Blocking** — [Asynchronous Effects and Time § How Long Computers Wait](/part1/07_async#how-long-computers-wait)
- **Body** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Boundary Value Analysis** — [Checking Invariants § Deriving Tests](/part1/03_checking-invariants#deriving-tests)
- **Branch** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Branch, Else** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Branch, Then** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Branch Coverage** — [Validating Behaviour § Code Coverage](/part1/09_validation#code-coverage)
- **Breaking Change** — [Designing APIs to Provide Data and Services § Choosing the Surface](/part3/03_api_design#choosing-the-surface)
- **Breakpoint** — [Mutation and Side Effects § State Gives Loops a Memory](/part1/06_state-mutation#state-gives-loops-a-memory)

## C

- **Call Stack** — [Designing for Failure § Throwing an Exception](/part1/08_errors#throwing-an-exception)
- **Callback** — [Asynchronous Effects and Time § Callbacks](/part1/07_async#callbacks)
- **Characterisation Test** — [Code Quality and Refactoring § Risk Now, Benefit Later](/part3/04_refactoring#risk-now-benefit-later)
- **Class** — [Building Abstractions with Classes](/part2/01_abstraction#building-abstractions-with-classes)
- **Client** — [Maintaining Invariants § Constructor Functions](/part1/04_maintaining-invariants#constructor-functions)
- **Closed for Modification** — [Growing Systems with the Open/Closed Principle § Open and Closed](/part2/07_ocp#open-and-closed)
- **Closure** — [Maintaining Invariants § Hiding State with a Closure](/part1/04_maintaining-invariants#hiding-state-with-a-closure)
- **Code Coverage** — [Validating Behaviour § Code Coverage](/part1/09_validation#code-coverage)
- **Code Fluency** — [UBC CPSC 210: Software Construction](/index#ubc-cpsc-210-software-construction)
- **Code Smell** — [Code Quality and Refactoring § Reading the Symptoms](/part3/04_refactoring#reading-the-symptoms)
- **Code Under Test** — [Checking Invariants § The Testing Process](/part1/03_checking-invariants#the-testing-process)
- **Cohesion** — [Decomposing Systems into Cohesive Classes](/part2/02_decomposition#decomposing-systems-into-cohesive-classes)
- **Collaborator** — [Decomposing Systems into Cohesive Classes § Delegation Through Composition and Aggregation](/part2/02_decomposition#delegation-through-composition-and-aggregation)
- **Command-Query Separation** — [Adding New Features § Forcing the Change In](/part3/06_new_features#forcing-the-change-in)
- **Comparator** — [Arrays and Iteration § <code>toSorted</code>: Ordering](/part1/05_arrays#tosorted-ordering)
- **Compiler** — [Learning a New Programming Language § Programming Languages](/part1/01_new-language#programming-languages)
- **Composition** — [Decomposing Systems into Cohesive Classes § Delegation Through Composition and Aggregation](/part2/02_decomposition#delegation-through-composition-and-aggregation)
- **Composition Root** — [Consuming Data and Services by Using APIs § Supplying the Dependency](/part3/02_consuming_data#supplying-the-dependency)
- **Compound Types** — [Using Types to Model Problems](/part1/02_model-types#using-types-to-model-problems)
- **Concern** — [Coupling and Dependencies § Cohesion and Coupling](/part3/01_coupling#cohesion-and-coupling)
- **Constructor Function** — [Maintaining Invariants § Constructor Functions](/part1/04_maintaining-invariants#constructor-functions)
- **Contract** — [Checking Invariants § Documenting Invariants](/part1/03_checking-invariants#documenting-invariants)
<!-- EXCLUDED, do not re-add. Was bold only for emphasis in Chapter 12's
     testability deep-dive; the term is covered by "Controllability".
- **Control** — [Encapsulating What Varies § Designing for Testability](/part2/03_encapsulation#designing-for-testability)
-->
- **Control Flow** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Controllability** — [Encapsulating What Varies § Designing for Testability](/part2/03_encapsulation#designing-for-testability)
- **Copy, Deep** — [Encapsulating What Varies § When References Escape](/part2/03_encapsulation#when-references-escape)
- **Copy, Shallow** — [Encapsulating What Varies § When References Escape](/part2/03_encapsulation#when-references-escape)
- **Coupling** — [Coupling and Dependencies](/part3/01_coupling#coupling-and-dependencies)

## D

- **Data Definition** — [Using Types to Model Problems](/part1/02_model-types#using-types-to-model-problems)
- **Debugger** — [Mutation and Side Effects § State Gives Loops a Memory](/part1/06_state-mutation#state-gives-loops-a-memory)
- **Decomposition** — [Decomposing Systems into Cohesive Classes](/part2/02_decomposition#decomposing-systems-into-cohesive-classes)
- **Default Parameter Value** — [Preserving Implementation Freedom with Abstract Values § Immutable Values](/part2/04_flexibility#immutable-values)
- **Defensive Copying** — [Encapsulating What Varies § When References Escape](/part2/03_encapsulation#when-references-escape)
- **Deferred Computation** — [Asynchronous Effects and Time § One Thread at a Time](/part1/07_async#one-thread-at-a-time)
- **Delegation** — [Decomposing Systems into Cohesive Classes § Delegation Through Composition and Aggregation](/part2/02_decomposition#delegation-through-composition-and-aggregation)
- **Dependency** — [Coupling and Dependencies § What Coupling Is](/part3/01_coupling#what-coupling-is)
- **Dependency Injection** — [Consuming Data and Services by Using APIs § Supplying the Dependency](/part3/02_consuming_data#supplying-the-dependency)
- **Dependency Inversion** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
- **Dependency Inversion Principle** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
- **Deserialisation** — [Consuming Data and Services by Using APIs § What Serialisation Loses](/part3/02_consuming_data#what-serialisation-loses)
- **Design by Contract** — [Encapsulating What Varies § Maintaining the Invariant](/part2/03_encapsulation#maintaining-the-invariant)
- **Discriminator** — [Using Types to Model Problems § Playlists](/part1/02_model-types#playlists)
- **Doc Comment** — [Checking Invariants § Documenting Invariants](/part1/03_checking-invariants#documenting-invariants)
- **Don't Repeat Yourself** — [Extending Behaviour Through Polymorphism § Abstract Base Classes](/part2/06_extension#abstract-base-classes)
- **Dot Notation** — [Using Types to Model Problems § Reading an Object's Properties](/part1/02_model-types#reading-an-object-s-properties)
- **Dynamic** — [Learning a New Programming Language § Static and Dynamic Views](/part1/01_new-language#static-and-dynamic-views)
- **Dynamic Dispatch** — [Extending Behaviour Through Polymorphism § Dynamic Dispatch](/part2/06_extension#dynamic-dispatch)
<!-- EXCLUDED, do not re-add. Bolded again in Chapter 8 as a reminder; the term is
     covered by "Dynamic", defined with the static view in Chapter 1.
- **Dynamic View** — [Designing for Failure § Exceptions Hide Causes](/part1/08_errors#exceptions-hide-causes)
-->
- **Dynamically-Typed** — [UBC CPSC 210: Software Construction § Language Choice](/index#language-choice)

## E

- **Edge** — [Consuming Data and Services by Using APIs § Data Without Invariants](/part3/02_consuming_data#data-without-invariants)
- **Encapsulation** — [Encapsulating What Varies](/part2/03_encapsulation#encapsulating-what-varies)
- **Equivalence** — [Preserving Implementation Freedom with Abstract Values § Two Notions of Sameness](/part2/04_flexibility#two-notions-of-sameness)
- **Equivalence Class Partitioning** — [Checking Invariants § Deriving Tests](/part1/03_checking-invariants#deriving-tests)
- **Equivalence Classes** — [Checking Invariants § Equivalence Classes](/part1/03_checking-invariants#equivalence-classes)
- **Erroneous Outcome** — [Checking Invariants § Erroneous Outcomes](/part1/03_checking-invariants#erroneous-outcomes)
- **Error** — [Debugging and Fault Localisation § Fault, Error, Failure](/part3/05_debugging#fault-error-failure)
- **Event** — [Asynchronous Effects and Time § Callbacks](/part1/07_async#callbacks)
- **Event Loop** — [Asynchronous Effects and Time § Callbacks](/part1/07_async#callbacks)
- **Event-Driven Programming** — [Asynchronous Effects and Time § Callbacks](/part1/07_async#callbacks)
- **Exception** — [Designing for Failure § Throwing an Exception](/part1/08_errors#throwing-an-exception)
- **Exceptions, Checked** — [Designing for Failure § Results or Exceptions?](/part1/08_errors#results-or-exceptions)
- **Exceptions, Unchecked** — [Designing for Failure § Results or Exceptions?](/part1/08_errors#results-or-exceptions)
- **Expressions** — [Learning a New Programming Language § Control Flow Statements](/part1/01_new-language#control-flow-statements)
- **Extension** — [Extending Behaviour Through Polymorphism](/part2/06_extension#extending-behaviour-through-polymorphism)
- **Extension Point** — [Growing Systems with the Open/Closed Principle § The Axis of Change](/part2/07_ocp#the-axis-of-change)

## F

- **Failure** — [Debugging and Fault Localisation § Fault, Error, Failure](/part3/05_debugging#fault-error-failure)
- **Failure, Returned** — [Designing for Failure § Results or Exceptions?](/part1/08_errors#results-or-exceptions)
- **Failure, Thrown** — [Designing for Failure § Results or Exceptions?](/part1/08_errors#results-or-exceptions)
- **Falsy** — [Uncovered Language Features § Truthiness](/reference/language-features#truthiness)
- **Fan-In** — [Coupling and Dependencies § What Coupling Is](/part3/01_coupling#what-coupling-is)
- **Fan-Out** — [Coupling and Dependencies § What Coupling Is](/part3/01_coupling#what-coupling-is)
- **Fault** — [Debugging and Fault Localisation § Fault, Error, Failure](/part3/05_debugging#fault-error-failure)
- **Fault Localisation** — [Debugging and Fault Localisation](/part3/05_debugging#debugging-and-fault-localisation)
- **Field** — [Building Abstractions with Classes § Class State](/part2/01_abstraction#class-state)
- **Fragile Base Class Problem** — [Extending Behaviour Through Polymorphism § Composition Over Inheritance](/part2/06_extension#composition-over-inheritance)
- **Fulfilled** — [Asynchronous Effects and Time § Promises: A Future Value](/part1/07_async#promises-a-future-value)
- **Functional Programming** — [Building Abstractions with Classes § Programming Paradigms](/part2/01_abstraction#programming-paradigms)

## G

- **Garbage Collection** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Generic Type** — [Using Types to Model Problems § Playlists](/part1/02_model-types#playlists)
- **Global Variable** — [Building Abstractions with Classes § Keeping State Consistent](/part2/01_abstraction#keeping-state-consistent)
- **God Class** — [Decomposing Systems into Cohesive Classes § How Classes Lose Cohesion](/part2/02_decomposition#how-classes-lose-cohesion)
- **Greenfield Development** — [Part 3: Enabling Evolution](/part3/index#part-3-enabling-evolution)

## H

- **Higher-Order Function** — [Learning a New Programming Language § Testing the Dynamic View](/part1/01_new-language#testing-the-dynamic-view)
- **Hyrum's Law** — [Designing APIs to Provide Data and Services § Publishing the Tracker](/part3/03_api_design#publishing-the-tracker)

## I

- **IDE** — [Learning a New Programming Language § Compiling and Checking](/part1/01_new-language#compiling-and-checking)
- **Idempotent** — [Consuming Data and Services by Using APIs § Three Ways a Call Fails](/part3/02_consuming_data#three-ways-a-call-fails)
- **Identity** — [Preserving Implementation Freedom with Abstract Values § Two Notions of Sameness](/part2/04_flexibility#two-notions-of-sameness)
- **Immutable** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Immutable Object** — [Preserving Implementation Freedom with Abstract Values § Immutable Values](/part2/04_flexibility#immutable-values)
- **Imperative Programming** — [Building Abstractions with Classes § Programming Paradigms](/part2/01_abstraction#programming-paradigms)
- **Implementation Freedom** — [Preserving Implementation Freedom with Abstract Values](/part2/04_flexibility#preserving-implementation-freedom-with-abstract-values)
- **Index** — [Arrays and Iteration § Creating and Using Arrays](/part1/05_arrays#creating-and-using-arrays)
- **Information Hiding** — [Encapsulating What Varies](/part2/03_encapsulation#encapsulating-what-varies)
- **Inheritance** — [Extending Behaviour Through Polymorphism](/part2/06_extension#extending-behaviour-through-polymorphism)
- **Instance** — [Building Abstractions with Classes § Classes and Constructors](/part2/01_abstraction#classes-and-constructors)
- **Instantiating** — [Building Abstractions with Classes § Classes and Constructors](/part2/01_abstraction#classes-and-constructors)
- **Interface** — [Defining Boundaries with Interfaces](/part2/05_boundaries#defining-boundaries-with-interfaces)
- **Interface Segregation Principle** — [Defining Boundaries with Interfaces § Keeping Interfaces Small](/part2/05_boundaries#keeping-interfaces-small)
- **Invariants** — [Checking Invariants § What Is an Invariant?](/part1/03_checking-invariants#what-is-an-invariant)

## J

- **JSON** — [Asynchronous Effects and Time § Reading and Writing JSON](/part1/07_async#reading-and-writing-json)
- **JSON Array** — [Asynchronous Effects and Time § Reading and Writing JSON](/part1/07_async#reading-and-writing-json)
- **JSON Object** — [Asynchronous Effects and Time § Reading and Writing JSON](/part1/07_async#reading-and-writing-json)

## K

- **Key** — [Asynchronous Effects and Time § Reading and Writing JSON](/part1/07_async#reading-and-writing-json)

## L

- **Lambda Expressions** — [Learning a New Programming Language § Testing the Dynamic View](/part1/01_new-language#testing-the-dynamic-view)
- **Law of Demeter** — [Coupling and Dependencies § Reaching Past a Neighbour](/part3/01_coupling#reaching-past-a-neighbour)
<!-- EXCLUDED, do not re-add. Was bolded again in Chapter 19 after Chapter 18
     had already used it throughout; the term is covered by "Library API".
- **Library** — [Designing APIs to Provide Data and Services § Publishing the Tracker](/part3/03_api_design#publishing-the-tracker)
-->
- **Library API** — [Consuming Data and Services by Using APIs § Two Kinds of API](/part3/02_consuming_data#two-kinds-of-api)
- **Lifecycle Hooks** — [Validating Behaviour § Shared Setup](/part1/09_validation#shared-setup)
- **Line Coverage** — [Validating Behaviour § Code Coverage](/part1/09_validation#code-coverage)
- **Liskov Substitution Principle** — [Extending Behaviour Through Polymorphism § Honouring the Contract](/part2/06_extension#honouring-the-contract)
- **Logical Operators** — [Learning a New Programming Language § Combining Conditions](/part1/01_new-language#combining-conditions)
- **Loop** — [Arrays and Iteration § Writing Your Own Loops](/part1/05_arrays#writing-your-own-loops)

## M

- **Memory Address** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Method** — [Building Abstractions with Classes § Class Functionality](/part2/01_abstraction#class-functionality)
- **Method Signature** — [Defining Boundaries with Interfaces § Declaring an Interface](/part2/05_boundaries#declaring-an-interface)
- **Mock Object** — [Defining Boundaries with Interfaces § Test Doubles](/part2/05_boundaries#test-doubles)
- **Mutable Object** — [Preserving Implementation Freedom with Abstract Values § Immutable Values](/part2/04_flexibility#immutable-values)
- **Mutation** — [Mutation and Side Effects](/part1/06_state-mutation#mutation-and-side-effects)

## N

<!-- EXCLUDED, do not re-add. Was bold only for emphasis in Chapter 6 ("Scope
     governs names, not objects"), not a defined term.
- **Names** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
-->
- **Non-Local Return** — [Designing for Failure § Exception Propagation](/part1/08_errors#exception-propagation)

## O

- **Object** — [Using Types to Model Problems § Songs](/part1/02_model-types#songs)
- **Object Literal** — [Using Types to Model Problems § Songs](/part1/02_model-types#songs)
- **Object Type** — [Using Types to Model Problems § Songs](/part1/02_model-types#songs)
- **Object-Oriented Programming** — [Building Abstractions with Classes § Programming Paradigms](/part2/01_abstraction#programming-paradigms)
- **Observability** — [Encapsulating What Varies § Designing for Testability](/part2/03_encapsulation#designing-for-testability)
<!-- EXCLUDED, do not re-add. Was bold only for emphasis in Chapter 12's
     testability deep-dive; the term is covered by "Observability".
- **Observe** — [Encapsulating What Varies § Designing for Testability](/part2/03_encapsulation#designing-for-testability)
-->
<!-- EXCLUDED, do not re-add. Bold in the Chapter 16 recap list, but that list
     points back at earlier chapters rather than defining a term here; the
     concept is already covered by "Open/Closed Principle" below.
- **Open and Closed** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
-->
- **Open for Extension** — [Growing Systems with the Open/Closed Principle § Open and Closed](/part2/07_ocp#open-and-closed)
- **Open/Closed Principle** — [Growing Systems with the Open/Closed Principle](/part2/07_ocp#growing-systems-with-the-open-closed-principle)
- **Operating System** — [Asynchronous Effects and Time § `async` and `await`](/part1/07_async#async-and-await)
- **Optional** — [Designing APIs to Provide Data and Services § Easy to Use, Hard to Misuse](/part3/03_api_design#easy-to-use-hard-to-misuse)
- **Options Object** — [Designing APIs to Provide Data and Services § Easy to Use, Hard to Misuse](/part3/03_api_design#easy-to-use-hard-to-misuse)
- **Override** — [Extending Behaviour Through Polymorphism § Overriding Methods](/part2/06_extension#overriding-methods)

## P

- **Parameters** — [Learning a New Programming Language § Types in TypeScript](/part1/01_new-language#types-in-typescript)
- **Pass-by-Reference** — [Mutation and Side Effects § What a Function Can Change](/part1/06_state-mutation#what-a-function-can-change)
- **Pass-by-Value** — [Mutation and Side Effects § What a Function Can Change](/part1/06_state-mutation#what-a-function-can-change)
- **Path** — [Checking Invariants § Equivalence Classes](/part1/03_checking-invariants#equivalence-classes)
- **Path Coverage** — [Validating Behaviour § Code Coverage](/part1/09_validation#code-coverage)
- **Pending** — [Asynchronous Effects and Time § Promises: A Future Value](/part1/07_async#promises-a-future-value)
- **Plugin Architecture** — [Growing Systems with the Open/Closed Principle § Why Add Instead of Edit](/part2/07_ocp#why-add-instead-of-edit)
- **Pointers** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Polymorphism** — [Extending Behaviour Through Polymorphism](/part2/06_extension#extending-behaviour-through-polymorphism)
- **Postcondition** — [Checking Invariants § Identifying Invariants](/part1/03_checking-invariants#identifying-invariants)
- **Precondition** — [Checking Invariants § Identifying Invariants](/part1/03_checking-invariants#identifying-invariants)
- **Primitive** — [Using Types to Model Problems](/part1/02_model-types#using-types-to-model-problems)
- **Promise** — [Asynchronous Effects and Time § Promises: A Future Value](/part1/07_async#promises-a-future-value)
- **Pure Function** — [Mutation and Side Effects § Side Effects](/part1/06_state-mutation#side-effects)

## Q

- **Quality, External** — [Code Quality and Refactoring § Two Kinds of Quality](/part3/04_refactoring#two-kinds-of-quality)
- **Quality, Internal** — [Code Quality and Refactoring § Two Kinds of Quality](/part3/04_refactoring#two-kinds-of-quality)
- **Query String** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)

## R

- **Reassignment** — [Mutation and Side Effects § Reassignment](/part1/06_state-mutation#reassignment)
- **Recovery** — [Designing for Failure § Recovering or Reporting](/part1/08_errors#recovering-or-reporting)
- **Refactoring** — [Code Quality and Refactoring § What Refactoring Is](/part3/04_refactoring#what-refactoring-is)
- **Reference** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Regression** — [Validating Behaviour § Regression Testing](/part1/09_validation#regression-testing)
- **Rejected** — [Asynchronous Effects and Time § Promises: A Future Value](/part1/07_async#promises-a-future-value)
- **Representation** — [Encapsulating What Varies § Hiding the Representation](/part2/03_encapsulation#hiding-the-representation)
- **Representative** — [Checking Invariants § Equivalence Classes](/part1/03_checking-invariants#equivalence-classes)
- **Resource** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **REST** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Result Type** — [Checking Invariants § Erroneous Outcomes](/part1/03_checking-invariants#erroneous-outcomes)
- **Return** — [Learning a New Programming Language § <code>return</code> statements](/part1/01_new-language#return-statements)
- **Ripple Effect** — [Coupling and Dependencies § The Ripple Effect](/part3/01_coupling#the-ripple-effect)
- **Robustness Principle** — [Designing APIs to Provide Data and Services § Breaking Changes](/part3/03_api_design#breaking-changes)
- **Runtime** — [Learning a New Programming Language § Static and Dynamic Views](/part1/01_new-language#static-and-dynamic-views)
- **Runtime Environment** — [Checking Invariants § Precondition Violations](/part1/03_checking-invariants#precondition-violations)

## S

- **Scattering** — [Coupling and Dependencies § Cohesion and Coupling](/part3/01_coupling#cohesion-and-coupling)
- **Schema** — [Consuming Data and Services by Using APIs § Using a Schema Library](/part3/02_consuming_data#using-a-schema-library)
- **Scope** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Semantic Versioning** — [Designing APIs to Provide Data and Services § Breaking Changes](/part3/03_api_design#breaking-changes)
- **Sentinel Values** — [Designing for Failure § Returning a Failure Value](/part1/08_errors#returning-a-failure-value)
- **Separation of Concerns** — [Coupling and Dependencies § Cohesion and Coupling](/part3/01_coupling#cohesion-and-coupling)
- **Serialisation** — [Consuming Data and Services by Using APIs § What Serialisation Loses](/part3/02_consuming_data#what-serialisation-loses)
- **Short-Circuit Evaluation** — [Learning a New Programming Language § Combining Conditions](/part1/01_new-language#combining-conditions)
- **Side Effect** — [Mutation and Side Effects § Side Effects](/part1/06_state-mutation#side-effects)
- **Signature** — [Learning a New Programming Language § Types in TypeScript](/part1/01_new-language#types-in-typescript)
- **Single Responsibility Principle** — [Decomposing Systems into Cohesive Classes § Single Responsibility](/part2/02_decomposition#single-responsibility)
<!-- EXCLUDED, do not re-add. Bold in the Chapter 16 recap list, but that list
     points back at earlier chapters rather than defining a term here; the
     concept belongs to Chapter 14 and is covered by "Interface" and
     "Interface Segregation Principle".
- **Small Contracts** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
-->
- **Specification-Based Testing** — [Validating Behaviour § Specification-Based Testing](/part1/09_validation#specification-based-testing)
- **State** — [Mutation and Side Effects § Reassignment](/part1/06_state-mutation#reassignment)
- **Statement** — [Learning a New Programming Language § Control Flow Statements](/part1/01_new-language#control-flow-statements)
- **Static** — [Learning a New Programming Language § Static and Dynamic Views](/part1/01_new-language#static-and-dynamic-views)
<!-- EXCLUDED, do not re-add. Bolded again in Chapter 8 as a reminder; the term is
     covered by "Static", defined with the dynamic view in Chapter 1.
- **Static View** — [Designing for Failure § Exceptions Hide Causes](/part1/08_errors#exceptions-hide-causes)
-->
- **Statically-Typed** — [UBC CPSC 210: Software Construction § Language Choice](/index#language-choice)
- **Status Code** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Strictly Equal** — [Using Types to Model Problems § Branching on the Case](/part1/02_model-types#branching-on-the-case)
- **Structure-Based Testing** — [Validating Behaviour § Structure-Based Testing](/part1/09_validation#structure-based-testing)
- **Stub** — [Checking Invariants § The Testing Process](/part1/03_checking-invariants#the-testing-process)
- **Subclass** — [Extending Behaviour Through Polymorphism § Abstract Base Classes](/part2/06_extension#abstract-base-classes)
<!-- EXCLUDED, do not re-add. Bold in the Chapter 16 recap list, but that list
     points back at earlier chapters rather than defining a term here; the
     concept belongs to Chapter 15 and is covered by "Liskov Substitution Principle".
- **Substitutability** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
-->
- **Subtype** — [Extending Behaviour Through Polymorphism § Honouring the Contract](/part2/06_extension#honouring-the-contract)
- **Successful Outcome** — [Checking Invariants § Erroneous Outcomes](/part1/03_checking-invariants#erroneous-outcomes)
- **Supertype** — [Extending Behaviour Through Polymorphism § Honouring the Contract](/part2/06_extension#honouring-the-contract)
- **Syntax** — [Learning a New Programming Language § Programming Languages](/part1/01_new-language#programming-languages)

## T

- **Tagged Union** — [Using Types to Model Problems § Playlists](/part1/02_model-types#playlists)
- **Tangling** — [Coupling and Dependencies § Cohesion and Coupling](/part3/01_coupling#cohesion-and-coupling)
- **Technical Debt** — [Code Quality and Refactoring § Technical Debt](/part3/04_refactoring#technical-debt)
- **Tell, Don't Ask** — [Coupling and Dependencies § Reaching Past a Neighbour](/part3/01_coupling#reaching-past-a-neighbour)
- **Terminal** — [Checking Invariants § Testing Invariants](/part1/03_checking-invariants#testing-invariants)
- **Ternary Operator** — [Validating Behaviour § Validating with Confidence](/part1/09_validation#validating-with-confidence)
- **Test Double** — [Defining Boundaries with Interfaces § Test Doubles](/part2/05_boundaries#test-doubles)
- **Tests** — [Part 1: Foundations of Software Construction § Layered Correctness](/part1/index#layered-correctness)
- **Text Encoding** — [Asynchronous Effects and Time § Reading and Writing Files](/part1/07_async#reading-and-writing-files)
- **Thread** — [Asynchronous Effects and Time § One Thread at a Time](/part1/07_async#one-thread-at-a-time)
- **Threading Model** — [Asynchronous Effects and Time § One Thread at a Time](/part1/07_async#one-thread-at-a-time)
- **Throw** — [Designing for Failure § Throwing an Exception](/part1/08_errors#throwing-an-exception)
- **Thunk** — [Learning a New Programming Language § Testing the Dynamic View](/part1/01_new-language#testing-the-dynamic-view)
- **Truthy** — [Uncovered Language Features § Truthiness](/reference/language-features#truthiness)
- **Type, Actual** — [Defining Boundaries with Interfaces § Apparent and Actual Types](/part2/05_boundaries#apparent-and-actual-types)
- **Type, Apparent** — [Defining Boundaries with Interfaces § Apparent and Actual Types](/part2/05_boundaries#apparent-and-actual-types)
- **Type Checker** — [Learning a New Programming Language § Types in TypeScript](/part1/01_new-language#types-in-typescript)
- **Type Errors** — [Learning a New Programming Language § Compiling and Checking](/part1/01_new-language#compiling-and-checking)
- **Type Narrowing** — [Using Types to Model Problems § Branching on the Case](/part1/02_model-types#branching-on-the-case)
- **Type Variables** — [Using Types to Model Problems § Playlists](/part1/02_model-types#playlists)
- **Types** — [UBC CPSC 210: Software Construction § Language Choice](/index#language-choice)

## U

- **Unit Tests** — [Checking Invariants § Testing Invariants](/part1/03_checking-invariants#testing-invariants)

## V

- **Value Object** — [Preserving Implementation Freedom with Abstract Values § Immutable Values](/part2/04_flexibility#immutable-values)

## W

- **Web Service** — [Asynchronous Effects and Time § Calling Web Services](/part1/07_async#calling-web-services)
- **Web Service API** — [Consuming Data and Services by Using APIs § Two Kinds of API](/part3/02_consuming_data#two-kinds-of-api)
