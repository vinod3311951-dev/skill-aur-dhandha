# FACTORY X FREE VISUAL STACK — GLACIER REACH VERTICAL-SLICE CONTRACT

Status: ACTIVE EXPERIMENT
Product: Sarhad Sniper — Precision Missions
Branch: fx-01-phaser3-presentation
Purpose: prove a free/low-cost visual-production lane before scaling beyond one representative Glacier Reach mission.

## 1. Authority split

### Factory X owns
- deterministic mission state and hit truth;
- normalized target coordinates and hit radius;
- timing, scoring, ammo, save/progression and accessibility;
- Android/WebKit QA;
- PWA/offline/update behavior;
- IP/provenance register;
- all safety and fictional-world constraints.

### Phaser owns
- scene rendering;
- layered depth/parallax;
- sprite and environmental animation;
- particles and impact FX;
- camera presentation;
- visual state changes.

### Visual-production tools may supply
- scene composition;
- background/midground/foreground art;
- character/prop/objective art;
- HUD styling;
- atmospheric overlays;
- audio/SFX candidates.

Visual-production tools MUST NOT alter mission truth.

## 2. Representative mission

Reference world: Glacier Reach.
Design reference: 1920×1080 landscape.
Current logical runtime may render at a lower internal resolution, but the composition must preserve the 16:9 landscape-first art direction.

Signature moment:
BEAUTIFUL WIDE LANDSCAPE → OBSERVE → IDENTIFY SMALL MECHANICAL OBJECTIVE → AIM → FIRE → IMPACT → LARGE ENVIRONMENT SYSTEM ACTIVATES → REWARD.

## 3. Required scene composition

### Background
- distant glacier mountains;
- cold sky/cloud layer;
- subtle atmospheric depth;
- no static flat gradient as the principal world presentation.

### Midground
- believable fictional relay installation integrated into the icy terrain;
- cables, masts, power path or structural elements that visually connect the small objective to the larger system;
- no floating target icon.

### Foreground
- snow/rock framing;
- optional Captain Rudraa silhouette/presentation where appropriate;
- no obstruction of aim truth.

### Mechanical objective
Target truth remains approximately normalized x=0.68, y=0.42 for the current representative mission.
The visible target must be an exposed mechanical coupler/core physically built into the relay installation.
It must NOT be rendered as:
- cardboard;
- mannequin/stick target;
- isolated rectangle;
- floating circle/ring;
- generic diamond;
- debug marker;
- text-labelled target.

## 4. Motion requirements

At least three independent motion classes must be visible in the final slice:
1. atmospheric world motion — drifting snow/fog/cloud;
2. mechanical idle motion — dish/cable/beacon or equivalent;
3. success activation — conduit/light travel, dish/gate/turbine/beacon activation.

Optional camera settle/zoom is presentation-only and must never alter deterministic hit geometry.

Reduced Motion:
- preserve objective readability and state change;
- replace large motion with fades/state changes where needed.

## 5. Captain Rudraa

Original fictional hero.
Required identity:
- tan/light-brown commando-inspired look;
- moustache + beard;
- distinctive warm scarf;
- graphite/charcoal clothing;
- teal equipment accents;
- no real insignia, country flag, army branding or real firearm identity.

No stick/mannequin/cardboard representation is acceptable for founder review.

## 6. Audio requirements

Final slice must include:
- Glacier ambient bed;
- original/licence-clean atmospheric music;
- precision-shot SFX;
- mechanical impact SFX;
- activation/payoff SFX.

Current oscillator/procedural audio may remain only as fallback/testing.
Production candidates require provenance and commercial-use clearance.

## 7. Visual-style rule

One coherent art family per world.
Do not mix unrelated asset-pack styles.
No identifiable competitor imitation.
CC0/free assets are allowed only when visually coherent and provenance is recorded.
AI-generated assets are allowed only after visual/IP review and provenance logging.

## 8. Performance / Apple reverse-audit

Before founder checkpoint:
- Android Chromium automated pass;
- WebKit automated pass;
- safe-area and landscape layout check;
- DPR/texture-memory cap;
- feature detection/fallbacks;
- no hover-only interaction;
- user-gesture audio unlock;
- pagehide/visibility resume;
- service-worker cache invalidation;
- reduced-motion verification;
- visual screenshot review, not DOM-only pass.

## 9. Founder checkpoint

Do not scale World 2–7 or all 15 Glacier missions before this slice passes.

PASS means founder accepts:
- graphics;
- depth;
- motion;
- audio/SFX;
- objective integration;
- Rudraa identity;
- no cardboard/placeholder consumer visuals.

FAIL means repair the visual-production pipeline first.

## 10. Free-stack experiment

Primary experiment:
Factory X + Phaser + MagicPath Free + Adobe Express Free + GitHub/Vercel.

MagicPath role:
- produce/edit scene composition and UI/visual direction;
- hand visual specification to code agent where supported.

Adobe Express role:
- provide/create candidate art, textures, overlays and audio/SFX where rights-safe.

Fallbacks:
- Canva Free for UI/decorative assets;
- Figma Starter if MagicPath is insufficient;
- Higgsfield only after free-stack proof fails or paid acceleration is explicitly approved.

## 11. Acceptance evidence

Required before founder review:
- exact commit SHA;
- real playable preview URL;
- Android screenshot;
- WebKit screenshot;
- one success-activation screenshot;
- asset provenance ledger entries for every non-code production asset;
- automated smoke/regression result;
- explicit visual review confirming no placeholder/cardboard presentation.
