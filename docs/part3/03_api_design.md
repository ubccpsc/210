# Designing APIs to Provide Data and Services

As clients of  APIs in the previous chapter, we wanted four things: a surface small enough to learn and depend on, errors we could act on, accurate documentation, and no changes without warning. In this chapter, we are the ones creating, publishing, and evolving the API, and our clients will want the same four things from us.

The implications of our API design depends on our clients. In [Part 2](../part2/index), all client code was our own design. Because we owned this client code, we could do whatever changes we like: if a method name was wrong, we renamed it, and the compiler listed the places to fix. Once we publish an API, we cannot do this: a published API's clients are people (or agents!) we cannot see, contact, or coordinate with, and they will depend on whatever we ship, including the parts we exposed by accident. 

This has two consequences.

The first is that a published API is close to permanent. Clients will eventually depend on anything they can reach. Once they do, removing it breaks someone's working code, despite the fact they did nothing wrong. A design mistake costs more than an afternoon of refactoring for us, because it breaks other people's systems.

The second is that the users of an API are engineers, so an API is a user interface and should meet the same standards. It should be easy to use, so that the common task is the obvious one. It should also be hard to misuse, so that an incorrect call is difficult to write and easy to notice.

## Publishing the Tracker

Let's continue the package tracking example, but from the provider's side.

> As a platform team, we want to publish parcel tracking in a form other teams can build on, so that every product team does not have to integrate with every carrier separately.

The adapters from the previous chapter turn out to be useful beyond the application we built them for. Two other teams want parcel tracking, so we publish it in two forms:

- As a library, `@parcel/tracking`, which other teams in the company add to their dependencies and `import`. Their code compiles against ours.
- As a web service, an endpoint others call over HTTP. For example, if someone is building a mobile app in Swift, their Swift application cannot import our TypeScript.

The two differenct services provide the same core functionality. 
```plantuml
@startuml

hide empty members
skinparam groupInheritance 2

package "@parcel/tracking (published)" {
  class ParcelTracker
  interface CarrierClient
}

package "internal (never exported)" {
  class CarrierAClient
  class ShipmentSchema
}

class TrackingEndpoint

ParcelTracker o--> "*" CarrierClient
CarrierClient <|.. CarrierAClient
CarrierAClient ..> ShipmentSchema
TrackingEndpoint ..> ParcelTracker

note bottom of TrackingEndpoint
  the mobile app calls this;
  it cannot import TypeScript
end note

@enduml
```
<!-- caption="One core with two published faces: a library other teams import, and a service the app calls." -->

Before designing anything, note that a published API includes more than the operations we documented, because clients depend on whatever they can observe. This includes:
- the order of results,
- the exact wording of an error message, 
- the fact that a call happens to be fast, or
- a field we left in a response because removing it seemed unnecessary. 


Even if we didn't mean these to be promises, each of these becomes a promise as soon as someone writes code that depends on it. This observation is known as **Hyrum's law**, after Hyrum Wright, the engineer who described it.

<details class="tooltip deep-dive">
<summary>Hyrum's Law</summary>

Hyrum's law is an observation rather than a rule, but it has a practical meaning for a designer. Publishing an API creates two contracts. One is the contract you wrote. The other, larger one consists of everything a client can detect. You are responsible for the first, and constrained by the second. Surprising breakages come from the gap between them.

</details>



## Choosing the Surface

The first design decision is the formal interface the client sees. Adding an operation later is easy and does not affect existing clients, but removing one is a **breaking change**: a change after which existing client code no longer works as it did.

For a TypeScript library, we can declare the surface in one file. The contract is whatever that file exports. We've seen exports in all the code we've written to be tested, but we can also write one file that unifies exports:

```typescript
// index.ts: the entire public contract of @parcel/tracking
export { ParcelTracker } from "./ParcelTracker";
export { createTracker } from "./createTracker";
export type { Shipment, ShipmentStatus } from "./Shipment";
export type { TrackingRequest } from "./TrackingRequest";
export type { TrackingError } from "./TrackingError";
export type { Result } from "./Result";
export type { CarrierClient } from "./CarrierClient";
```

Above, each line re-exports a name defined in another file, and `export type` re-exports a name that is only a type. This file exports eight names. 

Notice we have not exported `CarrierAClient`.  `CarrierAClient` and the schema are part of how the library does its job, not part of what it promises, so we avoid exporting them to maintain implementation freedom. A client that cannot use `CarrierAClient` cannot come to depend on it, so we can rewrite, rename, or delete it without affecting anyone. 

Clients still need working carriers, so `createTracker` returns a `ParcelTracker` that is already configured with every carrier the library supports. `createTracker` is the library's composition root. `CarrierClient` is exported so that clients can supply their own carriers when they need to, such as the test doubles from the previous chapter:

```typescript
// exported: what a client implements to supply its own carrier
export interface CarrierClient {
    /**
     * Looks up the current state of one shipment.
     *
     * @param {string} trackingNumber the tracking number to look up.
     * @returns {Promise<Result<Shipment, TrackingError>>} ok: true with the
     * shipment, or ok: false with one of the documented TrackingError cases.
     */
    track(trackingNumber: string): Promise<Result<Shipment, TrackingError>>;
}
```

Notice `CarrierClient` reports failures with `TrackingError` instead of a string---that's to make errors easier to handle in the client, see [Designing the Failures](#designing-the-failures) below. 

When choosing what to export, there are two common mistakes to avoid.

_Do not export internal types for convenience._ It is tempting to export a helper because a test needs it, or because exporting it is easier than organising the code properly. Every export is permanent, and a type exported for our convenience becomes a type we must maintain for our clients.

_Do not let a dependency's types into the signature._ The previous chapter used Zod to validate carrier responses, and derived `Shipment` from the schema with `z.infer`. If our published signature mentions a Zod type, then Zod's next major version becomes our breaking change, and our clients are forced to upgrade a library they didn't want to depend on. To avoid this, we should define our own types at the boundary and keep the dependency internal:

```typescript
// exported: a type we own and control
export type Shipment = {
    trackingNumber: string;
    status: ShipmentStatus;
    /** When the carrier last saw the parcel. */
    lastSeenAt: number;
};
```

This stops the dependency from leaking over the boundary. 

The speculative generality warning from [Chapter 16](../part2/07_ocp#the-axis-of-change) still applies. An option that nobody asked for, added because it might be useful, is a promise we have to keep for as long as the API is used.

## Easy to Use, Hard to Misuse

The second consequence from the opening is that an API's users are engineers working under time pressure. How do we make an API easy for them to use correctly? We suggest four things.

_Use clear and succinct names._ Names are the only documentation _everyone_ reads. A client sees a name in an autocomplete list, and then again every time they read their own code.  A name  cannot be changed later without breaking clients. `locate` and `getShipmentTrackingInformation` describe the same operation, but the shorter name is easier to read every time it appears.

_Make the wrong call hard to write._ Suppose the first published version had a `find` that took a carrier and a tracking number:

```typescript
public find(carrierId: string, trackingNumber: string): Promise<Result<Shipment, TrackingError>> { /* ... */ }
```

Both parameters are strings, so the compiler cannot tell them apart: the call `find("9K4T", "carrier-a")` compiles, and the mistake appears only at runtime. One way to make this mistake catchable at compile time is to use an options object:

```typescript
// exported: the request a client passes to locate
export type TrackingRequest = {
    /** The tracking number to look up. */
    trackingNumber: string;
    /** The carrier to ask; omit to ask every carrier in turn. */
    carrierId?: string;
};

public locate(request: TrackingRequest): Promise<Result<Shipment, TrackingError>> { /* ... */ }
```

```typescript
tracker.locate({ carrierId: "carrier-a", trackingNumber: "9K4T" });
```

The request also makes `carrierId` optional. A client that does not know the carrier can leave it out, and the tracker then asks each carrier in turn, as `locate` did in the previous chapter.

<details class="tooltip ts-tips">
<summary>Optional Parameters and Option Objects</summary>

API calls tend to gain settings over time, such as a timeout, a page size, or whether to include history. Two pieces of syntax help with this.

A parameter can be made **optional** by adding `?` after its name. Inside the function, an optional parameter may be `undefined`:

```typescript
function track(trackingNumber: string, includeHistory?: boolean): void {
    if (includeHistory === undefined) {
        // caller did not say; choose a default
    }
}
```

When there is a sensible default, a default parameter value is a better option: `includeHistory: boolean = false`. Default parameter values were introduced in [Chapter 13](../part2/04_flexibility#immutable-values), where the `ImmutableGuestList` constructor declared `guests: string[] = []`.

With more than two or three settings, both forms become hard to read at the call site, because a call like `track("9K4T", true, false, 30)` does not say what each argument means. The usual convention is to collect the settings into a single **options object**:

```typescript
type TrackOptions = {
    includeHistory?: boolean;
    timeoutMs?: number;
};

function track(trackingNumber: string, options: TrackOptions = {}): void { /* ... */ }
```

The `?` after a property name marks an optional property in the same way, as in `TrackingRequest`'s `carrierId?: string`. The call then names each setting it uses: `track("9K4T", { includeHistory: true })`. This addresses the problem [Chapter 17](./01_coupling#degrees-of-coupling) raised with boolean parameters, because each setting is labelled at the call site.

</details>

We can also use value objects from [Chapter 13](../part2/04_flexibility#immutable-values) to represent the options, which gives us a little more power to push issues to compile time. 

<!---- CL: IDK I don't really get what the point was here, removing

That said, we can make the API even safer using value objects from [Chapter 13](../part2/04_flexibility#immutable-values) to represent the options. 

If the two arguments have different types, swapping them no longer compiles. Because TypeScript compares types by shape (see the structural typing deep-dive in [Chapter 14](../part2/05_boundaries#implementing-the-contract)), the two classes must differ in shape for this to work, for example by each having its own `private` field. The options object makes a swap visible at the call site, and value objects make the compiler reject it. Both follow the same principle: when a mistake is possible, prefer a design that exposes or prevents it over documentation that warns against it.
---->

_Be consistent across the surface._ Argument order, naming, and error handling should be the same everywhere, because clients learn an API from their first few calls and then generalise. If `findShipment` returns `null` but `findCarrier` throws an exception, the design is not predictable, and clients have to look up every operation individually.

_Decide how to represent absence._ Whether "no such shipment" is `null`, an empty array, or an error is a design choice. Any of these can work, but you should choose only one representation, state it in the documentation, and apply it to every operation.

## Designing the Failures

Failure is part of the contract. Clients have to handle errors when things go wrong, and they can only handle the errors we have told them about. 

In [Chapter 8](../part1/08_errors#results-or-exceptions) we saw two mechanisms for reporting failure: returning a failure value and throwing an exception. Both are reasonable options, but in line with the "be consistent" advice above, we should make the choice consistent across a published API. We also need the errors to carry enough information for clients to respond. We'll choose to keep the `Result` return type from the previous chapter for our tracker, so the capacity for failure appears in each API's signature.  

In the previous chapter, `locate` reported each failure as a string. For a published API, a message alone is likely not enough information. Suppose the only difference between "we do not recognize that tracking number" and "the carrier is not responding" is the English text. A client that wants to retry the second error but not the first has to match on the text, and if we reword the text in the next message (or translate it), the client will break. Instead of a string, we can use a tagged union from [Chapter 2](../part1/02_model-types#playlists), to encode the differences clearly:

```typescript
export type TrackingError =
    | { kind: "malformed-tracking-number"; reason: string }
    | { kind: "unknown-tracking-number" }
    | { kind: "carrier-unavailable"; carrier: string };
```

A carrier whose response does not convert, the third of the previous chapter's ways a call fails, is also reported as `carrier-unavailable`, since it has not supplied a usable answer. A client can now branch on `kind`, which we now promise. We are now free to change the wording of any human-readable message, because no client depends on it.

<details class="tooltip deep-dive">
<summary>Adding a Failure Is a Breaking Change</summary>

There is an asymmetry here that is easy to miss. Adding an operation to an API is safe, but adding a new failure case to an existing operation usually is not. A client that handles the three cases above has code that is complete today. If we publish a fourth `kind`, that code becomes incomplete. It still compiles, because nothing requires it to handle every case, and at runtime none of its branches match the new case. The client did nothing wrong and received no warning.

We can add failure cases, but we should treat this like any other breaking change. It needs a version bump, an announcement, and documentation that told clients in advance whether the set of failures was complete. An API that says "these are the only errors this operation produces" makes a much stronger promise than one that says "these errors include", and the two should not be confused.

</details>

## Documenting the Contract

Documentation describes the API, not its implementation. For a client, the documentation is the API. Any behaviour that is not documented may change without warning.

This determines what has to be documented. Each operation needs its purpose, its parameters, what it returns, what failures it can produce, and any effects it has beyond returning a value:

```typescript
/**
 * Looks up the current state of one shipment.
 *
 * When the request names a carrier, only that carrier is asked. Otherwise,
 * carriers are consulted in the order they were supplied, and the first
 * recognizing the tracking number wins. The result reflects the carrier's
 * information at the moment of the call and may be out of date immediately.
 *
 * @param {TrackingRequest} request the tracking number to look up, and
 * optionally the carrier to ask.
 * @returns {Promise<Result<Shipment, TrackingError>>} ok: true with the
 * shipment, or ok: false with one of the documented TrackingError cases.
 */
public locate(request: TrackingRequest): Promise<Result<Shipment, TrackingError>> { /* ... */ }
```

Notice the documentation states what the client may and may _not_ rely on. Saying "carriers are consulted in the order they were supplied" means we promise to always use this order. Now that it is documented, we cannot query the carriers in any other order.

Conversely, by saying "the result may be out of date immdeiately", we refuse to promise freshness, which leaves us free to add an optimization that saves recent queries (and returns them rather than making fresh ones) breaking anyone. 

Stating what is _not_ promised is important: it allows us to deliberately narrow the gap between the written contract and the observable one.

<details class="tooltip deep-dive">
<summary> Other Important Documentation </summary>

Clients also need help getting started. Most people evaluating a library read one example and then decide whether to continue, so a README that explains what the library is for, how to install it, and what a typical call looks like is more important than any individual signature. For a web service, a written specification of the routes plays the same role.
</details>



## Breaking Changes

An important skill is judging, before publishing an updated version of an API, whether a change will break an existing client. In general, accepting more input and adding to what you return are safe, while narrowing, removing, or renaming are not:

| Change | Effect on clients |
|---|---|
| Add a new operation | Safe |
| Add an optional parameter | Safe |
| Add a field to a returned object | Usually safe |
| Accept an input you previously rejected | Safe |
| Rename an operation, parameter, or field | Breaking |
| Remove anything | Breaking |
| Add a required parameter | Breaking |
| Reject an input you previously accepted | Breaking |
| Change a field's type | Breaking |
| Add a failure case to an operation | Breaking |

Most of the breaking changes in that table alter a signature, so the compiler or the client's tests will find them. The more dangerous changes are those that keep the signature identical but change
what the code does, for example by:

- tightening validation, so that input which used to be accepted now fails; 
- changing the meaning of a field while keeping its name and type (such as a `lastSeenAt` that switches from the carrier's local time to UTC);
- changing the order of results a client had come to rely on;
- rewording an error message that somebody is matching on; or even
- making a slow operation fast (when previously, it being slow meant that e.g. the website element would always be loaded by the time it was done).

None of these changes cause a compile error, but each one can break a client's code. 

As an example, let's consider the "changing the meaning of a field" case. Say we notice a defect in our own code:  `lastSeenAt` had been recording the carrier's local time, and it should have been UTC. We fix this, preserving `lastSeenAt`'s name and type. 


However, a client has been reading `lastSeenAt` to show how long a parcel has been sitting in one place. `lastSeenAt` was in the carrier's local time, so the client's code adjusts for the offset :

```typescript
// in a client's code, written against version 2.3
const shipment: Shipment = result.value;
// lastSeenAt is in Carrier A's local time, eight hours behind UTC
const localOffsetMs: number = 8 * 3600000;
const hoursSinceSeen: number = (Date.now() - (shipment.lastSeenAt + localOffsetMs)) / 3600000;
if (hoursSinceSeen > 48) {
    flagAsStale(shipment);
}
```

The client's code still compiles, still runs, and still produces a number. But the client is still adding the eight-hour offset, so the number is now eight hours too small. A parcel that has been sitting for 48 hours is not flagged as stale until it has been sitting for 56.

None of the usual ways of catching mistakes prevented this failure. The compiler sees no change. *Our* tests pass, because we updated them in the same commit that changed the behaviour. That is the correct thing to do for a bug fix, but it also hides the problem. The client's test might still be passing, if they built test data using the old convention! 

When a fix would break clients who adapted to the old behaviour, there are only a few options:

- _Fix the code and treat it as a breaking change_, with a major version, release notes that describe the old and new behaviour, and enough notice for clients to adapt.
- _Fix the code in a new version of the operation_, leaving the old behaviour available for clients who need time, and deprecating it on the schedule described below.
- _Fix the documentation and leave the code alone_, when the behaviour is harmless and the cost of changing it is greater than the cost of the confusion. A documented oddity is a smaller problem than an undocumented one. Changing a published API has such a large impact that this option is chosen more often than you might expect.

The **robustness principle**, often stated as "be liberal in what you accept, conservative in what you send", is guidance on how to evolve an API safely.  Accepting more input is a safe way to evolve an API; and sending less than you promised is not. The usual criticism of the principle is that accepting too much lets clients come to depend on undocumented leniency. Tightening validation later then becomes a breaking change, of the kind listed above that no compiler catches.

### Versioning

Breaking changes cannot be avoided forever. A version number lets a client find out about a breaking change before it reaches production.

For libraries, the convention is **semantic versioning**. In semantic versioning, we label versions as `major.minor.patch` (e.g. `2.4.1`), where: 
- the major number (e.g. 2) changes when something breaks, so a client knows to read the release notes and expect work; 
- the minor number (e.g. 4) changes when functionality is added in a compatible way, so upgrading should cause no problems; and
- the patch number (e.g. 1) changes for compatible fixes. 

However, this is only a convention; it is not enforced by the programming language. 

For web services, the version usually appears in the path, as in `/v1/shipments/9K4T`. This allows an incompatible `/v2` to be introduced while `/v1` keeps running.

### Deploying a Breaking Change

Regardless of whether we are building a library or web-service API
we need to follow the same steps to deploy a breaking change

First, we must announce the _deprecation_ of the previous behaviour.
A _deprecated_ behaviour is one that we anticipate to remove. In the same place we warn about the deprecation, we should announce the change, usually the new behaviour clients can use. Usually we do this in documentation:

```typescript
/**
 * Looks up one shipment, given the carrier and the tracking number as
 * separate arguments.
 *
 * @deprecated Use `locate` with a TrackingRequest instead. `find`
 * will be removed in version 3.0.
 */
public find(carrierId: string, trackingNumber: string): Promise<Result<Shipment, TrackingError>> { /* ... */ }
```
...and sometimes, we may add logging statements to the old code, so anyone who runs it sees in their logs that a behaviour is deprecated. 

Then, we must keep several versions that have both the old and new behaviour.

Finally in a major version change, we remove the old behaviour.


As an example, replacing `find` looks like this:

1. _2.4.0._ Ship `locate(request)` alongside `find`, and mark `find` `@deprecated`, with its replacement and the version that will remove it. Nothing has broken, so a minor version bump is correct. Clients see the old operation crossed out in their editor the next time they call it.
2. _2.4.0 through 2.9.x._ Both operations ship. Each set of release notes repeats the deprecation, because the client who most needs to read it is the one who skipped four versions.
3. _3.0.0._ Remove `find`. The major version number tells clients that work is required before upgrading, and by this point the warning has been in their editor for months.

There is often pressure to shorten the middle step. But removing it too early turns a manageable migration into an outage. Deprecation also does not make breaking changes cheap. A `@deprecated` tag mainly steers clients towards the new API, and deprecated operations often remain for years, sometimes decades, before they are finally removed.

For deprecation, the two kinds of API differ in who decides when to upgrade. A library client upgrades when they choose to, so old versions stay in use for years, and a deprecation period can be long. A web service client is upgraded whenever we deploy, whether they are ready or not. So, many services keep old versions running in parallel. It is the only way to give web service clients the choice that library clients have by default.

## Web Service Surfaces

Most of this chapter applies to web services without change, but a few decisions have no library equivalent.

_Resources and methods._ [Chapter 18](./02_consuming_data#calling-a-web-service) described this convention from the client's side: resources are named by URLs, and operations are expressed as HTTP methods. Designing a service means choosing the resources. A shipment is a resource, `/shipments/9K4T` names one, and the method says what is being done to it. The idempotency question from the previous chapter (see deep-dive "Retrying Safely") is now ours to answer. Clients will retry, so an operation that is safe to repeat should use an idempotent method such as `GET` or `PUT`. An operation that is not safe to repeat should use `POST`, and its documentation should say so.

_Status codes are part of the contract._ Clients check the status code before reading the body, so choosing `404` for an unknown tracking number, `400` for a malformed one, and `503` when a carrier is unavailable is a design decision that affects their code. Returning `200` for everything and reporting failures only in the body ignores a mechanism that every HTTP client already understands.

_Error payloads need a stable shape._ The tagged union above has a direct equivalent in JSON, with `code` in the role of `kind`:

```json
{
  "error": {
    "code": "carrier-unavailable",
    "message": "Carrier A did not respond within 5 seconds.",
    "carrier": "carrier-a"
  }
}
```

The `code` is for the client's program, and it is part of the contract. The `message` is for a person reading a log, and it is not. Documenting this distinction lets the wording improve later without breaking clients that branch on the code.

_Anything unbounded needs pagination._ A collection that can grow will eventually be too large to return in one response, and adding pagination later is a breaking change. Deciding at design time is much cheaper than changing the design after clients depend on receiving everything at once.

_Limits should be visible._ If calls are rate limited, a client can only stay within the limit if the service says what the limit is and when it resets. If the only sign of a limit is a rejected request, the client can do nothing except try again.

Authentication is a part of most published services, but it is a large enough topic that it is not in scope of this course. 

#### An API Is a Promise

Inside a system we own, a design decision is provisional, and revising it costs only our own time. Once we publish an API, the decision becomes a promise to people we will never meet, and revising it costs them time. 


In [Part 2](../part2/index) we justified encapsulation, small interfaces, and depending on contracts rather than classes, by the cost of change within _your own code_. But these qualities are even more important for a published API.


Because the API surface is close to permanent, it should be small. Expose the behaviour clients need and keep everything else unreachable, so that nobody can see the parts we may want to change. Because the clients are engineers under time pressure, the API surface should be easy to use correctly and difficult to use incorrectly. That means descriptive names, parameters that cannot be swapped by accident, failures that clients can branch on, and consistency that lets a client generalise from their first call to the rest.

If we have to make a change, we must tell clients about change in advance. In our documentation, we can record what is _not promised_, so that the freedom to change is stated up front. We can use version numbers to announce breaking changes before they arrive. Finally, we can use deprecation to give clients time to migrate. 

<details class="tooltip exercise">
  <summary>Exercise: Publishing a Booking API</summary>

> As a platform team, we want to publish room booking so that other teams can build scheduling tools on it, without each of them integrating with the building system directly.

A first draft of the library's `index.ts` exports everything the team has written:

```typescript
export { BookingService } from "./BookingService";
export { Room, Booking, TimeSlot } from "./types";
export { SqlConnection } from "./db/SqlConnection";
export { validateWithZod } from "./validation";
export { RoomRow, BookingRow } from "./db/rows";
```

Its central operation is:

```typescript
/** Books a room. */
public book(roomId: string, userId: string, start: number, minutes: number,
     allowOverlap: boolean, notify: boolean): Booking
```

Work through the following:

1. _Trim the surface._ Decide which of these exports belong in a published contract and which do not, giving a reason for each. For any you would remove, say what a client could come to depend on if it stayed.
2. _Find the misuse._ `book` can be called incorrectly in at least three ways that still compile. Identify them, then redesign the signature so that each becomes a compile error or is otherwise impossible to write.
3. _Design the failures._ A booking can fail because the room does not exist, because the slot is already taken, or because the request is outside opening hours. Define the error type a client would branch on, and decide whether the operation returns or throws it. Justify your choice with the criteria from Chapter 8.
4. _Document one operation._ Write the documentation comment for your redesigned `book`, including at least one statement of something a client may not rely on, and explain what that non-promise keeps you free to change.
5. _Judge six changes._ For each change, say whether it breaks clients, and if it does, whether a compiler would catch it: adding an optional `title` parameter; renaming `minutes` to `durationMinutes`; rejecting bookings longer than eight hours, which were previously allowed; adding a `createdAt` field to `Booking`; changing `start` from local time to UTC; adding a fourth failure case.
6. _Publish it twice._ The same booking system is also exposed as a web service. Give the URL and method for booking a room, the status code for each failure from question 3, and the JSON shape of an error response. Say which decisions differ from the library version, and why.

<!-- Potential unverified solution:

```typescript
import { describe, test, expect } from "vitest";

// Chapter 19 exercise: Publishing a Booking API (questions 2, 3 and 4)

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** Identifies a room. A value object, so a RoomId cannot be passed where a UserId is expected. */
class RoomId {
    /** The room's identifier in the building system. */
    private readonly value: string;

    /**
     * Wraps a room identifier.
     *
     * @param {string} value the identifier; must not be empty.
     */
    public constructor(value: string) {
        this.value = value;
    }

    /**
     * Returns the identifier as text.
     *
     * @returns {string} the identifier.
     */
    public toString(): string {
        return this.value;
    }
}

/** Identifies a user. */
class UserId {
    /** The user's identifier in the directory. */
    private readonly value: string;

    /**
     * Wraps a user identifier.
     *
     * @param {string} value the identifier; must not be empty.
     */
    public constructor(value: string) {
        this.value = value;
    }

    /**
     * Returns the identifier as text.
     *
     * @returns {string} the identifier.
     */
    public toString(): string {
        return this.value;
    }
}

/** A span of time, as a start and a length, so the two numbers cannot be confused. */
type TimeSlot = {
    /** When the slot begins, in milliseconds since the epoch (UTC). */
    start: number;
    /** How long the slot lasts, in whole minutes; at least 1. */
    minutes: number;
};

/** What a client passes to book. Every argument is named at the call site. */
type BookingRequest = {
    /** The room to book. */
    room: RoomId;
    /** Who the booking is for. */
    user: UserId;
    /** When, and for how long. */
    slot: TimeSlot;
};

type Booking = {
    /** The booking's identifier. */
    id: string;
    room: RoomId;
    user: UserId;
    slot: TimeSlot;
};

/** The ways a booking can fail; a client branches on kind. This list is complete for version 1. */
type BookingError =
    | { kind: "unknown-room"; room: string }
    | { kind: "slot-taken"; conflictingBooking: string }
    | { kind: "outside-opening-hours"; opensAt: number; closesAt: number };

class BookingService {
    /** The rooms that exist, by identifier. */
    private readonly rooms: string[];
    /** Opening hours in milliseconds past midnight UTC: bookings must start and end inside them. */
    private readonly opensAt: number;
    private readonly closesAt: number;
    /** Every booking made so far. */
    private readonly bookings: Booking[];

    /**
     * Creates a service for the given rooms and opening hours.
     *
     * @param {string[]} rooms the identifiers of the rooms that can be booked.
     * @param {number} opensAt opening time in milliseconds past midnight UTC.
     * @param {number} closesAt closing time in milliseconds past midnight UTC; after opensAt.
     */
    public constructor(rooms: string[], opensAt: number, closesAt: number) {
        this.rooms = rooms;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.bookings = [];
    }

    /**
     * Books a room for a user.
     *
     * The slot must lie within opening hours on its day, and must not overlap
     * an existing booking for the same room. The booking is confirmed as soon
     * as this call returns ok: true; no notification is sent, and callers that
     * want one should send it themselves. Clients may not rely on the format of
     * a booking's id, only on its uniqueness, and may not rely on which of two
     * overlapping bookings is reported as the conflict.
     *
     * @param {BookingRequest} request the room, the user, and the time slot.
     * @returns {Result<Booking, BookingError>} ok: true with the new booking, or
     * ok: false with one of the documented BookingError cases.
     */
    public book(request: BookingRequest): Result<Booking, BookingError> {
        if (this.rooms.includes(request.room.toString()) === false) {
            return { ok: false, error: { kind: "unknown-room", room: request.room.toString() } };
        }
        const dayMs: number = 24 * 60 * 60 * 1000;
        const startOfDay: number = request.slot.start - (request.slot.start % dayMs);
        const begins: number = request.slot.start - startOfDay;
        const ends: number = begins + request.slot.minutes * 60 * 1000;
        if (begins < this.opensAt) {
            return { ok: false, error: { kind: "outside-opening-hours", opensAt: this.opensAt, closesAt: this.closesAt } };
        }
        if (ends > this.closesAt) {
            return { ok: false, error: { kind: "outside-opening-hours", opensAt: this.opensAt, closesAt: this.closesAt } };
        }
        for (const existing of this.bookings) {
            if (existing.room.toString() === request.room.toString()) {
                const existingEnd: number = existing.slot.start + existing.slot.minutes * 60 * 1000;
                const requestedEnd: number = request.slot.start + request.slot.minutes * 60 * 1000;
                if (request.slot.start < existingEnd) {
                    if (existing.slot.start < requestedEnd) {
                        return { ok: false, error: { kind: "slot-taken", conflictingBooking: existing.id } };
                    }
                }
            }
        }
        const booking: Booking = {
            id: "b" + (this.bookings.length + 1),
            room: request.room,
            user: request.user,
            slot: request.slot
        };
        this.bookings.push(booking);
        return { ok: true, value: booking };
    }
}

const hour: number = 60 * 60 * 1000;

describe("BookingService.book", () => {
    test("books a free room inside opening hours", () => {
        const service: BookingService = new BookingService(["r1"], 9 * hour, 17 * hour);
        const result: Result<Booking, BookingError> = service.book({
            room: new RoomId("r1"), user: new UserId("u1"), slot: { start: 10 * hour, minutes: 60 }
        });
        expect(result.ok).to.equal(true);
    });

    test("reports an unknown room", () => {
        const service: BookingService = new BookingService(["r1"], 9 * hour, 17 * hour);
        expect(service.book({ room: new RoomId("r9"), user: new UserId("u1"), slot: { start: 10 * hour, minutes: 60 } }))
            .to.deep.equal({ ok: false, error: { kind: "unknown-room", room: "r9" } });
    });

    test("reports a taken slot with the conflicting booking", () => {
        const service: BookingService = new BookingService(["r1"], 9 * hour, 17 * hour);
        service.book({ room: new RoomId("r1"), user: new UserId("u1"), slot: { start: 10 * hour, minutes: 60 } });
        expect(service.book({ room: new RoomId("r1"), user: new UserId("u2"), slot: { start: 10 * hour + 30 * 60 * 1000, minutes: 60 } }))
            .to.deep.equal({ ok: false, error: { kind: "slot-taken", conflictingBooking: "b1" } });
    });

    test("reports a slot outside opening hours", () => {
        const service: BookingService = new BookingService(["r1"], 9 * hour, 17 * hour);
        expect(service.book({ room: new RoomId("r1"), user: new UserId("u1"), slot: { start: 16 * hour + 30 * 60 * 1000, minutes: 60 } }))
            .to.deep.equal({ ok: false, error: { kind: "outside-opening-hours", opensAt: 9 * hour, closesAt: 17 * hour } });
    });
});
```

Model answers for the discussion parts.

1. _Trim the surface._ Keep `BookingService` (the operation), and `Room`, `Booking` and `TimeSlot`, which appear in its signatures (re-exported with `export type`). Remove `SqlConnection`: clients would open their own connections and depend on the schema, and the choice of database would become permanent. Remove `validateWithZod`: it puts Zod's types in the contract, so Zod's next major version becomes our breaking change. Remove `RoomRow` and `BookingRow`: they are the storage shape, and clients that read rows directly break on every column rename.
2. _Find the misuse._ Three calls that compile and are wrong: `roomId` and `userId` swapped (both strings); `start` and `minutes` swapped (both numbers); `allowOverlap` and `notify` swapped, or either passed as a meaningless `true` (both booleans, the control coupling of Chapter 17). A negative `minutes` also compiles. The redesign above takes one `BookingRequest`, so every argument is named at the call site; `RoomId` and `UserId` are value objects (Chapter 13), so swapping them no longer compiles; `TimeSlot` keeps `start` with its `minutes`. The two booleans are gone: whether overlaps are allowed is the service's policy, not a per-call flag, and notification is a separate operation (command-query separation, Chapter 22), so `book` only books.
3. _Design the failures._ `BookingError` is a tagged union a client branches on, and `book` returns a `Result`. Every failure is a routine outcome the scheduling tool shows its user, the caller is the right place to handle it, and a `Result` makes handling it unavoidable. The documentation says the list is complete, so adding a fourth case is a breaking change (the deep dive in Designing the Failures).
4. See the documentation comment on `book` above. The non-promises: callers may not rely on the format of a booking's id, which leaves us free to move from counters to generated identifiers, and may not rely on which overlapping booking is reported, which leaves the overlap search free to change order or run against a database index.
5. _Judge six changes._ Adding an optional `title`: safe. Renaming `minutes` to `durationMinutes`: with the options object it is breaking and the compiler catches it in every client; with the original positional signature it would have broken nobody, because positional parameter names are not part of the call. Rejecting bookings longer than eight hours: breaking, and no compiler sees it; clients find out at runtime. Adding `createdAt` to `Booking`: usually safe, except for clients that build `Booking` literals themselves (test doubles), where the compiler catches the missing field. Changing `start` from local time to UTC: breaking and silent, the `lastSeenAt` case from Breaking Changes. Adding a fourth failure case: breaking; a client's `if` chain still compiles and falls through to whatever its last branch does.
6. _Publish it twice._ `POST /v1/rooms/{roomId}/bookings` with a body `{ "userId": "u1", "start": 1735725600000, "minutes": 60 }`, answering `201` with the booking. Failures: `404` for an unknown room, `409` for a taken slot, `422` for a slot outside opening hours (`400` is also defensible). Error shape: `{ "error": { "code": "slot-taken", "message": "Room r1 is booked until 11:00.", "conflictingBooking": "b1" } }`, where `code` is the contract and `message` is not. What differs: failures are status codes plus a coded body rather than a `Result`; the room is part of the URL, because it is the resource being acted on; identifiers are plain strings, because value objects do not cross the wire; the version is in the path; and because `POST` is not idempotent, the service should accept a client-supplied key so a retried request does not book twice.
-->

</details>
