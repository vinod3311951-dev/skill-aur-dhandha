# Color Dominion — FX-21 Final Mobile / Performance / Device QA Record

Stage: FX-21 — Final Mobile / Performance / Device QA
Status: PASS
Branch: color-dominion-fx07-smoke-v2
Final tested runtime candidate: e03250051bf07ccc8b7fee66ab4e2ad18f5827f5
FX-21 workflow run: 35653750694

## Ordinary-release authority boundary
The authoritative PWA-hours lock separates ordinary PWA release from paid BrowserStack winner certification.
FX-21 therefore performed the free mobile/browser/device-emulation and performance gate. No paid BrowserStack physical-device session was started.

## Authoritative performance budget
Portfolio game law targets 60 FPS with a graceful approximately 30 FPS floor.
The Factory X mobile rendering prevention protocol makes the release floor explicit: p95 FPS must be >=30 unless a product-specific frozen blueprint requires higher.
Color Dominion has no higher product-specific numeric floor, so FX-21 enforced p95 FPS >=30.

## Device/viewport coverage passed
Chromium and WebKit each passed:
- 320×568 portrait
- 360×800 portrait
- 390×844 portrait
- 430×932 portrait
- 600×960 tablet portrait
- 844×390 landscape fallback

## Functional/mobile checks passed
- touch-first gameplay entry;
- first board within the blueprint's <=10-second target after Play;
- bounded locator-relative touch-shot input with successful resolved shot;
- pause/resume;
- background/foreground recovery smoke;
- no horizontal overflow;
- visible button target floor of 48 CSS px/dp-equivalent;
- no console/page errors in the final run.

## Performance evidence
Each profile ran three post-warm-up requestAnimationFrame samples.

Final minimum p95 FPS:
- Chromium: 59.52 FPS
- WebKit: 58.82 FPS
- Required floor: >=30 FPS

First-board time after Play:
- Chromium worst observed: 48 ms
- WebKit worst observed: 615 ms
- Blueprint target: <=10 seconds

Cold-load time in this CI environment:
- Chromium worst observed: 551 ms
- WebKit worst observed: 689 ms

Resolved touch-shot elapsed time:
- Chromium worst observed: 1,164 ms
- WebKit worst observed: 3,234 ms
No separate locked input-latency ceiling was applied; successful touch resolution was mandatory on every profile.

Chromium additionally completed a 24-cycle same-page restart soak:
- 24/24 cycles remained in valid playing state;
- no browser/page error was reported;
- performance.memory reported start heap 10,000,000 and end heap 10,000,000 bytes, delta 0, in this CI run.

The profile-level diagnostic stream includes navigation/background transition spikes; the locked FPS verdict uses the dedicated post-warm-up sampling windows rather than mixed lifecycle-transition frames.

## QA incidents and repairs
1. Initial FX-21 attempt used one fixed touch aim point and timed out. This was classified as TEST HARNESS because it assumed one trajectory must always decrement shots.
2. The first harness repair accidentally referenced a missing sampleFrameBudget helper. This was a TEST HARNESS coding defect and was corrected before a product verdict.
3. Final-mobile accessibility enforcement found compact controls below the portfolio 48dp-equivalent target. CSS compact control height was raised to 48px.
4. A WebKit free-gate sample produced 26.32 p95 FPS against the locked >=30 floor. A causal rendering optimization was applied: idle boards no longer redraw the full canvas every animation frame; active projectile/aim/state-change rendering remains requestAnimationFrame driven.
5. Touch QA was moved from absolute touchscreen coordinates to locator-relative touch taps to remove viewport-offset ambiguity while preserving Playwright touch input.
6. Both engines isolated the remaining touch failure to the 844×390 landscape fallback. Compact landscape geometry was repaired with a height-aware bubble radius and lower launcher margin for very short landscape canvases, preserving portrait geometry and game rules.
7. The final candidate then passed all six profiles in both Chromium and WebKit, including three-run p95 FPS sampling.

## Regression-baseline maintenance
The persistent FX-19 no-change workflow originally froze the FX-18 runtime. Because FX-21 made authorized runtime repairs, that workflow would correctly flag the changes forever.
At FX-21 completion its guard baseline was advanced to the final tested FX-21 runtime candidate e03250051bf07ccc8b7fee66ab4e2ad18f5827f5. This is QA-infrastructure maintenance only; this completion record and workflow update do not alter product/runtime files.

## Physical-device boundary
Physical Android/iPhone BrowserStack certification remains deferred to the later winner batch after real traction, under the locked winner workflow.
The present PASS is the ordinary-release free mobile/device-emulation gate and is not represented as physical-device certification.

## Founder dispositions
Trademark/name disposition remains unchanged:
- keep "Color Dominion" as the working internal/PWA name;
- do not rename or auto-substitute;
- broad marketing/store trademark-name clearance remains open;
- full resolution remains deferred until post-FX-23.

Domain strategy remains unchanged:
- Phase 1 primary PWA URL uses [product].thinkingapps.in;
- Phase 2/3 actions remain queued post-FX-25 and were not acted on during FX-21.

## Compliance declaration
"No locked number, workflow, product fact, authority, or rule was blended, inferred, approximated, substituted, or silently changed during this stage."
