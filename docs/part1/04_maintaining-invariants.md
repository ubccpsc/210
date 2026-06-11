# Maintaining Invariants

CONTENT TBD

<details class="tooltip ts-tips">
<summary>Operations as Properties</summary>

So far, every object property we have used has held a data value. A property can also hold a *function*, and the array operations work exactly this way: `map` is a property that every array carries, holding a function, which is why it is called with dot notation. The parentheses are what invoke it. Compare `day.length`, a data property holding a number and read without parentheses, with `day.map(...)`, a function property being called. What it means for behaviour to belong to data like this is a question we return to when the course reaches object-oriented programming.

</details>

### CONTENT NOTES

* build on `BankAccount` from the preceeding lecture's activity
* show that you can `const account: BankAccount = {balance: -100};` which violates the `balance >=0` invariant
* try using a `makeAccount(initialBalance: number): BankAccount { assert(initialBalance >= 0) }` function to control creation ; note that nothing is *forcing* it be used (likewise for deposit/withdraw)
  * need to "bind" operations to the data
* work up to solving this problem by adding functions to `BankAccount`, alhtough without a `balance` field (using a closure instead).

### Nick's Notes

Topics:

* Main point: designing our code to protect invariants.
* Achevied using two steps:
  1. Constructor function: only way for a client to create an account. Gatekeeper to ensure the invariant holds initially.
  2. Encapsulation of state: the closure over the count `n` means it can only be modified by the functions defined in the constructor function.
* Language features:
  * Functions can be properties on objects.
    * BSL example:

    ```racket
    (define-struct counter-interface (increment get-count))
    ;; Counter is (make-counter-interface (-> counter) (-> Number))
    ;; interp. A clicker counter that can count up to a strict capacity limit
    ```

  * Closures (here we are using them to make the state inaccessible to the outside world)
    * BSL example

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

  * Could hint that OOP is coming and it will make it easier to express these ideas (but it's the idea that is important)

Omit for now (but need to talk about `export` at some point):

* Modules: talking about `export` formally (and how that form boundaries limiting what clients can do).
  * testability trade-offs of not exporting functions (this also came up in 110 when using local since check-expect must be at top-level)

Final code example: A parallel code example to BankAccount is a click counter (e.g., used by someone counting the number of people entering a venue).
The invariant is that the count cannot exceed the venue capacity.

```ts
const MAX_CAPACITY: number = 1000;

/**
 * A clicker counter increments the count.
 * 
 * Invariant: the count must not exceed MAX_CAPACITY.
 */
type Counter = {
    increment(): Counter;
    getCount(): number;
}

// Constructor function for creating a counter.
export function makeCounter(count: number): Counter {
  // Check invariant
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
