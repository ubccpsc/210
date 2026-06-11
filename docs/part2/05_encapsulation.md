# Encapsulation

### Motivation 

A verified invariant is only durable if external code cannot reach in and break it after construction, which convention cannot prevent at scale. TypeScript's access modifiers turn information hiding from a discipline-based convention into a language-enforced boundary, hiding the parts of the design most likely to change.

### CONTENT TBD

These need to go somewhere, can we put them here? We don't want them in part 1 because Set/Map require `new`
* Array can also be built with new!: `new Array<string>`, not just the syntatic sugar `string[]`
* Differentiate `Array` with `Set` (no duplicates) (unfortunately no sugar for instantiating a Map or Set, new is required)
* Introduce JSON dictionaries (key strings, values contain any type)
* Differentiate to built in `Map` type (explicit type safety!, keys of any type, iteration on insertion order, length property)
