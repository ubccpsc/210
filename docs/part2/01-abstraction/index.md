# The class as a unit of abstraction

### Motivation

To move invariant enforcement out of programmer discipline, we need a language mechanism that bundles state with the operations that maintain it. Classes provide that unit through fields, methods, and constructors with an enforced construction path. A class bounds reasoning to one kind of thing at a time, reducing complexity at the system level and providing named types that can be depended upon.

### The Problem

As programs grew, managing state became a considerable problem. While one approach, keeping state in a single location like a database or file is appealing, it does not work for large systems as there is too much contention on that single reasource. At the same time, having global state that any part of the program can read and write from also induced frequent problems as programs would get into inconsistent states as different parts of the program mutated state inconsistently. While global state _can_ work, it relies heavily on programmer discipline, using the kinds of mechanisms we described in Part 1.

The object-oriented design paradigm emerged explicitly to provide a programming-language mechanism to make it possible to more systematically manage proram state. The main solution object-orentiation adds is to introduce the notion of the `class` as the primary abstraction within the program. Classes provide mechanisms for managing state and grouping related operations into a single conceptual unit. All programming languages (`C++, Java, Rust, TypeScript, etc.) that support object-orientation through classes.

### Abstraction through classes

<!--- primary unit of organization -->
As systems grow, we need a mechanism for organizing state and functionality in a way that is understandable for people and scalable so it can solve the large-scale real-world problems. The `class` can be thought of as a _template_ for a container and is the dominant unit of abstraction in object-oriented programs. 

<details class="tooltip deep-dive">
  <summary>Where classes are stored</summary>


In all languages, classes must be stored in single files. In some languages (like Java), a file must only contain a single class. This restriction is not present in TypeScript, where a file can contain multiple classes. In practice though, it is usually the most predictable for a file to contain a single class and for the filename to be the same as the class name.

<!-- Intentional: don't talk about class-to-directory, that will come next class when we talk about cohesion -->
</details>

Each class declares a type, specified by its name. As with `type` earlier in the course, this name is carefully chosen as it is the most compact signal that communicates the intent of the class.

<details class="tooltip ts-tips">
  <summary>Declaring a class</summary>

Classes are declared in the following way:

```typescript
class Course {
	
	constructor() {
		// class initialization
	}
}
```

This declares a class called `Course`. The `constructor()` method defines a special method that must be called before the class is used. This provides a single point where a class can be configured.

</details>


### Classes vs. objects

A class is just a template and cannot be directly used. To be usable, a class must be **instantiated**. An instantiated class is called an **object**. When a class is instantiated, a copy of the class is created from the class template and stored in memory as an object. Objects are independent of one another: although objects from the same class all have the same type and have the same structure, they are otherwise completely independent.

<details class="tooltip ts-tips">
  <summary>Instantiating a class</summary>

Instantating classes uses a new syntax operator called `new`. When `new` is called on a class, an object is returned. This object is always stored somewhere, usually in a variable. The `new` keyword automatically calls the declared class constructor, which returns the instance of the object. This ensures that _every_ class instance is always fully configured by its constructor before it can be used.

```typescript
	const my210 = new Course();
```

Multiple independent objects can be made from the same class:

```typescript
	const my210 = new Course();
	const my310 = new Course();
	const my410 = new Course();	
```
</details>

### Class bodies

To be useful, a class must both maintain some state and provide some functionality. State in classes is maintained using **field** variables that are declared in the class body. When the class is instantiated, a copy of these variables are initialized by the constructor. The contents of the field are unique to each instantiated object; changes to a field in one object have no impact on the same field in another object.

<details class="tooltip ts-tips">
  <summary>Fields and `this`</summary>

Our `Course` class above was not very useful. Without state, every object was actually an identical copy that could not be modified. Since each course has a unique id, here we add the ability to keep track of the `id` within the class.

One other piece of syntax emerges here as well. The `this` keyword is a special name that allows an object to access itself.

Below we have extended the class with the field called `id`, which is declared with its type. We have also augmented the constructor to take the courseId as a parameter. When the constructor executes the parameter is stored in the field.

```typescript
class Course {

	id: string;
	
	constructor(courseId: string) {
		this.id = courseId;
	}
}
```

Now when we instantiate multiple fields they can all be different. In each of these objects, their `id` field contains the value passed to the constructor when the class is instantiated.

```typescript
	const my210 = new Course("CPSC 210");
	const my310 = new Course("CPSC 310");
	const my410 = new Course("CPSC 410");	
```
</details>

While storing state is helpful, classes also provide a mechanism for collecting functionality. Within classes, functionality is provided by **methods**. Most classes contain many methods that enable programs to perform actions on the class's stored state.

In all lanugages, methods have a name, take zero or more parameters, and can either return a value or not. Methods have access to all of the class's fields and can call other methods within the class itself.

<details class="tooltip ts-tips">
  <summary>Methods</summary>

Here we've added some new state, a list of `assignments`. Methods have been added to enable the manipulation of that state, without providing external access to the state itself. 

```typescript

class Course {

	id: string;
	assignments: Array<string>[];
	
	constructor(courseId: string) {
		this.id = courseId;
		this.assignments = [];
	}
	
	addAssignment(aName: string) {
		this.assignments.push(aName);
	}
	
	hasAssignment(aName: string): boolean {
		return this.assignments.contains(aName);
	}
	
	removeAssignment(aName: string) {
		const index = this.assignments.indexOf(aName);

		if (index !== -1) {
		  this.assignments.splice(index, 1);
		}
	}
}
```

</details>



