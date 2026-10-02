# FX-01 Sarhad Sniper — IP Provenance Register

**Status:** IN PROGRESS — not complete for FX-25 freeze.  
**Product:** FX-01 Sarhad Sniper — Precision Missions  
**Updated:** 2026-10-01

This register records current FX-01 production assets only. Current authored world, hero, reward and procedural-audio assets are registered here; final release still requires automated/runtime verification and final hash evidence.

| Asset ID | Source master | Origin/tool | Date | Prompt / design brief | Human / project edits | Third-party source | Current source hash |
|---|---|---|---|---|---|---|---|
| FX01-CHAR-RUDRAA-V01 | `assets/characters/captain-rudraa.svg` | OpenAI ChatGPT, authored directly as project SVG through the connected GitHub workflow | 2026-10-01 | Original stylised Captain Rudraa; graphite/charcoal field jacket, teal equipment accents, warm scarf, calm precision posture, compact fictional observation equipment; no real military insignia, celebrity, force or firearm model | Vector geometry, gradients, silhouette, facial treatment and equipment composition authored for FX-01 and committed as editable SVG | None intentionally used | Git blob `72ebc100becc58e283d7cc9476319a28fc1102fe` |
| FX01-WORLD-GLACIER-V01 | `assets/worlds/glacier-reach.svg` | OpenAI ChatGPT, authored directly as project SVG through the connected GitHub workflow | 2026-10-01 | Original fictional Glacier Reach landscape; white/glacier-cyan/slate palette, distant cloud banks, ice channel, fictional relay beacons and bridge mechanism; scenic 2D/2.5D look | Vector terrain, cloud, ice, mechanical relay and palette treatment authored for FX-01 and committed as editable SVG | None intentionally used | Git blob `1b6fe7c9954d9d0da4359f58b118b0142de1901a` |

| FX01-WORLD-AMBER-V01 | `assets/worlds/amber-desert.svg` | OpenAI ChatGPT, authored directly as project SVG through connected GitHub workflow | 2026-10-02 | Original fictional desert world; amber dunes, heat haze, relay silhouettes; no real geography or military identifiers | Vector terrain, sky, dunes and relay geometry authored for FX-01 | None intentionally used | Git history commit `17e08e81fc5246fef1c20da506b5e52dc11918c7` |
| FX01-WORLD-PINE-V01 | `assets/worlds/pine-watch.svg` | OpenAI ChatGPT, authored directly as project SVG through connected GitHub workflow | 2026-10-02 | Original fictional alpine pine world with layered forest sightlines | Vector mountain, fog, forest and path geometry authored for FX-01 | None intentionally used | Git history commit `bef3ee0c061361968015b324d29884562ecc5fca` |
| FX01-WORLD-MONSOON-V01 | `assets/worlds/monsoon-pass.svg` | OpenAI ChatGPT, authored directly as project SVG through connected GitHub workflow | 2026-10-02 | Original fictional rain-soaked mountain pass with waterfall and mist | Vector cloud, rain, cliff and waterfall geometry authored for FX-01 | None intentionally used | Git history commit `68f88421cfa531e64a9c62a183699c3d924e35fd` |
| FX01-WORLD-GLACIERLINE-V01 | `assets/worlds/glacier-line.svg` | OpenAI ChatGPT, authored directly as project SVG through connected GitHub workflow | 2026-10-02 | Original fictional high-ice world with chasm and ricochet-oriented geometry | Vector ice, chasm and ridge geometry authored for FX-01 | None intentionally used | Git history commit `f1e7652428ee0f8a6fcfc46f84651889faa3836d` |
| FX01-WORLD-REDCANYON-V01 | `assets/worlds/red-canyon.svg` | OpenAI ChatGPT, authored directly as project SVG through connected GitHub workflow | 2026-10-02 | Original fictional red canyon with mechanical bridge structures | Vector canyon, bridge and machinery geometry authored for FX-01 | None intentionally used | Git history commit `70be18fe525044418152aeeb14aaab7bb9a033e5` |
| FX01-WORLD-NIGHTRIDGE-V01 | `assets/worlds/night-ridge.svg` | OpenAI ChatGPT, authored directly as project SVG through connected GitHub workflow | 2026-10-02 | Original fictional moonlit ridge mastery world | Vector sky, moon, stars, ridge and beacon geometry authored for FX-01 | None intentionally used | Git history commit `5932d327d67bc16581ed16af23d331abe7c5bad8` |
| FX01-AUDIO-PROCEDURAL-V01 | `src/main.js` Web Audio synthesis | Project-authored procedural audio code | 2026-10-02 | Original dark futuristic machine-pulse ambience with distinct world tempo/tone; explicitly not derived from or imitating any protected film/game theme or signature | Oscillator types, intervals, BPM, gain envelopes and world mappings authored in code; no sampled recordings | None | Repository source on final-audit branch |
| FX01-REWARD-ELECTRIC-V01 | `src/styles.css` | Project-authored CSS presentation | 2026-10-02 | Original electric-cyan/magenta cosmetic reward sweep with non-strobing reduced-effects fallback | Static glow, one-shot sweep and reduced-effects treatment authored for FX-01 | None | Repository source on final-audit branch |

## Provenance notes

- These are **project-created AI-assisted vector masters**, not scraped/reference images and not adaptations of a named external artwork.
- The design brief comes from the authoritative Sarhad blueprint: Rudraa's charcoal/graphite + teal + warm-scarf identity and Glacier Reach's white/glacier-cyan/slate world direction.
- No real national insignia, real military unit, real weapon model, celebrity likeness or real border geography is intentionally represented.
- Git history is part of the source-master evidence and records the creation commits.
- Final SHA-256 asset hashes remain an FX-25 task; this interim register uses repository blob identity and must not be represented as the final hash register.
- Existing/legacy Sarhad imagery, icons, fonts, code dependencies and audio remain to be reconstructed into the full eight-register copyright package before final freeze.

**Gate:** OPEN — do not declare the FX-01 IP gate complete from this file alone.
