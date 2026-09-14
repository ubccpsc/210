# Why CPSC 210 Exists

Software construction looks different now than it did before LLMs became competent at generating code that often actually works. This chapter makes the case for why software construction is a skill with a future, rather than one relegated to history.

## Programming Was Never the Important Part of Software Construction

We start with an admission: programming, the act of converting a clear description of a problem into working syntax, is being increasingly automated. And if that were all software construction was, the skill might be superseded by technology. But typing syntax was only ever the part of the job that looked like the job; it was never the _important_ part.

Programming is the act of producing a working program. Software construction is the discipline of building and evolving systems that stay valuable over a long life: systems that teams can work on, that are dependable, and that can evolve to meet needs no one has thought of yet. This discipline has been described as _"programming integrated over time"_ (a phrase from _Software Engineering at Google_): programming deals with a single instant, whereas construction concerns the whole lifetime of a system, at scale, deployed in the world. What LLMs automate is programming, only a small part of construction. Most of software construction lies exactly where the automation does not reach: deciding what to build, ensuring it is correct, keeping a growing system understandable, and making sure it can still be changed safely.

## LLMs: The Third Phase of Software Disruption

Decades ago Fred Brooks divided the difficulty of building software into two kinds. Incidental complexity is the difficulty we manufacture for ourselves: fighting syntax, boilerplate, and the setup that impedes the one line change we want to make. Essential complexity is the difficulty inherent in the problem: deciding what the system must do, designing it so its parts can change without quietly breaking one another, and knowing what correct even means. Brooks argued that no single tool would ever yield an order-of-magnitude gain, because tools only reduce incidental complexity, and the essential kind is what is really hard about building software.

The profession has already thrived through two earlier phases of this kind. High-level languages let compilers produce the machine instructions, freeing engineers to focus on what their programs should do rather than how. Reuse, through shared libraries, frameworks, and web services, let systems be composed from rich building blocks instead of always being built from scratch. Both raised the same worry, that building software would now need fewer people or less skill; each instead increased the complexity of the problems we were able to solve. Large language models are the third phase, and the broadest: they reduce incidental complexity not one layer at a time but across the breadth of tasks engineers perform. As before, the scope and ambition of the systems we attempt will grow with them.

## What Software Construction Becomes

When code was expensive to produce, the scarce resource was people who could produce it. Now that anyone can generate ten thousand lines in an afternoon, the scarce resource is something else. The systems that endure will not be the ones with the most code, but the ones a human can still understand a year later, and still effectively evolve when a new feature is needed or it fails in the middle of the night.

A shrinking share of software construction is writing code. A growing share is judging whether code is correct and whether it can evolve, and this is the harder half. It is easy to believe you understand code you wrote yourself, because designing and writing it demanded sustained thought; it is much harder to understand code you are only reading, whether it came from another engineer or an LLM. The shift from author to editor does not lower the demand for construction knowledge: it raises it as change volume and complexity grows every single day.

## Why We Still Teach You to Write Code

We aren't teaching you to write code by hand because we expect this to be a dominant part of your career. We are teaching you to write code because the understanding needed to direct and correct a machine cannot be acquired by watching one work. It is taught by doing the thing yourself: by writing the code, experiencing an unexpected fault, and learning how to resolve it. Reading code teaches you a little; writing it, and systematically evaluating the strengths and weaknesses of different alternatives, provides the real lessons. Without these you are not positioned to evaluate what an LLM produces: you can only take it or leave it on faith, which is neither judgement nor agency.

We build software to make a computer do useful work for us, and the only way to tell it precisely what work to do is to express our intent in source code. A prompt written in plain language is a request: different LLMs will generate different programs from the same prompt, and each may behave in subtly different ways. Source code is not a request. It is the exact instruction the machine carries out: whatever tool produced it, the code states, without ambiguity, how the system will behave every time it runs. Source code will therefore remain the lingua franca of software systems, and practitioners must be adept at understanding, judging, evolving, and creating it.

## What This Course Teaches

Constructing real-world software systems is not improvised. It is a systematic process, regardless of who or what writes the source code: the work begins before any code, in deciding precisely what the system must do, and continues after, in verifying the behaviour is correct and designing the implementation so future change stays possible. LLMs are adept at the implementation in the middle; they do not do the systematic thinking on either side of it. That thinking is what this course spends its time on, together with the construction skill that makes those judgements possible.
