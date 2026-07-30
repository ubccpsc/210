# Maintaining Invariants

The previous chapter placed invariants in documentation, tests, and assertions. These mechanisms *detect* problems: tests probe chosen inputs, and assertions terminate the program when an impossible state is observed. 

A shortcoming of these mechanisms though is that they cannot *prevent* invalid values from being created in the first place. This chapter is about closing that gap: designing code that wholly prevents invalid values from being created, rather than writing code that checks for violations.

In this chapter, we will show how this can be done _solely with programming constructs_ you know from CPSC 110. The solution we'll get to is not standard TypeScript; you may, in fact, find it unwieldy. This is expected. In fact, it will motivate the object-oriented programming we'll get to in Part 2.

## Initial Design with No Enforcement

We will build on the `BankAccount` design from the previous lecture activity. The design has a data type carrying an invariant, and functions that operate on it:

```typescript
/**
 * A bank account holding a balance in dollars.
 *
 * Invariant: balance >= 0
 */
type BankAccount = {
  balance: number;
};

/**
 * Deposits the given amount into the account.
 *
 * Precondition: amount > 0
 * Postcondition: the returned account satisfies balance >= 0
 *
 * @param {BankAccount} account the account to deposit into
 * @param {number} amount the amount to deposit (in dollars)
 * @returns {BankAccount} a new BankAccount with an increased balance
 */
function deposit(account: BankAccount, amount: number): BankAccount {
  return { balance: account.balance + amount };
}
```

A matching `withdraw` follows the same shape. The contracts are documented, tests can be derived from them, and assertions can guard the implementations. 

By the standards of the previous chapter, this design is complete.

## Valid Types, Invalid Values

The design above allows invalid values to pass the type checker:

```typescript
const account: BankAccount = { balance: -100 }; // passes the type checker
```

This is the same issue we encountered with the `Song` whose duration was `-30`: the object has the right *shape*, so the static check passes, but its *meaning* is wrong. 

However, nothing about the `BankAccount` type connects it to `deposit` and `withdraw`. We can build any object literal with a `balance` property and the language will call it a `BankAccount`, whether or not the invariant holds. 

To ensure an invariant holds for the life of a program, we must ensure two things: 

1. when the value is created, the invariant must be *established*; and 
2. every operation that produces a new value from an old one must *preserve* the invariant. 

If both are true, then every value that ever exists is valid: the first one was checked, and every later one came from an operation that kept the promise. In the initial design, creation---by writing an object literal---is open to everyone, so we cannot ensure the invariant is *established* on account creation.

## Controlling Creation with a Constructor Function

To ensure invariants are established correctly, we provide a function whose job is to create valid accounts:

```typescript
/**
 * Creates a new bank account holding balance dollars.
 *
 * Precondition: balance >= 0
 *
 * @param {number} balance the starting balance
 * @returns {BankAccount} a new account satisfying the invariant
 */
function makeAccount(balance: number): BankAccount {
  assert(balance >= 0, "Account balance must not be negative");
  return { balance: balance };
}
```

A function like this is called a **constructor function**: it constructs values of a type, and it is the gatekeeper where the invariant is established. Every account it returns is valid, and an attempt to create an invalid one halts immediately:

```typescript
test("accounts cannot be created with a negative balance",
    checkError(() => makeAccount(-100))
);
```

This is progress: accounts created with `makeAccount` protect the invariant. 

But, the protection remains a convention. Nothing *forces* a client to call `makeAccount`: the literal `{ balance: -100 }` still type checks, exactly as before. The same is true of `deposit` and `withdraw`; a client can skip them and write `{ balance: account.balance - 200 }` by hand. The constructor function and the operations exist alongside data that remains open to everyone. 

Making the invariant safe depends on every engineer choosing to go through the right functions---the exact _programmer discipline_ we have been trying to avoid relying on.

## True Safety by Binding Operations to the Data

The root of the problem is that the data and its operations are disconnected: the `balance` field is reachable by anyone, and `deposit` and `withdraw` are free-standing functions that anyone may bypass. To solve the problem, we must connect the two, so that the operations *belong to* the account and the data is reachable *only* through them.

To do this, we need a language feature we've not yet mentioned: an object property can hold a function. We can define a `BankAccount` type whose properties are not data at all, but operations:

```typescript
/**
 * A bank account that accepts deposits and withdrawals.
 *
 * Invariant: balance >= 0
 */
type BankAccount = {
  deposit(amount: number): BankAccount;
  withdraw(amount: number): Result<BankAccount, string>;
  getBalance(): number;
};
```

Intentionally, there is no `balance` field. The type of `BankAccount` no longer describes what an account *stores*; it describes what an account *can do*. A holder of a `BankAccount` can deposit, withdraw, and observe the balance (`getBalance`), and that is all. These operations are invoked with dot notation:

```typescript
// given an initialAccount of type BankAccount ...
const funded = initialAccount.deposit(5);
```

We have seen dot before. In Chapter 2 it read a property: `song1.title` selected the value stored under `title`. `initialAccount.deposit` selects the value stored under `deposit` in the same way, and what differs is only that the value found there is a function rather than a string or a number. The `(5)` that follows then calls it, just as `letterGrade(85)` called a function named directly. The expression composes two steps you have already used: select a property, then call what the selection produced.

What is new is _which_ function you get. A free-standing `deposit(account, 5)` is one function shared by every caller, which is why it has to be told which account to act on. `initialAccount.deposit` is the function belonging to this _specific_ account, so the balance it operates on is chosen by the object the dot selected it from, and a caller cannot point it at a different account.

<details class="tooltip ts-tips">
<summary>Functions as Properties</summary>

So far, every object property we have used has held a data value: `song.title` held a string, and `account.balance` held a number. 

A property can also hold a *function*. In particular:
```typescript
type T = {
  foo(x: X, b: Y): Z;
};
```
declares a function property `foo` on the type `T`. `foo` takes in two arguments, `x` and `b`, of types `X` and `Y`, and returns a value of type `Z`.

In an object literal, the property is written like a function declaration without the `function` keyword:
```typescript
{
  foo(x: X, b: Y): Z {
     // statements to
  }
};
```

If `t` is of type `T`, we can call the function property `foo` with dot notation: `t.foo(an_x, a_b)`.


What it means for behaviour to belong to data like this is a question we will revisit when we discuss object-oriented programming in Part 2.

</details>

<details class="tooltip link-110">
<summary>Operations in Structures in ISL</summary>

CPSC 110 allowed the same move: a structure's fields could hold functions, so a data definition could bundle a value's operations with the value itself.

```racket
(define-struct counter-interface (increment get-count))
;; Counter is (make-counter-interface (-> Counter) (-> Number))
;; interp. a counter that carries its own operations
```

The TypeScript type above is the same idea: a record whose fields are the operations clients are meant to use.

</details>

Removing the balance field solves our invariant preservation problem: `balance` is no longer accessible by outsiders. But it introduces a logic problem: the operations can no longer access a `balance` field and do useful work. How can we create a `balance` field only the operations can access?

## Hiding State with a Closure

The initial balance lives in the constructor function's parameter. Could we keep the balance field there? Yes, with a concept you've seen in CPSC 110: the **closure**.

A function created inside another function keeps access to the enclosing function's parameters and definitions, even after the enclosing function has returned. A function that carries captured context like this is called a **closure**. 

To (re-)introduce closures, we'll consider a problem simpler than the bank account:

> As a door attendant at a venue, I want a clicker counter that refuses to count past the venue's capacity, so that we never admit more people than fire regulations allow.

<details class="tooltip link-110">
<summary>You Built Closures with <code>local</code></summary>

This is the role `local` played in CPSC 110. Functions defined in a `local` could use the parameters of the enclosing function, and handing those inner functions back was how a value's state could be kept out of reach:

```racket
;; Venue capacity
(define MAX-CAPACITY 1000)

;; make-counter : Number -> Counter
;; Protects the invariant: count cannot exceed MAX-CAPACITY
(define (make-counter n)
  (cond [(> n MAX-CAPACITY) (error "Invariant violation: Venue is full!")]
        [else
          (local [;; increment : -> Counter
                  (define (increment)
                    (make-counter (+ n 1)))

                  ;; get-count : -> Number
                  (define (get-count)
                    n)]
           (make-counter-interface increment get-count))]))
```

The inner functions close over `n`. The TypeScript version of this counter appears below.

</details>

We have all the syntax ingredients we need to create closures:  function declarations, object literals, and functions as object properties. Let's put these together to write code that _protects_ the fire-safety invariant. In particular, we'll write a constructor function that returns a `Counter` object whose functions close over the current counter value: 

```typescript
const MAX_CAPACITY: number = 1000;

/**
 * A clicker counter that counts people entering a venue.
 *
 * Invariant: the count must not exceed MAX_CAPACITY.
 */
type Counter = {
    increment(): Counter;
    getCount(): number;
}

/**
 * Creates a counter holding the given count.
 *
 * Precondition: count <= MAX_CAPACITY
 *
 * @param {number} count the current count
 * @returns {Counter} a new Counter satisfying the invariant
 */
export function makeCounter(count: number): Counter {
  // Establish the invariant: no counter exists without passing this check.
  assert(count <= MAX_CAPACITY, "Invariant violation: Venue is full!");

  // The functions below form a closure over count.
  return {
    increment(): Counter {
      return makeCounter(count + 1);
    },

    getCount(): number {
      return count;
    }
  };
}
```
<details class="tooltip ts-tips">
<summary>The <code>export</code> Keyword</summary>

The `export` in front of `makeCounter` marks it as available to code in other files; definitions without it, like `MAX_CAPACITY`, stay private to the file that contains them. Choosing what a file exports is another way to control what clients can reach, and we return to it properly when the course discusses modules.

</details>

This code both _establishes_ and _preserves_ the fire-safety invariant. The constructor function `makeCounter` establishes the invariant with its top-level assertion. Because `increment` produces its successor by calling `makeCounter` again, every state the counter ever occupies passes through that check. The closure over `count` allows `increment` and `getCount` to access count, but no `count` property exists for anyone else to alter. The operations returned by the constructor are the only way to interact with the state, and they preserve the invariant.

<details class="tooltip deep-dive">
<summary>Every Operation Returns a New Value</summary>

`increment` does not change the account it was called on; it returns a new counter whose count is higher. This may seem roundabout, but it is the only option available to us: we (so far) have no way to change an existing value. This is also the way every program in CPSC 110 worked. 

</details>



Let's write tests for `increment`:

```typescript
const empty = makeCounter(0);
const one = empty.increment();
const two = one.increment();

test("each click is counted", checkExpect(() => two.getCount(), 2));

test("the original counter is unchanged",
    checkExpect(() => empty.getCount(), 0)
);

const full = makeCounter(1000); // the venue is exactly at capacity

test("the counter refuses to count past capacity",
    checkError(() => full.increment())
);
```

Connecting back to the previous chapter, the last test treats a click at full capacity as an *unexpected* error and halts. If turning people away at the door were a normal outcome the program should handle, `increment` would instead return a `Result`. Which treatment is right is a design decision, not a coding one.

<details class="tooltip exercise">
  <summary>Exercise: Reflect on Closures</summary>

Compare the closure above to an implementation of `Counter` without them:

<CollapsibleCode>

```typescript
const MAX_CAPACITY: number = 1000;

/**
 * A clicker counter that counts people entering a venue.
 *
 * Invariant: the count must not exceed MAX_CAPACITY.
 */
type Counter = {
    n: number;
}

/**
 * Creates a counter holding the given count.
 *
 * Precondition: count <= MAX_CAPACITY
 *
 * @param {number} count the current count
 * @returns {Counter} a new Counter satisfying the invariant
 */
function makeCounter(count: number): Counter {
  // Establish the invariant: no counter exists without passing this check.
  assert(count <= MAX_CAPACITY, "Invariant violation: Venue is full!");
  return {n: count};
}

/**
 * Creates a counter holding the given count.
 *
 * Precondition: count < MAX_CAPACITY
 * Postcondtion: count <= MAX_CAPACITY
 *
 * @param {Counter} the counter to increment
 * @returns {Counter} a new Counter satisfying the invariant
 */
function increment(counter: Counter): Counter {
  return {n: counter.n + 1};
}
```
</CollapsibleCode>

Do you find one of these pieces of code easier to read? Why? Does preserving `n` as a field of `Counter` affect readability? What about having `increment` be defined inline, as in the closure version, versus as a top-level function?

If you could tell TypeScript that `n` can only be changed by certain functions, could you ensure the fire-safety invariant without closures? Explain.

</details>






## Using Closures to Protect BankAccount

Let's now use closures to keep the advantage of removing `balance` as a field (outsiders can't access it!) while removing its disadvantage (operations can't access it!).

We do this by creating the three operations inside `makeAccount`, while `balance` is in scope. Each of them closes over it:

```typescript
/**
 * Creates a new bank account holding balance dollars.
 *
 * Precondition: balance >= 0
 *
 * @param {number} balance the starting balance
 * @returns {BankAccount} a new account satisfying the invariant
 */
export function makeAccount(balance: number): BankAccount {
  assert(balance >= 0, "Account balance must not be negative");

  // The functions below form a closure over balance: each keeps
  // access to the balance of the makeAccount call that created it.
  return {
    deposit(amount: number): BankAccount {
      assert(amount > 0, "Amount must be greater than 0");
      return makeAccount(balance + amount);
    },

    withdraw(amount: number): Result<BankAccount, string> {
      assert(amount > 0, "Amount must be greater than 0");
      if (amount > balance) {
        return { ok: false, error: "Amount must not be greater than the current account balance" };
      }
      return { ok: true, value: makeAccount(balance - amount) };
    },

    getBalance(): number {
      return balance;
    }
  };
}
```

In our earlier designs, `deposit` and `withdraw` took the account as a parameter. These versions take none, because the operations know their balance: it is the `balance` of the `makeAccount` call that created it. Every call to `makeAccount` produces a fresh `balance` and three fresh functions closed over it, so two accounts never share state.

Notice where new account states come from. `deposit` and `withdraw` do not build result objects by hand; they call `makeAccount` again with the new balance. Every account that ever exists in the program, including every intermediate state produced by an operation, has passed through the gatekeeper and its assertion. The invariant is established at creation and re-established at every transition.



The structural change  ensures that the invariant is _enforced by the programming language_ rather than by _programmer discipline_. There is no longer a `balance` property anywhere in the program for a client to read, to forge, or to copy incorrectly. The only access to the balance is `getBalance`, and the only way to produce a new state is through `deposit` and `withdraw`. The literal `{ balance: -100 }` no longer represents `BankAccount`; the type checker will reject `const ba: BankAccount = {balance: -100}`. Here's an example use of our new `BankAccount` type:


```typescript
const account = makeAccount(0);
const funded = account.deposit(5);

test("a deposit is reflected in the balance",
    checkExpect(() => funded.getBalance(), 5)
);

test("a withdrawal beyond the balance is refused",
    checkExpect(() => funded.withdraw(8), {
        ok: false,
        error: "Amount must not be greater than the current account balance"
    })
);
```

In short, the invariant is no longer protected by _programmer discipline_; it is protected because the state cannot be reached any other way. The operations and the balance live together inside the closure, and only the operations are handed back, so nothing outside can reach the balance:

```ditaa
    
              makeAccount (creates closure)
            | 
            | 
            v  
    +--------------------------------------------+
    |    +------------------+                    |
    |    | balance; number  |                    |
    |    +------------------+                    |
    |                                            |
    |  deposit(..)  withdraw(..)  getBalance()   |
    +--------------------------------------------+
           ^             ^            ^
           |             |            |
       only operations visible to callers
       (balance cannot be accessed directly)
```
<!-- caption="Figure 04.01: Illustration of state hidden inside a closure, with balance not being directly reachable." -->

<details class="tooltip deep-dive">
<summary>Course Preview: Does Software in Practice Enforce Security Invaraints?</summary>

This chapter has focused on how we can ensure that invariants are enforced in code. The examples we have are small, but even in this small example we see a real-world safety implication (that venues not be filled over fire-code limits!). Code nowadays runs on so many platforms and has access to so much of our data. How do we ensure that only code we expect to run runs on our machines, and how do we ensure that that code doesn't leak our information to people who shouldn't have it?

The answer is: much code in the wild *doesn't* manage to enforce such invariants, leading to many security and privacy issues in the wild. If this is interesting to you from a technical standpoint, you may be interested in learning more about *computer security*, either through courses (CPSC 337, CPSC 541), or cyber-securtity competitions ([Maple Bacon Team](https://maplebacon.org/)). If you're interested in the societal implications, you may be interested in CPSC 430.

</details>


## Protecting Invariants Drives Design

Looking at our designs in this chapter, we see that the invariants of our programs strongly influenced our program design: 

1. To ensure the invariant is established, we restricted creation of BankAccounts to a single constructor function;
2. To ensure the invariant was preserved, we bound operations to the data, so that they---rather than every caller of the operation---could preserve the invariant;
3. To ensure that no one else could disturb the invariant, we hid the invariant-relevant state in a closure.

The organisation of the code itself enforces the invariant. This is the first time we have seen an invariant shape the _design of a program_ rather than just _its documentation and tests_. It will not be the last time we see this: protecting invariants frequently drives how code is organised, as this makes the code safer, easier to understand, and easier to evolve without error.

Building objects out of closures works, but the support the language gives us for this task is minimal. In Part 2, we will see that object-oriented programming provides this pattern as direct language syntax: constructors, methods, and fields that the language itself controls access to. The syntax will be new, but the idea will directly flow from this chapter.

<details class="tooltip exercise">
  <summary>Exercise: Character Health</summary>

Practise this chapter's process on a new problem.

> As a game developer, I want a character's health to stay between 0 and its maximum, so that nothing in the game can drive it out of range.

A character's health has a current hit-point count and a maximum, and must always satisfy the invariant `0 <= hp <= maxHp`. A holder of a `Health` value should be able to apply damage, apply healing, read the current hit points, and ask whether the character is still alive, but should never be able to reach the underlying numbers directly.

1. Define a `Health` type whose properties are _operations_, not data: <span class="hint">`damage(amount: number): Health`</span>, <span class="hint">`heal(amount: number): Health`</span>, <span class="hint">`getHp(): number`</span>, and <span class="hint">`isAlive(): boolean`</span>. There should be no `hp` or `maxHp` field on the type.
2. Write a constructor function `makeHealth(maxHp: number, hp: number): Health` that _establishes_ the invariant with an `assert` <span class="hint">(reject a `maxHp` below 1, or an `hp` outside `0` to `maxHp`)</span> and hides `hp` and `maxHp` in a closure. Model it on `makeCounter`.
3. Implement `damage` and `heal` so they _preserve_ the invariant: <span class="hint">damage never drops hit points below 0, and heal never raises them above `maxHp`</span>. Each should return a new `Health` produced by `makeHealth`, so the invariant is re-established on every change.
4. Add a `newCharacter(maxHp: number): Health` helper that starts a character at full health.
5. Write tests: <span class="hint">`checkExpect` that damage and heal land on the right hit points, including that they stop at 0 and at `maxHp`; and `checkError` that `makeHealth` rejects an invalid starting value such as `makeHealth(10, -1)`.</span>

</details>
