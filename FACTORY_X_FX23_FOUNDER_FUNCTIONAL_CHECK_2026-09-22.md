# FACTORY X — FX-23 FOUNDER FUNCTIONAL CHECK
Effective: 2026-09-22
Status: LOCKED
Gate Type: FOUNDER-SIDE RELEASE GATE
Scope: ALL current and future Factory X products

## Purpose
This is the mandatory manual founder verification required before FX-23 may close.
It supplements automated QA. It does not modify or replace the locked audit rubric.

## Exact Founder Checklist
The founder must manually verify every applicable item:

1. URL OPENS
   - Open the production/staging verification URL in a clean session.
   - No 404, blank page, fatal error, wrong product, or redirect to another product.

2. HOME SCREEN
   - Home screen renders correctly.
   - Product identity is correct.
   - Primary CTA is visible and understandable.

3. PRIMARY ACTION
   - Tap Play / Start / Continue / equivalent.
   - The intended next screen loads.
   - The action is not a dead button or static placeholder.

4. FIRST REAL INTERACTION
   - Perform the first meaningful product interaction.
   - It must complete successfully and visibly change state.

5. LEVEL / EARLY WORKFLOW CHECK
   - Level 1 opens.
   - Actual gameplay/functionality starts.
   - A static mission card, fake screen, or non-interactive placeholder does not pass.

6. LEVEL / EARLY-MID CHECK
   - Level 5 opens and loads correctly.

7. LEVEL / MID-DEEP CHECK
   - Level 25 or Level 50 opens and loads correctly.

8. LEVEL / DEEP CHECK
   - Level 100 opens and loads correctly when the product has 100+ levels.
   - For products with fewer levels, use the highest meaningful deep checkpoint.

9. PROGRESSION
   - Complete Level 1 (or equivalent first task).
   - Level 2 / next step unlocks or advances correctly.
   - Progress persists as designed.

10. BACK / HOME NAVIGATION
    - Back navigation behaves correctly.
    - Home navigation returns to the expected home screen.
    - No dead ends or unintended cross-product routing.

## Non-Game Mapping
For utilities or non-game products, map Level 1 / 5 / 25-or-50 / 100 to:
- first real task,
- early workflow checkpoint,
- mid/deep workflow checkpoint,
- deepest representative workflow checkpoint.
The intent remains: founder proves real use beyond the landing shell.

## Pass Rule
FX-23 can close only after:
- all applicable checks pass,
- automated QA remains green,
- founder explicitly states VERIFIED.

## Fail Rule
If any check fails:
- FX-23 remains OPEN/BLOCKED,
- product release is suspended,
- repair returns to FX-14, FX-16, or a specifically logged repair stage,
- automated QA must be rerun after the repair,
- founder must repeat this checklist,
- only founder VERIFIED clears this gate.

## Current Product Application
- Sarhad Sniper: BLOCKED until mission-open/gameplay/progression fix passes automated QA and founder verification.
- Color Dominion: must pass this checklist after cosmetic fixes before FX-23 closes.
- Business Sudhaar: apply in retrofit batch before returning to staging.
- Skill Aur Dhandha: apply in retrofit batch before returning to staging.
- All future Factory X products: mandatory.
