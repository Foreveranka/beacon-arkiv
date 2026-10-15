# Beacon data contract v1

Network: Tiramisu testnet, chain 7738577. SDK: @arkiv-network/sdk 0.8.1.
Namespace: `beacon-arkiv-v1`. All organizations and destination addresses are synthetic.

## Queries the application must answer
1. What is the latest valid address registry created by my pinned publisher for this project?
2. Which current notices were created by that publisher, and which same-name notices came from someone else?
3. Does the exact address on the exact target network appear in the latest trusted registry?

## Attributes
| Attribute | Type | Purpose |
| --- | --- | --- |
| app | string | Namespace isolation |
| version | number (i32) | Schema version, 1 |
| project | string | harbor, orbit, fern (fictional) |
| type | string | registry or notice |
| severity | string | info, warning, critical |
| validUntil | number (i32, Unix seconds) | Statement validity, not storage lifetime |

Payload JSON repeats the schema identity for validation and carries title, body, and (registries) `addresses: [{address, chainId, label}]`. Payload creator/owner fields are ignored. Public system fields `$creator`, `$owner`, `$createdAt`, `$expiresAt`, and creation flags establish provenance and lifetime.

## Entity Expiration and trust
Registries: 30 days. Notices: 24 hours, 3, 7, or 14 days. Seed notices: 14 days so judges can inspect through October 23. One seed notice has past business validity but still-present storage to demonstrate expiry.

Every trusted record must have readonly=true. PermissionlessExtension=true permits retaining evidence without changing content. Lifetime Extension does not extend the signed-in-payload `validUntil`. Renewal of a statement requires a new immutable record. Owners can still delete entities; do not claim a permanent or complete archive. Transferred ownership does not alter `$creator`.

## Exact reproducible query
```js
let page = await client.select()
  .where(and(eq('app', 'beacon-arkiv-v1'), eq('version', 1)))
  .createdBy(publisher)
  .limit(100)
  .fetch();
while (page.hasNextPage()) page = await page.next();
```
Feed uses the same query without createdBy to surface impersonators. Sort locally by creation block, then key. Latest valid registry per project is authoritative within the chosen trust model. The verifier re-queries at click time and fails closed on RPC failure. Pagination uses snapshot-bound cursors.

## Deliberately off Arkiv
Private keys; visitor wallet connections; reader trust pins (browser local storage); website assets; personal information. A local public fixture manifest pins the demo publisher explicitly. This is not a universal identity authority.

## Demo entity creator addresses
Publisher: `0xdbDFa0f7290e32642D1AcBc9eFae267D66Dd5458`.
Impersonator: `0xB72cD749e0b63093395512133583F2DD764aF791`.
Both are project-controlled test wallets, not reward addresses.
