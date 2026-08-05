# Preserving Implementation Freedom with Abstract Values

The previous chapter ended by replacing the array inside `GuestList` with a `Set`. Every method body was rewritten, and not one line of calling code changed. That result is important: the ability to change an implementation without disturbing the code that uses it is among the most valuable properties a design can have. It is what lets a class be improved after it has been deployed, and it is what encapsulation was protecting all along.

But it is also more fragile than it looks. A class can degrade that freedom without anyone noticing, in a single well-intentioned method, and the loss shows up only later when a change that should have been local turns out not to be. The freedom is also larger than the previous chapter made it appear. How a class stores its data is only one of the commitments it can decline to make, and every commitment it declines is one more thing that stays free to change.

This chapter examines that freedom in three parts: what makes a change safe, how a class can accidentally degrade that freedom, and which commitments beyond the representation a class can also decline to make.

## What Makes a Change Safe

A class's **representation** is the state it holds. For `GuestList` that is a capacity and a collection of guest ids. Its **abstract value** is what that state looks like to a caller: a set of invited guests, no more than `capacity` of them, with no guest appearing twice. Representations and abstract values are related, but the relationship is unidirectional. Every representation stands for exactly one abstract value, but one abstract value can be represented in many different ways:

```typescript
["alice", "bob"]              // an array
["bob", "alice"]              // a different array
new Set(["alice", "bob"])     // not an array at all
```

All three representations denote the same guest list. The order of the array is a detail of how the guests are stored, and nothing a caller can ask a `GuestList` will reveal it, because a guest list is a _set_ of guests and a set has no order. Once you see that, the representation change from the previous chapter stops being a lucky happenstance and becomes the expected result: we swapped one storage representation for another that captures the same values, so nothing observable changed from a caller's perspective.

This is why an invariant on its own is not a complete description of a class. The invariant says which representations are _legal_. It doesn't say anything about what a legal representation _means_. Both belong in the documentation:

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

Writing the abstract value down forces an implicit decision that is otherwise easy to be unclear about. Is the capacity part of what a guest list _is_, or is it a private detail used to enforce the invariant? The documentation above commits the design to the first: a list of two guests in a room for two is not the same guest list as the same two guests in a room for a hundred. That is a design choice, and the rest of this chapter depends on having made it.

This split is what makes a change safe, and it gives a test to apply before making one. A change to the representation is safe exactly when the new representation denotes the same abstract values as the old one. The array and the `Set` both denote the same guest lists, so swapping them could not disturb a caller. Had the `Set` version quietly dropped the capacity, or begun reporting guests in sorted order where the array preserved arrival order, the abstract value would have changed and callers would have been within their rights to notice.

<details class="tooltip deep-dive">
<summary>Two Descriptions, One Class</summary>

The pairing of these two descriptions is standard, and you will see this again under different names that are worth recognising. The rule about which representations are legal is often called the _representation invariant_, which is the class invariant we have been writing since Part 1. The mapping from a legal representation to the value it denotes is often called the _abstraction function_.

The word "function" is meaningful. The mapping is many-to-one: many representations map to one abstract value, as the three guest lists above do, but no representation maps to two. This asymmetry explains something that would otherwise be arbitrary. Two objects with different representations _may_ be equal, because equality is a question about the abstract value. Two objects with the same representation are _always_ equal, because the mapping is a function and cannot send one input to two answers.

</details>

## Two Notions of Sameness

The freedom to change a representation is lost in ordinary-looking code, and the most common place to lose it is a method that compares two objects. Before we can see how, we need to be precise about what comparing them should mean. The distinction between a representation and an abstract value stops being philosophical the moment a program compares two objects:

```typescript
const a = new GuestList(2);
a.add("alice");

const b = new GuestList(2);
b.add("alice");
```

Are `a` and `b` the same? The abstraction chapter answered one version of that question when it observed that two objects are distinct even when their contents match: `a === b` is `false`, because `===` on objects compares identity, asking whether two names refer to the same object in memory. These are two objects, so they are not identical. But they denote the same abstract value. Both are a guest list for a venue for two holding exactly Alice. Any question a caller can ask of one gets the same answer from the other.

So there are two notions of sameness, and code has to choose between them deliberately:

- **Identity**: Are these the same object? TypeScript answers this with `===`.
- **Equivalence**: Do these denote the same abstract value? The language cannot answer this, because only the class knows what its representation means.

A class expresses the second by providing a method for it, conventionally named `equals`. Nothing calls this method automatically; a caller who wants value comparison must ask for it by name.

### Degrading Implementation Freedom

The obvious implementation compares the representations, position by position. With the array version of `GuestList` it would read:

```typescript
equals(other: GuestList): boolean {
    if (this.invited.length !== other.invited.length) {
        return false;
    }
    for (let i = 0; i < this.invited.length; i++) {
        if (this.invited[i] !== other.invited[i]) {
            return false;
        }
    }
    return true;
}
```

Adding this one method has just cost `GuestList` the freedom the previous chapter was trying to protect. If the list representation changes to a `Set`, this code does not survive: there is no `.length` to read, and there are no array indices to traverse. The array is no longer an internal choice that can be revised, because a public method now depends on it being an array. An equality written against the representation makes the representation part of the class's public behaviour, and behaviour is what callers are entitled to rely on.

The immediate defect points at the same cause. Invite Alice then Bob to one list, and Bob then Alice to another, and this method reports that they are different guest lists. They are not: both denote a venue for two holding exactly Alice and Bob. It compared the _representations_, which differ, when it should have compared the _abstract values_, which do not. Both problems, the wrong answer and the lost freedom, come from writing a method at the level of the storage rather than at the level of the meaning.

### Comparing at the Right Level

Equality belongs at the level of the abstract value: same capacity, same guests, no attention paid to how either list stores them.

```typescript
/**
 * Determines whether this list denotes the same guest list as another:
 * the same capacity, and exactly the same guests.
 *
 * @param {GuestList} other the guest list to compare against
 * @returns {boolean} true when both denote the same guest list
 */
equals(other: GuestList): boolean {
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

Every comparison here is one a caller could have made from outside, using `size`, `guests`, and `isInvited`. This gives us a test for whether an equality is defined at the right level: if the method only asks questions that are part of the class's public meaning, it will keep working through any change to how the class stores its data. This version behaves identically for the array `GuestList` and the `Set` version.

Equality should also be _symmetric_: whenever `a.equals(b)` is true, `b.equals(a)` must be true as well. Symmetry is easy to break by accident, usually by comparing some fields in one direction only, and a caller has no way to defend against an equality method that disagrees with itself.

<details class="tooltip ts-tips">
<summary>Reaching Into Another Object's Private Fields</summary>

The `equals` above reads `other.capacity`, a `private` field of a different object. This compiles, which surprises most people the first time they see it. TypeScript's `private` is per _class_, not per _object_: code inside `GuestList` may touch the private members of any `GuestList`, not only its own.

This permission is convenient for exactly this kind of method, since comparing two objects of the same class is difficult otherwise. It is still worth preferring the public methods where they suffice, as the version above does for the guests, because a comparison written against the public surface keeps working when the representation changes.

</details>

### Where Equality Is Decided For You

You do not always get to choose which notion of sameness applies. The built-in operations that search a collection compare with `===`, so they find by identity:

```typescript
const guests = [alice, bob];
guests.includes(alice);                 // true: the same object
guests.includes({ id: "alice" });       // false: an equal-looking, different object
```

`indexOf`, `includes`, `Set`, and `Map` keys all behave this way. This behaviour has a consequence for a class we have already written. In the abstraction chapter, `Playlist.remove(..)` finds the song to remove with `this.songs.indexOf(song)`, so it removes only the exact `Song` object it was handed. A caller who builds a new `Song` with identical fields and asks for its removal gets no error and no removal, because no element is identical to the one passed in.

Removing by identity is not automatically a bug, but it is a decision, and the contract must state it. `remove(..)` either takes _this particular song object_, in which case identity is the right comparison and the documentation should say so, or it takes _any song equal to this one_, in which case it must search with the class's own notion of equality rather than with `indexOf`. Leaving the question unanswered is what turns it into a bug later.

## Values That Do Not Change

`GuestList` is a **mutable object**: `add` and `remove` change it in place. It is worth separating two guarantees that are easily confused, because they guard against different risks:

- **Binding**: `const list = new GuestList(2)` stops the name `list` from being pointed at a different object. It does nothing to stop `list.add("alice")` from changing the object `list` already refers to.
- **Field**: `private readonly capacity` stops that field from being reassigned after construction.

An **immutable object** carries the second idea to its conclusion: none of its fields ever change, and methods that would modify it instead return a new object. An immutable guest list would establish its invariant once, at construction, and never have any later state to corrupt, so it would be valid for its whole life with no per-method effort. The cost is that every change allocates a new object. A mutable object is more economical and is often the natural choice for a guest list that is edited over time, but it accepts the obligation that _every_ method preserve the invariant. Immutability buys safety by removing change; encapsulation buys safety by controlling it.

A minimal immutable guest list shows the pattern:

```typescript
class ImmutableGuestList {
    private readonly guests: string[];

    constructor(guests: string[] = []) {
        this.guests = guests.slice();
    }

    add(guest: string): ImmutableGuestList {
        return new ImmutableGuestList(this.guests.concat([guest]));
    }

    includes(guest: string): boolean {
        return this.guests.includes(guest);
    }
}
```

`add(..)` returns a new list rather than altering the list it was called on. The invariant is established once, in the constructor, and cannot be violated thereafter: there is no in-place `add(..)` to misuse and no fields to reassign.

<details class="tooltip ts-tips">
<summary>Default Parameter Values</summary>

`constructor(guests: string[] = [])` uses a **default parameter value**: when the caller omits `guests`, TypeScript substitutes the default `[]` automatically. Any parameter can have a default, written as `parameter: Type = expression`, and the default is used only when the caller passes nothing (or `undefined`) for that argument. Default parameters must come after all required parameters in a method's signature.

</details>

Immutability and equality support each other, which is why they appear in the same chapter. For a mutable object, the abstract value it denotes changes over time, so a statement like "these two are the same" is true only until someone calls a method. This is a hazard whenever an object is stored somewhere that depends on its value staying put: a guest used as a key in a `Map`, or an object placed in a `Set`, can be mutated afterwards into something the collection can no longer find. An immutable object has one abstract value for its whole life, so comparisons made against it stay true. A class whose whole purpose is to _be_ a value, such as a date, a money amount, or a coordinate, is called a **value object**, and such classes are almost always immutable for this reason: an object that exists to represent a value is of little use if the value it represents can change underneath whoever is holding it.

Immutability also widens the same freedom, in a way that is easy to miss. The previous chapter had to return a copy from `guests()`, because handing back the stored array would have let a caller reach into the representation. That obligation exists only because arrays can be changed. When the value being returned cannot be changed by anyone, a class is free to decide, and later to revise, how it produces that value: it may build a fresh one on every call, hand out a single shared instance, or cache one and return it repeatedly, and no caller can tell the difference. Returning something mutable commits you to copying it forever; returning something immutable leaves the choice open.

## Abstracting Over the Member Type

Read the two descriptions of `GuestList` once more:

> Abstract value: the set of guests invited to the event, together with the capacity of the venue.
> Class invariant: holds no duplicate guests, and never more than `capacity` of them.

Neither description mentions strings. Nothing about "a bounded set with no duplicates" depends on a member being a guest id rather than an employee record or a seat number. So the representation was not the only commitment `GuestList` made without needing to: it also fixed what its members are, and that second commitment has the same cost. The class serves guest lists and nothing else, and a team wanting the identical rule for seats or employees has to copy it. Declining this second commitment is the same move one level up, and TypeScript has a mechanism for it.

Part 1 introduced **type variables** for naming a type that is not fixed until the type is used, writing `LinkedList<T>` for a list of any element type. A class declares them the same way:

```typescript
class <Name><T> {
    // T stands for a type, chosen by the code that creates the object
}
```

Applying it to the guest list gives a class that no longer knows or cares what a member is:

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
    private readonly capacity: number;
    private readonly members: T[];

    /**
     * Creates an empty roster with the given capacity.
     *
     * @param {number} capacity the most members the roster may hold
     * @throws {Error} "capacity must be at least 1" when capacity is too small
     */
    constructor(capacity: number) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.members = [];
    }

    isMember(candidate: T): boolean {
        return this.members.includes(candidate);
    }

    isFull(): boolean {
        return this.members.length >= this.capacity;
    }

    size(): number {
        return this.members.length;
    }

    /**
     * Adds a member. Adding a member already present does nothing.
     *
     * Precondition: the roster is not full (see isFull).
     *
     * @param {T} member the member to add
     */
    add(member: T): void {
        if (this.isMember(member)) {
            return;
        }
        assert(this.isFull() === false, "cannot add a member to a full roster");
        this.members.push(member);
    }
}
```

</CollapsibleCode>

The type is chosen where an object is created, and from that point the compiler holds the class to it:

```typescript
const guests = new Roster<string>(2);
guests.add("alice");
guests.add(42);              // compile error: 42 is not a string

const seats = new Roster<Seat>(400);
```

One `Roster` class now serves every kind of member, with no loss of type checking on either. You have been using classes written this way since the previous chapter: `new Set<string>()` and `new Map<string, number>()` are the same mechanism, with the element and key types supplied at the point of use.

<details class="tooltip ts-tips">
<summary>Type Parameters on Classes</summary>

A class declares its type parameters after the class name, and may declare more than one:

```typescript
class <Name><T, U> {
    // both T and U may be used as types anywhere inside the class
}
```

Inside the class body, `T` is used wherever a concrete type would go: as a field type, a parameter type, or a return type. It is not a value and cannot be constructed or compared against; it is a name standing in for whatever type the caller supplies.

The type is fixed for the life of the object. A `Roster<string>` is a different type from a `Roster<Seat>`, and neither is assignable to the other, so a function taking a `Roster<string>` cannot be handed a roster of seats.

</details>

## What Flexibility Costs

There is a defect in `Roster<T>`, and exposing that defect is the point of introducing the class. Look again at the membership test:

```typescript
isMember(candidate: T): boolean {
    return this.members.includes(candidate);
}
```

For `Roster<string>` this behaves exactly as `GuestList` did. For a roster of objects it does not:

```typescript
const seats = new Roster<Seat>(400);
seats.add(new Seat("A", 12));
seats.isMember(new Seat("A", 12));   // false, though that seat is on the roster
```

Worse, `add(..)` refuses duplicates by asking `isMember`, so an answer of `false` lets the same seat in a second time:

```typescript
seats.add(new Seat("A", 12));   // added again
seats.size();                   // 2, and the no-duplicates invariant is broken
```

Nothing here is written incorrectly; something is missing. As we saw above, `includes` compares with `===`, and inside `Roster<T>` there is nothing else available to compare with. The class was written without knowing what `T` is, so it has no access to what `T` considers equal. Making the class work for every type cost it every assumption about the type it holds. This is the standing trade of a type parameter, and it applies to more than equality: a generic class cannot order its members, format them, or copy them either, for the same reason.

The solution is to have the caller supply the knowledge the class cannot have. Equality arrives as a function passed to the constructor:

<CollapsibleCode>

```typescript
class Roster<T> {
    private readonly capacity: number;
    private readonly members: T[];
    private readonly sameMember: (a: T, b: T) => boolean;

    /**
     * Creates an empty roster with the given capacity.
     *
     * @param {number} capacity the most members the roster may hold
     * @param {function} sameMember reports whether two members are the same
     * @throws {Error} "capacity must be at least 1" when capacity is too small
     */
    constructor(capacity: number, sameMember: (a: T, b: T) => boolean) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.members = [];
        this.sameMember = sameMember;
    }

    isMember(candidate: T): boolean {
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
const guests = new Roster<string>(2, (a, b) => a === b);
const seats = new Roster<Seat>(400, (a, b) => a.equals(b));
```

The class is still ignorant of `T`, and that ignorance is what lets one implementation serve every kind of member; the missing knowledge is passed in rather than assumed.

This is the general shape of the trade, and it is worth stating plainly because it applies well beyond generics. Flexibility is bought, not free. Every commitment a class declines to make is a piece of knowledge it no longer has, and any behaviour that depended on that knowledge must arrive some other way: from a parameter, from a collaborator, or from the caller. A design becomes flexible by moving decisions outward, never by making them disappear. The question worth asking of each commitment is not whether avoiding it is possible, but whether the freedom gained is worth the knowledge given up.

There is a second route here. Rather than passing the operation in, we could restrict `T` to types that are guaranteed to provide it, so that every member is known to have an `equals` method of its own. That requires a way to name "the types that offer these operations" as a type in its own right, which is the subject of the next chapter.

## Implementation Freedom

The freedom to change an implementation is not something a design has or lacks by nature. It is bought, it can be degraded without anyone noticing, and it can be extended.

The previous chapter bought it by hiding the representation. This chapter began by asking what that purchase rests on: a class holds a representation, it denotes an abstract value, and a change to the first is safe exactly when the second is unchanged. That is the test to apply before any change to how a class stores its data, and it is why swapping an array for a `Set` disturbed nobody.

The rest of the chapter followed that freedom in both directions. It can be degraded, and an equality method written against the stored fields is the most common way to degrade it, since it makes the representation into public behaviour that callers may rely on. It can be kept, by writing such methods at the level of the abstract value, using only what the class already promises. It can be extended to what a class returns, because a value nobody can change frees the class to build, share, or cache it as it sees fit. And it can be extended to what a class holds, because the type of its members is one more commitment it need not make.

Each step outward costs the class something it used to know, which is the thread into the next chapter. `Roster<T>` had to be handed a comparison function because it had no way to _require_ that its members provide one. There is one more commitment in every design we have written: a caller still has to name the class it wants. Declining that commitment, so that code depends on a set of promised operations rather than on any particular class, is what interfaces are for.

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

1. _Name the value._ Write the abstract value of `Artwork` as a documentation comment. Which of the four fields are part of what an artwork _is_, and which are information the gallery happens to record about it? Justify the boundary you draw; there is more than one defensible answer.
2. _Equality._ Implement `equals` for `Artwork`, consistent with the abstract value you named. Then write the test that would have caught the mistake from this chapter: two artworks that your `equals` must call the same despite differing in some field.
3. _What it would cost to get wrong._ Suppose `Exhibition` stored its artworks in an array and someone wrote its `equals` by walking both arrays in order. Name a change to `Exhibition`'s representation that this method would block, and explain how a caller would come to depend on the array without ever being told about it.
4. _Immutability._ The `conservator` field is reassigned over time. Explain what could go wrong if `Artwork` objects are stored in an `Exhibition` and later mutated, and decide whether `Artwork` should be immutable. If you keep it mutable, state a rule about which fields `equals` may consult that keeps the hazard away.
5. _Generalising the container._ `Exhibition` holds artworks and refuses duplicates. Rewrite it as a generic `Showcase<T>` that could hold artworks, sculptures on loan, or catalogue entries. Write its documentation, including its abstract value and invariant.
6. _What the flexibility cost._ Your `Showcase<T>` needs to refuse duplicates but can no longer call `equals` on its members. Fix it using the approach from this chapter, then state what a caller must now understand in order to use `Showcase<T>` correctly that it did not have to understand for `Exhibition`, and say whether you think the trade was worth making here.

</details>
