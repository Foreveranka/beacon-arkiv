# Beacon — submission draft

## One-line pitch
Know who actually published a project address or security notice, before you trust it.

## Description
Beacon is an independent verification interface built around Arkiv as its primary data layer. Readers pin a publisher wallet, verify exact network-and-address pairs against that publisher's latest immutable registry, and distinguish authentic security notices from copied names. Arkiv's system creator field establishes provenance; payload claims and current ownership never establish trust. Time-scoped statements expire independently of storage extensions.

The prototype includes a dedicated landing page, project directory, address checker, searchable announcement feed, publisher comparison lab, wallet-based notice publishing, and technical documentation. Demonstration projects are fictional. The verification interface holds no funds and does not certify smart-contract safety.

## Intended tracks
Security; Open Source; Censorship Resistance. Final eligibility and track selection follow the current organizer rules. No application has been submitted.

## Architecture
Static browser client → Arkiv SDK 0.8.1 → Tiramisu (7738577).
Immutable JSON entities and typed indexed attributes are the primary records. Browser-local publisher pins are the trust anchors. There is no Beacon backend database. Independent clients can reproduce the queries in schema.md and scripts/verify.mjs.

## Readiness — update with evidence, not assumptions
- [x] New application core and SDK integration, October 16, 2026.
- [x] MIT license and reproducible local setup.
- [x] arkiv/schema.md and arkiv/friction.md.
- [x] Automated provenance/expiry/network/schema regression tests.
- [x] Public RPC read exercised successfully.
- [ ] Dedicated publisher funded with test GLM.
- [ ] Actual readonly entities created; transactions recorded in public/evidence.json.
- [ ] Ownership-transfer impersonation case verified on-chain.
- [ ] Wallet publishing and live event refresh tested end-to-end.
- [ ] Public source repository and publicly accessible deployment.
- [ ] Demonstration video (maximum three minutes), recorded from verified functionality.
- [ ] Organizer submission completed; availability maintained through October 23.

Do not describe illustrative fallback examples as on-chain records. A private development preview is not a public competition submission.

## Demo outline (150–170 seconds)
0–20s: A familiar project name can be copied. Show Beacon's landing page and explain publisher provenance.
20–50s: Open the address checker. Show a matching fictional address, then an address or network mismatch.
50–90s: Open the verification lab. Show actual creator versus claimed identity and current owner. Explain why ownership transfer cannot launder the creator.
90–115s: Open a notice's evidence. Show actual entity and transaction only after seeding is confirmed. Show the expired notice separately.
115–145s: Publish a synthetic notice from a funded Tiramisu wallet; refresh the independently queried feed. Record this only after the full wallet flow works.
145–170s: Show schema and independent query. State limits: trust must be established independently, keys may be compromised, records may be deleted, and publisher matches do not prove contract safety.

## Public test-wallet identities
Publisher: 0xdbDFa0f7290e32642D1AcBc9eFae267D66Dd5458
Impersonation test: 0xB72cD749e0b63093395512133583F2DD764aF791
Network: Arkiv Tiramisu, chain 7738577. These are test identities, not prize payout wallets.
