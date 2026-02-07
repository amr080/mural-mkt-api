# CLAUDE.md

## 1. Repo Files + Logic

Monorepo: Express backend (`src/v1/`) + React SPA (`web/`). Deployed on Vercel.

```
src/v1/
  server.ts         Express app factory, mounts routes at / and /api
  config.ts         Lazy ENV getters (MURAL_API_KEY, MURAL_TRANSFER_API_KEY, MURAL_BASE_URL, RPC, USDC addr)
  muralClient.ts    Mural Pay REST wrapper (accounts, webhooks, transactions, payouts)
  store.ts          In-memory Maps: products (4 hardcoded USDC items), orders, processed tx hashes
  types.ts          TS interfaces (Order, Product, MuralAccount, webhook payloads)
  rates.json        Static USDC/COP rate (~3490)
  routes/
    health.ts       GET /health
    products.ts     GET /products, GET /products/:id
    orders.ts       POST /orders (create pending + fetch deposit addr), GET /orders, GET /orders/:id
    muralWebhook.ts POST /mural-webhook (match payment, mark paid, auto-convert USDC->COP)
    payouts.ts      GET /payouts, GET /payouts/:id (proxy to Mural)

web/                React 18 + Vite + BlueprintJS
  pages/            Products, Checkout, OrderStatus, Merchant dashboard
  api/client.ts     Fetch wrapper -> /api/*
  __tests__/        Vitest + RTL + MSW (20 tests, frontend only)

api/index.ts        Vercel serverless entry
vercel.json         Rewrites /api/* -> function, /* -> SPA
openapi.json        OpenAPI 3.0 spec
```

No database. No auth. No CI. No Docker. In-memory store resets on cold start.

## 2. Mural Sandbox API Functionality

Mural Pay sandbox (`api-staging.muralpay.com`) provides:

- **Accounts**: `GET/POST /api/accounts` - merchant wallets on Polygon Amoy with USDC deposit addresses
- **Webhooks**: `POST/PATCH/DELETE /api/webhooks` - subscribe to `account_credited` events when USDC arrives
- **Transactions**: `POST /api/transactions/search/account/:id`, `GET /api/transactions/:id`
- **Payouts (core)**:
  - `GET /api/payouts/bank-details?fiatCurrencyAndRail=cop` - required bank fields
  - `POST /api/payouts/fees/token-to-fiat` - fee estimation
  - `POST /api/payouts/payout` - create USDC->fiat payout request (specify source account, amount, recipient bank)
  - `POST /api/payouts/payout/:id/execute` - execute with `transfer-api-key` header, `exchangeRateToleranceMode: FLEXIBLE`
  - `GET /api/payouts/payout/:id` - status: AWAITING_EXECUTION -> PENDING -> EXECUTED | FAILED
  - `POST /api/payouts/search` - list all payouts

Auth: `Bearer <MURAL_API_KEY>` on all calls. Payout execution additionally requires `transfer-api-key` header.

## 3. Onchain Software Sequences

```
1. Customer has USDC in wallet on Polygon Amoy
2. POST /orders -> returns depositAddress (Mural merchant wallet on Polygon)
3. Customer sends USDC.transfer(depositAddress, total) on-chain (outside app)
4. Polygon processes ERC-20 transfer, emits Transfer event
5. Mural indexer detects deposit, fires account_credited webhook to /mural-webhook
6. Webhook handler reads txHash from payload, verifies USDC token symbol
```

Onchain touchpoints: single USDC transfer on Polygon Amoy. Contract: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`. App never submits transactions itself - customer sends externally, Mural detects.

## 4. Offchain Software Sequences

```
Checkout Pipeline:
  validate(productId, quantity, wallet) -> muralClient.getAccounts() -> cache depositAddress -> store.createOrder(pending) -> respond

Detection Pipeline:
  POST /mural-webhook -> unwrap payload -> check txHash exists -> dedupe(store.hasProcessedTx) -> verify type=account_credited & symbol=USDC -> match(amount + depositAddress) -> store.updateOrder(paid, txHash, paidAt) -> store.markTxProcessed

Conversion Pipeline (best-effort, non-blocking):
  muralClient.getAccounts() -> find ACTIVE+isApiEnabled -> muralClient.createPayout({sourceAccountId, amount, COP_RECIPIENT}) -> muralClient.executePayout(id) -> store.updateOrder({payoutId})

Query Pipeline:
  GET /orders/:id -> store lookup (status, txHash, payoutId)
  GET /payouts/:id -> muralClient.getPayout(id) -> proxy response
```

All offchain. No DB transactions. In-memory only. Single-threaded matching (race condition possible).

## 5. FE -> Mural API -> Onchain

```
FE (React)              Backend (Express)           Mural Pay API              Polygon Amoy
    |                        |                           |                         |
    |-- GET /api/products -->|                           |                         |
    |<-- product catalog     |                           |                         |
    |                        |                           |                         |
    |-- POST /api/orders --->|-- GET /api/accounts ----->|                         |
    |   {productId,qty,wallet}|<-- [{walletAddress}]     |                         |
    |<-- {pending,           |                           |                         |
    |     depositAddress,    |                           |                         |
    |     total}             |                           |                         |
    |                        |                           |                         |
    |                        |                    [Customer sends USDC on-chain] -->|
    |                        |                           |                         |
    |                        |<-- webhook: account_credited (txHash, amount, addr) |
    |                        |   match order -> mark paid|                         |
    |                        |-- POST /payouts/payout -->|  create USDC->COP       |
    |                        |-- POST /payouts/:id/exec->|  execute conversion     |
    |                        |<-- {payoutId}             |                         |
    |                        |                           |                         |
    |-- GET /api/orders/:id->|                           |                         |
    |<-- {paid, txHash,      |                           |                         |
    |     payoutId}          |                           |                         |
    |                        |                           |                         |
    |-- GET /api/payouts --->|-- POST /payouts/search -->|                         |
    |<-- [{EXECUTED, COP}]   |<-- payout list            |                         |
```

FE never talks to Mural or chain directly. Backend is the sole bridge. FE polls order status every 5s until paid.

## Build & Test

```bash
npm install && npm run dev          # backend on :3003
cd web && npm install && npm run dev # frontend on :5173
cd web && npm test                   # 20 frontend tests
npm run curl                         # smoke test all endpoints
```

## Known Limitations

- In-memory store (no persistence)
- Single shared deposit address (ambiguous matching)
- No auth, no webhook signature verification
- Hardcoded COP test bank details
- No order expiry TTL
- Floating-point amount comparison
