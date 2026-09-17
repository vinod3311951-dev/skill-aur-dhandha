# Skill Aur Dhandha — Official Source Register

Purpose: persistent provenance for claims and outbound government routes. This register is release evidence; it is not a substitute for re-checking time-sensitive rules immediately before release.

## Verification convention

- **VERIFIED FACT** = directly supported by the authoritative destination recorded below.
- **GUIDANCE** = product wording or decision support; not presented as a government fact.
- Eligibility, fees, documents, deadlines, tax treatment and thresholds can change and must be checked at the official destination before acting.

## Verified 2026-09-18

### myScheme
- Official destination: https://www.myscheme.gov.in/
- Authority/context: National government-scheme discovery platform; site identifies Digital India Corporation / Ministry of Electronics & IT / Government of India and states it is operated by NeGD with government partners.
- Product use: direct Government Help discovery route.
- Safe product claim: users can use myScheme to discover government schemes and inspect scheme information/eligibility guidance before following the relevant application route.
- Do not claim: that Skill Aur Dhandha has determined eligibility or that a benefit/application is guaranteed.

### Udyam Registration
- Official destination: https://udyamregistration.gov.in/
- Authority/context: official Government of India, Ministry of MSME Udyam Registration portal. The portal explicitly warns that private sites/services are not authorised for MSME registration and states registration is free.
- Product use: direct MSME/Udyam route and Tax & Compliance Check reference.
- Safe product claim: this is the official Udyam Registration destination.
- Important current portal context: the portal currently displays MSME classification criteria and registration requirements. Do not hard-code those thresholds/requirements into recommendation logic without a release-date re-check.
- Privacy boundary: Skill Aur Dhandha does not collect Aadhaar, PAN or GSTIN; any data required by Udyam is entered only on the official government portal by the user.

### Income Tax Department e-Filing
- Official destination: https://www.incometax.gov.in/
- Authority/context: the portal's About page identifies it as the official portal of the Income Tax Department, Ministry of Finance, Government of India, providing single-window access to income-tax-related services.
- Product use: Tax & Compliance Check reference.
- Safe product claim: use the official Income Tax portal to verify current income-tax services/rules relevant to the user's circumstances.
- Do not claim: a tax liability, regime choice or filing obligation from an MSME/SME label or from the opportunity category alone.

### National Single Window System (NSWS)
- Official destination: https://www.nsws.gov.in/
- Authority/context: current site identifies the Department for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry, Government of India. NSWS describes itself as a digital platform for identifying and applying for business approvals; its KYA module provides approval guidance across participating central departments and states.
- Product use: Government Help / business-approval discovery route.
- Safe product claim: NSWS can help a business identify relevant approvals and access participating approval applications.
- Important boundary: NSWS itself describes KYA as guidance and advises checking relevant government portals for other required approvals. Skill Aur Dhandha must therefore not present NSWS output as exhaustive legal clearance.

### National Career Service (NCS)
- Official destination: https://www.ncs.gov.in/
- Authority/context: current site identifies National Career Service under the Directorate General of Employment, Ministry of Labour & Employment, Government of India.
- Product use: trusted employment/career next-step route.
- Safe product claim: NCS provides job-search and career-related services/resources. The current portal states NCS services are free of cost and warns users about misleading/fraudulent communications claiming association with NCS.
- Product boundary: Skill Aur Dhandha does not broker jobs, collect job-placement fees or guarantee employment.

### Small Farmers' Agribusiness Consortium (SFAC) — FPO route
- Official destination: https://www.sfacindia.com/FPOS.aspx
- Authority/context: SFAC identifies itself as a society promoted by the Department of Agriculture and Farmers Welfare, Government of India. Its FPO material defines FPOs as producer organisations whose members are farmers and provides scheme guidance and state-wise FPO information.
- Product use: Find My Market FPO research route.
- Safe product claim: users can use SFAC material to understand the FPO ecosystem and locate published FPO information relevant to their state/commodity.
- Do not claim: that a specific user can join a particular FPO, that an FPO will buy produce, or that membership/aggregation guarantees a sale or price.

### Open Network for Digital Commerce (ONDC)
- Official destination: https://www.ondc.org/
- Authority/context: ONDC describes itself as an initiative of the Government of India's Department for Promotion of Industry and Internal Trade (DPIIT), designed as population-scale digital infrastructure using open-network principles.
- Product use: Find My Market digital-commerce research route.
- Safe product claim: ONDC is a digital-commerce network initiative that supports participation across multiple domains; users must still check the relevant participant/network route, fees, fulfilment and terms.
- Do not claim: that ONDC itself is a guaranteed marketplace, that every seller/service is eligible, or that joining guarantees orders.

## Pending authoritative verification before release

- GST portal — https://www.gst.gov.in/
- DGT / Skill India Digital route — https://dgt.skillindiadigital.gov.in/
- e-Shram — https://eshram.gov.in/
- Ministry of Agriculture & Farmers Welfare — https://agriwelfare.gov.in/
- Ministry of MSME — https://msme.gov.in/
- FSSAI FoSCoS — https://foscos.fssai.gov.in/
- e-NAM — https://enam.gov.in/
- Any additional external official or market-route destination surfaced by the production UI that is not yet recorded above.

## Release rule

Every external government destination surfaced in the production UI must have a corresponding current entry here before Formal Audit 1 can close the official-link gate. Redirects must be checked for the exact authoritative destination; no private intermediary or affiliate route may masquerade as an official portal.
