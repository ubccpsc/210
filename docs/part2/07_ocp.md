# Growing Systems with the Open/Closed Principle

Successful software systems keep changing. New kinds of users, delivery channels, and pricing rules are added throughout a system's life, and each addition risks breaking what already works unless the design can absorb it. Polymorphism makes a system extensible by supporting the **Open/Closed Principle**.

## Open and Closed

A unit of code is **open for extension** when new behaviour can be added to it, and **closed for modification** when adding that behaviour does not require existing code to change. Interfaces and polymorphism make both possible at once. When code depends on an abstraction rather than on concrete types, we can add new behaviour by writing a new implementation of that abstraction, and leave any code already written against the abstraction unchanged.

The notifier system already has this shape. `alertAll(..)` depends on the `Notifier` interface, and each channel is an implementation of it:

```typescript
function alertAll(channels: Notifier[], message: string): void {
    for (const channel of channels) {
        channel.send(message);
    }
}
```

`alertAll(..)` names no concrete channel. Whether it can accept a new kind of channel without being changed tests whether the design is open in the way the principle describes.

#### Adding a Channel

> As a DevOps engineer, I want to add push notification delivery to the alert system, so that on-call engineers are reached on their mobile devices even when they are not monitoring email.

Suppose alerts must now also go out as push notifications. There are two ways to meet the requirement.

One is the tag-switching approach from the previous chapter. The `notify(..)` function that branches on a channel string gains an `else if` branch for push, which means editing code that already works and is already tested. In a real system the channel tag is rarely checked in only one place. Formatting, validation, and logging tend to branch on it too, so a single conceptual change is spread across every function that switches on the tag.

The other is the design we have been building, where a new channel is a new implementation of `Notifier`. Because the channels share a delivery skeleton, it extends `BaseNotifier` and supplies only its own delivery:

```typescript
class PushNotifier extends BaseNotifier {
    /** The identifier of the recipient's device. */
    private readonly deviceId: string;

    /**
     * Creates a notifier that pushes alerts to the device `deviceId`.
     *
     * @param {string} deviceId the identifier of the recipient's device.
     */
    public constructor(deviceId: string) {
        super();
        this.deviceId = deviceId;
    }

    protected deliver(text: string): void {
        // deliver `text` to this.deviceId as a push notification
    }
}
```

Adding `PushNotifier` requires no change to any existing class or function. `Notifier`, `BaseNotifier`, `EmailNotifier`, `SmsNotifier`, and `alertAll(..)` are all unchanged, and a push channel can be added to any list of notifiers:

```typescript
alertAll([
    new EmailNotifier("ops@example.com"),
    new SmsNotifier("+1-555-0100"),
    new PushNotifier("device-42")
], "deploy finished");
```

The first design meets the new requirement by editing code that already works, and the second by adding new code. The second is open for extension and closed for modification. The first is not closed for modification.

```plantuml
@startuml

hide empty members
skinparam groupInheritance 2
hide <<function>> circle

class "alertAll(channels: Notifier[], message: string)" as alertAll <<function>>
interface Notifier
abstract class BaseNotifier
class PushNotifier

alertAll ..> Notifier
Notifier <|.. BaseNotifier
BaseNotifier <|-- EmailNotifier
BaseNotifier <|-- SmsNotifier
BaseNotifier <|-- PushNotifier

Notifier : +send(message: string): void
BaseNotifier : +send(message: string): void
BaseNotifier : #decorate(message: string): string
BaseNotifier : {abstract} #deliver(text: string): void
EmailNotifier : #deliver(..)
SmsNotifier : #decorate(..)
SmsNotifier : #deliver(..)
PushNotifier : #deliver(..)

note bottom of PushNotifier
  added without changing
  any existing code
end note

@enduml
```
<!-- caption="Adding PushNotifier requires no change to Notifier, alertAll, or the existing channels." -->

## Why Add Instead of Edit

The reason to prefer adding code to editing it comes from [Chapter 9](../part1/09_validation#regression-testing). Code that already works has been tested, and every edit to it risks breaking something that worked before, a regression. Editing `notify(..)` to add push reopens the email and SMS branches, which then have to be read, possibly disturbed, and re-tested. Adding `PushNotifier` touches none of that. The existing channels and their tests are left alone, so they cannot regress. The only new tests are for `PushNotifier`, and the existing suite still passes.

"Closed for modification" is easy to overstate. Bugs are still fixed and contracts are still refined; the principle asks only that adding a foreseen kind of new behaviour should not require reopening code that already works. A system with this property can grow safely as it gets larger, because a new feature's impact is contained in the new code rather than spread through previously tested code.

<details class="tooltip deep-dive">
<summary>Many Clients, One Change</summary>

In the notifier system, `alertAll(..)` is the only caller of `send`. In a real codebase, a widely used abstraction can have dozens or hundreds of callers spread across many files and modules, written by different teams at different times. If meeting a new requirement means editing every concrete type those callers name, the change has to be made in as many places as there are callers, each of which must be found, read, understood, retested, and redeployed. The closed-for-modification property removes that cost.

The **plugin architecture** pattern takes this idea further. The core of the application depends only on an abstraction, and concrete implementations are supplied separately and connected at startup, without the core naming them at all:

```typescript
// core: depends only on the abstraction, names no concrete channel
function alertAll(channels: Notifier[], message: string): void {
    for (const channel of channels) {
        channel.send(message);
    }
}

// startup, outside the core: loadConfiguredChannels is the one place
// that names concrete channel types, reading them from configuration
const channels: Notifier[] = loadConfiguredChannels();
alertAll(channels, "system ready");
```

Adding a new channel means writing one new class and adding it to the configuration, and the core and every other caller are left untouched. This is how text editors accept plugins, IDEs accept extensions, and operating systems accept drivers. The core was closed for modification before the extensions existed, and each extension adds behaviour by conforming to the abstraction the core already depends on.

</details>

## The Axis of Change

Openness has a cost. Depending on an abstraction adds indirection: the interface, the dispatch, the extra class. That indirection buys flexibility along one axis of change, and the skill is in choosing the right axis. For the notifier system the axis was clear from the start. New channels are the kind of thing that gets added over time, so the `Notifier` interface is drawn across that axis and the indirection is justified. The runtime cost of the indirection is small. The main cost is the extra concepts an engineer has to understand.

This applies the advice from [Chapter 12](./03_encapsulation#choosing-what-to-expose) to hide what is most likely to change, now to whole behaviours: put the abstraction boundary where new variants will appear. A boundary placed this way is an **extension point**, a place where behaviour can be varied by adding code rather than by editing code that already works, and extension points are how a design is open for extension in practice. It also means we should not add extension points where new variants are unlikely. Building an elaborate one for variation that never arrives adds indirection without any value.

<details class="tooltip deep-dive">
<summary>Speculative Generality</summary>

The opposite of a rigid design is an over-flexible one. Adding interfaces, base classes, and extension points for variation you only imagine you might need is a recognised design mistake, usually called _speculative generality_: the indirection is real while the flexibility is hypothetical.

</details>

No design is open to every change. The notifier system is open along the axis of new channels, and says nothing about other axes. If the new requirement were to deliver a single alert to a whole group, or to schedule one for later, `Notifier` would not help, and meeting it might require modification. Choosing the axis well, and accepting that a design cannot be open along every axis at once, is the judgement the principle requires.

## The Principles Together

The Open/Closed Principle is the last of a set of principles this part of the course has built up, and each one supports the others:

- **Cohesion** ([Chapter 11](./02_decomposition#single-responsibility)): each class, and each interface, is responsible for one thing.
- **Encapsulation** ([Chapter 12](./03_encapsulation#hiding-the-representation)): a class hides its representation behind a contract, so its internals can change without its callers changing.
- **Implementation freedom** ([Chapter 13](./04_flexibility#what-makes-a-change-safe)): what a class means is kept separate from how it is built, so the implementation stays free to change, and each commitment a class avoids is one more thing that can vary.
- **Small contracts** ([Chapter 14](./05_boundaries#keeping-interfaces-small)): callers depend on a narrow, named abstraction rather than on a concrete class.
- **Substitutability** ([Chapter 15](./06_extension#honouring-the-contract)): many implementations stand behind one contract, each honouring it, so one can stand in for another. This is the Liskov Substitution Principle.
- **Dependency inversion** (this chapter): high-level code depends on abstractions rather than on concrete classes.
- **Open and closed** (this chapter): together, the principles above let a system grow by adding implementations rather than by editing existing code.

Dependency inversion is new in this chapter. `alertAll(..)` depends on `Notifier`, never on `EmailNotifier` or `SmsNotifier`, so the policy of "alert all channels" is separate from how any one channel delivers. This is called the **Dependency Inversion Principle**: high-level policy depends on an abstraction, and so do the low-level classes that implement it, which inverts the usual arrangement in which high-level code depends directly on the low-level code it calls.

Each of these principles was introduced separately, with its own example and argument, which can make them look like seven unrelated pieces of advice. They work together as a single mechanism, which is easiest to see by re-examining something we have already designed.

### One Addition, Taken Apart

Adding `PushNotifier` earlier in this chapter cost one class and one line where the channels are assembled. Each part of that small change depended on a decision made in an earlier chapter.

_That the change is one class at all_ is because the design is cohesive. Delivering an alert over a channel is a single responsibility, held by a single kind of unit, so "support one more channel" means "write one more class". Had delivery been spread across several classes, or bundled with formatting and retry policy, a new channel would have needed changes in several places, and polymorphism could not have reduced it to one.

_That it can store a `deviceId`_ is encapsulation providing implementation freedom. A push channel needs to remember something unlike an email address or a phone number, and it can, because no code outside a channel class has ever been able to see what the channel stores. Each channel's representation was private from the start, so the new channel was free to store whatever it needed.

_That it had to write only `deliver(..)`_ is because of the small contract, together with the shared base from [Chapter 15](./06_extension#abstract-base-classes). `Notifier` requires one operation, so conforming to it is cheap, and `BaseNotifier` already holds the steps every channel performs identically, so the new class supplies only the step that differs.

_That `alertAll(..)` accepts it_ is because of substitutability. `PushNotifier` demands no more of its callers than `Notifier` does and promises no less, so code written against the interface is correct for an implementation that did not exist when the code was written.

_That `alertAll(..)` did not have to change_ is because `alertAll(..)` was written against the abstraction rather than against any channel, so nothing in it could become out of date when a channel was added.

### Removing a Principle

One way to see that these principles depend on one another is to remove them one at a time and watch the same change become harder. For each case below, assume the other principles still hold.

_Without cohesion._ Suppose `EmailNotifier` had also owned message formatting and the system's retry policy, because those were added to it when email was the only channel. Adding push now means adding push delivery, push formatting, and push retry, wherever those responsibilities ended up. The interface is still there and still polymorphic, but the change, and its potential to affect existing code, is now spread across three places.

_Without encapsulation._ Suppose `address` had been public, and an audit log had come to read `channel.address` to record who was notified. `PushNotifier` has no address, only a device id, so the audit log cannot accept it, and auditing push alerts means changing existing code, because a caller depended on a field rather than on behaviour.

_Without implementation freedom._ Suppose `send(..)` had been declared to return the provider's raw response object, so that callers could inspect delivery details. The response object differs between providers, so either `PushNotifier` cannot conform to the contract, or it fabricates a response in a shape that does not fit its provider. The interface exposed a representation, and representations are not interchangeable even when the behaviour is.

_Without small contracts._ Suppose `Notifier` had grown to nine methods over time, such as `send`, `confirmDelivery`, `formatAsHtml`, `setPriority`, and `remainingQuota`. Push supports some of these and not others, so the new class must throw errors from the operations that make no sense for it. Now no caller can rely on any method being available, and the interface no longer works as a contract.

_Without substitutability._ Suppose `PushNotifier.deliver(..)` silently discarded messages longer than the push service accepts. It compiles, it implements the interface, and every existing test still passes. But callers of `alertAll(..)` rely on every channel being told, and that is now false, broken by a class the system did not have to be modified to accept.

_Without dependency inversion._ Suppose `alertAll(..)` had been written to check what kind of channel it was holding before deciding how to send. Adding push means editing existing code, and the design is back to the tag-switching approach this chapter started by rejecting.

The addition was easy only because every one of these principles held in the existing design.

### When Principles Conflict

The principles do not always agree. Applied without judgement, several of them pull against each other.

Cohesion says to split a class that owns two invariants, but [Chapter 11](./02_decomposition#judgement-calls) also warned that every split adds a name to learn and a file to navigate, and that extracting a class for a rule that will never grow fragments a design without clarifying it. Interface segregation says to prefer many small interfaces, but a system with twenty single-method interfaces can be harder to learn than one with five coherent ones. This chapter says to put an extension point where change is expected, and the speculative generality tooltip says that building an abstraction where change never comes is a mistake.

These tensions have a common source, and it is the central idea of this part of the course. Every design decision answers the same question: _what is likely to change?_ Split a class where its reasons to change differ. Draw an interface where new variants will appear. Hide what will vary and expose what will not. When you have a confident answer to that question, the principles agree, because they all follow from it. When they seem to conflict, the disagreement is usually about a prediction, not about design, and it is better argued in those terms than by citing principles at each other. The judgement this part has asked for is a prediction about which parts of a system will need to change, made with incomplete information and revised as the system shows you where you were wrong.

Predicting the future is hard, and a design decision made today is a claim about requirements that have not yet arrived. There are two ways to get it wrong, and over a career you will make both mistakes. You will build an abstraction for a kind of change that never comes, leaving unnecessary indirection in the design. You will also leave code concrete in the one place a change eventually lands, and the new requirement will have to work around the missing abstraction. The two errors cost different things. An unnecessary abstraction adds indirection, a small cost that every reader pays for as long as it exists. A missing abstraction forces a modification to working code, a larger cost that is paid once.

Prediction draws on evidence you can look for. Parts of a system that have changed before tend to change again. Some variation is inherent in the domain rather than specific to this release: there will be another payment provider, another export format, another delivery channel, and people who work in the domain can usually point these out. Some is visible in the requirements, in a request that says "for now" or names one case out of an obvious family. Reading these signals improves with experience of real systems. Experienced engineers often seem to predict well because they have seen similar systems before, and remember where the last design turned out to be rigid.

For this reason, the principles cannot be applied as a checklist. A checklist can be followed without understanding the system, but a prediction depends on this system, this domain, and what this team has reason to expect. You get better at design by practising it, and by noticing why a design turned out to be wrong. The same reason explains why the judgement stays with the engineer however much of the code is written by tools: deciding which axis of change a system should be open along is not a question about syntax, and no tool can answer it without knowing what the system is for.

#### Toward Evolution and Scale

A system organised around contracts and polymorphic implementations grows by addition: a new requirement of an anticipated kind is a new class, and the working system around it is left alone. This is how software can keep changing over a long life, which is the subject of the next part of the course.

This chapter leaves one question open. The notifier system depends on `Notifier` everywhere except in one place: wherever the list of channels is assembled, some code must still name `EmailNotifier`, `SmsNotifier`, and now `PushNotifier` to create them. [Part 3](../part3/index) answers which code should construct concrete objects, and where, so that only one place in the program names them. It then turns to the work of changing a system that already exists: managing how its parts depend on one another, consuming and publishing contracts across its boundaries, and improving, repairing, and extending code that already works.

<details class="tooltip exercise">
  <summary>Exercise: A Text Transformation Pipeline</summary>

> As a content pipeline developer, I want to apply a configurable sequence of text transformations, so that new processing steps can be added without changing the pipeline itself.

Design and implement a text transformation pipeline from scratch.

A _text transformer_ is any object that can take a string and return a transformed version of it. Design a `TextTransformer` interface with a single `transform(text: string): string` method.

A _pipeline_ applies a sequence of transformers in order: the output of one becomes the input of the next. Implement an `applyAll` function that takes a list of `TextTransformer` objects and a starting string, applies each in sequence, and returns the final result.

Implement two initial transformers: a `TrimTransformer` that strips leading and trailing whitespace, and an `UpperCaseTransformer` that converts its input to uppercase.

Work through the following:

1. _Extension._ Add a `PrefixTransformer` that takes a fixed string in its constructor and prepends it to its input. List every class or function outside `PrefixTransformer` itself that needed to change.
2. _Order matters._ Write a test showing that applying trim then uppercase to `"  hello  "` produces `"HELLO"`. Then use the `PrefixTransformer` from step 1: applying `PrefixTransformer("note: ")` and then `UpperCaseTransformer` to `"hello"` produces `"NOTE: HELLO"`, while the reverse order produces `"note: HELLO"`. Write a test for each order. What does this say about what `applyAll` guarantees?
3. _Validation._ Write a `CapturingTransformer` that records the input it receives and returns it unchanged. Use it to confirm that `applyAll` passes the correct accumulated text to each transformer in sequence.
4. _The axis._ Your pipeline is open for new transformers. Suppose the requirement is to skip a transformation when its input is shorter than a given length. What would need to change, and why does `TextTransformer` not help with this?

<!-- Potential unverified solution:

```typescript
import { test, expect } from "vitest";

interface TextTransformer {
    /**
     * Returns a transformed version of `text`.
     *
     * @param {string} text the input.
     * @returns {string} the transformed text.
     */
    transform(text: string): string;
}

/**
 * Applies each transformer in order, feeding the output of one into the next.
 *
 * @param {TextTransformer[]} transformers the steps, in order.
 * @param {string} text the starting text.
 * @returns {string} the text after every transformer has been applied.
 */
function applyAll(transformers: TextTransformer[], text: string): string {
    let result: string = text;
    for (const transformer of transformers) {
        result = transformer.transform(result);
    }
    return result;
}

class TrimTransformer implements TextTransformer {
    public transform(text: string): string {
        return text.trim();
    }
}

class UpperCaseTransformer implements TextTransformer {
    public transform(text: string): string {
        return text.toUpperCase();
    }
}

class PrefixTransformer implements TextTransformer {
    /** The text to put in front of every input. */
    private readonly prefix: string;

    /**
     * Creates a transformer that prepends `prefix`.
     *
     * @param {string} prefix the text to prepend.
     */
    public constructor(prefix: string) {
        this.prefix = prefix;
    }

    public transform(text: string): string {
        return this.prefix + text;
    }
}

class CapturingTransformer implements TextTransformer {
    /** Every input passed to transform, in the order received. */
    public readonly inputs: string[] = [];

    public transform(text: string): string {
        this.inputs.push(text);
        return text;
    }
}

test("trim then uppercase", () => {
    expect(applyAll([new TrimTransformer(), new UpperCaseTransformer()], "  hello  ")).to.equal("HELLO");
});

test("prefix then uppercase", () => {
    expect(applyAll([new PrefixTransformer("note: "), new UpperCaseTransformer()], "hello")).to.equal("NOTE: HELLO");
});

test("uppercase then prefix", () => {
    expect(applyAll([new UpperCaseTransformer(), new PrefixTransformer("note: ")], "hello")).to.equal("note: HELLO");
});

test("each transformer receives the accumulated text", () => {
    const afterTrim: CapturingTransformer = new CapturingTransformer();
    const afterUpper: CapturingTransformer = new CapturingTransformer();
    const steps: TextTransformer[] = [new TrimTransformer(), afterTrim, new UpperCaseTransformer(), afterUpper];
    expect(applyAll(steps, "  hello  ")).to.equal("HELLO");
    expect(afterTrim.inputs).to.deep.equal(["hello"]);
    expect(afterUpper.inputs).to.deep.equal(["HELLO"]);
});
```

1. Nothing outside `PrefixTransformer` changes: `applyAll` and the other transformers are untouched.
2. `applyAll` guarantees that the transformers run in list order, so a pipeline is defined by its order and not just by its members.
3. The `CapturingTransformer` test above shows each step receiving the accumulated text, not the original input.
4. Skipping short inputs is a rule about when a step applies, not about what a step does, and `TextTransformer` varies only the transformation. Either `applyAll` changes to know about lengths, and the pipeline is no longer closed, or the rule becomes a transformer itself: a wrapper that holds another `TextTransformer` and a minimum length, and returns the input unchanged when it is too short. The wrapper keeps `applyAll` closed by putting the new variation behind the existing interface.
-->

</details>
