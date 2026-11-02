# Maintaining Invariants

The previous chapter described invariants in documentation and tests. Tests can detect problems: they probe chosen inputs and report when a function's outcome is not the one its contract promised. But tests cannot prevent invalid values from being created. Prevention is a matter of design: organising the code so that no invalid value can be built.

We will do this using only programming constructs you know from CPSC 110. The result is not how TypeScript is usually written, and you may find it unwieldy. That is part of the point: it motivates the object-oriented programming in [Part 2](../part2/index).

#### A Bank Account with No Enforcement

We start from a simple `BankAccount` design, with a data type that has an invariant and some functions:

```typescript
/**
 * A bank account with a balance in dollars.
 *
 * Invariant: balance >= 0
 */
type BankAccount = {
  /** The balance in dollars; never negative. */
  balance: number;
};

/**
 * Deposits an amount into the account.
 *
 * Precondition: amount > 0
 * Postcondition: the returned account satisfies balance >= 0
 *
 * @param {BankAccount} account the account to deposit into.
 * @param {number} amount the amount to deposit (in dollars).
 * @returns {BankAccount} a new BankAccount with an increased balance.
 */
function deposit(account: BankAccount, amount: number): BankAccount {
  return { balance: account.balance + amount };
}
```

The `withdraw` function looks similar. Once the contracts are documented, tests can be derived from them.

## Valid Types, Invalid Values

The type checker will not complain about invalid values:

```typescript
const account: BankAccount = { balance: -100 }; // passes the type checker
```

This is the same issue we encountered with the `Song` whose duration was `-30` in [Chapter 3](./03_checking-invariants#what-is-an-invariant): the object has the right shape, so the static check passes, but its meaning is incorrect.

Nothing about the `BankAccount` type connects it to `deposit` and `withdraw`. We can build any object literal with a `balance` property and call it a `BankAccount`, whether the invariant remains true or not.

For an invariant to hold for the life of a program, two things must be true:

1. When the value is created, the invariant must be _established_; and
2. Every operation that produces a new value from an old one must _preserve_ the invariant.

If both are true, then every value that ever exists is valid: the first one was checked, and every subsequent value came from an operation that maintained the invariant. In the initial design, anyone could create an account by writing an object literal, so nothing ensures the invariant is established.

## Constructor Functions

To ensure the invariant is established, we write a function whose only job is to create valid accounts:

```typescript
/**
 * Creates a new bank account holding balance dollars.
 *
 * @param {number} balance the starting balance.
 * @returns {Result<BankAccount, string>} ok: true with a new account
 * satisfying the invariant, or ok: false with "Account balance must not
 * be negative" when balance < 0.
 */
function makeAccount(balance: number): Result<BankAccount, string> {
  if (balance < 0) {
    return { ok: false, error: "Account balance must not be negative" };
  }
  return { ok: true, value: { balance: balance } };
}
```

A function like this is called a **constructor function**: it constructs values of a type, and it ensures the invariant is established. Here a negative starting balance is an erroneous outcome. The request is refused, and no account is built. Every account the constructor does return is valid:

```typescript
test("accounts cannot be created with a negative balance",
    checkExpect(() => makeAccount(-100), {
        ok: false,
        error: "Account balance must not be negative"
    })
);
```

Accounts created with `makeAccount` satisfy the invariant. Unfortunately, the protection is only a convention. Nothing forces a **client** (any code that uses the account type) to call `makeAccount`: the literal `{ balance: -100 }` still type checks. The same is true of `deposit` and `withdraw`, since a client can skip them and write `{ balance: account.balance - 200 }`. The constructor function and the operations exist alongside data that remains open to everyone.

The invariant is safe only if every engineer chooses to go through the right functions. This is the kind of _programmer discipline_ we have been trying to avoid relying on.

## Binding Operations to Data

The main problem is that the data is reachable by anyone, so the operations can be bypassed. To solve it, the data must be reachable only through operations that maintain the invariant. To do this, we need a feature we have not yet used in TypeScript: an object property that holds a function. We can define a `BankAccount` type whose properties are operations rather than data:

```typescript
/**
 * A bank account that accepts deposits and withdrawals.
 *
 * Invariant: balance >= 0
 */
type BankAccount = {
  /**
   * Deposits an amount.
   *
   * @param {number} amount the amount to deposit, in dollars.
   * @returns {Result<BankAccount, string>} ok: true with an account holding
   * the larger balance, or ok: false when amount <= 0.
   */
  deposit(amount: number): Result<BankAccount, string>;
  /**
   * Withdraws an amount.
   *
   * @param {number} amount the amount to withdraw, in dollars.
   * @returns {Result<BankAccount, string>} ok: true with an account holding
   * the smaller balance, or ok: false when amount <= 0 or amount exceeds the
   * balance.
   */
  withdraw(amount: number): Result<BankAccount, string>;
  /**
   * Returns the current balance.
   *
   * @returns {number} the balance in dollars; never negative.
   */
  getBalance(): number;
};
```

There is no `balance` property. The `BankAccount` type now describes what an account can do rather than what it stores. A holder of a `BankAccount` can deposit, withdraw, and observe the balance (`getBalance`), and that is all. Each of these operations can be invoked with dot notation:

```typescript
// given an initialAccount of type BankAccount ...
const deposited: Result<BankAccount, string> = initialAccount.deposit(5);
```

We have seen dot before. In [Chapter 2](./02_model-types#reading-an-object-s-properties) it read a property: `song1.title` selected the value stored under `title`. `initialAccount.deposit` selects the value stored under `deposit` in the same way. The only difference is that the value there is a function rather than a string or a number. The `(5)` that follows is an argument, just as in `letterGrade(85)`.

The difference is which function you get. A free-standing `deposit(account, 5)` is one function shared by every caller, which is why it has to be told which account to act on. `initialAccount.deposit` is the function belonging to this specific account, so it operates on that account's balance. A caller cannot point it at a different account.

<details class="tooltip ts-tips">
<summary>Functions as Properties</summary>

A property can also hold a function. In particular:
```typescript
type T = {
  foo(x: X, y: Y): Z;
};
```
declares a function property `foo` on the type `T`. `foo` takes two parameters, `x` and `y`, of types `X` and `Y`, and returns a value of type `Z`.

In an object literal, the property is written like a function declaration without the `function` keyword:
```typescript
{
  foo(x: X, y: Y): Z {
    // statements that compute and return a Z
  }
};
```

</details>

<details class="tooltip link-110">
<summary>Operations in Structures in ISL</summary>

CPSC 110 allowed a similar approach. A structure's fields could hold functions, so a data definition could bundle a value's operations with the value itself.

```racket
(define-struct counter-interface (increment get-count))
;; Counter is (make-counter-interface (-> Counter) (-> Number))
;; interp. a counter that carries its own operations
```
</details>

Removing the `balance` property solves the preservation problem: nobody outside can reach `balance`. But it introduces a new problem. The operations themselves can no longer access a `balance` property either, which they need to do their job. We need a `balance` that only the operations can reach.

## Hiding State with a Closure

The initial balance arrives as the constructor function's parameter, and we can keep it there using a concept you've seen in CPSC 110. A function created inside another function keeps access to the enclosing function's parameters and definitions, even after the enclosing function has returned. A function that carries context like this is called a **closure**.

### A Clicker Counter

To (re-)introduce closures, we'll consider a problem simpler than the bank account:

> As a door attendant at a venue, I want a clicker counter that refuses to count past the venue's capacity, so that we never admit more people than fire regulations allow.

<details class="tooltip link-110">
<summary>You Built Closures Before</summary>

In CPSC 110, you saw closures, in particular using `local`. Functions defined in a `local` could use the parameters of the enclosing function, and a value's state could be kept unreachable by only providing access to the inner functions:

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

The inner functions close over `n`.

Note the `local` is not strictly necessary. We could put lambdas directly in `make-counter-interface` and they would also close over `n`:
```racket
;; Venue capacity
(define MAX-CAPACITY 1000)

;; make-counter : Number -> Counter
;; Protects the invariant: count cannot exceed MAX-CAPACITY
(define (make-counter n)
  (cond [(> n MAX-CAPACITY) (error "Invariant violation: Venue is full!")]
        [else
           (make-counter-interface (lambda () (make-counter (+ n 1))) (lambda () n))]))
```
You might find this version without `local` a little less readable, though.

One difference from the ISL you used: `increment` and `get-count` take no arguments, and ISL requires every function to have at least one parameter. These examples need Advanced Student Language, which allows functions with no parameters.
</details>

We already know all the syntax we need to create closures in TypeScript: function declarations, object literals, and functions as object properties. Putting these together gives a constructor function that returns a `Counter` whose functions close over the current count, protecting the fire-safety invariant:

<CollapsibleCode>

```typescript
const MAX_CAPACITY: number = 1000;

/**
 * A clicker counter that counts people entering a venue.
 *
 * Invariant: the count must not exceed MAX_CAPACITY.
 */
type Counter = {
  /**
   * Counts one more person.
   *
   * @returns {Result<Counter, string>} ok: true with a counter one higher, or
   * ok: false with "the venue is full" when the count is at capacity.
   */
  increment(): Result<Counter, string>;
  /**
   * Returns the current count.
   *
   * @returns {number} the number of people counted.
   */
  getCount(): number;
};

/**
 * Creates a counter holding the given count.
 *
 * @param {number} count the current count.
 * @returns {Result<Counter, string>} ok: true with a new Counter satisfying
 * the invariant, or ok: false with "the venue is full" when count exceeds
 * MAX_CAPACITY.
 */
export function makeCounter(count: number): Result<Counter, string> {
  // Establish the invariant: no counter exists without passing this check.
  if (count > MAX_CAPACITY) {
    return { ok: false, error: "the venue is full" };
  }

  // The functions below form a closure over count.
  return {
    ok: true,
    value: {
      increment(): Result<Counter, string> {
        return makeCounter(count + 1);
      },

      getCount(): number {
        return count;
      }
    }
  };
}
```

</CollapsibleCode>

<details class="tooltip ts-tips">
<summary>The <code>export</code> Keyword</summary>

The `export` in front of `makeCounter` makes it available to code in other files, and definitions without it, like `MAX_CAPACITY`, stay private to the file that contains them. Choosing what a file exports is another way to control what it exposes to clients.

</details>

This code both establishes and preserves the invariant. The constructor function `makeCounter` establishes the invariant with its top-level check: a count over capacity is reported as an erroneous outcome, and no `Counter` is built. Because `increment` produces its successor by calling `makeCounter` again, every state the counter ever occupies passes through that same check, so `increment` does not need a check of its own. Both `increment` and `getCount` can see `count` through the closure, but there is no `count` property for anyone else to alter. The operations returned by the constructor are the only way to interact with the state.

<details class="tooltip deep-dive">
<summary>Every Operation Returns a New Value</summary>

`increment` does not change the counter it was called on. It returns a new counter whose count is higher. This might seem indirect, but it is the only way we have to protect the counter from being altered. This is also how programs in CPSC 110 worked.

</details>

These tests for `increment` unwrap each counter with the toolkit's `assertOk`:

```typescript
const empty: Counter = assertOk(makeCounter(0));
const one: Counter = assertOk(empty.increment());
const two: Counter = assertOk(one.increment());

test("each click is counted", checkExpect(() => two.getCount(), 2));

test("the original counter is unchanged",
    checkExpect(() => empty.getCount(), 0)
);

const full: Counter = assertOk(makeCounter(1000)); // the venue is exactly at capacity

test("the counter refuses to count past capacity",
    checkExpect(() => full.increment(), { ok: false, error: "the venue is full" })
);
```

<details class="tooltip ts-tips">
<summary><code>assertOk</code></summary>

The setup above needs the `Counter` inside each `Result`. The toolkit's `assertOk` takes a `Result` and returns its `value` when `ok` is `true`. If the `Result` is `ok: false`, `assertOk` throws an error that includes the error the `Result` carried. Here it is called outside any test, so a failure stops the whole file before any of its tests run. It states that a setup step must succeed, since the tests that use its result are only meaningful if it does.

</details>

The last test treats an increment at full capacity as an erroneous outcome. The counter reports that it cannot count higher, and the caller decides what to do about it.

<details class="tooltip exercise">
  <summary>Exercise: Reflect on Closures</summary>

Compare the closure above to an implementation of `Counter` without closures:

<CollapsibleCode>

```typescript
const MAX_CAPACITY: number = 1000;

/**
 * A clicker counter that counts people entering a venue.
 *
 * Invariant: the count must not exceed MAX_CAPACITY.
 */
type Counter = {
  /** The number of people counted; never more than MAX_CAPACITY. */
  n: number;
};

/**
 * Creates a counter holding the given count.
 *
 * @param {number} count the current count.
 * @returns {Result<Counter, string>} ok: true with a new Counter satisfying
 * the invariant, or ok: false with "the venue is full" when count exceeds
 * MAX_CAPACITY.
 */
function makeCounter(count: number): Result<Counter, string> {
  // Establish the invariant: no counter exists without passing this check.
  if (count > MAX_CAPACITY) {
    return { ok: false, error: "the venue is full" };
  }
  return { ok: true, value: { n: count } };
}

/**
 * Counts one more person.
 *
 * @param {Counter} counter the counter to increment.
 * @returns {Result<Counter, string>} ok: true with a new Counter one higher,
 * or ok: false with "the venue is full" when the counter is at capacity.
 */
function increment(counter: Counter): Result<Counter, string> {
  return makeCounter(counter.n + 1);
}
```
</CollapsibleCode>

Do you find one of these pieces of code easier to read? Why? Does keeping `n` as a property of `Counter` affect readability? What about having `increment` be defined inline, as in the closure version, versus as a top-level function?

If you could tell TypeScript that `n` can only be changed by certain functions, could you ensure the fire-safety invariant without closures? Explain.
<!-- rth: this is all about pre-casting to objects and visibility: if n were private, we'd be set -->

<!-- Potential unverified solution:

The version without closures is easier to read: `Counter` is plain data, `makeCounter` and `increment` are ordinary top-level functions, and nothing is nested. Keeping `n` as a property is what makes it readable, and also what makes it unsafe: any code holding a `Counter` can write `counter.n = 5000`, and the fire-safety invariant is kept only by discipline. In the closure version the operations are defined inline, inside the object literal returned by `makeCounter`, so each counter carries its own `increment` and `getCount`, and the reader has to follow `count` through two levels of nesting; the gain is that no `count` property exists for anyone to alter. If TypeScript could restrict which functions may change `n`, a plain property would do: the invariant would hold as long as only `makeCounter` and `increment` could write it. That is the access control Part 2 introduces, where a `private` field gives this guarantee without closures.
-->

</details>

### Protecting `BankAccount`

Closures let us keep the advantage of removing the `balance` property (outsiders can't reach it) without its disadvantage (the operations can't reach it either). We create the three operations inside `makeAccount`, where `balance` is visible, so each closes over it:

<CollapsibleCode>

```typescript
/**
 * Creates a new bank account holding balance dollars.
 *
 * @param {number} balance the starting balance.
 * @returns {Result<BankAccount, string>} ok: true with a new account
 * satisfying the invariant, or ok: false with "Account balance must not
 * be negative" when balance < 0.
 */
export function makeAccount(balance: number): Result<BankAccount, string> {
  if (balance < 0) {
    return { ok: false, error: "Account balance must not be negative" };
  }

  // The functions below form a closure over balance: each keeps
  // access to the balance of the makeAccount call that created it.
  return {
    ok: true,
    value: {
      deposit(amount: number): Result<BankAccount, string> {
        if (amount <= 0) {
          return { ok: false, error: "Amount must be greater than 0" };
        }
        return makeAccount(balance + amount);
      },

      withdraw(amount: number): Result<BankAccount, string> {
        if (amount <= 0) {
          return { ok: false, error: "Amount must be greater than 0" };
        }
        if (amount > balance) {
          return { ok: false, error: "Amount must not be greater than the current account balance" };
        }
        return makeAccount(balance - amount);
      },

      getBalance(): number {
        return balance;
      }
    }
  };
}
```

</CollapsibleCode>

In our earlier designs, `deposit` and `withdraw` took the account as a parameter. These versions take no account parameter, because the operations know their balance: it is the `balance` of the `makeAccount` call that created them. Every call to `makeAccount` produces a fresh `balance` and three fresh functions closed over it, so two accounts never share state.

On the successful path, `deposit` and `withdraw` do not build the new account themselves. They call `makeAccount` again with the new balance. Every account that ever exists in the program, including every intermediate state produced by an operation, has passed through `makeAccount`. So the invariant is checked at creation and checked again on every change. A bad amount, which is an erroneous outcome, would be refused before any new account is requested.

The structural change ensures that the invariant is enforced by the programming language rather than by programmer discipline. There is no longer a `balance` property anywhere in the program for a client to read or forge. The only access to the balance is `getBalance`, and the only way to produce a new state is through `deposit` and `withdraw`. The type checker now rejects `const ba: BankAccount = { balance: -100 }`.

A client could still write its own object literal with these three functions and give it the type `BankAccount`. That object was not made by `makeAccount`, though, and it cannot reach the balance of any real account.

Here is an example that uses our new `BankAccount` type:

```typescript
const account: BankAccount = assertOk(makeAccount(0));
const funded: BankAccount = assertOk(account.deposit(5));

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

The operations and the balance coexist inside the closure. Because only the operations are returned, nothing outside can reach the balance:

```ditaa
    
              makeAccount (creates closure)
            | 
            | 
            v  
    +--------------------------------------------+
    |    +------------------+                    |
    |    | balance: number  |                    |
    |    +------------------+                    |
    |                                            |
    |  deposit(..)  withdraw(..)  getBalance()   |
    +--------------------------------------------+
           ^             ^            ^
           |             |            |
       only operations visible to callers
       (balance cannot be accessed directly)
```
<!-- caption="Illustration of state hidden inside a closure, with balance not being directly reachable." -->

<details class="tooltip deep-dive">
<summary>Course Preview: Does Software in Practice Enforce Security Invariants?</summary>

This chapter has been about enforcing invariants in code. The examples are small, but they have a real-world safety implication. Code runs on so many platforms and has access to so much of our data. How do we ensure that only the code we expect runs on our machines, and that it doesn't leak our information to people who shouldn't have it?

Unfortunately, a lot of real-world code doesn't manage to enforce such invariants, leading to many security and privacy issues. If the technical side interests you, look at the computer security courses (CPSC 337, CPSC 541) or cyber-security competitions ([Maple Bacon Team](https://maplebacon.org/)). If the societal side does, look at CPSC 430.

</details>

#### Protecting Invariants Drives Design

In this chapter, the invariant drove the design at every step:

1. To ensure the invariant is established, we routed the creation of every `BankAccount` through a single constructor function.
2. To ensure the invariant is preserved, we bound operations to the data, so that the functions, instead of the callers, maintained the invariant.
3. To ensure that no one else could violate the invariant, we hid the state within a closure.

The organisation of the code itself enforces the invariant. This is the first time we have seen an invariant shape the design of a program rather than just its documentation and tests. Protecting invariants frequently drives how code is organised, because code organised this way is safer and easier to change.

Building objects out of closures works, but the support the language gives us for this task is minimal and the code can be hard to wrap your head around. In [Part 2](../part2/index), we will see that object-oriented programming provides direct language syntax for this pattern using constructors, methods, and fields that the language itself controls access to. The syntax will be new, but the idea is the one this chapter built by hand.

<details class="tooltip exercise">
  <summary>Exercise: Character Health</summary>

Practise this chapter's process on a new problem.

> As a game developer, I want a character's health to stay between 0 and its maximum, so that nothing in the game can drive it out of range.

A character's health has a current hit-point count and a maximum, and must always satisfy the invariant `0 <= hp <= maxHp`. A holder of a `Health` value should be able to apply damage, apply healing, read the current hit points, and ask whether the character is still alive, but should never be able to reach the underlying numbers directly.

1. Define a `Health` type whose properties are operations, not data: <span class="hint">`damage(amount: number): Result<Health, string>`</span>, <span class="hint">`heal(amount: number): Result<Health, string>`</span>, <span class="hint">`getHp(): number`</span>, and <span class="hint">`isAlive(): boolean`</span>. There should be no `hp` or `maxHp` property on the type.
2. Write a constructor function `makeHealth(maxHp: number, hp: number): Result<Health, string>` that establishes the invariant by refusing an invalid request as an erroneous outcome <span class="hint">(reject a `maxHp` below 1, or an `hp` outside `0` to `maxHp`)</span> and hides `hp` and `maxHp` in a closure. Model it on `makeCounter`.
3. Implement `damage` and `heal` so they preserve the invariant: <span class="hint">damage never drops hit points below 0, and heal never raises them above `maxHp`</span>. Each should return the result of calling `makeHealth` with the new hit points, so the invariant is re-established on every change, as `increment` did for the counter. <span class="hint">Refuse a negative `amount` as an erroneous outcome, as `deposit` and `withdraw` do.</span>
4. Add a `newCharacter(maxHp: number): Result<Health, string>` helper that starts a character at full health.
5. Write tests. <span class="hint">Unwrap the setup values with `assertOk`, as the counter tests did. Use `checkExpect` to confirm that damage and heal land on the right hit points, including that they stop at 0 and at `maxHp`, and that `makeHealth` returns `ok: false` for an invalid starting value such as `makeHealth(10, -1)`.</span>

<!-- Potential unverified solution:

```typescript
import { test, checkExpect, assertOk } from "@ubccpsc/210-toolkit/testing";

// Exercise: Character Health
/**
 * A character's health.
 *
 * Invariant: 0 <= hp <= maxHp, and maxHp >= 1.
 */
type Health = {
  /**
   * Applies damage, stopping at 0 hit points.
   *
   * @param {number} amount the hit points to remove; must not be negative.
   * @returns {Result<Health, string>} ok: true with the damaged health, or
   * ok: false with "Amount must not be negative".
   */
  damage(amount: number): Result<Health, string>;
  /**
   * Applies healing, stopping at the maximum.
   *
   * @param {number} amount the hit points to restore; must not be negative.
   * @returns {Result<Health, string>} ok: true with the healed health, or
   * ok: false with "Amount must not be negative".
   */
  heal(amount: number): Result<Health, string>;
  /**
   * Returns the current hit points.
   *
   * @returns {number} the current hit points, from 0 to the maximum.
   */
  getHp(): number;
  /**
   * Reports whether the character is still alive.
   *
   * @returns {boolean} true when the current hit points are above 0.
   */
  isAlive(): boolean;
};

/**
 * Creates a health value with the given maximum and current hit points.
 *
 * @param {number} maxHp the maximum hit points.
 * @param {number} hp the current hit points.
 * @returns {Result<Health, string>} ok: true with a new Health satisfying
 * the invariant, or ok: false with an error when maxHp is below 1 or hp
 * is outside 0 to maxHp.
 */
function makeHealth(maxHp: number, hp: number): Result<Health, string> {
  // Establish the invariant: no Health exists without passing these checks.
  if (maxHp < 1) {
    return { ok: false, error: "maxHp must be at least 1" };
  }
  if (hp < 0) {
    return { ok: false, error: "hp must not be negative" };
  }
  if (hp > maxHp) {
    return { ok: false, error: "hp must not exceed maxHp" };
  }

  // The functions below form a closure over maxHp and hp.
  return {
    ok: true,
    value: {
      damage(amount: number): Result<Health, string> {
        if (amount < 0) {
          return { ok: false, error: "Amount must not be negative" };
        }
        if (hp - amount < 0) {
          return makeHealth(maxHp, 0);
        }
        return makeHealth(maxHp, hp - amount);
      },

      heal(amount: number): Result<Health, string> {
        if (amount < 0) {
          return { ok: false, error: "Amount must not be negative" };
        }
        if (hp + amount > maxHp) {
          return makeHealth(maxHp, maxHp);
        }
        return makeHealth(maxHp, hp + amount);
      },

      getHp(): number {
        return hp;
      },

      isAlive(): boolean {
        return hp > 0;
      }
    }
  };
}

/**
 * Creates a character at full health.
 *
 * @param {number} maxHp the maximum hit points.
 * @returns {Result<Health, string>} ok: true with a Health at maxHp, or
 * ok: false with an error when maxHp is below 1.
 */
function newCharacter(maxHp: number): Result<Health, string> {
  return makeHealth(maxHp, maxHp);
}

const hero: Health = assertOk(newCharacter(10));
const hurt: Health = assertOk(hero.damage(3));
const down: Health = assertOk(hurt.damage(50));

test("a new character starts at full health", checkExpect(() => hero.getHp(), 10));
test("damage lowers the hit points", checkExpect(() => hurt.getHp(), 7));
test("the original health is unchanged", checkExpect(() => hero.getHp(), 10));
test("damage stops at 0", checkExpect(() => down.getHp(), 0));
test("a character at 0 is not alive", checkExpect(() => down.isAlive(), false));
test("a hurt character is still alive", checkExpect(() => hurt.isAlive(), true));
test("healing raises the hit points", checkExpect(() => assertOk(hurt.heal(2)).getHp(), 9));
test("healing stops at the maximum", checkExpect(() => assertOk(hurt.heal(100)).getHp(), 10));
test("negative damage is refused",
    checkExpect(() => hero.damage(-1), { ok: false, error: "Amount must not be negative" })
);
test("an invalid starting value is refused",
    checkExpect(() => makeHealth(10, -1), { ok: false, error: "hp must not be negative" })
);
test("a maximum below 1 is refused",
    checkExpect(() => newCharacter(0), { ok: false, error: "maxHp must be at least 1" })
);
```

`damage` and `heal` clamp at `0` and `maxHp` and then call `makeHealth`, so every state passes through the same checks. A negative `amount` is an erroneous outcome, as it is for `deposit` and `withdraw`.
-->

</details>
