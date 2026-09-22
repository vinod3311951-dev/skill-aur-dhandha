# FACTORY X — FX-25 COPYRIGHT SOURCE COMPLETENESS VERIFICATION
Logged: 2026-09-22
Status: IMPLEMENTATION ADDENDUM
Authority basis: 02_STRICT_COPYRIGHT_POLICY_ALL_FUTURE_PRODUCTS.md
Scope: All current and future Factory X products at FX-25 Freeze

## Rule
Do NOT modify the locked copyright policy.
Do NOT reopen already closed stages.

At FX-25 Freeze, verify that the product's current-format copyright source evidence is complete.

## Mandatory registers/evidence
1. `IP_PROVENANCE_REGISTER` — every asset's origin
2. `ASSET_REGISTER` — every asset's source + hash
3. `DEPENDENCY_LICENSE_REGISTER` — every code dependency + license
4. `MUSIC_SFX_RIGHTS_REGISTER` — composition + recording rights
5. `FONT_REGISTER` — every font + license
6. `TRADEMARK_NAME_CHECK` — name/logo conflict status
7. `FINAL_ASSET_HASHES` — SHA-256 for every final asset
8. `IP_AUDIT_RESULT` — audit outcome

## Recommended supporting records
9. `SOURCE_MASTERS` — physical/location reference for original editable masters
10. `COPYRIGHT_SUMMARY.md` — one-page human-readable summary

## Current product reconstruction/verification notes
- Sarhad Sniper: copyright source register reconstruction required before FX-25 Freeze.
- Color Dominion: verify the existing 10 files in `docs/ip/` are complete and current.
- Skill Aur Dhandha: convert legacy IP documents to the current register format before FX-25 Freeze.
- Business Sudhaar: replace stale SAD-specific files with Business Sudhaar-specific current records before FX-25 Freeze.

## Future products
- FX-04 Copyright Register remains mandatory.
- The product should carry the 10-file `docs/ip/` evidence set through the pipeline.
- At FX-25, verify completeness/currentness rather than assuming FX-04 evidence stayed current.

## Product Final Record
At FX-25 Freeze, include:
- a concise summary of the eight mandatory registers,
- confirmation whether all mandatory records are current,
- any unresolved gap (for example trademark clearance) that remains open.

This is an FX-25 verification step only. It does not alter the locked copyright policy, reopen a closed stage, or modify the audit rubric.
