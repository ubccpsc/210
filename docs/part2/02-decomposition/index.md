# Cohesive decomposition

### Motivation

Decomposing a system into classes only pays off if each class makes sense on its own; a class that enforces several invariants stops being a useful abstraction, since its users must understand all of them at once. We anchor what belongs inside a class to the invariant it enforces, applying the Single Responsibility Principle at both the class and method level to decompose the system into cohesive classes. A cohesive class is understandable from its invariant alone and can be modified without impacting the rest of the system.


### The problem

[Abstraction](../01-abstraction/) established the class as the unit of abstraction: classes bundle state with the operations that maintain an invariant, bounds reasoning to one kind of thing at a time, and gives the rest of the program a named type it can depend on. That tells us how to build an abstraction. This does not guide us towards building *good* abstractions. We still have to decide what each class should be, and what functionality and state belongs in each class, so that every class actually delivers those properties.

<!--
The L1 `CourseSection` already did. It was organised around a single invariant, its capacity rule, so it could be understood, named, and depended on as one thing. That was not an accident, though we never named the principle behind it. 
-->

Decomposition is all about isolating functionality until it's small enough to understand, but big enough to do something useful. The pressure to do this well shows up as classes grow. A class rarely starts out doing too much; it gains responsibilities one reasonable change at a time. 


<details class="tooltip ts-tips">
  <summary>`CourseSection` with the waitlist bolted on</summary>

Suppose we decide that when a section is full, hopeful students should join a waitlist and be offered a seat automatically when one opens. Adding this to the class we already have is the path of least resistance, but the class now maintains two unrelated invariants at once: its original capacity invariant, and a new waitlist invariant (a student waits at most once, and seats are offered in arrival order). Worse, the two become tangled, because registering and withdrawing now have to touch the waitlist as well. To understand or safely change either invariant, a software engineer has to hold both in their head. The abstraction that was clear before the waitlist has quietly become harder to reason about.


```typescript
class CourseSection {

	id: string;
	cap: number;
	registered: string[] = [];
	waitlisted: string[] = [];

	constructor(courseId: string, cap: number) {
		this.id = courseId;
		this.cap = cap;
	}

	register(studentId: string): boolean {
		if (this.isFull() === false) {
			this.registered.push(studentId);
			return true;
		}
		this.addToWaitlist(studentId); // full: fall back to the waitlist
		return false;
	}

	/**
	 * Withdraw a student; if there is space on the waitlist
	 * move the first waitlisted student into the course. 
	 */
	withdraw(studentId: string): void {
		const index = this.registered.indexOf(studentId);
		if (index !== -1) {
			this.registered.splice(index, 1);
			const next = this.nextFromWaitlist(); // a seat opened
			if (next !== undefined) {
				this.register(next);
			}
		}
	}

	isFull(): boolean {
		return this.registered.length >= this.cap;
	}

	isRegistered(studentId: string): boolean {
		return this.registered.includes(studentId);
	}

	addToWaitlist(studentId: string): void {
		if (this.waitlisted.includes(studentId) === false) {
			this.waitlisted.push(studentId);
		}
	}

	nextFromWaitlist(): string | undefined {
		return this.waitlisted.shift();
	}

	isWaitlisted(studentId: string): boolean {
		return this.waitlisted.includes(studentId);
	}
}
```

The split runs right through the class. The fields `registered` and `cap` serve the capacity invariant, while `waitlisted` serves the waitlist invariant. The methods divide the same way, except that `register` and `withdraw` now have to manage both: each has to maintain capacity and reach into the waitlist. 
</details>

### God classes

Left unchecked, a class that keeps absorbing responsibilities becomes a god class: one type that knows about and does everything. Each addition seemed reasonable on its own, but the result is a class with many fields and methods that answer to no single invariant. This often happens because it is easier to just add one more method to a class than make a new class and ensure all of its functionality are cohesive.

A god class is hard to maintain, for the reason we have already seen: there is no one invariant to reason about, so any change risks disturbing something unrelated. But it is also hard to use, and that cost is easy to overlook. Clients use classes by finding the class that models what they care about and calling the methods that provide that behaviour. That depends on a class having a clear, single purpose. When functionality is undifferentiated, piled into one class with no organising invariant, an engineer cannot predict where a feature lives. In a god class the honest answer is that it could be anywhere, and the engineer is left scrolling a long list of unrelated methods hoping to recognise the right one.

Cohesion is what makes features findable. When every class is organised around a single invariant, an engineer can reason about where a capability should live and look there first, and the name of the class confirms whether they have found the right place. A system made of many small, cohesive classes is easier to navigate than one made of a few large ones, even though it has more parts, because each part announces what it is responsible for.

<details class="tooltip ts-tips">
  <summary>A `CourseSection` that has grown into a god class</summary>

After a few terms of successful deployment `CourseSection` has gained features around grades, scheduling, communication, and reports, all in addition to the initial capacity feature and the waitlist addition.

```typescript
class CourseSection {

	// capacity
	register(studentId: string): boolean { /* ... */ }
	withdraw(studentId: string): void { /* ... */ }
	isFull(): boolean { /* ... */ }

	// waitlist
	addToWaitlist(studentId: string): void { /* ... */ }
	promoteFromWaitlist(): void { /* ... */ }

	// grades
	setGrade(studentId: string, grade: number): void { /* ... */ }
	classAverage(): number { /* ... */ }

	// scheduling
	setMeetingTime(day: string, hour: number): void { /* ... */ }
	conflictsWith(other: CourseSection): boolean { /* ... */ }

	// notification
	emailRegistered(message: string): void { /* ... */ }
	emailWaitlisted(message: string): void { /* ... */ }

	// reporting
	exportRoster(): string { /* ... */ }
}
```

For a class like this, where would you look to change how waitlisted students are notified, to adjust a grade, or to export the roster? Nothing about the class points you anywhere, because it is responsible for all of it. Each comment marks a cluster that answers to a different invariant, and each cluster wants its own class.

</details>

### Cohesion as the design criterion

A class is cohesive when everything it contains works toward a single purpose. We make "single purpose" precise by anchoring it to one invariant: a cohesive class enforces exactly one invariant, and every field and method exists to establish, preserve, or observe it. A cohesive class can be understood from its invariant alone and changed without reaching into the rest of the system. These are the properties L1 asked of an abstraction: that it bound reasoning to one kind of thing and offer a named type the rest of the program can depend on. Cohesion is the criterion we use to judge whether a decomposition keeps those properties true, and it answers both of the costs we have seen, the bloated class that is hard to reason about and the god class that is hard to navigate.

Cohesion also shapes how a system behaves under change. When each invariant lives in exactly one class, a bug fix or a new feature for that invariant stays inside the class that owns it, instead of being spread across the system. The change stays localized, which makes it easier to make and far less likely to cause the cascading errors that follow when one edit forces matching edits in many other places.

### One class, one invariant

This is the **Single Responsibility Principle** at the class level: one class, one invariant. A class should have exactly one reason to change, and that reason is the invariant it protects. Deciding where one class ends and another begins is the core activity of decomposition, and cohesion is how we differentiate a good split from a bad one.

There is rarely a single correct decomposition. The same system can usually be split several reasonable ways, and competent engineers will sometimes disagree about which is best. What cohesion gives us is not the one *right* split but a reliable way to recognise a *poor* one. A class that is poorly decomposed leaves some clues you can detect from the code itself: the class enforces more than one invariant, it has one or more fields the invariant never mentions, it has methods that maintain some other invariants, or the class name itself seems disconnected from the fields and methods it contains. Those are easy to spot once you know to look for them, so the goal is less about finding the perfect decomposition than about steering clear of the clearly bad ones.

<details class="tooltip deep-dive">
  <summary>A decision procedure for what belongs in a class</summary>

While software design is rarely a top-down activity with a set procedure, the process for figuring out if a field or method belongs in a class can be thought of as a linear set of steps:

1. Name the invariant the class exists to protect.
2. For each field, ask whether the invariant is stated in terms of it. If not, the field belongs elsewhere.
3. For each method, ask whether it acts on the class invariant. If it serves a different invariant, it belongs with that invariant.
4. When a second invariant emerges, extract it into its own class rather than letting the current class grow.

</details>

### Field cohesion

Every field should participate in the invariant the class protects. Once the class invariant is known, each field can be checked against it: a field the invariant refers to belongs in the class, and a field the invariant never mentions is the clearest signal that a second responsibility has crept in. The usual exception is the field that holds the object's identity, such as a name or id; it names the thing the invariant is about rather than taking part in the invariant.

### Method cohesion

The Single Responsibility Principle applies at the method level too: one method, one operation on the invariant. Every method should act in maintenance of the class invariant, and nothing else. A method that maintains a different invariant is the method-level version of the same smell, and it points to the same fix: the invariant it serves, and the method with it, belongs in another class.

<details class="tooltip ts-tips">
  <summary>Diagnosing the bloated `CourseSection`</summary>

Take the capacity invariant, `registered.length <= cap`, and test each member of the bloated class against it.

- `cap` and `registered`: named in the invariant, so they belong to the capacity invariant.
- `id`: the section's identity, the permitted exception.
- `waitlisted`: never mentioned by the invariant.
- `register` and `withdraw`: preserve capacity, but also reach into the waitlist.
- `isFull` and `isRegistered`: observe capacity.
- `addToWaitlist`, `nextFromWaitlist`, and `isWaitlisted`: maintain or observe the waitlist, not capacity.

Everything that does not mention capacity is exactly the waitlist material. This represents a second complete responsibility with its own invariant, and should be decomposed into its own class.
</details>

<details class="tooltip deep-dive">
	<summary>Decomposing `CourseSection`</summary>

The fix is to give the second invariant its own class. We move the waitlist material into a `Waitlist` class that owns the waitlist invariant, and we leave `CourseSection` responsible for capacity alone. `CourseSection` no longer implements waitlisting; it collaborates with a `Waitlist`, holding one and delegating to it when a section fills or a seat opens. Each class is then understandable from a single invariant: `Waitlist` can change how it orders students without `CourseSection` knowing, and `CourseSection` owns the capacity invariant by itself.

<!--<details class="tooltip ts-tips">
  <summary>`CourseSection` and `Waitlist` after the split</summary>
-->
```typescript
// Owns one invariant: a student waits at most once, served in arrival order.
class Waitlist {

	waiting: string[] = [];

	add(studentId: string): void {
		if (this.waiting.includes(studentId) === false) {
			this.waiting.push(studentId);
		}
	}

	next(): string | undefined {
		return this.waiting.shift();
	}

	isWaiting(studentId: string): boolean {
		return this.waiting.includes(studentId);
	}
}
```

```typescript
// Owns one invariant: registered.length <= cap.
class CourseSection {

	id: string;
	cap: number;
	registered: string[] = [];
	waitlist: Waitlist = new Waitlist();

	constructor(courseId: string, cap: number) {
		this.id = courseId;
		this.cap = cap;
	}

	register(studentId: string): boolean {
		if (this.isFull() === false) {
			this.registered.push(studentId);
			return true;
		}
		this.waitlist.add(studentId);
		return false;
	}

	withdraw(studentId: string): void {
		const index = this.registered.indexOf(studentId);
		if (index !== -1) {
			this.registered.splice(index, 1);
			const next = this.waitlist.next();
			if (next !== undefined) {
				this.registered.push(next);
			}
		}
	}

	isFull(): boolean {
		return this.registered.length >= this.cap;
	}

	isRegistered(studentId: string): boolean {
		return this.registered.includes(studentId);
	}
}
```

**Does the `waitlist` field break field cohesion?**

The capacity invariant does not range over `waitlist`, so at first glance it looks like the same smell we just removed. The difference is ownership: `Waitlist` is a collaborator that `CourseSection` holds so it can delegate a responsibility it no longer maintains itself; it is not state that the capacity invariant constrains. 

</details>

<details class="tooltip ts-tips">
  <summary>The decomposed classes working together</summary>

```typescript
const w1 = new CourseSection("CPSC 210w1", 2);

w1.register("s1");           // true
w1.register("s2");           // true
w1.register("s3");           // false: full, so s3 joins the waitlist
w1.isRegistered("s3");       // false: on waitlist, not registered

w1.withdraw("s1");           // a seat opens; s3 is promoted automatically
w1.isRegistered("s3");       // true
```
</details>

### Naming and cohesive intent

Naming is a core design concern, not a cosmetic one. A cohesive class is easy to name because it does one thing. The name is the most compact signal of a class's intent, and it is what lets an engineer find the class they need. This is the direct answer to the god class: cohesive classes can be named for their single responsibility, and those names are exactly what an engineer reads when deciding where a feature should live. A class that is hard to name is usually a class that does too much, and a vague name helps no one find their way around it.

### A cohesive decomposition

A cohesive decomposition gives every invariant exactly one home. Each class can be understood from its own invariant, tested against that invariant, and changed in isolation, so a fix or a feature stays local instead of rippling outward; and because each is named for its single responsibility, an engineer can find the one they need. This is what lets a system of classes scale as it grows from one class into many: not only is state bundled with the behaviour that maintains it, but each bundle stays small enough to reason about and clear enough to locate. Cohesion is all about ensuring our abstractions stay effective and durable over time.
