# Color Dominion — DEPENDENCY_LICENSE_REGISTER

Status: FX-14
Runtime third-party package dependencies: NONE in the current branch.
Runtime uses browser/platform APIs and repository-authored JavaScript.

Development/test tooling:
- Node.js test runner invoked through package.json script `node --test tests/*.test.mjs`.
- The current package.json declares no npm dependencies or devDependencies.

Release rule:
Any future dependency must be inventoried with exact package/version/licence and required notices before release. No proprietary code from unknown or incompatible sources may be added.
