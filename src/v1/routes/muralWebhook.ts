import { Router, Request, Response } from 'express'
import { store } from '../store'
import { muralClient } from '../muralClient'
import { AccountCreditedPayload } from '../types'

const router = Router()

// Hardcoded COP bank details for auto-conversion (staging/test)
const COP_RECIPIENT = {
  payoutDetails: {
    type: 'fiat',
    bankName: 'Bancolombia',
    bankAccountOwner: 'Merchant Test',
    fiatAndRailDetails: {
      type: 'cop', symbol: 'COP',
      phoneNumber: '+573001234567',
      accountType: 'SAVINGS',
      bankAccountNumber: '12345678901234',
      documentNumber: '1234567890',
      documentType: 'NATIONAL_ID',
    },
  },
  recipientInfo: {
    type: 'individual',
    firstName: 'Test', lastName: 'Merchant',
    email: 'test@merchant.co',
    physicalAddress: {
      address1: 'Calle 100', country: 'CO',
      state: 'DC', city: 'Bogota', zip: '110111',
    },
  },
}

/** Best-effort: create + execute USDC→COP payout after payment detected */
async function autoConvert(orderId: string, amount: number): Promise<void> {
  try {
    const accounts = await muralClient.getAccounts()
    const acct = accounts.find(a => a.status === 'ACTIVE' && a.isApiEnabled)
    if (!acct) { console.log('[convert] no API-enabled account'); return }

    const payout = await muralClient.createPayout({
      sourceAccountId: acct.id,
      payouts: [{ amount: { tokenAmount: amount, tokenSymbol: 'USDC' }, ...COP_RECIPIENT }],
    })
    console.log(`[convert] payout created: ${payout.id}`)

    await muralClient.executePayout(payout.id)
    console.log(`[convert] payout executed: ${payout.id}`)

    store.updateOrder(orderId, { payoutId: payout.id })
  } catch (e: any) {
    console.log(`[convert] auto-conversion failed: ${e.message}`)
  }
}

router.post('/', async (req: Request, res: Response) => {
  const body = req.body

  // Unwrap Mural event wrapper if present
  const payload: AccountCreditedPayload =
    body.payload ? body.payload : body

  const txHash = payload.transactionDetails?.transactionHash
  if (!txHash) {
    return res.json({ received: true, matched: false, reason: 'no_txHash' })
  }

  if (store.hasProcessedTx(txHash)) {
    return res.json({ received: true, matched: false, reason: 'duplicate' })
  }

  if (payload.type !== 'account_credited') {
    return res.json({ received: true, matched: false, reason: 'wrong_type' })
  }

  const symbol = payload.tokenAmount?.tokenSymbol
  if (symbol !== 'USDC') {
    return res.json({ received: true, matched: false, reason: 'wrong_token' })
  }

  // Match: first pending order with exact amount + deposit address
  const amount = payload.tokenAmount.tokenAmount
  const depositAddr = payload.accountWalletAddress?.toLowerCase()

  const match = store.getOrders().find(o =>
    o.status === 'pending' &&
    o.total === amount &&
    o.depositAddress.toLowerCase() === depositAddr
  )

  if (!match) {
    return res.json({ received: true, matched: false, reason: 'no_match' })
  }

  store.updateOrder(match.id, {
    status: 'paid',
    txHash,
    paidAt: payload.transactionDetails?.transactionDate || new Date().toISOString(),
  })
  store.markTxProcessed(txHash)
  console.log(`[webhook] ${match.id} → paid (tx: ${txHash.slice(0, 10)}...)`)

  // Auto-convert USDC → COP (best-effort, doesn't block webhook response on failure)
  await autoConvert(match.id, match.total)

  res.json({ received: true, matched: true, orderId: match.id })
})

export default router
