# mkt-api

USDC marketplace backend on [Mural Pay](https://muralpay.com) sandbox. Customers pay in USDC on Polygon; merchant receives COP to a Colombian bank account.

**Live:** https://mural-mkt-api.vercel.app

---

## Setup

```bash
npm install
npm run dev   # localhost:3003
```

Environment variables (set in Vercel dashboard for production):

```
MURAL_API_KEY=...
MURAL_TRANSFER_API_KEY=...
MURAL_BASE_URL=https://api-staging.muralpay.com
```

## Endpoints

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/health` | Health check |
| 2 | GET | `/products` | Product catalog |
| 3 | GET | `/products/:id` | Single product |
| 4 | POST | `/orders` | Create checkout order |
| 5 | GET | `/orders` | List all orders (merchant) |
| 6 | GET | `/orders/:id` | Order status + payment proof |
| 7 | POST | `/mural-webhook` | Receive Mural payment events, auto-convert to COP |
| 8 | GET | `/payouts` | List COP withdrawals (merchant) |
| 9 | GET | `/payouts/:id` | COP withdrawal status |

## Smoke Test

```bash
npm run curl                                        # against Vercel
CURL_BASE_URL=http://localhost:3003 npm run curl    # against local
```

Runs every endpoint in sequence: browse catalog → checkout → simulate payment → verify paid → check withdrawals.

## cURL Walkthrough

**1. Browse catalog**
```bash
curl https://mural-mkt-api.vercel.app/products
```

**2. Checkout**
```bash
curl -X POST https://mural-mkt-api.vercel.app/orders -H "Content-Type: application/json" -d "{\"productId\":\"prod_001\",\"quantity\":1,\"customerWallet\":\"0xCUST\"}"
```
Returns `{id, status:"pending", depositAddress, total}`. Customer sends `total` USDC to `depositAddress` on Polygon (outside the app).

**3. Mural detects payment → webhook**
```bash
curl -X POST https://mural-mkt-api.vercel.app/mural-webhook -H "Content-Type: application/json" -d "{\"type\":\"account_credited\",\"accountId\":\"test\",\"organizationId\":\"test\",\"transactionId\":\"test-001\",\"accountWalletAddress\":\"DEPOSIT_ADDRESS_HERE\",\"tokenAmount\":{\"blockchain\":\"POLYGON\",\"tokenAmount\":10,\"tokenSymbol\":\"USDC\",\"tokenContractAddress\":\"0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582\"},\"transactionDetails\":{\"blockchain\":\"POLYGON\",\"transactionDate\":\"2026-02-06T00:00:00Z\",\"transactionHash\":\"0xabc123\",\"sourceWalletAddress\":\"0xCUST\",\"destinationWalletAddress\":\"DEPOSIT_ADDRESS_HERE\"}}"
```
Matches by `tokenAmount` + `depositAddress`. Marks order `paid`. Auto-triggers USDC→COP payout via Mural.

**4. Verify payment**
```bash
curl https://mural-mkt-api.vercel.app/orders/ORDER_ID
```

**5. Check COP withdrawal status**
```bash
curl https://mural-mkt-api.vercel.app/payouts
curl https://mural-mkt-api.vercel.app/payouts/PAYOUT_ID
```

## Flow of Funds

```
Customer Wallet (USDC on Polygon)
        │  send USDC to deposit address (on-chain, outside app)
        ▼
Mural Merchant Wallet
        │  Mural webhook → order marked paid
        │  auto-convert USDC → COP via Mural Payout API
        ▼
Colombian Bank Account (Bancolombia)
```

## Data Flow

```
Customer                    mkt-api                     Mural Pay
   │                            │                            │
   │── GET /products ──────────>│                            │
   │<── catalog                 │                            │
   │                            │                            │
   │── POST /orders ──────────>│── GET /api/accounts ──────>│
   │<── {pending, depositAddr}  │<── {walletAddress}         │
   │                            │                            │
   │── USDC.transfer ──────────────────(on-chain)───────────>│
   │                            │                            │
   │                            │<── POST /mural-webhook ────│
   │                            │    match order → paid      │
   │                            │── POST /payouts/payout ───>│  create COP payout
   │                            │── POST /payouts/.../exec ─>│  execute
   │                            │── GET  /payouts/... ──────>│  poll status
   │                            │                            │
   │── GET /orders/:id ────────>│                            │
   │<── {paid, txHash, payoutId}│                            │
   │                            │                            │
   │── GET /payouts/:id ──────>│── GET /payouts/payout/:id >│
   │<── {EXECUTED, COP amount}  │<── live status             │
```

## Architecture

```
src/v1/
├── server.ts         Express app, mounts routes
├── config.ts         ENV lazy getters
├── muralClient.ts    Mural API wrapper (accounts, webhooks, payouts)
├── store.ts          In-memory Maps (products, orders, processed txs)
├── types.ts          TypeScript interfaces
├── rates.json        Static USDC/COP rate
└── routes/
    ├── health.ts
    ├── products.ts       GET /products, GET /products/:id
    ├── orders.ts         POST /orders, GET /orders, GET /orders/:id
    ├── muralWebhook.ts   POST /mural-webhook + auto USDC→COP conversion
    └── payouts.ts        GET /payouts, GET /payouts/:id (proxies Mural)
```

No classes. Functional modules: `store` (data), `muralClient` (Mural API), route files (handlers).

## Deposit Matching Pitfalls

The webhook matches incoming deposits to pending orders by **exact amount + deposit address**. Known issues:

1. **Ambiguous amounts** — two orders for the same amount to the same deposit address are indistinguishable. First-match wins. Production fix: unique deposit address per order (Mural sub-accounts) or embed order ID in memo field.
2. **Floating point** — USDC amounts compared with `===`. Edge case: `10.00` vs `10.000000`. Production fix: compare at smallest unit (6 decimals for USDC).
3. **Single deposit address** — all orders share one Mural wallet. A deposit that doesn't match any order amount is lost revenue. Production fix: per-order deposit addresses.
4. **Race condition** — if two webhooks fire simultaneously for similar amounts, both could match the same order before either marks it paid. Production fix: database transaction with row-level locking.
5. **No expiry** — pending orders never expire. Stale orders could accidentally match future deposits. Production fix: TTL on pending orders.

## Current Status

**Working:**
- Product catalog (GET /products, GET /products/:id)
- Order creation with Mural deposit address (POST /orders)
- Webhook payment detection with idempotency (POST /mural-webhook)
- Order status verification (GET /orders, GET /orders/:id)
- Auto USDC→COP conversion on payment (fires from webhook handler)
- COP withdrawal status (GET /payouts, GET /payouts/:id)
- Deployed on Vercel — all endpoints curl-able
- OpenAPI spec (openapi.json)
- Smoke test script (`npm run curl`)
- End-to-end script with real on-chain USDC + Mural webhooks (`npm run mural-sandbox`)

**Limitations:**
- In-memory storage — resets on Vercel cold start
- Auto-conversion uses hardcoded Colombian bank details (staging test values)
- No auth on endpoints

## Future Work

- **PostgreSQL** — persist orders, payout IDs across deploys
- **Per-order deposit addresses** — eliminate amount-matching ambiguity
- **Auth middleware** — API key or JWT on merchant endpoints
- **Order expiry** — TTL on pending orders to prevent stale matches
- **Retry queue** — if auto-conversion fails, retry with exponential backoff
- **Webhook signature verification** — validate Mural webhook signatures
- **Configurable bank details** — merchant sets COP recipient via API
- **Rate display** — show estimated COP amount at checkout using rates.json
- **Error handling middleware** — structured error responses
- **Logging** — structured logs with request IDs
