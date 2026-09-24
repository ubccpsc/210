# Validating Behaviour

A function's contract states what it _should_ do. A test shows what it _does_ for a chosen input.

The earlier chapters tested with `checkExpect` and `checkError`. These functions were a deliberately simple stand-in for the assertions used by real test frameworks. We will use `expect` for the remainder of the course. This is the assertion vocabulary provided by the [Chai](https://www.chaijs.com/) library that the [vitest](https://vitest.dev/) test runner (and many other testing frameworks) is built on.

The change is more than syntax. `checkExpect` could only compare for equality, and only reported failure in terms of that comparison. `expect` offers a family of assertion operators, each stating a different kind of expectation and, when it fails, reporting a message that describes the nature of the failure. A test case is also now a function body that you write, so it can build the values it needs, contain multiple assertions, and drive code that takes more than one step to set up.

## From `checkExpect` to `expect`

A `checkExpect` call paired the expression under test, wrapped in `() =>`, with an expected value. A Chai assertion reads more like a sentence. It names the value under test, then states what must be true of it. The most common assertion is equality, and every `checkExpect` we have written can be translated directly:

```typescript
// previously, with the course toolkit's checkExpect
test("no fee at the grace boundary", checkExpect(() => lateFee(2), 0));

// from here on, with Chai's expect
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

Most assertions take an expected value in parentheses. A few, such as existence checks, are written as a property with no parentheses. The words in between, `to`, `be`, and `have` only exist to make the assertion more natural to read.

Chai's `expect` is a **behaviour-driven development** (BDD) assertion library. BDD is a style of testing that describes what code should do in language _close to ordinary prose_, so a test reads as a statement of _behaviour_ rather than a low-level comparison.

For example, the assertion 
```typescript
expect(() => requireSection(catalogue, "NOPE")).to.throw("no section with id NOPE");
```
is more verbose than our `checkError` before, but it reads _almost_ the same as the English sentence it stands for. If the test description is also clear, the whole test case is a readable description of the behaviour it checks. This lets a test suite serve as documentation of what the code is meant to do, which is why Chai favours a longer, readable form over a terse one.
</details>

Errors translate just as directly. Recall `requireSection` from the previous chapter, which throws when no section matches the requested id. `checkError` ran a function and passed if it threw, and `expect(...).to.throw` does the same:

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

`to.throw` is also more precise than `checkError`. It takes the message we expect the failure to carry, and passes only if the thrown error's message contains it. A `checkError` test written with one failure in mind would still pass if a different failure happened. A `to.throw` test with a message does not.

<!--
<details class="tooltip ts-tips">
<summary>Importing <code>expect</code></summary>

From here on, test files import `expect` in place of `checkExpect` and `checkError`:

```typescript
import { test, expect } from "@ubccpsc/210-toolkit/testing";
```

`test` groups and names cases exactly as before. `expect` is the assertion function from the Chai library, which the vitest runner uses to evaluate your tests; the course toolkit re-exports it so the import stays in one place.

</details>
-->

<details class="tooltip ts-tips">
<summary><code>equal</code> Versus <code>deep.equal</code></summary>

`to.equal` compares with `===`. That is correct for numbers, strings, and booleans, but not for objects and arrays. For those, `===` asks whether two values are _the same object in memory_, not whether they hold the same contents, so two separately built objects with identical fields are not equal.

```typescript
expect({ id: "CPSC210" }).to.equal({ id: "CPSC210" });      // fails: different objects
expect({ id: "CPSC210" }).to.deep.equal({ id: "CPSC210" }); // passes: same contents
```

`to.deep.equal` compares structure. It checks that the two values have the same shape and the same values throughout. `checkExpect` always compared using deep equality, so when you translate a `checkExpect` whose expected value is an object or an array, use `deep.equal`, not `equal`.

</details>

<details class="tooltip link-110">
<summary>A Family of Checks</summary>

CPSC 110 already had more than one kind of check. Alongside `check-expect` you used `check-within` for numbers that need only be close, `check-member-of` for a value that must be one of several, `check-range` for a number in an interval, and `check-error` for an expression that must signal an error. Chai offers a larger set built on the same idea. `check-within` becomes `to.be.closeTo`, `check-member-of` becomes `to.be.oneOf`, and `check-error` becomes `to.throw`.

</details>


### A Vocabulary of Assertions

Beyond equality, Chai groups its assertions by the kind of property they check. A few cover most of what you will write:

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

None of these is strictly necessary. Each could be written as an equality or boolean check: `expect(ids.includes("CPSC210")).to.equal(true)` does the same work as `expect(ids).to.include("CPSC210")`.

Using a more specific operator is better for two reasons. First, it shows at a glance _what_ is being checked, rather than a handwritten expression that happens to reduce to a boolean. Second, when it fails, it reports the actual problem. The generic form (`expect(ids.includes("CPSC210")).to.equal(true)`) reports:

```text
AssertionError: expected false to equal true
```

while the specific form (`expect(ids).to.include("CPSC210")`) names the value and the missing element:

```text
AssertionError: expected [ 'CPSC213' ] to include 'CPSC210'
```

With a specific operator, a failing test reports the cause of the failure.

<details class="tooltip ts-tips">
<summary>When do we need to add <code>() =></code>?</summary>

Above, the argument to `expect` is usually a variable, but for `to.throw` it is a function call wrapped in `() =>`. This is because `to.throw` must observe the _execution_ of the function to see whether it throws. It cannot examine a return value, because a function that throws has no return value (recall [Chapter 8](./08_errors)).

If you can write:
```typescript
const v = f();
expect(v).[...]
```
then you can write

```typescript
expect(f()).[...]
```

Any assertion (like `throw`) that must _observe the execution of f_ needs to be wrapped. Without the wrapper, the assertion cannot work:

```typescript
const v = f();                  // if f throws, the test stops here, before expect runs
expect(v).to.throw("error");    // otherwise v is f's result, not a function expect can run
```

With the wrapper, `expect` receives the function itself, runs it, and observes the throw:

```typescript
expect(() => f()).to.throw("error");
```
</details>

<!--
<details class="tooltip deep-dive">
<summary>What Developers Write in Practice</summary>

These categories are not arbitrary. A study of 33,873 assertions drawn from 105 open-source JavaScript and TypeScript projects ([Zamprogno et al., 2022](https://www.cs.ubc.ca/~rtholmes/papers/tse_2022_zamprogno.pdf)) found that developer-written assertions, although numerous, are simple: the median test case contains a single assertion, and most assertions use a single operator. Almost all fell into twelve categories, with equality the most common at roughly 39%, followed by boolean, inclusion, length, and existence checks like the ones above. The same study found that nearly a quarter of the equality checks could have been written with a more specific operator that would read more clearly and fail more informatively. Two lessons carry over to your own tests: keep individual assertions simple, and prefer the operator that names what you mean.
</details>
-->

## Richer Test Cases

Moving from `checkExpect` to `expect` is more than a syntax change. It lets us write richer test cases. Consider the second argument to `test` in `test("no fee at the grace boundary", () => {expect(lateFee(2)).to.equal(0);});`. It is a function. `checkExpect` hid this: `checkExpect(...)` built the function that `test` would call to carry out the check.

For the rest of the course we will write that function ourselves:

```typescript
test(<description>, () => {
    <statements>
});
```

The description is unchanged, but the body is now an ordinary arrow function with a block body, so it can hold any number of statements. (As [Chapter 1](./01_new-language) described, a block body returns nothing implicitly. A test body has nothing to return anyway, because the runner judges the case by whether an assertion inside it failed.) This removes three restrictions of the earlier form:

1. _A test case can hold as many assertions as the behaviour needs._ We had one check per test case because the check _was_ the test body, not because a good test has only one check. With a block body, a test can state several expectations about a single result. This helps pinpoint what is wrong with our code. By ordering assertions from general to specific, a failure tells us the _kind_ of fault, not just that there is one. You may still write one assertion per test case, but it is now a choice rather than a limitation.

2. _Setup belongs inside the case._ In earlier chapters, a check was a single call `checkExpect(() => <actual>, <expected>)`, so any values the check needed had to be declared above the tests, at the top level of the file. Everything declared there is visible to every later test. If one of those values is _mutable_ ([Chapter 6](./06_state-mutation)), changes made by one test are visible to every later test, and the suite can pass or fail depending on the order its cases run in. With a block body, each test case can hold its own `const` and `let` declarations, building only the values it needs without affecting other tests.

3. _Code under test can be driven through several steps._ We have seen that a `checkExpect` thunk could hold more than one statement, but it still had to reduce all the computation to one final value to check. A test body has no such limit. It can construct a value, configure it, exercise it, and assert at any point along the way, choosing a different operator for each assertion. Real tests needs this because the behaviour under test is not reachable until the value has been built up through several steps.

## Richer Failures

Consider a function that lists the sections a student can currently enrol in: those courses they have not already passed and whose prerequisites they have completed. We reuse the `Section` and `Student` types from [Chapter 8](./08_errors), with a catalogue that now offers two first-year courses:

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

A student who has finished both first-year courses can take `CPSC210`, but not yet `CPSC213`. A single assertion can check the whole result:

```typescript
test("a student who finished first year can take CPSC210", () => {
    const student: Student = { id: "s1", completed: ["CPSC110", "CPSC121"] };
    expect(eligibleSections(catalogue, student)).to.deep.equal([{ id: "CPSC210", prerequisite: ["CPSC110"] }]);
});
```

This assertion is correct and will catch any fault. But consider what it tells you when it fails. The report says only that one array did not deeply equal another, and leaves you to compare them yourself. Did the function return `undefined`? An array of the wrong length? The right length but the wrong section? The right section with the wrong prerequisites? Every one of those faults produces a very similar error message.

With a block body, we do not need to rely on a single assertion. We can get more precise failure messages by thinking about the different ways `eligibleSections` can fail, and writing a _sequence_ of assertions that catches each one, ordered from the most general to the most specific:

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

Only the last assertion is strictly necessary. If it passes, every assertion above it must pass too, and if any of them would fail, the last one would fail as well.

The benefit appears when a test fails. Each kind of fault now trips a different, earlier assertion, and the _first_ failure names the problem:

```text
expected undefined to exist                       // returned nothing
expected [ … ] to have a length of 1 but got 2    // returned too many sections
expected [ 'CPSC213' ] to include 'CPSC210'       // returned the wrong section
```

Only a result that exists, is an array of the right length, and contains the expected id, but still differs somewhere in its contents, reaches the final `deep.equal`. With the general checks first, the earliest failure is always the most fundamental one, so you learn the _kind_ of mistake before its details.

You need not attach five assertions to every test, because redundant checks clutter a test without adding meaning. Layering is worthwhile when a value is structured enough that a _bare equality failure_ is hard to read, or when a function makes several independent guarantees worth checking separately. For the example above, we might skip the `to.exist` assertion and the one using `map`. The aim is not more assertions but more _informative_ ones.

As in software design more broadly, test design rarely has a single right answer. `expect` lets you write several assertions per test, and you decide when that is worth doing.

## Partitioning
 
A test case has three parts: constructing inputs, exercising the code with those inputs, and asserting that it behaves as expected. We have discussed richer assertions. Now we turn to choosing inputs.

In [Chapter 3](./03_checking-invariants), we divided a function's input space into equivalence classes, grouping the inputs the specification treats alike, and tested one representative of each. We also looked closely at the boundaries between these equivalence classes.

These techniques are the basis of input selection. But once a function's inputs and outputs are more complex than a single number, the input classes are defined over combinations of fields rather than ranges. We can also do the same thing by analyzing the output and partitioning on its classes as well.

For the rest of the chapter we test a video streaming service, whose main function has both an input and an output worth partitioning.

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

### Partitioning Inputs

`playableTitles` does not take a number. It takes a whole `Viewer` and a `catalogue`, and its input classes are not numeric ranges but _relationships_ between fields. We can divide the viewer input into classes such as:

| Class | Representative viewer |
|---|---|
| Free plan, in a licensed region | `{ plan: "free", region: "CA" }` |
| Premium plan, in a licensed region | `{ plan: "premium", region: "CA" }` |
| In a region nothing is licensed for | `{ plan: "free", region: "EU" }` |

The specification also depends on the catalogue's contents: a published title versus an unpublished one, and a free title versus a premium one. The classes are the meaningful _combinations_ of these, so a thorough suite needs more than one viewer paired with one title. As with a numeric input, the classes come from the _specification_ rather than the code. The difference is that a representative is now a constructed `Viewer` _and_ `catalogue`, not a single value.

### Partitioning Outputs

Because the inputs to `playableTitles` have several dimensions that interact, partitioning each input separately may not produce a suite that tests all of its behaviours.

Another way to guide the suite is to partition the _output_, and write a test case for each output class. `playableTitles` can return an empty list when nothing is playable, a single title, or several titles. We need to choose inputs deliberately to reach each of these. For the catalogue above, `playableTitles` returns an empty list only if the viewer is outside the regions "CA" and "US".

Here is a suite of tests that covers each output class:

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

Partitioning the input tells you which situations to give a function, and partitioning the output tells you which kinds of answer to confirm it can produce. For functions with structured output, partitioning only one of the two can leave a whole category of behaviour untested.

## White-Box Testing

All the techniques so far are forms of **black-box testing**, where tests are derived by treating the function under test as a box whose contents we cannot see. We derived them from a specification, without looking at the function's implementation.

Once an implementation exists, we can look inside. **White-box testing** derives tests from the _code as written_. We read the code and ask whether our tests _exercise_ everything it does.

Reading code reveals its _branches_, and each branch is a place a fault can hide untested. The decisions in `playableTitles` are all in its helper, `canPlay`, so that is where we look:

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

These five calls to `canPlay` run every branch at least once, so every part of `canPlay` is executed by some test.

### Code Coverage

The white-box view also gives a natural measure of how thorough a test suite is. **Code coverage** measures how much of the code the suite executes.

A commonly-used form is **branch coverage**: the fraction of branches run by at least one test. The five cases above execute all five branches of `canPlay`, for 100% branch coverage. Without the two premium-title cases, coverage falls to three of five branches, and branches 3 and 4 are never run. Measuring coverage points out the parts of your code your tests do not reach.

But full coverage does not mean the code is correct. Suppose an earlier version of `canPlay` had never checked regional licensing:

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

This version has four branches. A suite that checks an unpublished title, a premium title for a premium viewer, a premium title for a free viewer, and a published free title gets 100% coverage. But the code is wrong: a free title that is not licensed in the viewer's region is judged playable.

Coverage cannot reveal this fault, because the problem is not an _untested_ branch but a _missing_ one. Coverage measures the code you wrote, and cannot tell you that more code is needed to meet the specification. White-box testing _supplements_ black-box testing but never _replaces_ it, because only the specification says what the code ought to do.

<details class="tooltip deep-dive">
<summary>Other Forms of Code Coverage</summary>

The most basic form of code coverage is **line coverage**, the percentage of lines executed at least once by a test suite. But line coverage can miss behaviour. For instance, given `foo`:

```typescript
function foo(x: number): boolean | undefined {
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

covers every line, but never exercises the case where `foo` returns `undefined`, when `x` is 5 or less.

The sequence of branches taken in one run of a program is called a _path_. If we could list all the possible paths through a function, we could measure a suite's _path coverage_, the share of paths it runs. This is possible for functions made only of `if` statements, but with loops and recursion the number of paths can be unbounded. Different paths are also not always meaningfully different: a loop running 5 times rather than 6 rarely needs its own test.
</details>

## Regression Testing

A program is not finished when it first passes its tests. Code changes over time as bugs are fixed, features are added, and working code is reorganised. Every change can introduce a **regression**, a change that _breaks behaviour that previously worked_.

Tests guard against regressions. Suppose that months later a teammate tidies `canPlay`. They reason that every title in the catalogue is published by the time it ships, so the published check at the top is redundant, and they remove it:

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

The assumption is wrong: `t2` is not published, yet it is now judged playable. The change looks harmless, and a quick manual check on a published title would pass. The test suite catches it immediately. The test `"a free viewer sees published, licensed, non-premium titles"` expects exactly one title, and the changed version returns two, `t1` and `t2`, so its `to.have.length(1)` assertion fails.

So far, the tests you have written helped you get an implementation right. Catching regressions is their second job, and over the life of a program it is the more important one. Re-running the whole suite after every change, even one that looks harmless, is what makes it safe to keep changing a program, and the effort of writing tests is repaid each time someone touches the code.

#### Validating with Confidence

Each technique in this chapter checks something different. The type checker rules out malformed programs before they run, and tests show that the program does what its contract promises when it runs. Layered assertions make a failing test explain the fault, partitioning inputs and outputs makes a passing suite meaningful, coverage shows the code the suite does not reach, and re-running the suite on every change keeps a correct program correct. No one technique is enough on its own. Used together, they give us good reason to believe a program honours its contract.

This closes Part 1. You now understand the mechanics of modelling a problem with types, writing contracts and tests that validate behaviour, maintaining invariants, managing state, and changing data in the outside world.

So far, every program we have seen has been small enough for one person to hold in their head. [Part 2](../part2/index) looks at what happens when programs and teams grow beyond what one person can manage, and we can no longer rely on one programmer's discipline to maintain invariants. [Chapter 4](./04_maintaining-invariants) showed one way to maintain invariants, but with very little support from the programming language. Building large code bases requires new abstractions and more support from the language.

<details class="tooltip exercise">
  <summary>Exercise: Validating a Shipping Calculator</summary>

The function below is complete. Your task is to validate it with a thorough suite of `expect` assertions.

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

Design the tests before writing them. Work through:

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

When you are done, consider whether your suite gives the informative errors you would want as an engineer. Would a single failing assertion tell you which class, boundary, or exception broke?

</details>
