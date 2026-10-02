# Factory X — Audio Identity + Reward Celebration Law

**Status:** BINDING FOUNDER-WIDE PWA LAW  
**Scope:** every existing Factory X PWA, every preview/staging URL, and every future Factory X PWA.  
**Created:** 2026-10-01

This is the canonical portfolio-wide law for background music, SFX, celebratory reward presentation and copyright-safe audio identity.

## 1. Music must match the product genre

Every PWA needs a distinctive audio identity appropriate to its emotional job.

Examples approved by the founder:
- **Sarhad Sniper:** powerful industrial sci-fi / mechanical pulse, cinematic tension and heroic release. It may evoke the *energy* of classic machine-thriller scoring, but must not copy or reproduce any recognizable protected melody, rhythm signature, motif, instrumentation sequence or sound design from Terminator or any other copyrighted work.
- **Mirror:** psychological, suspenseful, intimate, slightly uncanny music with restrained tension.
- **Shabd:** magnificent cerebral word-game identity using clock/tick/pulse ideas, but with an original composition and no copied theme.
- **Mandi Saathi / Mandi AI:** calm, meditative, trustworthy background music suited to information/decision support rather than action-game intensity.

For every other current/future PWA, define the music from the product's genre, emotional arc and user task before selecting or creating tracks.

## 2. Copyright / licence law

Preferred order:
1. original project-created music/SFX;
2. high-quality royalty-free / permissively licensed assets whose exact licence permits the intended commercial PWA use;
3. paid/licensed music only after explicit founder approval where needed.

"Free" is not enough. Every retained asset must have:
- source URL/provider or project-created origin;
- creator/provider name if applicable;
- exact licence/terms at acquisition time;
- commercial-use status;
- attribution requirement;
- modification permission if relevant;
- acquisition date;
- local filename / runtime path;
- final asset hash before freeze.

Do not use:
- copyrighted commercial tracks;
- "soundalikes" that reproduce recognizable melodies/motifs;
- ripped game/film/TV music;
- unverified social-media audio;
- assets whose licence is unclear.

## 3. Audio quality law

Choose the highest-quality practical copyright-safe source that still respects mobile performance.

Before shipping:
- normalize perceived loudness;
- avoid clipping;
- trim silence;
- use browser-compatible codecs;
- bound file size and simultaneous decode/load;
- lazy-load nonessential music;
- keep first screen playable even if audio is unavailable;
- provide mute and sensible default volume;
- clean up AudioContext/nodes on pause/background/navigation;
- verify Apple/WebKit autoplay and resume behavior;
- verify Android Chromium;
- provide graceful fallback if audio fails.

This law inherits `FACTORY_X_ROOT_CAUSE_AND_WEBKIT_STABILITY_LAW.md`.

## 4. Reward-celebration language

Approved reward callouts may include, where contextually correct:
- **PERFECT SHOT**
- **PERFECT MOVE**
- **PERFECT THOUGHT**
- **BANG ON**
- **LEVEL CLEAR**
- **PERFECT**
- **EXCELLENT**
- **MASTER MOVE**
- **CLEAN HIT**
- **BRILLIANT**
- **ROUTE CLEARED**
- **WORLD CLEAR**

Do not show a callout unless the gameplay/utility result truthfully earned it.

## 5. Visual reward language

Successful actions may trigger premium, high-satisfaction celebration effects such as:
- electric colour bursts;
- flowers/petals/confetti;
- coins/tokens;
- baskets/crates/reward containers;
- light streaks;
- radial glows;
- celebratory badges;
- score/mastery counters;
- level-clear/world-clear cards;
- collectible/reward reveals.

Use only what fits the product. A utility app must not look like a casino or misrepresent informational outcomes.

No gambling-style near-miss manipulation, paid loot-box psychology, deceptive scarcity, or coercive streak rescue.

## 6. Animation and accessibility safety

Reward effects must:
- never obscure essential controls;
- never alter gameplay hit truth;
- be short and bounded;
- avoid rapid strobing/flashing;
- respect Reduced Motion / reduced effects;
- use non-motion/non-colour alternatives for essential feedback;
- clean up all particles/timers/DOM nodes;
- stay within weak-device memory/frame budgets.

## 7. Sound-effect celebration

Reward SFX should be original/licence-cleared and genre-matched.

Use layered, short cues rather than excessively loud blasts.

Examples:
- precision success;
- level clear;
- perfect action;
- collectible/reward reveal;
- world clear;
- soft utility confirmation.

No essential information may depend on audio alone.

## 8. Product-specific emotional mapping

Before production audio begins, each PWA must define:
- primary emotional tone;
- background music family;
- tension/idle layer;
- success/reward layer;
- failure/neutral layer;
- UI/SFX family;
- accessibility/mute fallback;
- Apple/WebKit compatibility plan;
- provenance source.

## 9. Performance and Apple/WebKit gate

Before founder/release gates, test music + graphics + animation + character art + SFX together.

Verify:
- cold open;
- repeat open;
- service-worker update;
- background/resume;
- audio-context suspend/resume;
- multiple reward effects;
- reduced-effects mode;
- low-memory path;
- iPhone/iPad Safari/WebKit;
- Android Chromium.

If rich media causes open/hang/freeze/stall, stop editing symptoms and follow `FACTORY_X_ROOT_CAUSE_AND_WEBKIT_STABILITY_LAW.md`.

## 10. One-thumb compatibility

For games, reward overlays and audio controls must not interfere with one-thumb play. This law inherits `FACTORY_X_ONE_THUMB_GAMEPLAY_LAW.md`.

## 11. Fresh-chat inheritance

Every current and future Factory X PWA master contract automatically inherits this file.

Product-specific contracts should only define their unique genre/audio/reward identity and point here rather than duplicating this law.
