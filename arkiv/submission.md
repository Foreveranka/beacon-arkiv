# Beacon — Arkiv Global Tour Stop submission

## Public links
- App: https://beacon-arkiv.vercel.app
- Scanner: https://beacon-arkiv.vercel.app/app?view=scan
- Demo video: https://beacon-arkiv.vercel.app/demo (113 seconds; real UI screenshots, synthetic examples, generated English narration)
- Documentation: https://beacon-arkiv.vercel.app/docs
- Source: https://github.com/Foreveranka/beacon-arkiv
- Schema: https://github.com/Foreveranka/beacon-arkiv/blob/main/arkiv/schema.md
- Friction: https://github.com/Foreveranka/beacon-arkiv/blob/main/arkiv/friction.md

## Tagline
Inspect the link behind the message, without waiting for the project team to register.

## The problem it solves
Fake airdrop, claim and migration messages often hide misleading URLs behind familiar project names. Readers need an independent check even when a project team has never registered with a security tool. Beacon extracts each link from a pasted message, exposes its actual destination host and compares it with dated public-source domain references maintained by a curator. It explains lookalike domains, misleading subdomains, disguised Markdown targets, embedded credentials, Unicode names, shorteners and possible redirect parameters. A familiar domain is not a safety guarantee: unverified campaigns and unsupported evidence remain explicit unknowns.

The scanner runs locally. Pasted messages are not uploaded, target URLs are not visited, and users need no account or wallet to inspect a link. Arkiv is the first supported reference project. This is an independent observation from public first-party sources, not an Arkiv-team endorsement.

## Challenges I ran into
The original publisher-first design depended on project teams participating. We changed the primary workflow to independent, curator-maintained domain references while preserving provenance and expiry. Arkiv creation and expiration metadata use block numbers, so statement validity is separately stored as a timestamp. Current owner and a claimed publisher string cannot establish authorship: Beacon checks the actual system creator. Multiple links are evaluated independently, and an expired latest profile cannot reactivate an older approval. The faucet requires wallet authentication; at this revision the publisher is still awaiting test GLM, so no successful write is claimed.

## Why Arkiv?
Arkiv gives independent readers a common, creator-attributed, queryable dataset of expiring public references without a Beacon database or API. Postgres could implement the UX but would put the operator back in charge of serving provenance claims. IPFS alone does not supply a shared indexed query or the network creator metadata. Arkiv does not establish that a curator is honest: the app explicitly pins a curator and cites the observation sources. Private messages and analysis results stay off-chain on purpose.

## How Arkiv is used
- src/arkiv.mjs: SDK 0.8.1 direct Tiramisu reads, namespace/version filtering, creator-scoped reads and cursor pagination. WebSocket events offer a refresh without overwriting an in-progress form.
- src/link-security.mjs: readonly creator validation, typed domain profile and statement expiry; newer expired references cannot revive an older approval.
- src/scanner-ui.mjs: live query before a scan; an explicitly labeled bundled reference is used if no live profile is available.
- scripts/seed.mjs: prepared readonly entity creation and an ownership-transfer impersonation experiment. Completion is recorded in public/evidence.json, never inferred from a local fixture.

## Reproduction
1. Open /app?view=scan without signing in.
2. Inspect https://arkiv.network/ and observe a reference-host match, not a safe verdict.
3. Inspect the synthetic link https://arkiv.network.example.org/claim and observe the actual unrelated host. The app never visits this link.
4. Inspect [https://arkiv.network](https://example.org/claim) and observe the masked target warning.
5. Open the reference evidence panel. Confirm whether the source is a live Arkiv record or a labeled bundled fallback.
6. Clone the public repo, run npm ci, npm test, npm run build and npm run verify. The latter queries the actual public Tiramisu namespace with and without a creator filter and a two-entity page limit.
7. Inspect /evidence.json for real receipts. An empty transactions array means writes have not completed.

## Creator addresses (Tiramisu, 7738577)
- 0xdbDFa0f7290e32642D1AcBc9eFae267D66Dd5458 — curator and synthetic reference publisher.
- 0xB72cD749e0b63093395512133583F2DD764aF791 — synthetic impersonation test identity.
These are test identities, not prize payout wallets.

## Tracks and disclosures
Security and Open Source. No Indian-nationality claim. No imported pre-October-9 application code; core code and integration built October 16, 2026. Standard open-source SDK/tooling dependencies are disclosed in package-lock.json. AI-assisted implementation with OpenAI Codex.

## Readiness as of October 16
- [x] Public Vercel production deployment, root landing and separate application.
- [x] MIT source and reproducible build; 38 local tests pass.
- [x] Schema and friction report.
- [x] Live Tiramisu read; no records at this revision.
- [ ] Test GLM funding and real entity creation receipts.
- [ ] On-chain ownership-transfer test and browser wallet publishing verification.
- [x] Public demo walkthrough video (113 seconds); current UI and funding limits disclosed.
- [ ] Devfolio registration and final submission confirmed.

Do not mark this submitted until Devfolio confirms. No threat feed, Discord bot, actual redirect resolver, malware sandbox or transaction simulator is deployed. Unknown links are not automatically scams, and a reference match never certifies a campaign.
