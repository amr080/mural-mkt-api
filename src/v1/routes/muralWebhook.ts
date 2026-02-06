import { Router, Request, Response } from 'express'
import { store } from '../store'
import { MuralWebhookEvent, AccountCreditedPayload } from '../types'

const router = Router()

router.post('/', (req: Request, res: Response) => {
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
  res.json({ received: true, matched: true, orderId: match.id })
})

export default router
