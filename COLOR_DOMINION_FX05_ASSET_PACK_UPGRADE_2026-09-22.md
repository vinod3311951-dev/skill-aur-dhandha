# COLOR DOMINION — FX-05 ASSET PACK UPGRADE
Effective: 2026-09-22
Status: FX-23 COSMETIC REPAIR EVIDENCE
Product: Color Dominion

## Bubble Master — Factory X Jelly / Glass v2
Runtime master: `src/app.js` → `bubble()`

Required identity:
- Original Factory X rendering.
- Jelly/glass depth rather than flat discs.
- Translucent inner core.
- Bright inner glow.
- Clear double rim for small-size readability.
- Top-left specular highlight.
- Lower reflected glint.
- Subtle animated reflection sweep when Reduced Motion is off.
- Symbol remains high-contrast and authoritative.
- No copied Candy Crush, Bubble Witch, or other third-party game assets.

Implementation characteristics:
- layered radial gradients,
- translucent inner lens,
- light and dark rim separation,
- controlled bloom/shadow,
- animated highlight phase derived at runtime,
- per-colour base palette from Color Dominion's own locked palette.

Asset identity string used by runtime diagnostics:
`factory-x-jelly-glass-v2`

## Music Master — Factory X Dominion Pulse v2
Runtime master: `src/music-engine.js`

Composition identity:
- Original procedural Web Audio composition.
- 110 BPM default, within the locked 100–112 BPM trance-adjacent range.
- Soft kick and restrained bass pulse.
- Pluck sequence.
- Bell/mallet accents.
- Warm soft-synth/pad layers.
- Delayed atmospheric tails.
- Low default master gain for repeated-play comfort.
- Seamless scheduler-based looping; no third-party track is sampled or copied.

World layer profiles:
1. Dawn Gardens
2. River Lights
3. Festival Streets
4. Sky Courtyards
5. Prism Fort

Each world keeps the same musical identity while varying root progression, pluck/mallet pattern, pad voicing, and delay character.

Asset identity string used by runtime diagnostics:
`factory-x-trance-v2`

## PWA Cache
`sw.js` cache version must include `src/music-engine.js` and use the post-upgrade cache key so previously cached builds do not hide the new visual/audio runtime.

## QA Requirement
Before FX-23 founder verification:
- automated QA must confirm the visual/audio identity strings are active,
- representative stages must render a non-blank gameplay canvas,
- music world profile must change with representative world stages,
- existing automated game tests must pass,
- founder then performs the locked FX-23 Founder Functional Check.

This document does not close FX-23 and does not modify the audit rubric.
