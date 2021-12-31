![CI status](https://github.com/aud/dexcom-share-api/actions/workflows/ci.yml/badge.svg)

Lightweight JavaScript (incl. TypeScript support) wrapper for interacting with
the Dexcom private API. This API is most commonly used for extracting realtime
glucose data, as the official Dexcom API does not provide a realtime API.

Caution: In beta, use at your own risk. This is unsupported by Dexcom and may
break in the future. If this is missing support for an API that you use, please
open an issue or PR and I'll try to add support ASAP.

Usage:

```typescript
import {DexcomClient} from "dexcom-share-api";

// initialization
const client = new DexcomClient({
  username: "dexcom share username",
  password: "dexcom share password",
  // This server needs to be either "us" or "eu. If you're in the US, the server
  // should be "us". Any other country outside of the US (eg. Canada) is
  // classified as "eu" by Dexcom
  server: "eu",
});

// getAccountId()
//
// Returns the Dexcom account_id. This is needed as apart of the login flow,
// in order to generate a session. As a user, usually you wouldn't need to
// call this function directly unless you're rebuilding the login flow
// yourself.
client.getAccountId().then(console.table)
// b301bac4-4c7k-447a-a701-39e1046ab6ad

// getSessionId()
//
// Returns the Dexcom session_id for a given account. This provides a token
// that will allow access to various Dexcom APIs scoped under your account, for
// eg. reading glucose data.
client.getAccountId().then(console.table)
// 2a97d246-49e7-467b-8616-03715cec9r51

// getEstimatedGlucoseValues({minutes: 1440, maxCount: 1})
//
// Returns the latest glucose levels between a given time (expressed as
// minutes) in the past and now. By default this returns the latest entry in
// the past 24 hours. This API can accept `minutes` and `maxCount` params,
// which controls the number of entries you will be returned.

// Default of 1 entry for the past 24 hours
client.getEstimatedGlucoseValues().then(console.table)
// ┌─────────┬───────┬──────┬───────────────┬───────────────┐
// │ (index) │ mmol  │ mgdl │     trend     │   timestamp   │
// ├─────────┼───────┼──────┼───────────────┼───────────────┤
// │    0    │ 10.17 │ 183  │ 'fortyfiveup' │ 1640907228000 │
// └─────────┴───────┴──────┴───────────────┴───────────────┘

client.getEstimatedGlucoseValues({maxCount: 2, minutes: 60}).then(console.table)
// ┌─────────┬───────┬──────┬───────────────┬───────────────┐
// │ (index) │ mmol  │ mgdl │     trend     │   timestamp   │
// ├─────────┼───────┼──────┼───────────────┼───────────────┤
// │    0    │ 10.17 │ 183  │ 'fortyfiveup' │ 1640907228000 │
// │    1    │ 9.61  │ 173  │    'flat'     │ 1640906927000 │
// └─────────┴───────┴──────┴───────────────┴───────────────┘
```
