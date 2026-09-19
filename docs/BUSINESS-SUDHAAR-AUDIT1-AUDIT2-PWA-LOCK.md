# Business Sudhaar — Audit 1, Audit 2 & PWA Lock

**Date:** 2026-09-19  
**Branch:** `business-sudhaar/vertical-slice-01`  
**Status:** CODE / PRODUCT LOCKED after Audit 1 + Audit 2

## Frozen journey

HOME → ISSUE → ABOUT THE BUSINESS → ADAPTIVE QUESTIONS → FAULT SUMMARY → THREE PRIORITY ACTIONS + ONE METRIC → OPTIONAL MACHINE/VENDOR GUIDANCE → VERIFIED/OFFICIAL RESEARCH → DONE

Every staged screen uses:

**BACK | HOME | NEXT**

No additional dashboard tabs are permitted. Dropdowns are used only where they reduce clutter.

## Front-page lock

The home screen must keep all of the following visible:
- Business Sudhaar promise and start action.
- **BHASHINI language** dropdown.
- BHASHINI fallback note.
- Privacy notice.
- Business-guidance disclaimer.
- No account / name / phone / email / exact address / documents / bank details / contact-list requirement.

## Audit 1 — product, logic, privacy and UX

### Guided UX — PASS
- One principal question/decision per screen.
- Direct HOME navigation added between BACK and NEXT.
- No forced new-tab navigation.
- Session state remains local.

### Diagnostic engine — PASS after repair
The original generic equal-weight score was replaced before lock.

Frozen engine rules:
- Explicit answer severity on a 0–3 pressure scale.
- Issue-specific dimension weights.
- Business profile/history fields are not treated as negative evidence.
- The displayed number is a **Business signal score / shortfall**, not an audited financial-health rating.
- Highest-pressure dimensions produce the fault explanation.
- Exactly three unique priority actions.
- One primary metric tied to the highest-pressure issue.
- Same inputs always reproduce the same output.
- Material answer changes alter the output.
- Runtime AI does not determine the diagnosis.

### Non-repetition — PASS
Executable scenarios cover Sales, Customers, Profit, Growth and Machine Breakdown.
The regression gate checks:
- three actions exactly;
- no duplicate actions within a result;
- different issue patterns do not collapse to one identical action plan;
- changed answers change the result;
- identical answers remain deterministic.

### Privacy / legal surface — PASS
- No account or identifying information required.
- Front-page privacy notice is mandatory.
- Front-page business-guidance disclaimer is mandatory.
- Vendor links are discovery only.
- No seller authentication, payment, transaction handling or guarantee claims.

## Audit 2 — release QA

### Automated release gate — PASS
- TypeScript/Vite build passes.
- PWA manifest branding passes.
- Business Sudhaar service-worker cache namespace passes.
- BACK / HOME / NEXT presence is enforced.
- Three-column mobile navigation is enforced.
- Front-page BHASHINI visibility is enforced.
- Front-page privacy and business disclaimer visibility is enforced.
- No browser-side BHASHINI secret is allowed.
- No forced new-tab target is allowed.
- Deterministic local session namespace is enforced.
- Weighted diagnostic-engine presence is enforced.
- Diagnostic non-repetition tests pass.
- No runtime AI diagnosis dependency is permitted.

### Deployment — PASS
GitHub/Vercel deployment status for the audited branch is successful.

### BHASHINI runtime — CONDITIONAL
The secure server-side proxy and visible language selector are integrated.
Live regional translation requires valid Vercel environment values:
- `BHASHINI_API_KEY`
- `BHASHINI_TRANSLATION_SERVICE_ID`

These secrets are intentionally not exposed in browser code. Current connector authorization does not permit environment-value inspection, so live credential activation must not be claimed until a real translation request is verified.

## Market-position lock

Business Sudhaar is **not** positioned as another billing/ledger/accounting app.

Market research showed major Indian SMB products concentrate on recorded transactions, invoicing, ledgers, receivables, cash flow and accounting. Business Sudhaar's differentiated role is:

**Choose a business problem → answer only relevant questions → deterministic problem-weighted diagnosis → evidence-based fault summary → three practical actions → one metric → optional machine/vendor/research path.**

This avoids duplicating transaction-led apps while providing a low-friction diagnostic layer for owners who may not maintain structured books.

## Frozen boundaries

Do not add:
- dashboard maze;
- chatbot;
- account/login for core use;
- consultant marketplace;
- lead collection;
- buyer-seller chat;
- payments;
- seller verification claims;
- generic repetitive advice;
- random or AI-generated scoring;
- additional navigation tabs.

Do not change the frozen journey or diagnostic formula without a new versioned audit.

## Lock decision

**Business Sudhaar v1 is CODE / PRODUCT LOCKED.**

The branch may receive only:
1. verified bug fixes,
2. live BHASHINI credential/runtime activation,
3. broken external-link maintenance,
4. security/accessibility fixes,
5. explicit founder-approved versioned feature work.

