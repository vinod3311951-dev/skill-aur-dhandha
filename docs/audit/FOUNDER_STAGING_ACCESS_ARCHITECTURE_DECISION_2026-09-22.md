# Founder Decision — Staging Access Architecture

Date: 2026-09-22
Status: RECORDED FOUNDER DECISION
Scope: Factory X staging access and Vercel project grouping
Pipeline impact: Does not change the current FX-22 status.

## Decision 1 — Staging Access Method

Rejected:
- Vercel Pro Password Protection as the portfolio-wide staging access method because per-project pricing is too expensive at scale.

Preferred:
- Cloudflare Access (Zero Trust free tier).
- Email-based or one-time PIN authentication.
- Intended to work across supported hosts including Vercel, GitHub Pages, and Railway.
- Intended to protect multiple product subdomains.
- No paid Vercel Password Protection is to be enabled on any new project without explicit founder approval.

Fallback:
- In-app password gate using a localStorage flag if Cloudflare Access is unsuitable.

Current migration direction:
- Existing skill-aur-dhandha Vercel project may remain as-is for now.
- Move Factory X staging protection to Cloudflare Access before adding more products.

## Decision 2 — Vercel Project Grouping

Direction:
- Group related Factory X products into a small number of Vercel projects rather than one project per product.
- Working target: 2–3 projects, such as games, utilities, and additional products.
- Each product retains its own [product].thinkingapps.in domain.
- The exact cheapest safe project structure must be locked before deploying product #5 (Patang).

## Spending Control

- Do not enable Vercel Pro Password Protection on any new project.
- Do not incur staging-access spend without explicit founder approval.

## Current Product Note

- Sarhad Sniper returns to staging per Factory X policy.
- Current stage continues.
- FX-22 status is not changed by this decision.

## Supersession Note

Where earlier staging guidance assumed Vercel Password Protection as the default portfolio-wide mechanism, this founder decision supersedes that access-method assumption. Existing unrelated Factory X authorities remain unchanged unless explicitly superseded.
