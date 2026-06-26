# The Open/Closed Principle

Successful software systems are constantly evolving. A new kind of user, a new delivery channel, a new pricing rule: new requirements are added throughout the life of a system, and a codebase that cannot absorb them without breaking what already works becomes harder to change. Polymorphism offers one way to make a system extensible by enabling the **Open/Closed Principle**. Code that follows this principle is open for extension, so new behaviour can be added, and closed for modification, so adding that new behaviour requires no changes to existing code that already works.

This chapter shows what the principle looks like in practice, examines when to apply it, and closes by drawing together the design principles that this part of the course have established.

## Open for Extension, Closed for Modification

A unit of code is **open for extension** when new behaviour can be added to it, and **closed for modification** when adding that behaviour does not require existing code to change. The two stop being in tension once an abstraction is in place. The approach is enabled by interfaces and polymorphism. By making code depend on an abstractions rather than on concrete types, we can add new behaviour by writing a new implementation of that abstraction, and leave any code previously written against the abstraction unchanged.

The notifier system already has this shape. `alertAll(..)` depends on the `Notifier` interface, and each channel is an implementation of it:

```typescript
function alertAll(channels: Notifier[], message: string): void {
    for (const channel of channels) {
        channel.send(message);
    }
}
```

`alertAll(..)` names no concrete channel. Whether it can take on a new kind of channel without itself being changed is the test of whether the design is open in the way the principle asks for.

#### Adding a Channel

> As a DevOps engineer, I want to add push notification delivery to the alert system, so that on-call engineers are reached on their mobile devices even when they are not monitoring email.

Suppose alerts must now also go out as push notifications. There are two ways to meet the requirement, and the difference between them is the whole point.

The first design routes delivery through a function that branches on a channel tag:

```typescript
// every new channel adds another branch here, in code that already works
function notify(channel: string, target: string, message: string): void {
    if (channel === "email") {
        // deliver by email to target
    } else if (channel === "sms") {
        // deliver by SMS to target
    }
}
```

Adding push means opening `notify(..)` and adding a branch. In a real system the channel tag is rarely tested in only one place: formatting, validation, and logging tend to branch on it too, so a single conceptual change, one new channel, is scattered across every function that switches on the tag. Each of those functions already works and is already tested.

The second design is the one we have been building. A new channel is a new implementation of `Notifier`. Because the channels share a delivery skeleton, it extends `BaseNotifier` and supplies only its own delivery:

```typescript
class PushNotifier extends BaseNotifier {
    private readonly deviceId: string;

    constructor(deviceId: string) {
        super();
        this.deviceId = deviceId;
    }

    protected deliver(text: string): void {
        // deliver `text` to this.deviceId as a push notification
    }
}
```

Adding `PushNotifier` changes nothing else. `Notifier`, `BaseNotifier`, `EmailNotifier`, `SmsNotifier`, and `alertAll(..)` are all exactly as they were, and a push channel drops into any list of notifiers:

```typescript
alertAll([
    new EmailNotifier("ops@example.com"),
    new SmsNotifier("+1-555-0100"),
    new PushNotifier("device-42")
], "deploy finished");
```

One design meets the new requirement by editing code that already works; the other by adding code that did not exist before. That is the difference between a design closed to extension and one open to it.

<details class="tooltip link-110">
<summary>When the Data Grows</summary>

In CPSC 110, a function over a data type with several variants had one `cond` branch per variant. Adding a variant to the data definition meant revisiting every function that branched on that data to add the new case, so the cost of growing the data scaled with the number of functions that processed it. The polymorphic design reverses this: a new variant is a new class that carries its own behaviour, and the functions written against the interface do not change at all. A change that was once spread across every function becomes a single addition.

</details>

## Why Closed to Modification Matters

Why prefer adding code to editing it? The answer comes from the verification chapter. Code that already works is code that has been tested, and every edit to it is a chance to break something that worked before, a regression. Editing `notify(..)` to add push reopens the email and SMS branches: they have to be read, possibly disturbed, and re-tested to be sure they still work. Adding `PushNotifier` touches none of that. The existing channels and their tests are left alone, so they cannot regress; the only new tests are the ones for `PushNotifier`, and the existing suite stays green.

This is what "closed to modification" provides, and it is worth being precise about what it does not mean. It is not a rule that code must never change; bugs are still fixed and contracts are still refined. It means that adding a foreseen _kind_ of new behaviour should not require reopening code that already works. A system with that property grows more safely the larger it gets, because the impact of a new feature is localized within the new file rather than throughout a breadth of previously-tested code.

<details class="tooltip deep-dive">
<summary>Many Clients, One Change</summary>

In the notifier system, `alertAll(..)` is the only caller of `send`. In a real codebase the picture is often quite different: a widely-used abstraction can have dozens or hundreds of callers spread across many files and modules, written by different teams at different times. If meeting a new requirement means editing every concrete type those callers already name, the change has to be made in as many places as there are callers, each of which must be found, read, understood, retested, and redeployed. That is the cost the closed-to-modification property removes.

The **plugin architecture** pattern takes this idea to its logical end. The core of the application depends only on an abstraction; concrete implementations are supplied separately and wired in at startup, without the core naming them at all:

```typescript
// core: depends only on the abstraction, names no concrete channel
function alertAll(channels: Notifier[], message: string): void {
    for (const channel of channels) {
        channel.send(message);
    }
}

// startup: the one place that names concrete types, outside the core
const channels: Notifier[] = loadConfiguredChannels();
alertAll(channels, "system ready");
```

Adding a new channel means writing one new class and adding it to the configuration; the core and every other caller are left untouched. This is why text editors accept plug-ins, IDEs accept extensions, and operating systems accept drivers: the core was closed to modification before the extensions existed, and each extension adds behaviour by conforming to the abstraction the core already depends on.

</details>

## Choosing the Axis of Change

Openness comes at a cost. Depending on an abstraction adds indirection: the interface, the dispatch, the extra class. You spend that indirection to buy flexibility along _one_ axis of change, and the skill is in choosing the right axis. For the notifier system the axis was clear from the start: new channels are exactly the kind of thing added over time, so the `Notifier` interface is drawn across that axis and the indirection is justified. While there is a small runtime overhead for this indirection, the primary risk is one of conceptual overhead for engineers.

This reiterates the encapsulation chapter's advice to hide what is most likely to change, now applied to whole behaviours: put the abstraction boundary where new variants will appear. This also means we should not put abstraction boundaries where new variants are unlikely. Building an elaborate extension point for variation that never arrives adds conceptual indirection without any value.

<details class="tooltip deep-dive">
<summary>Speculative Generality</summary>

The opposite mistake to a rigid design is an over-flexible one. Adding interfaces, base classes, and extension points for variation you only imagine you might need is a recognised design smell, sometimes called _speculative generality_: the indirection is real while the flexibility is hypothetical. The guidance from the testing chapters applies here too, build for the variation you have evidence for, not the variation you can imagine. It is straightforward to open a concrete design along a new axis once that axis actually appears, and costly to carry a dozen speculative ones that never do.

</details>

It is also why no design is open to _every_ change. The notifier system is open along the axis of new channels; it says nothing about other axes. If the new requirement were to deliver a single alert to a whole group, or to schedule one for later, `Notifier` would not help, and meeting it might well require modification. A design is closed along the axis it was built for and open along that same axis; an unanticipated axis is a new design problem. Choosing the axis well, and accepting that a design cannot be open along all of them at once, is the judgement the principle asks for.

## The Principles Together

The Open/Closed Principle is the last piece of a set the design part has been assembling, and the pieces hold one another up:

- **Cohesion** (the decomposition chapter): each class, and each interface, is responsible for one thing.
- **Encapsulation** (the encapsulation chapter): a class hides its representation behind a contract, so its internals can change without its callers changing.
- **Small contracts** (the interfaces chapter): callers depend on a narrow, named abstraction rather than on a concrete class.
- **Substitutability** (the extension chapter): many implementations stand behind one contract, each honouring it, so one can stand in for another.
- **Open and closed** (this chapter): the above let a system grow by adding implementations rather than by editing existing code.

These are not independent rules to memorise. They are all the same concept viewed from different angles. A small, cohesive interface is easy to implement substitutably; substitutable implementations behind a hidden representation are what let new ones be added without modification; and the discipline of putting a boundary where change is expected is what makes any of it worth doing. Each makes the others reachable.

What the list captures as individual principles is, in practice, one experience: the difference between a codebase that grows by addition and one that grows by disturbance. In a codebase without these properties, a new requirement lands as a question of which working files must be changed, which passing tests might break, and how much existing code must be reread before the new code can be written. In one with them, a new requirement of the anticipated kind is a new file: it is written, tested, and the rest of the system accommodates it without being disturbed. The principles are not valuable as rules to memorise; they are valuable because they produce that second kind of codebase.

## Toward Evolution and Scale

The Open/Closed Principle is where we move fully into design. A system organised around contracts and polymorphic implementations grows by accretion: a new requirement of an anticipated kind is a new class, and the working system around it is left alone. That is the property that lets software keep changing without becoming impossible to change, which is what the next part of the course is about.

One question this chapter has left open points the way there. The notifier system depends on `Notifier` everywhere except in a single place: wherever the list of channels is actually assembled, some code must still name `EmailNotifier`, `SmsNotifier`, and now `PushNotifier` in order to create them. Concentrating and controlling that one place, so that a new channel can be wired in without editing the code that assembles the system, is the start of Part 3. From there it takes up the larger questions of evolution and scale: how a program is composed from interchangeable parts, how it admits extensions it was not shipped with, and how change is managed across many modules and the teams that own them.

The notifier system in its final form illustrates what the principle looks like once it is in place. `alertAll` has not changed since it was first written; only the list of channels has grown:

```typescript
const channels: Notifier[] = [
    new EmailNotifier("ops@example.com"),
    new SmsNotifier("+1-555-0100"),
    new PushNotifier("device-42"),
];
alertAll(channels, "deploy complete");
```

The open/closed property can be verified directly. A `CapturingNotifier`, written after `alertAll`, drops into any channel list and is exercised by the same function with no modification:

```typescript
class CapturingNotifier extends BaseNotifier {
    public delivered: string = "";

    protected deliver(text: string): void {
        this.delivered = text;
    }
}

const capture = new CapturingNotifier();
alertAll([capture], "deploy complete");
expect(capture.delivered).to.equal("[ALERT] deploy complete");
```

`alertAll(..)` has no knowledge of `CapturingNotifier`, yet it works with it. That is what closed to modification and open for extension means in practice.

<details class="tooltip exercise">
  <summary>Exercise: A Text Transformation Pipeline</summary>

> As a content pipeline developer, I want to apply a configurable sequence of text transformations, so that new processing steps can be added without changing the pipeline itself.

Design and implement a text transformation pipeline from scratch.

A _text transformer_ is any object that can take a string and return a transformed version of it. Design a `TextTransformer` interface with a single `transform(text: string): string` method.

A _pipeline_ applies a sequence of transformers in order: the output of one becomes the input of the next. Implement an `applyAll` function that takes a list of `TextTransformer` objects and a starting string, applies each in sequence, and returns the final result.

Implement two initial transformers: a `TrimTransformer` that strips leading and trailing whitespace, and an `UpperCaseTransformer` that converts its input to uppercase.

Work through the following:

1. _Extension._ Add a `PrefixTransformer` that takes a fixed string in its constructor and prepends it to its input. List every class or function outside `PrefixTransformer` itself that needed to change.
2. _Order matters._ Write a test showing that applying trim then uppercase to `"  hello  "` produces `"HELLO"`. Write a second test showing that reversing the two transformers produces a different result. What does this say about what `applyAll` guarantees?
3. _Verification._ Write a `CapturingTransformer` that records the input it receives and returns it unchanged. Use it to confirm that `applyAll` passes the correct accumulated text to each transformer in sequence.
4. _The axis._ Your pipeline is open for new transformers. Suppose the requirement is to skip a transformation when its input is shorter than a given length. What would need to change, and why does `TextTransformer` not help with this?

</details>
