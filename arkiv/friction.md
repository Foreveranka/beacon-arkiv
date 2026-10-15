# Arkiv integration observations

Environment: Node 25.6.0, SDK 0.8.1, viem locked in package-lock.json, Tiramisu 7738577. Date: 2026-10-16 Europe/Istanbul.

## Public HTTP query
Expected: namespace-filtered select returns a snapshot without an access key.
Actual: succeeded at block 626942 with zero pre-existing Beacon records.
Reproduce: npm ci; npm run verify.

## Schema and provenance
Confirmed in installed SDK: Entity.createdAt / expiresAt are block numbers, not timestamps. The app separately stores numeric validUntil and uses block expiry plus statement expiry. CreationFlags.readonly forbids content updates but does not forbid deletion or ownership transfer. Trust checks creator, never owner. These differences are made explicit in the UI and tests.

## Wallet setup
The public faucet at hub.arkiv.network/faucet requires connecting and signing in with a wallet. It does not expose an unauthenticated address input in the inspected UI. Dedicated test wallets were generated outside the repository; test funding requested. Public evidence status reports whether writes have actually completed.

## Automated tests
Run npm test. Security regressions cover copied publisher claims, ownership transfer, mutable content, two independent expiration checks, wrong networks, latest registry selection, invalid payloads and DOM escaping. These are local tests, not chain-write evidence.

## Live events
Uses WebSocket transport with no fromBlock; event notifications ask the reader to refresh rather than replacing an in-progress form. If the stream errors, the interface explicitly offers manual Refresh. This integration remains to be exercised with a real creation event until funding and seeding complete.
