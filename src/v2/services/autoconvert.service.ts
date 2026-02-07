import { muralService } from './mural.service'
import { orderModel, Order } from '../models/order'
import { Merchant } from '../models/merchant'
import { logger } from '../utils/logger'

export const autoconvertService = {
  execute: async (order: Order, merchant: Merchant): Promise<void> => {
    try {
      const payout = await muralService.createPayout({
        sourceAccountId: merchant.muralAccountId,
        payouts: [{
          amount: { tokenAmount: order.total, tokenSymbol: order.tokenSymbol },
          payoutDetails: {
            type: 'fiat',
            ...merchant.bankDetails,
          },
          recipientInfo: merchant.recipientInfo,
        }],
      })

      logger.info('autoconvert', 'payout created', { payoutId: payout.id, orderId: order.id })

      await muralService.executePayout(payout.id)
      logger.info('autoconvert', 'payout executed', { payoutId: payout.id })

      orderModel.update(order.id, { status: 'converting', payoutId: payout.id })
    } catch (e: any) {
      logger.error('autoconvert', 'failed', { orderId: order.id, error: e.message })
    }
  },
}
