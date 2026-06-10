# Mutation & Side Effects

CONTENT HERE

### WORKING NOTES:

### Example taken from the arrays reading that was too state/mutation-heavy to leave there

Here is one the language does not provide. The forecasters want to know the longest unbroken stretch of below-freezing hours in the day. No single `map`, `filter`, or `find` computes this, because the answer depends on *runs* of consecutive elements: the computation has to remember how long the current cold streak is and reset that memory every time the temperature rises above freezing.

```typescript
function longestFreezingStreak(day: Reading[]): number {
    let current = 0; // consecutive freezing readings ending here
    let longest = 0; // best streak seen so far

    for (const reading of day) {
        if (reading.tempCelsius < 0) {
            current = current + 1;
            if (current > longest) {
                longest = current;
            }
        } else {
            current = 0; // the streak is broken
        }
    }
    return longest;
}
```

```typescript
test("longest freezing streak spans the early morning", () => {
    checkExpect(longestFreezingStreak(day), 2);
});
```

The two streak counters are the loop's *state*: values that survive from one element to the next and change as the loop runs. That is what the named operations cannot express for us, and it is why iteration exists.

<details class="tooltip ts-tips">
<summary>The <code>let</code> Keyword</summary>

`const` names cannot be reassigned, but a loop's state must change as the loop runs, so the counters above are declared with **`let`**: a name whose value *can* be reassigned. Use `const` by default and reach for `let` only when a value genuinely needs to change, as loop state does. Reassignment is our first encounter with mutation, and its broader consequences are the subject of the next reading.

</details>


Goal
====
Students understand mutation as interaction with a persistent world and why invariants matter more under mutation.

Key ideas & examples
* I/O as observable behavior without return values
* Persistent object state
* Mutation as necessity (big data, streaming)
* Reinterpreting loops with side effects (for loop with counter)


