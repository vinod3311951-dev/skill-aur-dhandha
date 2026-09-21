# FX-22 In-App Password Gate — Color Dominion

Date: 2026-09-22
Stage: FX-22 Production Deployment
Status: IMPLEMENTED; production-secret verification required before closure

## Founder directive implemented

Color Dominion now uses the immediate Factory X in-app staging gate.

- Local unlock key: `factoryx_unlocked`
- Locked session screen: **Private Preview — Password Required**
- Correct password: stores the unlock flag locally and proceeds to the normal Home screen.
- Incorrect password: rejected; no unlock flag is written.
- Founder level-select remains unchanged after unlock.
- Gate is config-driven through `STAGING_ACCESS.enabled` in `src/config.js`; release can disable it per product.
- Raw password is not committed to source control.

## Password storage

The password is read server-side from the free Vercel environment variable:

`FACTORYX_PREVIEW_PASSWORD`

The founder owns and stores the shared password. The repository contains no raw password.

If the environment variable is absent, the gate fails closed and reports that founder setup is required.

## Hosting implementation

- Browser gate: `src/staging-gate.js`
- Vercel auth function: `api/factoryx-auth.js`
- Constant-time verifier: `api/factoryx-auth-core.js`
- Local smoke server supports the same endpoint for QA.
- Service-worker cache includes the staging-gate module.

## Portfolio rule recorded from founder directive

- Apply this pattern to all future Factory X products at FX-22 unless superseded by the preferred long-term Cloudflare Access architecture.
- Retrofit Sarhad Sniper, Business Sudhaar, and Skill Aur Dhandha in the post-FX-25 batch work.
- Do not enable paid Vercel Password Protection.
- Do not incur spend without explicit founder approval.

## Verification gates

Required before FX-22 closure:
1. Fresh browser without `factoryx_unlocked` sees the password screen.
2. Correct founder password loads the application.
3. Incorrect password is rejected.
4. Deployed Color Dominion custom domain serves the gated build.

No password value is recorded in this document.
