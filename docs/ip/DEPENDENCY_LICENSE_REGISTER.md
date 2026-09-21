# Color Dominion — DEPENDENCY_LICENSE_REGISTER

Status: FX-16

## Runtime dependencies
Runtime third-party package dependencies: NONE in the current branch.
Runtime uses browser/platform APIs and repository-authored JavaScript.

## Development / test tooling
- Node.js built-in test runner via `node --test tests/*.test.mjs`.
- GitHub Actions uses `playwright@1.55.0` as CI-only browser automation tooling. It is not shipped in the production PWA.
- Playwright v1.55.0 is licensed under Apache License 2.0 in the upstream Microsoft Playwright repository.
- The current package.json declares no runtime dependencies and no persistent npm devDependencies.

## Release rule
Any future runtime or build dependency must be inventoried with exact package/version/licence and required notices before release. No proprietary code from unknown or incompatible sources may be added.
