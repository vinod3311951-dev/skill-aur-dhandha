# FACTORY X — LIVE-LINK PRE-SHARE LAW

Locked: 2026-10-02

This gate is mandatory for all 9 Factory X PWAs and for any future PWA/game/app link that is about to be shown to the founder, an auditor, tester, investor, store reviewer, or public user.

## Non-negotiable rule

**Do not share an Audit, QA, preview, staging, or production link merely because the build artifact passed.**

Before sharing any such link, Factory X must test and visually inspect the **actual deployed URL** that the recipient will open.

## Required sequence

SOURCE/BUILD PASS → DEPLOYED URL READY → LIVE-LINK FUNCTIONAL QA → LIVE-LINK RENDER/VISUAL QA → DEFECT REPAIR → REDEPLOY → RECHECK LIVE URL → SHARE LINK.

## Minimum live-link checks

1. Confirm the exact deployed URL returns the intended app and correct version/commit.
2. Exercise the primary user journey from the live URL, not localhost/build output.
3. Confirm all launch-access content required by the product is reachable.
4. For level/mission/content products, inspect every live level/mission at least once when feasible. If the product is too large for exhaustive inspection, the product-specific gate must explicitly define breadth and founder approval.
5. Capture live-render evidence at the target mobile viewport.
6. Cross-check Apple/WebKit and Android/Chromium on the live URL for critical flows.
7. Confirm no broken assets, stale service-worker content, auth/protection trap, missing route, console/runtime failure, or deployment-only layout regression.
8. Confirm visual quality is founder-ready: no placeholders, cardboard/prototype targets, debug labels, clipping, accidental overlays, broken animation states, or obvious low-fidelity substitutions.
9. Confirm Back/Home/Settings and safe-area/touch behavior on the live URL.
10. Only after the live-link gate passes may the founder/auditor-facing link be shared.

## Sarhad-specific application

For Sarhad Sniper, all 105 missions must be visually checked from the exact Audit-1 deployed preview before the Audit-1 link is handed to the founder. Localhost/build screenshots do not satisfy this final gate.

## Evidence

Record:
- exact URL
- deployment ID
- source commit
- browser/device matrix
- content/level count checked
- live functional result
- live visual result
- defects found/repaired
- date/time
- final share authorization

This law sits after ordinary pre-Audit build verification and immediately before any founder-facing link handoff.
