# Dependency audit findings

Reviewed October 17, 2026 after updating compatible packages and regenerating the lockfile.

## Production dependencies

`npm audit --omit=dev` reports no vulnerabilities. Tailwind, its CSS plugins, and the related PostCSS tooling are build-time dependencies and are now recorded under `devDependencies`.

## Remaining build-time findings

The full `npm audit` reports 9 vulnerable package findings (5 high, 4 moderate), all in the Tailwind CSS 3 build chain:

| Severity | Packages | Advisory area |
| --- | --- | --- |
| High | `braces`, `chokidar`, `micromatch`, `fast-glob`, `tailwindcss` | Denial of service while expanding or matching deeply nested patterns |
| Moderate | `postcss-selector-parser`, `postcss-nested`, `@tailwindcss/typography`, `tailwindcss-animate` | Denial of service while parsing selectors; plugin findings inherit the Tailwind or parser issue |

These packages are used to generate CSS during installation/build and are not part of the production-only dependency tree. A malicious or pathological build input could still consume build resources, so these findings remain relevant to CI and release builds.

## Why they remain

The compatible Tailwind 3 line ends at 3.4.19, which is still included in the reported vulnerable range. Its current dependency ranges select `chokidar` 3.6.0 and `postcss-nested` 6.2.0, which in turn require the affected `braces` 3.x and selector-parser 6.x lines. The latest compatible typography plugin also uses that parser line. There is no patched Tailwind 3 release that resolves this chain.

Resolving the remaining findings requires moving off Tailwind 3 and changing its CSS/PostCSS configuration and plugin setup. That is a major toolchain migration rather than a compatible dependency update, so no forced upgrade or out-of-range override was applied. The installed compatible versions were updated where available; `brace-expansion` is now 2.1.7, `fast-glob` 3.3.3, `minimatch` 9.0.9, and PostCSS 8.5.30 selects patched `source-map-js` 1.2.2.
