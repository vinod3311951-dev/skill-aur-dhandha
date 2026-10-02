# FACTORY X — RENDERED CREATIVE AUDIT LOCK
Effective: 2026-10-02
Status: LOCKED / MANDATORY
Scope: ALL CURRENT AND FUTURE FACTORY X PWAs AND GAMES

## PURPOSE
Prevent technical render success from being misreported as creative/product readiness. Founder Audit 1 must receive a product already internally verified against the frozen blueprint.

## NON-NEGOTIABLE QUESTIONS
For every applicable product, world, level, mission, screen, mechanic, loadout and required state, the internal rendered audit must answer with evidence:

1. Does the rendered world/screen actually look like the rich experience designed in the frozen blueprint?
2. Are required characters, objects, environments, weapons/effects and transitions properly animated?
3. Does every mission/level contain and demonstrate its intended gameplay choreography?
4. Are specified loadouts/mechanics visually AND mechanically distinguishable, rather than labels over shared behaviour?
5. Do worlds/levels intended to differ genuinely look and play differently? Name/palette/background-only swaps do not qualify.
6. Would a reasonable human reviewing the captured evidence call this a finished product matching the frozen blueprint?

Any NO = FAIL. Founder Audit 1 is BLOCKED.

## REQUIRED AUDIT LAYERS

### A. Blueprint-to-render contract
Create machine-readable acceptance criteria from the frozen blueprint before implementation/audit. Each criterion has an ID and required evidence.

### B. Exhaustive state coverage
Audit every required level/screen/world/state. For a 105-mission game, all 105 missions require evidence. Sampling cannot certify the full product unless the frozen blueprint explicitly defines sampling.

### C. Temporal animation evidence
Animation cannot be certified from a single screenshot. Capture video or timed multi-frame sequences and verify:
- actor/object position or pose changes,
- environment motion where specified,
- weapon/action feedback,
- transitions/effects,
- no frozen or missing animation.

### D. Gameplay choreography evidence
Automated interaction must execute the intended mission/level sequence, including objective, interaction, escalation/waves/events, success/failure where applicable, and result/reward state. Opening a mission is not gameplay verification.

### E. Visual richness and composition
Evidence must be inspected for required scenery, foreground/midground/background depth, actors, props, atmosphere, effects, legibility, visual hierarchy, uncluttered gameplay area, and blueprint-specific art direction. Asset HTTP 200 is not proof of visible quality.

### F. Differentiation tests
Where differentiation is specified:
- compare worlds side-by-side for material visual/compositional/mechanical differences;
- compare loadouts/mechanics for distinct presentation, behaviour and feedback;
- flag suspicious duplication/reuse;
- palette, label, or text-only differences FAIL when richer differentiation was specified.

### G. Human-equivalent finished-product gate
The evidence packet must undergo actual visual/creative inspection, not only DOM assertions or pixel-file existence checks. Required decision: finished and blueprint-faithful / not finished. Not finished blocks Founder Audit.

### H. Cross-device/browser gate
Repeat required evidence on the locked device/browser matrix. Layout success alone does not replace visual, animation or gameplay checks.

## AUTOMATION REQUIREMENTS
Automated tests must include:
- runtime/console/network checks;
- screenshot evidence at required states;
- timed frame/video evidence for animation;
- scripted gameplay sequences;
- blueprint criterion assertions;
- duplicate/differentiation checks;
- visual regression against founder-approved reference frames once references exist;
- evidence manifest mapping criterion -> level/state/device -> artifact;
- explicit fail/block output when evidence is missing or criteria fail.

Computer vision/AI visual review may assist but must not invent missing evidence. Low confidence or ambiguous evidence = manual internal review, not PASS.

## PROHIBITED PASS LOGIC
The following alone can NEVER certify creative readiness:
- page/scene loaded;
- DOM selector exists;
- asset returned HTTP 200;
- screenshot file exists;
- no JavaScript exception;
- mission ID/state is correct;
- deployment succeeded;
- PWA installed;
- automated test process exited 0.

These remain useful technical gates, but are insufficient for Founder Audit readiness.

## EVIDENCE PACKET REQUIRED BEFORE FOUNDER AUDIT 1
1. Frozen blueprint/version and tested commit SHA.
2. Acceptance-criteria manifest.
3. Exhaustive coverage matrix.
4. Screenshots for required visual states.
5. Video/timed frames for animation and choreography.
6. World/level/mechanic/loadout differentiation evidence where applicable.
7. Device/browser results.
8. Defect log showing zero unresolved audit-blocking defects.
9. Internal rendered creative audit verdict: PASS.
10. Production/test URL serving the same tested commit.

Missing packet item = Founder Audit blocked.

## PORTFOLIO RULE
This lock is inherited by every Factory X PWA/game automatically. Product-specific criteria may ADD requirements but may not weaken this lock.

## SARHAD SNIPER EXPLICIT APPLICATION
Before the next founder audit, evidence must prove:
- Glacier Reach visibly matches its rich frozen art direction;
- character/environment/weapon/effect animations actually run;
- every mission demonstrates intended choreography;
- all 11 loadouts are visibly and mechanically distinguishable as specified;
- World 7 genuinely looks and plays differently from World 1;
- the captured experience reads as a finished game rather than a prototype.

The previous 105-mission technical rendered audit is not accepted as creative certification.
