# The Class as a Unit of Abstraction

(TODO: Example of an invariant we couldn't enforce thru types alone in Part 1)

To move invariant enforcement from programmer discipline to language enforcement, we need a language mechanism that bundles *state* with the *operations that maintain it*. 

*Classes* provide this unit. Classes bundle *fields*, *methods*, and *constructors*. Constructors in particular provide an enforced construction path. Overall, a class:
- bounds reasoning to one group of concerns at a time, 
- reduces complexity at the system level, and 
- provides named types that can be depended upon.

## The Problem: How Do We Manage State?

In Part 1, we moved from purely functional programs to ones involving *state*. We saw how state can be a handy abstraction, allowing us to (TODO: what?). 

However, managing state becomes tricky as we grow programs. It might be appealing to keep all state in a single shared location, but this doesn't scale. If all state is centralized, then any part of the program can read and write to the shared state, and there's no enforcement of which parts of the program *should* read and write that state. 

Even worse, if different parts of the program aren't clear to each other about who *should* modify state, they might modify it in inconsistent ways, and we may end up in a state that no programmer expected. This usually leads to bugs. Even if we were to spread state into different files, if that state is captured in global variables, we have the same problem: any part of the program can modify those global variables. To ensure that state is correctly modified, we need to rely on *programmer discipline*—which is not reliable to large systems. 

**Object-oriented programming** provides a language mechanism for systematically managing program state. The central solution is the **class**: a named unit that packages *state* together with the *operations that are meant to act on it*, and that can *enforce rules* about how that state is modified. All major programming languages that support object-orientation, including C++, Java, Rust, and TypeScript, do so primarily through classes.

<details class="tooltip ts-tips">
<summary>The "Object" in Object-Oriented Programming</summary>

What's new about *object*-oriented programming? We already saw objects in TypeScript:
```typescript
const song: Song = {
  title: "Two Hundred the Ages",
  artist: "Precise Musician",
  durationSeconds: 200
};
```
Here, the variable `song` is an `object` with 3 properties. In TypeScript, any collection of named properties is an `object`. It inherits this characteristic from JavaScript, which is dynamically-typed and allows modification of `object`s on the fly (i.e., adding and removing properties). 

In languages with stricter object-oriented programming, such as Java, objects are instead *instances* of classes. You'll see this definition of object below. So, with the TypeScript you know so far, you should understand *object-oriented* as *class-oriented*.
</details>



## Abstraction Through Classes

### The Basics: Classes, Constructors, and Objects

<!--- primary unit of organization -->
As systems grow, we need a mechanism for organising state and functionality in a way that is understandable and scalable. The `class` can be thought of as a _template_ for a container and is the dominant unit of abstraction in object-oriented programs.

<details class="tooltip deep-dive">
  <summary>Where classes are stored</summary>

In all languages, classes must be stored in files. In some languages (like Java), a file must contain *only* a single class. This restriction is not present in TypeScript, where a file can contain multiple classes. In practice, it is most predictable for a file to contain a single class and for the filename to match the class name.

<!-- Intentional: don't talk about class-to-directory, that will come next class when we talk about cohesion -->
</details>

Each class declares a type, specified by its name. As with `type` earlier in the course, this name is carefully chosen as it is the most compact signal that communicates the intent of the class.

<details class="tooltip ts-tips">
<summary>Class Declarations</summary>

The class declaration 
```typescript
class X {
   // ...
}
```
is a *statement* that declares the name *X* as a type.
</details>



For instance, here is a class called `CourseSection`:

```typescript
// CourseSection V0: a blank class
class CourseSection {
	
	constructor(courseId: str) {
		// TODO: class initialisation
	}
}
```

So far, it contains only a *constructor*. The *constructor* will be called when an *instance* of the class will be created (or, constructed). It provides a single point where the class will be configured: e.g., setting properties to certain values, calling set-up code to set-up the invariants. Unlike other callables, constructors are never annotated with a return type: they always return the type defined by the class itself. 

<details class="tooltip ts-tips">
<summary>Constructors</summary>

Within a class, the `constructor()` statement:
```typescript
class T {
   constructor() {
     // empty default constructor
   }
}
```
defines how objects of type `T` are created. We don't call `constructor()` explicitly: instead, it is called with `T()` in the statement `new T()`.

By default, TypeScript will provide a default constructor that takes in no arguments, like the one in the code example above. You could understand the code above as defining:
```typescript
class T {
   T(): T { // NOT correct TypeScript Syntax
     // empty default constructor
   }
}
```

</details>


A class on its own is essentially a fancier type definition. Just like we needed to create *values* of certain types to use a type, we need to **instantiate** a value of the class type to use a class. 

In particular, we call an instantiated class value an **object**.  When a class is instantiated, an object is created in memory with its own independent storage for each field. For instance, the following creates an variable, named `cpsc210`, whose value is an object of type 
`CourseSection`, as returned by the constructor of `CourseSection`:

```typescript
const cpsc210 = new CourseSection("CPSC 210");
```

<details class="tooltip ts-tips">
  <summary> <code>new</code> operator</summary>

The statement

```typescript
new T();
```
instantiates an object of class `T`. In particular, when `new T()` is called, the `new` keyword automatically calls the declared constructor of class `T`, which returns the instance of `T`. 
</details>

Importantly, we can make multiple independent objects from the same class:

<!--- Intentional: break the pattern that the variable name is directly derivable from the first constructor argument, so students don't think that's necessary. --> 

```typescript
const math_prereq = new CourseSection("MATH 100");
const cpsc210 = new CourseSection("CPSC 210");
const cpsc310 = new CourseSection("CPSC 310");
```

Objects from the same class share the same structure, but hold different *data*.  This is one way we will manage state: by splitting data up between different objects. Conceptually, the 3 `CourseSection` objects above could help us split up the state for different classes.


### Class Bodies

We mentioned above that a class binds together *state* and *functionality*. But our `CourseSection` was blank except for a constructor.

Let's first flesh out the `CourseSection` above to contain relevant *state*. A course section, should, at the very least, contain information about its name and capacity. When we create a course section object, we should set that name and capacity. We do that as follows: 

```typescript
// CourseSection V1: Add Some Data
class CourseSection {
   // the first field: the course ID
	id: string;
	// the second field: the course capacity
	cap: number;
	
	constructor(courseId: string, cap: number) {
		this.id = courseId;
		this.cap = cap;
	}
}
```

<details class="tooltip ts-tips">
  <summary>Fields and <code>this</code></summary>
  
The following defines a field with name `field_1` of type `X` within class `T`.

```typescript
class T {

	field_1: X;
	
	constructor(field_val: X) {
		this.field_1 = field_val;
	}
}
```

The `this` keyword allows us to access the *current instance* of the class. It only makes sense So, within the constructor, `this.field_1` retrieves the value of `field_1` in the current *object being constructed*.

If it makes things clearer, you could understand `this` as an extra argument to any callable within a class:

```typescript
  // For illustration purposes
  constructor(this: T, field_val: X): X { // NOT VALID TYPESCRIPT
  }
```
where TypeScript will automatically pass the current object to the `this` parameter. 

</details>

In this version of CourseSection, we have two fields, `id`, and `cap`.  Fields are non-callable (i.e., not functions) properties of classes. The constructor above initializes the values of fields while the objects of type `CourseSection` are being created. For instance, now we can create objects with names and enrolment capacities for each class: 

```typescript
const math_prereq = new CourseSection("MATH 100", 400);
const cpsc210 = new CourseSection("CPSC 210", 180);
const cpsc310 = new CourseSection("CPSC 310", 160);
```

Note that the contents of the fields are unique to each instantiated object; changes to a field in one object have *no impact* on the same field in another object. In the above, `cpsc210.id` will hold the value `"CPSC 210"`, while `math_prereq.id` will hold the value `"MATH 100"`.

<details class="tooltip deep-dive">
<summary>When should I make a field?</summary>

Declaring a field is relatively straightforward: 1) figure out what state you need to track and come up with a name that clearly describes the state; 2) identify what type the state is; 3) determine whether there is a default value for the state or whether it needs to be dynamically configured through a constructor. 

One challenging problem though is determining _what_ should be state at all, in contrast to a local variable within a method. As a rule of thumb, data should be stored in a field if the value must survive after a method returns or be visible to other methods.
</details>

<!--- probably want a subseq -->

Let's now flesh out how classes can define *functionality*. 
Within classes, functionality is provided by **methods**. Most classes contain many methods that enable programs to perform actions on the class's stored state. These actions can *explicitly enforce* any expected expected invariants on the fields.

<details class="tooltip ts-tips">
<summary> Methods (and <code>this</code> again)
</summary>

The following defines a method `method_1` for class `T`
```typescript
class T {
    
    method_1(x: X, y: Y): Z {
       // do something with arg_1 and arg_2 to return a value of type Z 
    }
    
}
```
Given an instance of the class, `const t = new T()`, we can call this method with `t.method_1(...)`. This call will only be able to see the data stored in the object `t`. 

To call a method within a method, we use `this`, which represents the current instance of `T`: 

```typescript
class T {
    
    method_1(x: X, y: Y): Z {
       if (this.method_2()) {
         // ...
       }
       // do something with arg_1 and arg_2 to return a value of type Z 
    }
    
    method_2(): bool {
       // do something
    }
    
}
```

</details>

Let's add functionality to our `CourseSection`. Most functionality for a course section involves the students enrolled. So we'll first add a field `registered` in which we can store enrolled students. Then, we'll add functionality to register and withdraw students:

<!--
duplicate students not caught on purpose, we will notice this in verification
-->

<CollapsibleCode>

```typescript
// CourseSection V2: Now we've got state and functionality
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
</CollapsibleCode>

Methods have access to all of the class's fields and can call other methods within the class itself. For instance, `register` calls the `isFull` method to check whether the class is currently full. `isFull` itself looks at the `registered` and `cap` fields. 

<details class="tooltip ts-tips">
  <summary>Default Initialization of Fields</summary>

It is often the case that there is a default initial value for a field that we want set but know we will not change in the constructor. For instance, `registered` in our example above is always initialized to the empty array. More generally:

```typescript
class T {
    
    field_n: X = some_x;
    
}
``` 

sets the default value for `field_n` to whatever value is in `some_x`. `some_x` can be any expression, not just a variable (TODO: can it be a call?). 

Setting the field's default value is the same as if it were set in the constructor itself. This is convenient for fields that do not need per-instance customisation.

</details>


Notice that `register` enforces the enrolment cap: no caller can exceed it, regardless of how they try. The invariant is maintained *by the class itself*, not by *programmer discipline* in the calling code.

In all languages, methods have a name, take zero or more parameters, and return either a value or `void`. 
When a method does not reutrn a value, it is good practice to declare that the method return type is `void`. This signals to whoever is reading the code that the absence of a return value is intentional.

<details class="tooltip deep-dive">
<summary>When should I make a method?</summary>

Declaring a method involves a few steps: 1) figuring out what the point of the method is and coming up with a name that succinctly and clearly captures that intent; 2) determining what parameters the method should take and what their names and types should be; 3) determining what the method should return and what it's type should be.

It can be helpful to think of this process from a testing perspective: if you know the kinds of tests you would like for the functionality the method provides, can you both configure it with the parameters and evaluate it with the return type (or the return type of other methods already in the class)?
</details>  

## Working with objects

<!--- CL note: I have edited up to here.-->

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

So far this is the class _offering_ an interface that a client has no need to look past. Guaranteeing that a client genuinely _cannot_ reach past it, so that an object's internal state is truly the class's alone, is the role of [encapsulation](./05_encapsulation).

<details class="tooltip deep-dive">
  <summary>The abstraction at work in `CourseSection`</summary>

Look back at how we used `w1` and `w2`. We called `register`, `isFull`, `isRegistered`, and `withdraw`, but we never read the `registered` array directly, never compared anything against `cap`, and never kept the list of students within its limit ourselves.

That work still happened, it was just performed by `CourseSection`. When we called `w1.register("s3")` on a section that was already full, the cap invariant held because `register` checks `isFull()` before adding a student; the caller did not have to, and could not, get this wrong. As a client we only needed to know that a `CourseSection` can register students and can report when it is full. How it stores enrolment, and where it enforces the cap, were details we never had to see.

</details>