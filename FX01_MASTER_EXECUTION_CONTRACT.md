# FX-01 — Sarhad Sniper: Precision Missions
## Canonical Master Execution Contract

**Version:** 2026-10-01  
**Status:** ACTIVE  
**Goal:** verified baseline → final-quality vertical slice → full consumer PWA → Audit 1 Ready.

This file is the canonical repository copy of the founder-approved FX-01 master execution contract. It works together with AMIT FINAL and later explicit founder amendments.

## 1. Role and outcome

Act as principal product/game director, art/animation/audio director, senior PWA/game engineer, QA lead and release-quality owner.

Do not ship a prototype or minimally functional demo.

The product must become a polished consumer-grade PWA with a distinctive Sarhad identity, truthful marketing moments, strong game feel, responsive controls, professional visuals/audio, accessibility, PWA reliability, provenance and maintainability.

Commercial success is never guaranteed. Remove avoidable reasons for rejection instead.

## 2. Authority

At the start of any fresh execution:
1. read AMIT FINAL;
2. read this contract;
3. read any later explicit FX-01 founder amendment;
4. read the World-1 vertical-slice constitution;
5. read FX01_EXECUTION_LEDGER.md;
6. inspect actual repository head and current CI/build evidence.

Repository truth is implementation truth.
Later explicit founder decisions win in the affected layer only.
Never rely on memory over evidence.

## 3. Core identity

Sarhad Sniper is a single-player, mobile-first precision/action/puzzle experience built around:

**OBSERVE → IDENTIFY → AIM → DECIDE → FIRE → IMPACT → SCORE → NEXT**

and the emotional rhythm:

**CALM OBSERVATION → FOCUSED DECISION → PRECISE ACTION → SATISFYING ACTIVATION**

Captain Rudraa is the hero.

Seven fictional scenic worlds remain the campaign structure.

The game must not use:
- real countries/borders;
- real military units;
- real extremist or terrorist organisations;
- ethnic/religious hostile coding;
- real weapon models/names;
- gore or graphic injury;
- copied competitor HUD/characters/worlds/audio.

## 4. Founder-amendment precedence

The combat/mission layer was explicitly reopened by the founder on 2026-10-01.

Read:
`FX01_FOUNDER_COMBAT_AMENDMENT_2026-10-01.md`

That amendment controls:
- live hostile/civilian combat presentation;
- Environmental + Telescopic playable views;
- Binocular observation;
- 10 fictional loadouts including Field Catapult;
- civilian penalties;
- armour/health/first aid/blast protection;
- longer multi-wave fictional-hostile missions;
- short non-graphic defeat vocal reactions.

Do not restore older combat restrictions that conflict with this later amendment.

## 5. Captain Rudraa

Rudraa must feel recognisable, calm, precise and competent.

Use original fictional visual identity only.
No real insignia or copied uniform.

Production presentation should include state-driven character presence where useful:
- idle/breathing;
- observation;
- ready/aim;
- damage/armour state;
- recovery/first aid;
- mission success/failure;
- home/world-map presence.

No graphic wound/death treatment.

## 6. Worlds and World 1

World 1: **Glacier Reach**.

Seven worlds must feel visually distinct rather than reskinned.

Each world should provide:
- unique palette/lighting;
- background/midground/gameplay/foreground depth;
- world-specific atmosphere;
- world-specific sonic layer;
- readable targets/hostiles/civilians;
- weak-device effects tier;
- Reduced Motion equivalent.

Decorative effects must never change authoritative hit truth.

## 7. Home screen

The first screen must answer:
- Who? Captain Rudraa.
- What? Sarhad precision missions.
- What next? One obvious primary campaign action.

No signup friction, promotional modal or ad competing with play.

Buttons must be thumb-friendly, consistent, readable and calm.

## 7A. One-thumb control inheritance

FX-01 inherits `FACTORY_X_ONE_THUMB_GAMEPLAY_LAW.md`. Environmental View, Telescopic View, Binoculars, FIRE, pause/resume and progression must remain fully usable one-handed with one thumb on mobile; no essential multi-touch dependency is permitted.

## 8. View system

Three user-friendly tools:

### Environmental View
Wide and fully playable.
Supports direct spatial awareness and positioning.

### Telescopic View
Tighter precision view.
Drag-to-aim.
Fully playable.

### Binoculars
Observation/scouting only.
One tap in / one tap back to aim.
Cannot fire while active.

All views share one authoritative aim/hit geometry.
No camera/view can create hidden gameplay advantage.

## 9. Loadouts

Expose ten fictional loadouts, including Field Catapult.

Loadout differences may affect:
- visual silhouette;
- animation;
- audio;
- haptics;
- impact presentation;
- handling feel where deterministic/fair.

They must not:
- enlarge hitboxes;
- improve hit registration;
- weaken objectives/hostiles;
- create paid accuracy advantage;
- use real firearm models/names.

## 10. Combat and protection

Consumer presentation must not look like a cardboard/test range.

Use live animated:
- world machinery;
- fictional hostile operatives;
- protected civilians;
- environmental motion;
- multi-wave encounters;
- rescue/protection pressure.

Civilian hits:
- never reward;
- apply immediate visible deterministic score penalty;
- update counter/debrief/mastery;
- use non-celebratory feedback.

Hostile defeat reactions may use brief non-graphic "ah"/"oh" style feedback only.
No prolonged suffering audio or gore.

## 11. Rudraa survivability

Longer engagements may include:
- armour;
- health;
- blast resistance;
- first-aid recovery;
- clear damage/recovery state.

These must be deterministic, readable and regression-tested.

## 12. Difficulty and retention

Retention must come from:
- mastery;
- escalating wave composition;
- loadout variety;
- changing enemy roles/movement;
- civilian-protection decisions;
- recovery/resource management;
- world progression;
- satisfying audiovisual feedback.

No manipulative streak rescue, deceptive timers or dark-pattern compulsion.

## 13. Campaign/content architecture

Keep the 105-mission / 7×15 campaign structure unless later explicitly changed.

Use reusable deterministic systems rather than 105 unrelated engines.

Every mission must be feasible and validated.

Do not mass-produce Worlds 2–7 until the amended World-1 vertical slice is proven.

## 14. Art and animation

No production placeholders, grey boxes, temporary icons or test-only consumer visuals.

Maintain asset/IP provenance.

Animation categories:
- gameplay-critical;
- presentational;
- ambient;
- transition;
- reward;
- accessibility fallback.

Weak devices may reduce decoration but never gameplay truth.

## 15. Audio

Audio is first-class.

World-1 identity uses an approximately 88 BPM pulse inside the approved 82–94 BPM range.

Use original/licensed ambience, mechanical textures, world layers, impact cues and concise UI feedback.

Provide sensible default volume and mute controls.
No copied commercial music, patriotic themes or recognisable game/film motifs.

## 16. First minute

Teach through interaction, not paragraphs.

The player should quickly understand:
- observe/scout;
- Environmental vs Telescope;
- Binoculars;
- aim;
- fire;
- impact;
- reward.

The first minute must feel like a real marketable gameplay moment.

## 17. Marketing truth

Marketing screenshots/video must come from finished playable behavior.

No fake marketing-only scenes.

## 18. Performance

Target smooth 60 FPS where practical and graceful ~30 FPS floor on weaker supported hardware.

Bound:
- DPR;
- particles;
- animated layers;
- decoded image memory;
- audio resources;
- listeners/timers;
- allocations;
- save writes.

No memory growth, runaway RAF loops or hidden-tab unfairness.

## 19. Save / recovery

Local-first.

Persist:
- progression;
- mastery/records;
- settings;
- accessibility choices;
- approved cosmetics/resources where implemented.

Version schema.
Handle migration/corruption/storage fallback safely.

## 20. PWA/device

Verify:
- manifest/icons/installability;
- service worker/cache/update safety;
- offline core;
- safe areas/responsive layout;
- Android Chrome;
- WebKit/iPhone readiness;
- tablet/desktop fallback.

"The URL opens" is not certification.

## 21. Accessibility

Implement:
- Reduced Motion;
- reduced effects;
- readable contrast;
- non-colour-only states;
- scalable/readable text;
- touch-sized controls;
- no essential audio-only information;
- clear failure reasons.

## 22. Privacy/security/admin

No account required for V1.
No precise location, contacts, camera, microphone, chat, UGC or human moderation unless later explicitly approved.
No client secrets.
Keep analytics privacy-minimal.

## 23. Reasoning law

Use:
- **HIGH** for authority, architecture, deterministic fairness, save/security/performance root causes, combat architecture, Audit 1/2 and release decisions;
- **MEDIUM** for ordinary implementation, content/assets, responsive work and bounded debugging after invariants are stable;
- **INSTANT** only for genuinely low-risk mechanical polish.

Tell the founder when a switch is recommended.

## 24. Execution loop

For each bounded task:

AUTHORITY → ALLOWED FILES/SYSTEMS → IMPLEMENT → TEST → DIAGNOSE → REPAIR → TARGETED RETEST → REGRESSION → DIFF/BUILD INSPECTION → EVIDENCE → COMMIT → LEDGER UPDATE → CONTINUE.

Do not solve failures by:
- removing founder-approved features;
- weakening tests;
- changing hit/fairness truth;
- hiding failures;
- using placeholder production art;
- falsely claiming device testing.

Routine debugging belongs to the execution assistant, not the founder.

## 25. World-1 vertical-slice gate

Before mass production, World 1 must prove:
- home quality;
- Rudraa identity;
- first-minute onboarding;
- Environmental + Telescopic play;
- Binoculars;
- 10 loadouts including Field Catapult;
- live world/combat presentation;
- civilian protection;
- armour/health/first aid/blast state;
- multi-wave encounter quality;
- audio;
- progression/save;
- Reduced Motion;
- weak-device performance;
- PWA behavior;
- truthful marketing capture.

Then present the founder Android checkpoint.

## 26. QA

At minimum test:
- build;
- all 105 mission configs;
- deterministic reproducibility;
- mission feasibility;
- views/binoculars;
- loadouts/fairness;
- hostile/civilian state;
- civilian penalties;
- armour/health/first aid/blast;
- wave completion;
- pause/backgrounding;
- progression/save/migration;
- Reduced Motion/audio mute;
- PWA/offline/update;
- responsive layout;
- frame pacing/memory;
- no consumer debug/test surfaces.

Passing source review is not device evidence.

## 27. AMIT FINAL 13 gates

Substantiate all:
1. first-sight/time-to-value;
2. core depth;
3. professional visuals;
4. motion/world life;
5. audio/haptics;
6. controls/self-explanation;
7. progression/retention;
8. performance/stability;
9. PWA/offline/device;
10. accessibility;
11. privacy/security/legal/admin;
12. copyright/IP/provenance;
13. marketability/monetisation/maintainability.

Privacy, data-loss, copyright, core-functionality, stability, fairness or essential-content blockers mean STOP.

## 28. Audit-1 adversarial pass

Before founder Audit 1, deliberately search for reasons to reject:
- generic home/hero;
- flat world/combat;
- weak animation/audio;
- confusing views/binoculars/loadouts;
- unfair civilian interactions;
- armour/health bugs;
- repetitive waves;
- difficulty spikes;
- low-end lag;
- save/PWA issues;
- accessibility/IP gaps.

Repair defensible problems and regression-test.

## 29. Audit-1 exit

Only say:

**FX-01 — AUDIT 1 READY**

when evidence supports a near-final consumer candidate.

Provide:
- candidate build/URL;
- tested commit;
- changed systems;
- founder Android instructions;
- known limitations;
- 13-gate status;
- real screenshots;
- zero unresolved STOP blockers.

## 30. Founder A/B/C

A — APPROVE → Audit 2.  
B — ROUGH EDGES → repair/regress/re-present.  
C — FUNDAMENTAL VISION MISS → reopen only the failed layer deliberately.

Never hide evidence to force approval.

## 31. Execution ledger

After every material bounded task update:
- active FX/product;
- authority/version;
- repo/branch/commit;
- phase;
- completed evidence;
- failed approaches;
- risks/blockers;
- next bounded task;
- reasoning recommendation;
- founder-gate/Audit status.

`Continue mate` must resume from that ledger rather than memory.

## 32. Founder communication

After the founder says **Execute it**, acknowledgement is:

**Im on it**

Thereafter **Continue mate** means recover ledger/evidence and execute the next bounded task without restarting.

## 33. Final product test

At every important decision ask whether it makes Sarhad more:
distinctive, beautiful, readable, responsive, fair, memorable, satisfying, understandable, replayable, marketable from real gameplay, maintainable and original — without making it copied, confusing, unfair, manipulative, fragile, privacy-invasive or legally reckless.

The quality target is not "good for a PWA."

It is a genuinely polished game that happens to be a PWA.
