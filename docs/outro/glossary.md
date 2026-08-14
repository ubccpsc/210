# Glossary

The vocabulary of software construction can look like a language of its own for its own sake. It is not. Engineers build systems no one person can fully comprehend, and much of their work is therefore reaching agreement with others about code. Terms like _invariant_ or _coupling_ compress a paragraph of explanation into something two people can say in a code review and mean the same thing. Precise names also make distinctions visible: _fault_, _error_, and _failure_ pick out three different things, and _refactoring_ means restructuring code without changing its behaviour. So this glossary is less a list of words than an index of distinctions, the ones that let you describe what would otherwise stay vague.

Terms introduced in **bold** throughout the textbook, linked to the section where each is first introduced.

<!-- Not every bold span belongs here. Terms deliberately kept out are left in
     place as commented-out entries marked "EXCLUDED, do not re-add", with the
     reason attached, so a later pass does not silently reinstate them.
     Search this file for EXCLUDED to see them all. -->

[A](#a) [B](#b) [C](#c) [D](#d) [E](#e) [F](#f) [G](#g) [H](#h) [I](#i) [J](#j) [K](#k) [L](#l) [M](#m) [N](#n) [O](#o) [P](#p) [Q](#q) [R](#r) [S](#s) [T](#t) [U](#u) [V](#v) [W](#w)

## A

- **Abstract** — [Extending Behaviour Through Polymorphism § Sharing Behaviour with a Base Class](/part2/06_extension#sharing-behaviour-with-a-base-class)
- **Abstract Value** — [Preserving Implementation Freedom with Abstract Values § What Makes a Change Safe](/part2/04_flexibility#what-makes-a-change-safe)
- **Accumulator** — [Arrays and Iteration § Combining Elements with `reduce`](/part1/05_arrays#combining-elements-with-reduce)
- **Adapter** — [Consuming Data and Services by Using APIs § Isolating What You Do Not Control](/part3/02_consuming_data#isolating-what-you-do-not-control)
- **Aliases** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **API** — [Consuming Data and Services by Using APIs](/part3/02_consuming_data#consuming-data-and-services-by-using-apis)
- **Arguments** — [Learning a New Programming Language § Types as a Language Mechanism](/part1/01_new-language#types-as-a-language-mechanism)
- **Array** — [Arrays and Iteration](/part1/05_arrays#arrays-and-iteration)
- **Array Literal** — [Arrays and Iteration § Creating and Accessing Arrays](/part1/05_arrays#creating-and-accessing-arrays)
- **Arrow Function** — [Learning a New Programming Language § Validating the Dynamic View With Testing](/part1/01_new-language#validating-the-dynamic-view-with-testing)
- **Assert** — [Checking Invariants § Expected and Unexpected Errors](/part1/03_checking-invariants#expected-and-unexpected-errors)
- **Assertion** — [Checking Invariants § Checking Invariants With Tests](/part1/03_checking-invariants#checking-invariants-with-tests)
- **Assignment** — [Mutation and Side Effects § Reassignment](/part1/06_state-mutation#reassignment)

## B

- **Base Class** — [Extending Behaviour Through Polymorphism § Sharing Behaviour with a Base Class](/part2/06_extension#sharing-behaviour-with-a-base-class)
- **Behaviour-Driven Development** — [Verifying Behaviour § From `checkExpect` to `expect`](/part1/09_verification#from-checkexpect-to-expect)
- **Binding** — [Preserving Implementation Freedom with Abstract Values § Values That Do Not Change](/part2/04_flexibility#values-that-do-not-change)
- **Black-Box Testing** — [Verifying Behaviour § White-Box Testing](/part1/09_verification#white-box-testing)
- **Block** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Block Scope** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Blocking** — [Asynchronous Effects and Time § How Long Computers Wait](/part1/07_async#how-long-computers-wait)
- **Body** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Boundary Value Analysis** — [Checking Invariants § Deriving Tests from the Specification](/part1/03_checking-invariants#deriving-tests-from-the-specification)
- **Branch** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Branch Coverage** — [Verifying Behaviour § Code Coverage](/part1/09_verification#code-coverage)
- **Branch, Else** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Branch, Then** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Breakpoint** — [Mutation and Side Effects § State Gives Loops a Memory](/part1/06_state-mutation#state-gives-loops-a-memory)

## C

- **Call Stack** — [Designing for Failure § Exceptions Travel Up the Call Stack](/part1/08_errors#exceptions-travel-up-the-call-stack)
- **Callback** — [Asynchronous Effects and Time § Deferred Computation: Callbacks](/part1/07_async#deferred-computation-callbacks)
- **Capability** — [Part 1: Foundations of Software Construction](/part1/index#part-1-foundations-of-software-construction)
- **Class** — [Building Abstractions with Classes](/part2/01_abstraction#building-abstractions-with-classes)
- **Client** — [Consuming Data and Services by Using APIs](/part3/02_consuming_data#consuming-data-and-services-by-using-apis)
- **Closed for Modification** — [Growing Systems with the Open/Closed Principle § Open for Extension, Closed for Modification](/part2/07_ocp#open-for-extension-closed-for-modification)
- **Closure** — [Maintaining Invariants § Hiding State with a Closure](/part1/04_maintaining-invariants#hiding-state-with-a-closure)
- **Code Coverage** — [Verifying Behaviour § Code Coverage](/part1/09_verification#code-coverage)
- **Code Fluency** — [CPSC 210: Software Construction](/index#cpsc-210-software-construction)
- **Code Smell** — [Code Quality and Refactoring § Reading the Symptoms](/part3/04_refactoring#reading-the-symptoms)
- **Code Under Test** — [Checking Invariants § The Testing Process](/part1/03_checking-invariants#the-testing-process)
- **Cohesion** — [Decomposing Systems into Cohesive Classes](/part2/02_decomposition#decomposing-systems-into-cohesive-classes)
- **Command-Query Separation** — [Adding New Features § When There Is No Extension Point](/part3/06_new_features#when-there-is-no-extension-point)
- **Compiler** — [Learning a New Programming Language § Software Systems and Programming Languages](/part1/01_new-language#software-systems-and-programming-languages)
- **Composition** — [Decomposing Systems into Cohesive Classes § Composition and Delegation](/part2/02_decomposition#composition-and-delegation)
- **Compound Types** — [Using Types to Model Problems](/part1/02_model-types#using-types-to-model-problems)
- **Concern** — [Coupling and Dependencies § Cohesion and Coupling Together](/part3/01_coupling#cohesion-and-coupling-together)
- **Constructor Function** — [Maintaining Invariants § Controlling Creation with a Constructor Function](/part1/04_maintaining-invariants#controlling-creation-with-a-constructor-function)
- **Contract** — [Checking Invariants § Documenting Invariants](/part1/03_checking-invariants#documenting-invariants)
- **Control** — [Encapsulating What Varies § Testing Encapsulated Code](/part2/03_encapsulation#testing-encapsulated-code)
- **Control Flow** — [Learning a New Programming Language § <code>if</code> statements](/part1/01_new-language#if-statements)
- **Controllability** — [Encapsulating What Varies § Testing Encapsulated Code](/part2/03_encapsulation#testing-encapsulated-code)
- **Copy, Deep** — [Encapsulating What Varies § When References Escape](/part2/03_encapsulation#when-references-escape)
- **Copy, Shallow** — [Encapsulating What Varies § When References Escape](/part2/03_encapsulation#when-references-escape)
- **Correctness** — [Part 1: Foundations of Software Construction](/part1/index#part-1-foundations-of-software-construction)
- **Coupling** — [Coupling and Dependencies](/part3/01_coupling#coupling-and-dependencies)

## D

- **Data Definition** — [Using Types to Model Problems](/part1/02_model-types#using-types-to-model-problems)
- **Debugger** — [Mutation and Side Effects § State Gives Loops a Memory](/part1/06_state-mutation#state-gives-loops-a-memory)
- **Decomposition** — [Decomposing Systems into Cohesive Classes § Cohesion and the Single Responsibility Principle](/part2/02_decomposition#cohesion-and-the-single-responsibility-principle)
- **Default Parameter Value** — [Preserving Implementation Freedom with Abstract Values § Values That Do Not Change](/part2/04_flexibility#values-that-do-not-change)
- **Defensive Copying** — [Encapsulating What Varies § When References Escape](/part2/03_encapsulation#when-references-escape)
- **Deferred Computation** — [Asynchronous Effects and Time § One Thread at a Time](/part1/07_async#one-thread-at-a-time)
- **Delegation** — [Decomposing Systems into Cohesive Classes § Composition and Delegation](/part2/02_decomposition#composition-and-delegation)
- **Dependency** — [Coupling and Dependencies § Coupling as the Design Criterion](/part3/01_coupling#coupling-as-the-design-criterion)
- **Dependency Injection** — [Consuming Data and Services by Using APIs § Supplying the Dependency](/part3/02_consuming_data#supplying-the-dependency)
- **Dependency Inversion Principle** — [Growing Systems with the Open/Closed Principle § Toward Evolution and Scale](/part2/07_ocp#toward-evolution-and-scale)
- **Deserialisation** — [Consuming Data and Services by Using APIs § What Serialisation Loses](/part3/02_consuming_data#what-serialisation-loses)
- **Design by Contract** — [Encapsulating What Varies](/part2/03_encapsulation#encapsulating-what-varies)
- **Discriminator** — [Using Types to Model Problems § Example: Playlists](/part1/02_model-types#example-playlists)
- **Doc Comment** — [Checking Invariants § Documenting Invariants](/part1/03_checking-invariants#documenting-invariants)
- **Don't Repeat Yourself** — [Extending Behaviour Through Polymorphism § Sharing Behaviour with a Base Class](/part2/06_extension#sharing-behaviour-with-a-base-class)
- **Dot Notation** — [Using Types to Model Problems § Reading an Object's Properties](/part1/02_model-types#reading-an-object-s-properties)
- **Dynamic** — [Learning a New Programming Language § Compilation and Type Checking](/part1/01_new-language#compilation-and-type-checking)
- **Dynamic Dispatch** — [Extending Behaviour Through Polymorphism § Polymorphism and Dynamic Dispatch](/part2/06_extension#polymorphism-and-dynamic-dispatch)
- **Dynamic View** — [Designing for Failure § When Exceptions Obscure Behaviour](/part1/08_errors#when-exceptions-obscure-behaviour)
- **Dynamically-Typed** — [CPSC 210: Software Construction § Choice of Programming Language](/index#choice-of-programming-language)

## E

- **Encapsulation** — [Encapsulating What Varies](/part2/03_encapsulation#encapsulating-what-varies)
- **Equivalence** — [Preserving Implementation Freedom with Abstract Values § Two Notions of Sameness](/part2/04_flexibility#two-notions-of-sameness)
- **Equivalence Class Partitioning** — [Checking Invariants § Deriving Tests from the Specification](/part1/03_checking-invariants#deriving-tests-from-the-specification)
- **Equivalence Classes** — [Checking Invariants § Equivalence Class Partitioning](/part1/03_checking-invariants#equivalence-class-partitioning)
- **Error** — [Debugging and Fault Localization § Fault, Error, Failure](/part3/05_debugging#fault-error-failure)
- **Error, Expected** — [Checking Invariants § Expected and Unexpected Errors](/part1/03_checking-invariants#expected-and-unexpected-errors)
- **Error, Unexpected** — [Checking Invariants § Expected and Unexpected Errors](/part1/03_checking-invariants#expected-and-unexpected-errors)
- **Event** — [Asynchronous Effects and Time § Deferred Computation: Callbacks](/part1/07_async#deferred-computation-callbacks)
- **Event Loop** — [Asynchronous Effects and Time § Deferred Computation: Callbacks](/part1/07_async#deferred-computation-callbacks)
- **Event-Driven Programming** — [Asynchronous Effects and Time § Deferred Computation: Callbacks](/part1/07_async#deferred-computation-callbacks)
- **Exceptions, Checked** — [Designing for Failure § Throwing an Exception](/part1/08_errors#throwing-an-exception)
- **Exceptions, Unchecked** — [Designing for Failure § Throwing an Exception](/part1/08_errors#throwing-an-exception)
- **Expressions** — [Learning a New Programming Language § Control Flow Statements (<code>if</code> and <code>return</code>)](/part1/01_new-language#control-flow-statements-if-and-return)
- **Extension** — [Extending Behaviour Through Polymorphism](/part2/06_extension#extending-behaviour-through-polymorphism)
- **Extension Point** — [Growing Systems with the Open/Closed Principle § Choosing the Axis of Change](/part2/07_ocp#choosing-the-axis-of-change)

## F

- **Failure** — [Debugging and Fault Localization § Fault, Error, Failure](/part3/05_debugging#fault-error-failure)
- **Failure, Returned** — [Designing for Failure § Choosing Between Results and Exceptions](/part1/08_errors#choosing-between-results-and-exceptions)
- **Failure, Thrown** — [Designing for Failure § Choosing Between Results and Exceptions](/part1/08_errors#choosing-between-results-and-exceptions)
- **Falsy** — [Uncovered Language Features § Truthiness](/outro/language-features#truthiness)
- **Fan-In** — [Coupling and Dependencies § Coupling as the Design Criterion](/part3/01_coupling#coupling-as-the-design-criterion)
- **Fan-Out** — [Coupling and Dependencies § Coupling as the Design Criterion](/part3/01_coupling#coupling-as-the-design-criterion)
- **Fault** — [Debugging and Fault Localization § Fault, Error, Failure](/part3/05_debugging#fault-error-failure)
- **Fault Localization** — [Debugging and Fault Localization](/part3/05_debugging#debugging-and-fault-localization)
- **Field** — [Building Abstractions with Classes § Class State](/part2/01_abstraction#class-state)
- **Fragile Base Class Problem** — [Extending Behaviour Through Polymorphism § Composition Over Inheritance](/part2/06_extension#composition-over-inheritance)
- **Fulfilled** — [Asynchronous Effects and Time § Promises: A Value That Does Not Exist Yet](/part1/07_async#promises-a-value-that-does-not-exist-yet)
- **Functional Programming** — [Building Abstractions with Classes § Three Programming Paradigms](/part2/01_abstraction#three-programming-paradigms)

## G

- **Garbage Collection** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Generic Type** — [Using Types to Model Problems § Example: Playlists](/part1/02_model-types#example-playlists)
- **Global Variable** — [Building Abstractions with Classes § The Problem: Keeping State Consistent](/part2/01_abstraction#the-problem-keeping-state-consistent)
- **God Class** — [Decomposing Systems into Cohesive Classes § How Classes Lose Cohesion](/part2/02_decomposition#how-classes-lose-cohesion)
- **Greenfield Development** — [Part 3: Enabling Evolution](/part3/index#part-3-enabling-evolution)

## H

- **Hyrum's Law** — [Designing APIs to Provide Data and Services § What Publishing Costs](/part3/03_api_design#what-publishing-costs)

## I

- **IDE** — [Learning a New Programming Language § Compilation and Type Checking](/part1/01_new-language#compilation-and-type-checking)
- **Idempotent** — [Consuming Data and Services by Using APIs § Three Ways a Call Fails](/part3/02_consuming_data#three-ways-a-call-fails)
- **Identity** — [Preserving Implementation Freedom with Abstract Values § Two Notions of Sameness](/part2/04_flexibility#two-notions-of-sameness)
- **Immutable** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Immutable Object** — [Preserving Implementation Freedom with Abstract Values § Values That Do Not Change](/part2/04_flexibility#values-that-do-not-change)
- **Imperative Programming** — [Part 1: Foundations of Software Construction](/part1/index#part-1-foundations-of-software-construction)
- **Implementation Freedom** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
- **Index** — [Arrays and Iteration § Creating and Accessing Arrays](/part1/05_arrays#creating-and-accessing-arrays)
- **Information Hiding** — [Encapsulating What Varies](/part2/03_encapsulation#encapsulating-what-varies)
- **Instance** — [Building Abstractions with Classes § Declaring and Creating Classes](/part2/01_abstraction#declaring-and-creating-classes)
- **Instantiating** — [Building Abstractions with Classes § Declaring and Creating Classes](/part2/01_abstraction#declaring-and-creating-classes)
- **Interface** — [Defining Boundaries with Interfaces](/part2/05_boundaries#defining-boundaries-with-interfaces)
- **Interface Segregation Principle** — [Defining Boundaries with Interfaces § Keeping Interfaces Small](/part2/05_boundaries#keeping-interfaces-small)
- **Invariants** — [Checking Invariants § What Is an Invariant?](/part1/03_checking-invariants#what-is-an-invariant)

## J

- **JSON** — [Arrays and Iteration § Creating and Accessing Arrays](/part1/05_arrays#creating-and-accessing-arrays)
- **JSON Array** — [Arrays and Iteration § Creating and Accessing Arrays](/part1/05_arrays#creating-and-accessing-arrays)
- **JSON Object** — [Arrays and Iteration § Creating and Accessing Arrays](/part1/05_arrays#creating-and-accessing-arrays)

## K

- **Key** — [Arrays and Iteration § Creating and Accessing Arrays](/part1/05_arrays#creating-and-accessing-arrays)

## L

- **Lambda Expressions** — [Learning a New Programming Language § Validating the Dynamic View With Testing](/part1/01_new-language#validating-the-dynamic-view-with-testing)
- **Language, Typed** — [CPSC 210: Software Construction § Choice of Programming Language](/index#choice-of-programming-language)
- **Language, Untyped** — [CPSC 210: Software Construction § Choice of Programming Language](/index#choice-of-programming-language)
- **Law of Demeter** — [Coupling and Dependencies § Reaching Past a Neighbour](/part3/01_coupling#reaching-past-a-neighbour)
- **Library** — [Designing APIs to Provide Data and Services § Publishing the Tracker](/part3/03_api_design#publishing-the-tracker)
- **Library API** — [Consuming Data and Services by Using APIs § Two Kinds of API](/part3/02_consuming_data#two-kinds-of-api)
- **Lifecycle Hooks** — [Verifying Behaviour § What a Test Case Can Now Hold](/part1/09_verification#what-a-test-case-can-now-hold)
- **Loop** — [Arrays and Iteration § Writing Your Own Loops](/part1/05_arrays#writing-your-own-loops)

## M

- **Memory Address** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Method** — [Building Abstractions with Classes § Class Functionality](/part2/01_abstraction#class-functionality)
- **Method Signature** — [Defining Boundaries with Interfaces § A Channel as a Contract](/part2/05_boundaries#a-channel-as-a-contract)
- **Mock Object** — [Defining Boundaries with Interfaces § Testing Across the Boundary](/part2/05_boundaries#testing-across-the-boundary)
- **Mutable Object** — [Preserving Implementation Freedom with Abstract Values § Values That Do Not Change](/part2/04_flexibility#values-that-do-not-change)
- **Mutation** — [Mutation and Side Effects](/part1/06_state-mutation#mutation-and-side-effects)

## N

- **Names** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Non-Local Return** — [Designing for Failure § Exceptions Travel Up the Call Stack](/part1/08_errors#exceptions-travel-up-the-call-stack)

## O

- **Object** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Object-Oriented Programming** — [Building Abstractions with Classes § Three Programming Paradigms](/part2/01_abstraction#three-programming-paradigms)
- **Observability** — [Encapsulating What Varies § Testing Encapsulated Code](/part2/03_encapsulation#testing-encapsulated-code)
- **Observe** — [Encapsulating What Varies § Testing Encapsulated Code](/part2/03_encapsulation#testing-encapsulated-code)
- **Open for Extension** — [Growing Systems with the Open/Closed Principle § Open for Extension, Closed for Modification](/part2/07_ocp#open-for-extension-closed-for-modification)
<!-- EXCLUDED, do not re-add. Bold in the Chapter 16 recap list, but that list
     points back at earlier chapters rather than defining a term here; the
     concept is already covered by "Open/Closed Principle" below.
- **Open and Closed** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
-->
- **Open/Closed Principle** — [Growing Systems with the Open/Closed Principle](/part2/07_ocp#growing-systems-with-the-open-closed-principle)
- **Operating System** — [Asynchronous Effects and Time § `async` and `await`](/part1/07_async#async-and-await)
- **Optional** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Options Object** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Override** — [Extending Behaviour Through Polymorphism § Sharing Behaviour with a Base Class](/part2/06_extension#sharing-behaviour-with-a-base-class)

## P

- **Parameters** — [Learning a New Programming Language § Types as a Language Mechanism](/part1/01_new-language#types-as-a-language-mechanism)
- **Pass-by-Reference** — [Mutation and Side Effects § What a Function Can and Cannot Change](/part1/06_state-mutation#what-a-function-can-and-cannot-change)
- **Pass-by-Value** — [Mutation and Side Effects § What a Function Can and Cannot Change](/part1/06_state-mutation#what-a-function-can-and-cannot-change)
- **Path** — [Checking Invariants § Equivalence Class Partitioning](/part1/03_checking-invariants#equivalence-class-partitioning)
- **Pending** — [Asynchronous Effects and Time § Promises: A Value That Does Not Exist Yet](/part1/07_async#promises-a-value-that-does-not-exist-yet)
- **Plugin Architecture** — [Growing Systems with the Open/Closed Principle § Why Closed to Modification Matters](/part2/07_ocp#why-closed-to-modification-matters)
- **Pointers** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Polymorphism** — [Extending Behaviour Through Polymorphism § Polymorphism and Dynamic Dispatch](/part2/06_extension#polymorphism-and-dynamic-dispatch)
- **Postcondition** — [Checking Invariants § Identifying Invariants](/part1/03_checking-invariants#identifying-invariants)
- **Precondition** — [Checking Invariants § Identifying Invariants](/part1/03_checking-invariants#identifying-invariants)
- **Primitive** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Promise** — [Asynchronous Effects and Time § Promises: A Value That Does Not Exist Yet](/part1/07_async#promises-a-value-that-does-not-exist-yet)
- **Pure** — [Mutation and Side Effects § Side Effects](/part1/06_state-mutation#side-effects)

## Q

- **Quality, External** — [Code Quality and Refactoring § Two Kinds of Quality](/part3/04_refactoring#two-kinds-of-quality)
- **Quality, Internal** — [Code Quality and Refactoring § Two Kinds of Quality](/part3/04_refactoring#two-kinds-of-quality)
- **Query String** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)

## R

- **Reassignment** — [Mutation and Side Effects § Reassignment](/part1/06_state-mutation#reassignment)
- **Recovery** — [Designing for Failure § Recovering, or Just Reporting](/part1/08_errors#recovering-or-just-reporting)
- **Refactoring** — [Code Quality and Refactoring § What Refactoring Is](/part3/04_refactoring#what-refactoring-is)
- **Reference** — [Mutation and Side Effects § Copies and References](/part1/06_state-mutation#copies-and-references)
- **Regression** — [Verifying Behaviour § Regression Testing](/part1/09_verification#regression-testing)
- **Rejected** — [Asynchronous Effects and Time § Promises: A Value That Does Not Exist Yet](/part1/07_async#promises-a-value-that-does-not-exist-yet)
- **Representation** — [Preserving Implementation Freedom with Abstract Values § What Makes a Change Safe](/part2/04_flexibility#what-makes-a-change-safe)
- **Representative** — [Checking Invariants § Equivalence Class Partitioning](/part1/03_checking-invariants#equivalence-class-partitioning)
- **Resource** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **REST** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Return** — [Learning a New Programming Language § <code>return</code> statements](/part1/01_new-language#return-statements)
- **Ripple Effect** — [Coupling and Dependencies § The Ripple Effect](/part3/01_coupling#the-ripple-effect)
- **Robustness Principle** — [Designing APIs to Provide Data and Services § Compatible and Breaking Change](/part3/03_api_design#compatible-and-breaking-change)
- **Runtime** — [Learning a New Programming Language § Compilation and Type Checking](/part1/01_new-language#compilation-and-type-checking)

## S

- **Scattering** — [Coupling and Dependencies § Cohesion and Coupling Together](/part3/01_coupling#cohesion-and-coupling-together)
- **Schema** — [Consuming Data and Services by Using APIs § The Same Job, From a Library](/part3/02_consuming_data#the-same-job-from-a-library)
- **Scope** — [Mutation and Side Effects § Scope: Where Names Live](/part1/06_state-mutation#scope-where-names-live)
- **Semantic Versioning** — [Designing APIs to Provide Data and Services § Versioning and Deprecation](/part3/03_api_design#versioning-and-deprecation)
- **Sentinel Values** — [Designing for Failure § The Cost of Interleaving Results](/part1/08_errors#the-cost-of-interleaving-results)
- **Separation of Concerns** — [Coupling and Dependencies § Cohesion and Coupling Together](/part3/01_coupling#cohesion-and-coupling-together)
- **Serialisation** — [Consuming Data and Services by Using APIs § What Serialisation Loses](/part3/02_consuming_data#what-serialisation-loses)
- **Side Effect** — [Mutation and Side Effects § Side Effects](/part1/06_state-mutation#side-effects)
- **Signature** — [Learning a New Programming Language § Quick Primer on Functions](/part1/01_new-language#quick-primer-on-functions)
- **Single Responsibility Principle** — [Decomposing Systems into Cohesive Classes § Cohesion and the Single Responsibility Principle](/part2/02_decomposition#cohesion-and-the-single-responsibility-principle)
<!-- EXCLUDED, do not re-add. Bold in the Chapter 16 recap list, but that list
     points back at earlier chapters rather than defining a term here; the
     concept belongs to Chapter 14 and is covered by "Interface" and
     "Interface Segregation Principle".
- **Small Contracts** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
-->
- **State** — [Learning a New Programming Language § Control Flow Statements (<code>if</code> and <code>return</code>)](/part1/01_new-language#control-flow-statements-if-and-return)
- **Statement** — [Learning a New Programming Language § Control Flow Statements (<code>if</code> and <code>return</code>)](/part1/01_new-language#control-flow-statements-if-and-return)
- **Static** — [Learning a New Programming Language § Compilation and Type Checking](/part1/01_new-language#compilation-and-type-checking)
- **Static View** — [Designing for Failure § When Exceptions Obscure Behaviour](/part1/08_errors#when-exceptions-obscure-behaviour)
- **Statically-Typed** — [CPSC 210: Software Construction § Choice of Programming Language](/index#choice-of-programming-language)
- **Status Code** — [Consuming Data and Services by Using APIs § Calling a Web Service](/part3/02_consuming_data#calling-a-web-service)
- **Strictly Equal** — [Using Types to Model Problems § Branching on the Case](/part1/02_model-types#branching-on-the-case)
- **Strongly-Typed** — [CPSC 210: Software Construction § Choice of Programming Language](/index#choice-of-programming-language)
- **Stub** — [Checking Invariants § The Testing Process](/part1/03_checking-invariants#the-testing-process)
- **Substitutability** — [Growing Systems with the Open/Closed Principle § The Principles Together](/part2/07_ocp#the-principles-together)
- **Syntax** — [Learning a New Programming Language § Software Systems and Programming Languages](/part1/01_new-language#software-systems-and-programming-languages)

## T

- **Tagged Union** — [Using Types to Model Problems § Example: Playlists](/part1/02_model-types#example-playlists)
- **Tangling** — [Coupling and Dependencies § Cohesion and Coupling Together](/part3/01_coupling#cohesion-and-coupling-together)
- **Technical Debt** — [Code Quality and Refactoring § Technical Debt](/part3/04_refactoring#technical-debt)
- **Tell, Don't Ask** — [Coupling and Dependencies § Reaching Past a Neighbour](/part3/01_coupling#reaching-past-a-neighbour)
- **Terminal** — [Checking Invariants § Checking Invariants With Tests](/part1/03_checking-invariants#checking-invariants-with-tests)
- **Ternary Operator** — [Learning a New Programming Language § <code>return</code> statements](/part1/01_new-language#return-statements)
- **Test Double** — [Defining Boundaries with Interfaces § Testing Across the Boundary](/part2/05_boundaries#testing-across-the-boundary)
- **Tests** — [Part 1: Foundations of Software Construction § Layered Correctness](/part1/index#layered-correctness)
- **Text Encoding** — [Asynchronous Effects and Time § Reading and Writing Files](/part1/07_async#reading-and-writing-files)
- **Thread** — [Asynchronous Effects and Time § One Thread at a Time](/part1/07_async#one-thread-at-a-time)
- **Threading Model** — [Asynchronous Effects and Time § One Thread at a Time](/part1/07_async#one-thread-at-a-time)
- **Throw** — [Designing for Failure § Throwing an Exception](/part1/08_errors#throwing-an-exception)
- **Thunk** — [Learning a New Programming Language § Validating the Dynamic View With Testing](/part1/01_new-language#validating-the-dynamic-view-with-testing)
- **Truthy** — [Uncovered Language Features § Truthiness](/outro/language-features#truthiness)
- **Type, Actual** — [Defining Boundaries with Interfaces § Apparent and Actual Types](/part2/05_boundaries#apparent-and-actual-types)
- **Type, Apparent** — [Defining Boundaries with Interfaces § Apparent and Actual Types](/part2/05_boundaries#apparent-and-actual-types)
- **Type Checker** — [Learning a New Programming Language § Types as a Language Mechanism](/part1/01_new-language#types-as-a-language-mechanism)
- **Type Errors** — [Learning a New Programming Language § Compilation and Type Checking](/part1/01_new-language#compilation-and-type-checking)
- **Type Narrowing** — [Using Types to Model Problems § Branching on the Case](/part1/02_model-types#branching-on-the-case)
- **Type Variables** — [Using Types to Model Problems § Example: Playlists](/part1/02_model-types#example-playlists)
- **Types** — [CPSC 210: Software Construction § Choice of Programming Language](/index#choice-of-programming-language)

## U

- **Unit Tests** — [Checking Invariants](/part1/03_checking-invariants#checking-invariants)

## V

- **Value Object** — [Preserving Implementation Freedom with Abstract Values § Values That Do Not Change](/part2/04_flexibility#values-that-do-not-change)

## W

- **Web Service** — [Asynchronous Effects and Time § Calling Web Services](/part1/07_async#calling-web-services)
- **Web Service API** — [Consuming Data and Services by Using APIs § Two Kinds of API](/part3/02_consuming_data#two-kinds-of-api)
- **White-Box Testing** — [Verifying Behaviour § White-Box Testing](/part1/09_verification#white-box-testing)
