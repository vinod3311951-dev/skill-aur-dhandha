# FX-01 Sarhad Sniper — Asset Register

**Status:** IN PROGRESS  
**Updated:** 2026-10-01

| Asset ID | Runtime path | Type | Role | Source status | Repository evidence |
|---|---|---|---|---|---|
| FX01-CHAR-RUDRAA-V01 | `/assets/characters/captain-rudraa.svg` | SVG | Captain Rudraa home/briefing identity | Project-created AI-assisted original vector | creation commit `efb89d0bff8ca7dc8471f32870602363472048b8` |
| FX01-WORLD-GLACIER-V01 | `/assets/worlds/glacier-reach.svg` | SVG | World-1 Glacier Reach home/briefing/gameplay scenic plate | Project-created AI-assisted original vector | creation commit `2ba5777a7e38cb4f4479021bfcee8034a4cda680` |

| FX01-WORLD-AMBER-V01 | `/assets/worlds/amber-desert.svg` | SVG | World-2 Amber Desert scenic plate | Project-created original vector | creation commit `17e08e81fc5246fef1c20da506b5e52dc11918c7` |
| FX01-WORLD-PINE-V01 | `/assets/worlds/pine-watch.svg` | SVG | World-3 Pine Watch scenic plate | Project-created original vector | creation commit `bef3ee0c061361968015b324d29884562ecc5fca` |
| FX01-WORLD-MONSOON-V01 | `/assets/worlds/monsoon-pass.svg` | SVG | World-4 Monsoon Pass scenic plate | Project-created original vector | creation commit `68f88421cfa531e64a9c62a183699c3d924e35fd` |
| FX01-WORLD-GLACIERLINE-V01 | `/assets/worlds/glacier-line.svg` | SVG | World-5 Glacier Line scenic plate | Project-created original vector | creation commit `f1e7652428ee0f8a6fcfc46f84651889faa3836d` |
| FX01-WORLD-REDCANYON-V01 | `/assets/worlds/red-canyon.svg` | SVG | World-6 Red Canyon scenic plate | Project-created original vector | creation commit `70be18fe525044418152aeeb14aaab7bb9a033e5` |
| FX01-WORLD-NIGHTRIDGE-V01 | `/assets/worlds/night-ridge.svg` | SVG | World-7 Night Ridge scenic plate | Project-created original vector | creation commit `5932d327d67bc16581ed16af23d331abe7c5bad8` |

## Build integration

- Captain Rudraa and all seven world SVG masters are copied from editable `sarhad-inspect/` source into generated `public/` by `build.mjs`.
- All eight authored runtime art assets are included in the PWA offline cache.
- World runtime mapping points to the seven project-authored SVG scenic plates.
- Rudraa home and briefing runtime references point to `captain-rudraa.svg`.

## Open reconstruction work

This is not yet a complete asset inventory. Before FX-25 close, add every retained legacy world image, icon, font, source code dependency, audio/SFX source and final marketing asset with its origin and final hash.
