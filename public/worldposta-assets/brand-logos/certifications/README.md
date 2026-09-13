# Certification marks

Empty on purpose. Unlike the customer and partner logos, these marks cannot be
sourced or generated — each has to come from the body that certified WorldPosta:

| Claim      | What the real asset is                                                                 |
|------------|----------------------------------------------------------------------------------------|
| ISO 27001  | The **certification body's** mark (BSI, TUV, SGS, DNV, Bureau Veritas, …) plus the certificate number. ISO's own logo may not be used to indicate certification. |
| PCI DSS    | A PCI SSC mark. The council licences its marks; compliant service providers are normally listed on the Visa/Mastercard registries rather than given a badge. |
| SOC 2      | The AICPA "SOC for Service Organizations" logo, supplied by the CPA firm that ran the examination, used under AICPA's usage guidelines. |
| GDPR       | **No official mark exists** — GDPR is a regulation, not a certification scheme. Any "GDPR badge" found online is unofficial. |

Until a real file lands here, each entry falls back to a representative icon.
Never substitute a look-alike badge: that would assert a credential we cannot evidence.

## Adding one

1. Drop the file here (SVG preferred, else WebP/PNG with transparency).
2. In `performance-trust.component.ts`, add `mark` to that certification:

   ```ts
   {
     label: 'ISO 27001', detail: 'Information Security', tone: 'blue', icon: faShieldHalved,
     mark: { src: 'certifications/iso-27001.svg', width: 120, height: 48 },
   }
   ```

`width`/`height` must be the asset's intrinsic size or NgOptimizedImage will warn.
