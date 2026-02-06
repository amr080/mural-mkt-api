import { Router, Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { store } from '../store'
import { muralClient } from '../muralClient'
import { Order } from '../types'

const router = Router()

let cachedDepositAddress: string | null = null

async function getDepositAddress(): Promise<string> {
  if (cachedDepositAddress) return cachedDepositAddress
  const accounts = await muralClient.getAccounts()
  // Prefer API-enabled account (supports payouts for full flow)
  const active = accounts.find(a => a.status === 'ACTIVE' && a.isApiEnabled)
    || accounts.find(a => a.status === 'ACTIVE')
  if (!active?.accountDetails?.walletDetails?.walletAddress) {
    throw new Error('No active Mural account with wallet')
  }
  cachedDepositAddress = active.accountDetails.walletDetails.walletAddress
  return cachedDepositAddress
}

router.get('/', (_: Request, res: Response) => {
  res.json(store.getOrders())
})

router.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const o = store.getOrder(id)
  if (!o) return res.status(404).json({ error: 'Not found' })
  res.json(o)
})

router.post('/', async (req: Request, res: Response) => {
  const { productId, quantity, customerWallet } = req.body
  if (!productId || !quantity || !customerWallet) {
    return res.status(400).json({ error: 'Missing: productId, quantity, customerWallet' })
  }
  const product = store.getProduct(productId)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const depositAddress = await getDepositAddress()

  const order: Order = {
    id: `ord_${randomUUID()}`,
    productId,
    quantity,
    total: product.price * quantity,
    status: 'pending',
    customerWallet,
    depositAddress,
    createdAt: new Date().toISOString(),
  }
  store.createOrder(order)
  res.status(201).json(order)
})

export default router
