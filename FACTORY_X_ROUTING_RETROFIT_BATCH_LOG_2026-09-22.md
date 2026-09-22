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


## Sarhad Sniper dedicated-project migration
- Shared-project alias fix was insufficient; live domain still resolved to Skill Aur Dhandha.
- Decision: move Sarhad Sniper to its own Vercel project.
- Sarhad branch: `sarhad-sniper-deploy`.
- Branch-level custom-domain alias removed so the old shared project cannot reclaim the domain on later branch redeploys.
- Commit: `830e79c4ba0201977887fa0e350c053784ff43e2`.
- No password gate is part of this migration.
- Next account-level steps: create dedicated Vercel project from the existing GitHub repo, set production branch to `sarhad-sniper-deploy`, move `sarhadsniper.thinkingapps.in` from the shared project to the new project, deploy, then verify in a clean session.
- Color Dominion FX-23 remains unchanged.


## Railway stale-snapshot prevention
- Prevention note: `FACTORY_X_RAILWAY_STALE_SNAPSHOT_PREVENTION_2026-09-22.md`.
- Railway may redeploy an older source snapshot instead of the intended latest commit.
- Before any "deploy successful" claim, verify the Railway deployment commit SHA exactly matches the intended Git commit SHA.
- If the SHA is stale/mismatched, deployment success is NOT valid release evidence.
- Applies to any current/future Factory X product deployed on Railway.
- Retrofit-batch consideration only for other products; do NOT act on them now.
