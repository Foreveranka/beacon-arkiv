# Arkiv integration observations

Environment: Node 25.6.0, SDK 0.8.1, viem locked in package-lock.json, Tiramisu 7738577. Date: 2026-10-16 Europe/Istanbul.

## Public HTTP query
Expected: namespace-filtered select returns a snapshot without an access key.
Actual: succeeded at block 626942 with zero pre-existing Beacon records.
Reproduce: npm ci; npm run verify.

## Schema and provenance
Confirmed in installed SDK: Entity.createdAt / expiresAt are block numbers, not timestamps. The app separately stores numeric validUntil and uses block expiry plus statement expiry. CreationFlags.readonly forbids content updates but does not forbid deletion or ownership transfer. Trust checks creator, never owner. These differences are made explicit in the UI and tests.

## Wallet setup
The public faucet at hub.arkiv.network/faucet requires connecting and signing in with a wallet. It does not expose an unauthenticated address input in the inspected UI. Dedicated test wallets were generated outside the repository. On October 16, 9.9 test GLM arrived and eight readonly entities were created. public/evidence.json contains the actual receipts. The synthetic impersonation record was transferred to the curator; creator-based validation still rejected it.

## Automated tests
Run npm test. Security regressions cover copied publisher claims, ownership transfer, mutable content, two independent expiration checks, wrong networks, latest registry selection, invalid payloads and DOM escaping. These are local tests, not chain-write evidence.

## Live events
Uses WebSocket transport with no fromBlock; event notifications ask the reader to refresh rather than replacing an in-progress form. If the stream errors, the interface explicitly offers manual Refresh. Funding and SDK seeding are complete; browser event-triggered refresh remains unverified.

## Independent scanner pivot — October 16
User research identified dependence on project-team registration as a usability barrier. Domain profiles are now maintained by Beacon's curator, citing public first-party sources. The actual creator identifies the curator, not an endorsement by the project. URL inspection runs locally without fetching targets, so redirect parameters are reported as possible redirects rather than observed destinations. The URL rules and profile provenance have dedicated tests in tests/link-security.test.mjs. External phishing feeds, actual redirect following and transaction simulation remain unimplemented and are disclosed in the UI.

## Indexed attribute casing — first funded write
Expected: SDK 0.8.1 name validation accepts `validUntil` and its error description advertises uppercase letters. Actual: Tiramisu rejected the uppercase U at byte 5 with Ident32InvalidByte during transaction simulation. Reproduce: create an entity with attributes `{validUntil: 1793404800}`. Verified workaround: lowercase `valid_until` for the index; JSON payload field can remain camelCase. This failure was not a successful chain creation.

## Funded integration verification
October 16: eight entities, four cursor pages with limit 2. Creator-scoped query returns seven entities and excludes the impersonation creator after its owner was changed to the curator. The domain-profile is validated by resolveProfile, separately from legacy notices/registries. Browser-wallet publishing and event refresh remain unverified; these are not implied by SDK seeding success.
