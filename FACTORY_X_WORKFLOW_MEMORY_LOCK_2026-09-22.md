# FACTORY X — WORKFLOW MEMORY
Effective: 2026-09-22
Status: LOCKED
Scope: All products, all stages

Purpose: One-page reference for the FX-01 → FX-26 pipeline and per-stage verification requirements. The stage names/requirements below are founder-provided. For stages not listed here, consult the canonical locked pipeline master; do not invent them.

## PIPELINE STAGES

| Stage | Name | Produces | Verification Required |
|-------|------|----------|----------------------|
| FX-01 | Research | Findings | Cite authorities; no design changes |
| FX-02 | Freeze Blueprint | Frozen blueprint | Cite blueprint; no v2 |
| FX-03 | Asset Bible | Asset spec | Cite presentation identity lock |
| FX-04 | Copyright Register | 8 IP registers | All 8 files exist and current |
| FX-05 | Asset Creation | Asset pack | Assets exist; hashes recorded |
| FX-06 | Implementation Prompt Pack | Build instructions | No product code |
| FX-07 | Grey Box / Core Build | Playable core | Automated core tests pass |
| FX-12 | Directional Freeze | Direction locked | No design changes after |
| FX-13 | Audit 1 | 100-pt + gates | Score ≥ 90 + all gates clear |
| FX-14 | Audit 1 Fixes | Repairs | All P1s addressed |
| FX-15 | Audit 2 | 100-pt + gates | Score ≥ 95 + all gates clear |
| FX-16 | Audit 2 Fixes | Repairs | All P1s addressed |
| FX-17 | Factory X Automated QA | Automated report | Evidence file exists |
| FX-18 | Playwright QA | Browser matrix | 5 profiles green |
| FX-19 | Fixes + Regression | No-change confirm | Regression stays green |
| FX-20 | PWA Checks | PWA test | Manifest, SW, offline pass |
| FX-21 | Mobile / Device QA | Mobile report | 320–1440px + WebKit green |
| FX-22 | Production Deployment | Live URL + gate | Deployed commit = tested commit |
| FX-23 | Verified Public PWA Link | Verified link | Founder Functional Check passed |
| FX-24 | Pilot | Pilot approval | Founder approves |
| FX-25 | Freeze | Product complete | Product Final Record produced |
| FX-26 | Next Product | Move on | — |

**FX-08 through FX-11:** not specified in this founder-provided table; use `FACTORY_X_PIPELINE_MASTER_LOCK_2026-09-21.md` rather than inferring requirements.

## VERIFICATION RULES (CRITICAL)

Before claiming PASS at ANY stage:

1. **INTENDED COMMIT == ACTUAL DEPLOYED COMMIT**
   - Query deployment; verify SHA matches.
   - Railway has stale-snapshot issue: "redeploy" ≠ latest.

2. **QA EVIDENCE FILE EXISTS**
   - No evidence file → no PASS claim.

3. **ROUTING VERIFIED**
   - Load live URL in clean session.
   - Confirm serving correct product.

4. **FUNCTIONAL VERIFICATION (FX-23 only)**
   - Founder Functional Check (10-point) required.
   - Deploy success ≠ functional success.

5. **NO SPEND WITHOUT APPROVAL**
   - Any charge → RED STOP.

6. **ONE PRODUCT AT A TIME**
   - No parallel production.
   - One chat per product stage.

## RED-FLAG PATTERNS

Any of these → STOP and verify:
- "deployed successfully" without commit SHA comparison
- "QA passed" without evidence file
- "routing fixed" without clean-session URL test
- "$X per month" without free alternative comparison
- "released" without FX-23 Founder Functional Check
- "stage complete" without 10-field completion packet

## HOW THIS FILE IS USED

At the start of every stage:
1. Read this file.
2. Read the corresponding stage row.
3. Confirm what verification is required.
4. Execute.
5. Verify before claiming PASS.
