# Verifying Behaviour

A function's contract states what it _should_ do. A test demonstrates _what_ a function does, for a chosen input. 

The earlier chapters began the practice of testing with `checkExpect`. In these, we write down a function call on a particular input and the result the contract promises on that input. The testing framework compares the two. `checkExpect`s keep two things simple that real test suites do not [TODO???]. Our assertions checked only equality, and we chose our tests one clause of the contract at a time. This chapter develops both: a richer vocabulary for stating what a result must satisfy, and more systematic ways to judge whether a suite checks enough.

It also changes our tools. The `checkExpect` and `checkError` functions were a deliberately simple stand-in for the assertions used in real test frameworks, and from here on we use those assertions. We write tests with `expect`, the assertion vocabulary provided by the [chai](https://www.chaijs.com/) library that the [vitest](https://vitest.dev/) test runner is built on.

The change is more than spelling, and every part of it is a gain. `checkExpect` did exactly one thing, compare for equality, and could report a failure only in those terms; `expect` offers a family of assertion operators, each stating a different kind of expectation and, when it fails, reporting a message that names the actual problem. The shape of a test case changes along with it: a case is now a function body that you write, so it can hold several assertions, build the values it needs privately, and drive code that takes more than one step to configure. 

Nothing we could say before becomes harder to say; the earlier form turns out to have been a restricted version of this one. Learning to choose among the assertion operators is the first half of this chapter.

## From `checkExpect` to `expect`

A `checkExpect` call paired the expression under test, wrapped in `() =>`, with an expected value. A chai assertion reads more like a sentence: name the value under test, then state what must be true of it. The most common assertion is equality, and every `checkExpect` we have written translates into one directly:

```typescript
// previously, with the course toolkit's checkExpect
test("no fee at the grace boundary", checkExpect(() => lateFee(2), 0));

// from here on, with chai's expect
test("no fee at the grace boundary", () => {
    expect(lateFee(2)).to.equal(0);
});
```

<details class="tooltip deep-dive">
  <summary>Behaviour-Driven Development (BDD)</summary>

In the abstract, our assertions look like:

```typescript
expect(<the value under test>).to.<assertion>;
expect(<the value under test>).to.<assertion>(<expected value>);
```

Most assertions take an expected value in parentheses; a few, such as existence checks, are written as a property with no parentheses at all. The chained words in between, `to`, `be`, and `have`, are there only to make the assertion read as English; they carry no meaning of their own. The chained shape of these assertions has been deliberately designed to mimic sentence structure. 

chai's `expect` is a **behaviour-driven development** (BDD) assertion library. BDD is a style of testing that describes what code should do in language _close to ordinary prose_. This means a test reads as a statement of _behaviour_ rather than a low-level comparison. 

For example, the assertion 
```typescript
expect(() => requireSection(catalogue, "NOPE")).to.throw("no section with id NOPE")
```
is more verbose than a bare check, but it reads _almost_ the same the English sentence it stands for. 

Paired with a descriptive test name, the whole test case becomes as a human-readable description of the behaviour it verifies. 

This legibility allows a test suite serve as documentation of what the code is meant to do. This is why chai favours a longer, readable form over a terse one.
</details>

Errors translate just as directly. Recall `requireSection` from the previous chapter, which throws when no section matches the requested id. Where `checkError` ran a function and passed if it threw, `expect(...).to.throw` does the same:

```typescript
// previously
test("an unknown section throws",
    checkError(() => requireSection(catalogue, "NOPE"))
);

// now
test("an unknown section throws", () => {
    expect(() => requireSection(catalogue, "NOPE")).to.throw("no section with id NOPE");
});
```

As with `checkExpect` and `checkError`, the call under test is wrapped in `() =>` so that `expect` can run it and observe the throw, rather than receiving an error that has already escaped. 

We gain additional precision compared to `checkError`. `to.throw` takes as argument the message we expect the failure to carry. The assertion passes if the thrown error message contains this argument. A `checkError` test that was written with failure A in mind would pass even if failure B happened instead; now it does not.

<!--
<details class="tooltip ts-tips">
<summary>Importing <code>expect</code></summary>

From here on, test files import `expect` in place of `checkExpect` and `checkError`:

```typescript
import { test, expect } from "@ubccpsc/210-toolkit/testing";
```

`test` groups and names cases exactly as before. `expect` is the assertion function from the chai library, which the vitest runner uses to evaluate your tests; the course toolkit re-exports it so the import stays in one place.

</details>
-->

<details class="tooltip ts-tips">
<summary><code>equal</code> Versus <code>deep.equal</code></summary>

`to.equal` compares with `===`. For numbers, strings, and booleans that is exactly right. For objects and arrays it is not: `===` asks whether two values are _the same object in memory_, not whether they hold the same contents, so two separately built objects with identical fields are not equal.

```typescript
expect({ id: "CPSC210" }).to.equal({ id: "CPSC210" });      // fails: different objects
expect({ id: "CPSC210" }).to.deep.equal({ id: "CPSC210" }); // passes: same contents
```

`to.deep.equal` compares structure: it checks that the two values have the same shape and the same values throughout. `checkExpect` always compared using deep equality, so when you translate a `checkExpect` whose expected value is an object or an array, you should use `deep.equal`, not `equal`.

</details>

<details class="tooltip link-110">
<summary>A Family of Checks</summary>

CPSC 110 already provided more than one kind of check. Alongside `check-expect` you used `check-within` for numbers that need only be close, `check-member-of` for a value that must be one of several, `check-range` for a number in an interval, and `check-error` for an expression that must signal an error. The idea that an assertion can say something more precise than "these are equal" is not new; chai offers a larger vocabulary of it. `check-within` becomes `to.be.closeTo`, `check-member-of` becomes `to.be.oneOf`, and `check-error` becomes `to.throw`.

</details>


### A Vocabulary of Assertions

Beyond equality, chai groups its assertions by the kind of property they check. A small number cover most of what you will write:

| Kind | Example | Passes when |
|---|---|---|
| Equality | `expect(fee).to.equal(0)` | The value matches exactly (use `deep.equal` for objects and arrays) |
| Boolean | `expect(done).to.be.true` | The value is `true` (or `to.be.false`) |
| Existence | `expect(found).to.exist` | The value is not `null` or `undefined` |
| Type | `expect(result).to.be.an("array")` | The value has the named type |
| Length | `expect(result).to.have.length(2)` | An array or string has that length |
| Inclusion | `expect(ids).to.include("CPSC210")` | An array contains the element (or a string the substring) |
| Membership | `expect(ids).to.have.members(["CPSC110", "CPSC121"])` | An array has exactly these elements, in any order |
| Property | `expect(section).to.have.property("id", "CPSC210")` | An object has the property, with the given value |
| Numeric | `expect(fee).to.be.at.most(10)` | A numeric comparison holds |
| Throws | `expect(() => f()).to.throw("...")` | The call raises an error |

None of these is strictly necessary. Each could be rewritten as an equality or boolean check: `expect(ids.includes("CPSC210")).to.equal(true)` does the same work as `expect(ids).to.include("CPSC210")`. 

The specific operator is better for two reasons. 1) It states intent at a glance, so a reader of the test sees _what_ is being checked rather than a hand-written expression that happens to reduce to a boolean. 2) When it fails, it reports the actual problem. The generic form (`expect(ids.includes("CPSC210")).to.equal(true)`) will report:

```text
AssertionError: expected false to equal true
```

while the specific form (`expect(ids).to.include("CPSC210")`) names the value and the missing element:

```text
AssertionError: expected [ 'CPSC213' ] to include 'CPSC210'
```

By using specific operators, a test failure will give us the cause of failure. 

<details class="tooltip ts-tips">
<summary>When do we need to add <code>() =></code>?</summary>

Above, we've set the argument to `expect` to be a variable name in most cases, and a function call wrapped in `() =>` for `expect...to.throw`. Why? This is because `.to.throw` needs to observe the _execution_ of the function to determine if it throws: it cannot simply examine the return value, because when a function throws, there is no return value (recall [Chapter 8](./08_errors.html))

If you can write:
```typescript
const v = f();
expect(v).[...]
```
then you can write

```typescript
expect(f()).[...]
```

Any assertion (like `throw`) that must _observe the execution of f_ needs to be wrapped:

```typescript
const v = f(); // program will halt here if v throws
expect(v).to.throw('error'); // v will not throw an error
```

If the distinction is not clear to you, it is worth discussing this in office hours.
</details>

<!--
<details class="tooltip deep-dive">
<summary>What Developers Write in Practice</summary>

These categories are not arbitrary. A study of 33,873 assertions drawn from 105 open-source JavaScript and TypeScript projects ([Zamprogno et al., 2022](https://www.cs.ubc.ca/~rtholmes/papers/tse_2022_zamprogno.pdf)) found that developer-written assertions, although numerous, are simple: the median test case contains a single assertion, and most assertions use a single operator. Almost all fell into twelve categories, with equality the most common at roughly 39%, followed by boolean, inclusion, length, and existence checks like the ones above. The same study found that nearly a quarter of the equality checks could have been written with a more specific operator that would read more clearly and fail more informatively. Two lessons carry over to your own tests: keep individual assertions simple, and prefer the operator that names what you mean.
</details>
-->


## Richer Test Case Bodies

Our translation from `checkExpect` to `expect` is more than just a syntax change. With this shift, we will be able to express richer test cases.

Consider the second argument to `test`:  `test("no fee at the grace boundary", () => {expect(lateFee(2)).to.equal(0);});`.  It is a function! We tried to hide this with `checkExpect`: `checkExpect(...)` built up a function `test` would call to carry out the check. 

For the rest of the course we will write that function ourselves:

```typescript
test(<description>, () => {
    <statements>
});
```

The description part is unchanged. But now, the body is an ordinary arrow function with a block body. This means it can hold any number of statements. (As [Chapter 1](./01_new-language) described, a block body returns nothing implicitly. A test body has no value to return in any case: the runner judges the case by whether an assertion inside it failed, not by what the body produced.) This erases the three restrictions of the earlier form:

1. _A case can hold as many assertions as the behaviour needs._ We had only one check per test case because the check _was_ the test body, not because a good test has only one check. With a whole block,  the body can state several expectations about a single result. This is handy to poinpoint bugs: by ordering assertions from general to specific, an assertion failure gives us the _kind_ of the fault, not just the _presence_ of a fault. We'll develop this more in the _Layering Assertions for Clearer Failures_ section below. You may still only write one assertion per test case, but now it is a choice rather than a limitation. 

2. _Setup belongs inside the case._ In the earlier chapters, a check was a single call `checkExpect(() => <actual>, <expected>)`. So any values that wouldn't fit into this call had to be declared above the tests, at the top level of the file. Everything declared there is visible to every later test. If one of those values is _mutable_ ([Chapter 6](./06_state-mutation.html)) changes by one test are visible by every subsequent test. A test suite that accesses top-level state like this can pass or fail depending on the order its cases happen to run in. That's no good! With a full block as test case body, each test case can hold its own `const` and `let` declarations. So, each test case can build only the values it needs, without disturbing another test case's values. 

3. _Code under test can be driven through several steps._ In [Chapter 7](./07_async.html), we saw that `checkExpect` could hold more than one statement: but, it had the funnel all the computation into one final value to check. A test body has no such funnel. It can construct a value, configure it, exercise it, and assert at any point along the way, choosing a different operator for each assertion. Most real testing needs exactly that: behaviour that is not reachable until the value under test has been built up through several steps. 

<details class="tooltip deep-dive">
<summary>Repetitive Setup</summary>
A disadvantage of
Test runners extend this further with **lifecycle hooks**, `beforeEach` and `afterEach`, which run around every case so that setup common to a group of tests is written once while each case still receives its own fresh copy of it. 
</details>

The body of the test case being an arbitrary block allows us to improve failure reporting.

## Richer Failures: Layering Assertions for Clearer Failures

Consider a function that lists the sections a student can currently enrol in: those they have not already completed and whose prerequisites they have all met. Let's reuse the `Section` and `Student` types from [Chapter 8](./08_errors.html), with a catalogue that now offers two first-year courses:

<CollapsibleCode>

```typescript
type Section = {
    id: string;
    prerequisite: string[]; // ids of courses required first; empty if none
};

type Student = {
    id: string;
    completed: string[]; // ids of courses already passed
};

const catalogue: Section[] = [
    { id: "CPSC110", prerequisite: [] },
    { id: "CPSC121", prerequisite: [] },
    { id: "CPSC210", prerequisite: ["CPSC110"] },
    { id: "CPSC213", prerequisite: ["CPSC210"] }
];

/**
 * Determines whether a student has completed every prerequisite of a section.
 *
 * A section with no prerequisites is satisfied by every student.
 *
 * @param {Student} student the student whose completed courses are checked
 * @param {Section} section the section whose prerequisites must be met
 * @returns {boolean} true when the student has completed every id in
 * section.prerequisite, and false otherwise
 */
function hasAllPrerequisites(student: Student, section: Section): boolean {
    for (const required of section.prerequisite) {
        if (student.completed.includes(required) === false) {
            return false;
        }
    }
    return true;
}

/**
 * Lists the sections a student can currently enrol in.
 *
 * A section is eligible when the student has not already completed it and
 * has completed all of its prerequisites. Eligible sections are returned
 * in catalogue order.
 *
 * @param {Section[]} catalogue the sections on offer
 * @param {Student} student the student enrolling
 * @returns {Section[]} the eligible sections, or an empty array when none
 * are available
 */
function eligibleSections(catalogue: Section[], student: Student): Section[] {
    const result: Section[] = [];
    for (const section of catalogue) {
        // a section the student has completed is not on offer again
        if (student.completed.includes(section.id) === false) {
            if (hasAllPrerequisites(student, section)) {
                result.push(section);
            }
        }
    }
    return result;
}
```

</CollapsibleCode>

A student who has finished both first-year courses can take `CPSC210`, but not yet `CPSC213`. We can pin this down exactly with a single assertion:

```typescript
test("a student who finished first year can take CPSC210", () => {
    const student: Student = { id: "s1", completed: ["CPSC110", "CPSC121"] };
    expect(eligibleSections(catalogue, student)).to.deep.equal([{ id: "CPSC210", prerequisite: ["CPSC110"] }]);
});
```

This is assertion is correct and should catch all faults. But consider what it tells you when it fails. The report says only that one array did not deeply equal another, and leaves you to compare them by eye. Did the function return `undefined`? An array of the wrong length? The right length but the wrong section? The right section with the wrong prerequisites recorded? With the assertion above, every one of those faults produces a very similar error message.

With a whole test case body, we need not restrict to a single catch-all assertion. We can achieve much more precise error messages by thinking of the different ways `eligibleSections` can fail, and writing down a _sequence_ of assertions that captures these failures. We should order assertions from the most general to the most specific:

```typescript
test("a student who finished first year can take CPSC210", () => {
    const student: Student = { id: "s1", completed: ["CPSC110", "CPSC121"] };
    const result = eligibleSections(catalogue, student);

    expect(result).to.exist;                              // not null or undefined
    expect(result).to.be.an("array");                     // the right kind of value
    expect(result).to.have.length(1);                     // the right number of sections
    expect(result.map(s => s.id)).to.include("CPSC210");  // the section we expect
    expect(result).to.deep.equal([{ id: "CPSC210", prerequisite: ["CPSC110"] }]); // exactly right
});
```

Only the last assertion is strictly necessary: if it passes, every assertion above it must have passed too. If an assertion above it would have failed, it would have failed also. 

The value of these cascading assertions is in the experience we get from a failing test. Each kind of fault now trips a different, earlier assertion, and the _first_ failure names the problem:

```text
expected undefined to exist                       // returned nothing
expected [ … ] to have a length of 1 but got 2    // returned too many sections
expected [ 'CPSC213' ] to include 'CPSC210'       // returned the wrong section
```

Only a result that exists, is an array of the right length, and contains the expected id, yet still differs somewhere in its contents, survives to the final `deep.equal`. Ordering matters: with the general checks first, the earliest failure is always the most fundamental one, and you learn the _kind_ of mistake before its details.

You need not attach five assertions to every test. Redundant checks can clutter a test without adding meaning. Layering is worthwhile when a value is structured enough that a _bare equality failure_ is hard to read. Or, when a function makes several independent guarantees worth confirming separately.Ffor the example above, we might decide to skip the `to.exist` assertion, and the one performing the `map` operation. The aim is not more assertions but more _informative_ ones. 

In test design, as in software design more broadly, there is rarely a single right answer. Moving beyond `checkExpect` provides you the power to add multiple assertions, but you must choose when to exercise this power.

## Partitioning Inputs and Outputs
 
A test case has three core parts: (1) constructing inputs; (2) exercising the software with those inputs; (3) asserting the software behaves as expected.  We've discussed how to build richer assertions. How should we construct inputs?

In [Chapter 3](./03_checking-invariants.html), we discussed equivalence class partitioning and boundary value checking. We divided a function's input space into equivalence classes, grouping those the specification treats alike, and tested one representative of each. We looked hardest at the boundaries between classes. 

These techniques form the basis on input selection. But once  a function's inputs and outputs are richer than a single number, (1) the input classes are defined over combinations of fields rather than ranges, and (2) the output deserves partitioning of its own.

For the rest of the chapter we discuss testing a video streaming service, which gives us a function whose input and output are both worth partitioning.

> As a streaming service, I want to show each viewer only the titles they can play right now, so that no one is offered something they cannot watch.

A viewer can play a title when the title is published, it is licensed in the viewer's region, and, if it is a premium title, the viewer is on a premium plan.

<CollapsibleCode>

```typescript
type Tier = "free" | "premium";

type Title = {
    id: string;
    published: boolean; // finished processing and live
    tier: Tier;
    regions: string[];  // regions where the title is licensed
};

type Viewer = {
    id: string;
    plan: Tier;
    region: string; // where the viewer is watching from
};

/**
 * Determines whether a viewer can play a title.
 *
 * A title is playable when it is published, it is licensed in the viewer's
 * region, and, if it is a premium title, the viewer is on the premium plan.
 *
 * @param {Viewer} viewer the viewer attempting to watch
 * @param {Title} title the title being checked
 * @returns {boolean} true when the viewer may play the title, and false
 * otherwise
 */
function canPlay(viewer: Viewer, title: Title): boolean {
    if (title.published === false) {
        return false; // not live yet
    }
    if (title.regions.includes(viewer.region) === false) {
        return false; // not licensed in the viewer's region
    }
    if (title.tier === "premium") {
        if (viewer.plan === "premium") {
            return true;
        }
        return false; // premium title, viewer on the free plan
    }
    return true;
}

/**
 * Lists the titles a viewer can currently play.
 *
 * A title is included exactly when canPlay accepts it. Titles are returned
 * in catalogue order.
 *
 * @param {Title[]} catalogue the titles on offer
 * @param {Viewer} viewer the viewer watching
 * @returns {Title[]} the playable titles, or an empty array when none are
 * available
 */
function playableTitles(catalogue: Title[], viewer: Viewer): Title[] {
    const result: Title[] = [];
    for (const title of catalogue) {
        if (canPlay(viewer, title)) {
            result.push(title);
        }
    }
    return result;
}
```

</CollapsibleCode>

Our tests will run against the following catalogue:

```typescript
const catalogue: Title[] = [
    { id: "t1", published: true,  tier: "free",    regions: ["CA", "US"] },
    { id: "t2", published: false, tier: "free",    regions: ["CA"] },
    { id: "t3", published: true,  tier: "premium", regions: ["CA"] }
];
```
which includes a published free title licensed in two regions, an unpublished free title, and a published premium title.

### Partitioning a Composite Input

`playableTitles` does not take a number; it takes a whole `Viewer` and a `catalogue`. Its input classes are not numeric ranges but _relationships_ between fields. We can divide the viewer input into classes such as:

| Class | Representative viewer |
|---|---|
| Free plan, in a licensed region | `{ plan: "free", region: "CA" }` |
| Premium plan, in a licensed region | `{ plan: "premium", region: "CA" }` |
| In a region nothing is licensed for | `{ plan: "free", region: "EU" }` |

The specification also depends on catalogue contents: a published title vs. an unpublished one, a free title vs. a premium one. The classes are the meaningful _combinations_ of these, so a thorough suite needs more than one viewer paired with one title. As with a numeric input, the classes come from the _specification_ rather than the code. The main difference is that a representative is now a constructed `Viewer` _and_ `catalogue`, not a single value.

### Partitioning by Output

As the inputs to `playableTitles` are multi-dimensional and interact with each other, partitioning each input class individually may not yield a test suite that really tests all behaviours of `playableTitles`

Another way to guide our test suite writing is to try and partition the _output_, and write test cases for each output partition. For example `playableTitles` can return (1) an empty list, when nothing is playable; (2) a single title; or (3) several titles at once once. We need to choose inputs deliberately to hit each of these classes. For our catalogue above,  `playableTitles` will only return an empty list if the viewer is outside the regions "CA", "US".

Here's a suite of tests that cover each of the output classes:

<CollapsibleCode>

```typescript
test("a viewer outside every licensed region sees nothing", () => {
    const viewer: Viewer = { id: "v3", plan: "free", region: "EU" };
    const result = playableTitles(catalogue, viewer);

    expect(result).to.be.an("array"); // the right kind of value
    expect(result).to.be.empty; // the empty-result class
});

test("a free viewer sees published, licensed, non-premium titles", () => {
    const viewer: Viewer = { id: "v1", plan: "free", region: "CA" };
    const result = playableTitles(catalogue, viewer);

    expect(result).to.be.an("array"); // the right kind of value
    expect(result).to.have.length(1); // the single-result class
    expect(result.map(t => t.id)).to.have.members(["t1"]); // the title we expect
});

test("a premium viewer also sees premium titles", () => {
    const viewer: Viewer = { id: "v2", plan: "premium", region: "CA" };
    const result = playableTitles(catalogue, viewer);

    expect(result).to.be.an("array"); // the right kind of value
    expect(result).to.have.length(2); // the several-results class
    expect(result.map(t => t.id)).to.have.members(["t1", "t3"]); // the titles we expect
});
```

</CollapsibleCode>

Partitioning the input tells you which situations to feed a function; partitioning the output tells you which kinds of answer to confirm it can produce. Partioning only by input or only by output can leave a whole category of behaviour untested for functions with structured output.

## White-Box Testing

All the techniques we've discussed so far are forms of **black-box testing**. **Black-box testing** refers to tests that are derived by treating the function under test as a box whose contents we cannot see (called "black"). We derived these tests from a specification, without looking at the details of the function uner test.

Once an implementation exists, we can look into the box. **White-box testing** refers to tests that consider the _exact code written_ in the function under test. We read the code and ask: do our tests _exercise_ what was written? 

Reading code reveals the code's _branches_ (ref. [Chapter 1](01_new-language.html)). Each branch is a place a fault can hide untested. The decisions in `playableTitles` all live in its helper, `canPlay`, so that is where we look:

```typescript
function canPlay(viewer: Viewer, title: Title): boolean {
    if (title.published === false) {
        return false;            // branch 1: not live yet
    }
    if (title.regions.includes(viewer.region) === false) {
        return false;            // branch 2: not licensed in region
    }
    if (title.tier === "premium") {
        if (viewer.plan === "premium") {
            return true;         // branch 3: premium title, premium viewer
        }
        return false;            // branch 4: premium title, free viewer
    }
    return true;                 // branch 5: free title, allowed
}
```

Each branch needs a `(viewer, title)` pair that reaches it:

```typescript
test("every branch of canPlay is exercised", () => {
    const free: Viewer = { id: "v1", plan: "free", region: "CA" };
    const prem: Viewer = { id: "v2", plan: "premium", region: "CA" };

    const unpublished: Title =
        { id: "x", published: false, tier: "free", regions: ["CA"] };
    const elsewhere: Title =
        { id: "x", published: true, tier: "free", regions: ["US"] };
    const premiumHere: Title =
        { id: "x", published: true, tier: "premium", regions: ["CA"] };
    const freeHere: Title =
        { id: "x", published: true, tier: "free", regions: ["CA"] };

    expect(canPlay(free, unpublished)).to.be.false;  // branch 1
    expect(canPlay(free, elsewhere)).to.be.false;    // branch 2
    expect(canPlay(prem, premiumHere)).to.be.true;   // branch 3
    expect(canPlay(free, premiumHere)).to.be.false;  // branch 4
    expect(canPlay(free, freeHere)).to.be.true;      // branch 5
});
```

These five invocations of `canPlay` run every branch at least once. So, all parts of `canPlay` are executed with a test watching.

### Code Coverage

One advantage of the white-box view is it provides us a natural measure of the goodness of a test suite.
**Code coverage** seeks to answer: how much of the code does the suite execute? 

The most practical form is **branch coverage**: the fraction of branches run by at least one test. The five cases above execute all five branches of `canPlay`, for 100% branch coverage. Drop the two premium-title cases and coverage falls to three of five branches, with the code in branches 3 and 4 never covered. Measuring code coverage can point out the parts of your code your current tests ignore.

But full code coverage by a test suite does not mean the code is correct. Suppose an earlier version of `canPlay` had never checked regional licensing at all:

```typescript
function canPlay(viewer: Viewer, title: Title): boolean {
    if (title.published === false) {
        return false;
    }
    if (title.tier === "premium") {
        if (viewer.plan === "premium") {
            return true;
        }
        return false;
    }
    return true; // regional licensing is never checked
}
```

This version has four branches. A tests suite checking for: (1) an unpublished title, (2) a premium title for a premium viewer, (3) a premium title for a free viewer, and (4) a published free title gets 100% code coverage. But the code is wrong: a free title that is not licensed in the viewer's region is judged playable. 

Code coverage on its own cannot reveal this fault, the error is not because of an _untested_ branch but because of a _missing_ one. Coverage measures the code you wrote. Coverage cannot tell you more code is needed to match the specification. White-box testing _supplements_ black-box testing but never _replaces_ it: only the specification can tell you what ought to be in the code.


<details class="tooltip deep-dive">
<summary>Other Forms of Code Coverage</summary>

The most basic form of code coverage is **line coverage**, the percent of lines that are executed at least once by a test suite. But line coverage easily misses functionality. For instance, given `foo`:

```typescript
function foo(x: number): void | boolean {
   if (x > 5) {
      return true;
   }
}
```

The test suite:

```typescript
test("greater than 5 returns true", () => {
    expect(foo(6)).to.be.true;
});
```

covers every line, while never exercising the case where `foo` returns void. 

The sequence of branches that are taken in a program is called a _path_. If we could compute all the possible paths a function has, we could compute the _path coverage_ of a test suite: how many paths are covered by a test suite. This actually works for functions consisting only of if statements. But in the presence of loops and recursion, it becomes impossible to compute all the possible paths a function can have. Further, different paths aren't necessarily meaningful behavioural differences: do I really need to write a test for a loop executing 5 vs 6 times?

**Branch coverage** provides a nice compromise between these measures, and you will also see **line coverage** being used in practice.

</details>

## Regression Testing

A program is not finished when it first passes its tests. Code changes over time: bugs are fixed, features are added, and working code is reorganised. Every change is a chance to introduce a **regression**, a change that _breaks behaviour that previously worked_.

Tests guard against regressions. Suppose that months later a teammate sets out to tidy `canPlay`. They reason that every title in the catalogue is live by the time it ships, so the published check at the top is redundant, and remove it:

```typescript
function canPlay(viewer: Viewer, title: Title): boolean {
    if (title.regions.includes(viewer.region) === false) {
        return false;
    }
    if (title.tier === "premium") {
        if (viewer.plan === "premium") {
            return true;
        }
        return false;
    }
    return true;
}
```

The assumption is wrong: `t2` is not published, yet it is now judged playable. The change looks harmless, and a quick manual check on a live title would pass. Our test suite is rich enough that it catches this issue at once, because the test `"a free viewer sees published, licensed, non-premium titles"` still expects the result to have members `["t1"]`, and the broken version returns `["t1", "t2"]`. The suite knew something the manual check missed.

The job of a test suite you've seen so far is in implementation. Regression is the second job of a test suite, and over the life of a program it is the more important one. Tests do not only help you get code right the first time; they keep it right as it changes. Re-running the whole suite after every change, even one that looks unable to break anything, is what makes it safe to keep improving a program. The effort of writing tests is repaid each time someone touches the code.

## Verifying with Confidence


The type checker rules out malformed programs before they run. Tests show that the program behaves as its contract promises when it does run. Layered assertions make a failing test explain what kind of fault occurred. Partitioning the inputs and the outputs makes a passing suite meaningful. Coverage reveals the code the suite still ignores. Re-running the suite on every change keeps a correct program correct.

No single one of these verification techniques is enough on its own. Together, they are how we move from _claiming_ that a program honours its contract to being confident that it does.

This also closes Part 1. We have come a long way. You now understand the mechanics of modelling a problem with types, writing contracts and tests that validate behaviour, maintaining invariants, managing state, and changing data in the outside world. 

But so far, every program we have seen has been small enough for one person to hold in their head. [Part 2](../part2/index) investigates what happens when programs, teams, and lifetimes outgrow any single person, and we can no longer rely on that one programmer' sdiscipline to maintain invariants. We saw one way of maintaining even complex invariants in [Chapter 4](./04_maintaining-invariants), but had very little support from the programming language to do so. Building large code bases requires a new level of abstraction and new support from the programming language.



<details class="tooltip exercise">
  <summary>Exercise: Verifying a Shipping Calculator</summary>

The function below is complete. Your task is to verify it with a thorough suite of `expect` assertions.

> As a shipping desk, I want each parcel priced by its weight, with express doubling the rate and unshippable parcels rejected, so that customers are charged correctly and never quoted a price we cannot honour.

```typescript
/**
 * Computes the shipping cost for a parcel, in dollars.
 *
 * Standard rates by weight: up to 1kg costs $5; over 1kg and up to 5kg
 * costs $10; over 5kg and up to 20kg costs $20. Express shipping doubles
 * the standard rate.
 *
 * @param {number} weightKg the parcel weight in kilograms
 * @param {boolean} express whether express shipping was selected
 * @returns {number} the shipping cost in dollars
 * @throws {Error} "weight must be positive" when weightKg <= 0
 * @throws {Error} "too heavy to ship" when weightKg > 20
 */
function shippingCost(weightKg: number, express: boolean): number {
    if (weightKg <= 0) {
        throw new Error("weight must be positive");
    }
    if (weightKg > 20) {
        throw new Error("too heavy to ship");
    }
    let base: number;
    if (weightKg <= 1) {
        base = 5;
    } else if (weightKg <= 5) {
        base = 10;
    } else {
        base = 20;
    }
    return express ? base * 2 : base;
}
```

Design the tests, do not just write them. Work through:

1. _Equivalence classes._ Group the weights the specification treats alike, and choose one representative from each, for both standard and express shipping.
2. _Boundary values._ <span class="hint">The tier edges (1kg, 5kg, 20kg) and the lower limit (0kg) are where off-by-one mistakes hide.</span> Decide which values just inside, on, and just outside each boundary a thorough suite should include.
3. _Outputs._ Confirm each distinct cost the function can produce<span class="hint"> , and that express is exactly double the standard rate for the same weight.</span>
4. _Exceptions._ The contract names two ways the function throws. Assert each with <span class="hint"> `expect(() => ...).to.throw(...)`.</span>

Fill in the cases below, adding or removing rows so that every class, boundary, and exception above is represented:

```typescript
test("standard rate by weight tier", () => {
    expect(shippingCost(0.5, false)).to.equal(/* ? */);
    // ... a representative from each standard tier
});

test("express doubles the standard rate", () => {
    // ... the same representative weights, with express = true
});

test("boundary weights fall in the expected tier", () => {
    // ... 1, 5, and the values just above them
});

test("invalid and unshippable weights are rejected", () => {
    expect(() => shippingCost(0, false)).to.throw("weight must be positive");
    // ... a weight over 20
});
```

When you are done, consider whether your suite would provide you the informative errors you would want as an engineer. Would a single failing assertion tell you which class, boundary, or exception broke?

</details>