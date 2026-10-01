# Factory X — Current Work

**Active product:** FX-01 Sarhad Sniper — Precision Missions  
**Repository:** `vinod3311951-dev/skill-aur-dhandha`  
**Working branch:** `fx-01-audit1`  
**Production:** do not overwrite during current rebuild.

## Current phase

FX-01 Sarhad Sniper live combat/readiness integration is **browser-certified green** on `247aaba5b25484b42cef9ecc23675d4de977f48e`.

Next: inspect the fresh built visual slice and perform the final-quality visual/audio/presentation polish pass against the Factory X laws before moving toward the founder Android checkpoint.

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
- 11 fictional loadouts including Field Catapult + fictional Siege Rocket heavy launcher;
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
- distinct firing/launch sound for every loadout;
- visible ammo / reload / swap readiness;
- visible first-aid readiness and armour/armour-recovery state;
- no tiny global shot cap for long-form protection combat; reload/swap governs sustained fire;
- no real organisations/ethnic coding/real weapon models/gore.

## Critical evidence rule

The earlier Android/WebKit green run predates the newest binocular/loadout/combat-amendment changes.

**Therefore the current head is not yet re-certified.**

## Certified live-combat integration — 2026-10-01

**Certified runtime head:** `247aaba5b25484b42cef9ecc23675d4de977f48e`  
**GitHub Actions run:** `36879939075` — **SUCCESS**

Live Sarhad now includes:
- all 7 worlds + all 105 missions open from first launch;
- 11 fictional loadouts including Field Catapult + Siege Rocket;
- finite per-loadout ammo/charges with visible countdown;
- deterministic reload + swap readiness;
- distinct synthesized firing/launch profile for all 11 loadouts;
- one-thumb Reload / Swap / First Aid / Armour controls;
- Rudraa health + armour + first-aid + armour-plate state;
- deterministic multi-wave protection combat with live fictional hostile targets;
- civilians remain protected with visible score penalty on civilian hit;
- carrier becomes the final objective after hostile waves;
- Telescopic / Environmental / Binocular views remain available;
- open-access progress truth preserved: worlds/levels are open, while mastery/postcards require actual completion;
- cross-promotion remains **deferred** until the other production PWA URLs are ready and verified.

Complete automated evidence:
- mission/config validation: PASS;
- combat-state validation: PASS across **14 combat profiles**;
- loadout-state validation: PASS across **11 loadouts**;
- Android Chromium + iPhone/WebKit functional matrix: **34/34 PASS**;
- Android smoke repeat: **2/2 PASS**;
- iPhone/WebKit smoke repeat: **2/2 PASS**;
- World-1 visual slice capture: **1/1 PASS**;
- full workflow: **SUCCESS**.

Artifacts:
- `sarhad-public-build` — artifact `11171156677`;
- `fx01-qa-log` — artifact `11170582789`;
- `fx01-visual-slice` — artifact `11170174579`.

CI infrastructure root-cause repair:
- one prior run hung unusually during combined Playwright installation;
- workflow now separates QA dependency install, browser-cache restore, OS dependency install and browser install;
- installation steps are bounded by timeouts;
- obsolete branch runs continue to cancel via concurrency;
- the repaired workflow completed successfully.

## Next bounded task

1. Run latest-head build + 105-mission validator + Android/WebKit functional/smoke QA.
2. Fix any failures at root cause.
3. Lock 10-loadout fairness: no hitbox/accuracy advantage.
4. Implement deterministic civilian penalty + live combat presentation.
5. Design/implement armour/health/first-aid/blast state.
6. Design/implement multi-wave fictional-hostile combat.
7. Integrate and regression-test ammo/reload/swap, 11 loadouts, distinct firing audio, first-aid/armour readiness, all views/binoculars, pause/save/PWA/accessibility.
8. Capture fresh built visual evidence.
9. Founder Android checkpoint only after evidence is green.

## Reasoning

**HIGH** until combat architecture stabilises; then move to MEDIUM for normal implementation.
