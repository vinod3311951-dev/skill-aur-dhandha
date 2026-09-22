# SARHAD SNIPER — PUBLIC VERCEL FX-23 QA EVIDENCE
Date: 2026-09-22
Status: AUTOMATED PUBLIC-URL QA PASS; FOUNDER FUNCTIONAL CHECK STILL REQUIRED

## Intended and promoted production source
- Git branch: `sarhad-sniper-deploy`
- Repaired source commit: `cdcd91c3c0f5979f509257278a9eaf1ae4826ea6`
- Earlier mission-open repair commit: `251fb803d414d41cc801748ed45ebba8be232d4d`
- Dedicated Vercel project: `sarhad-sniper`
- Production deployment (founder Vercel dashboard): `Dhcb5MBPN`, Ready / Current / Production, source `cdcd91c`
- Production public URL: `https://sarhad-sniper.vercel.app/`

## Public URL repaired-code fingerprint
- GitHub Actions run: https://github.com/vinod3311951-dev/skill-aur-dhandha/actions/runs/35717024145/attempts/2
- Result: PASS, rerun attempt 2.
- `curl -L --fail https://sarhad-sniper.vercel.app/src/main.js` succeeded; 92,242 bytes returned (HTTP success).
- Both repaired-code identifiers verified in downloaded script: `FX23_VERIFICATION_MODE` and `handleMissionMapDelegatedClick`.
- This fingerprint and founder dashboard source SHA together support that the Production alias serves the repaired build.

## Public URL browser QA
- GitHub Actions run: https://github.com/vinod3311951-dev/skill-aur-dhandha/actions/runs/35716508506/attempts/2
- Result: PASS, rerun attempt 2, 14/14 Playwright tests passed against public `https://sarhad-sniper.vercel.app`.
- Profiles: Playwright `local-android-chrome` (Pixel 7 emulation) and `local-iphone-webkit` (iPhone 14 emulation); these are automated emulated browser profiles, not physical-device BrowserStack results.
- Each profile passed: Level 1 gameplay, hit/score, mission completion and Level 2 progression; Levels 5, 10, 25, 50 and 100 open into playable mission state; smoke checks for load, render/errors and FPS.
- Prior attempt failed while the production alias served 404. Passing evidence is attempt 2 after founder promoted `cdcd91c`.

## Remaining gates
- Founder manual 10-point FX-23 Functional Check: PENDING; no FX-23 closure before founder explicitly states VERIFIED.
- This record reports public-URL automated QA only; it does not claim full five-profile BrowserStack device matrix was re-executed post-promotion or approve release.
- No product stage modified by this evidence record.
