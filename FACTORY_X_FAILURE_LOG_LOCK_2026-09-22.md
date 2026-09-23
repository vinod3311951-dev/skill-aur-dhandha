# FACTORY X — FAILURE LOG
Effective: 2026-09-22
Status: LOCKED
Scope: All current and future Factory X stages

## FAILURE LOG

| # | Failure | Date | Root Cause | Prevention Rule |
|---|---------|------|-----------|-----------------|
| 1 | Deployed from stale Railway snapshot after "redeploy" | 2026-09-22 | Railway redeploy ≠ deploy latest commit | Before claiming deploy success: verify deployed commit SHA = intended commit SHA |
| 2 | Reported Sarhad Sniper "released" while levels didn't open | 2026-09-22 | Automated QA tested blueprint compliance, not playability | FX-23 Founder Functional Check (10-point) mandatory |
| 3 | Cosmetic fixes without QA evidence file | 2026-09-22 | Claimed QA pass before producing required evidence file | QA evidence file must exist before PASS |
| 4 | Vercel shared project misrouted domains | 2026-09-22 | Multiple branches share one project; domains follow latest deployment | Each product gets its own Vercel project |
| 5 | Routing "fix" that didn't fix routing | 2026-09-22 | Didn't verify serving branch after fix | Always verify by loading URL in clean session before claiming fix |
| 6 | Recommended Vercel Password Protection ($4,320/year) without cost check | 2026-09-22 | Did not verify pricing per project | No spend recommendations without cost verification + free alternative comparison |
| 7 | Skipped deployment verification when commit ≠ tested | 2026-09-22 | Focused on code, missed pipeline | Deploy success = intended commit == actual deployed commit |
| 8 | Used CURRENT_WORK.md as override without formal authority | 2026-09-22 | Informal override | Every override must be logged in Authority Index |
| 9 | Business Sudhaar branch carried Skill Aur Dhandha provenance files (SAD-ICON-001) | 2026-09-21 | Repository reused without checking inherited files | Verify all files in docs/ip/ belong to the specific product before declaring register complete |

| 10 | Vercel served an older Production build after the repaired branch showed a successful Preview deployment | 2026-09-22 | Preview Ready status did not automatically update the Production alias; the public URL still returned 404 until the intended Preview was promoted | Verify the exact Production deployment source SHA and alias assignment; check live `/src/main.js` HTTP 200 and repaired-code fingerprint; rerun live public-URL Playwright before declaring deployment/QA success |

### ENTRY #11 — Public URL returned 404 after PASS claim
Date: 2026-09-22

**Failure:** Deployment reported PASS for Sarhad Sniper, but the public URL returned 404. No QA evidence file existed.

**Root cause:** PASS declared without a live URL check. Production Branch was set to `main` instead of `sarhad-sniper-deploy`.

**Prevention:** No PASS without a live URL check in a clean session. No PASS without a QA evidence file.

### ENTRY #12 — Unverified QA result treated as current
Date: 2026-09-22

**Failure:** "13/14 with WebKit freeze" was cited from CI run 35716508506 on commit `e3cb4b8d`, but applied to production commit `20d92e3`, which had never been tested.

**Root cause:** A result from one commit was carried forward as though it applied to a different commit.

**Prevention:** Before citing any QA result, verify that the run's commit SHA matches the commit under discussion. Add a SHA-match check to the Opening Protocol.

### ENTRY #13 — CI ran Chromium only, never WebKit
Date: 2026-09-22

**Failure:** `sarhad-fx23-functional.yml` ran only `fx23-functional.spec.js` with `--project=chromium`. The smoke test and WebKit project never executed in CI.

**Result:** "QA green" for days while iPhone users froze.

**Root cause:** Workflow configuration did not match the Playwright projects supported by the product.

**Prevention:** Every product's CI must run all Playwright projects the product supports. Add an audit checklist item.

### ENTRY #14 — WebKit synchronous webp decode on CSS background
Date: 2026-09-22

**Failure:** The iPhone WebKit smoke test froze one frame for 4076ms. Android Chromium was unaffected. The freeze occurred during home-screen idle, before any mission.

**Root cause:** `.market-home` CSS applied `var(--home-scene)` as `background-image` on first paint. WebKit decoded the referenced webp synchronously on the main thread during CSS paint. Chromium decoded off-thread.

**Fix applied:** A `build.mjs` post-extraction patch defers the CSS variable assignment until after first paint.

**Prevention:** No large image (>200KB) may be referenced as a CSS background on the first-painted screen without deferral past the load event.

## APPENDED ENTRIES — 2026-09-23

### ENTRY #15 — Blueprint-to-build gap not audited
The blueprint specified features that were never implemented in either the payload build or the checkpoint source (Rudraa in-game sprite, music, parallax, forward camera). Discovered only at FX-23 Founder Functional Check.

**Prevention:** Every product's FX-23 must include a blueprint-compliance audit before PASS. Feature list vs blueprint feature list, item by item.

### ENTRY #16 — Founder check sampled one mission family
The original FX-23 check sampled levels 1, 5, 25, 50, 100 — all precision missions in the founder-reported deployed build. No protection, timing, sequence, ricochet, identification or disablement mission was tested. Civilian-rendering and other family-specific behaviours were never verified.

**Prevention:** FX-23 founder check must sample one mission from EACH mission family, in a different world each time. Use the corrected 10-point matrix.

### ENTRY #17 — Chat with ChatGPT hit message-stream error twice
Long-running diagnostic chats in the Factory X Project failed with "Error in message stream" mid-task, losing pending replies.

**Prevention:** Split long diagnostic sessions into shorter chats. Start a fresh chat per task, not per day.

**Numbering reconciliation note:** The accessible GitHub version of this log contains entries #1–#10 followed by the founder-requested #15–#17. Entries #11–#14 were not present in that version and have not been invented, deleted, or silently renumbered. Reconcile against any newer canonical record before assuming the series is complete.

### ENTRY #18 — Color Dominion FX-23 objective-family and signature gaps
Date: 2026-09-23

**Failure:** The founder's manual FX-23 sample failed or was inconclusive for Target Colours, Required Clusters, Drop Anchors, Rescue Marked, Dominion Claim and Limited Shots. The grey-world-to-colour cascade signature moment failed; Reduced Motion appeared partial. Progression/navigation was not tested because the founder stopped after the early failures. FX-23 status: FAIL; no closure.

**Repository diagnosis:** On branch `color-dominion-fx07-smoke-v2` at `3f75e23a9147124dc5ab41d2e6aceba2997b9c81`, all six named objectives have configuration and engine completion logic, but Required Clusters counts removed bubbles rather than cleared clusters; Drop Anchors and Rescue Marked use generic removal/drop with decorative markers; Dominion Claim uses a score threshold and generic success presentation; Limited Shots is enforced with only a three-shot modifier; Target Colours has a target-colour win condition but no distinctive target presentation in the inspected renderer. Match-triggered bloom is cosmetic, with faded/restored imagery switched in a generic completion preview rather than an in-game cascade transformation. Reduced Motion suppresses certain app-level effects; full stylesheet behaviour was not inspected. Stage 25 config provides 25 shots, differing from the founder's observed 22; actual deployed commit was inaccessible and remains unverified.

**Root cause:** Existing objective-presence and renderer-identity checks did not establish differentiated in-play mechanics or founder-recognizable signature quality.

**Prevention:** At FX-23 test each promised objective family through its distinct observable outcome; verify the actual V1 signature moment as experienced by a first-time player. Distinguish family-definition tests from mechanics and visual acceptance tests. Preserve founder failure evidence even where partial code exists.

## HOW THIS LOG IS USED

Before producing any completion packet that claims:
- "deployed successfully"
- "QA passed"
- "stage complete"
- "ready for founder verification"
- "fix applied"

Check this log to verify:
1. The claim matches verified evidence.
2. No pattern from this log is being repeated.
3. The specific prevention rule has been followed.

If any check fails → RED STOP and report the gap.

## FAILURE LOG UPDATE RULE

New failures added to this log in the SAME session they occur.
Each entry requires: failure, date, root cause, prevention rule.
Never delete an entry. Never silently retire a rule.

## COPYRIGHT FAILURE PATTERNS

Known copyright/provenance risks that recur:

1. **INHERITED PROVENANCE FILES**  
   Products deployed from shared repos may inherit another product's IP register files. Before FX-25 Freeze, verify docs/ip/ files belong to the correct product. Business Sudhaar is a known example (inherited SAD files).

2. **MISSING REGISTERS**  
   Some products have partial registers (4–5 files instead of 8). Partial ≠ complete. FX-25 cannot close without all 8.

3. **STALE TRADEMARK CHECKS**  
   Color Dominion has an open trademark question (DOMINION in game sector). Trademark checks should be re-verified before broad marketing launch, not just at FX-04.

4. **AI-ASSISTED ASSET PROVENANCE**  
   If AI-generated assets are used, provenance must still be recorded (tool, date, prompt, human edits, hash). "AI-generated" ≠ rights-safe.

5. **NO SOURCE MASTERS**  
   Beyond register files, source masters should be preserved. If a source master is lost, provenance is weaker.

## COPYRIGHT GATE CROSS-CHECK

Before declaring any product's IP register complete:

1. All 8 mandatory registers exist.
2. Each register references the correct product.
3. No inherited files from other products.
4. All asset hashes recorded.
5. Trademark status documented.
6. Open gaps logged for later resolution.

If any check fails → RED STOP.
