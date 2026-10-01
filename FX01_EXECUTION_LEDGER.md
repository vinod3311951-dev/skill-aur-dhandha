# FX-01 — Sarhad Sniper Execution Ledger

**Contract:** FX-01 MASTER END-TO-END EXECUTION CONTRACT  
**Goal:** authoritative current baseline → final-quality representative slice → full consumer PWA → AUDIT 1 READY  
**Working branch:** `fx-01-audit1`  
**Branch baseline:** `464a74ccdcdcdfb0166fd95dba0a0d79af78aa62`  
**Repository:** `vinod3311951-dev/skill-aur-dhandha`  
**Created:** 2026-10-01

## Authority recovered

1. AMIT FINAL market-release standard remains the portfolio release authority.
2. Sarhad authoritative blueprint remains the product-mechanics authority.
3. Repository state is the implementation truth.
4. No historical status note may silently override verified repository state.

## Product authority state

**Founder amendment 2026-10-01:** the combat / mission-engagement layer has been deliberately reopened. Canonical file:
`FX01_FOUNDER_COMBAT_AMENDMENT_2026-10-01.md`.

Where that amendment conflicts with older combat-only wording, the later founder amendment wins. Unrelated Sarhad locks remain active.

Still locked:
- Captain Rudraa;
- seven fictional scenic worlds;
- 105-mission campaign structure unless later explicitly changed;
- mobile-first one-thumb usability;
- Environmental + Telescopic playable views;
- Binocular observation mode;
- fictional geography, factions and equipment;
- no real countries, borders, military units, extremist organisations or real weapon models;
- no gore / graphic injury;
- local-first PWA, accessibility, privacy, performance and AMIT FINAL gates.

## Verified current implementation baseline

The current production branch contains:
- deterministic 105-mission configuration;
- seven current world identities;
- progression and per-mission mastery persistence;
- local save schema v3 with migration/fallback;
- pause/background fairness handling;
- scope/overview aiming presentation;
- Captain Rudraa home-screen portrait treatment;
- seven scenic production images packed in the current release payload;
- service worker/offline shell;
- QA diagnostics and Playwright harness;
- current public Railway/Vercel deployment history and automated QA evidence.

## Important implementation gaps against the new FX-01 contract

These are **not** permission to weaken the contract. They define the work ahead.

1. Current repository world names/art direction do not match the newer approved seven-world storyboard names in the enhanced blueprint. This must be resolved by authority before mass asset replacement.
2. Rudraa is currently primarily a home-screen portrait; the desired production contract calls for broader state-driven character presence.
3. Current audio is procedural ambience/tonal feedback; the desired production contract calls for a coherent original 82–94 BPM sonic identity with stronger world-specific and impact language.
4. Current scene system is primarily static scene plates plus limited atmospheric decoration; the desired contract calls for stronger layered 2D/2.5D world life while keeping gameplay truth unchanged.
5. Current V2 backlog explicitly defers Rudraa sprite, music sequencer, full parallax and extended audio. The new founder-issued FX-01 contract supersedes that deferral for Audit-1 work, but does **not** authorize changing frozen gameplay mechanics.
6. Current build includes an early-build footer and robots block; these remain appropriate during development and must be removed only at market-release freeze.
7. Production deployment currently traces to an older packed payload commit; the new FX-01 branch must not overwrite production until Audit-1 candidate evidence is green and deployment is explicitly warranted.

## Baseline QA evidence recovered

- Free Playwright matrix previously passed on Chromium, Firefox, WebKit, Pixel emulation and iPhone WebKit emulation.
- Earlier real-device BrowserStack evidence passed Galaxy M32 and Pixel 8, identified S22 performance weakness and an iPhone harness blocker.
- Ordinary PWA release policy later separated paid physical-device certification from the normal release gate.
- Existing diagnostics expose frame pacing, asset failures, uncaught errors, shot/pause data and deterministic state for QA.

## Current reasoning mode

**HIGH** — combat architecture remains open, and the new portfolio laws require root-cause research plus Apple/WebKit/media risk review before further legacy-code edits. The latest deterministic QA/combat-profile batch is currently under CI validation.

## Portfolio-wide laws now inherited

FX-01 and all future Factory X products must now obey these canonical cross-portfolio files:

- `FACTORY_X_ONE_THUMB_GAMEPLAY_LAW.md` — every Factory X game must be fully playable one-handed with one thumb on mobile.
- `FACTORY_X_ROOT_CAUSE_AND_WEBKIT_STABILITY_LAW.md` — research repeated failure classes and reverse-risk rich media / Apple-WebKit stability before another legacy-code edit.
- `FACTORY_X_AUDIO_REWARD_CELEBRATION_LAW.md` — genre-specific original/licence-clean audio, provenance, earned reward celebrations, Reduced Motion and combined graphics+audio WebKit testing.

These laws are pre-edit/release gates, not optional notes.

## Current phase

**PHASE 1 REOPENED — WORLD-1 FINAL-QUALITY VERTICAL SLICE + COMBAT-LAYER AMENDMENT.**

Completed / committed so far:
- isolated work on `fx-01-audit1`; production remains untouched;
- editable Sarhad source made authoritative over the historical compressed payload;
- brittle generated-source patching removed; runtime fixes moved into editable source;
- World 1 locked to **Glacier Reach**;
- original project-created `glacier-reach.svg` and `captain-rudraa.svg` added and registered in the in-progress IP files;
- 2D/2.5D scenic motion, glacier atmosphere and Rudraa briefing presence added;
- ~88 BPM World-1 ambient pulse established inside the approved 82–94 BPM range;
- Reduced Effects wired to visible presentation;
- Pause → Settings → same active mission repaired;
- WebKit/Android QA attribution repaired and performance gates isolated from CI contention;
- the isolated functional + smoke matrix reached a genuine green state before the latest founder feature additions;
- real built home / briefing / mission screenshots captured in CI and visually inspected;
- screenshot rough edges identified and chipping begun;
- Environmental and Telescopic modes made explicit as two playable views sharing one authoritative hit truth;
- **Binoculars** observation mode implemented: one tap in/out, no firing while active;
- **10 fictional loadouts** implemented in the briefing rack, including **Field Catapult**;
- latest founder combat/interaction decisions recorded canonically in `FX01_FOUNDER_COMBAT_AMENDMENT_2026-10-01.md`.

Important: the newest binocular / 10-loadout / combat-amendment head has **not yet completed the full regression matrix**. The earlier green run must not be misrepresented as validating these newest changes.

## Latest founder loadout/ammo/audio amendment

Binding Sarhad-specific additions:
- expand loadout rack from 10 to **11** with fictional **Siege Rocket** heavy rocket-class add-on;
- every loadout gets its own original/licence-clean firing/launch sound signature;
- sustained combat uses visible magazine/charge counts rather than a tiny global shot cap;
- HUD must show ammo, reload countdown/readiness, swap readiness, first-aid readiness, armour state and armour-recovery readiness;
- all of the above must remain one-thumb operable and deterministic;
- no copied real weapon model/sound.

## Latest architecture batch — ammo / readiness state

Committed on `fx-01-audit1`:
- new pure `src/game/loadout-state.js`;
- exactly 11 fictional loadouts including Field Catapult + Siege Rocket;
- deterministic per-loadout magazine/charge capacity;
- deterministic reload duration and reload-ready state;
- deterministic swap cooldown/readiness;
- unique synthesized firing/launch profile data for every loadout;
- combat state now includes armour-plate count and deterministic armour restoration;
- combat profiles now include armour-plate count and restore amount;
- new pure `qa/tests/loadout-state.test.mjs`;
- combat/config validators extended for armour recovery;
- build overlay includes the loadout-state module;
- service-worker shell caches combat + loadout modules with cache-version bump;
- CI now gates mission config + combat state + loadout state before browser QA.

Current evidence state:
- earlier pre-ammo combat-state head was fully green across build, Android/WebKit functional, smoke and visual slice;
- newest ammo/readiness head `d49faf7d7280e7407b6e55ce1a68bd4f9175754b` is awaiting its own CI slot;
- do not claim the newest ammo/readiness state browser-certified until that exact head completes.

## Portfolio cross-promotion law added

Factory X now inherits `FACTORY_X_CROSS_PROMOTION_DISCOVERY_LAW.md`.

For Sarhad: after a genuine mission result, show at most 1–2 other Factory X game links + **See all games**, below the primary Next/Retry/Replay action. Do not implement cross-promotion during active play. Use a central registry so URLs are not duplicated across screens.

## Open-access launch authority

`FACTORY_X_OPEN_ACCESS_LAUNCH_LAW.md` now applies portfolio-wide.

For Sarhad:
- all 7 worlds and all 105 missions must be selectable from first launch in ordinary consumer mode;
- completion still drives score/mastery/postcards/history;
- no subscription/ad/account gate blocks normal progression in the current phase;
- future monetisation requires a later explicit founder-approved implementation phase.

## Open-access runtime implementation

Commit `747a77f29dff70fbae8616a039ec94acc06b075b` implements the current launch law in Sarhad's ordinary consumer runtime:

- all 7 worlds selectable from first launch;
- all 105 missions selectable from first launch;
- no `?fx23=1` debug bypass required for access;
- scores, mastery, records and postcards still track completion;
- a browser regression proves World 7 / Mission 15 is selectable on a fresh ordinary session.

Evidence state:
- build + deterministic mission/combat/loadout validators are green on this head;
- Android/WebKit functional + smoke + visual-slice certification is still in progress and must finish before this head is called fully green.

## Cross-promotion implementation timing

`FACTORY_X_CROSS_PROMOTION_DISCOVERY_LAW.md` is documented portfolio-wide, but **no cross-promotion runtime code should be added yet**.

Wait until the relevant Factory X production URLs are all real, verified and stable. Then create the central registry and integrate 1–2 post-result recommendations in one portfolio-wide pass.

## Fairness-test timing repair

The open-access browser run proved ordinary access to World 7 / Mission 15 on both Android Chromium and iPhone/WebKit.

Its only failure was unrelated to open access:
- Vector Needle score 1000;
- Field Catapult score 999.

Root cause: moving-target position was sampled once for QA aim and again milliseconds later inside `fire()`, creating a one-point timing delta.

Repair: the fairness regression now compares both loadouts against an atomic target/aim snapshot through a verification-only helper. No gameplay threshold or fairness rule was weakened.

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

1. Wait for browser certification of open-access head `747a77f29dff70fbae8616a039ec94acc06b075b`.
2. If green, integrate certified combat/loadout state into the live consumer layer in one bounded batch:
   - 11-loadout briefing/runtime including Siege Rocket;
   - ammo/charge HUD;
   - reload countdown/readiness;
   - one-thumb loadout swap;
   - first-aid readiness;
   - armour + armour-plate readiness;
   - deterministic live hostile waves;
   - distinct original/licence-clean firing/launch signatures;
   - protection combat without the old tiny global shot cap.
3. Add focused Android/WebKit regressions for the above.
4. Only after that gate is green, capture fresh built visual evidence.
5. Cross-promotion remains deferred until all relevant Factory X production URLs are ready and verified.

## Founder interruption policy

Do not ask the founder routine technical questions.  
Stop only for a genuine creative authority conflict, external permission/credential/purchase action, representative-slice founder review, or Audit-1 founder test.

## Audit-1 readiness

**NOT READY — execution has begun.**
