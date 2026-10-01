# Factory X — One-Thumb Game Playability Law

**Status:** BINDING FOUNDER-WIDE GAME LAW  
**Scope:** every existing and future Factory X game PWA.  
**Created:** 2026-10-01

## Core requirement

Every Factory X **game** must be fully playable on a phone **one-handed with one thumb**.

This is a product gate, not a preference.

## What one-thumb playable means

All essential gameplay must be completable using a single thumb without requiring:
- two-finger gestures;
- simultaneous multi-button presses;
- keyboard/mouse precision;
- modifier keys;
- pinch as an essential action;
- opposite-side simultaneous controls;
- sustained awkward reach to the top corners;
- rapid thumb travel between distant controls.

## Control design law

Prefer:
- tap;
- press/hold;
- drag;
- swipe;
- one-thumb steering/aiming;
- one dominant action button;
- contextual actions;
- forgiving reach zones;
- bottom-half control placement where practical.

If a game needs multiple actions, sequence them contextually rather than requiring simultaneous multi-touch.

## View/camera law

Camera/view switching must remain one-thumb accessible.

For FX-01 specifically:
- Environmental View;
- Telescopic View;
- Binoculars;
- FIRE;
- pause/settings access

must all remain usable one-handed without breaking aim or forcing multi-touch.

## Accessibility and comfort

One-thumb play must still preserve:
- touch targets of practical mobile size;
- safe-area awareness;
- left/right hand comfort where practical;
- Reduced Motion / reduced effects;
- readable labels;
- no essential action hidden behind gesture-only discovery.

## QA gate

Every game must prove on a phone-sized viewport:
1. start/resume;
2. move/aim/steer;
3. primary action;
4. secondary/context action if any;
5. pause/resume;
6. progression/result flow

with one thumb and no multi-touch dependency.

If any essential action requires two fingers or simultaneous controls, the game is **not release-ready**.

## Portfolio inheritance

Every current and future Factory X game master execution contract automatically inherits this file.

Do not duplicate the full law into each product contract; add a pointer and product-specific control implementation only.
