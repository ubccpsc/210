# Verifying Behaviour

A function's contract states what it should do; a test demonstrates that it does, for a chosen input. The earlier chapters began this practice with `checkExpect`: write down an input and the result the contract promises, and let the framework compare the two. That was enough to get started, but it kept two things simple that real test suites do not. Our assertions checked little beyond equality, and we chose our tests one clause of the contract at a time. This chapter develops both: a richer vocabulary for stating what a result must satisfy, and more systematic ways to judge whether a suite checks enough.

It also changes our tools. The `checkExpect` and `checkError` functions were a deliberately simple stand-in for the assertions used in real test frameworks, and from here on we use those assertions. We write tests with `expect`, the assertion vocabulary provided by the chai library that the vitest test runner is built on.

The change is more than spelling, and every part of it is a gain. `checkExpect` did exactly one thing, compare for equality, and could report a failure only in those terms; `expect` offers a family of assertion operators, each stating a different kind of expectation and, when it fails, reporting a message that names the actual problem. The shape of a test case changes along with it: a case is now a function body that you write, so it can hold several assertions, build the values it needs privately, and drive code that takes more than one step to configure. Nothing we could say before becomes harder to say; the earlier form turns out to have been a restricted version of this one. Learning to choose among the assertion operators is the first half of this chapter.

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

Most assertions take an expected value in parentheses; a few, such as existence checks, are written as a property with no parentheses at all. The chained words in between, `to`, `be`, and `have`, are there only to make the assertion read as English; they carry no meaning of their own. The chained shape of these assertions has been deliberately designed to mimic sentence structure. `expect` is a **behaviour-driven development** (BDD) assertion library, and BDD is a style of testing that describes what code should do in language close to ordinary prose, so that a test reads as a statement of behaviour rather than a low-level comparison. The assertion `expect(() => requireSection(catalogue, "NOPE")).to.throw("no section with id NOPE")` is more verbose than a bare check would be, but it reads almost as the English sentence it stands for, and under a descriptive test name the whole case doubles as a human-readable description of the behaviour it verifies. That legibility is what lets a test suite serve as documentation of what the code is meant to do, and it is why chai favours a longer, readable form over a terse one.
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

As with `checkExpect` and `checkError`, the call under test is wrapped in `() =>` so that `expect` can run it and observe the throw, rather than receiving an error that has already escaped. The translation also gains something: `checkError` could say only that the call failed, leaving the reason to the test's description, while `to.throw` takes the message we expect the failure to carry. The string is matched against the thrown error's message; the assertion passes when the message contains it. A test that expected the wrong failure used to pass; now it does not.

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

## What a Test Case Can Now Hold

Both translations above change something beyond just syntax. Look at the second argument to `test`. Previously that argument _was_ the check: `checkExpect(...)` built the body of the case and handed it over, and `test` named it. For the rest of the course we write that function ourselves:

```typescript
test(<description>, () => {
    <statements>
});
```

The description is unchanged, and it is still what the runner prints. What is new is that the body is an ordinary arrow function with a block body, so it can hold any number of statements. (As [Chapter 1](./01_new-language) described, a block body returns nothing implicitly. A test body has no value to return in any case: the runner judges the case by whether an assertion inside it failed, not by what the body produced.) This erases the three restrictions of the earlier form:

_A case can hold as many assertions as the behaviour needs._ One check per case was a consequence of the check _being_ the body, not a judgement about what makes a good test. A block body can state several expectations about a single result, which is the technique the _Layering Assertions for Clearer Failures_ section develops below: ordering assertions from general to specific so that the first failure names the kind of fault rather than merely reporting that one exists. One assertion per case is still possible, but it is now a choice you make rather than a limit you write around.

_Setup belongs inside the case._ The earlier chapters had to declare a check's values above the tests, at the top level of the file. A check is a single call, `checkExpect(() => <actual>, <expected>)`, and a `const` declared inside the thunk is invisible to the `<expected>` argument written beside it, so any value the two sides shared had to be declared outside the check altogether. Everything declared there is visible to every later test, and, once mutation was introduced in the state chapter, changeable by every later test: a suite built that way can pass or fail depending on the order its cases happen to run in. A block body holds its own `const` declarations, so each case builds exactly the values it needs and no case can disturb another's. The tests later in this chapter all begin this way, constructing a `student` or a `viewer` before calling the function under test.

_Code under test can be driven through several steps._ A `checkExpect` thunk could hold more than one statement, as the async example in the previous chapter showed, but everything it did had to funnel into one value that was then compared for equality. A test body has no such funnel. It can construct a value, configure it, exercise it, and assert at any point along the way, choosing a different operator for each assertion. Most real testing needs exactly that: behaviour that is not reachable until the value under test has been built up through several steps. Test runners extend this further with **lifecycle hooks**, `beforeEach` and `afterEach`, which run around every case so that setup common to a group of tests is written once while each case still receives its own fresh copy of it. 

Better failure reporting is the fourth improvement, and it is the subject of the next two sections.

## A Vocabulary of Assertions

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

None of these is strictly necessary. Each could be rewritten as an equality or boolean check: `expect(ids.includes("CPSC210")).to.equal(true)` does the same work as `expect(ids).to.include("CPSC210")`. The specific operator is better for two reasons. It states intent at a glance, so a reader of the test sees _what_ is being checked rather than a hand-written expression that happens to reduce to a boolean. And when it fails, it reports the actual problem. The generic form can only say:

```text
AssertionError: expected false to equal true
```

while the specific form names the value and the missing element:

```text
AssertionError: expected [ 'CPSC213' ] to include 'CPSC210'
```

The first tells you only that a boolean was not as expected; the second tells you which array was missing which element. A test that fails should point at its cause, and a specific operator is what makes that possible.

<!--
<details class="tooltip deep-dive">
<summary>What Developers Write in Practice</summary>

These categories are not arbitrary. A study of 33,873 assertions drawn from 105 open-source JavaScript and TypeScript projects ([Zamprogno et al., 2022](https://www.cs.ubc.ca/~rtholmes/papers/tse_2022_zamprogno.pdf)) found that developer-written assertions, although numerous, are simple: the median test case contains a single assertion, and most assertions use a single operator. Almost all fell into twelve categories, with equality the most common at roughly 39%, followed by boolean, inclusion, length, and existence checks like the ones above. The same study found that nearly a quarter of the equality checks could have been written with a more specific operator that would read more clearly and fail more informatively. Two lessons carry over to your own tests: keep individual assertions simple, and prefer the operator that names what you mean.
</details>
-->

## Layering Assertions for Clearer Failures

A specific operator improves a single assertion. When the value under test is structured, a second technique improves the test as a whole, and it is the first real use we make of a case that can hold more than one assertion. Consider a function that lists the sections a student can currently enrol in: those they have not already completed and whose prerequisites they have all met. We reuse the `Section` and `Student` types from the previous chapter, with a catalogue that now offers two first-year courses:

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

A student who has finished both first-year courses can take `CPSC210`, but not yet `CPSC213`. One assertion can pin the answer down exactly:

```typescript
test("a student who finished first year can take CPSC210", () => {
    const student: Student = { id: "s1", completed: ["CPSC110", "CPSC121"] };
    expect(eligibleSections(catalogue, student)).to.deep.equal([{ id: "CPSC210", prerequisite: ["CPSC110"] }]);
});
```

This is correct and complete. But consider what it tells you when it fails. The report says only that one array did not deeply equal another, and leaves you to compare them by eye. Did the function return `undefined`? An array of the wrong length? The right length but the wrong section? The right section with the wrong prerequisites recorded? Every one of those faults produces the same shape of message.

Now write the same expectation as a sequence of assertions, ordered from the most general to the most specific:

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

Only the last assertion is strictly necessary: if it passes, every assertion above it must have passed too. Their value is in what they report when something is wrong. Each kind of fault now trips a different, earlier assertion, and the _first_ failure names the problem:

```text
expected undefined to exist                       // returned nothing
expected [ … ] to have a length of 1 but got 2    // returned too many sections
expected [ 'CPSC213' ] to include 'CPSC210'       // returned the wrong section
```

Only a result that exists, is an array of the right length, and contains the expected id, yet still differs somewhere in its contents, survives to the final `deep.equal`. Ordering matters: with the general checks first, the earliest failure is always the most fundamental one, and you learn the _kind_ of mistake before its details.

This is not a licence to attach five assertions to every test. A case holding exactly one assertion remains the common shape, and redundant checks clutter a test without adding meaning; what changed is that the count is now yours to choose rather than fixed at one. Layering is worthwhile when a value is structured enough that a bare equality failure would be hard to read, or when a function makes several independent guarantees worth confirming separately. The aim is not more assertions but more _informative_ ones. Specifically for this example, it would be easy to skip the assertion checking that the value existed, and the one performing the `map` operation.

## Partitioning Inputs and Outputs

Choosing what to assert is one half of test design; choosing the inputs is the other. The invariant checking chapter divided a function's input space into equivalence classes, groups the specification treats alike, and tested one representative of each, looking hardest at the boundaries between classes. Those techniques carry over unchanged. Two things grow once a function's inputs and outputs are richer than a single number: the input classes are defined over combinations of fields rather than ranges, and the output deserves partitioning of its own.

For the rest of the chapter we move to a video streaming service, which gives us a function whose input and output are both worth partitioning.

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

The examples below all run against one catalogue: a published free title licensed in two regions, an unpublished free title, and a published premium title.

```typescript
const catalogue: Title[] = [
    { id: "t1", published: true,  tier: "free",    regions: ["CA", "US"] },
    { id: "t2", published: false, tier: "free",    regions: ["CA"] },
    { id: "t3", published: true,  tier: "premium", regions: ["CA"] }
];
```

### Partitioning a Composite Input

`playableTitles` does not take a number; it takes a whole `Viewer` and a `catalogue`. Its meaningful classes are not numeric ranges but _relationships_ between fields: between a viewer's plan and a title's tier, and between a viewer's region and the regions a title is licensed in. The viewer input divides into classes such as:

| Class | Representative viewer |
|---|---|
| Free plan, in a licensed region | `{ plan: "free", region: "CA" }` |
| Premium plan, in a licensed region | `{ plan: "premium", region: "CA" }` |
| In a region nothing is licensed for | `{ plan: "free", region: "EU" }` |

The catalogue adds further dimensions that the specification treats distinctly: a published title versus an unpublished one, and a free title versus a premium one. The classes are the meaningful _combinations_ of these, so a thorough suite needs more than one viewer paired with one title. As with a numeric input, the classes come from the specification rather than the code; the only difference is that a representative is now a constructed `Viewer` and `catalogue`, not a single value.

### Partitioning by Output

With a single-number result like `lateFee`, partitioning the input was sufficient, because each input class produced its own kind of output. A structured result has classes of its own that do not line up one-to-one with the input. `playableTitles` can return an empty list, when nothing is playable; a single title; or several at once. A suite with a representative of every input class can still miss an output class.

The mismatch is easy to see. The viewer's plan is the most visible input dimension, but it does not decide whether the result is empty: the _largest_ result here comes from the most permissive input, a premium viewer, while the empty result comes from a viewer in a region where nothing is licensed, whatever their plan. Reaching each output class takes a deliberately chosen input, and each test layers its assertions from general to specific, as before, so that a failure names which aspect of the result is wrong:

<CollapsibleCode>

```typescript
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

test("a viewer outside every licensed region sees nothing", () => {
    const viewer: Viewer = { id: "v3", plan: "free", region: "EU" };
    const result = playableTitles(catalogue, viewer);

    expect(result).to.be.an("array"); // the right kind of value
    expect(result).to.be.empty; // the empty-result class
});
```

</CollapsibleCode>

Partitioning the input tells you which situations to feed a function; partitioning the output tells you which kinds of answer to confirm it can produce. A function with a structured result needs both, because either partitioning alone can leave a whole category of behaviour untested.

## White-Box Testing

The techniques so far are all forms of **black-box testing**: every test was derived from the specification, with the implementation treated as a box we cannot see into. Black-box tests check that a function does what it promises. Once an implementation exists, we can also open the box.

**White-box testing** takes this complementary view. We read the code and ask a different question: do our tests _exercise_ what was written? Reading reveals the code's branches, and each branch is a place a fault can hide untested. The decisions in `playableTitles` all live in its helper, `canPlay`, so that is where we look:

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

With those five cases every branch runs at least once, so no part of `canPlay` executes only when no test is watching.

### Code Coverage

**Code coverage** makes the white-box question measurable: how much of the code does the suite execute? The most practical form is **branch coverage**, the fraction of branches run by at least one test. The five cases above execute all five branches of `canPlay`, for 100% branch coverage. Drop the two premium-title cases and coverage falls to three of five branches, with a report pointing at the exact lines no test reaches. That is what coverage is for: it finds the parts of your code the suite silently ignores.

But coverage has a sharp limit. Suppose an earlier version of `canPlay` had never checked regional licensing at all:

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

This version has four branches. A suite with an unpublished title, a premium title for a premium viewer, a premium title for a free viewer, and a published free title executes all four, for 100% branch coverage, and it is still wrong: a free title that is not licensed in the viewer's region is judged playable, because the rule that would reject it was never written. Coverage could not reveal the fault, because the fault was not an untested branch but a _missing_ one. Coverage measures the code you wrote, never the code the specification required. This is why white-box testing supplements black-box testing but never replaces it: reading the code tells you whether your tests reach what is there, while only the specification can tell you what ought to be there.

## Regression Testing

A program is not finished when it first passes its tests. Code changes over time: bugs are fixed, features are added, and working code is reorganised. Every change is a chance to introduce a **regression**, a change that breaks behaviour that previously worked.

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

The assumption is wrong: `t2` is not published, yet it is now judged playable. The change looks harmless, and a quick manual check on a live title would pass. The suite catches it at once, because the test `"a free viewer sees published, licensed, non-premium titles"` still expects the result to have members `["t1"]`, and the broken version returns `["t1", "t2"]`. The suite knew something the manual check missed.

This is the second job of a test suite, and over the life of a program it is the more important one. Tests do not only help you get code right the first time; they keep it right as it changes. Re-running the whole suite after every change, even one that looks unable to break anything, is what makes it safe to keep improving a program. The effort of writing tests is repaid each time the code is touched.

## Verifying with Confidence

Effective verification strategies are layered such that each approach provides additional unique insight into the correctness of a program. The type checker rules out malformed programs before they run. Tests show that the program behaves as its contract promises when it does run. Specific, layered assertions make a failing test explain not merely that something is wrong but what kind of fault occurred. Partitioning the inputs and the outputs makes a passing suite meaningful rather than merely green. Coverage reveals the code the suite still ignores, and re-running the suite on every change keeps a correct program correct. No single one of these is enough on its own. Together they are how we move from claiming that an abstraction honours its contract to having earned the confidence that it does.

This also closes Part 1. You now understand the mechanics of modelling a problem with types, writing contracts and tests that validate behaviour, maintaining invariants, managing state, and changing data in the outside world. We have come a long way: TypeScript is a fully-featured, industrial-strength language. 

But so far, every program we have seen has been small enough for one person to hold in their head, and that has let personal discipline carry a lot of weight in ensuring the program works as intended. [Part 2](../part2/index) investigates what happens when it cannot: when programs, teams, and lifetimes outgrow any single person, and the discipline has to move into the language itself. That means structuring code so the invariants these tests rely on cannot be broken from the outside in the first place, which requires a new level of abstraction and new support from the programming language.



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
2. _Boundary values._ The tier edges (1kg, 5kg, 20kg) and the lower limit (0kg) are where off-by-one mistakes hide. Decide which values just inside, on, and just outside each boundary a thorough suite should include.
3. _Outputs._ Confirm each distinct cost the function can produce, and that express is exactly double the standard rate for the same weight.
4. _Exceptions._ The contract names two ways the function throws. Assert each with `expect(() => ...).to.throw(...)`.

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