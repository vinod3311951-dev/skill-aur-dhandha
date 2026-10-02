# Factory X — Genre Audio + Reward Celebration Law

**Status:** BINDING FOUNDER-WIDE PWA LAW  
**Scope:** every existing Factory X PWA, every preview/staging/public URL, and every future Factory X PWA.  
**Created:** 2026-10-01

This is the canonical cross-portfolio law for music, ambience, SFX, reward celebration and high-satisfaction feedback.

## A. Music must be high-quality, genre-specific and copyright-clean

Every PWA must have a deliberate sonic identity appropriate to its genre.

Allowed sources:
- original project-created music/SFX;
- genuinely royalty-free / public-domain / permissively licensed assets whose license allows the intended commercial use;
- properly licensed paid/free assets with provenance recorded.

Never:
- copy a recognisable commercial melody;
- imitate a protected soundtrack closely enough to be recognisable;
- reuse film/game/TV music motifs;
- rely on “sounds like X” as permission;
- ship an asset without source/license/provenance evidence.

If a reference is supplied, extract only abstract qualities such as tempo, tension, instrumentation family, density, mood and energy.

## B. Genre examples

### FX-01 Sarhad Sniper
Use an original **industrial sci-fi precision pulse**:
- mechanical ostinato;
- cold metallic percussion;
- low cinematic pulse;
- tense restraint during observation;
- stronger impact/reward layer after a clean shot or cleared wave.

It may evoke the broad emotional territory of classic machine-thriller scoring, but must NOT reproduce or closely imitate the Terminator theme, melody, rhythm signature or arrangement.

### Mirror
Original psychological-suspense score:
- sparse;
- intimate;
- slightly uncanny;
- slow-building tension;
- subtle tonal shifts as choices deepen;
- silence used deliberately.

### Shabd
Original elegant word-game rhythm:
- clock/tick-inspired pulse;
- light percussive timing;
- rising urgency without anxiety overload;
- satisfying cadence on a correct word.

### Mandi AI / Mandi Saathi
Calm, trustworthy, meditative sonic bed:
- soft ambient texture;
- gentle pulse;
- unobtrusive confirmation cues;
- never distract from price/data reading.

Other PWAs must define their own genre-appropriate music brief rather than reusing one portfolio soundtrack.

## C. Reward celebration language and visual energy

Games and suitable interactive utilities should deliver a strong, premium reward moment after genuinely earned success.

Approved celebration language includes, when contextually correct:
- **PERFECT SHOT**
- **PERFECT MOVE**
- **PERFECT THOUGHT**
- **BANG ON**
- **LEVEL CLEAR**
- **MISSION CLEAR**
- **PRECISION**
- **BRILLIANT**
- **CLEAN HIT**
- **MASTERED**

Use the phrase that matches the product/action. Do not display praise for failure, random luck or unsafe behavior.

## D. Celebration visuals

Allowed celebration vocabulary:
- electric/neon colour accents;
- short light bursts;
- particles;
- flowers/petals/confetti;
- fictional coins/tokens;
- baskets/reward bundles;
- stars/badges;
- score bursts;
- mastery seals;
- level-clear cards;
- world-clear moments;
- animated reward typography.

Rules:
- celebration must be brief and earned;
- no gambling presentation or real-money implication;
- coins/tokens are cosmetic/progression feedback unless the product explicitly defines another safe use;
- no reward burst may cover essential controls or safety information;
- no rapid flashing/strobing;
- Reduced Motion / Reduced Effects must provide a calm equivalent;
- low-end devices must receive a lighter effect without losing reward meaning.

## E. Satisfaction without manipulative addiction design

The goal is **high-satisfaction feedback and memorable game feel**, not engineered compulsion.

Retention should come from:
- mastery;
- progression;
- curiosity;
- skill improvement;
- collection;
- meaningful rewards;
- strong audiovisual craft.

Do not use deceptive streak pressure, coercive timers, variable-ratio gambling mechanics, fake scarcity or punitive return loops.

## F. SFX and voice feedback

SFX must be:
- original/licensed;
- short;
- readable;
- layered by importance;
- non-clipping;
- comfortable at default volume;
- muteable.

Use distinct cues for:
- selection;
- confirm;
- warning;
- hit/success;
- mistake/penalty;
- reward;
- level/world clear.

Voice/exclamation feedback must be brief and non-intrusive.

## G. Apple/WebKit + performance gate

This law inherits `FACTORY_X_ROOT_CAUSE_AND_WEBKIT_STABILITY_LAW.md`.

Before approving rich audio/reward presentation:
- verify supported codecs;
- bound file sizes and simultaneous decodes;
- respect mobile autoplay/AudioContext rules;
- lazy-load nonessential music where possible;
- suspend/resume audio cleanly on backgrounding;
- clean up nodes/timers/listeners;
- ensure music/SFX do not block first paint;
- test graphics + animation + music + SFX together on Apple/WebKit and Android Chromium;
- provide reduced-effects/weak-device fallbacks.

If the PWA hangs, stalls, fails to open or pauses unexpectedly, stop repeated legacy-code patching and research the shared root cause before another edit.

## H. One-thumb compatibility for games

This law inherits `FACTORY_X_ONE_THUMB_GAMEPLAY_LAW.md`.

Reward visuals/audio must never force a second finger or obstruct the primary thumb control path.

## I. Provenance

For every production music/SFX/voice/reward asset, record:
- asset ID;
- source/tool;
- date;
- license/usage right;
- prompt/design brief when AI-assisted;
- edits;
- file path;
- final hash before freeze.

No provenance = IP gate remains open.

## J. Fresh-chat inheritance

Every current and future Factory X product master contract automatically inherits this file.

Do not duplicate the full law into each product contract; store only product-specific genre briefs and a pointer to this canonical law.
