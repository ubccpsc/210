# Maintaining Invariants

CONTENT TBD


<details class="tooltip ts-tips">
<summary>Operations as Properties</summary>

So far, every object property we have used has held a data value. A property can also hold a *function*, and the array operations work exactly this way: `map` is a property that every array carries, holding a function, which is why it is called with dot notation. The parentheses are what invoke it. Compare `day.length`, a data property holding a number and read without parentheses, with `day.map(...)`, a function property being called. What it means for behaviour to belong to data like this is a question we return to when the course reaches object-oriented programming.

</details>


### CONTENT NOTES

* build on `BankAccount` from the preceeding lecture's activity
* show that you can `const account: BankAccount = {balance: -100};` which violates the `balance >=0` invariant
* work up to solving this problem by adding functions to `BankAccount`, alhtough without a `balance` field.
