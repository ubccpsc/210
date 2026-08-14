# Extending Behaviour Through Polymorphism

This chapter explores the ability for one method call to behave according to its containing object, which is possible due to polymorphism. We also explore a second mechanism for classes to relate to each other. An interface lets unrelated classes commit to the same contract, but it cannot say that one class is a _kind of_ another, nor let a class reuse another's implementation. Class **extension** does both: a class can extend another, inheriting its behaviour and refining it. This allows an instance of the extending class to be used wherever the original is expected. Both mechanisms serve the same broad goals. They cut duplication, by letting many types share one implementation and one body of calling code instead of each carrying its own copy, and they make a system more amenable to change, since a new type can be added behind an existing contract without rewriting the code that uses it. The second of these goals matters enough that the next chapter is devoted to it.

This chapter introduces extension (abstract base classes, `extends`, overriding, and `super`), explains the dynamic dispatch that makes polymorphism possible, sets out the responsibilities subtypes must support, and warns about when inheritance can be more problematic than helpful.

## Sharing Behaviour with a Base Class

In the previous chapter each notifier implemented `send(..)` for itself. Written side by side, the two methods would repeat the same opening steps before doing anything channel-specific: refuse an empty message, then format the alert text. Copying that logic into every channel is what the principle of **don't repeat yourself** (DRY) warns against: each copy is another place the rule has to be changed, and copies drift apart as some are updated and others are forgotten, so a rule is best kept in a single place. An interface cannot hold that shared work, because an interface has signatures and no bodies. A class can.

The shared work goes in a **base class**: a class that holds the functionality common to a family of related classes, so each of them can build on it instead of repeating it. Our base class is also **abstract**, meaning it cannot be created on its own; it exists only to be built on. An abstract class can mix two kinds of member: concrete ones, with a body that the whole family shares, and **abstract** ones, declared but deliberately left without a body for each class in the family to fill in.

```typescript
abstract class <Name> implements <Interface> {
    // concrete members shared by every subclass, and
    // abstract members that each subclass must provide:
    protected abstract <methodName>(<parameters>): <ReturnType>;
}
```

For the notifiers, the shared `send(..)` and a default formatting step go in the base class, and the channel-specific delivery is left abstract:

```typescript
abstract class BaseNotifier implements Notifier {
    public send(message: string): void {
        if (message.length === 0) {
            return; // shared rule: an empty alert is never delivered
        }
        this.deliver(this.decorate(message));
    }

    protected decorate(message: string): string {
        return "[ALERT] " + message;
    }

    protected abstract deliver(text: string): void;
}
```

`BaseNotifier` provides `send(..)` and a default `decorate(..)`, and declares `deliver(..)` as _abstract_: it has no body here, and every concrete subclass must supply one. Because `send(..)` and `decorate(..)` belong to the public `Notifier` contract and the internal workings respectively, only `send(..)` is `public`; `decorate(..)` and `deliver(..)` are `protected`, reachable inside the class and its subclasses but not from outside.

A concrete channel extends `BaseNotifier` and supplies only its own delivery:

```typescript
class EmailNotifier extends BaseNotifier {
    private readonly address: string;

    constructor(address: string) {
        super();
        this.address = address;
    }

    protected deliver(text: string): void {
        // deliver `text` to this.address over email
    }
}
```

`EmailNotifier` does not have a `send(..)` method of its own; it inherits the one in `BaseNotifier`. The `super()` in its constructor runs the base class constructor, which a subclass must do before using `this`.

A subclass can also **override** an inherited method, replacing it with its own version. SMS messages have a length limit, so `SmsNotifier` refines `decorate(..)`, reusing the base version through `super` and then shortening the result:

```typescript
class SmsNotifier extends BaseNotifier {
    private readonly phone: string;

    constructor(phone: string) {
        super();
        this.phone = phone;
    }

    protected decorate(message: string): string {
        return super.decorate(message).slice(0, 160); // SMS length limit
    }

    protected deliver(text: string): void {
        // deliver `text` to this.phone over SMS
    }
}
```

`super.decorate(message)` calls the base class's version, and the subclass shortens its result, so the shared formatting is reused rather than copied. Overriding a method, and calling `super` to build on the inherited version, are the two basic moves of refining a base class.

```plantuml
@startuml

hide empty members
skinparam groupInheritance 2

interface Notifier
abstract class BaseNotifier

Notifier <|.. BaseNotifier
BaseNotifier <|-- EmailNotifier
BaseNotifier <|-- SmsNotifier

Notifier : +send(message: string): void
BaseNotifier : +send(message: string): void
BaseNotifier : #decorate(message: string): string
BaseNotifier : {abstract} #deliver(text: string): void
EmailNotifier : -address: string
EmailNotifier : #deliver(..)
SmsNotifier : -phone: string
SmsNotifier : #decorate(..)
SmsNotifier : #deliver(..)

@enduml
```
<!-- caption="BaseNotifier providing common features." -->

<details class="tooltip ts-tips">
<summary>Abstract Classes and <code>protected</code></summary>

An `abstract class` cannot be instantiated: `new BaseNotifier()` is a compile error, because the class exists only to be extended. An `abstract` method has a signature but no body, and a subclass that fails to provide one does not compile, so the base class guarantees every subclass fills in the missing step. The encapsulation chapter introduced two visibility modifiers, `public` and `private`; `protected` is the third. A protected member is visible inside the class and any subclass, but not to outside callers, which is exactly what `decorate(..)` and `deliver(..)` need, since they are internal steps of delivery and not part of the public `Notifier` contract.

</details>

## Polymorphism and Dynamic Dispatch

The notifiers now share a `send(..)` method, but something subtler is also happening. **Polymorphism** is the ability of one piece of code to work with many types and to behave, for each, according to that type. We have seen its outward form already: `alertAll(..)` calls `channel.send(message)` and the right delivery happens whether the channel is email or SMS. What makes that work is **dynamic dispatch**: when a method is called through a variable, the method body that runs is chosen at run time from the variable's _actual_ type, not its _apparent_ type.

Consider a single channel held at the interface type:

```typescript
const channel: Notifier = new SmsNotifier("+1-555-0100");
channel.send("disk almost full");
```

The apparent type of `channel` is `Notifier`, so the compiler checks only that `Notifier` has a `send(..)`. At run time the object is an `SmsNotifier`, and the call resolves in steps:

1. `send(..)` is not defined on `SmsNotifier`; it is inherited from `BaseNotifier`, so `BaseNotifier`'s `send(..)` runs.
2. That `send(..)` calls `this.decorate(message)`. `this` is the `SmsNotifier`, which overrides `decorate(..)`, so the _subclass's_ `decorate(..)` runs and truncates the formatted text.
3. That `send(..)` then calls `this.deliver(text)`. `deliver(..)` is abstract in the base, and `this` is the `SmsNotifier`, so the _subclass's_ `deliver(..)` runs and sends over SMS.

Steps 2 and 3 are the heart of it. The calls to `decorate(..)` and `deliver(..)` are written inside `BaseNotifier`, but the versions that run are the ones belonging to the actual object. A method calls `this.something()`, and dispatch finds the right `something` for whatever object `this` turns out to be. This is what lets a base class lay out a sequence of steps and leave the steps themselves to its subclasses.

The same mechanism is what makes `alertAll(..)` work across a mixed list:

```typescript
const channels: Notifier[] = [
    new EmailNotifier("ops@example.com"),
    new SmsNotifier("+1-555-0100")
];
alertAll(channels, "deploy finished");
```

`alertAll(..)`'s body is the one line `channel.send(message)`, written once and reading the same on every pass of the loop. Yet on the first pass it delivers an email and on the second an SMS, because each `send(..)` dispatches to the actual object behind it. One call site, many behaviours, chosen by type at run time: that is polymorphism, and dynamic dispatch is the engine underneath it.

This is the apparent-and-actual split from the previous chapter, now with consequences for behaviour. The compiler reasons about apparent types, which is the static view; dispatch happens over actual types, which is the dynamic view. Writing `channel: Notifier` decides what calls are legal; the actual object decides what those calls do. This split is also one of the most common ways a design preserves implementation freedom: a caller that can see only the apparent type cannot depend on the actual one, so the object behind the variable stays free to change its representation, or to be a different class entirely, without any caller noticing.

## Honouring the Contract

Because a subclass instance can stand in wherever the base type or interface is expected, `alertAll(..)` will hand a message to whatever `Notifier` it is given and trust it to deliver. That trust is a responsibility the subtype takes on: it must honour the contract callers depend on, or code written against the supertype will be wrong even though it compiles.

`SmsNotifier` meets that responsibility. Its `decorate(..)` shortens the text, but `send(..)` still delivers the message, which is all the `Notifier` contract promises: the recipient gets the alert, within the limits of the channel. A subclass that instead quietly _dropped_ messages longer than 160 characters would break the contract, because `alertAll(..)` promises its callers that every channel is told, and this one would silently fail to deliver. The signatures would still match, so the compiler would say nothing; the violation would be in behaviour, not in types. A subtype may specialise _how_ it does a job, but it must still do the job the supertype describes.

<details class="tooltip deep-dive">
<summary>Demanding No More, Promising No Less</summary>

The contracts from [Part 1](../part1/index) make the rule precise. A method's precondition is what it demands of callers; its postcondition is what it guarantees in return. A subtype honours the supertype's contract when it demands no more and guarantees no less. If a subclass's `send(..)` rejected messages the base accepted, by also forbidding whitespace, say, it would _strengthen_ the precondition, and a caller relying on the base's looser rule would break. If it delivered less than the base promised, it would _weaken_ the postcondition. A subclass must also preserve any invariant the base maintains. These are the conditions under which substituting a subtype for its supertype is always safe, and they are why an override is free to change how a method works but not what it promises.

</details>

## `is-a` and `can-do`

There are now two ways for a class to take on a type, and the difference between them guides which to use. `EmailNotifier` _extends_ `BaseNotifier`: it _is a_ kind of notifier, and it inherits the base's implementation along with its type. `RecordingNotifier` from the previous chapter _implements_ `Notifier` directly: it _can do_ what a notifier does, committing to the contract while sharing none of the base's code. Both are usable as a `Notifier`, but they sit in different relationships to the hierarchy.

`extends` is most commonly used when one class is a more specific kind of another and can reuse its implementation. `implements` is more appropriate when a class needs only to satisfy a contract with an implementation of its own. Extension gives two things at once, an inherited _implementation_ and an inherited _type_; an interface gives only the type and leaves the implementation entirely to the class. A test double like `RecordingNotifier` wants exactly the type and none of the implementation, which is why it implements rather than extends.

A class may extend at most one class, but it may implement any number of interfaces. Interfaces themselves can extend other interfaces, composing a larger contract from smaller ones:

```typescript
interface ConfirmingNotifier extends Notifier, Confirmable {
    // ...
}
```

A class implementing `ConfirmingNotifier` must satisfy both `Notifier` and `Confirmable`. Small contracts combine into larger ones without any class being forced to depend on more than it needs.


## Replacing a Branch with Polymorphism

It is worth seeing the alternative to this design, because the contrast is the subject of the final chapter. Without polymorphism, sending over a channel chosen at run time means branching on a tag:

```typescript
function notify(channel: string, target: string, message: string): void {
    if (channel === "email") {
        // format and deliver by email to target
    } else if (channel === "sms") {
        // format and deliver by SMS to target
    }
}
```

Every channel is a branch in one function, and the `notify(..)` function has to be modified each time a new channel is added. The polymorphic design replaces the branch with types: each channel is a class, the shared shape lives in the interface, and which code runs is decided by dynamic dispatch rather than by an `if`. The branch disappears, and with it the single function that had to know about every channel at once.

In the polymorphic design there is no branch to write. The caller holds a `Notifier`, already constructed as the right kind of channel, and asks it to act:

```typescript
function notify(channel: Notifier, message: string): void {
    channel.send(message);
}
```

`notify(..)` no longer names a channel or enumerates the kinds; it works through the `Notifier` contract, and dynamic dispatch routes `send(..)` to whatever channel it was handed. Adding a channel adds a class, and this function does not change.

<details class="tooltip link-110">
<summary>Branching on a Variant</summary>

In CPSC 110 you handled a data type with several variants by branching on which variant you had, usually a `cond` that asked, in turn, what kind of value this was and what to do for it. That branch is the functional cousin of the `notify(..)` above: one place that enumerates every case. An interface with several implementations turns the cases inside out. Instead of one function that branches over the variants, each variant becomes a type that carries its own behaviour, and the branch is replaced by dispatch. The information is the same; what changes is whether adding a case means editing a shared branch or adding a new type.

</details>

Removing the branch is an improvement on its own terms, but its real importance is what it makes possible: a new channel can be added as a new class without touching `notify(..)`, `alertAll(..)`, or any existing channel. The next chapter takes up that property directly.

## Composition Over Inheritance

Class extension is powerful, and the language gives it dedicated syntax, but it is used more often than it should be. Most relationships between classes are better expressed by composition: one class _holds_ another as a field and delegates to it. That is, classes more often have _has-a_ relationships with each other, rather than _being_ a special kind of another class. 

To see when composition fits better, suppose the alert text needs more than one format, terse for SMS and verbose for email, and that the choice of format should be independent of the channel. Baking formatting into the class hierarchy through `decorate(..)` ties each format to a class: a verbose email and a terse email would be two classes, and a third format would multiply the hierarchy again. Holding a formatter keeps the two concerns separate:

```typescript
interface Formatter {
    format(message: string): string;
}

class EmailNotifier implements Notifier {
    private readonly address: string;
    private readonly formatter: Formatter;

    constructor(address: string, formatter: Formatter) {
        this.address = address;
        this.formatter = formatter;
    }

    public send(message: string): void {
        if (message.length === 0) {
            return;
        }
        const text = this.formatter.format(message);
        // deliver `text` to this.address over email
    }
}
```

Any formatter can now be paired with any channel by passing a different `Formatter` when the notifier is built, and a new format is a new `Formatter` class that no channel needs to know about. Inheritance cannot offer this freedom, because a class's base is fixed when the class is written, whereas a held collaborator can be chosen when the object is created.

```plantuml
@startuml

hide empty members
skinparam groupInheritance 2

interface Notifier
interface Formatter

Notifier <|.. EmailNotifier
Notifier <|.. SmsNotifier
Formatter <|.. TerseFormatter
Formatter <|.. VerboseFormatter

EmailNotifier *--> Formatter
SmsNotifier *--> Formatter

Notifier  : +send(message: string): void
Formatter : +format(message: string): string
EmailNotifier : -address: string
EmailNotifier : -formatter: Formatter
EmailNotifier : +send(..)
SmsNotifier : -phone: string
SmsNotifier : -formatter: Formatter
SmsNotifier : +send(..)
TerseFormatter : +format(..)
VerboseFormatter : +format(..)

@enduml
```
<!-- caption="Each channel holds a Formatter and delegates formatting to it, instead of inheriting it." -->

The freedom matters more as the system grows. Suppose it must support _c_ channels in _f_ formats. Baking formatting into the hierarchy means a class for each combination, _c_ times _f_ of them, and every new channel or format multiplies the count again. Holding the formatter as a collaborator needs only _c_ channel classes and _f_ formatter classes, _c_ plus _f_ in all, and a new format is a single class that pairs with every existing channel without any of them changing. Composition turns a multiplying cost into an adding one.

There are further reasons composition is the more flexible default, and they are the implementation freedom chapter's argument applied to collaborators. A class may extend only one base, but it can hold as many collaborators as it needs, so capabilities that could never share one inheritance line can sit side by side. A collaborator is also chosen when the object is built, and can even be swapped while the program runs, whereas a base class is fixed in the source the moment a subclass is written. Extending commits a class to one relationship for good; holding a collaborator declines that commitment and keeps the choice available.

Composition is also the looser bond. A subclass depends on its base class's _implementation_, not only its contract, so it is exposed to changes in how the base works; a collaborator is used only through its public contract, the boundary the interfaces chapter argued for. For all these reasons, use inheritance only when one class truly is a kind of another and shares a stable core of behaviour, and prefer composition everywhere else, which in practice is most places.

<details class="tooltip deep-dive">
<summary>Fragile Base Classes</summary>

Because a subclass builds on its base class's implementation, a change inside the base that looks harmless can break a subclass without any change to the subclass itself. Suppose a base method is rewritten to call another of the base's own methods that a subclass has overridden; the override now runs at a moment it never did before, and behaviour the subclass relied on changes silently. The more subclasses a base has, and the deeper the hierarchy, the more places such a change can reach, and the harder the base becomes to modify safely. This is the **fragile base class problem**. A collaborator held by composition does not have it: accessed only through its public methods, its internals can change freely as long as the contract holds.

</details>

## Extending Without Modifying

This chapter added a new way for classes to collaborate. Class extension lets one class be a more specific kind of another, inheriting a base's implementation and refining it through overriding and `super`, while an abstract base exposes shared sequence and leaves the varying steps to its subclasses. Underneath, polymorphism and dynamic dispatch let a single call do different work for different actual types, so code written against a supertype works with every subtype, present and future, as long as each honours the contract. And because inheritance more tightly binds classes it is reserved for true is-a relationships and composition stays the default mechanism for classes to interact with each other.

To see the mechanisms together, here is the inherited pipeline observed through a small recording subclass, so its behaviour can be checked without sending anything:

```typescript
class CapturingNotifier extends BaseNotifier {
    public delivered: string = "";

    protected deliver(text: string): void {
        this.delivered = text;
    }
}

test("a subclass inherits the send pipeline and supplies only delivery", () => {
    const channel = new CapturingNotifier();
    channel.send("disk full");
    expect(channel.delivered).to.equal("[ALERT] disk full");
});
```

`CapturingNotifier` writes no `send(..)` of its own, yet calling `send(..)` formats the message with the base's `decorate(..)` and then dispatches to the subclass's `deliver(..)`. The `[ALERT]` prefix in the recorded text is the inherited pipeline at work, and the captured delivery is dynamic dispatch routing the final step to the actual type.

The contrast with `RecordingNotifier` from the previous chapter is deliberate. That test double implemented `Notifier` directly because the test needed only to confirm what was sent, with no inherited behaviour involved. `CapturingNotifier` extends `BaseNotifier` because this test needs to exercise the inherited pipeline; extending the abstract class is the only way to confirm that the decorator prefix arrives in what `deliver(..)` receives.

<details class="tooltip exercise">
  <summary>Exercise: Quiz Scoring Schemes</summary>

> As a quiz platform developer, I want to score quiz submissions under different rules, so that the platform can offer standard and competitive formats without duplicating the logic for recording answers and tallying totals.

Here is the abstract base and two concrete scoring schemes:

```typescript
abstract class QuizScorer {
    private points: number = 0;
    private total: number = 0;

    /**
     * Records the result of one answer.
     * @param {boolean} correct whether the answer was correct
     */
    submit(correct: boolean): void {
        this.total = this.total + 1;
        if (correct) {
            this.points = this.points + this.correctPoints();
        } else {
            this.points = this.points + this.incorrectPoints();
        }
    }

    /** The accumulated score. */
    score(): number {
        return this.points;
    }

    /** The number of answers submitted so far. */
    count(): number {
        return this.total;
    }

    /** Points awarded for a correct answer. */
    protected abstract correctPoints(): number;

    /** Adjustment applied for an incorrect answer; typically zero or negative. */
    protected abstract incorrectPoints(): number;
}

```

Two scoring schemes extend `QuizScorer`:

- `StandardScorer`: a simple pass-or-fail scheme; a correct answer scores 1 point and an incorrect answer scores 0.
- `NegativeMarkingScorer`: a competitive scheme; a correct answer scores 1 point and an incorrect answer deducts 1, discouraging guessing.

Work through the following:

1. _Implementing the scorers._ Each scorer overrides only `correctPoints()` and `incorrectPoints()`. Implement both classes. How many methods does each require, and which parts of `QuizScorer` does each inherit unchanged?
2. _Abstract vs concrete._ `submit` is concrete while the two point methods are abstract. What would break if `submit` were abstract instead, and why is having it concrete beneficial?
3. _Adding a scorer._ Write a `WeightedScorer` that awards 3 points per correct answer and 0 for incorrect ones. How many methods must you write, and how many existing lines must you change?
4. _Testing._ Write tests for `NegativeMarkingScorer` covering three sequences: all correct, all incorrect, and one correct followed by one incorrect. Assert both `score()` and `count()` after each. What is the minimum number of sequences that exercises every branch in `submit`?

</details>

