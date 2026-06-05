# Cohesive decomposition

### Motivation

Decomposing a system into classes only pays off if each class makes sense on its own; a class that enforces several invariants stops being a useful abstraction, since its users must understand all of them at once. We anchor what belongs inside a class to the invariant it enforces, applying the Single Responsibility Principle at both the class and method level to decompose the system into cohesive classes. A cohesive class is understandable from its invariant alone and can be modified without impacting the rest of the system.