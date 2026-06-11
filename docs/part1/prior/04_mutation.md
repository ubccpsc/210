# Mutation and State

## Motivation

Many problems that programs are designed to solve are most naturally expressed as updating an existing value.
For larger systems, changing a value is more efficient than producing new copies of the data with the updated value substituted.

## The Problem





For example, a bank account has a balance that naturally changes over time a money is deposited and withdrawn.
This is likely more intuititive then our previous attempt at a bank account which produced a new bank account holding the updated balance.
To model this directly in our programs, the language must provide a mechanism that lets us to assign a new value to a previously defined variable.
When we do this, we have mutated our program.

Fundamentally, the reason for mutation is that can be significantly more performant in certain types of problems.
Creating new objects is an expensive operation so when only one property of the object changes, making that change in-place, rather than copying the entire object and substituting the updated value can be a lot faster.
> callout: object creation (+garbage collection)

This is especially true for large arrays: updating the balance for a single account at a large bank without mutation would required making a copy of potentially millions of other accounts, substituting the balance for just the account that needed to be updated.


contrast with immutability: only produce _new_ values. Programs written with immutability can be easier to reason about as 



// callout to the previous FP version??
For example, it is more likely more natural to think about a bank account balance as something that starts with an initial value and whose value changes over time as money is deposited and withdrawn from the account.




Defn: 
- mutation: lanuage mechanism for values to previously defined variables.
- state: the value of variables at a particular point in a programs execution. It is a consequence of mutation. Importantly, state changes over time (as the program executes) which can impact program understanding.

## Implications of Mutation

<!-- The example here must be simple: gloabl variable + two functions. the order of function calls determines whether the program crashes -->

Mutation can make it difficult to determine the state of a program by just reading the source code.

The worst kind is Global State where values are declared at top-level and can be updated by functions anywhere in the code at any time.

Reference semantics: objects are pass by reference (compared to primitives that are pass by value).

To keep the benefits of mutation, developers strive to localize state as much as possible to the area(s) of the program that changes it.
    - localize state: narrow the scope
    - Debuggers show up here!

## Side-effects

- reading data into our programs: we don't know what it will be so we have to handle that (we can't just read the code and know exactly how it wil behave since it will depend on what values are actually present in the data); this is where pure FP breaks down since we can no longer completely trace the executation of our program. At the same time it is necessary for real programs.
- interacting with the rest of the world is messy: exceptions can and do happen! We need mechanisms in place to coordinate with the rest of the system where the program is running.

In NodeJS programs, functions that interact with the outside communicate problems through exceptions.

## Declaring Variables (Mutable Values)

Many programming languages distinugish between defining constant values and declaring variables whose values can be reassigned.
In general, constant values are easier to reason about: once the value has be defined, it will always be that value any time it is dereferenced.
Variables are more congitively demanding for developers to reason about because there is no guarantee that it will be a particular value.
Instead, developers have to mentally trace each deference backwards through the code to identify the most recent assignment (and potentially trace back further to identify the value of that assignment).

<!-- tooltip: variables-->
TypeScript provides the `let` keyword to define values that can change.
Variables declared with `let` follow the same block-level scoping rules as `const` with the two key differences: `let` (1) permits reassigning its value, and (2) only declares a variable, so a initial value does not need to be prvoided.
These differences are outlined in the examples below.

```typescript
const pi = 3.1415...;
pi = 1.2345;  // fails: the value of a const cannot be changed

```

```typescript
let favouriteLanguage = "typescript";
favouriteLanguage = "racket";  // allowed

// any deferences of favouriteLanguage will now return "racket"
```

```typescript
// Unlike const, we can declare a variable without an initial value, 
// in which case the initial value is undefined.
// Since TS can't infer the type of the value when it isn't present,
// we have to tell TS what values it can take.
let favouriteColour: string | undefined;

function setFavouriteColour(colour: string): void {
    favouriteColour = colour;
}

// favouriteColour is undefined

setFavouriteColour("blue");

// favouriteColour is now "blue"

setFavouriteColour("red");

// favouriteColour is now "red"

```

<!--exercise: which is easier to understand? -->
<!--two small programs: one using only const, the other using lets -->

<!-- I guess this would also be part of the tooltip -->
## Mutation of Objects

In typescript, objects (and arrays) are mutable.
That means we can change the values of properties after definition.

```typescript
const person = {
    firstName: "John",
    lastName: "Doe"
}

// this is allowed
person.firstName = "Jane"


// However, we can't reassign person to a new object (unless we declared person using let)
person = {
    firstName: "Jane",
    lastName: "Doe"
}
```

Since Arrays are built-in objects, we can also mutate their values:

```typescript
const colours = ["red", "green", "blue"]

// Many functions on the array object mutate the array in place
colours.push("purple");
// ["red", "green", "blue", "purple"]

colours.sort()
// ["blue", "green", "purple", "red"]

// We can also update elements in the array using their position
colours[0] = "turqouise"
// ["turqouise", "green", "purple", "red"]

colours[3] = "orange"
// ["turqouise", "green", "purple", "orange"]
```

## Iteration

Alternative to recusion for the following use cases:

- do something a fixed number of times (outside the shape of our data)
- early exits: break/continue/return

<!-- constrast w/ declarative? --->


<!--
So iteration naturally belongs here because:

Loops require mutable state - A traditional for loop with a counter only exists because you can mutate that counter. Without mutation, you'd need recursion or functional constructs like map/filter.

Performance optimization through mutation - Early exits (break/continue) let you stop work early, which is a form of optimization. Updating an array in-place with mutation is cheaper than immutable alternatives. So iteration fits the performance narrative you established in the motivation section.

Iteration vs. Recursion - This distinction is actually pedagogically useful: recursion is the functional (immutable-friendly) way to express repetition, while iteration is the imperative (mutation-dependent) way. They solve the same problem with different tradeoffs.

So you could reframe the iteration section to emphasize that it's an alternative to recursion that becomes available because you now have mutation, and it offers performance benefits (especially early exits) in certain contexts. This ties it directly back to the core themes of the section rather than making it feel like a separate topic.
-->

## Takeaway

- use mutation sparringly where it naturally models the problem, or it is required for performance reasons.
- immutability can be easier to reason about as there are few implicit dependencies on other parts of program state.
Many real programs strive for immutability in-the-small and are careful to introduce state carefully and in a controlled manner.
