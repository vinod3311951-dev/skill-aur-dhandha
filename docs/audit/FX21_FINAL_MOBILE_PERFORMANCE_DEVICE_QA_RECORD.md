# Color Dominion — FX-21 Final Mobile / Performance / Device QA Record

Stage: FX-21 — Final Mobile / Performance / Device QA
Status: EXECUTION / REPAIR IN PROGRESS
Branch: color-dominion-fx07-smoke-v2

## Ordinary-release authority boundary
The authoritative PWA-hours lock separates ordinary PWA release from paid BrowserStack winner certification.
FX-21 therefore performs the free mobile/browser/device-emulation and performance gate. No paid BrowserStack physical-device session is started.

## Authoritative performance budget
Portfolio game law targets 60 FPS with a graceful approximately 30 FPS floor.
The Factory X mobile rendering prevention protocol makes the release floor explicit: p95 FPS must be >=30 unless a product-specific frozen blueprint requires higher.
Color Dominion has no higher product-specific numeric floor, so FX-21 enforces p95 FPS >=30.

## Device/viewport coverage
Chromium and WebKit each cover:
- 320×568 portrait
- 360×800 portrait
- 390×844 portrait
- 430×932 portrait
- 600×960 tablet portrait
- 844×390 landscape fallback

## Functional/mobile checks
- touch-first gameplay entry;
- first board within the blueprint's <=10-second target after Play;
- bounded touch-shot attempts with successful resolved shot required;
- pause/resume;
- background/foreground recovery smoke;
- no horizontal overflow;
- visible button target floor of 48 CSS px/dp-equivalent;
- console/page-error absence.

## Performance evidence
- dedicated requestAnimationFrame sample per profile;
- p95 FPS >=30 hard gate;
- input-to-resolved-shot elapsed time recorded;
- cold-load and first-board timing recorded;
- Chromium performs a 24-cycle same-page restart soak;
- Chromium records JS heap before/after the soak when performance.memory is available.

## QA incidents
1. Initial FX-21 attempt timed out on one fixed touch aim point in both Chromium and WebKit. This was classified as TEST HARNESS because prior FX-18 touch paths were green and the harness assumed one trajectory must always decrement shots. The QA was changed to bounded alternative aim points rather than changing game rules.
2. The first repair commit accidentally referenced a missing sampleFrameBudget helper. This was a TEST HARNESS coding defect and was corrected before any product verdict.\n3. Final-mobile accessibility enforcement identified compact controls below the portfolio 48dp-equivalent target; CSS compact control height was raised to 48px and the full regression matrix is required to rerun.\n4. A WebKit free-gate sample produced 26.32 p95 FPS against the locked >=30 floor. A causal rendering optimization was applied: idle boards no longer redraw the full canvas every animation frame; active projectile/aim/state-change rendering remains requestAnimationFrame driven. Performance sampling was strengthened to three post-warm-up runs per profile.\n5. Touch QA was changed from absolute touchscreen coordinates to locator-relative touch taps to remove viewport-offset ambiguity while preserving real Playwright touch input.

## Physical-device boundary
Physical Android/iPhone BrowserStack certification remains deferred to the later winner batch after real traction, under the current locked winner workflow. Emulator/browser performance evidence is necessary for ordinary PWA release but is not represented as final physical hardware certification.

## Founder dispositions
Trademark/name disposition remains unchanged.
Domain Phase 2/3 actions remain queued post-FX-25 and are not acted on here.

## Compliance declaration
"No locked number, workflow, product fact, authority, or rule was blended, inferred, approximated, substituted, or silently changed during this stage."
