# FACTORY X — FX-23 FOUNDER FUNCTIONAL CHECK
Effective: 2026-09-22
Amended by founder instruction: 2026-09-23
Status: LOCKED
Gate Type: FOUNDER-SIDE RELEASE GATE
Scope: ALL current and future Factory X products

## Purpose
This is the mandatory manual founder verification required before FX-23 may close.
It supplements automated QA. It does not modify or replace the locked audit rubric.

## Exact Founder Checklist — 10-Point Family-Coverage Matrix (amended 2026-09-23)

**No fixed level-number sampling.** For games with multiple mission families, the founder samples one actual, interactive mission from EACH family, choosing a different world for each family where the game offers enough worlds. Merely opening a level card is insufficient. The seven Sarhad Sniper family checks below replace the superseded 1/5/25/50/100 samples; these are **family-identified examples**, not a generic numerical-sampling rule.

| # | World | Local Mission | Global Mission | Family / Founder Observation |
|---|-------|---------------|----------------|------------------------------|
| 1 | World 1 | 7 | 7 | **Protection:** actual mission play; civilians rendered on the canvas, readable danger/safety feedback and protection objective. |
| 2 | World 2 | 2 | 17 | **Timing:** moving target and meaningful timing window. |
| 3 | World 3 | 3 | 33 | **Sequence:** ordered objective and incorrect-order feedback. |
| 4 | World 4 | 4 | 49 | **Identification:** correct marker distinguishable from distractors. |
| 5 | World 5 | 5 | 65 | **Ricochet:** visible rebound trajectory and corresponding hit feedback. |
| 6 | World 6 | 6 | 81 | **Disablement:** weak-point objective resolves correctly. |
| 7 | World 7 | 1 | 91 | **Precision:** real aiming, firing, scoring and outcome. |
| 8 | Cross-screen | — | — | **Presentation / blueprint compliance:** clean-session URL opens the correct product; home/Play work; inspect Rudraa identity, scenic worlds, canvas visuals and audio. Audit every blueprint feature against implemented V1, approved deferral or blocked gap, item by item. |
| 9 | Representative gameplay | — | — | **Controls and lifecycle:** touch/one-thumb action, Telescopic/Overview switch, pause and resume operate; no dead controls. |
| 10 | Progression | — | — | **Completion and navigation:** complete a real mission, unlock/advance, reload to confirm saved progression, and verify Back/Home navigation. |

For Sarhad Sniper, the mission positions above correspond to the 15-position-per-world pattern in \`sarhad-inspect/src/game/config.js\`. Use normal progression or an approved verification-mode route to reach sampled missions; record which route was used. No family is passed merely because its mission can be opened.

## Other Products / Non-Game Mapping

For games with different families or world counts, retain the 10-point structure while selecting distinct functional families and different worlds/regions where possible. The product-specific mapping must be written before the founder checks begin; never choose arbitrary level numbers that happen to exercise the same family. For utilities or non-game products, substitute distinct meaningful workflows for family checks; retain clean-session identity, first real interaction, completion, progression/persistence when applicable, and navigation. Mark genuinely inapplicable items explicitly.

## Evidence Discipline

Record the sampled world, mission and observed behaviour for each applicable family. Automated QA is separate; founder observation is not inferred from an automated PASS. A new FX-23 must include an item-by-item blueprint-to-implementation audit before PASS, with founder-approved V2 deferrals explicitly distinguished from implemented features.

## Pass Rule
FX-23 can close only after:
- all applicable checks pass,
- automated QA remains green,
- founder explicitly states VERIFIED.

## Fail Rule
If any check fails:
- FX-23 remains OPEN/BLOCKED,
- product release is suspended,
- repair returns to FX-14, FX-16, or a specifically logged repair stage,
- automated QA must be rerun after the repair,
- founder must repeat this checklist,
- only founder VERIFIED clears this gate.

## Current Product Application
- Sarhad Sniper: BLOCKED until mission-open/gameplay/progression fix passes automated QA and founder verification.
- Color Dominion: must pass this checklist after cosmetic fixes before FX-23 closes.
- Business Sudhaar: apply in retrofit batch before returning to staging.
- Skill Aur Dhandha: apply in retrofit batch before returning to staging.
- All future Factory X products: mandatory.
