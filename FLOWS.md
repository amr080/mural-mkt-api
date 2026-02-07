
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