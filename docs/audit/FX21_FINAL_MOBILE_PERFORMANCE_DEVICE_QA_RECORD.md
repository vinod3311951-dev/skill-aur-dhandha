# Color Dominion — FX-21 Final Mobile / Performance / Device QA Record

Stage: FX-21 — Final Mobile / Performance / Device QA
Status: EXECUTION PENDING
Branch: color-dominion-fx07-smoke-v2

## Ordinary-release authority boundary
The current authoritative PWA-hours lock separates ordinary PWA release from paid BrowserStack winner certification.
Therefore FX-21 performs free browser/device-emulation, responsiveness, lifecycle, input and performance-evidence QA.
It does NOT purchase or start BrowserStack physical-device sessions.

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
- one touch-shot resolving on every profile;
- pause/resume;
- background/foreground recovery smoke;
- no horizontal overflow;
- visible control target floor;
- console/page-error absence.

## Performance evidence
- requestAnimationFrame timing distribution is recorded for each profile;
- input-to-resolved-shot elapsed time is recorded;
- cold-load and first-board timing are recorded;
- Chromium additionally performs a 24-level repeated-render soak;
- Chromium records JS heap before/after the 24-level soak when performance.memory is available.

## Performance-budget authority note
The Color Dominion blueprint requires a performance budget to pass, but the currently indexed Color Dominion authorities do not provide a numeric FPS/frame-time/input-latency/memory ceiling.
FX-21 therefore records the metrics and checks functional stability without inventing a numeric release threshold.
A numeric performance verdict cannot be represented as a locked budget unless an authoritative value already exists or the founder explicitly establishes one.

## Physical-device boundary
The reusable real-device standard remains retained for the later winner batch. Physical Android/iPhone BrowserStack certification is not performed here because the authoritative ordinary-release workflow explicitly defers that paid layer until real traction selects approximately 3–4 winners.

## Founder dispositions
Trademark/name disposition remains unchanged.
Domain Phase 2/3 actions remain queued post-FX-25 and are not acted on here.

## Compliance declaration
"No locked number, workflow, product fact, authority, or rule was blended, inferred, approximated, substituted, or silently changed during this stage."
