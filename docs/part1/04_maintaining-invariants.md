# Maintaining Invariants

The previous chapter placed invariants in documentation, tests, and assertions. These mechanisms *detect* problems: tests probe chosen inputs, and assertions terminate the program when an impossible state is observed. A shortcoming of these mechanisms though is that they cannot *prevent* invalid values from being created in the first place. This chapter is about closing that gap: designing code so that the invariant is maintained by the structure of the program itself, rather than checked after the fact.

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

A matching `withdraw` follows the same shape. The contracts are documented, tests can be derived from them, and assertions can guard the implementations. By the standards of the previous chapter, this design is complete.

## Valid Types, Invalid Values

The design has a weakness that the type checker cannot see:

```typescript
const account: BankAccount = { balance: -100 }; // passes the type checker
```

This is the same shortcoming we encountered with the `Song` whose duration was `-30`: the object has the right *shape*, so the static check passes, but its *meaning* is wrong. Nothing about the `BankAccount` type connects it to `deposit` and `withdraw`. A client can build any object literal with a `balance` property and the language will call it a `BankAccount`, whether or not the invariant holds. The careful contracts on `deposit` and `withdraw` protect only the clients who choose to call them.

An invariant holds for the life of a program when two things are true. It must be *established* when the value is created, and it must be *preserved* by every operation that produces a new value from an old one. If both are true, then every value that ever exists is valid: the first one was checked, and every later one came from an operation that kept the promise. The initial design preserves the invariant in its operations but has no control over establishing the invariant, because creation is open to everyone.

## Controlling Creation with a Constructor Function

The first repair is to provide one function whose job is to create valid accounts:

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
test("accounts cannot be created with a negative balance", () => {
    checkError(() => makeAccount(-100), "Account balance must not be negative");
});
```

This is progress, but the protection remains a convention. Nothing *forces* a client to call `makeAccount`: the literal `{ balance: -100 }` still type checks, exactly as before. The same is true of `deposit` and `withdraw`; a client can skip them and write `{ balance: account.balance - 200 }` by hand. The constructor function and the operations exist alongside data that remains open to everyone. Making the invariant safe depends on every engineer choosing to go through the right functions, which is the discipline we are trying to move beyond.

## Binding the Operations to the Data

The root of the problem is that the data and its operations are unconnected: the `balance` field is reachable by anyone, and `deposit` and `withdraw` are free-standing functions that anyone may bypass. The repair is to invert that relationship, so that the operations *belong to* the account and the data is reachable *only* through them.

The language feature that makes this possible is one we have not needed until now: an object property can hold a function. We can define a `BankAccount` type whose properties are not data at all, but operations:

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

Intentionally, there is no `balance` field. The type no longer describes what an account *stores*; it describes what an account *can do*. A holder of a `BankAccount` can deposit, withdraw, and observe the balance, and that is all. `getBalance` exists precisely because there is no field left to read; observation itself is now an operation. Calls use dot notation, with the `.` selecting the function that this particular account carries:

```typescript
const initialAccount = makeAccount(0);
const funded = initialAccount.deposit(5);
```

<details class="tooltip ts-tips">
<summary>Operations as Properties</summary>

So far, every object property we have used has held a data value: `song.title` held a string, and `account.balance` held a number. A property can also hold a *function*. In a type, a function property is written as a signature, so `deposit(amount: number): BankAccount` declares a property named `deposit` whose value is a function that takes a `number` and returns a `BankAccount`. In an object literal, the property is written like a function declaration without the `function` keyword. The parentheses are what call it: `account.getBalance` is the function itself, while `account.getBalance()` invokes it. What it means for behaviour to belong to data like this is a question we return to when we discuss object-oriented programming.

</details>

<details class="tooltip link-110">
<summary>Operations in Structures in BSL</summary>

CPSC 110 allowed the same move: a structure's fields could hold functions, so a data definition could bundle a value's operations with the value itself.

```racket
(define-struct counter-interface (increment get-count))
;; Counter is (make-counter-interface (-> Counter) (-> Number))
;; interp. a counter that carries its own operations
```

The TypeScript type above is the same idea: a record whose fields are the operations clients are meant to use.

</details>

The new type raises an immediate problem. The operations are now properties of the account, but the balance they operate on has no field to be saved to. The balance must exist somewhere, and where it lives is the central design decision.

## Hiding State with a Closure

The balance lives in the constructor function's parameter. A function created inside another function keeps access to the enclosing function's parameters and definitions, even after the enclosing function has returned. A function that carries captured context like this is called a **closure**. The three operations are created inside `makeAccount`, while `balance` is in scope, and each of them closes over it:

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

In our earlier designs, `deposit` and `withdraw` took the account as a parameter. These versions take none, because each function already knows its own balance: it is the `balance` of the `makeAccount` call that created it. Every call to `makeAccount` produces a fresh `balance` and three fresh functions closed over it, so two accounts never share state.

Notice where new account states come from. `deposit` and `withdraw` do not build result objects by hand; they call `makeAccount` again with the new balance. Every account that ever exists in the program, including every intermediate state produced by an operation, has passed through the gatekeeper and its assertion. The invariant is established at creation and re-established at every transition.

The structural change is what makes this more than a convention. There is no longer a `balance` property anywhere in the program for a client to read, to forge, or to copy incorrectly. The only access to the number is `getBalance`, and the only way to produce a new state is through `deposit` and `withdraw`. The literal `{ balance: -100 }` does not represent a `BankAccount` anymore. The invariant is no longer protected by the discipline of every client; it is protected because the state cannot be reached any other way.

The operations and the balance live together inside the closure, and only the operations are handed back, so nothing outside can reach the balance:

```ditaa
    
              makeAccount (creates closure)
            | 
            | 
            v  
    +--------------------------------------------+
    |    +------------------+                    |
    |    | balance꞉ number  |                    |
    |    +------------------+                    |
    |                                            |
    |  deposit(..)  withdraw(..)  getBalance()   |
    +--------------------------------------------+
           ^             ^            ^
           |             |            |
       only operations visible to callers
       (balance cannot be accessed directly)
```
<!-- caption="State hidden inside a closure, balance not directly reachable." -->

```typescript
test("deposits and withdrawals preserve the balance invariant", () => {
    const account = makeAccount(0);
    const funded = account.deposit(5);
    checkExpect(funded.getBalance(), 5);

    const overdrawn = funded.withdraw(8);
    checkExpect(overdrawn, { ok: false, error: "Amount must not be greater than the current account balance" });
});
```

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

The inner functions close over `n` exactly the way `deposit` and `withdraw` close over `balance`. The TypeScript version of this counter appears below.

</details>

<details class="tooltip deep-dive">
<summary>Every Operation Returns a New Value</summary>

`deposit` does not change the account it was called on; it returns a new account whose balance is higher. This may seem roundabout, but it is the only option available to us: we have no way to change an existing value. This is also the way every program in CPSC 110 worked. 

</details>

## The Pattern Applied: A Venue Counter

The pattern is not specific to bank accounts. Here is a second example, compact enough to read in one piece:

> As a door attendant at a venue, I want a clicker counter that refuses to count past the venue's capacity, so that we never admit more people than fire regulations allow.

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

Both halves of the pattern are here. `makeCounter` is the constructor function: the assertion at its top is the single place the invariant is established, and because `increment` produces its successor by calling `makeCounter` again, every state the counter ever occupies passes through that check. The closure over `count` is the second half: no `count` property exists for a client to read or rewrite, so the operations returned by the constructor are the only way to interact with the state.

Tests show the counter in action, with each `increment` producing a new counter:

```typescript
test("each click is counted", () => {
    const empty = makeCounter(0);
    const one = empty.increment();
    const two = one.increment();
    checkExpect(two.getCount(), 2);
    checkExpect(empty.getCount(), 0); // the original counter is unchanged
});

test("the counter refuses to count past capacity", () => {
    const full = makeCounter(1000); // the venue is exactly at capacity
    checkError(() => full.increment(), "Invariant violation: Venue is full!");
});
```

The second test demonstrates a design decision, connecting back to the previous chapter: this counter treats a click at full capacity as an *unexpected* error and halts. If turning people away at the door were a normal outcome the program should handle, `increment` would instead return a `Result`, the way `withdraw` reports an overdraft. Which treatment is right is a contract decision, not a coding one.

<details class="tooltip ts-tips">
<summary>The <code>export</code> Keyword</summary>

The `export` in front of `makeCounter` marks it as available to code in other files; definitions without it, like `MAX_CAPACITY`, stay private to the file that contains them. Choosing what a file exports is another way to control what clients can reach, and we return to it properly when the course discusses modules.

</details>

## Protecting Invariants Drives Design

Looking at our designs in this chapter, we see that the invariants of our programs strongly influenced the choices we made: creation could only be accomplished using one constructor function so the invariant could be established in a single place; the operations were bound to the data so that preserving the invariant is their job rather than every caller's; and the state was hidden in a closure so that no code outside the constructor could modify it. The organisation of the code is itself the enforcement mechanism. This is the first time we have seen an invariant shape the design of a program rather than just its documentation and tests, and it will not be the last: protecting invariants frequently drives how code is organised, as this makes the code safer, easier to understand, and easier to evolve.

Building objects out of closures works, but the support the language gives us for this task is minimal. Object-oriented programming provides this pattern as direct language syntax: constructors, methods, and fields that the language itself controls access to. The syntax will be new, but the idea will directly flow from this chapter.

<details class="tooltip exercise">
  <summary>Exercise: Character Health</summary>

Practise this chapter's process on a new problem.

> As a game developer, I want a character's health to stay between 0 and its maximum, so that nothing in the game can drive it out of range.

A character's health has a current hit-point count and a maximum, and must always satisfy the invariant `0 <= hp <= maxHp`. A holder of a `Health` value should be able to apply damage, apply healing, read the current hit points, and ask whether the character is still alive, but should never be able to reach the underlying numbers directly.

1. Define a `Health` type whose properties are _operations_, not data: `damage(amount: number): Health`, `heal(amount: number): Health`, `getHp(): number`, and `isAlive(): boolean`. There should be no `hp` or `maxHp` field on the type.
2. Write a constructor function `makeHealth(maxHp: number, hp: number): Health` that _establishes_ the invariant with an `assert` (reject a `maxHp` below 1, or an `hp` outside `0` to `maxHp`) and hides `hp` and `maxHp` in a closure. Model it on `makeCounter`.
3. Implement `damage` and `heal` so they _preserve_ the invariant: damage never drops hit points below 0, and heal never raises them above `maxHp`. Each should return a new `Health` produced by `makeHealth`, so the invariant is re-established on every change.
4. Add a `newCharacter(maxHp: number): Health` helper that starts a character at full health.
5. Write tests: `checkExpect` that damage and heal land on the right hit points, including that they stop at 0 and at `maxHp`; and `checkError` that `makeHealth` rejects an invalid starting value such as `makeHealth(10, -1)`.

</details>
