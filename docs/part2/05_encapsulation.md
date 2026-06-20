# Encapsulation

Much of Part 1 was concerned with invariants: the properties a value must satisfy to be meaningful and the preconditions and postconditions that make up a function's contract. Those approaches describe and detect invariant violations, but cannot prevent them. A documented invariant is a promise, and the rest of the program is free to break it: the object `{ renewalsRemaining: -1 }` satisfies the `Loan` type and simultaneously violates the `Loan` invariant and the compiler will not object. Classes provide a mechanism for starting to close this gap through the constructor which provides a single, controlled path for building an object. But a constructor only controls how an object begins. If a class's fields are accessible to anywhere else in a program, any code holding the object can read and write to them directly, and the invariant the constructor established can be undone. A careful constructor is not enough on its own.

**Encapsulation** closes the gap by hiding a class's representation so that the invariant cannot be broken by external code. The data becomes accessible only to the class's own methods, which are designed to maintain the invariant. This is **information hiding**, and TypeScript's access modifiers make it more than a polite request: where Part 1 could only write a comment asking other code to leave a field alone, now the compiler can enforce it. This chapter covers the mechanism (`private`, `public`, and `readonly`), the process of deciding what to hide, and how this improves the design of the overall system.

## A Guest List That Must Stay Valid

We will work with one running example throughout this chapter.

> As an event organiser, I want a guest list that never holds the same guest twice and never exceeds the venue's capacity, so that check-in stays accurate and the room stays within its limit.

The list has two invariants: no guest appears more than once, and the number of guests never exceeds the capacity. Using the mechanisms we have already learned, this would look like:

```typescript
class GuestList {
    capacity: number;
    invited: string[]; // ids of invited guests

    constructor(capacity: number) {
        this.capacity = capacity;
        this.invited = [];
    }
}
```

The constructor starts an empty list, which satisfies both invariants. But the code does not continually enforce them. Any reference to a `GuestList` can write to the fields directly:

```typescript
const list = new GuestList(2);
list.invited.push("alice");
list.invited.push("alice"); // a duplicate; the first invariant is broken
list.invited.push("bob");
list.invited.push("carol"); // three guests in a list of capacity two
list.capacity = -1;         // and now the capacity is meaningless
```

Every line type-checks. A comment such as `// invariant: no duplicates, at most capacity` records the rule, exactly as in Part 1, but a comment cannot prevent the offending lines above from being written. And an invariant that can be so easily violated is not an invariant at all as no caller could depend on it being true.

## Hiding the Representation

The fix is to make the fields unreachable from outside the class. A field marked `private` can be read and written only from within the class body:

```typescript
class GuestList {
    private capacity: number;
    private invited: string[];

    constructor(capacity: number) {
        this.capacity = capacity;
        this.invited = [];
    }
}
```

With that one change, the lines that broke the invariant no longer compile:

```typescript
const list = new GuestList(2);
list.invited.push("alice"); // compile error: 'invited' is private
list.capacity = -1;         // compile error: 'capacity' is private
```

The representation is now encapsulated within `GuestList`. The only code that can touch `invited` and `capacity` is the code we write inside `GuestList`, which means we are responsible for keeping the invariants true, and know they cannot be broken by external code. Information hiding has become a boundary the compiler checks rather than a convention we hope callers respect.

<details class="tooltip ts-tips">
<summary><code>public</code>, <code>private</code>, and <code>readonly</code></summary>

Both fields _and_ methods can be marked with a visibility modifier:

- `public` is the default: the member is accessible everywhere. Methods that callers are meant to use are public.
- `private` restricts the member to the class body. Hide the representation by marking fields `private`.
- `readonly` allows a field to be assigned only where it is declared or in the constructor, never afterwards. A `GuestList`'s capacity is fixed once the list exists, so it should be `private readonly`:

```typescript
private readonly capacity: number;
```

`readonly` and `private` provide different constraints: `private` controls *who* can touch a field, `readonly` controls *when* it can change. A field can be both.

</details>

<details class="tooltip deep-dive">
<summary><code>private</code> Is Checked at Compile Time</summary>

TypeScript's `private` is enforced by the compiler and then erased: it is a rule about your source code, not a lock that exists while the program runs. JavaScript has a separate feature, fields whose names begin with `#`, that stay private at runtime as well. This course uses TypeScript's `private` throughout; you do not need `#` names. The practical point is the same either way: code outside the class is not permitted to reach the representation.

</details>

## The Constructor as the Only Way In

Because the representation is private, the constructor is the only way to bring a `GuestList` into existence, which makes it the natural place to establish the invariant. The version above still accepts invalid input: `new GuestList(-1)` produces a list whose capacity can never be met. The constructor should reject input it cannot turn into a valid object:

```typescript
/**
 * A guest list for an event with a fixed capacity.
 *
 * Class invariant: holds no duplicate guests, and never more than
 * `capacity` of them.
 */
class GuestList {
    private readonly capacity: number;
    private invited: string[];

    /**
     * Creates an empty guest list with the given capacity.
     *
     * @param {number} capacity the most guests the list may hold
     * @throws {Error} "capacity must be at least 1" when capacity is too small
     */
    constructor(capacity: number) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.invited = [];
    }
}
```

## Preserving the Invariant in Every Method

A validating constructor guarantees the object *starts* valid. Keeping it valid as it changes is the job of the methods, and it is a rule with no exceptions: every method that touches the representation must leave the invariant true. Adding a guest is the case that puts both invariants at risk:

```typescript
/**
 * Invites a guest. Inviting a guest who is already on the list does nothing.
 *
 * Precondition: the list is not full (see isFull).
 *
 * @param {string} guestId the guest to invite
 */
add(guestId: string): void {
    if (this.isInvited(guestId)) {
        return; // already invited; the list is unchanged
    }
    assert(this.isFull() === false, "cannot add a guest to a full list");
    this.invited.push(guestId);
}
```

The duplicate invariant is protected by the early return: inviting someone already present changes nothing. The capacity invariant is protected by the `assert`: the method's contract places the responsibility for checking space on the caller, who is expected to call `isFull` first, so reaching `add` on a full list is a programmer error, and we halt on it. The supporting methods are small, and each reports on the state without exposing it:

```typescript
isInvited(guestId: string): boolean {
    return this.invited.includes(guestId);
}

isFull(): boolean {
    return this.invited.length >= this.capacity;
}

size(): number {
    return this.invited.length;
}
```

This captures the essence of encapsulation. In Part 1 an invariant was documented and checked after the fact. Here, the constructor establishes it and every method preserves it, while the private representation guarantees that no other path exists. The invariant has gone from a property we *hoped held* to one that *always holds*.

<details class="tooltip link-110">
<summary>Invariants in CPSC 110</summary>

The structures you built with `define-struct` in CPSC 110 were immutable: once made, their fields never changed, so no later code could mutate one into an invalid state. But nothing checked an invariant when a structure was built, and nothing hid its fields, so a caller could still construct a structure that violated the interpretation written in its data definition. Keeping structures valid was a matter of discipline, of always building them through your own helper functions. Encapsulation makes that discipline something the language enforces: a validating constructor for how objects begin, and a hidden representation for how they change.

</details>

## When References Escape

A caller often needs to *see* the guests, to print them at the door or count them by hand. An accessor that hands the list back looks harmless:

```typescript
guests(): string[] {
    return this.invited; // returns the internal array itself
}
```

This compiles, and `private` is still on the field, yet the invariant is no safer than before. The method returns the very array the object stores, so a caller now holds a reference straight into the private representation:

```typescript
const list = new GuestList(2);
list.add("alice");
const everyone = list.guests();
everyone.push("alice"); // a duplicate, written directly into the list's state
everyone.push("bob");
everyone.push("carol"); // and now over capacity
```

No method of `GuestList` was called to break the invariant, and no `private` rule was violated; the array *escaped*. `private` protected the field, the binding from the name `invited` to an array, but not the array that binding points to. The fix is to hand back a copy:

```typescript
guests(): string[] {
    return this.invited.slice(); // a copy; mutating it cannot affect the list
}
```

Now pushing onto `everyone` modifies a separate array and leaves the list untouched. Returning a copy of internal data rather than the data itself is called **defensive copying**, and it is one of the most common mistakes, because the unsafe version looks correct and passes every test that does not specifically try to mutate the result.

<details class="tooltip deep-dive">
<summary>Copies and Shared References</summary>

A variable holding an array or object does not hold the data; it holds a reference to data that lives elsewhere. Assigning or returning that variable copies the reference, not the data, so two names end up pointing at the same array, and a change through one is visible through the other. `slice()` (for arrays) builds a new array, which is why returning `this.invited.slice()` is safe.

There is a depth limit worth knowing. `slice()` makes a **shallow** copy: a new array whose elements are the same references as the original's. For an array of strings that is completely safe, because strings cannot be mutated. For an array of objects it is not: the copy is a new array, but its elements are the same objects, so a caller could still reach through and mutate one of them. When the elements are themselves mutable, you need either a deeper copy or elements that cannot be changed, which is the subject of the next section.

</details>

## Changing the Representation

Maintaining the duplicate invariant by hand, an `includes` check in `add` and a rebuild in any removal, is work the standard library can do for us. A `Set` holds each value at most once by construction. Because the representation is private, we can switch to it without any caller being able to observe the difference:

```typescript
/**
 * A guest list for an event with a fixed capacity.
 *
 * Class invariant: holds no duplicate guests, and never more than
 * `capacity` of them.
 */
class GuestList {
    private readonly capacity: number;
    private invited: Set<string>;

    constructor(capacity: number) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.invited = new Set<string>();
    }

    isInvited(guestId: string): boolean {
        return this.invited.has(guestId);
    }

    isFull(): boolean {
        return this.invited.size >= this.capacity;
    }

    size(): number {
        return this.invited.size;
    }

    add(guestId: string): void {
        if (this.isInvited(guestId)) {
            return;
        }
        assert(this.isFull() === false, "cannot add a guest to a full list");
        this.invited.add(guestId);
    }

    remove(guestId: string): void {
        this.invited.delete(guestId);
    }

    guests(): string[] {
        return Array.from(this.invited); // still a fresh array, still a copy
    }
}
```

Every public method has the same name, the same parameters, and the same return type as before. Code written against the array version keeps working without a single change, because from the outside there *is* no change: the public shape is identical. We replaced the internal data structure and rewrote the method bodies, and all of it stayed inside the boundary that `private` creates. This freedom is the deeper reason to hide a representation. Callers depend on what a `GuestList` does, never on how it stores its guests, so how it stores its guests is ours to change. In addition, the `Set` makes the duplicate invariant *structural*: the representation is now incapable of holding a duplicate at all, rather than relying on `add` to check.

## Mutability and Immutability

`GuestList` is a **mutable** object: `add` and `remove` change it in place. It is worth separating two guarantees that are easily confused, because they guard against different risks:

- `const list = new GuestList(2)` stops the *binding* `list` from being pointed at a different object. It does nothing to stop `list.add("alice")` from changing the object `list` already refers to.
- `private readonly capacity` stops the *field* from being reassigned after construction.

An **immutable** object carries the second idea to its conclusion: none of its fields ever change, and methods that would modify it instead return a new object. An immutable guest list would establish its invariant once, at construction, and never have any later state to corrupt, so it would be valid for its whole life with no per-method effort. The cost is that every change allocates a new object. A mutable object is more economical and is often the natural choice for a guest list that is edited over time, but it accepts the obligation that *every* method preserve the invariant. Immutability buys safety by removing change; encapsulation buys safety by controlling it.

## Choosing What to Expose

Information hiding is not only about marking fields `private`; it is about keeping the public side of a class small and behavioural. Every public member is a promise to callers, so the fewer and the more stable they are, the more freedom the class keeps for itself. Three habits help:

- **Expose behaviour, not data.** `add`, `remove`, `isInvited`, and `size` say what a guest list *does*. We never exposed `invited`, so the data is reachable only in the controlled ways those methods allow.
- **Hide what is most likely to change.** The choice between an array and a `Set` was precisely such a decision, and hiding it is what made the change painless. Anything you expose, you may later have to keep working.
- **Keep the public side minimal.** Add a public method when a caller needs the behaviour, not in anticipation of one that might.

<details class="tooltip ts-tips">
<summary>Accessors with <code>get</code></summary>

TypeScript can make a method callable as though it were a field, using a `get` accessor:

```typescript
get count(): number {
    return this.invited.size;
}
```

A caller writes `list.count`, with no parentheses, but the body still runs, so it can return a computed or read-only view without exposing a field. There is a matching `set` accessor for assignment. Accessors are a convenience for presenting derived values; they are not a way around encapsulation, since a `get` with no `set` is read-only by design.

</details>

## Testing Through the Public Surface

Because callers reach a `GuestList` only through its public methods, so do its tests. A test constructs an object, drives it with method calls, and asserts on what it can observe:

```typescript
test("inviting the same guest twice invites them once", () => {
    const list = new GuestList(3);
    list.add("alice");
    list.add("alice");
    expect(list.size()).to.equal(1);
    expect(list.isInvited("alice")).to.be.true;
});

test("a capacity below one is rejected", () => {
    expect(() => new GuestList(0)).to.throw("capacity must be at least 1");
});

test("the array from guests() cannot change the list", () => {
    const list = new GuestList(3);
    list.add("alice");
    list.guests().push("bob"); // mutate the returned array
    expect(list.size()).to.equal(1); // the list itself is untouched
});
```

This is black-box testing by construction: with the representation hidden, there is nothing left to test but behaviour. It also reveals a design pressure worth naming. An object is testable exactly to the extent that its important behaviour is observable through its public surface. If a `GuestList` could fall into an invalid state but offered no way to observe its contents, no test could catch the fault. Designing for testability means giving callers, and therefore tests, enough public behaviour to confirm the invariant holds, without exposing the representation that would let them break it. The third test above is only possible because `guests()` and `size()` together let us observe that the escape attempt failed.

## An Encapsulation Process

The example followed a repeatable process, worth stating on its own so you can apply it to a new class:

1. **State the invariant** the object must always satisfy.
2. **Choose a representation** that can express it.
3. **Make the representation `private`** (and `readonly` wherever it never changes).
4. **Establish the invariant in the constructor**, rejecting any input it cannot satisfy.
5. **Expose a minimal set of public methods**, each written to preserve the invariant.
6. **Return copies or read-only views**, so the representation cannot escape.

Followed through, the result is an object that cannot be constructed invalid, cannot be driven invalid, and cannot leak the internals that would let someone else do either.

## Built-in Encapsulated Types

The `Set` we used is itself an encapsulated type: you use it through methods like `add`, `has`, `delete`, and `size`, never touching how it stores its elements. The standard collections are worth knowing precisely because they are the representations you will most often hide inside your own classes, and they are examples of an internal choice you can change without leaking.

- **Array.** You have written arrays with the literal sugar `string[]`. They can also be constructed explicitly with `new Array<string>()`, which produces the same kind of value as `[]` typed as `string[]`. The syntactic sugar is the usual approach for making new arrays; the `new` form is occasionally clearer when no elements are supplied up front.
- **Set.** A `Set` holds each value at most once. Build one with `new Set<string>()`; adding a value it already contains does nothing. There is no literal shorthand, so a `Set` must be created with `new`.
- **Map.** A `Map` associates keys with values, for example `new Map<string, number>()` to count tickets per guest. Its core methods are `set`, `get`, `has`, and `delete`, and it reports its entry count through `.size`. Like `Set`, it has no literal form and requires `new`.

A plain object can also serve as a key-to-value table, what is often called a dictionary. Using an *index signature*, the type `{ [guestId: string]: number }` reads as "any string key maps to a number":

```typescript
const tickets: { [guestId: string]: number } = {};
tickets["alice"] = 2;
```

A plain-object dictionary and a `Map` overlap, but differ in ways that decide between them. A plain object's keys are always strings; a `Map`'s keys may be of any type. A `Map` iterates its entries in the order they were inserted, and reports its size directly, where a plain object offers no count. Use a `Map` when you need keys that are not strings, a reliable iteration order, or a running size; reach for a plain object for a small, fixed-shape, string-keyed record.

## Designing for Encapsulation

A class with a hidden representation and a small public surface is an invariant you can rely on. The constructor establishes it, `private` stops anyone bypassing the methods, the methods preserve it, and copies keep it from escaping. What this discipline buys is worth making explicit:

- **Local reasoning.** You can confirm the invariant by reading a single class, because nothing outside it can break the invariant. This is the same argument the Error Handling chapter made for keeping behaviour understandable from one place rather than scattered across the whole program.
- **Freedom to change.** Because callers depend only on the public methods, the representation is yours to change, as the move from an array to a `Set` showed. Internal changes stay internal.
- **A stable surface to build on.** A team can write code against a class's public methods while its internals are still being worked out, as long as the public methods keep their promises.
- **Fewer places for bugs.** There is less code that can put the object in a bad state, so there are fewer places a bug can hide.

Encapsulation is the point where the invariants of Part 1 stop being promises and become guarantees. The next chapter builds on it.
