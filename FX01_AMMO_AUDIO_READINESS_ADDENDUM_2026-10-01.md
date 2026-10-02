# FX-01 — Sarhad Ammo, Audio & Readiness Addendum — 2026-10-01

**Status:** BINDING FOUNDER ADDENDUM  
**Authority:** Later explicit founder decision. This file controls Sarhad loadout/ammo/audio/readiness behavior where older FX-01 files conflict.

## 1. Loadout count

Sarhad now uses **11 fictional loadouts**:

1. Vector Needle
2. Pulse Carbine
3. Twin Relay
4. Arc Driver
5. Slate Heavy
6. Echo Repeater
7. Beacon Launcher
8. Prism Rifle
9. Rail Dart
10. Field Catapult
11. Siege Rocket — fictional heavy rocket-class launcher

Rules:
- no real firearm names/models;
- Siege Rocket must be an original fictional design, not a copied bazooka/RPG/real launcher;
- loadout choice must not alter authoritative hit geometry or create unfair accuracy advantages.

## 2. Ammo / charge system

Long-form combat may feel effectively endless, but each loadout has a finite magazine / charge / shot capacity.

The player must always be able to see:
- active loadout;
- ammo / charges remaining;
- magazine / charge capacity;
- reload countdown;
- reload-ready state;
- swap readiness.

Sustained combat continues through reload / swap, not through an invisible infinite-ammo state and not through a tiny global shot cap.

## 3. Consumer readiness HUD

The live HUD must clearly show, where applicable:
- ammo / charge count;
- reload progress / readiness;
- loadout swap readiness;
- first-aid kit count;
- whether first aid can currently be used;
- armour level;
- armour repair / plate availability if active;
- current wave / encounter state.

The player must never have to guess when to:
- reload;
- change loadout;
- use first aid;
- restore armour.

All essential actions remain **one-thumb accessible**.

## 4. First aid and armour rules

- first aid cannot activate at full health;
- armour repair cannot activate when armour is already full;
- zero-resource states must be explicit;
- healing/armour effects must be deterministic;
- readiness state must be visible before the player taps;
- no hidden cooldowns.

## 5. Distinct loadout sound identity

Every loadout gets its own original or licence-clean firing / launch signature.

Required differentiation:
- precision tools: tight, clean transient;
- rapid tools: shorter repeated pulse;
- heavy tools: deeper mechanical impact;
- launcher tools: low launch thump + restrained tail;
- Field Catapult: elastic tension-release + projectile whoosh;
- Siege Rocket: heavy ignition / launch burst + short low-frequency tail.

Do not copy:
- real weapon recordings;
- commercial game/film weapon sounds;
- recognisable protected sound signatures.

All firing/launch audio must respect:
- mute/default-volume controls;
- no clipping;
- bounded simultaneous audio nodes;
- Apple/WebKit AudioContext/autoplay/resume rules;
- Reduced Effects / weak-device fallback;
- provenance requirements under FACTORY_X_AUDIO_REWARD_CELEBRATION_LAW.md.

## 6. QA acceptance

Before the addendum is considered implemented, prove:
- 11 loadouts exposed;
- Field Catapult present;
- Siege Rocket present;
- ammo / charge counts deterministic;
- reload timing deterministic;
- swap readiness deterministic;
- no hitbox/accuracy advantage from loadout choice;
- first-aid readiness visible and correct;
- armour readiness visible and correct;
- each loadout has a distinct audio signature;
- Apple/WebKit does not hang/fail due to combined graphics + animation + audio;
- one-thumb controls remain complete.

This addendum must be read after the earlier combat amendment in every fresh FX-01 recovery.
