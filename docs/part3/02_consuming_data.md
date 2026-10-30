# Consuming Data and Services by Using APIs

The previous chapter was about dependencies between classes we wrote. We could edit all of those classes. If a contract was wrong, we changed it, and if a class was awkward to depend on, we redesigned it. This chapter is about dependencies we cannot edit. The same habits apply: depend on a contract we own rather than on the class behind it, and receive dependencies through the constructor instead of creating them. An **API** is the contract that a body of code publishes for other code to call. In this chapter the API belongs to someone else: we call it, but we do not own it. APIs allow large systems to be built from code written by many different people. An API exposes functionality without exposing its implementation, so a program can use code written by others without having to understand how it works. Engineers spend much of their time reading, evaluating, and depending on APIs, and using them well is a distinct skill.

The next chapter takes the provider's position and designs an API for other clients to use. Being the client raises two problems. First, the data an API returns was constructed by code we did not write, so we cannot assume it satisfies our invariants until we check them. Second, the API we depend on can change, fail, or disappear.

## Two Kinds of API

The term API covers two situations that look different but share the same underlying idea.

A **library API** is code we `import` and call in our own process. Most systems use many libraries, for everything from date arithmetic to encryption, so that their authors do not have to build that functionality themselves. Library calls are fast and behave like any other function call: the code runs in our process, and either returns or throws. You will often need to judge whether a library is appropriate, and to work out quickly how it should and should not be used.

You have been using this skill since [Chapter 9](../part1/09_validation#from-checkexpect-to-expect). Every `expect(...).to.equal(...)` you have written is a call into Chai's `expect`, part of a library other engineers wrote, which the Vitest runner includes. You read its documentation when you chose between `to.equal` and `to.deep.equal`, and again when you looked up whether the assertion you wanted was `to.include` or `to.have.members`. You depended on its contract when you wrote `to.throw` and trusted it to run your function, catch the error, and compare the message. You have never seen its implementation, and have not needed to. The same is true of `readFile`, of `JSON.parse`, and of every array operation from Part 1. This chapter looks more closely at a skill you have been practising all term.

A **web service API** is code we call over HTTP. It runs in someone else's process, usually on a different machine. Web services usually provide higher-level operations than libraries. A library might parse a date, while a web service might report where a parcel is. A web service call leaves our machine and crosses a network. It may take a second or more, fail partway through, or return something we did not expect.

The design advice is the same for both kinds of API: depend only on what is documented, keep what you depend on small, and do not let the dependency spread through your code. The ways they fail are very different:

| | Library API | Web service API |
|---|---|---|
| Cost of a call | Usually too small to notice. | Milliseconds to seconds, visible to the user. |
| Failure | Throws, or returns a bad value. | May also time out, partly complete, or never answer. |
| Data | Typed by the compiler. | Arrives as text, and is typed only if you check it. |
| Changing under you | When you choose to install a new version. | Whenever the provider deploys. |
| Testing | Call it directly. | Needs a stand-in, unless tests call the real service over the network. |

The difference in how each kind of API changes drives much of the design in this chapter. A library changes only when we upgrade it, so we choose when that happens, and we can read its release notes before we decide. A web service changes when its provider deploys, which can happen at any time. The first sign of the change is often an error in production or a support ticket from a user.

## Unfamiliar APIs

Before depending on an API, you have to work out what it does.

_Start from the official documentation._ It is the only description of the API that the provider has committed to. Look for the available operations, the exact shapes of requests and responses, the errors that can be returned, the limits on how often you can make calls, and which version the documentation describes.

_The implementation is not the documentation._ For an open-source library, you can usually read the source code, which is useful when the documentation is unclear. However, behaviour you find in the source was never promised. If the documentation says a function returns the matching items, and the source happens to return them sorted, sorting is not part of the contract. Code that depends on the sorting depends on something the author can change without warning.

_Assume it will change._ Libraries publish new versions, and a new major version signals that something you rely on may have changed or been removed. A web service can change behind the same URL without any announcement. For both reasons, keep the part of the API you use small, and keep it behind an interface of your own, as the tracker does later in this chapter. Adapting to a change is then one edit rather than many.

<details class="tooltip deep-dive">
<summary>Using AI to Learn an API</summary>

An AI assistant can help you get started quickly with an unfamiliar API, but it can also mislead you. These tools can produce plausible code that calls functions that do not exist, passes parameters in the wrong order, or relies on behaviour from an out-of-date version. They present this code with the same confidence as correct code.

To use them well, treat their output as a starting point rather than an answer. Ask for links to the official documentation, then follow them and confirm that the function exists, takes those arguments, and behaves as described. If the assistant cannot provide a citation, or the documentation does not say what the assistant claimed, do not trust the code either.

This is the same rule as the rest of this section: depend on what the provider documents, regardless of how you found out about it.

</details>

#### A Tracker Across Several Carriers

This chapter and the rest of Part 3 use one running example. Later chapters follow the same system as it is published, cleaned up, debugged, and extended.

> As an online shopper, I want to see where all of my parcels are in one place, so that I do not have to visit a different website for every carrier.

A parcel tracker uses both kinds of API. Each carrier publishes its own web service, with its own URL scheme, its own JSON format, and its own vocabulary for what has happened to a parcel. The tracker also uses a library to check that a carrier's response has the shape its documentation describes. Everything the tracker shows a user therefore depends on code from outside the program.

```typescript
type ShipmentStatus = "in-transit" | "delivered" | "exception";

type Shipment = {
    trackingNumber: string;
    status: ShipmentStatus;
    /** When the carrier last saw the parcel. */
    lastSeenAt: number;
};
```

## Data Without Invariants

Until now, nearly every value we worked with was built by code we controlled. A `GuestList` could only come from the `GuestList` constructor, which let the constructor establish an invariant and the class preserve it. If a value existed, code we wrote had created it and checked it. A value that arrives from external code has no such guarantee. None of our constructors ran, and its type annotation is a claim rather than a fact. The carrier's response is a sequence of bytes that we hope describes a shipment. It might instead be an error page, an older version of the format, or a shipment whose status is a word we have never seen.

[Chapter 8](../part1/08_errors#results-or-exceptions) recommended checking data as soon as it enters your program, and turning it into either a trusted value or a clear error where it enters. This chapter calls that place the **edge**: the point in the code where data of unknown shape is converted into either a validated value or an error. As a design rule for this chapter:

Convert once, at the edge, into a typed value whose invariant holds. After that point, the rest of the program works only with values it can trust.

Code after the edge works with `Shipment` objects and never needs to consider JSON. A program without such an edge still needs the checks, but they end up spread throughout the program. Every function that touches a shipment then has to consider whether the status field is one of the three values the type promises.

<details class="tooltip link-110">
<summary>Data You Did Not Build</summary>

In CPSC 110, every value your functions consumed was constructed by your own code, usually a few lines earlier in the same file. A function that consumed a `ListOfSong` could rely on receiving one, because the only way to get a `ListOfSong` was to build it with the constructors from the data definition.

That reliability came from the setting rather than from the code. Once data arrives from a file, a service, or a user, the guarantee is gone. The value has whatever shape the outside world sent, and nothing ensures that it matches its data definition until some code checks it. Writing data definitions is still a useful habit. The new habit to add is checking that incoming values match them.

</details>

## JSON and the Type Hole

Carriers do not send us `Shipment` objects. They send text, usually in JSON, which you have already used in [Chapter 7](../part1/07_async#reading-and-writing-json) to move data between a program and a file. `JSON.stringify` turns a value into text, and `JSON.parse` turns text back into a value.

Two properties of JSON matter for this chapter. The first is what JSON can represent: strings, numbers, booleans, `null`, arrays, and objects with string keys. JSON has no `Date`, no `undefined`, no `Map` or `Set`, and no functions, so any other kind of value has to be encoded using those forms. This is why timestamps arrive as strings or numbers, and have to be interpreted when they are received.

The second property is what happens to our types when text is turned back into values. `JSON.parse` returns `any`, because the text is not known until runtime, so the compiler has nothing to inspect. The same is true of `response.json()`, which reads the body of a web service response. [Chapter 7](../part1/07_async#calling-web-services) used a line like this one:

```typescript
const report: StationReport = await response.json();
```

That line compiles, and it looks like every other typed assignment in the textbook, but the annotation is only a claim. We have told the compiler that `report` is a `StationReport`, and the compiler accepts this. From that point on, it type-checks every use of `report` without ever verifying that the claim is true. If the service returns a field named `temp` where we expected `tempCelsius`, the program compiles without errors. It then fails somewhere else, when code reads `tempCelsius` and gets an `undefined` that the type system said was a number.

<details class="tooltip ts-tips">
<summary><code>unknown</code> Versus <code>any</code></summary>

TypeScript has two types for a value whose type is not known, and they behave very differently.

`any` turns off the type checker for that value. Every property access, call, and assignment involving an `any` value compiles, whether or not it makes sense. `JSON.parse` returns `any`, which is why type safety is lost when JSON is parsed.

You have seen little of `any` so far because this course configures TypeScript and its lint rules to reject it, so the type checker cannot be turned off by accident in code you write. `any` can still enter your code through the return type of a function someone else wrote, such as `JSON.parse`, which is why this chapter discusses it.

`unknown` is the safe alternative. A value of type `unknown` can be stored and passed around, but it cannot be used for anything else until its type has been checked:

```typescript
const raw: unknown = JSON.parse(text);
raw.trackingNumber;                    // compile error: 'raw' is of type 'unknown'
```

This compile error is useful. `unknown` forces the check that `any` lets you skip. Annotating incoming data as `unknown` turns a hidden problem into a compile error on the line where validation is missing. Give incoming data the type `unknown`, and use a conversion function as the only way to turn it into a more specific type.

</details>

The same problem occurs whenever `as` is used on data from outside the program:

```typescript
const shipment: Shipment = JSON.parse(text) as Shipment;   // a claim, not a check
```

`as Shipment` tells the compiler something that has not been checked. It does not inspect the value, convert it, or reject anything. It skips the one check that matters here, whether the value has the claimed type, at the point where the data is least trustworthy. When a claim is applied to data from outside the program, any fault in that data will show up far from where it entered.

<details class="tooltip ts-tips">
<summary>The <code>as</code> Operator</summary>

This is the first time we have needed `as`. It tells the compiler that a value has a type the compiler could not work out on its own:

```typescript
<expression> as <Type>
```

`as` does much less than it appears to. It performs no conversion and runs no check. It produces no code at all. After compilation, the expression is unchanged, and the only difference is that the compiler no longer reports an error. At runtime, the value is whatever it was before, whether or not it has the claimed shape.

TypeScript calls this operator a _type assertion_. This chapter calls it a _claim_ instead, to avoid confusion with the `assert` checks from [Chapter 3](../part1/03_checking-invariants#precondition-violations). Those do the opposite. An `assert` tests a condition while the program runs, and halts when the condition is false. `as` tests nothing and cannot fail.

There is one narrow legitimate use, described in the next section, where the surrounding code has already established the fact being claimed. Everywhere else, using `as` to make a type error go away replaces a compile-time error with a failure at runtime.

</details>

## Converting, Not Claiming

Instead of making a claim, we can write a function that takes an `unknown` value and returns either a value we can trust or an explanation of what was wrong. The `Result` type from [Chapter 3](../part1/03_checking-invariants#erroneous-outcomes) is designed for this job:

<CollapsibleCode>

```typescript
/**
 * Converts an unvalidated response body into a Shipment.
 *
 * @param {unknown} raw the parsed body, of unknown shape.
 * @returns {Result<Shipment, string>} ok: true with a valid shipment, or
 * ok: false with a description of the first problem found.
 */
function toShipment(raw: unknown): Result<Shipment, string> {
    if (typeof raw !== "object") {
        return { ok: false, error: "response body is not an object" };
    }
    if (raw === null) {
        return { ok: false, error: "response body is null" };
    }
    const fields: { [key: string]: unknown } = raw as { [key: string]: unknown };

    const trackingNumber: unknown = fields.trackingNumber;
    if (typeof trackingNumber !== "string") {
        return { ok: false, error: "trackingNumber is missing or not a string" };
    }

    const status: unknown = fields.status;
    if (typeof status !== "string") {
        return { ok: false, error: "status is missing or not a string" };
    }
    const known: string[] = ["in-transit", "delivered", "exception"];
    if (known.includes(status) === false) {
        return { ok: false, error: "unrecognised status: " + status };
    }

    const lastSeenAt: unknown = fields.lastSeenAt;
    if (typeof lastSeenAt !== "number") {
        return { ok: false, error: "lastSeenAt is missing or not a number" };
    }

    return {
        ok: true,
        value: {
            trackingNumber: trackingNumber,
            status: status as ShipmentStatus,
            lastSeenAt: lastSeenAt
        }
    };
}
```

</CollapsibleCode>

<details class="tooltip ts-tips">
<summary><code>typeof</code> and Index Signatures</summary>

`typeof x` produces a string naming the kind of value `x` holds at runtime, such as `"string"`, `"number"`, `"boolean"` or `"object"`. Checking it narrows the type, as checking a discriminator did in [Chapter 2](../part1/02_model-types#branching-on-the-case). One quirk: `typeof null` is `"object"`, which is why the converter checks for `null` separately. The type `{ [key: string]: unknown }` describes an object with any string keys, whose values are not yet known.

</details>

The function is tedious to write, but its checks make the result trustworthy. It confirms that every field the type describes exists and has the right type. It also checks for an unrecognised status, because carriers do add new statuses over time. A value that passes these checks is a `Shipment` in the full sense that the rest of the program assumes, because its shape has been verified rather than claimed.

The error messages are also useful. The message "unrecognised status: held-at-depot" tells a maintainer what changed at the carrier and what to add. A claim would have produced a `Shipment` whose status was `held-at-depot`, even though the type does not allow that value. The failure would have appeared later, in code that reasonably assumed the status was one of the three allowed values.

<details class="tooltip deep-dive">
<summary>Claiming After Checking</summary>

The converter uses `as` twice, even though the previous section argued against it. Both uses come after a check that establishes the fact being claimed. `raw as { [key: string]: unknown }` follows two tests confirming that `raw` is a non-null object, and `status as ShipmentStatus` follows a test confirming that `status` is one of the three permitted strings. In each case, the claim tells the compiler something the code has already checked. The claim is needed because TypeScript's type narrowing cannot work out these particular conclusions on its own.

The important distinction is between a claim used instead of a check and a claim used after one. A claim used instead of a check is unverified, and nothing will ever verify it. A claim used after a check works around a limitation of the type checker, and the check makes the claim true. To tell them apart, look at the code above the `as` and ask whether it has already established what is being claimed.

</details>

## Using a Schema Library

Very little of `toShipment` is specific to shipments. It confirms that a value is an object, that a field is present, that the field holds a string rather than a number, and that the string is one of a permitted set. None of these checks are about parcel tracking. A converter for a different type would have almost the same lines, with different names.

Work that is repetitive, mechanical, and costly when done wrong is a good candidate for a library. Zod is a library for this job. A Zod **schema** is a value that describes the shape data must have:

```typescript
import { z } from "zod";

const ShipmentSchema: z.ZodObject<{
    trackingNumber: z.ZodString;
    status: z.ZodEnum<{ "in-transit": "in-transit"; delivered: "delivered"; exception: "exception" }>;
    lastSeenAt: z.ZodNumber;
}> = z.object({
    trackingNumber: z.string(),
    status: z.enum(["in-transit", "delivered", "exception"]),
    lastSeenAt: z.number()
});
```

The annotation names the type that Zod 4 gives this schema, field by field. The schema looks much like the `Shipment` type declaration. Instead of maintaining both, the type can be derived from the schema:

```typescript
type Shipment = z.infer<typeof ShipmentSchema>;
```

In a type position, `typeof ShipmentSchema` means the type of the `ShipmentSchema` value, and `z.infer` computes the TypeScript type that the schema accepts.

A hand-written type and a hand-written validator are two descriptions of the same data, and over time they tend to diverge. For example, someone might remove a status from `ShipmentStatus` and forget to remove it from the `known` array in `toShipment`. The converter would then accept a status that the type no longer allows, and the `as ShipmentStatus` claim would hide the problem from the compiler. Ordinary maintenance has reopened the type hole, and the code still looks correct. Deriving the type from the schema prevents this, because there is only one description, and the type is computed from it.

Validation then takes one call:

```typescript
function toShipment(raw: unknown): Result<Shipment, string> {
    const parsed: z.ZodSafeParseResult<Shipment> = ShipmentSchema.safeParse(raw);
    if (parsed.success === false) {
        return { ok: false, error: parsed.error.message };
    }
    return { ok: true, value: parsed.data };
}
```

The return type of `safeParse` has the same structure as the `Result` type, with different field names. It is a tagged union with a boolean field that says which case applies. One case carries the validated value, and the other carries an error. Both designs have this shape because it is a good way for an operation that can fail to make its caller handle the failure.

Zod also offers `parse`, which returns the value directly and throws when validation fails. These are the two mechanisms from [Chapter 8](../part1/08_errors#results-or-exceptions), and Zod lets the caller choose between them. Use `safeParse` when invalid data is a routine outcome that the immediate caller should handle. Use `parse` when invalid data should abort the current operation and be handled much further up. A well-designed library leaves this decision to its caller, and the next chapter returns to this idea when we design a library of our own.

The cost of using the library is a new dependency, and everything this chapter says about dependencies applies to it. Zod has versions, a new version can break existing code, and the library could be abandoned. The code shown here targets Zod 4, including the type names in its annotations, so check the current documentation before relying on this page. Deciding whether to use it is the usual trade-off. Validation is repetitive, easy to get subtly wrong, and harmful when wrong, so a well-maintained library is usually the better choice. Adding a dependency just to check that one number is positive is not.

<details class="tooltip deep-dive">
<summary>Schemas Beyond Shape</summary>

A schema library can check more than which fields exist. It can also check constraints that a TypeScript type cannot express, which are the kind of invariants Part 1 had to write in comments and enforce by hand:

```typescript
const ShipmentSchema: z.ZodObject<{
    trackingNumber: z.ZodString;
    status: z.ZodEnum<{ "in-transit": "in-transit"; delivered: "delivered"; exception: "exception" }>;
    lastSeenAt: z.ZodNumber;
}> = z.object({
    trackingNumber: z.string().min(1),
    status: z.enum(["in-transit", "delivered", "exception"]),
    lastSeenAt: z.number().int().nonnegative()
});
```

`z.number()` corresponds to the type `number`. `z.number().int().nonnegative()` corresponds to a documented invariant that no TypeScript type can express. The value came from outside the program, so the edge has to check the constraint anyway. That makes the edge a natural place to state the constraint once and enforce it automatically.

This connects to [Chapter 12](../part2/03_encapsulation#maintaining-the-invariant). Validation at the edge establishes an invariant on incoming data in the same way that a constructor establishes one on a new object. After that point, the value is known to satisfy a condition that the type alone cannot express.

</details>

## What Serialisation Loses

Turning a value into text so it can be stored or transmitted is called **serialisation**, and turning that text back into a value is **deserialisation**. `JSON.stringify` and `JSON.parse` are the serialisation functions we have been using.

JSON holds data but not behaviour, which causes problems whenever a class is involved, such as the `Set`-based `GuestList` from [Chapter 12](../part2/03_encapsulation#changing-representations):

```typescript
const stored: string = JSON.stringify(guests);                 // {"capacity":2,"invited":{}}
const restored: GuestList = JSON.parse(stored) as GuestList;   // no methods on this
```

Serialisation records an object's fields, but not its class or its methods. Deserialisation returns a plain object with the right property names and none of the behaviour. Calling a method on it fails at runtime, even though the claim made the code compile. The `Set` is worse: it serialises to `{}`, silently losing every guest. A `Map` does the same.

An object with behaviour therefore needs an explicit reconstruction step, which is another conversion function. The function reads the deserialised fields, validates them, and passes them to the real constructor. The object is then created the same way as every other instance, and its invariant is established the same way. Saving state to a file and reading it back is the same problem as reading a carrier's response, and it has the same solution.

A schema library does not change this. `safeParse` returns validated data and nothing more. Turning that data into an object with methods and a class invariant is still our job. It is easy to assume that a validation library has done more than it has, so be clear about the division of work. The schema establishes that the deserialised fields are present and well formed. The class's constructor establishes everything else the class guarantees.

<details class="tooltip deep-dive">
<summary>Other Exchange Formats</summary>

JSON is common but not universal. _XML_ is older than JSON. It represents a similar tree of data with a more verbose syntax, and is still widespread in older enterprise systems and in document formats. _Protocol buffers_ take a different approach. The message shape is declared in a schema file, both sides generate code from that schema, and the data is sent in a compact binary form rather than as text. Because of the schema, both sides agree on the shape in advance. The binary encoding is smaller and faster to parse, but it cannot be read without special tools.

The format changes the mechanics but not the principle. Whatever the format, the data came from somewhere you do not control, and some code has to check that it means what you expect before the rest of the program relies on it.

</details>

## Calling a Web Service

With a conversion function in place, we can call the web service. Most web service APIs roughly follow a convention called **REST**. Knowing the convention makes an unfamiliar API partly predictable before you read its documentation.

The central idea in REST is the **resource**: a thing the service knows about, identified by a URL. For example, a shipment might be identified by `/shipments/9K4T`. Operations on a resource are expressed with different HTTP methods on the same URL:

| Method | Means | Same effect if repeated? |
|---|---|---|
| `GET` | Read the resource | Yes; it changes nothing. |
| `POST` | Create something new | No; twice may create two. |
| `PUT` | Replace the resource | Yes; the result is the same either way. |
| `DELETE` | Remove the resource | Yes; once it is removed, it stays removed. |

The response includes a **status code** that says how the request went. The ranges matter more than the individual numbers. A `2xx` code means the request succeeded. A `4xx` code means the request was wrong, for example because of a bad tracking number or a missing key. A `5xx` code means the service failed while handling the request, which is a problem at the provider rather than a mistake by the client. The status code should shape how the client responds. A request that received a `4xx` will usually fail the same way if it is repeated, while a request that received a `5xx` might succeed on a later attempt.

A request sends data to the service in one of three places, and the convention is consistent enough to rely on. The path identifies the resource (`/shipments/9K4T`). The **query string** adjusts the request (`?includeHistory=true`). The **body** carries content for `POST` and `PUT`.

Reading a response uses `fetch` and `await` from [Chapter 7](../part1/07_async#calling-web-services):

```typescript
const response: Response = await fetch("https://api.carrier-a.example/shipments/9K4T");
const body: unknown = await response.json();
const shipment: Result<Shipment, string> = toShipment(body);
```

The difference from the version in Chapter 7 is the middle line. The body is given the type `unknown` rather than the type we hope it has, so the compiler requires us to pass it through `toShipment` before any other code can use it.

## Three Ways a Call Fails

A local function call either returns or throws. A call across a network can fail in three different ways, and code that handles only one of them will fail in production.

_The call does not complete._ The network might be down, the address might not resolve, or the connection might time out. There is no response to inspect. `fetch` rejects its promise, so the failure arrives as a thrown error at the `await`.

_A response arrives with an error status._ The service answered, but the status is `404` or `500`. This case is easy to get wrong, because `fetch` does not throw on an error status. It rejects only when it could not get a response at all. From `fetch`'s point of view, a `404` is a successful HTTP exchange, so the promise resolves, and the code continues with a body that contains an error message rather than a shipment. The status has to be checked explicitly:

```typescript
if (response.ok === false) {
    // 4xx or 5xx: a real answer, and not the one we wanted
}
```

_A successful response contains the wrong data._ The status is `200` and the body is well-formed JSON, but a field is missing or the status string is one we have never seen. Nothing went wrong in the network exchange. The problem is that the data does not match what the contract described. The converter exists to catch this kind of failure.

The class that talks to one carrier handles all three:

<CollapsibleCode>

```typescript
class CarrierAClient {
    /** The address of carrier A's web service, without a trailing slash. */
    private readonly baseUrl: string;

    /**
     * Creates a client for carrier A's web service.
     *
     * @param {string} baseUrl the service's address, without a trailing slash.
     */
    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Looks up one shipment through this carrier's web service.
     *
     * @param {string} trackingNumber the carrier's tracking number.
     * @returns {Promise<Result<Shipment, string>>} ok: true with the shipment,
     * or ok: false describing why it could not be retrieved.
     */
    public async track(trackingNumber: string): Promise<Result<Shipment, string>> {
        let response: Response;
        try {
            response = await fetch(this.baseUrl + "/shipments/" + trackingNumber);
        } catch {
            return { ok: false, error: "could not reach the carrier" };
        }

        if (response.ok === false) {
            return { ok: false, error: "carrier returned status " + response.status };
        }

        let body: unknown;
        try {
            body = await response.json();
        } catch {
            return { ok: false, error: "carrier response was not valid JSON" };
        }

        return toShipment(body);
    }
}
```

</CollapsibleCode>

Carrier A's responses use the tracker's three status words, so `CarrierAClient` can check them directly. The class for a carrier with its own words also translates them.

Each failure produces a different message, which a maintainer reading a log will need. The messages "could not reach the carrier", "carrier returned status 500", and "unrecognised status: held-at-depot" each call for a different response. Collapsing them into a single "tracking failed" message would discard the information that tells them apart.

Network calls have two other properties that local calls do not have.

_Latency cannot be hidden._ The call takes real time, so `track` is `async`, and so is every function that calls it, all the way up to the code that handles the user's click. [Chapter 7](../part1/07_async#async-and-await) described how `async` spreads to callers, and web services are where you will see this most often.

_A response is a snapshot._ The carrier told us where the parcel was at the moment we asked. By the time the answer is displayed, the parcel may have moved. Data fetched over a network may be out of date as soon as it arrives, and a design that treats it as current will eventually show a user incorrect information.

<details class="tooltip deep-dive">
<summary>Retrying Safely</summary>

A call that failed because of a timeout or a `5xx` might succeed if tried again, so retrying is a common and reasonable response. Whether retrying is _safe_ depends on what the call does.

An operation is **idempotent** when performing it twice has the same effect as performing it once, which is what the last column of the table above records. Retrying an idempotent operation is harmless.

`POST` is not idempotent, so a retry may create a second copy. Suppose the first request arrived and did its work, but the _response_ was lost. The client cannot tell this apart from a request that never arrived. Retrying would then book a second parcel and charge the customer twice.

In practice:

- Retry idempotent operations freely.
- Retry non-idempotent operations only when the API documents a way to make them safe. This is usually a key supplied by the caller, which the server uses to recognise a duplicate request.
- Wait between retries. A service that is already overloaded gets worse if every failed request is immediately sent three more times.

</details>

## Isolating Dependencies

So far, this chapter has considered a single call. The next design question is where in the program these calls should be made.

The simplest approach is to call `fetch` wherever a shipment is needed. This works, but it spreads knowledge of the carrier's URL scheme, JSON shape, status vocabulary, and error conventions across every file that displays a parcel. When the carrier changes any of these, every one of those files has to change. This is the ripple effect from [Chapter 17](./01_coupling#the-ripple-effect), caused by a dependency we have no control over.

The solution is the same one the previous chapter used: define the contract we want, and depend on that instead.

```typescript
/**
 * A source of shipment information for one carrier.
 */
interface CarrierClient {
    /**
     * Looks up the current state of one shipment.
     *
     * @param {string} trackingNumber the tracking number to look up.
     * @returns {Promise<Result<Shipment, string>>} ok: true with the shipment,
     * or ok: false describing why it could not be retrieved.
     */
    track(trackingNumber: string): Promise<Result<Shipment, string>>;
}
```

`CarrierAClient` already has this signature, so making it satisfy the contract only requires adding `implements CarrierClient`. Each carrier then gets an **adapter**: a class that implements `CarrierClient`, knows one carrier's URLs, JSON format, and vocabulary, and converts all of it into the `Shipment` type we defined. The differences between carriers are handled entirely inside the adapters.

```typescript
class CarrierAClient implements CarrierClient { /* as written above */ }
class CarrierBClient implements CarrierClient { /* the same job, a different carrier */ }
```

The tracker depends on the interface, never on a specific carrier:

<CollapsibleCode>

```typescript
class ParcelTracker {
    /** The carriers to ask, in the order they are asked. */
    private readonly carriers: CarrierClient[];

    /**
     * Creates a tracker that asks the given carriers.
     *
     * @param {CarrierClient[]} carriers the carriers to ask, in order.
     */
    public constructor(carriers: CarrierClient[]) {
        this.carriers = carriers;
    }

    /**
     * Finds a shipment by asking each carrier in turn.
     *
     * @param {string} trackingNumber the tracking number to look up.
     * @returns {Promise<Result<Shipment, string>>} ok: true with the first
     * carrier's shipment that matches, or ok: false listing each carrier's
     * reason when no carrier has it.
     */
    public async locate(trackingNumber: string): Promise<Result<Shipment, string>> {
        const problems: string[] = [];
        for (const carrier of this.carriers) {
            const found: Result<Shipment, string> = await carrier.track(trackingNumber);
            if (found.ok === true) {
                return found;
            }
            problems.push(found.error);
        }
        let reasons: string = "";
        for (const problem of problems) {
            if (reasons !== "") {
                reasons = reasons + "; ";
            }
            reasons = reasons + problem;
        }
        return { ok: false, error: "no carrier recognised " + trackingNumber + " (" + reasons + ")" };
    }
}
```

</CollapsibleCode>

When every carrier fails, `locate` keeps each carrier's reason in its message, so the distinctions the previous section argued for survive.

```plantuml
@startuml

hide empty members
skinparam groupInheritance 2

class ParcelTracker
interface CarrierClient
class CarrierAClient
class CarrierBClient
class StubCarrier

ParcelTracker o--> "*" CarrierClient
CarrierClient <|.. CarrierAClient
CarrierClient <|.. CarrierBClient
CarrierClient <|.. StubCarrier

CarrierClient : +track(trackingNumber: string): Promise<Result<Shipment, string>>

note bottom of StubCarrier
  tests use this one;
  no network involved
end note

@enduml
```
<!-- caption="The tracker depends on a contract we own, and each carrier is adapted to it." -->

The tracker contains no URLs, no JSON, and no code that uses HTTP. Supporting a new carrier means adding a new adapter without changing the tracker. This is the Open/Closed Principle from [Chapter 16](../part2/07_ocp#open-and-closed) applied to a dependency on another company's service.

## Supplying the Dependency

Some code must still decide which carriers exist and pass them to the tracker. `ParcelTracker` does not create them. It receives them through its constructor and uses whatever it is given. Passing a dependency in from outside, rather than constructing it internally, is called **dependency injection**. It is the usual way to apply the Dependency Inversion Principle introduced in [Chapter 16](../part2/07_ocp#the-principles-together).

The decision has to be made somewhere, and it is best to make it in one place at the program's entry point, called the **composition root**:

```typescript
// the one place in the program that names a concrete carrier
const tracker: ParcelTracker = new ParcelTracker([
    new CarrierAClient("https://api.carrier-a.example"),
    new CarrierBClient("https://api.carrier-b.example")
]);
```

This answers the question [Chapter 16](../part2/07_ocp#toward-evolution-and-scale) left open. Some code must always name concrete classes, so construction cannot be avoided. Instead, construction is gathered into a single place that the rest of the program does not depend on, and all other code names only contracts.

### Testing Without the Network

One immediate benefit is that the tracker becomes testable. A test that calls a real carrier is slow, needs credentials, fails when the carrier's service is down, and cannot produce unusual cases on demand. Because `ParcelTracker` accepts any `CarrierClient`, a test can supply one that answers immediately:

<CollapsibleCode>

```typescript
class StubCarrier implements CarrierClient {
    /** The result every call to track returns. */
    private readonly answer: Result<Shipment, string>;

    /**
     * Creates a stub that gives the same answer for every tracking number.
     *
     * @param {Result<Shipment, string>} answer the result track should return.
     */
    public constructor(answer: Result<Shipment, string>) {
        this.answer = answer;
    }

    /**
     * Returns the stub's fixed answer, whatever the tracking number.
     *
     * @param {string} trackingNumber ignored.
     * @returns {Promise<Result<Shipment, string>>} the answer given to the constructor.
     */
    public async track(trackingNumber: string): Promise<Result<Shipment, string>> {
        return this.answer;
    }
}

test("the tracker reports the first carrier that recognises the number", async () => {
    const delivered: Shipment = {
        trackingNumber: "9K4T",
        status: "delivered",
        lastSeenAt: 1000
    };
    const tracker: ParcelTracker = new ParcelTracker([
        new StubCarrier({ ok: false, error: "unknown to this carrier" }),
        new StubCarrier({ ok: true, value: delivered })
    ]);

    const found: Result<Shipment, string> = await tracker.locate("9K4T");

    expect(found).to.deep.equal({ ok: true, value: delivered });
});
```

</CollapsibleCode>

`StubCarrier` is a test double, like the ones in [Chapter 14](../part2/05_boundaries#test-doubles), and test doubles are especially useful for external services. A stub can also produce situations that a real service will not produce on request, such as a carrier that cannot be reached, a carrier that reports a status we do not recognise, or every carrier failing at once. These paths are easy to get wrong in production and hard to exercise with a test that calls a live service.

#### Consuming Deliberately

An API is a contract that we depend on but do not control. Both parts of that description create work for the client.

Because we do not control the API, the code that uses it should be small, clearly named, and kept in one place. An interface we own, with one adapter per provider, keeps a change by the provider from spreading through our code, and lets the whole system be tested without a network. Which adapters exist is decided once, at the composition root, so the rest of the program names only the contract. We also do not control the data the API returns, so that data satisfies no invariant until we establish one. `JSON.parse` does not check anything, and an `as` on incoming data is a claim rather than a check. The guarantees of Parts 1 and 2 apply again only after the edge where `unknown` data becomes a typed value.

Both practices have costs. A converter is tedious to write, an adapter is an extra class, and handling three kinds of failure takes more code than handling one. In return, the unpredictability of outside data and services is contained at the edge.

<details class="tooltip exercise">
  <summary>Exercise: Consuming a Currency Service</summary>

> As a traveller, I want to see prices from foreign shops in my own currency, so that I can tell whether something is a good deal without doing arithmetic.

A shop-comparison tool needs exchange rates. A service provides them at `GET https://rates.example.org/v1/latest?base=CAD`, and its documentation says it returns:

```json
{
  "base": "CAD",
  "retrievedAt": 1735689600000,
  "rates": { "USD": 0.74, "EUR": 0.68, "JPY": 111.2 }
}
```

A first attempt looks like this:

```typescript
type RateTable = {
    base: string;
    retrievedAt: number;
    rates: { [currency: string]: number };
};

async function getRates(base: string): Promise<RateTable> {
    const response: Response = await fetch("https://rates.example.org/v1/latest?base=" + base);
    return await response.json() as RateTable;
}
```

Work through the following:

1. _Name the failures._ List everything that can go wrong with this call. For each one, say whether this code detects it, and what the caller receives when it does not.
2. _Close the type hole by hand._ Rewrite `getRates` so that the body enters the program as `unknown`, and write the conversion function that turns it into either a `RateTable` or an error message. The `rates` field is the hardest part, because its keys are not known in advance, so every entry has to be checked to confirm that it maps a string to a number (`Object.keys(value)` lists an object's property names). Decide whether a rate of `0`, a negative rate, or an empty `rates` object should be accepted, and document the decision.
3. _Close it again with a schema._ Write a Zod schema for the same response, derive the `RateTable` type from it, and replace your converter with one call to `safeParse`. Compare the two versions: their length, how clearly each states the constraints from question 2, and what happens to each when the service adds a field.
4. _Choose an error mechanism._ Should `getRates` return a `Result` or throw? Justify your choice using the criteria from Chapter 8. The immediate caller is a price display that must show the user something either way. Say which of Zod's two methods matches your choice.
5. _Isolate it._ Define the interface the rest of the program should depend on, so that no other file mentions `fetch`, the URL, or the service's JSON shape. Explain what would have to change if the tool switched to a different rates provider, and what would not.
6. _Test it._ Write a test double for your interface and two tests that use it: one where rates are available, and one where the service is unreachable. Neither test may make a network call.
7. _Consider staleness._ A rate fetched an hour ago may no longer be correct. Describe one design that makes the age of the data visible to a caller. Say whether the existing `retrievedAt` field is enough to support it, and if not, what you would add to `RateTable`.

<!-- Potential unverified solution:

```typescript
import { describe, test, expect } from "vitest";
import { z } from "zod";

// Chapter 18 exercise: Consuming a Currency Service (questions 2, 3, 5 and 6)

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * A table of exchange rates relative to one base currency.
 */
type RateTable = {
    /** The ISO currency code the rates are relative to, such as "CAD". */
    base: string;
    /** When the service computed the rates, in milliseconds since the epoch. */
    retrievedAt: number;
    /** One rate per currency code: how many units of that currency one unit of base buys. Every rate is positive. */
    rates: { [currency: string]: number };
};

// Question 2: closing the type hole by hand.
// Decisions: a rate of 0 or below is rejected, since a non-positive multiplier cannot be
// a price; an empty rates object is accepted, since a table with no rates is still a
// well-formed answer, and the display will simply have nothing to convert.

/**
 * Converts an unvalidated response body into a RateTable.
 *
 * @param {unknown} raw the parsed body, of unknown shape.
 * @returns {Result<RateTable, string>} ok: true with a valid table, or ok: false
 * with a description of the first problem found.
 */
function toRateTable(raw: unknown): Result<RateTable, string> {
    if (typeof raw !== "object") {
        return { ok: false, error: "response body is not an object" };
    }
    if (raw === null) {
        return { ok: false, error: "response body is null" };
    }
    const fields: { [key: string]: unknown } = raw as { [key: string]: unknown };

    const base: unknown = fields.base;
    if (typeof base !== "string") {
        return { ok: false, error: "base is missing or not a string" };
    }

    const retrievedAt: unknown = fields.retrievedAt;
    if (typeof retrievedAt !== "number") {
        return { ok: false, error: "retrievedAt is missing or not a number" };
    }

    const rates: unknown = fields.rates;
    if (typeof rates !== "object") {
        return { ok: false, error: "rates is missing or not an object" };
    }
    if (rates === null) {
        return { ok: false, error: "rates is null" };
    }
    const entries: { [key: string]: unknown } = rates as { [key: string]: unknown };
    const checked: { [currency: string]: number } = {};
    for (const currency of Object.keys(entries)) {   // Object.keys lists an object's property names
        const rate: unknown = entries[currency];
        if (typeof rate !== "number") {
            return { ok: false, error: "rate for " + currency + " is not a number" };
        }
        if (rate <= 0) {
            return { ok: false, error: "rate for " + currency + " is not positive" };
        }
        checked[currency] = rate;
    }

    return { ok: true, value: { base: base, retrievedAt: retrievedAt, rates: checked } };
}

// Question 3: the same checks as a schema. The type is derived from the schema.
const RateTableSchema: z.ZodObject<{
    base: z.ZodString;
    retrievedAt: z.ZodNumber;
    rates: z.ZodRecord<z.ZodString, z.ZodNumber>;
}> = z.object({
    base: z.string(),
    retrievedAt: z.number(),
    rates: z.record(z.string(), z.number().positive())
});

type RateTableFromSchema = z.infer<typeof RateTableSchema>;

function toRateTableWithSchema(raw: unknown): Result<RateTableFromSchema, string> {
    const parsed: z.ZodSafeParseResult<RateTableFromSchema> = RateTableSchema.safeParse(raw);
    if (parsed.success === false) {
        return { ok: false, error: parsed.error.message };
    }
    return { ok: true, value: parsed.data };
}

// Question 5: the contract the rest of the program depends on.
/**
 * A source of current exchange rates.
 */
interface RateSource {
    /**
     * Fetches the latest rates relative to a base currency.
     *
     * @param {string} base the ISO code of the base currency.
     * @returns {Promise<Result<RateTable, string>>} ok: true with the table, or
     * ok: false describing why no table could be obtained.
     */
    latest(base: string): Promise<Result<RateTable, string>>;
}

/** The adapter: the only file that knows the URL, fetch, and the service's JSON shape. */
class RatesServiceClient implements RateSource {
    /** The service's address, without a trailing slash. */
    private readonly baseUrl: string;

    /**
     * Creates a client for the rates service.
     *
     * @param {string} baseUrl the service's address, without a trailing slash.
     */
    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async latest(base: string): Promise<Result<RateTable, string>> {
        let response: Response;
        try {
            response = await fetch(this.baseUrl + "/v1/latest?base=" + base);
        } catch {
            return { ok: false, error: "could not reach the rates service" };
        }
        if (response.ok === false) {
            return { ok: false, error: "rates service returned status " + response.status };
        }
        let body: unknown;
        try {
            body = await response.json();
        } catch {
            return { ok: false, error: "rates service response was not valid JSON" };
        }
        return toRateTable(body);
    }
}

/** Shows a foreign price in the traveller's currency; depends only on RateSource. */
class PriceDisplay {
    /** Where the display gets its rates. */
    private readonly rates: RateSource;

    /**
     * Creates a display that converts with the given source.
     *
     * @param {RateSource} rates the source of exchange rates.
     */
    public constructor(rates: RateSource) {
        this.rates = rates;
    }

    /**
     * Describes a foreign price in the home currency.
     *
     * @param {number} amount the price in the foreign currency.
     * @param {string} foreign the foreign currency's ISO code.
     * @param {string} home the traveller's currency's ISO code.
     * @returns {Promise<string>} the converted price, or a message saying why it is unavailable.
     */
    public async describe(amount: number, foreign: string, home: string): Promise<string> {
        const table: Result<RateTable, string> = await this.rates.latest(home);
        if (table.ok === false) {
            return "rates unavailable (" + table.error + ")";
        }
        const rate: number | undefined = table.value.rates[foreign];
        if (rate === undefined) {
            return "no rate for " + foreign;
        }
        return "about " + (amount / rate) + " " + home;
    }
}

// Question 6: a test double and two tests that make no network call.
class StubRates implements RateSource {
    /** The answer every call returns. */
    private readonly answer: Result<RateTable, string>;

    /**
     * Creates a source that always gives the same answer.
     *
     * @param {Result<RateTable, string>} answer the result latest should return.
     */
    public constructor(answer: Result<RateTable, string>) {
        this.answer = answer;
    }

    public async latest(base: string): Promise<Result<RateTable, string>> {
        return this.answer;
    }
}

const sample: RateTable = { base: "CAD", retrievedAt: 1735689600000, rates: { USD: 0.74, EUR: 0.68, JPY: 111.2 } };

describe("PriceDisplay", () => {
    test("converts when rates are available", async () => {
        const table: RateTable = { base: "CAD", retrievedAt: 1735689600000, rates: { USD: 0.5 } };
        const display: PriceDisplay = new PriceDisplay(new StubRates({ ok: true, value: table }));
        expect(await display.describe(37, "USD", "CAD")).to.equal("about 74 CAD");
    });

    test("says why when the service is unreachable", async () => {
        const display: PriceDisplay = new PriceDisplay(
            new StubRates({ ok: false, error: "could not reach the rates service" })
        );
        expect(await display.describe(37, "USD", "CAD")).to.equal("rates unavailable (could not reach the rates service)");
    });
});

describe("toRateTable", () => {
    test("accepts the documented response", () => {
        expect(toRateTable(JSON.parse('{"base":"CAD","retrievedAt":1735689600000,"rates":{"USD":0.74,"EUR":0.68,"JPY":111.2}}')))
            .to.deep.equal({ ok: true, value: sample });
    });
    test("rejects a non-numeric rate", () => {
        expect(toRateTable({ base: "CAD", retrievedAt: 1, rates: { USD: "0.74" } }))
            .to.deep.equal({ ok: false, error: "rate for USD is not a number" });
    });
    test("rejects a zero rate and accepts an empty table", () => {
        expect(toRateTable({ base: "CAD", retrievedAt: 1, rates: { USD: 0 } }).ok).to.equal(false);
        expect(toRateTable({ base: "CAD", retrievedAt: 1, rates: {} }).ok).to.equal(true);
    });
    test("the schema version agrees on all of these", () => {
        expect(toRateTableWithSchema(sample)).to.deep.equal({ ok: true, value: sample });
        expect(toRateTableWithSchema({ base: "CAD", retrievedAt: 1, rates: { USD: "0.74" } }).ok).to.equal(false);
        expect(toRateTableWithSchema({ base: "CAD", retrievedAt: 1, rates: { USD: 0 } }).ok).to.equal(false);
        expect(toRateTableWithSchema({ base: "CAD", retrievedAt: 1, rates: {} }).ok).to.equal(true);
        // an added field passes through the hand-written converter (dropped) and the schema (stripped)
        expect(toRateTableWithSchema({ base: "CAD", retrievedAt: 1, rates: {}, source: "ecb" }).ok).to.equal(true);
    });
});
```

Model answers for the discussion parts.

1. _Name the failures._ The network is down or the host does not resolve: `fetch` rejects, nothing catches it, and the caller receives a rejected promise. The service answers with an error status: not detected, `response.json()` parses the error body (or rejects if it is not JSON), and the caller receives whatever that was, labelled a `RateTable`. The body is not valid JSON: `response.json()` rejects, uncaught. The body is JSON of the wrong shape (a missing `rates`, rates sent as strings, a renamed field in a new version): not detected, because the `as` claim hands the caller a value typed `RateTable` that is not one, and the failure appears later, for example as `NaN` prices. An unknown base currency: whatever the service does about it (a `400`, or an empty `rates`), the code treats it like any other response. Stale data is not a failure of the call; see question 7.
2. See `toRateTable` above. Decisions: a rate of `0` or below is rejected, because a non-positive multiplier cannot be a price; an empty `rates` object is accepted, because a table with no rates is still a well-formed answer and the display simply has nothing to convert.
3. See `RateTableSchema` above. The schema version is a few lines against about thirty. Its constraints are stated once, where the field is declared (`z.number().positive()`), and read as a description rather than a sequence of checks. When the service adds a field, both versions accept the response: the hand-written converter copies only the fields it knows, and Zod strips unknown keys. When the service renames or removes a field, both reject it with a message; Zod's names the path.
4. Return a `Result`. The immediate caller is the price display, which must show something either way, so an unavailable rate is a routine outcome handled right where it is detected (Chapter 8's case for a failure value) and nothing further up needs to abort. That matches `safeParse`; `parse` would suit a batch job where a bad response should abort the run and be handled far above.
5. See `RateSource` and `RatesServiceClient` above. Switching provider means one new adapter (its URL, its JSON shape, its converter) and one line in the composition root. `RateSource`, `PriceDisplay`, its tests and `StubRates` do not change.
6. See `StubRates` and the two `PriceDisplay` tests above; neither touches the network.
7. _Consider staleness._ Record when the table was obtained and expose it, so a caller can show "rates as of 10:42" or refuse to convert when the table is older than a threshold. `retrievedAt` says when the service computed the rates, in the service's clock, which is a claim we did not make and cannot check against ours. Add our own `fetchedAt: number` (milliseconds since the epoch, our clock) to `RateTable`, set by the adapter from a time it is given rather than reads (controllability, Chapter 12), and keep `retrievedAt` as the service's statement.
-->

</details>
