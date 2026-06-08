#  Error handling

### Motivation

A class's contract covers not just success but also failure: what counts as an invalid input, what happens when an invariant cannot be maintained, and how these conditions are communicated to callers. Error-handling paradigms differ in where failure lives: exceptions keep failure as a dynamic concern that callers must remember to handle, while types like Result or Option lift failure into the type system itself.