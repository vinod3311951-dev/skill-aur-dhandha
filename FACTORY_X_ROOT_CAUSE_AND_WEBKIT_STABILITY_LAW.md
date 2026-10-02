# Factory X — Root-Cause Research + Apple/WebKit Stability Law

**Status:** BINDING FOUNDER-WIDE PWA LAW  
**Scope:** every existing Factory X PWA, every preview/staging URL, and every future Factory X PWA.  
**Created:** 2026-10-01

This is the canonical cross-portfolio debugging and rich-media compatibility law.

## A. Research before repetition — mandatory

Do not enter repeated patch → rerun → patch loops without first identifying the failure class.

Before another repair attempt:
1. reproduce and capture evidence;
2. determine whether the issue is local or recurring;
3. if the same failure class reappears after one repair attempt, stop symptom patching;
4. investigate the shared root cause across code, build, cache/service worker, asset decode, browser lifecycle, CI/test harness, deployment and environment;
5. make the smallest root-cause repair that preserves product truth;
6. run targeted retest, then regression.

Repeated failure is evidence to improve diagnosis, not permission to weaken tests or features.

## B. Reverse-risk graphics/audio/WebKit research — mandatory

Before approving heavy graphics, animation, character art, music, ambience, SFX, haptics or rich presentation, work backwards from the failure we must prevent:

**Could this make the PWA fail to open, hang, freeze, pause unexpectedly, crash, exceed memory, stall first paint, or behave badly on Apple/WebKit?**

Check:
- image dimensions, format, decode cost and simultaneous decode count;
- canvas/WebGL/2D allocation, DPR, layer count and compositing;
- animation/RAF loops, timers and hidden-tab/background behavior;
- sprite/frame count and decoded-memory cost;
- audio file size, codec support, simultaneous nodes, AudioContext lifecycle and autoplay rules;
- SFX/haptic burst frequency and cleanup;
- font/icon loading;
- service-worker cache size/version/update behavior;
- startup bundle and first-paint work;
- low-memory device behavior;
- iPhone/iPad Safari/WebKit compatibility;
- Android Chrome/weak-device fallback.

Design safe fallbacks before shipping the rich path: lazy load, bounded DPR/memory, reduced-effects/reduced-motion, cleanup, no heavy synchronous first-screen decode, and gameplay independent of decorative media.

## C. A + B are pre-edit gates — mandatory

**A and B happen before debugging or modifying existing HTML, CSS, JavaScript, service-worker, audio, asset or build files.**

Default Factory X flow:

**RESEARCH → ROOT CAUSE → COMPATIBILITY RISK → EDIT PLAN → CODE/ASSET CHANGE → TARGETED TEST → REGRESSION.**

Do not start by repeatedly editing legacy HTML/CSS/JS merely because those files are visible.

Existing code may be changed only after evidence points to the relevant layer, or after a deliberate architectural/product task requires it.

For repeated problems, inspect system boundaries first: generated output, asset weight/decode, browser quirks, CI/test harness, cache/update state, build process, lifecycle/backgrounding and architecture.

## Every PWA URL

For every existing and future Factory X public/preview PWA:
- test first load and repeat load;
- test after cache/service-worker update;
- test Android Chromium and Apple/WebKit;
- exercise graphics + animation + character assets + music/audio + SFX together;
- test pause/background/resume;
- test weak-memory/reduced-effects fallback;
- record root-cause evidence before code edits;
- never call a PWA stable because it works on one browser/device.

## Reasoning

Use **HIGH** for repeated failure, Apple/WebKit open/hang/freeze, uncertain asset/audio/memory attribution, service-worker/update issues, or coupled systems.

Use **MEDIUM** after root cause and compatibility plan are established.

Use **INSTANT** only for mechanical low-risk changes on an already stable system.

## Fresh-chat inheritance

Every current and future Factory X product contract inherits this law automatically. Product files should point here rather than duplicate it.
