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
