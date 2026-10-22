# Preserving Implementation Freedom with Abstract Values

In the previous chapter, we saw a change to `GuestList` where we replaced the array of invitees with a `Set`. Because the design of `GuestList` hid the raw invitees from outsiders, no calling code  had to change. If we build our software in this way---hiding the implementation decisions from callers---we can continue to improve a class even after it has been deployed. While we motivated encapsulation in the last chapter as a way to protect invariants, a well-encapsulated design also gives us a second benefit: implementation freedom.


It is easy to lose this freedom. A single well-intentioned method can reduce it without anyone noticing. If we aren't thoughtful about what behaviour callers depend on, we may only notice this loss of freedom later, when a simply change is made impossible due to a particular public method. We'll see that implementation freedom is also larger than internal representations. Each decision a class keeps hidden from callers can be changed later without affecting those callers.


In short, this chapter covers what makes a change safe, how a class can accidentally reduce its freedom to change, and which commitments beyond the representation a class can also avoid.


## What Makes a Change Safe

A class's **representation** is the state it holds. For `GuestList` that is a capacity and a collection of guest ids. Its **abstract value** is what that state means to a caller: a set of invited guests, no more than `capacity` of them, with no guest appearing twice. Every representation represents exactly one abstract value, but each abstract value can be represented in many different ways:

```typescript
["alice", "bob"]              // an array
["bob", "alice"]              // a different array
new Set(["alice", "bob"])     // not an array at all
```

All three representations represent the same guest list. The order of the array is a detail of how the guests are stored. A guest list is a _set_ of guests, and a set has no order, so the documentation of `guests()` does not promise an order (even though both versions happen to return guests in the order they were added). We were able to change the representation in the previous chapter because all these representations have the same abstract value.

Representations of data are one reason why an invariant on its own own do not fully describe a class. The invariant says which representations are _legal_, but not what a legal representation _means_. Both details (the meaning of a representation and which representations are legal) should be added to the class documentation:

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

Is the capacity part of what a guest list _is_, or is it a private detail used to enforce the invariant? We've decided, in the documentation above, to make it part of the value: two guests in a room for two is not the same guest list as the same two guests in a room for a hundred. This is _a_ design choice (not necessarily the _best_ design choice), and we'll be using it for the rest of this chapter. 

Writing down the abstract value allows us to predict whether a representation change will bleed into caller code. We can keep a change local when the new representation stands for the same abstract values as the old one. For instance, the array and the `Set`, by keeping the `capacity` around, both stood for the same guest lists. So, swapping them could not affect a caller. If the `Set` version had dropped the capacity, we would no longer have the same abstract value, and callers might have to change their behaviour (e.g., by explicitly tracking remaining capacity in the guest list---would this be a desirable design?).

<details class="tooltip deep-dive">
<summary>Two Descriptions, One Class</summary>

The rule about which representations are legal (which we've called a class invariant, just like those we've been using since [Part 1](../part1/index)) is often called the _representation invariant_. What we've called an abstract value is often understood as a mapping: from a legal representation to the abstract value it represents.

This mapping is called an _abstraction function_ because it is many-to-one: many representations map to one abstract value, as the three guest lists above do. But no representation maps to more than one abstract value. This is why two objects with different representations _may_ be equal, since equality is a question about the _abstract value_. However, two objects with the same representation are _always_ equal, since a function cannot give one input two answers.

</details>

## Two Notions of Sameness

The freedom to change a representation is often lost in ordinary-looking code, most commonly in a method that compares two objects. To see how, we first need to decide what it means for two objects to be the same:

```typescript
const a = new GuestList(2);
a.add("alice");

const b = new GuestList(2);
b.add("alice");
```

Are `a` and `b` the same? In [Chapter 10](./01_abstraction.html) we learned that two objects are distinct (according to `===`) even when their contents match. `a === b` is `false`, because `===` on objects compares identity, asking whether two names refer to the same object in memory. 

But both these objects represent for the same abstract value: a guest list for a venue for two holding only Alice. So we may *want* to treat these as equal in some code. We can separate these two notions of sameness as follows:

- **Identity**: Are these the same object? TypeScript answers this with `===`.
- **Equivalence**: Do these stand for the same abstract value? The programming language cannot tell us this out-of-the-box, because only the writer of the class knows what its representation means.

To be able to ask questions about equivalence for a class, we'll need to provide a method that evaluates equivalence explicitly. Conventionally, we  would name this method `equals`. However, in Typescript, no construct (neither `==` nor `===`) will call this method. So if you'd like to compare values for equivalence, your code needs to call `equals` explicitly.

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
    for (let i = 0; i < this.invited.length; i++) {
        if (this.invited[i] !== other.invited[i]) {
            return false;
        }
    }
    return true;
}
```

This method might *seem* correct, but it doesn't respect the abstract value the representation is meant to represent. Invite Alice then Bob to one list, and Bob then Alice to another, and this method reports that they are different guest lists. They are not, since both stand for a venue for two holding Alice and Bob.

This may also cost `GuestList` to lose some implementation freedom. If we make this method public, callers are entitled to use it. A caller who cares about guest list order may start using it to check for this. If we later tried to change the internal representation from an array to a set, to support the behaviour the caller expects of `equals`, we'd have to track guest order separately... by that point, we might as well just keep the array representation.


Both of these problems, the wrong answer and the lost freedom, come from writing the method in terms of how the data is _represented_ rather than in terms of _what it means_.

### Comparing Abstract Values

Equality should be implemented at the level of the abstract value. Two instances of `GuestList` with the same capacity and the same guests should be treated as equivalent, regardless of how either instance stores them.

Here's an `equals` that respects the abstract values:

```typescript
/**
 * Determines whether this list denotes the same guest list as another:
 * the same capacity, and exactly the same guests.
 *
 * @param {GuestList} other the guest list to compare against
 * @returns {boolean} true when both denote the same guest list
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

Note here that nearly every comparison in `equals` is one a caller could make from outside (`size`, `guests`, and `isInvited`). We can abstract this observation to a simple heuristic for judging whether an equality method is defined at the right level. If `equals` only asks questions that are part of the class's public meaning, it will keep working through any change to how the class stores its data. The version above works for both the array and the `Set` versions of `GuestList`. 

The heuristic breaks a tiny bit because this version does also compare `capacity`, a private field. We could give `capacity` a getter to resolve this, but this version allows us a digression into what exactly `private` means. (See below).

Beyond working at the abstract-value level, equality should also be _symmetric_: whenever `a.equals(b)` is true, `b.equals(a)` must be true as well. Most callers assume this is true, and caller code will break if this is not maintained. 

Symmetry is easy to break by accident, usually by comparing some fields in only one direction. What makes `equals` above correct, even though it only checks that each member of `this.guests` is invited in `other`, and not the other way around? How could you write `equals` differently and still ensure it is symmetric?

<details class="tooltip ts-tips">
<summary>Reaching Into Another Object's Private Fields</summary>

The `equals` above reads `other.capacity`, a `private` field of a different object. This compiles, which surprises most people the first time. TypeScript's `private` applies per _class_, not per _object_, so code inside `GuestList` may access the private members of any `GuestList`, not only its own.

This is convenient for methods like `equals`, since comparing two objects of the same class would otherwise be difficult. It is still better to use the public methods where they are enough, as the version above does for the guests, because a comparison written against the public methods should keep working when the representation changes.

</details>

### Equality in Collections

You do not always get to choose which notion of sameness applies. The built-in operations that search a collection compare with `===`, so they search by identity:

```typescript
const alice = { id: "alice" };
const bob = { id: "bob" };
const guests = [alice, bob];
guests.includes(alice);                 // true: the same object
guests.includes({ id: "alice" });       // false: an equal-looking, different object
```

`indexOf`, `includes`, `Set`, and `Map` keys all behave this way, which affects a class we have already written. In the abstraction chapter, `Playlist.remove(..)` finds the song to remove with `this.songs.indexOf(song)`, so it removes only the exact `Song` object it was given. A caller who builds a new `Song` with identical fields and asks for its removal gets no error and no removal, because no element is identical to the one passed in.

Removing by identity is not automatically a bug, but it is a decision which should be stated in the contract. Either `remove(..)` takes _this particular song object_, in which case identity is the right comparison and the documentation should say so, or it takes _any song equal to this one_, in which case it must search with the class's own notion of equality rather than `indexOf`. Both decisions are allowed: it's _not specifying the decision_ that may lead to bugs later on.


## Immutable Values

`GuestList` is a **mutable object**: `add` and `remove` change it in place. By contrast, we've seen a few different ways to guarantee immutability so far:

- **Binding**: `const list = new GuestList(2)` stops the name `list` from being pointed at a different object. It does nothing to stop `list.add("alice")` from changing the object `list` already refers to.
- **Field**: `private readonly capacity` stops that field from being reassigned after construction.

An **immutable object** pushes the second idea further. None of its fields ever change, and methods that would modify it return a new object instead. This idea should not be foreign to you---all the objects we wrote before Chapter 6, when we were still sticking to a function programming style, worked in this way.

An immutable guest list would establish its invariant once, at construction, and never have any later state to corrupt, so it would stay valid for its whole life with no effort in each method. The cost is that every change allocates a new object. 

A mutable object is more economical and often the natural choice for a guest list that is edited over time, but it requires _every_ method to preserve the invariant.

Here's a  minimal immutable guest list in `class` style:

```typescript
class ImmutableGuestList {
    private readonly guests: string[];

    public constructor(guests: string[] = []) {
        this.guests = [];
        for (const guest of guests) {
            if (this.guests.includes(guest) === false) {
                this.guests.push(guest);
            }
        }
    }

    public add(guest: string): ImmutableGuestList {
        return new ImmutableGuestList(this.guests.concat([guest]));
    }

    public includes(guest: string): boolean {
        return this.guests.includes(guest);
    }
}
```

This minimal version leaves out the capacity, so its invariant is only that no guest appears twice. The constructor copies the guests it is given and skips any duplicates, and `add(..)` returns a new list rather than changing the list it was called on. The invariant is established once, in the constructor, and cannot be violated afterwards, because there is no in-place `add(..)` to misuse and no fields to reassign.

<details class="tooltip ts-tips">
<summary>Default Parameter Values</summary>

`constructor(guests: string[] = [])` uses a **default parameter value**. When the caller omits `guests`, TypeScript uses the default `[]`. Any parameter can have a default, written `parameter: Type = expression`, which is used only when the caller passes nothing (or `undefined`) for that argument. Default parameters must come after all required parameters.

<details class="tooltip deep-dive">
<summary>A Warning for Python</summary>

**Warning**: default parameter values in Python look extremely similar to this, but are an easy source of bugs. See [Mutable Default Arguments](https://docs.python-guide.org/writing/gotchas/). 
</details>

</details>

Immutability and equality support each other. For a mutable object, the abstract value it stands for changes over time, so "these two are the same" is true only until someone calls a method. This is a hazard whenever an object is stored somewhere that depends on its value staying the same. A collection that refuses duplicates using `equals`, like the `Roster` later in this chapter, checks each member only when it is added, so a member mutated afterwards can end up equal to another member. An immutable object has one abstract value for its whole life, so comparisons made against it stay true. A class whose purpose is to _be_ a value, such as a date, a money amount, or a coordinate, is called a **value object**. Value objects are almost always immutable for this reason, because an object that represents a value is of little use if that value can change while someone is holding it.

Immutability also extends implementation freedom. The previous chapter had to return a copy from `guests()`, because returning the stored array would let a caller reach into the representation. That obligation exists only because arrays can be changed. When the returned value cannot be changed by anyone, a class is free to decide, and later revise, how it produces that value. It may build a new one on every call, return a single shared instance, or cache one and return it repeatedly, and no caller can tell the difference.

## Generic Classes

Read the two descriptions of `GuestList` again:

> Abstract value: the set of guests invited to the event, together with the capacity of the venue.
> 
> Class invariant: holds no duplicate guests, and never more than `capacity` of them.

Neither description mentions strings. Nothing about "a bounded set with no duplicates" depends on a member being a guest id rather than an employee record or a seat number. So the representation was not the only unnecessary commitment `GuestList` made. It also fixed what its members are, and that commitment has the same cost. The class serves guest lists and nothing else, and a team that wants the same rules for seats or employees has to copy it. 

TypeScript gives us a feature that allows classes to avoid this commitment too.

[Part 1](../part1/index) introduced **type variables** for naming a type that is not fixed until the type is used, as in `LinkedList<T>` for a list of any element type. A class can also use Type Variables: declares them the same way:

```typescript
class Name<T> {
    // T stands for a type, chosen by the code that creates the object
}
```


<details class="tooltip ts-tips">
<summary>Type Parameters on Classes</summary>

A class declares its type parameters after the class name, and may declare more than one:

```typescript
class <Name><T, U> {
    // both T and U may be used as types anywhere inside the class
}
```

Inside the class body, `T` can be used wherever a concrete type would go: as a field type, a parameter type, or a return type. It is not a value and cannot be constructed or compared against. It stands for whatever type the caller supplies.

The type is fixed for the life of the object. A `Roster<string>` is a different type from a `Roster<Seat>`, and neither is assignable to the other, so a function taking a `Roster<string>` cannot be handed a roster of seats.

</details>

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
    private readonly capacity: number;
    private readonly members: T[];

    /**
     * Creates an empty roster with the given capacity.
     *
     * @param {number} capacity the most members the roster may hold
     * @throws {Error} "capacity must be at least 1" when capacity is too small
     */
    public constructor(capacity: number) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.members = [];
    }

    public isMember(candidate: T): boolean {
        return this.members.includes(candidate);
    }

    public isFull(): boolean {
        return this.members.length >= this.capacity;
    }

    public size(): number {
        return this.members.length;
    }

    /**
     * Adds a member. Adding a member already present does nothing.
     *
     * Precondition: the roster is not full (see isFull).
     *
     * @param {T} member the member to add
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
const guests = new Roster<string>(2);
guests.add("alice");
guests.add(42);              // compile error: 42 is not a string

const seats = new Roster<Seat>(400);
```

One `Roster` class now serves every kind of member, with full type checking for each. You have been using classes written this way since [Chapter 12](./03_encapsulation.html): `new Set<string>()` and `new Map<string, number>()` use generic types too, with the element and key types supplied where the object is created.


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
    private readonly row: string;
    private readonly seatNumber: number;

    public constructor(row: string, seatNumber: number) {
        this.row = row;
        this.seatNumber = seatNumber;
    }

    public equals(other: Seat): boolean {
        return this.row === other.row && this.seatNumber === other.seatNumber;
    }
}
```

Two seats built with the same row and number are equal, but they are still different objects:

```typescript
const seats = new Roster<Seat>(400);
seats.add(new Seat("A", 12));
seats.isMember(new Seat("A", 12));   // false, though that seat is on the roster
```

Worse, `add(..)` refuses duplicates by calling `isMember`, so an answer of `false` lets the same seat in a second time:

```typescript
seats.add(new Seat("A", 12));   // added again
seats.size();                   // 2, and the no-duplicates invariant is broken
```

Nothing here is written incorrectly, but something is missing. As we saw above, `includes` compares with `===`, and inside `Roster<T>` there is nothing else to compare with. The class was written without knowing what `T` is, so it cannot know what `T` considers equal. The same limitation applies to more than equality: a generic class cannot order its members, format them, or copy them either.

The solution is to have the caller supply the knowledge the class lacks. Equality can be passed to the constructor as a function:

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
    public constructor(capacity: number, sameMember: (a: T, b: T) => boolean) {
        if (capacity < 1) {
            throw new Error("capacity must be at least 1");
        }
        this.capacity = capacity;
        this.members = [];
        this.sameMember = sameMember;
    }

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
const guests = new Roster<string>(2, (a, b) => a === b);
const seats = new Roster<Seat>(400, (a, b) => a.equals(b));
```

The class still knows nothing about `T`, which is what lets one implementation serve every kind of member. The missing knowledge is passed in rather than assumed.

This tradeoff---between specialization, which restricts a piece of code, and generalization, which may require extra abstraction---applies well beyond generics. When we write a class generically, avoiding commitment to a particular type or implementation, we also lost the knowledge that was encoded in that type or implementation. To implement any behaviour that depends on that knowledge, we'll need to get that knowledge from somewhere else. For each commitment, ask whether the freedom gained is worth the knowledge the class gives up.

There is a second option. Instead of passing the equivalence operation in, we could restrict `T` to types that are guaranteed to provide an equivalence operation. This requires a way for us to say "the types that offer these operations",  which is the subject of the next chapter.

#### Implementation Freedom

In [Chapter 12](./03_encapsulation.html), we saw how, by hiding a class's internal representation, we could gain implementation freedom, and change an internal representation without affecting users of a class.

In this chapter, we saw how making an internal representation `private` is not _sufficient_ for implementation freedom. We preserve implementation freedom through careful design. 

Preserving implementation freedom first involves understanding the _abstract value_ a particular representation provides. This gave us an easy test for whether an internal representation change is achievable: check whether we can represent the same abstract value with the new internal representation. Then, we must ensure that all public operations on a class use only knowledge of this abstract value, not of the actual internal representation. We saw how easy it is to lose implementation freedom, for instance, when writing an `equals` method for a class. 

Immutable classes can give further implementation freedom, as the class needs not worry that its callers will, by  using its outputs, modify its internal state. We also saw how we can gain even more implementation freedom through generic classes---though this came with a catch. Every abstraction costs us knowledge.

The next chapter will explore this notion of abstraction in more depth. We had to give `Roster<T>` a comparison function because it had no way to _require_ that its members provide one. Every design we've seen so far has one remaining dependency: a caller still has to name the class it wants. _Interfaces_ will let code depend on a set of promised operations, rather than on a particular class.

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
3. _What it would cost to get wrong._ Suppose `Exhibition` stored its artworks in an array and someone wrote its `equals` by walking both arrays in order. Name a change to `Exhibition`'s representation that would break this `equals`.  Explain how a caller would come to depend on the array without it being accessed returned explicitly.
4. _Immutability._ The `conservator` field is reassigned over time. Explain what could go wrong if `Artwork` objects are stored in an `Exhibition` and later mutated, and decide whether `Artwork` should be immutable. If you keep it mutable, state a rule about which fields `equals` may consult that keeps the hazard away.
5. _Generalising the container._ `Exhibition` holds artworks and refuses duplicates. Rewrite it as a generic `Showcase<T>` that could hold artworks, sculptures on loan, or catalogue entries. Write its documentation, including its abstract value and invariant.
6. _What the flexibility cost._ Your `Showcase<T>` needs to refuse duplicates but can no longer call `equals` on its members. Fix it using the approach from this chapter, then state what a caller must now understand in order to use `Showcase<T>` correctly that it did not have to understand for `Exhibition`, and say whether you think the trade was worth making here.

</details>
