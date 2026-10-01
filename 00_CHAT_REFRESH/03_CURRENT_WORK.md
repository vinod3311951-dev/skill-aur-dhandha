# Factory X — Current Work

**Active product:** FX-01 Sarhad Sniper — Precision Missions  
**Repository:** `vinod3311951-dev/skill-aur-dhandha`  
**Working branch:** `fx-01-audit1`  
**Production:** do not overwrite during current rebuild.

## Current phase

**Phase 1 reopened — final-quality World-1 vertical slice + founder combat amendment.**

## What is already implemented/committed

- editable Sarhad source made authoritative in build;
- Glacier Reach World-1 identity;
- original editable Rudraa + Glacier Reach SVG masters;
- cinematic world motion / glacier atmosphere;
- Rudraa briefing presence;
- ~88 BPM World-1 atmospheric pulse;
- Reduced Effects binding;
- Pause → Settings → same mission recovery;
- Android/WebKit CI and smoke-gate attribution repairs;
- real built screenshot capture in CI;
- Environmental + Telescopic playable views;
- Binoculars observation mode;
- 10 fictional loadouts including Field Catapult;
- canonical latest founder combat amendment recorded.

## Latest founder additions that are binding

See `FX01_FOUNDER_COMBAT_AMENDMENT_2026-10-01.md`.

Summary only:
- no cardboard/test-looking consumer targets;
- live animated environment and characters;
- moving protected civilians;
- civilian-hit score penalty;
- Rudraa armour + health + first aid + blast protection;
- longer multi-wave combat;
- numerous fictional hostile operatives;
- short non-graphic defeat vocal reactions;
- no real organisations/ethnic coding/real weapon models/gore.

## Critical evidence rule

The earlier Android/WebKit green run predates the newest binocular/loadout/combat-amendment changes.

**Therefore the current head is not yet re-certified.**

## Next bounded task

1. Run latest-head build + 105-mission validator + Android/WebKit functional/smoke QA.
2. Fix any failures at root cause.
3. Lock 10-loadout fairness: no hitbox/accuracy advantage.
4. Implement deterministic civilian penalty + live combat presentation.
5. Design/implement armour/health/first-aid/blast state.
6. Design/implement multi-wave fictional-hostile combat.
7. Regression-test all views, binoculars, loadouts, pause/save/PWA/accessibility.
8. Capture fresh built visual evidence.
9. Founder Android checkpoint only after evidence is green.

## Reasoning

**HIGH** until combat architecture stabilises; then move to MEDIUM for normal implementation.
