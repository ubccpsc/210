# Asynchronous Effects and Time

CONTENT HERE

### WORKING NOTES:

* promises throw errors. but they aren't checked in TS, so they aren't _required_ to be caught
* for now, let's just tell them if their program crashes, fix the bug. we will guide them towards problems that don't throw
* introduce how to catch those errors in part 2

Goal
===

Students can reason about computations that complete later and manage time explicitly.

Key ideas & examples

* why deferred computation has to happen (lightweight discussion of things that are slow in computers and concurrency. focus on values from https://gist.github.com/jboner/2841832 for iteration, disk, network; don't worry about memory. add discussion of `setTimeout` for human-level durations (10 sec timer))
* Callbacks as deferred computation (focus on deferred computation and why it is necessary;  they've already seen anonymous functions in `test` so the mechanism might not be that bad...)
* Promise objects and invariants (they've seen objects, but do they ever need to declare or instantiate a promise? probably not at this point??)
* Chaining and error propagation (do we need to handle this? let's try to defer this until the second error handling lecture)
* async / await as syntax, not semantics

