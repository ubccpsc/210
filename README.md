# CPSC 210: Software Construction Handbook

### [CPSC 210 Software Construction Handbook Link](https://ubccpsc.github.io/210/)

This repository contains the source of the CPSC 210 online handbook. While the first draft will be ready by the start of 26W1 (Sept 9, 2026), it will be rapidly changing before then and will still evolve as the term progresses. Unless you're developing the text, you probably just want to use the handbook link above.

## Errata / Contributions

If you find any errors in these materials, please open a Pull Request so we can review and incorporate your fixes. Pull requests that are associated with individual chapters are much easier to review than wider-ranging changes.

## Development

Content is written in markdown in the `docs/` directory and rendered using [vitepress](https://vitepress.dev/guide/getting-started).

You can preview your changes locally by running:

```sh
pnpm install
pnpm docs:dev
```

Any changes pushed to `main` will automatically be deployed in the [handbook](https://ubccpsc.github.io/210/).
