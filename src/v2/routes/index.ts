import { Router } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import healthRoutes from './health.routes'
import productRoutes from './product.routes'
import orderRoutes from './order.routes'
import merchantRoutes from './merchant.routes'
import webhookRoutes from './webhook.routes'
import payoutRoutes from './payout.routes'

export function createV2Router(): Router {
  const router = Router()

  router.use('/health', healthRoutes)
  router.use('/products', productRoutes)
  router.use('/orders', orderRoutes)
  router.use('/merchants', merchantRoutes)
  router.use('/webhook', webhookRoutes)
  router.use('/payouts', payoutRoutes)

  router.get('/addresses', (_req, res) => {
    const filePath = path.join(__dirname, '../../../addresses.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.json(data)
  })

  return router
}
