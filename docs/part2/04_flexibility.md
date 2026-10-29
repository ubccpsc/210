# Preserving Implementation Freedom with Abstract Values

In the previous chapter, we saw a change to `GuestList` where we replaced the array of invitees with a `Set`. Because the design of `GuestList` hid the raw invitees from callers, no calling code had to change. If we build software this way, hiding implementation decisions from callers, we can keep improving a class even after it has been deployed. While we motivated encapsulation in the last chapter as a way to protect invariants, a well-encapsulated design also provides **implementation freedom**, the ability to change how a class is built without changing the code that uses it.


It is easy to lose this freedom unintentionally. A single well-intentioned public method can make a later, simple change difficult. Implementation freedom covers more than just the internal representation: each decision a class keeps hidden from callers can be changed later without affecting them.



## What Makes a Change Safe

A class's representation is the state it holds. For `GuestList` that is a capacity and a collection of guest ids. Its **abstract value** is what that state means to a caller: a collection of invited guests with some maximum capacity of them, with no guest appearing twice. Every representation supports one abstract value, but each abstract value can be represented in many different ways:

```typescript
["alice", "bob"]              // an array
["bob", "alice"]              // a different array
new Set(["alice", "bob"])     // not an array at all
```

All three representations represent the same collection of guests. The order of the array is a detail of how the guests are stored. But the abstract value of a guest list is an unordered collection of guests, so the documentation of `guests()` does not promise an order (even though both versions happen to return guests in the order they were added).

This is one reason invariants on its own do not fully describe a class. An invariant says which representations are legal, but not what a legal representation means. Both details  should be added to the class documentation:

```typescript
/**
 * A guest list for an event with a fixed capacity.
 *
 * Abstract value: the set of guests invited to the event,
 * together with the capacity of the venue.
 *
 * Class invariant: holds no duplicate guests, and never
 * more than `capacity` of them.
 */
```

Is the capacity part of what a guest list is, or is it a private detail used to enforce the invariant? In the documentation above we have decided to make it part of the abstract value: two guests in a room for two is not the same guest list as the same two guests in a room for a hundred.

Writing down the abstract value allows us to predict whether a representation change will taint caller code. A local change is one where a representation can be replaced for the same abstract value. For instance, an array and a `Set`, together with a fixed `capacity`, can both stand for the same guest list. So, swapping them could not affect a caller. If the `Set` version had dropped the capacity, we would no longer have the same abstract value, and callers might have to change their behaviour (for example, by tracking the remaining capacity themselves).

<details class="tooltip deep-dive">
<summary>Two Descriptions, One Class</summary>

The rule about which representations are legal (which we've called a class invariant, just like those we've been using since [Chapter 3](../part1/03_checking-invariants#what-is-an-invariant)) is often called the _representation invariant_. What we've called an abstract value is often understood as a mapping: from a legal representation to the abstract value it represents.

This mapping is called an _abstraction function_. It is many-to-one: many representations map to one abstract value, as the three guest lists above do, but no representation maps to more than one abstract value, so the mapping is a function. This is why two objects with different representations may be equal, since equality is a question about the abstract value. Two objects with the same representation are always equal, since a function cannot give one input two answers.

</details>

## Two Notions of Sameness

The freedom to change a representation is often lost in innocuous-looking code. One common way is through a method that compares two objects. To see how, we first need to decide what it means for two objects to be the same:

```typescript
const a: GuestList = new GuestList(2);
a.add("alice");

const b: GuestList = new GuestList(2);
b.add("alice");
```

Are `a` and `b` the same? In [Chapter 10](./01_abstraction#objects-and-references) we learned that two objects are distinct (according to `===`) even when their contents match. `a === b` is `false`, because `===` on objects compares identity, asking whether two names refer to the same object in memory.

But both objects represent the same abstract value: a guest list for a venue for two holding only Alice. So we may want to treat these as equal in some code. We can separate these two notions of sameness as follows:

- **Identity**: Are these the same object? TypeScript answers this with `===`.
- **Equivalence**: Do these stand for the same abstract value? The programming language cannot tell us this directly, because only the class's author knows what its representation means.

To be able to ask questions about equivalence for a class, we need to provide a method that evaluates equivalence explicitly. Conventionally, we would name this method `equals`. However, no TypeScript operator calls this method: `===` always compares identity. So code that wants to compare values for equivalence must call `equals` explicitly.

### Comparing Representations

The obvious implementation of `equals` for a class compares the representations, position by position. For the array version of `GuestList` it would be:

```typescript
public equals(other: GuestList): boolean {
    if (this.capacity !== other.capacity) {
        return false;
    }
    if (this.invited.length !== other.invited.length) {
        return false;
    }
    let i: number = 0;
    for (const guest of this.invited) {
        if (guest !== other.invited[i]) {
            return false;
        }
        i = i + 1;
    }
    return true;
}
```

This method seems correct, but doesn't respect the abstract value the representation is meant to capture. Invite Alice then Bob to one list, and Bob then Alice to another, and this method reports that they are different guest lists. They are not, since both stand for a venue for two holding Alice and Bob.

This method can also degrade the implementation freedom of  `GuestList`. Because the method is public, callers are entitled to rely on its behaviour. A caller who cares about guest list order may start using it to check for this. If we later tried to change the internal representation from an array to a set, to support the behaviour the caller expects of `equals`, we'd have to track guest order separately, and by that point we might as well keep the array representation.


Both of these problems, the wrong answer and the lost freedom, come from writing the method in terms of how the data is represented rather than in terms of what it means.

### Comparing Abstract Values

Equality should be implemented at the level of the abstract value. Two instances of `GuestList` with the same capacity and the same guests should be treated as equivalent, regardless of how either instance stores them.

Here's a first attempt at `equals` that respects the abstract values:

```typescript
/**
 * Determines whether this list denotes the same guest list as another:
 * the same capacity, and exactly the same guests.
 *
 * @param {GuestList} other the guest list to compare against.
 * @returns {boolean} true when both denote the same guest list.
 */
public equals(other: GuestList): boolean {
    if (this.capacity !== other.capacity) {
        return false;
    }
    if (this.size() !== other.size()) {
        return false;
    }
    for (const guest of this.guests()) {
        if (other.isInvited(guest) === false) {
            return false;
        }
    }
    return true;
}
```

Note here that nearly every comparison in `equals` is one a caller could make from outside (`size`, `guests`, and `isInvited`). This observation provides a simple heuristic for judging whether an equality method is defined at the right level. If `equals` only asks questions that are part of the class's public API, it will keep working through any change to how the class stores its data. The version above works for both the array and the `Set` versions of `GuestList`.

The heuristic is not quite met here because this version also compares `capacity`, a private field. We could add a public method that reports the capacity, but keeping the comparison as it is allows a digression into what `private` means (see the tooltip below).

Beyond working at the abstract-value level, equality must also be _symmetric_: whenever `a.equals(b)` is true, `b.equals(a)` must be true as well. Most callers assume this is true, and caller code will break if this is not maintained.

Symmetry is easy to break by accident, usually by comparing some fields in only one direction. Is the `equals` method above symmetric?

<details class="tooltip ts-tips">
<summary>Reaching Into Another Object's Private Fields</summary>

The `equals` above reads `other.capacity`, a `private` field of a different object. This compiles, which surprises many people the first time. TypeScript's `private` applies per class, not per object, so code inside `GuestList` may access the private members of any `GuestList`, not only its own.

This is convenient for methods like `equals`, since comparing two objects of the same class would otherwise be difficult. It is still better to use the public methods where they are enough, as the version above does for the guests, because a comparison written against the public methods should keep working when the representation changes.

</details>

### Equality in Collections

You do not always get to choose which notion of sameness applies. The built-in operations that search a collection compare with `===`, so they search by identity:

```typescript
const alice: { id: string } = { id: "alice" };
const bob: { id: string } = { id: "bob" };
const guests: { id: string }[] = [alice, bob];
guests.includes(alice);                 // true: the same object
guests.includes({ id: "alice" });       // false: an equal-looking, different object
```

`indexOf`, `includes`, `Set`, and `Map` keys all behave this way, which affects a class we have already written. In [Chapter 10](./01_abstraction#class-functionality), `Playlist.remove(..)` finds the song to remove with `this.songs.indexOf(song)`, so it removes only the exact `Song` object it was given. A caller who builds a new `Song` with identical fields and asks for its removal gets no error and no removal, because no element is identical to the one passed in.

Removing by identity is not automatically a bug, but it is a decision that should be stated in the contract, as the documentation of `Playlist.remove(..)` does. Either `remove(..)` takes _this particular song object_, in which case identity is the right comparison and the documentation should say so, or it takes _any song equal to this one_, in which case it must search with the class's own notion of equality rather than `indexOf`. Either decision is fine, but leaving it unstated can lead to bugs later on.


## Immutable Values

`GuestList` is a **mutable object**: `add` and `remove` change it in place. By contrast, we've already seen two narrower kinds of immutability:

- Binding: `const list: GuestList = new GuestList(2)` stops the name `list` from being pointed at a different object. It does nothing to stop `list.add("alice")` from changing the object `list` already refers to.
- `readonly` field: `private readonly capacity` stops that field from being reassigned after construction.

An **immutable object** pushes the second idea further. None of its fields ever change, and methods that would modify it return a new object instead. This idea should be familiar: all the objects we wrote before Chapter 6, when we were still writing in a functional style, worked this way.

An immutable guest list would establish its invariant once, at construction, and never have any later state to corrupt, so it would stay valid for its whole life with no effort in each method. The cost is that every change allocates a new object.

A mutable object is often the natural choice for a guest list that is edited over time, but it requires every method to preserve the invariant.

Here's a minimal immutable guest list in `class` style:

<CollapsibleCode>

```typescript
class ImmutableGuestList {
    /** The invited guests; holds no duplicates and never changes after construction. */
    private readonly guests: string[];

    /**
     * Creates a guest list holding the given guests, ignoring any duplicates.
     *
     * @param {string[]} guests the guests to invite; empty when omitted.
     */
    public constructor(guests: string[] = []) {
        this.guests = [];
        for (const guest of guests) {
            if (this.guests.includes(guest) === false) {
                this.guests.push(guest);
            }
        }
    }

    /**
     * Returns a guest list with `guest` added, leaving this list unchanged.
     *
     * @param {string} guest the guest to add.
     * @returns {ImmutableGuestList} a new list holding this list's guests and `guest`.
     */
    public add(guest: string): ImmutableGuestList {
        const next: string[] = this.guests.slice();
        next.push(guest);
        return new ImmutableGuestList(next);
    }

    /**
     * Reports whether `guest` is on this list.
     *
     * @param {string} guest the guest to look for.
     * @returns {boolean} true when `guest` is on this list.
     */
    public includes(guest: string): boolean {
        return this.guests.includes(guest);
    }
}
```

</CollapsibleCode>

This minimal version leaves out the capacity, so its invariant is only that no guest appears twice. The constructor copies the guests it is given and skips any duplicates, and `add(..)` returns a new list rather than changing the list it was called on. The invariant is established once, in the constructor, and cannot be violated afterwards, because there is no in-place `add(..)` to misuse and no fields to reassign.

<details class="tooltip ts-tips">
<summary>Default Parameter Values</summary>

`constructor(guests: string[] = [])` uses a **default parameter value**. When the caller omits `guests`, TypeScript uses the default `[]`. Any parameter can have a default, written `parameter: Type = expression`, which is used only when the caller passes nothing (or `undefined`) for that argument. Default parameters must come after all required parameters.

<details class="tooltip deep-dive">
<summary>A Warning for Python</summary>

Default parameter values in Python look very similar to this, but they are an easy source of bugs. See [Mutable Default Arguments](https://docs.python-guide.org/writing/gotchas/).
</details>

</details>

Immutability and equality support each other. For a mutable object, the abstract value it stands for changes over time, so "these two are the same" is true only until someone calls a method. This is a hazard whenever an object is stored somewhere that depends on its value staying the same. A collection that refuses duplicates using `equals`, like the `Roster` later in this chapter, checks each member only when it is added, so a member mutated afterwards can end up equal to another member. An immutable object has one abstract value for its whole life, so comparisons made against it stay true. A class whose purpose is to be a value, such as a date, a money amount, or a coordinate, is called a **value object**. Value objects are almost always immutable for this reason, because an object that represents a value is of little use if that value can change while someone is holding it.

Immutability also extends implementation freedom. The previous chapter had to return a copy from `guests()`, because returning the stored array would let a caller reach into the representation. That obligation exists only because arrays can be changed. When the returned value cannot be changed by anyone, a class is free to decide, and later revise, how it produces that value. It may build a new one on every call, return a single shared instance, or cache one and return it repeatedly, and no caller can tell the difference.

## Generic Classes

Read the two descriptions of `GuestList` again:

> Abstract value: the set of guests invited to the event, together with the capacity of the venue.
> 
> Class invariant: holds no duplicate guests, and never more than `capacity` of them.

Neither description mentions strings. Nothing about "a bounded set with no duplicates" depends on a member being a specific kind of guest rather than an employee record or a seat number. So the representation was not the only unnecessary commitment `GuestList` made. It also fixed what its members are, and that commitment has the same cost. The class serves guest lists and nothing else, and a team that wants the same rules for seats or employees cannot use this class (unless they modify it in a way that would break existing clients of `GuestList`).

TypeScript gives us a feature that allows classes to avoid this commitment too. [Chapter 2](../part1/02_model-types#playlists) introduced type variables for naming a type that is not fixed until the type is used, as in `LinkedList<T>` for a list of any element type. A class declares type variables the same way:

```typescript
class <Name><T> {
    // T stands for a type, chosen by the code that creates the object
}
```

We can use this to abstract `GuestList` into a `Roster` holding objects of any type:

<CollapsibleCode>

```typescript
/**
 * A bounded collection that holds each member at most once.
 *
 * Abstract value: the set of members, together with the capacity.
 *
 * Class invariant: holds no duplicate members, and never more than
 * `capacity` of them.
 */
class Roster<T> {
    /** The most members the roster may hold; at least 1. */
    private readonly capacity: number;
    /** The members; no duplicates, and never more than `capacity` of them. */
    private readonly members: T[];

    /**
     * Creates an empty roster with the given capacity.
     *
     * @param {number} capacity the most members the roster may hold.
     * @throws {Error} "capacity must be at least 1" when capacity is too small.
     */
    public constructor(capacity: number) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.members = [];
    }

    /**
     * Reports whether `candidate` is a member of this roster.
     *
     * @param {T} candidate the possible member to look for.
     * @returns {boolean} true when `candidate` is a member.
     */
    public isMember(candidate: T): boolean {
        return this.members.includes(candidate);
    }

    /**
     * Reports whether the roster holds as many members as its capacity allows.
     *
     * @returns {boolean} true when no more members can be added.
     */
    public isFull(): boolean {
        return this.members.length >= this.capacity;
    }

    /**
     * Returns the number of members.
     *
     * @returns {number} how many members the roster holds.
     */
    public size(): number {
        return this.members.length;
    }

    /**
     * Adds a member. Adding a member already present does nothing.
     *
     * Precondition: the roster is not full (see isFull).
     *
     * @param {T} member the member to add.
     */
    public add(member: T): void {
        if (this.isMember(member)) {
            return;
        }
        assert(this.isFull() === false, "cannot add a member to a full roster");
        this.members.push(member);
    }
}
```

</CollapsibleCode>

The type is chosen where an object is created, and from then on the compiler holds the class to it:

```typescript
const guests: Roster<string> = new Roster<string>(2);
guests.add("alice");
guests.add(42);              // compile error: 42 is not a string

const scores: Roster<number> = new Roster<number>(10);
```

One `Roster` class now serves every kind of member, with full type checking for each. You have been using classes written this way since [Chapter 12](./03_encapsulation#changing-representations): `new Set<string>()` uses a generic type too, with the element type supplied where the object is created.

<details class="tooltip ts-tips">
<summary>Type Variables on Classes</summary>

A class declares its type variables after the class name, and may declare more than one:

```typescript
class <Name><T, U> {
    // both T and U may be used as types anywhere inside the class
}
```

Inside the class body, `T` can be used wherever a concrete type would go: as a field type, a parameter type, or a return type. It is not a value and cannot be constructed or compared against. It stands for whatever type the caller supplies.

The type is fixed for the life of the object. A `Roster<string>` is a different type from a `Roster<number>`, and neither is assignable to the other, so a function taking a `Roster<string>` cannot be handed a roster of numbers.

</details>


## What Flexibility Costs

`Roster<T>` has a defect. Look again at the membership test:

```typescript
public isMember(candidate: T): boolean {
    return this.members.includes(candidate);
}
```

For `Roster<string>` this behaves as `GuestList` did. For a roster of objects it does not. Suppose a `Seat` is a value object identified by its row and number:

```typescript
class Seat {
    /** The row the seat is in. */
    private readonly row: string;
    /** The seat's number within its row. */
    private readonly seatNumber: number;

    /**
     * Creates the seat at `seatNumber` in `row`.
     *
     * @param {string} row the row the seat is in.
     * @param {number} seatNumber the seat's number within its row.
     */
    public constructor(row: string, seatNumber: number) {
        this.row = row;
        this.seatNumber = seatNumber;
    }

    /**
     * Determines whether this is the same seat as another.
     *
     * @param {Seat} other the seat to compare against.
     * @returns {boolean} true when both seats have the same row and number.
     */
    public equals(other: Seat): boolean {
        if (this.row === other.row) {
            return this.seatNumber === other.seatNumber;
        }
        return false;
    }
}
```

Two seats built with the same row and number are equal, but they are still different objects:

```typescript
const seats: Roster<Seat> = new Roster<Seat>(400);
seats.add(new Seat("A", 12));
seats.isMember(new Seat("A", 12));   // false, though that seat is on the roster
```

Worse, `add(..)` refuses duplicates by calling `isMember`, so an answer of `false` lets the same seat in a second time:

```typescript
seats.add(new Seat("A", 12));   // added again
seats.size();                   // 2, and the no-duplicates invariant is broken
```

Nothing here is written incorrectly, but something is missing. As we saw above, `includes` compares with `===`, and inside `Roster<T>` there is nothing else to compare with. The class was written without knowing what `T` is, so it cannot know what `T` considers equal. The same limitation applies to more than equality: a generic class cannot order its members, format them, or copy them either.

The solution is to have the caller supply the knowledge the class lacks. Equality can be passed to the constructor as a function. Its type, `(a: T, b: T) => boolean`, is written like an arrow function with the body replaced by the return type: the parameter list, then `=>`, then the type the function returns:

<CollapsibleCode>

```typescript
class Roster<T> {
    /** The most members the roster may hold; at least 1. */
    private readonly capacity: number;
    /** The members; no two are the same according to `sameMember`, and never more than `capacity` of them. */
    private readonly members: T[];
    /** Decides whether two members are the same. */
    private readonly sameMember: (a: T, b: T) => boolean;

    /**
     * Creates an empty roster with the given capacity.
     *
     * @param {number} capacity the most members the roster may hold.
     * @param {function} sameMember reports whether two members are the same.
     * @throws {Error} "capacity must be at least 1" when capacity is too small.
     */
    public constructor(capacity: number, sameMember: (a: T, b: T) => boolean) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.members = [];
        this.sameMember = sameMember;
    }

    /**
     * Reports whether a member the same as `candidate` is in this roster.
     *
     * @param {T} candidate the possible member to look for.
     * @returns {boolean} true when some member is the same as `candidate`.
     */
    public isMember(candidate: T): boolean {
        for (const member of this.members) {
            if (this.sameMember(member, candidate)) {
                return true;
            }
        }
        return false;
    }

    // isFull, size, and add are unchanged
}
```

</CollapsibleCode>

Each caller now supplies the notion of sameness that suits its members:

```typescript
const guests: Roster<string> = new Roster<string>(2, (a: string, b: string) => a === b);
const seats: Roster<Seat> = new Roster<Seat>(400, (a: Seat, b: Seat) => a.equals(b));
```

The class still knows nothing about `T`, so one implementation can serve every kind of member.

This trade-off between specialisation, which restricts a piece of code, and generalisation, which may require extra abstraction, applies well beyond generics. When we write a class generically, avoiding commitment to a particular type or implementation, we also lose the knowledge that was encoded in that type or implementation. To implement any behaviour that depends on that knowledge, we'll need to get that knowledge from somewhere else. For each commitment, ask whether the freedom gained is worth the knowledge the class gives up.

<!-- 
RTH: Hidden here because we don't know how to do this yet,
but we will by the end of Chapter 15.

There is a second option. Instead of passing the equivalence operation in, we could restrict `T` to types that are guaranteed to provide an equivalence operation. This requires a way for us to say "the types that offer these operations". 
-->

#### Implementation Freedom

In [Chapter 12](./03_encapsulation#changing-representations), we saw how, by hiding a class's internal representation, we could gain implementation freedom, and change an internal representation without affecting users of a class.

In this chapter, we saw how making an internal representation `private` is not sufficient for implementation freedom. We preserve implementation freedom through careful design.

Preserving implementation freedom first involves understanding the abstract value a particular representation provides. This gave us an easy test for whether an internal representation change is achievable: check whether we can represent the same abstract value with the new internal representation. Then, we must ensure that all public operations on a class use only knowledge of this abstract value, not of the actual internal representation. We saw how easy it is to lose implementation freedom, for instance, when writing an `equals` method for a class.

Immutable classes can give further implementation freedom, as the class need not worry that its callers will, by using its outputs, modify its internal state. We also saw how we can gain even more implementation freedom through generic classes, though this came with a catch.

We had to give `Roster<T>` a comparison function because it had no way to require that its members provide one.

<details class="tooltip exercise">
  <summary>Exercise: Scheduling a Gallery</summary>

> As a gallery curator, I want to schedule artworks into exhibitions, so that the same piece is never promised to two shows at once.

An `Artwork` is identified by a catalogue number and also records a title, a year, and the name of the conservator currently responsible for it. An `Exhibition` holds the artworks in one show, up to the number of walls available.

```typescript
class Artwork {
    private readonly catalogueNumber: string;
    private readonly title: string;
    private readonly year: number;
    private conservator: string;   // reassigned when staff change
    /* ... */
}
```

Work through the following:

1. _Name the value._ Write the abstract value of `Artwork` as a documentation comment. Which of the four fields are part of what an artwork _is_, and which are information the gallery happens to record about it? Justify the boundary you draw, since there is more than one defensible answer.
2. _Equality._ Implement `equals` for `Artwork`, consistent with the abstract value you named. Then write tests that would have caught the mistake from this chapter: two artworks that your `equals` must call the same despite differing in some field.
3. _What it would cost to get wrong._ Suppose `Exhibition` stored its artworks in an array and someone wrote its `equals` by walking both arrays in order. Name a change to `Exhibition`'s representation that would break this `equals`. Explain how a caller could come to depend on the array without the array ever being returned to it.
4. _Immutability._ The `conservator` field is reassigned over time. Explain what could go wrong if `Artwork` objects are stored in an `Exhibition` and later mutated, and decide whether `Artwork` should be immutable. If you keep it mutable, state a rule about which fields `equals` may consult that keeps the hazard away.
5. _Generalising the container._ `Exhibition` holds artworks and refuses duplicates. Rewrite it as a generic `Showcase<T>` that could hold artworks, sculptures on loan, or catalogue entries. Write its documentation, including its abstract value and invariant.
6. _What the flexibility cost._ Your `Showcase<T>` needs to refuse duplicates but can no longer call `equals` on its members. Fix it using the approach from this chapter, then state what a caller must now understand to use `Showcase<T>` correctly that it did not have to understand for `Exhibition`, and say whether you think the trade was worth making here.

<!-- Potential unverified solution:

```typescript
import { describe, test, expect } from "vitest";
import assert from "node:assert/strict";

/**
 * A work in the gallery's catalogue.
 *
 * Abstract value: the catalogued work, identified by its catalogue number.
 * The title and year describe the work; the conservator is a record the
 * gallery keeps about it and may change without the work changing.
 */
class Artwork {
    /** The catalogue number; unique to this work and never changes. */
    private readonly catalogueNumber: string;
    /** The work's title. */
    private readonly title: string;
    /** The year the work was made. */
    private readonly year: number;
    /** The conservator currently responsible; reassigned when staff change. */
    private conservator: string;

    /**
     * Creates an artwork.
     *
     * @param {string} catalogueNumber the unique catalogue number.
     * @param {string} title the work's title.
     * @param {number} year the year the work was made.
     * @param {string} conservator the conservator currently responsible.
     */
    public constructor(catalogueNumber: string, title: string, year: number, conservator: string) {
        this.catalogueNumber = catalogueNumber;
        this.title = title;
        this.year = year;
        this.conservator = conservator;
    }

    /**
     * Returns the catalogue number.
     *
     * @returns {string} the catalogue number.
     */
    public getCatalogueNumber(): string {
        return this.catalogueNumber;
    }

    /**
     * Returns the conservator currently responsible for the work.
     *
     * @returns {string} the conservator's name.
     */
    public getConservator(): string {
        return this.conservator;
    }

    /**
     * Hands the work to a different conservator.
     *
     * @param {string} conservator the conservator now responsible.
     */
    public assignConservator(conservator: string): void {
        this.conservator = conservator;
    }

    /**
     * Reports whether `other` stands for the same catalogued work.
     * Consults only the catalogue number, which never changes.
     *
     * @param {Artwork} other the artwork to compare with.
     * @returns {boolean} true when both have the same catalogue number.
     */
    public equals(other: Artwork): boolean {
        return this.catalogueNumber === other.catalogueNumber;
    }
}

/**
 * A bounded collection of items on show, each held at most once.
 *
 * Abstract value: the set of items on show, together with the number of
 * walls available.
 *
 * Class invariant: no two items are the same according to `sameItem`,
 * and never more than `walls` of them.
 */
class Showcase<T> {
    /** The number of walls, so the most items the showcase may hold; at least 1. */
    private readonly walls: number;
    /** The items on show; no two the same according to `sameItem`, and never more than `walls`. */
    private readonly items: T[];
    /** Decides whether two items are the same. */
    private readonly sameItem: (a: T, b: T) => boolean;

    /**
     * Creates an empty showcase.
     *
     * @param {number} walls the number of walls available.
     * @param {function} sameItem reports whether two items are the same.
     * @throws {Error} "walls must be at least 1" when there is no room for anything.
     */
    public constructor(walls: number, sameItem: (a: T, b: T) => boolean) {
        if (walls < 1) {
            throw new Error("walls must be at least 1");
        }
        this.walls = walls;
        this.items = [];
        this.sameItem = sameItem;
    }

    /**
     * Reports whether an item the same as `candidate` is on show.
     *
     * @param {T} candidate the item to look for.
     * @returns {boolean} true when some item on show is the same as `candidate`.
     */
    public isShowing(candidate: T): boolean {
        for (const item of this.items) {
            if (this.sameItem(item, candidate)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reports whether every wall is taken.
     *
     * @returns {boolean} true when no more items can be added.
     */
    public isFull(): boolean {
        return this.items.length >= this.walls;
    }

    /**
     * Returns the number of items on show.
     *
     * @returns {number} how many items are on show.
     */
    public size(): number {
        return this.items.length;
    }

    /**
     * Adds an item. Adding an item that is already on show does nothing.
     *
     * Precondition: the showcase is not full (see isFull).
     *
     * @param {T} item the item to add.
     */
    public add(item: T): void {
        if (this.isShowing(item)) {
            return;
        }
        assert(this.isFull() === false, "cannot add an item to a full showcase");
        this.items.push(item);
    }
}

describe("Artwork.equals", () => {
    test("the same work is equal despite a different conservator", () => {
        const before: Artwork = new Artwork("C-1042", "Harbour at Dusk", 1911, "Lee");
        const after: Artwork = new Artwork("C-1042", "Harbour at Dusk", 1911, "Singh");
        expect(before.equals(after)).to.equal(true);
        expect(after.equals(before)).to.equal(true);
    });

    test("a different work with the same title and year is not equal", () => {
        const original: Artwork = new Artwork("C-1042", "Harbour at Dusk", 1911, "Lee");
        const study: Artwork = new Artwork("C-1043", "Harbour at Dusk", 1911, "Lee");
        expect(original.equals(study)).to.equal(false);
    });

    test("reassigning the conservator does not change equality", () => {
        const a: Artwork = new Artwork("C-1042", "Harbour at Dusk", 1911, "Lee");
        const b: Artwork = new Artwork("C-1042", "Harbour at Dusk", 1911, "Lee");
        a.assignConservator("Singh");
        expect(a.equals(b)).to.equal(true);
        expect(a.getConservator()).to.equal("Singh");
    });
});

describe("Showcase<Artwork>", () => {
    test("refuses a duplicate of a work already on show", () => {
        const show: Showcase<Artwork> = new Showcase<Artwork>(2, (a: Artwork, b: Artwork) => a.equals(b));
        show.add(new Artwork("C-1042", "Harbour at Dusk", 1911, "Lee"));
        show.add(new Artwork("C-1042", "Harbour at Dusk", 1911, "Singh"));
        expect(show.size()).to.equal(1);
        expect(show.isShowing(new Artwork("C-1042", "Harbour at Dusk", 1911, "Nobody"))).to.equal(true);
    });

    test("fills its walls and then refuses more", () => {
        const show: Showcase<Artwork> = new Showcase<Artwork>(2, (a: Artwork, b: Artwork) => a.equals(b));
        show.add(new Artwork("C-1", "One", 1901, "Lee"));
        show.add(new Artwork("C-2", "Two", 1902, "Lee"));
        expect(show.isFull()).to.equal(true);
        expect(() => show.add(new Artwork("C-3", "Three", 1903, "Lee"))).to.throw("cannot add an item to a full showcase");
    });

    test("works for strings with identity comparison", () => {
        const labels: Showcase<string> = new Showcase<string>(3, (a: string, b: string) => a === b);
        labels.add("north wall");
        labels.add("north wall");
        expect(labels.size()).to.equal(1);
    });
});
```

1. The abstract value is the catalogued work, identified by its catalogue number. The title and year describe the work, and the conservator is a record the gallery keeps about it, so `equals` consults the catalogue number alone. A defensible alternative includes the title and year in the value, so two catalogue entries count as the same work only if all three agree; it costs the gallery the ability to correct a title without changing what the work is.
3. Any change that stops the array's order from being the order works were added: storing the works in a `Set`, sorting them by catalogue number, or hanging them wall by wall. An `equals` that walks both arrays in order then reports two exhibitions with the same works as different. A caller depends on the array without seeing it whenever it relies on `equals`, or on the order of anything derived from the array, such as a printed list.
4. If `equals` consulted `conservator`, reassigning a conservator after a work was added could leave a showcase holding two "different" artworks that stand for one work, and its no-duplicates invariant would break after the fact. The rule that keeps the hazard away: `equals` consults only `readonly` fields. Under that rule `Artwork` can stay mutable; making it immutable (`assignConservator` returning a new `Artwork`) is the safer choice if the gallery can live with replacing objects.
6. A caller must now supply the comparison and understand that the showcase's notion of "the same" is whatever it passed in, including that the function must be symmetric. `Exhibition` asked for none of that. For a gallery with one kind of item the trade is not worth it; it pays off as soon as sculptures on loan and catalogue entries need the same rules.
-->

</details>
