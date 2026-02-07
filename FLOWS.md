
<details>
<summary>USDC CHECKOUT + AUTOCONVERT</summary>

1. get Mural wallet address
2. register webhook URL
3. activate webhook
4. Customer USDC -> Mural wallet
5. deposit detected
6. create fiat payout
7. execute payout
8. poll payout status

</details>

<details>
<summary>USDC CHECKOUT + NO AUTOCONVERT</summary>

1. get Mural wallet address
2. register webhook URL
3. activate webhook
4. Customer USDC -> Mural wallet
5. deposit detected

</details>


<details>
<summary>MURALUSD CHECKOUT + AUTOCONVERT</summary>

1. get deposit address
2. Customer MURALUSD -> Mural wallet
3. webhook deposit detected
4. create fiat payout
5. burn MURAL from Mural wallet

</details>

<details>
<summary>FLOW OF FUNDS</summary>

1. customer sends USDC to merchant wallet
2. merchant wallet sends USDC to mural wallet
3. mural redeems USDC for USD
4. mural converts USD to COP
5. mural sends COP to merchant bank acc

</details>

<details>
<summary>COUNTERPARTIES</summary>

1. MURALUSD 0x9b38E33624e605Ff66B406D18cbB59ad56B4409f
2. USDC 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
3. customer wallet 0x6814140639126717db4fa368Ef3258695edA7F65
4. mural wallet 0xf42B20b8d3AF4Fda5E60ECCbef926964383CCEAF
5. admin 0x2f572059DbC598C8acfeA4AF06FE4f7669D1b3b1

</details>

<details>
<summary>MERCHANT ENDPOINTS</summary>

1. POST /merchants
2. PATCH /merchants/:id
3. GET /merchants/:id
4. GET /orders
5. GET /orders/:id
6. GET /payouts
7. GET /payouts/:id

<br>

| Endpoint             | Description                                 |
| -------------------- | ------------------------------------------- |
| POST /merchants      | Register merchant                           |
| PATCH /merchants/:id | Update settings (autoConvert, bank details) |
| GET /merchants/:id   | View merchant                               |
| GET /orders          | List all orders                             |
| GET /orders/:id      | Check order status                          |
| GET /payouts         | List payouts                                |
| GET /payouts/:id     | Check payout status                         |

<br>

1. register merchant
2. update settings (autoConvert, bank details)
3. view merchant
4. list all orders
5. check order status
6. list payouts
7. check payout status

</details>



<details>
<summary>API ENDPOINTS</summary>

MERCHANT

```
POST /merchants             register merchant
PATCH /merchants/:id        update settings (autoConvert, bank details)
GET /merchants/:id          view merchant
GET /orders                 list all orders
GET /orders/:id             check order status
GET /payouts                list payouts
GET /payouts/:id            check payout status
```

CUSTOMER

```
1. GET /products            browse catalog
2. GET /products/:id        view product detail
3. POST /orders             create order, returns depositAddress
5. GET /orders/:id          poll order status
```

SYSTEM

```
POST /webhook               receives Mural account_credited events
GET /health                 health check
GET /addresses              contract + wallet addresses
```
</details>

<details>
<summary>CHECKOUT FLOW</summary>

1. Browse catalog via GET /products 
2. Create order via POST /orders  
3. Send stablecoins
4. poll order status via GET /orders/:id 

</details>

<details>
<summary>USDC CHECKOUT + PAYOUT</summary>

1. Get Mural account wallet address
2. Register webhook for deposit notifications
3. Customer sends 2 USDC to Mural wallet
4. Mural detects deposit, sends account_credited webhook
5. Detection service matches payment to order
6. Order marked paid
7. AutoConvert creates payout (2 USDC → COP)
8. Mural executes payout
9. Payout status: PENDING → EXECUTED
10. COP sent to merchant bank account

</details>



<details>
<summary>PAYOUT API SEQUENCE</summary>

1. POST /api/payouts/payout: create payout with sourceAccountId, amount, bank details
2. POST /api/payouts/payout/:id/execute: execute with transfer-api-key header
3. GET /api/payouts/payout/:id: poll until EXECUTED

</details>

<details>
<summary>PAYOUT REQUEST DATA</summary>

```
sourceAccountId: 13c0bfd0-98ba-4f3c-b845-64efcbf65e6c
amount: 2 USDC
destination: Bancolombia SAVINGS account (COP)
recipient: Test Merchant, Bogota, CO
```

</details>


<details>
<summary>USDC CHECKOUT + COP PAYOUT FLOW OF FUNDS</summary>

1. Customer USDC → Mural wallet
2. Mural holds USDC in custody
3. Mural redeems USDC for USD
4. Mural converts USD to COP
5. Mural wires COP to merchant bank account

</details>









