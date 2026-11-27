# CPSC 210 Textbook

The source of the CPSC 210 Software Construction textbook, a VitePress site. Chapters live in `docs/part1`, `docs/part2` and `docs/part3`. Parts 2 and 3 continue Part 1's chapter numbering, so `part2/01_abstraction.md` is Chapter 10 and `part3/01_coupling.md` is Chapter 17. Anything pushed to `main` deploys to the live site. Reference material appears in `docs/reference`.

This textbook must always be factually correct. Text should be free of AI writing tropes and idioms. Writing should be succinct and clear, since our goal is always to support student learning.

## Working in this repo

- Never commit or push.
- Never edit .gitignore.
- Edit files in the main checkout, not in a worktree.
- Do not run `pnpm docs:build` unless asked, because it regenerates the files in `docs/public/diagrams`. Use `pnpm docs:dev` to preview.
- After editing a chapter, check that `<details>` opening and closing tags are balanced and that the number of code fences is even.
- Before the text states how code behaves, run the code to confirm it. This repo has no test setup, so run snippets in a scratch directory with `typescript`, `vitest` and `@ubccpsc/210-toolkit` installed.
- Ask before cutting material or moving it between sections or chapters. The authors often move content on purpose.
- Don't examine, make suggestions for, or change `gen-ai-and-you.md`

## Continuity

- A chapter may only use language features and APIs taught in earlier chapters. For example, Chapter 3 checks for a whole number with `%`, because `Number.isInteger` has not been taught yet.
- The features listed in `docs/reference/language-features.md` (such as `switch`, `??`, `instanceof` and truthiness checks) are deliberately left out of the book. Do not use them in chapter text or examples.
- A cross-reference must point to the section where the concept is actually taught. Use the form `[Chapter N](./NN_slug#anchor)`, where the anchor is VitePress's slug of the heading. Only include cross-references when they are important, do not litter the book with them.
- Recaps of earlier material belong in a chapter's opening. In the body, a cross-reference may point at the specific section a passage relies on. Do not end a chapter with a preview of the next one. The last chapter of a part may end by introducing the next part.
- When content appears in a tooltip/details box and the main text, prefer the main text version so it is easier for students to search for in the text.

## Testing vocabulary and helpers

- Use the ISTQB terms **specification-based testing** and **structure-based testing**. "Black-box" and "white-box" appear only as "also known as" where those terms are defined in Chapter 9.
- Chapters 1–8 test with `checkExpect` and `checkError` from `@ubccpsc/210-toolkit`. From Chapter 9 on, tests use Vitest's `expect`.
- `assert` from `node:assert/strict` and `checkError` are introduced in Chapter 3 for precondition checks.
- A check whose body is a block in braces is introduced in Chapter 6.
- Lifecycle hooks (`beforeEach` and the others) are introduced in Chapter 9 under Shared Setup. Always place them inside a `describe` block, with the variables they set declared in that block, never at file level.

## Prose

Write plainly and directly. State a claim once, where it applies. If the `avoid-ai-writing` skill is installed, use it for a broader audit; where it conflicts with the rules here, these rules win.

Avoid:

- "Not X. It is Y." reframes.
- Aphorisms that close a paragraph.
- "X is what makes Y…", "matters as much as…", "the distinction matters because…".
- "The same idea from the other side", or "seen from inside/outside".
- Superlatives such as "the strongest argument" or "most often skipped".
- "Rather than" when the contrast adds nothing.
- Several rhetorical questions in a row.
- One-sentence paragraphs used as a reveal.
- Chapter openers such as "This chapter argues…" or "This chapter is organized around one claim".
- Repeating a point later in the same chapter, or ending a section with a summary that restates it. The closing `####` section at the end of each chapter is the exception: it summarizes the chapter by design.
- Em dashes.

Conventions:

- Canadian spelling: British-style endings such as behaviour, colour, centre, catalogue, travelling, but American-style -ize verbs and nouns such as organize, recognize, localization, characterization, never -ise or -isation (the Canadian Oxford convention). Words that are -ise everywhere, such as advertise, exercise, surprise, stay as they are. Keep `color` where it is code, such as a diagram attribute.
- Headings use Title Case.
- Write "runtime" as one word, never "run time" or "run-time".
- Write "judgement", not "judgment".

## Markup

- **Bold** marks a term's defining first use, once per term, and every bold term has a glossary entry. Use italics sparingly, and not for emphasis.
- Bold may label the items of an overview or recap list. These labels are not defining uses, and a label gets a glossary entry only when the term is not defined elsewhere.
- Tooltips are `<details class="tooltip ...">` blocks, with the class `ts-tips`, `deep-dive`, `link-110` or `exercise`. Place each one directly after the passage it explains, not grouped at the start of a section.
- Diagrams are `graphviz`, `plantuml`, `pikchr`, `svgbob` or `ditaa` blocks followed by `<!-- caption="..." -->`. When colour carries meaning, the caption explains it, and a colour means the same thing in every figure in a chapter.
- Wrap long code listings in `<CollapsibleCode>`.
	
## Code Properties

- Prior to Chapter 12, code should not have access modifiers (`public`, `private`, `protected`) or `readonly`. Call `public`, `private` and `protected` access modifiers in the text.
- Code should be syntactically correct.
- An elided body in a listing that shows only a class's shape may be written `{ /* ... */ }`; it does not need to compile. Exercise skeletons that students complete must compile, so give their methods placeholder returns.
- Method documentation opens with a succinct description of what the method does, followed by `@param {type} name description` for each parameter, `@returns {type} description` for the return value, and `@throws {type} description` for each error the method throws. Every `@param`, `@returns` and `@throws` description ends with a full stop. It describes the method's requirements, not its implementation. Only complete methods need this documentation; fragments shown to illustrate a single point do not.
- Field documentation precedes the field's declaration and describes any invariants the field is subject to. Keep it succinct and direct. The same applies to the properties of a `type`: document each with a comment before it, not a trailing comment.
- Documentation comments are introduced in Chapter 3; code in Chapters 1 and 2 has none.

## Glossary (`docs/reference/glossary.md`)

- List only terms introduced in bold, each linked to its first introduction.
- Sort case-insensitively. A comma sorts before a space, and a space sorts before a hyphen or slash.
- Entries commented out as "EXCLUDED, do not re-add" stay excluded.
