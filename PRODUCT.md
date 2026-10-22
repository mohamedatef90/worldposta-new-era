# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

All four audiences are primary; the site must serve each without hiding the others:

- **Enterprise IT leaders** (CIOs, IT managers) at mid-to-large companies evaluating cloud infrastructure, business email, security and managed-service vendors.
- **SMB owners** who want business email, collaboration and cloud without running an IT team.
- **Service providers** (telcos, hosting and channel partners) who resell or white-label the platform, notably through Posta Portal and the partner program.
- **Government and public-sector bodies** that need sovereign, in-region hosting and administration (Posta Portal names government organizations explicitly).

## Product Purpose

The marketing website for WorldPosta. It explains a broad product ecosystem and routes each visitor to the product that fits, then to a conversion: sign up, log in, request a demo or consultation, or talk to sales/an expert.

Success means a visitor understands which part of the ecosystem solves their problem and takes the next step for it.

## Positioning

WorldPosta brings cloud infrastructure, collaboration, security and managed services together as one ecosystem, rather than a pile of separate vendors. Its stated belief: businesses shouldn't have to choose between performance, security, flexibility and simplicity, and technology should make business simpler (Our Story page).

## Operating Context

Product lineup the site covers, each with its own route:

- **CloudEdge**: scalable cloud infrastructure, private cloud and Zero Trust (`/cloudedge`).
- **Posta**: secure business email (`/posta`); **Posta Drive** files (`/drive`); **Posta Link** team chat and meetings (`/link`); **CloudSpace** the collaboration and productivity suite (`/cloudspace`).
- **Posta Gate**: AI-powered email security gateway (`/posta-gate-security`).
- **Posta Portal**: white-label, multi-tenant email administration for service providers and government (`/posta-portal`).
- **WPSYS**: managed IT, cybersecurity and cloud operations (`/wpsys`), including **Cloud SOC** (`/cloud-based-soc-solutions`), **IT Automation** (`/it-software-automation-tools`) and **Seamless Migration** (`/seamless-migration`).
- **SAP**: SAP cloud operations (`/sap`) and SAP Basis operations (`/sap-basis-operations`).
- Company and proof pages: Our Story, Success Stories (case studies, filterable by service, industry and country), Contact.

Conversion destinations in use: signup at `https://www.worldposta.com/signup`, login at `https://home.worldposta.com/`, plus contact, consultation and demo forms on product pages.

## Capabilities and Constraints

- Angular 22 standalone app with signals and lazy-loaded routes. Repo rules in `AGENTS.md` / `CLAUDE.md` are binding.
- Light and dark themes are both first-class; every surface must work in both.
- Market: MENA, **English only** for now. The header's Arabic toggle is aspirational, so do not design for RTL or Arabic copy until that is confirmed.
- Every product page shares the site header, footer, and the sticky "On this page" jump-nav pill.

## Brand Commitments

- Names in use: **WorldPosta** (master brand), **Posta** (collaboration family), **CloudEdge**, **CloudSpace**, **WPSYS** (managed services).
- Logo assets: `public/worldposta-assets/WP-Logo.avif` and `WP-Logo-Light.avif`; product logos are in `public/worldposta-assets/product-logos/`.
- An existing WorldPosta design system is binding for visual work (documented separately in DESIGN.md, not here).

## Evidence on Hand

**Status: mostly placeholders.** The proof points currently on the site came from design references and are **not confirmed for marketing use**:

- Customer names (QNB, HSBC, ADNOC, e&, DP World, Emirates NBD, Hassan Allam and others).
- Metrics: 99.99% SLA/availability, "up to 50% lower cost", 35 availability zones, uptime figures.
- Certifications: ISO 27001, PCI DSS, SOC 2, GDPR.
- Case studies on `/case-studies`, and partner logos (Oracle, SAP, Microsoft, VMware, Fortinet, Dell and others).
- People, names and messages inside product mockups (for example the Posta phone inbox) are fictional by design.

Future work must not add new customer names, metrics, certifications, testimonials or partner claims, and must not present the existing ones as verified, until real data is supplied. Flag any surface that leans on them.

## Product Principles

1. **One ecosystem, many doors.** Every page should make clear where the visitor's problem fits in the wider WorldPosta ecosystem and link onward, without burying the product they came for.
2. **Serve four buyers honestly.** Enterprise, SMB, service-provider and government visitors each need their own path; never write a page as if only one of them exists.
3. **Simplicity is the promise.** The brand's core belief is that technology should make business simpler, so the site itself must be easy to scan and navigate.
4. **No invented proof.** Claims stay unverified until confirmed; credibility comes from clarity and real product detail, not fabricated logos or numbers.

## Accessibility & Inclusion

WCAG 2.2 AA is required, and pages must pass axe checks (binding repo rule in `AGENTS.md` / `CLAUDE.md`). This includes colour contrast in both light and dark themes, visible focus, correct ARIA and keyboard support.
