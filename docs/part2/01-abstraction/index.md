# The class as a unit of abstraction

## Motivation

To move invariant enforcement out of programmer discipline, we need a language mechanism that bundles state with the operations that maintain it. Classes provide that unit through fields, methods, and constructors with an enforced construction path. A class bounds reasoning to one kind of thing at a time, reducing complexity at the system level and providing named types that can be depended upon.

## The problem

As programs grew, managing state became a considerable problem. While keeping all state in a single location is appealing, it does not scale: any part of the program can still read from or write to that shared state, and nothing in the language specifies which parts *should*. When different parts of a program mutate shared state in conflicting ways, the program ends up in an inconsistent configuration that is hard to detect and harder to trace to its source. Spreading state across many global variables is no better; the same problem applies, just distributed across more locations. In both cases the only protection is programmer discipline, which does not hold as codebases and teams grow.

The object-oriented paradigm emerged to provide a language mechanism for managing program state more systematically. The central solution is the `class`: a named unit that packages state together with the operations that are meant to act on it, and that can enforce rules about how that state is modified. All major programming languages that support object-orientation, including C++, Java, Rust, and TypeScript, do so primarily through classes.

## Abstraction through classes

<!--- primary unit of organization -->
As systems grow, we need a mechanism for organising state and functionality in a way that is understandable and scalable. The `class` can be thought of as a _template_ for a container and is the dominant unit of abstraction in object-oriented programs.

<details class="tooltip deep-dive">
  <summary>Where classes are stored</summary>

In all languages, classes must be stored in files. In some languages (like Java), a file must contain only a single class. This restriction is not present in TypeScript, where a file can contain multiple classes. In practice, it is most predictable for a file to contain a single class and for the filename to match the class name.

<!-- Intentional: don't talk about class-to-directory, that will come next class when we talk about cohesion -->
</details>

Each class declares a type, specified by its name. As with `type` earlier in the course, this name is carefully chosen as it is the most compact signal that communicates the intent of the class.

<details class="tooltip ts-tips">
  <summary>Declaring a class</summary>

Classes are declared in the following way:

```typescript
class CourseSection {
	
	constructor() {
		// class initialisation
	}
}
```

This declares a class called `CourseSection`. The `constructor()` is a special method that must be called before the class is used. This provides a single point where a class can be configured. Constructors do not declare their return type because it is always the type of the class itself.

</details>


## Classes vs. objects

A class is just a template and cannot be directly used. To be usable, a class must be **instantiated**. An instantiated class is called an **object**. When a class is instantiated, an object is created in memory with its own independent storage for each field. Objects from the same class share the same structure and methods, but each holds its own field values, making objects completely independent of one another.

<details class="tooltip ts-tips">
  <summary>Instantiating a class</summary>

Instantiating classes uses the `new` operator. When `new` is called on a class, an object is returned and is usually stored in a variable. The `new` keyword automatically calls the declared class constructor, which returns the instance of the object. This ensures that _every_ class instance is fully configured by its constructor before it can be used.

```typescript
const cpsc210 = new CourseSection("CPSC 210");
```

Multiple independent objects can be made from the same class:

```typescript
const cpsc210w1 = new CourseSection("CPSC 210");
const cpsc210w2 = new CourseSection("CPSC 210");
const cpsc310w1 = new CourseSection("CPSC 310");
```
</details>

## Class bodies

To be useful, a class must both maintain some state and provide some functionality. State in classes is maintained using **field** variables that are declared in the class body. When the class is instantiated, a copy of these variables is initialised by the constructor. The contents of the fields are unique to each instantiated object; changes to a field in one object have no impact on the same field in another object.

<details class="tooltip ts-tips">
  <summary>Fields and `this`</summary>

Our `CourseSection` class above was not very useful. Without state, every object was an identical copy that could not be modified. A course section has a unique id and an enrolment cap, so we add fields for both.

One other piece of syntax emerges here as well. The `this` keyword is a special name that allows an object to refer to itself.

Below we have extended the class with fields `id` and `cap`, each declared with its type. The constructor takes both as parameters. 

```typescript
class CourseSection {

	id: string;
	
	// course capacity
	cap: number;
	
	constructor(courseId: string, cap: number) {
		this.id = courseId;
		this.cap = cap;
	}
}
```

Now when we instantiate multiple objects they can all be different:

```typescript
const cpsc210w1 = new CourseSection("CPSC 210", 180);
const cpsc210w2 = new CourseSection("CPSC 210", 120);
const cpsc310w1 = new CourseSection("CPSC 310", 160);
```
</details>

While storing state is helpful, classes also provide a mechanism for collecting functionality. Within classes, functionality is provided by **methods**. Most classes contain many methods that enable programs to perform actions on the class's stored state. These actions often explicitly enforce the expected invariants on the fields to ensure the invariants are always true.

In all languages, methods have a name, take zero or more parameters, and return either a value or `void`. It is good practice to declare that the method return type is `void` when a method does not return a value to signal to an engineer reading the code that the absence of a return value is intentional. Methods have access to all of the class's fields and can call other methods within the class itself.

<details class="tooltip ts-tips">
  <summary>Methods</summary>

Here we have added a `registered` field to track which students are in the section. Methods have been added to enrol and withdraw students and to check enrolment status. Notice that `register` enforces the cap: no caller can exceed it, regardless of how they try. The invariant is maintained by the class itself, not by discipline in the calling code.

One bit of syntactic sugar for fields is also demonstrated: it is often the case that there is a default initial value for a field that we want set but know we will not change in the constructor. In this case, the `registered` field has been initialised to the empty array. Setting the field's default value is the same as if it were set in the constructor itself, and is often convenient for fields that do not need per-instance customisation.

<!--
duplicate students not caught on purpose, we will notice this in verification
-->

```typescript
class CourseSection {

	id: string;
	
	// course capacity
	cap: number;
	
	// registered students; should not be greater than cap
	registered: string[] = [];
	
	constructor(courseId: string, cap: number) {
		this.id = courseId;
		this.cap = cap;
	}
	
	/**
	 * Registers a student id. If the course is full, do 
	 * not register the student and return false.
	 */
	register(studentId: string): boolean {
		if (this.isFull() === false) {
			this.registered.push(studentId);
			return true;
		}
		return false;
	}
	
	/**
	 *  Withdraws a student. Does not return a value,
	 *  regardless of whether the withdraw was successful.
	 */
	withdraw(studentId: string): void {
		const index = this.registered.indexOf(studentId);
		if (index !== -1) {
			this.registered.splice(index, 1);
		}
	}
	
	isRegistered(studentId: string): boolean {
		return this.registered.includes(studentId);
	}
	
	isFull(): boolean {
		return this.registered.length >= this.cap;
	}
}
```

</details>

## Working with objects

A class declaration on its own does nothing. The declaration only describes what its objects will look like. To perform work, we instantiate objects and interact with them by calling their methods. Methods are accessed using _dot notation_. The `.` separates an object from the method being called on it. Because every object stores its own field values, a method call on one object can never affect another, even if both are instances of the same class.

<details class="tooltip ts-tips">
  <summary>Calling methods on objects</summary>

***TODO: should these be `checkExpect` to check the values?***

```typescript
// Two sections of the same course, with different caps
const w1 = new CourseSection("CPSC 210w1", 2);
const w2 = new CourseSection("CPSC 210w2", 200);

// Register students into w1 until it is full
let didReg = w1.register("s1");    // true
didReg = w1.register("s2");        // true
didReg = w1.register("s3");        // false: w1 is already at cap

// Register students into w2 
didReg = w2.register("s1");        // true: the same id can register here too

let w1atCap = w1.isFull();         // true
let w2atCap = w2.isFull();         // false

let isReg = w1.isRegistered("s3"); // false: never added to w1
isReg = w1.isRegistered("s1");     // true
isReg = w2.isRegistered("s1");     // true

// Withdrawing from w1 frees a seat there, and only there.
w1.withdraw("s1");
isReg = w1.isRegistered("s1");     // false
isReg = w2.isRegistered("s1");     // true: unaffected by the withdraw on w1

w1atCap = w1.isFull();             // false; removing s1 decreased enrolment
```

</details>

## The value of the abstraction

This division of responsibility is what makes the class a unit of _abstraction_. A client reasons about _what_ a class can do through the features exposed through its methods without needing to understand _how_ it manages its state invariants. To use a class, a client only has to find the one that models the thing they care about and then call the methods that provide the behaviour they want. This is part of the reason why naming is so important in software design, because it lets software engineers _find_ the code they need to use. This leaves the work of storing state and of keeping that state consistent as it changes inside the class.

This is valuable because it confines each concern to a single place. The class is the one location responsible for its own state, which frees every other part of the program from that responsibility. Because the operations that maintain the invariants live alongside the state they protect, rather than in the calling code, a client cannot accidentally leave an object in an inconsistent configuration.

So far this is the class _offering_ an interface that a client has no need to look past. Guaranteeing that a client genuinely _cannot_ reach past it, so that an object's internal state is truly the class's alone, is the role of [encapsulation](../05-encapsulation/).

<details class="tooltip deep-dive">
  <summary>The abstraction at work in `CourseSection`</summary>

Look back at how we used `w1` and `w2`. We called `register`, `isFull`, `isRegistered`, and `withdraw`, but we never read the `registered` array directly, never compared anything against `cap`, and never kept the list of students within its limit ourselves.

That work still happened, it was just performed by `CourseSection`. When we called `w1.register("s3")` on a section that was already full, the cap invariant held because `register` checks `isFull()` before adding a student; the caller did not have to, and could not, get this wrong. As a client we only needed to know that a `CourseSection` can register students and can report when it is full. How it stores enrolment, and where it enforces the cap, were details we never had to see.

</details>