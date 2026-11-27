# Working with the DOM

This document explains how a TypeScript program reads and changes a web page. The first three sections describe the model: what a page is to a program, where the program runs, and what an element is. The sections after them are recipes for common DOM-related tasks.

## The Example Page

Our example page shows a weather station's readings for one day. The user types a temperature and presses Refresh, and the page shows the readings warmer than the provided value.

`index.html` describes the page:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Weather Station</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Weather Station</h1>

    <label for="threshold">Warmer than</label>
    <input id="threshold" type="text" value="-10">
    <button id="refresh" type="button">Refresh</button>

    <ul id="readings" aria-label="Readings"></ul>
    <p id="message" role="status"></p>

    <script src="app.js"></script>
</body>
</html>
```

The text between angle brackets is a tag. `<button ...>` opens a button and `</button>` closes it, and what sits between the two is the button's content. The `name="value"` pairs inside an opening tag are its attributes. The `id` attribute gives an element a name that is unique on the page, and it is how a program finds the element in the page.

## The Page Is a Tree of Objects

`index.html` is text. When the browser loads it, the browser builds one object for every element the text describes and arranges the objects in a tree:

```text
document
└── html
    ├── head
    │   ├── meta
    │   ├── title
    │   └── link
    └── body
        ├── h1
        ├── label
        ├── input    #threshold
        ├── button   #refresh
        ├── ul       #readings
        ├── p        #message
        └── script
```

This tree is called the Document Object Model, or DOM. The browser renders the screen from the tree, and it redraws whenever the tree changes. A program changes what is rendered by updating the objects in the DOM.

- A program never edits `index.html`. The file describes the initial state of the page. All of the updates after that are made to the DOM objects in memory.
- Reloading the page discards the tree and builds a new one, starting from `index.html` again. Whatever the program had changed is gone, and the program starts again from its first line.

The global variable `document` is the root of the tree and every other element is reached from this reference.

## Where Your Code Runs

A web page involves two programs, one on each side of a network:

| | The server | The page's script |
|---|---|---|
| Runs in | Node | the browser |
| Started by | a command in the terminal | the browser loading the page |
| Can use | files, with `readFile` and `writeFile` | `document` and the elements of the page |
| Cannot use | `document`: there is no page | files on disk |
| `console.log` prints to | the terminal | the browser's console |

The server's part in showing a page is small. The browser asks for `index.html`, then for each file the page names, such as `styles.css` and `app.js`, and the server sends them. The script then runs inside a browser tab.

Three details of this arrangement cause most early confusion:

- **The browser runs JavaScript, not TypeScript.** A build step compiles your `.ts` files and combines them into the one file the page loads, here `app.js`. In the labs, starting the server also starts this build, and it rebuilds it whenever you save a file.
- **The browser does not reload on its own.** After changing your code, you must reload the page in the browser to load the rebuilt script.
- **Errors appear in the browser.** An exception thrown by the page's script is reported in the browser's console, not in the terminal. To open the console, right-click the page, choose Inspect, and select the Console tab.

The `<script>` tag is the last thing in the `<body>`. The browser builds the tree from the top of the file down and runs a script when it reaches it, so a script at the end runs after every element above it exists.

## Elements Are Objects

`document.querySelector(selector)` finds an element. It takes a selector, a string that describes which element is wanted, and returns the first element that matches, or `null` if nothing does:

```typescript
const refresh: HTMLButtonElement | null = document.querySelector<HTMLButtonElement>("#refresh");
```

The selector is written in the notation that stylesheets use, which is separate from both HTML and TypeScript. Four kinds of selectors cover most needs:

| Selector | Matches |
|---|---|
| `#refresh` | the element whose `id` is `refresh` |
| `li` | every `<li>` element |
| `.freezing` | every element with the class `freezing` |
| `#readings li` | every `<li>` inside the element whose `id` is `readings` |

A misspelled selector does not result in a compile error. It will not match anything, and `querySelector` will return `null`.

Each kind of element has its own type: `HTMLButtonElement` for a `<button>`, `HTMLInputElement` for an `<input>`, `HTMLSelectElement` for a `<select>`, and `HTMLElement` for elements with nothing special about them, such as `<p>` and `<ul>`. The type in angle brackets after `querySelector` specifies which one you expect. The compiler takes your word for it and does not compare it with the page, so it is up to you to specify the type that matches the tag.

These are the DOM types you are most likely to use:

| Tag | Type | Adds |
|---|---|---|
| `<button>` | `HTMLButtonElement` | `disabled` |
| `<input>` | `HTMLInputElement` | `value`, `disabled`, `checked` |
| `<select>` | `HTMLSelectElement` | `value`, `disabled` |
| `<option>` | `HTMLOptionElement` | `value`, `selected` |
| `<li>` | `HTMLLIElement` | nothing you are likely to use |
| `<canvas>` | `HTMLCanvasElement` | the surface a charting library draws on |
| `<p>`, `<ul>`, `<ol>`, `<div>`, `<section>`, `<h1>` | `HTMLElement` is enough | the properties every element has |

All element types have all of the methods and properties `HTMLElement` has, so `HTMLElement` is a safe choice when the code only uses properties that all elements share, such as `textContent`. A more specific type is needed when more specific properties are used, such as `value`.

The type names do not always follow the tag: `<li>` is `HTMLLIElement`, `<ul>` is `HTMLUListElement`, and `<p>` is `HTMLParagraphElement`. The TypeScript handbook's [DOM Manipulation](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html) page explains how these types fit together. MDN lists [every HTML element type](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API#html_element_interfaces_2) if you need a type that is not in the table above.

A DOM element the program needs to function should be checked for once. This helper finds an element or throws, using the exceptions from [Chapter 8](../../../part1/08_errors#throwing-an-exception):

```typescript
/**
 * Finds an element the page must have.
 *
 * @param {Document} page the page to search.
 * @param {string} selector a CSS selector, such as "#refresh".
 * @returns {T} the first element the selector matches.
 * @throws {Error} when the selector matches nothing.
 */
function requireElement<T extends Element>(page: Document, selector: string): T {
    const found: T | null = page.querySelector<T>(selector);
    if (found === null) {
        throw new Error("the page has no element matching " + selector);
    }
    return found;
}
```

`T extends Element` means that `T` may be any element type.

An element is an ordinary object, and what the page shows is held in its properties. Reading a property reads the page, and assigning to one changes the page:

| Property | On | Holds |
|---|---|---|
| `textContent` | every element | the text inside the element |
| `value` | `<input>`, `<select>` | what the user typed, or the `value` of the chosen `<option>`; always a string |
| `disabled` | `<button>`, `<input>`, `<select>` | `true` when the control is turned off; a disabled button ignores clicks |

```typescript
const refresh: HTMLButtonElement = requireElement<HTMLButtonElement>(document, "#refresh");

refresh.textContent = "Reload";   // the button now reads Reload
refresh.disabled = true;          // the button is greyed out and ignores clicks
```

Every time you modify an element's properties the page is automatically redrawn and the changes will become visible.

## Reading What the User Entered

An input's `value` is a string, independent of what the user typed. A user who types `5` has entered the string `"5"`, and a user who types nothing has entered `""`. Turning that into a number is the conversion described in [Chapter 7](../../../part1/07_async#converting-text-to-numbers), with the same checks:

```typescript
/**
 * Converts the text of a temperature into a number.
 *
 * @param {string} text the text to convert.
 * @returns {Result<number, string>} ok: true with the temperature, or
 * ok: false with a description of what was wrong with the text.
 */
function toTemperature(text: string): Result<number, string> {
    if (text.trim() === "") {
        return { ok: false, error: "Enter a temperature." };
    }
    const temperature: number = Number(text);
    if (Number.isFinite(temperature) === false) {
        return { ok: false, error: "Not a temperature: " + text };
    }
    return { ok: true, value: temperature };
}
```

The error messages are written for the user, since the page displays them.

## Changing What the Page Shows

Changing an element that already exists is an assignment to `textContent`. Showing a list whose length varies means building elements. Three operations are used to change elements:

- `document.createElement("li")` makes a new `<li>` element. It belongs to no part of the tree yet, so it is not on screen.
- `list.appendChild(item)` adds `item` as the last element inside `list`, which puts it on screen.
- `list.replaceChildren()` removes every element inside `list`.

```typescript
/**
 * Replaces the items of a list with one item per reading.
 * Modifies the page: removes the list's items and adds new ones.
 *
 * @param {HTMLElement} list the list to redraw.
 * @param {Reading[]} readings the readings to show, in order.
 */
function showReadings(list: HTMLElement, readings: Reading[]): void {
    list.replaceChildren();
    for (const reading of readings) {
        const item: HTMLLIElement = list.ownerDocument.createElement("li");
        item.textContent = reading.hour + ":00, " + reading.tempCelsius + " °C";
        item.dataset.hour = String(reading.hour);
        item.classList.toggle("freezing", reading.tempCelsius < 0);
        list.appendChild(item);
    }
}
```

`list.ownerDocument` is the document that `list` belongs to. Using `ownerDocument` keeps the function from depending on the global `document`, which is helpful for testing.

`showReadings` empties the list and builds it again every time it is called. It never tries to work out which items to add or remove. The list on screen is then always what the function produces from the readings it was given, and there is no earlier state of the list to account for. You can redraw a part of the page from its data this way whenever the data changes.

Set text with `textContent`. Assigning to an element's `innerHTML` also changes what it shows, but the browser reads the string as HTML, so text that came from a user or a service could add elements to the page. `textContent` always shows the string as written.

## Classes, Attributes, and Data

`showReadings` uses two more properties that every element has. The first is `classList`, which holds the element's classes. A class is a label, written in HTML as `class="freezing"`, and the stylesheet decides how elements with that label look:

```css
.freezing {
    color: steelblue;
}
```

The program adds and removes the label, and the style follows.

| Call | Effect |
|---|---|
| `item.classList.add("freezing")` | the element has the class; adding it twice changes nothing |
| `item.classList.remove("freezing")` | the element does not have the class |
| `item.classList.toggle("freezing", cold)` | has the class when `cold` is `true`, and not when it is `false` |
| `item.classList.contains("freezing")` | `true` when the element has the class |

The second is `dataset`, which holds values of your own that travel with an element. Assigning `item.dataset.hour = "6"` gives the element the attribute `data-hour="6"`, and reading `item.dataset.hour` gives the string back, or `undefined` when it was never set. Like `value`, it is always a string.

Any other attribute is set with `item.setAttribute("aria-current", "true")`, read with `item.getAttribute("aria-current")`, which gives `null` when the attribute is absent, and removed with `item.removeAttribute("aria-current")`.

`querySelectorAll` returns every element that matches a selector, and a `for...of` loop iterates over them in the order they appear on the page. This marks the reading taken at noon and unmarks the rest:

```typescript
for (const item of list.querySelectorAll<HTMLLIElement>("li")) {
    item.classList.toggle("chosen", item.dataset.hour === "12");
}
```

## Responding to Events

A page's script does not run from top to bottom and then finish. It runs once when the page loads, and in that run it configures the page and registers actions (callbacks) that respond to user input. After that, code runs only when something happens: the user clicks, types, or picks an option. [Chapter 7](../../../part1/07_async#callbacks) describes the mechanism. Each of these raises an event, and the browser runs the callbacks registered for it when its thread is free.

`addEventListener` registers a callback for one kind of event on one element:

```typescript
refresh.addEventListener("click", (): void => {
    message.textContent = "Refreshed.";
});
```

| Event | On | Raised when |
|---|---|---|
| `"click"` | a button, or any element | the user clicks it |
| `"change"` | `<select>`, `<input>` | the user picks an option, or finishes editing and moves on |
| `"input"` | `<input>` | the text changes, once per keystroke |

A callback that waits for a service is marked `async`, as any function that awaits is:

```typescript
refresh.addEventListener("click", async (): Promise<void> => {
    message.textContent = await loadForecast();
});
```

Nothing awaits the promise such a callback returns, so callbacks must deal with every failure that might arise when they execute, usually by putting an error message on the page.

## Keeping State in One Place

A page has several elements and some data, and every operation on the page needs most of them. A class holds them as fields:

```typescript
/**
 * The weather station page: its controls, and the readings it shows.
 * Invariant: every element the page needs has been found.
 */
class StationDisplay {
    threshold: HTMLInputElement;
    refresh: HTMLButtonElement;
    list: HTMLElement;
    message: HTMLElement;
    readings: Reading[];

    /**
     * Finds the page's elements. Shows nothing until start is called.
     *
     * @param {Document} page the page, which must have the four elements.
     * @param {Reading[]} readings the day's readings.
     * @throws {Error} when the page is missing one of the elements.
     */
    constructor(page: Document, readings: Reading[]) {
        this.threshold = requireElement<HTMLInputElement>(page, "#threshold");
        this.refresh = requireElement<HTMLButtonElement>(page, "#refresh");
        this.list = requireElement<HTMLElement>(page, "#readings");
        this.message = requireElement<HTMLElement>(page, "#message");
        this.readings = readings;
    }

    /**
     * Connects the Refresh button and shows the readings once.
     * Modifies the page.
     */
    start(): void {
        this.refresh.addEventListener("click", (): void => {
            this.show();
        });
        this.show();
    }

    /**
     * Shows the readings warmer than the threshold the user entered, or a
     * message when the threshold is not a number. Modifies the page.
     */
    show(): void {
        const threshold: Result<number, string> = toTemperature(this.threshold.value);
        if (threshold.ok === false) {
            this.message.textContent = threshold.error;
            return;
        }
        this.message.textContent = "";
        const warmer: Reading[] = this.readings.filter(
            (reading: Reading) => reading.tempCelsius > threshold.value
        );
        showReadings(this.list, warmer);
    }
}
```

The page's script creates one `StationDisplay` instance and starts it:

```typescript
const display: StationDisplay = new StationDisplay(document, todaysReadings);
display.start();
```

The class manages the core functionality of the page:

_Where state lives:_ The readings are in a field (`readings`), because the page has no element that holds them. The threshold is in the `threshold` input's `value`, because the user edits it there. Each piece of state exists in one place in the program. Keeping a second copy of the threshold in a field is possible, but would give two values that can disagree and keeping them aligned can be tricky on complex pages.

_How the screen draws:_ One method, `show`, draws everything that depends on the state. Whatever changes the state calls `show` afterwards. A new control only has to change the state and call the same method.

_How errors are handled:_ `show` puts the error in the message and returns before changing the list. On success, it also empties the error message to remove any old errors.

### `this` in a Callback

`start` registers an arrow function that calls `this.show()`. It does not pass the method itself:

```typescript
this.refresh.addEventListener("click", this.show);   // compiles, but fails on the first click
```

When the browser calls a method that was handed over this way, `this` points at the button that was clicked, not the `StationDisplay`. `this.threshold` is then `undefined`, and the method fails. An arrow function keeps the `this` of the method it was written in, so inside `start`, `this` in the arrow function is the display. Always register an arrow function that calls the method.

The correct registration is the one `start` uses:

```typescript
this.refresh.addEventListener("click", (): void => {
    this.show();   // this is the StationDisplay
});
```

## Repeating on a Timer

`setTimeout`, from [Chapter 7](../../../part1/07_async#callbacks), runs a callback once. `setInterval` runs one repeatedly, and returns a handle that `clearInterval` uses to stop it:

```typescript
const handle = setInterval((): void => {
    display.show();          // runs every 1000 ms
}, 1000);

clearInterval(handle);       // show is not called again
```

The handle's type is different in a browser and in Node, so this is one declaration to leave without a type annotation. Keep the handle, or a function that clears it, in a field. A timer that nothing can stop keeps running for as long as the page is open.

## Testing a Page

Tests run in Node, where there is no browser and no `document`. The comment `// @vitest-environment jsdom` on the first line of a test file asks Vitest to supply one. [`jsdom`](https://github.com/jsdom/jsdom) is a library that builds the same tree of elements from HTML, without drawing anything. Events are raised and properties change as they do in a browser.

A test then does what a user does. It puts the page in the document, starts the code, acts on the controls, and checks what the page shows:

```typescript
// @vitest-environment jsdom
import { getAllByRole, getByLabelText, getByRole } from "@testing-library/dom";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";

describe("StationDisplay", () => {
    const day: Reading[] = [
        { hour: 6, tempCelsius: -4 },
        { hour: 12, tempCelsius: 3 },
        { hour: 15, tempCelsius: 8 }
    ];

    beforeEach(() => {
        document.body.innerHTML = PAGE;   // the contents of index.html's <body>, as a string
        const display: StationDisplay = new StationDisplay(document, day);
        display.start();
    });

    test("every reading above the starting threshold is listed", () => {
        const items: HTMLElement[] = getAllByRole(document.body, "listitem");
        expect(items.length).to.equal(3);
        expect(items[0].textContent).to.equal("6:00, -4 °C");
    });

    test("Refresh applies the threshold the user typed", async () => {
        const user: UserEvent = userEvent.setup();
        const threshold: HTMLElement = getByLabelText(document.body, "Warmer than");
        await user.clear(threshold);
        await user.type(threshold, "5");
        await user.click(getByRole(document.body, "button", { name: "Refresh" }));

        const items: HTMLElement[] = getAllByRole(document.body, "listitem");
        expect(items.length).to.equal(1);
        expect(items[0].textContent).to.equal("15:00, 8 °C");
    });

    test("a threshold that is not a number is reported", async () => {
        const user: UserEvent = userEvent.setup();
        const threshold: HTMLElement = getByLabelText(document.body, "Warmer than");
        await user.clear(threshold);
        await user.type(threshold, "mild");
        await user.click(getByRole(document.body, "button", { name: "Refresh" }));

        expect(getByRole(document.body, "status").textContent).to.equal("Not a temperature: mild");
        expect(getAllByRole(document.body, "listitem").length).to.equal(3);
    });
});
```

The `beforeEach` gives every test a new page and a new `StationDisplay`, as [Chapter 9](../../../part1/09_validation#shared-setup) recommends, so that each test case is independent of the others. Setting up the page is the one place these tests assign to `innerHTML`, since the string is the page's own HTML.

The helpers come from two libraries the labs install:

| Helper | Does |
|---|---|
| `getByRole(document.body, "button", { name: "Refresh" })` | finds the button labelled Refresh |
| `getByLabelText(document.body, "Warmer than")` | finds the control whose `<label>` reads Warmer than |
| `getByRole(document.body, "status")` | finds the element with `role="status"` |
| `getAllByRole(document.body, "listitem")` | finds every `<li>`, as an array |
| `user.click(element)` | clicks the element |
| `user.clear(element)`, `user.type(element, "5")` | empties a text input, then types into it |
| `user.selectOptions(element, "yvr")` | picks the option of a `<select>` whose value is `yvr` |

A `getBy` helper throws when it finds nothing, so a test fails with a message naming what was missing. The helpers find elements the way a user does, by what an element is and what it is labelled, so a test does not depend on ids or on how the page is laid out. Every `user` action returns a promise and must be awaited.

When a callback awaits a service, the page has not changed yet when `user.click` finishes. Wrap the assertion in `vi.waitFor`, imported from `vitest`, which retries it until it passes or a timeout expires:

```typescript
await user.click(getByRole(document.body, "button", { name: "Refresh" }));
await vi.waitFor(() => expect(getByRole(document.body, "status").textContent).to.equal("Refreshed."));
```

## When Nothing Happens

A page that does nothing after a change usually has one of a small number of causes. Check them in this order:

1. Reload the page. The browser is still running the script it loaded before your change.
2. Open the browser's console. An exception in the page's script is reported there, with the line it came from.
3. Check the terminal where the server is running. If the build reported an error there, the page is still running the last script that built.
4. Check each selector against the `id`s in `index.html`.
5. Check that the listener was registered: that the line calling `addEventListener` runs, and that it runs on the element you are clicking.
6. Check that the callback is an arrow function that calls your method, as in [`this` in a Callback](#this-in-a-callback).
7. Check that the method that changed the state also redraws the page.
8. Run the tests. A failing test names the step that is wrong.
