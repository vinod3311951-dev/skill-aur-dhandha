# FX-01 Sarhad Sniper — Asset Register

**Status:** IN PROGRESS  
**Updated:** 2026-10-01

| Asset ID | Runtime path | Type | Role | Source status | Repository evidence |
|---|---|---|---|---|---|
| FX01-CHAR-RUDRAA-V01 | `/assets/characters/captain-rudraa.svg` | SVG | Captain Rudraa home/briefing identity | Project-created AI-assisted original vector | creation commit `efb89d0bff8ca7dc8471f32870602363472048b8` |
| FX01-WORLD-GLACIER-V01 | `/assets/worlds/glacier-reach.svg` | SVG | World-1 Glacier Reach home/briefing/gameplay scenic plate | Project-created AI-assisted original vector | creation commit `2ba5777a7e38cb4f4479021bfcee8034a4cda680` |

## Build integration

- Both files are copied from editable `sarhad-inspect/` source into generated `public/` by `build.mjs`.
- Both are included in the PWA offline cache.
- World 1 runtime mapping points to `glacier-reach.svg`.
- Rudraa home and briefing runtime references point to `captain-rudraa.svg`.

## Open reconstruction work

This is not yet a complete asset inventory. Before FX-25 close, add every retained legacy world image, icon, font, source code dependency, audio/SFX source and final marketing asset with its origin and final hash.
