## RTH: I've added opinionated notes to most of the subsections below; we can incorporate the topics we want as we encounter the need.

# TypeScript's Type Checker

So far, we’ve focused on how to design types and functions.
TypeScript’s type checker is what ensures these designs are used correctly. It reads your code, verifies that types are used consistently, and catches bugs before runtime.

## 1. Type Inference (RTH: we will skip type inference; types will _always_ be annotated in 210)

One of TypeScript's superpowers is **type inference**—it can often figure out what type something has without you explicitly saying so.

### Inferring from literals

```ts
const age = 30;  // TypeScript infers: number
const name = "Alice";  // TypeScript infers: string
const isActive = true;  // TypeScript infers: boolean

// TypeScript catches this error:
age = "thirty";  // ✗ Type error: cannot assign string to number
```

### Inferring from function calls

```ts
function add(a: number, b: number): number {
  return a + b;
}

const result = add(2, 3);  // TypeScript infers: result is number

result.toUpperCase();  // ✗ Type error: numbers don't have toUpperCase
```

### When to be explicit

While inference is convenient, it's sometimes good to be explicit about types:

1. **Function parameters** — Always annotate these. Without explicit types, you lose type safety.
   ```ts
   // ✓ Good: parameter type is explicit
   function greet(name: string): string {
     return `Hello, ${name}`;
   }

   // ✗ Bad: type is inferred as `any`, loses safety
   function greetBad(name) {
     return `Hello, ${name}`;
   }
   ```

2. **Function return types** — Annotate these to document intent and prevent accidental changes.
   ```ts
   // ✓ Good: clear what this returns
   function getName(person: { name: string }): string {
     return person.name;
   }

   // Risky: if you change the function body, the return type changes implicitly
   function getNameBad(person: { name: string }) {
     return person.name;
   }
   ```

3. **Complex variables** — Make the type explicit for clarity.
   ```ts
   // ✓ Clear what this is
   const config: { host: string; port: number } = {
     host: "localhost",
     port: 3000
   };

   // ✗ Less clear
   const configBad = {
     host: "localhost",
     port: 3000
   };
   ```

## 2. Type Narrowing (RTH: let's bring this up if it comes up)

When you check or refine types in your code, TypeScript **narrows** the type—it figures out that in certain branches, a value must be a more specific type.

### Narrowing with `if` checks

```ts
function processValue(value: string | number) {
  if (typeof value === "string") {
    // In this branch, TypeScript knows value is a string
    console.log(value.toUpperCase());  // ✓ strings have toUpperCase
  } else {
    // In this branch, TypeScript knows value is a number
    console.log(value.toFixed(2));  // ✓ numbers have toFixed
  }
}
```

### Narrowing with discriminated unions (RTH: let's bring this up if we have to talk about error cases)

```ts
type Result = Success | Failure;
type Success = { kind: "success"; data: string };
type Failure = { kind: "failure"; error: Error };

function handleResult(result: Result) {
  if (result.kind === "success") {
    // TypeScript knows result is Success
    console.log(result.data);  // ✓ Success has data
  } else {
    // TypeScript knows result is Failure
    console.log(result.error);  // ✓ Failure has error
  }
}
```

### Narrowing with truthiness (RTH: let's avoid truthiness and stick with ===; this could have been str!null)

```ts
function printLength(str: string | null) {
  if (str) {
    // In this branch, str is not null
    console.log(str.length);  // ✓ str is definitely a string
  } else {
    console.log("Empty");
  }
}
```

### Type guards (RTH: I think we should avoid this if we can and just use polymorphism instead later in the course)

For custom types, you can write **type guard functions** that narrow types:

```ts
type Dog = { kind: "dog"; bark(): void };
type Cat = { kind: "cat"; meow(): void };
type Pet = Dog | Cat;

// A type guard function
function isDog(pet: Pet): pet is Dog {
  return pet.kind === "dog";
}

function makeSound(pet: Pet) {
  if (isDog(pet)) {
    pet.bark();  // ✓ TypeScript knows pet is Dog
  } else {
    pet.meow();  // ✓ TypeScript knows pet is Cat
  }
}
```

## 3. Structural Typing (RTH: this is super sad, I think we should avoid this because it does not align with other languages anyways)

TypeScript uses **structural typing**, meaning types are based on their shape, not their name.

### What this means

```ts
type Point = { x: number; y: number };
type Vector = { x: number; y: number };

const p: Point = { x: 1, y: 2 };
const v: Vector = p;  // ✓ OK! Point and Vector have the same shape

function distance(p: Point): number {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}

distance(v);  // ✓ OK! v looks like a Point (same shape)
```

Even though `Point` and `Vector` have different names, they're compatible because they have the same structure.

### Structural compatibility goes both ways

```ts
type User = { name: string; email: string };

const obj = { name: "Alice", email: "alice@example.com", age: 30 };
// obj has all required properties + extra ones
const user: User = obj;  // ✓ OK! Extra properties are fine
```

But missing properties cause errors:

```ts
const incomplete = { name: "Bob" };
const user: User = incomplete;  // ✗ Error: missing email
```

### Why this matters

Structural typing means you can pass objects around as long as they have the right shape. You don't need explicit inheritance or interface declarations (though you can use them for documentation).

## 4. Union Types (RTH: we should talk about this for sure, when it comes up)

A union type describes a value that could be one of several types.

### Basic unions

```ts
type Id = string | number;

const userId: Id = "user-123";  // ✓ string is OK
const countId: Id = 456;  // ✓ number is OK
const invalid: Id = true;  // ✗ boolean is not in the union
```

### Union of objects

```ts
type Response = { status: "success"; data: any } | { status: "error"; message: string };

const goodResponse: Response = { status: "success", data: [1, 2, 3] };
const badResponse: Response = { status: "error", message: "Failed" };
```

### Never type (RTH: I would prefer if we never talk about never :)

In some cases, a branch is impossible. TypeScript represents this with `never`:

```ts
function exhaustiveCheck(value: string | number) {
  if (typeof value === "string") {
    return value.length;
  } else if (typeof value === "number") {
    return value.toFixed();
  } else {
    // If you've handled all cases, this code is unreachable
    const impossible: never = value;  // ✓ This is fine (unreachable)
  }
}
```

This pattern is useful for ensuring you've handled all cases in a union.

## 5. Common Type Patterns (RTH: let's talk about this when it arises)

### Optional types

```ts
type User = {
  name: string;
  email?: string;  // email is optional (string | undefined)
};

const user1: User = { name: "Alice" };  // ✓ email is optional
const user2: User = { name: "Bob", email: "bob@example.com" };  // ✓ email provided

// Accessing optional properties:
if (user1.email) {
  console.log(user1.email.length);  // ✓ email is narrowed to string
}
```

### Record types (for objects with dynamic keys) (RTH: if this comes up, let's talk about it)

```ts
type Scores = Record<string, number>;

const scores: Scores = {
  alice: 95,
  bob: 87,
  charlie: 92
};

// Keys can be any string
scores["diana"] = 89;  // ✓ OK
```

### Array types (RTH: obv we should talk about this)

```ts
type StringArray = string[];
type NumberOrString = (number | string)[];

const words: StringArray = ["hello", "world"];
const mixed: NumberOrString = [1, "two", 3];
```

### Readonly types (RTH: lets leave this out until encapsulation in part 2)

```ts
type Config = {
  readonly host: string;
  readonly port: number;
};

const config: Config = { host: "localhost", port: 3000 };
config.host = "example.com";  // ✗ Error: cannot assign to readonly property
```

## Summary

TypeScript's type checker provides several powerful features:

1. **Inference** — The compiler figures out types when not explicitly annotated
2. **Narrowing** — Type-safe refinement of types within branches
3. **Structural typing** — Compatibility based on shape, not name
4. **Unions** — A value can be one of several types
5. **Common patterns** — Optional, readonly, arrays, records for modeling various scenarios

Together, these features let you write code that's both flexible and safe—the type checker verifies correctness before you run your program.
