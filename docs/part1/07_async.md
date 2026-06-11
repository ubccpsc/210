# Asynchronous Effects and Time

CONTENT HERE

### WORKING NOTES:

* start with a lightweight discussion of threading and a light description of the typescript threading model
* be clear that the benefit of the way TS parallalism model works is that it is easy to use, but is less flexible than more full-featured models like (short discussion about Java or Rust threads here).
* explain why deferred computation is important in the TS world given its single-threaded nature
* provide examples of things that are slow and need to be dealt with asynchronously to avoid blocking the program (and explain what blocking is)
* need to discuss what a promise object is, and explain the concept of promises, even if we aren't showing the `.then` / `.catch` syntax.
* promises throw errors. but they aren't checked in TS, so they aren't _required_ to be caught. we will ignore faults in this reading and come back to them when we talk about exceptions in part2/04_errors.md
* for now, let's just tell them if their program crashes, fix the bug. we will guide them towards problems that don't throw

Goal
===

Students can reason about computations that complete later and manage time explicitly.

Key ideas & examples

* why deferred computation has to happen (lightweight discussion of things that are slow in computers and concurrency. focus on values from https://gist.github.com/jboner/2841832 for iteration, disk, network; don't worry about memory. add discussion of `setTimeout` for human-level durations (10 sec timer))
* Callbacks as deferred computation (focus on deferred computation and why it is necessary;  they've already seen anonymous functions in `test` so the mechanism might not be that bad...)
* Promise objects and invariants (they've seen objects, but do they ever need to declare or instantiate a promise? probably not at this point??)
* Chaining and error propagation (do we need to handle this? let's try to defer this until the second error handling lecture)
* async / await as syntax, not semantics

