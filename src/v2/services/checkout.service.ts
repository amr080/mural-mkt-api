import { randomUUID } from 'crypto'
import { getToken } from '../config/tokens'
import { muralService } from './mural.service'
import { orderModel, Order } from '../models/order'
import { productModel } from '../models/product'
import { merchantModel } from '../models/merchant'
import { NotFoundError, ValidationError } from '../errors'
import { CreateOrderDTO } from '../utils/dto'
import { logger } from '../utils/logger'

export const checkoutService = {
  execute: async (dto: CreateOrderDTO): Promise<Order> => {
    getToken(dto.tokenSymbol)

    const product = productModel.findById(dto.productId)
    if (!product) throw new NotFoundError('Product')

    const merchant = merchantModel.findById(dto.merchantId)
    if (!merchant) throw new NotFoundError('Merchant')

    let depositAddress = merchant.depositAddress
    if (!depositAddress) {
      const accounts = await muralService.getAccounts()
      const active = accounts.find((a: any) => a.status === 'ACTIVE' && a.isApiEnabled)
        || accounts.find((a: any) => a.status === 'ACTIVE')
      if (!active?.accountDetails?.walletDetails?.walletAddress) {
        throw new ValidationError('No active Mural account with wallet')
      }
      depositAddress = active.accountDetails.walletDetails.walletAddress
    }

    const order: Order = {
      id: `ord_${randomUUID()}`,
      merchantId: dto.merchantId,
      productId: dto.productId,
      quantity: dto.quantity,
      total: product.price * dto.quantity,
      tokenSymbol: dto.tokenSymbol,
      status: 'pending',
      customerWallet: dto.customerWallet,
      depositAddress,
      createdAt: new Date().toISOString(),
    }

    orderModel.create(order)
    logger.info('checkout', 'order created', { orderId: order.id, token: dto.tokenSymbol })
    return order
  },
}
