# FACTORY X — RAILWAY STALE SNAPSHOT PREVENTION
Effective: 2026-09-22
Status: LOCKED PREVENTION NOTE
Scope: Any current or future Factory X product deployed on Railway

## Incident
During Sarhad Sniper repair, Railway redeploy behavior was observed rebuilding from an older repository commit rather than the intended latest branch commit.

Observed stale commit:
- 14c9670 (full SHA: 14c9670746dcc11692f2fddb4abd11bbd6bb9f4d)

Normal Railway redeploy did not pull the latest GitHub commits.

## Classification
This is a deployment-pipeline risk.
It is NOT, by itself, a gameplay bug.

## Mandatory Prevention Check
Before any Factory X claim that a Railway deployment is "successful", "current", "fixed", "verified", or equivalent:

1. Identify the intended Git commit SHA.
2. Inspect the Railway deployment metadata.
3. Confirm the Railway deployment commit SHA matches the intended commit.
4. If the SHAs do not match:
   - treat the deployment as stale,
   - do not use it as evidence of a successful repair/release,
   - do not close any stage based on that deployment,
   - correct the deployment source/pipeline first or use an explicitly controlled verification surface.
5. Record the verified deployment SHA in the relevant repair/release evidence.

## Retrofit Batch
Add this check to the Factory X retrofit batch consideration:
"Verify Railway deployment commit matches intended commit before any 'deploy successful' claim."

## Scope Control
This prevention rule applies to any future Factory X product deployed on Railway.
Do NOT proactively modify other products because of this note.
Apply it when those products reach a Railway deployment/retrofit step.

## Sarhad Sniper
Sarhad Sniper repair continues separately.
The stale-snapshot finding must not be confused with the existing mission/level gameplay blocker.
