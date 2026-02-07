import { hasToken } from '../config/tokens'
import { orderModel } from '../models/order'
import { merchantModel } from '../models/merchant'
import { autoconvertService } from './autoconvert.service'
import { ConflictError, ValidationError } from '../errors'
import { logger } from '../utils/logger'

interface DetectionResult {
  received: boolean
  matched: boolean
  reason?: string
  orderId?: string
}

export const detectionService = {
  process: async (body: any): Promise<DetectionResult> => {
    const payload = body.payload ? body.payload : body

    const txHash = payload.transactionDetails?.transactionHash
    if (!txHash) {
      return { received: true, matched: false, reason: 'no_txHash' }
    }

    if (orderModel.hasTx(txHash)) {
      return { received: true, matched: false, reason: 'duplicate' }
    }

    if (payload.type !== 'account_credited') {
      return { received: true, matched: false, reason: 'wrong_type' }
    }

    const symbol = payload.tokenAmount?.tokenSymbol
    if (!hasToken(symbol)) {
      return { received: true, matched: false, reason: 'unsupported_token' }
    }

    const amount = payload.tokenAmount.tokenAmount
    const depositAddr = payload.accountWalletAddress?.toLowerCase()

    const match = orderModel.findPendingMatch(amount, depositAddr)
    if (!match) {
      return { received: true, matched: false, reason: 'no_match' }
    }

    orderModel.update(match.id, {
      status: 'paid',
      txHash,
      paidAt: payload.transactionDetails?.transactionDate || new Date().toISOString(),
    })
    orderModel.markTx(txHash)
    logger.info('detection', 'order paid', { orderId: match.id, txHash: txHash.slice(0, 10) })

    const merchant = merchantModel.findById(match.merchantId)
    if (merchant?.autoConvert) {
      autoconvertService.execute(match, merchant)
    }

    return { received: true, matched: true, orderId: match.id }
  },
}
