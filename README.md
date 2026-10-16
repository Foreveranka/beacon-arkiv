# Beacon

Inspect links shared in chats against public-source domain references and transparent warning rules, without requiring project teams to register. Legacy publisher/address verification remains available. Built for Arkiv Global Tour Stop, Security / Open Source / Censorship Resistance tracks.

## Run
Node >=22. `npm ci`, `npm test`, `npm run build`, `npm run dev`.
Landing: http://127.0.0.1:4317/ · Application: /app · Documentation: /docs.

No backend database, no required account, no visitor private keys. Reads are direct browser-to-Tiramisu queries. Wallet publishing signs only Tiramisu test transactions.

## Testnet evidence
`npm run verify` queries the shared namespace, then uses createdBy to restrict to the pinned publisher, with a page size of 2 to exercise cursor pagination. `public/evidence.json` records actual chain creation transactions. Empty transactions mean no completed seeding; the site labels illustrative fallback records clearly.

`npm run seed` uses dedicated project-controlled wallets in an external private directory supplied by BEACON_KEYS_DIR. Files publisher.json / impostor.json contain the privateKey locally and MUST NOT be committed. It checks the chain ID, creates readonly synthetic entities, and transfers the impersonator record to the trusted owner to demonstrate that creator-based filtering still rejects it. Test GLM required. Seeding resumes from saved public receipts.

## Threat model
The trust anchor is an explicitly selected publisher wallet, not a project name. A compromised signing key, malicious pinned publisher, compromised frontend, RPC failure or record deletion is outside the guarantee. Entity content is readonly; owner changes cannot turn an attacker into a trusted creator. Address matches do not certify contract safety. All demo organizations and contract addresses are fictional.

## Why Arkiv
Readers and third-party clients query the same public dataset without a Beacon database operator or API. Typed attributes support project filtering and creator-scoped reads; storage lifecycle matches expiring announcements. IPFS alone does not supply this shared query index or creator field. Ordinary databases can implement most UX features, but readers would rely on the operator's data and identity claims. Arkiv introduces its own network/RPC availability and expiration constraints, which are stated explicitly.

## Submission materials
See arkiv/schema.md, arkiv/friction.md and arkiv/submission.md. This is new core code and integration created October 16, 2026. Standard SDK dependencies are reused; no pre-existing application core was imported.

MIT licensed. No affiliations with fictional demonstration projects or Arkiv implied.

## Link scanner
Default app route: /app?view=scan. Arkiv is the first real reference project. Exact hosts are sourced from first-party public links; this is a Beacon-maintained observation, not an Arkiv-team signature. The scanner never fetches submitted URLs and never uploads pasted messages. Results distinguish strong warning signs, needs review, reference-host match and unknown; none is a blanket safety guarantee. No bot, external threat feed, redirect resolver or wallet-transaction simulator is deployed.
