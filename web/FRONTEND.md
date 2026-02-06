# Frontend — Mural Marketplace

Vite + React 18 + TypeScript + Blueprint JS 5. SPA served as static files on Vercel alongside the Express API.

## Files

| File | Purpose |
|---|---|
| `src/api/client.ts` | Fetch wrapper; all calls go through `/api/*` |
| `src/types/index.ts` | `Product`, `Order`, `CreateOrderBody` types |
| `src/pages/Products.tsx` | Product catalog grid with "Buy Now" cards |
| `src/pages/Checkout.tsx` | Qty + wallet form → creates order → shows deposit address |
| `src/pages/OrderStatus.tsx` | Polls order every 5s; payment instructions or confirmation |
| `src/pages/Merchant.tsx` | Tabbed dashboard: orders table + payouts list |
| `src/components/ProductCard.tsx` | Card with price + buy button |
| `src/components/OrderTable.tsx` | Striped table of orders |
| `src/components/StatusTag.tsx` | Color-coded tag: pending/paid/expired |

## User Flows

### Customer: Browse → Buy → Pay

```
Products page          Checkout page              OrderStatus page
───────────           ──────────────             ─────────────────
GET /api/products ──→ GET /api/products/:id ──→  GET /api/orders/:id (poll)
                      POST /api/orders
                      ↓
                      receives depositAddress
                      ↓
                      user sends USDC on-chain
                      ↓
                      webhook marks order "paid"
                      ↓
                      OrderStatus shows confirmation
```

### Merchant: Monitor Orders + Payouts

```
Merchant page
──────────────
GET /api/orders   → orders table (status, total, date)
GET /api/payouts  → payouts table (COP conversions)
```

## Software Sequence

```
Browser
  ↓ fetch("/api/products")
Vite dev proxy (localhost:5173 → localhost:3001)  — or —  Vercel rewrite ("/api/*" → serverless fn)
  ↓
Express API (api/index.ts)
  ↓
In-memory store / Mural Pay API
```

## Local Dev

```bash
# Terminal 1: API
npm run dev          # port 3001

# Terminal 2: Frontend
cd web && npm run dev   # port 5173, proxies /api → 3001
```

## Tests

```bash
cd web && npm test   # 20 tests — Vitest + RTL + MSW
```

## Deploy (Vercel)

`vercel.json` builds the frontend (`cd web && npm install && npm run build`), serves `web/dist` as static, rewrites `/api/*` to the Express serverless function.

## .gitignore Whitelist

The repo uses an ignore-everything-then-whitelist pattern. Add these lines to `.gitignore` to track the `web/` directory:

```gitignore
# Frontend
!web/
!web/package.json
!web/package-lock.json
!web/tsconfig.json
!web/vite.config.ts
!web/index.html
!web/FRONTEND.md
!web/src/
!web/src/**
```

The `!web/src/**` glob whitelists all source files recursively. `node_modules/` and `web/dist/` stay ignored (matched by `*`). Only source + config gets pushed → Vercel runs the build.
