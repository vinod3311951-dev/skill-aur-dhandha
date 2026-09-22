# FACTORY X — DEPLOYMENT VERIFICATION RULES
Effective: 2026-09-22
Status: LOCKED
Scope: All current and future Factory X deployments

Purpose: Detailed deployment verification rules referenced by Project Instructions Part F.

## DEPLOYMENT VERIFICATION LAW

NEVER claim "deployed successfully" unless ALL are verified:

1. **INTENDED COMMIT**  
   State the exact intended commit SHA.

2. **ACTUAL DEPLOYED COMMIT**  
   Query the live deployment and confirm which commit is serving.

3. **COMMIT MATCH**  
   If actual ≠ intended: DO NOT claim deployment success. Fix the deploy pipeline first. Railway has stale-snapshot issue: redeploy ≠ latest.

4. **ROUTING VERIFICATION**  
   Load the live URL in a clean/incognito session. Confirm it serves the correct product (not a sibling product). Confirm no redirect to another product.

5. **QA EVIDENCE FILE**  
   For any QA stage, produce the evidence file. No evidence file → QA is NOT PASS.

6. **FUNCTIONAL VERIFICATION**  
   Deploy success ≠ functional success. Automated QA can pass while product is broken. FX-23 Founder Functional Check is a separate mandatory gate.

## SPECIFIC PLATFORM NOTES

**Railway:** has stale-snapshot issue. Redeploy rebuilds from potentially old commit. Always verify deployed commit SHA matches intended.

**Vercel:** each product should have its own project. Shared projects route domains to latest deployment across branches → misrouting.
