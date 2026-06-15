# Error Handling

Every function has a contract, and a contract is about more than success. A function that looks up a course section must also say what happens when no such section exists; a function that enrols a student must say what happens when a prerequisite is missing. Designing an abstraction means designing its failures as deliberately as its results: deciding what can go wrong, and how each function tells its caller about it.

In Part 1 we drew a line between two kinds of failure. An **unexpected error** is one that should be impossible: an invariant has been violated, which means the program has a bug. We detect these with `assert`, which stops the program the moment an impossible state appears, because no sensible computation can continue from corrupt data. An **expected error** is a foreseeable, unsuccessful outcome that is not a bug at all: a section is full, a prerequisite is missing, a file is absent. Expected errors belong in the contract, and the caller is expected to deal with them.

This chapter is about expected errors: how a function communicates one to its caller, and how the caller responds. There are two mechanisms in wide use. A function can **return** its failure as an ordinary value, or it can **throw** an exception that travels up the call stack until something handles it. Neither is universally correct, and choosing between them is a design decision we will spend the second half of the chapter making well.

## A Student Enrolling in Sections

We will work with one running example throughout this chapter:

> As a registration system, I want to enrol a student in a chosen set of sections and report the first problem I encounter, so that the student knows exactly what needs fixing.

We model a small slice of this domain: a catalog of sections, each listing the courses required before it, and a student with a record of the courses they have already passed. A section with no prerequisites simply lists an empty array.

```typescript
type Section = {
    id: string;
    prerequisite: string[]; // ids of courses required first; empty if none
};

type Student = {
    id: string;
    completed: string[]; // ids of courses already passed
};

const catalog: Section[] = [
    { id: "CPSC110", prerequisite: [] },
    { id: "CPSC210", prerequisite: ["CPSC110"] },
    { id: "CPSC213", prerequisite: ["CPSC210"] }
];

const student: Student = { id: "s1", completed: ["CPSC110"] };
```

Enrolling in a section can fail in two foreseeable ways: the section id might not exist in the catalog, or the student might not have completed a prerequisite. Our `student` can take `CPSC210` (its prerequisite `CPSC110` is done) but not `CPSC213` (its prerequisite `CPSC210` is not), and a request for `"NOPE"` names no section at all.

## Returning Failure as a Value

The first mechanism is the one we met in Part 1: model failure as part of the return type, so that a function hands back either a success or a failure, and the caller must look to see which. The `Result` type captured this as a tagged union.

```typescript
type Result<T, E> =
  | { ok: true, value: T }
  | { ok: false, error: E };
```

Each leaf check returns a `Result`. The success case carries the section; the failure case carries a message explaining what went wrong.

```typescript
function findSection(catalog: Section[], id: string): Result<Section, string> {
    const section = catalog.find(s => s.id === id);
    if (section === undefined) {
        return { ok: false, error: "no section with id " + id };
    }
    return { ok: true, value: section };
}

function checkPrerequisite(student: Student, section: Section): Result<Section, string> {
    for (const required of section.prerequisite) {
        if (student.completed.includes(required) === false) {
            return { ok: false, error: section.id + " requires " + required };
        }
    }
    return { ok: true, value: section };
}
```

The great strength of this approach is that the failure is written into the type. A caller of `findSection` receives a `Result<Section, string>`, not a `Section`, so the compiler will not let them reach for `.value` without first checking `.ok`. The possibility of failure is impossible to overlook, because the type checker keeps raising it until the caller deals with it.

A returned failure is an ordinary value, which means it is tested like any other value, with `checkExpect`:

```typescript
test("a known section is found", () => {
    checkExpect(findSection(catalog, "CPSC210"), { ok: true, value: { id: "CPSC210", prerequisite: ["CPSC110"] } });
});

test("an unknown section returns a failure value", () => {
    checkExpect(findSection(catalog, "NOPE"), { ok: false, error: "no section with id NOPE" });
});

test("a missing prerequisite returns a failure value", () => {
    const cpsc213: Section = { id: "CPSC213", prerequisite: ["CPSC210"] };
    checkExpect(checkPrerequisite(student, cpsc213), { ok: false, error: "CPSC213 requires CPSC210" });
});
```

That safety comes at a cost, and the cost lands at every call site. A caller cannot use the returned section directly; it must first check `.ok`, and only once it has confirmed success may it reach for `.value`. Even a single call is wrapped in a check, so the handling of the failure case sits right in the middle of the code doing the successful work.

## The Cost of Threading Results

The example asks us to enrol a student in *several* sections, checking each one. Built from the leaf checks above, that function spends most of its body moving failures along:

```typescript
function enrollAll(catalog: Section[], student: Student, ids: string[]): Result<Section[], string> {
    const sections: Section[] = [];
    for (const id of ids) {
        const found = findSection(catalog, id);
        if (found.ok === false) {
            return found; // pass the failure up, unchanged
        }
        const eligible = checkPrerequisite(student, found.value);
        if (eligible.ok === false) {
            return eligible; // pass the failure up, unchanged
        }
        sections.push(found.value);
    }
    return { ok: true, value: sections };
}
```

Look at what this function actually contains. Of its eight lines of body, four exist only to notice a failure and forward it. `enrollAll` cannot do anything useful about an unknown section or a missing prerequisite; the only code that can respond is whatever called `enrollAll`, perhaps to show the student a message. Yet `enrollAll` is forced to participate, unpacking each `Result` and re-returning it, purely to carry the failure one step closer to a caller that can act on it. Its own caller will then unpack the `Result` one more time.

There is a readability cost hiding in here that matters as much as the line count. The everyday success path, the case that runs almost every time, is the simple sequence "find the section, check the prerequisite, add it to the list". In the code above that sequence is broken into fragments, with a failure check wedged between each step. The case that almost never happens is interleaved with, and visually dominates, the case that almost always does. This is the cost of returning failure as a value: every layer between the function that *detects* a problem and the function that *handles* it must thread the failure through by hand, and the threading crowds out the logic that the reader actually came to understand. When detection and handling are right next to each other, this is a fair price. When they are many layers apart, the next mechanism is designed for exactly that situation.

## Raising an Exception

An **exception** is a signal that something has gone wrong, raised with the `throw` statement. Throwing an exception immediately abandons the rest of the current function and hands the exception to that function's caller; if the caller does not handle it, the exception is handed to *its* caller, and so on up the call stack until something catches it or the program runs out of stack and halts.

Concretely, `throw` takes an error value to raise, almost always a `new Error` carrying a message that describes the problem. The skeleton below shows its key effect:

```typescript
function attempt(): void {
    // (A)
    throw new Error("a description of what went wrong");
    // (B)
}
```

If `(A)` runs and the `throw` is then reached, the statements in `(B)` never run. A `throw` leaves the function on the spot, much as `return` does, but with two differences: it carries an error rather than an ordinary value, and the caller does not receive that error as a result. Instead the error begins travelling up the chain of callers, as described above.

This throw-and-catch model is not unique to TypeScript. The same mechanism, with slightly different spelling, appears in Java, C++, C#, and Python (where the keywords are `try` and `except`), among many others. The idea you learn here transfers directly when you move between languages.

Where a returned failure asks every layer to carry it, a thrown one carries itself. The leaf checks no longer return a `Result`; they return on success and `throw` on failure, with an informative message.

```typescript
function requireSection(catalog: Section[], id: string): Section {
    const section = catalog.find(s => s.id === id);
    if (section === undefined) {
        throw new Error("no section with id " + id);
    }
    return section;
}

function requirePrerequisite(student: Student, section: Section): void {
    for (const required of section.prerequisite) {
        if (student.completed.includes(required) === false) {
            throw new Error(section.id + " requires " + required);
        }
    }
}
```

Now `enrollAll` is free of error-handling entirely:

```typescript
function enrollAll(catalog: Section[], student: Student, ids: string[]): Section[] {
    const sections: Section[] = [];
    for (const id of ids) {
        const section = requireSection(catalog, id);
        requirePrerequisite(student, section);
        sections.push(section);
    }
    return sections;
}
```

Compare this with the `Result` version. The four lines of failure-forwarding are gone, and so is the interleaving: what remains reads as the plain success path, "find the section, check the prerequisite, add it to the list", with no error handling wedged between the steps. If `requireSection` throws on the third id, the `throw` abandons `requireSection`, abandons the loop in `enrollAll`, and abandons `enrollAll` itself, all without any of them writing a line of code to make that happen. The exception travels straight to whoever is prepared to catch it.

<details class="tooltip deep-dive">
<summary><code>assert</code> Is an Exception</summary>

The `assert` from Part 1 was not a separate mechanism; it is a `throw` we had not yet named. Conceptually it is just:

```typescript
function assert(condition: boolean, message: string): void {
    if (condition === false) {
        throw new Error(message);
    }
}
```

The reason a failed assertion halts the program is simply that nothing ever catches it. An assertion guards an *unexpected* error, an impossible state, and the right response to an impossible state is to stop, so we deliberately leave it uncaught and let it rise all the way out of the program. Everything in this chapter is the same mechanism, caught on purpose instead of left to halt.

</details>

<details class="tooltip link-110">
<summary>Raising Errors in BSL</summary>

You raised errors in CPSC 110 with `error`, which stopped the program with a message:

```racket
;; require-section : Catalog String -> Section
(define (require-section catalog id)
  (cond [(false? (find-section catalog id)) (error "no section with id" id)]
        [else (find-section catalog id)]))
```

`throw` is the same idea. CPSC 110 also gave you `check-error`, the counterpart of the `checkError` we use here: it passed only when its expression signalled an error.

</details>

## Catching an Exception

A thrown exception is handled with a `try`/`catch` statement. The code that might throw goes in the `try` block; if it throws, control jumps to the `catch` block, which receives the thrown error. In the abstract:

```typescript
try {
    // (A)
} catch (error) {
    // (B)
}
// (C)
```

If `(A)` runs to completion without throwing, the `catch` block `(B)` is skipped entirely and control continues at `(C)`. If anything in `(A)` throws, the rest of `(A)` is abandoned at once, control jumps to `(B)` with the thrown error bound to the name `error`, and then continues at `(C)`. Either way `(C)` runs; the only difference is whether `(B)` ran on the way there. Crucially, the throw caught in `(B)` need not have happened directly in `(A)`: it may have come from deep inside a function that `(A)` called, because a `try` catches throws from anywhere in the work it encloses.

The function that enrols a student sits at the top, where there is finally something useful to do with a failure, and it is the only place that handles errors at all:

```typescript
function enrolStudent(catalog: Section[], student: Student, ids: string[]): void {
    try {
        const sections = enrollAll(catalog, student, ids);
        console.log("enrolled in " + sections.length + " sections");
    } catch (error) {
        console.log("enrolment could not be completed:");
        console.log(error);
    }
}
```

TypeScript gives the caught value the type `unknown`, because in principle any value can be thrown, so here we simply log the whole error rather than reach into it. That is enough to report what went wrong: an `Error` prints with the message it was given.

A thrown failure interrupts the call rather than coming back as a value, so we cannot inspect it with `checkExpect`. This is what `checkError` is for: it runs the code you give it and passes only if that code throws.

```typescript
test("an unknown section throws", () => {
    checkError(() => enrollAll(catalog, student, ["NOPE"]), "no section with id NOPE");
});

test("a missing prerequisite throws", () => {
    checkError(() => enrollAll(catalog, student, ["CPSC213"]), "CPSC213 requires CPSC210");
});

test("a valid request enrols in every section", () => {
    const sections = enrollAll(catalog, student, ["CPSC110", "CPSC210"]);
    checkExpect(sections.length, 2);
});
```

The contrast with the earlier `Result` tests is worth pausing on. A returned error is a value, so we asserted on it with `checkExpect`; a thrown error escapes the call, so we need `checkError`, which is built to run the call and observe that it threw.

<details class="tooltip ts-tips">
<summary>The <code>finally</code> Block</summary>

A `try` may end with a `finally` block, which runs after the `try` and any `catch`, whether or not an exception was thrown.

To see why that is useful, you need to know that a program does not work only with values in its own memory; it also borrows things from the operating system that must be given back. Opening a file, for instance, returns a **handle**, a token the operating system grants so the program can read and write that file. The operating system allows only a limited number of open handles at once, and a handle stays held until the program explicitly closes it. The same is true of a network connection, or of a lock that keeps two parts of a program from interfering: each is held until it is released. If a program keeps opening files and never closing them, it eventually runs out of handles and can open no more, a fault known as a **resource leak**.

Here is the danger an exception introduces. If a `throw` interrupts the work between opening a resource and closing it, the closing line is one of the statements that gets abandoned, and the resource is leaked. `finally` exists to prevent exactly this: its block runs on every path out of the `try`, the normal path and the throwing path alike, so the cleanup cannot be skipped.

```typescript
const file = openFile("report.txt"); // borrows a handle
try {
    useFile(file);                   // might throw partway through
} finally {
    closeFile(file);                 // runs even if useFile throws, returning the handle
}
```

We rarely need to write `finally` ourselves in this course, but you will see it wherever a cleanup step must happen no matter how a block is left.

</details>

<details class="tooltip deep-dive">
<summary>How <code>checkError</code> Works</summary>

`checkError` is an ordinary function built from `try`/`catch`. Roughly:

```typescript
function checkError(thunk: () => void, expected: string): void {
    try {
        thunk();
    } catch (error) {
        // the call threw, as expected; a full implementation also
        // checks the thrown error's message against `expected`
        return;
    }
    throw new Error("expected an error, but none was thrown");
}
```

This is why `checkError` takes a function, the `() =>` thunk, rather than a value. It must run your code *inside its own* `try`/`catch` so it can observe whether an exception is thrown. Handing it `enrollAll(...)` directly would run that call first, and the exception would escape before `checkError` ever got control.

The word **thunk** is old programming jargon for a small, parameterless function that wraps up a computation to be run later. The name dates to the Algol-60 community of the 1960s and is jokingly explained as the past tense of "think": a thunk is an expression the program has already thought about and set aside to evaluate when it is needed.

</details>

## Recovering, or Just Reporting

The promise of `try`/`catch` is **recovery**: catching a failure and continuing sensibly despite it. Sometimes that is exactly what happens. Suppose a student gives a preferred section and a backup to use if the preferred one is unavailable. The handler does not care *why* the preferred section could not be used, only that it could not, so it catches the failure and tries the backup instead:

```typescript
function sectionOrBackup(catalog: Section[], preferredId: string, backupId: string): Section {
    try {
        return requireSection(catalog, preferredId);
    } catch {
        return requireSection(catalog, backupId);
    }
}
```

Here the `catch` block does real work, and the program carries on with a valid section. If the backup is missing too, that second `requireSection` throws, and since nothing catches it here, the failure propagates onward, which is the right outcome.

<details class="tooltip ts-tips">
<summary>Optional <code>catch</code> Binding</summary>

When a handler does not need the caught value, the `catch` parameter can be left out entirely. Writing `catch {` instead of `catch (error) {`, as in `sectionOrBackup` above, says plainly that the handler does not care which error occurred, only that one did. Reach for it whenever the recovery does not depend on the details of the failure.

</details>

In practice, a great deal of error handling does not recover at all. Very often the most a handler can honestly do is *detect* the failure, record it, tell someone, and stop the operation that cannot proceed. Our `enrolStudent` is typical: it cannot conjure a missing prerequisite into existence, so it catches the error, reports it, and abandons the enrolment. That is still valuable, because the alternative, letting the exception halt the whole program, would be far worse for everyone else using the system. Catching an error to report it cleanly and stop one operation is a legitimate and common use of `try`/`catch`, even when no recovery is possible.

What a handler must not do is catch an error and silently discard it. An empty `catch` block that does nothing turns a loud, traceable failure into a quiet wrong answer that surfaces much later, somewhere far from the cause. If you cannot recover and cannot usefully report, it is almost always better to let the exception keep rising than to swallow it.

## Exceptions Travel Up the Call Stack

The power of exceptions, and the thing that makes them worth a separate mechanism, is that the function which detects a problem and the function which handles it need not know about each other at all. Everything between them is left untouched.

Trace the unknown-section failure through our program. `enrolStudent` calls `enrollAll`, which calls `requireSection`, which discovers the bad id and throws. The exception now rises back through that exact chain: it leaves `requireSection`, passes through `enrollAll` without `enrollAll` doing anything, and arrives at the `try` in `enrolStudent`, where it is finally caught. `enrollAll` is on the path but is not a participant; it neither checks for the error nor forwards it, because propagation is automatic. This is the plumbing the `Result` version had to write by hand, now handled by the language.

This is the deeper reason the success path stayed clean. The intermediate layers carry no error-handling code not because we were careful to leave it out, but because they genuinely need none: an exception they do not catch passes straight through them. The further apart detection and handling are, the more this saves.

<details class="tooltip deep-dive">
<summary>What Is a Call Stack?</summary>

When one function calls another, the caller does not finish; it pauses, partway through, and waits for the called function to return before carrying on. The called function may call a third, which pauses it in turn. At any instant, then, there is a chain of paused functions, each waiting on the one it called. That chain is the **call stack**.

It is called a stack because it grows and shrinks at one end only, like a stack of plates. Consider:

```typescript
function a(): void {
    b();                      // a pauses here while b runs
    console.log("a is done");
}

function b(): void {
    c();                      // b pauses here while c runs
    console.log("b is done");
}

function c(): void {
    console.log("c is running");
}

a();
```

Calling `a` adds a frame for `a` to the stack; `a` calls `b`, adding a frame for `b` on top; `b` calls `c`, adding `c`. The stack is now `a`, then `b`, then `c`, with `c` on top. When `c` returns, its frame is removed and `b` resumes; when `b` returns, it is removed and `a` resumes. Each function hands control back to the exact spot in its caller where it paused, so the output is:

```
c is running
b is done
a is done
```

A normal `return` moves one step down this stack: it hands a value to the immediate caller and removes one frame. An exception is different. A `throw` does not return to the immediate caller at all; it removes frames from the stack one after another *until it finds a `try`/`catch`*, discarding each paused function along the way without resuming it. This is why an exception can surface so far from where it was raised: it travels down the stack of paused callers, past every one that has no handler.

Seen this way, an exception is a kind of **non-local return**: where `return` exits to the one place directly below it, a `throw` can exit many levels at once. This sketch makes the jump visible:

```typescript
function deep(): void {
    throw new Error("from deep");
    // nothing after the throw in deep, middle, or shallow runs
}

function middle(): void {
    deep();
    console.log("middle after deep");     // skipped
}

function shallow(): void {
    try {
        middle();
        console.log("shallow after middle"); // skipped
    } catch {
        console.log("caught in shallow");    // this runs
    }
}
```

Calling `shallow` prints only `caught in shallow`. The `throw` in `deep` jumps straight past the rest of `deep`, all of `middle`, and the rest of the `try` in `shallow`, landing in the `catch`. Two whole functions were abandoned mid-execution. Although a `throw` *can* be used to leap out of deep code like this, it must only ever be used for genuine error states, never as a tidy shortcut for breaking out of nested calls, for the reasons described just below.

</details>

That same reach is also a hazard, and it is worth being blunt about it. Because a `throw` can leap past every function between the error and its handler, exceptions are easy to *misuse* as a convenient jump out of deep code, a stand-in for ordinary control flow. They must not be used that way, and the reason is not merely taste: overusing exceptions makes a program genuinely hard to understand, for a cause rooted in the static and dynamic views from Part 1.

A `throw` and a `try`/`catch` are both plainly visible in the source code, the static view of the program. But *whether* an exception is raised on a given run, and *which* one, almost always depends on the inputs and the program's state, which belong to the dynamic view. Reading a function tells you it *might* throw, never whether it will on a particular call. And because the exception travels up the call stack to a handler that may be many frames away, you cannot work out a function's failure behaviour from the function and its immediate callers and callees alone: the error it raises might be handled far above, by code it has never heard of, and an error it must be ready to receive might originate far below, passed up through functions that merely forwarded it. The very non-locality that kept the success path clean is what makes failure behaviour hard to trace. This is the strongest reason to keep exceptions rare, reserve them for genuine errors, and handle them at a deliberately chosen layer rather than catching them wherever they happen to surface.

## Choosing Between Results and Exceptions

We now have two ways to communicate the same expected failure, and a real design decision about which to use. The trade-off comes down to two properties we have already seen.

A **returned** failure is *visible to the type checker*. It appears in the function's return type, and the compiler forces every caller to confront it. The price is the one we measured: every layer between detection and handling must carry the failure by hand, and the checks interleave with, and obscure, the success path. Returning failure is the better choice when the failure is an ordinary, expected part of the operation that the *immediate* caller should reckon with right away: a lookup that may find nothing, a parse that may not match.

A **thrown** failure *propagates itself*, which keeps every layer between detection and handling clean, including the common success path. The price is that the failure is invisible in the type: a function that throws looks, from its signature, just like one that always succeeds, so it is easy for a caller to forget that handling is needed. Throwing is the better choice when a failure should abort the current line of work and be dealt with somewhere well above, or when threading a `Result` through many layers would bury the logic in plumbing.

Two further rules cut through most cases. Unexpected errors, the bugs guarded by `assert`, are always thrown and never caught; there is no decision to make there. And within a single codebase, consistency matters as much as the individual choice: a module where similar operations report failure in similar ways is far easier to use correctly than one where every function makes its own call.

<details class="tooltip deep-dive">
<summary>Checked and Unchecked Exceptions</summary>

TypeScript's exceptions are **unchecked**: a function's type says nothing about what it might throw, and the compiler never forces a caller to handle a possible exception. `requireSection` can throw, but its signature, `(catalog: Section[], id: string): Section`, looks identical to a function that always succeeds.

Some languages, notably Java, also offer **checked** exceptions, which must be declared in the signature and which the compiler forces every caller to either handle or re-declare. Checked exceptions make a failure impossible to forget, at the cost of real ceremony in every layer the exception passes through.

Notice that a `Result` return type recovers the *checked* property inside an unchecked language. By putting the failure in the type, it makes the compiler insist that callers deal with it. That is the single sharpest difference between the two mechanisms in this chapter: returned failures are visible to the type checker, thrown ones are not.

</details>

<details class="tooltip deep-dive">
<summary>Other Ways to Signal Failure</summary>

`Result` and exceptions are this chapter's focus, but they are not the only options. A function that can simply find nothing often returns the value or `undefined`, the way `Array.find` does; this is the **optional** pattern, really a `Result` with no error detail. Older code, and lower-level languages, often use **sentinel values**: a special in-band return such as `-1` for "not found". Sentinels are error-prone precisely because they are ordinary values that can be used by mistake or collide with real data, which is why a stub that returned `-1` was a reliable way to force a test to fail in Part 1.

Whatever the mechanism, a few practices hold across all of them: never silently discard an error; do not use exceptions for ordinary control flow, only for genuine failures; and check data the moment it crosses into your program from a file, a network, or a user, converting outside uncertainty into either a trusted value or a clear error right at the boundary. That last practice is the subject of a later chapter.

</details>

## Designing for Failure

A well-designed abstraction handles failure as deliberately as it handles success. Expected failures belong in the contract, and a function communicates them in one of two ways: by returning a value that the type checker forces callers to confront, or by throwing an exception that propagates on its own to a handler far above. Unexpected failures, the impossible states that signal bugs, are thrown by `assert` and left uncaught so the program halts at the first sign of corruption. The choice between returning and throwing is a genuine design decision, weighing visibility in the types against the readability of the success path, and it is one you now have the vocabulary to make.

Two threads run on from here. We have been testing errors with `checkExpect` and `checkError`; the next chapter on verifying behaviour introduces more expressive tools for asserting exactly how and why a piece of code fails. And the practice of checking data as it enters a program returns when we study the boundaries between a system and the world outside it, where most real failures begin.
