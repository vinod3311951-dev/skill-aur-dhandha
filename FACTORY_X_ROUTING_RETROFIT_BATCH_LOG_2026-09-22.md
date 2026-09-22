# Factory X Routing Retrofit Batch Log — 2026-09-22

Status: ACTIVE BATCH LOG (non-authoritative; does not supersede any locked Factory X authority)

## Confirmed routing defect
- Sarhad Sniper custom domain was serving Skill Aur Dhandha because multiple products share one Vercel project and the Sarhad deployment branch had no product-specific alias configuration.
- Sarhad Sniper routing fix applied on branch `sarhad-sniper-deploy`.
- Added explicit alias: `sarhadsniper.thinkingapps.in`.
- No password gate added.
- Color Dominion FX-23 status is unchanged.

## Retrofit batch — pending review/fix
1. Business Sudhaar
   - Verify whether its custom domain is mapped to its own build.
   - If shared-project routing is present, apply product-specific routing fix.
   - Recommended architecture: migrate to a dedicated Vercel project.

2. Skill Aur Dhandha
   - Verify its custom domain/build mapping.
   - Confirm it remains the intended deployment and is not receiving aliases belonging to other products.
   - Recommended architecture: dedicated Vercel project.

## Architecture recommendation
For Factory X products, use one Vercel project per product wherever practical:
- one product repo/branch deployment target
- one Vercel project
- one custom domain
- product-specific environment variables
- product-specific deployment history and rollback boundary

This reduces recurring cross-product routing, alias, environment-variable, and redeploy mistakes.

## Color Dominion
- Do not change current FX-23 status as part of this batch.
