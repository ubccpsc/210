# Exceptions and Error Handling

<!-- Many mechanisms to signal errors
1. throw (includes useful debugging information)
2. return a discriminated type (like Result)
3. return undefined/null
4. set a flag in an outer scope
-->

<!--
JSON.parse as something that throws

- exceptions
- try/catch/finally (barf)
-->

## Control Flow

When a function cannot perform what has been requested, it can signal failure using the `throw` keyword.
When NodeJS encounters a throw, it immediately stops executing the code it was on and jumps control to the most closely defined error handling block.

## Error Objects

Often, but not always, exceptions throw error objects.
The error object 

## Handling and Recovery

<!--try/catch/finally>