# Factory X — Internal Cross-Promotion & Discovery Law

**Status:** BINDING FOUNDER-WIDE PWA LAW  
**Scope:** every existing Factory X PWA, every future Factory X PWA, preview/staging/public links.  
**Created:** 2026-10-01

## 1. Purpose

Factory X may cross-promote its own PWAs to multiply discovery across the portfolio.

The promotion must help users discover another relevant Factory X product without interrupting the current product's core task.

## 2. Games — placement

After a player completes a level / mission and reaches the genuine result or score screen:

- keep the game's own primary action first: **Next / Retry / Replay / Continue**;
- below that primary action, show a compact **More from Factory X** discovery module;
- show at most **1–2 game recommendations at once**;
- provide a secondary **See all games** action for the remaining game PWAs;
- never show the current game as its own recommendation;
- rotate recommendations fairly/deterministically rather than showing a giant list after every level.

Do not show portfolio promotion:
- during active gameplay;
- while aiming/steering/timing;
- before a level begins;
- over the result/score;
- as an unexpected full-screen interstitial;
- with a forced countdown;
- with autoplay video/audio;
- in a way that delays Next / Retry.

## 3. Utilities — placement

For a utility PWA, show cross-promotion only after the user completes a meaningful result/task/decision flow.

- keep the utility's own result and primary next action first;
- then show at most **1–2 relevant utility recommendations**;
- provide **See all utilities** for the remaining utility PWAs;
- do not promote after every tap, field entry or minor navigation step;
- do not interrupt calculations, forms, reading, voice input or decision flows.

## 4. Same-category default

Default recommendation logic:

- **game PWA → other Factory X games**;
- **utility PWA → other Factory X utilities**.

A later founder-approved experiment may add one cross-category recommendation if it is genuinely relevant, but same-category discovery is the default.

## 5. Visual hierarchy / anti-clutter

The cross-promotion module must be visually subordinate to the current app.

Rules:
- one compact horizontal row or small card group;
- maximum 1–2 visible recommendations;
- short app name + one short benefit line + small icon/thumbnail;
- no giant banners;
- no flashing;
- no electric reward treatment that could be confused with the current level reward;
- no fake notification badges;
- no fake urgency;
- no duplicated navigation chrome;
- no more than one **See all** control.

If the result screen becomes crowded, collapse the module behind **More Factory X apps** rather than shrinking primary controls.

## 6. One-thumb law

Game cross-promotion inherits `FACTORY_X_ONE_THUMB_GAMEPLAY_LAW.md`.

- recommendation cards and See all must be thumb reachable;
- they must not overlap Next / Retry / Replay;
- they must not occupy the player's normal aim/steer zone;
- touch targets must remain comfortably usable on mobile.

## 7. Internal promotion identity

This is first-party Factory X product discovery, not a third-party paid ad.

Label it clearly as:
- **More from Factory X**
or
- **Explore more Factory X games**
or
- **Explore more Factory X tools**

Do not label it as gameplay reward or imply the user must open another PWA to continue.

## 8. Navigation

Cross-promotion is always opt-in.

- never auto-open another PWA;
- never redirect after level completion;
- preserve the current app's save/progress before navigation;
- external PWA links must use safe navigation semantics;
- returning to the current PWA must restore the user's state cleanly.

## 9. Central registry

Use one lightweight portfolio registry rather than hard-coding different link lists in every result screen.

Each product entry should contain:
- stable product ID;
- name;
- category: game / utility;
- short description;
- production URL;
- small icon/thumbnail;
- active/inactive flag;
- optional priority/context tags.

Every current/future PWA should read/build from the same authoritative portfolio registry or generated equivalent.

Never promote:
- an inactive app;
- a broken URL;
- a staging/private URL to ordinary users;
- the current app itself.

## 10. Rotation

To avoid repetition:
- choose 1–2 recommendations from the remaining same-category apps;
- rotate deterministically across completed sessions/levels;
- avoid showing the identical pair every time when alternatives exist;
- no behavioural tracking is required merely to rotate first-party links.

## 11. Performance / Apple-WebKit safety

This law inherits `FACTORY_X_ROOT_CAUSE_AND_WEBKIT_STABILITY_LAW.md`.

Cross-promotion must not create a heavy post-level payload.

Prefer:
- small local icons;
- lightweight/lazy thumbnails;
- no autoplay media;
- no separate audio;
- bounded DOM nodes;
- no additional animation loop;
- no blocking network request before the result screen becomes usable.

The result screen and Next/Retry must work even if the portfolio registry or recommendation assets fail.

## 12. Accessibility

- visible text label, not image-only cards;
- adequate contrast;
- focusable links/buttons;
- descriptive accessible names;
- Reduced Motion respected;
- recommendation meaning not conveyed by colour alone.

## 13. Relationship to ads/subscription

This first-party discovery module is independent from future ad/subscription monetisation.

Current launch law remains:
- all ordinary levels open;
- no ad/subscription gate;
- no forced cross-promo click.

If third-party ads or subscription are later activated, cross-promotion must still remain subordinate and must not combine into a cluttered wall of ads + internal promos + game actions.

## 14. QA gate

For every game result screen:
- primary Next/Retry remains first and obvious;
- 1–2 cross-promos maximum;
- current app excluded;
- links resolve;
- recommendation failure does not break result flow;
- Android Chromium and Apple/WebKit remain stable;
- no layout overlap at smallest supported phone size.

For utilities:
- promotion appears only after a meaningful completed result/task;
- primary utility action remains dominant;
- 1–2 recommendations maximum;
- no interruption of the working flow.

## 15. Fresh-chat inheritance

Every current and future Factory X PWA master execution contract automatically inherits this law.

Product-specific contracts should only add any special recommendation logic and should not duplicate the full portfolio law.
