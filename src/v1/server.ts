import express from 'express'
import cors from 'cors'
import http from 'http'
import { ENV } from './config'
import healthRouter from './routes/health'
import productsRouter from './routes/products'
import ordersRouter from './routes/orders'
import webhookRouter from './routes/muralWebhook'

let server: http.Server | null = null

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use('/health', healthRouter)
  app.use('/products', productsRouter)
  app.use('/orders', ordersRouter)
  app.use('/mural-webhook', webhookRouter)
  return app
}

export function startServer(port?: number): Promise<void> {
  return new Promise(resolve => {
    const p = port || ENV.PORT
    const app = createApp()
    server = app.listen(p, () => {
      console.log(`v1 server on port ${p}`)
      resolve()
    })
  })
}

export function stopServer(): Promise<void> {
  return new Promise(resolve => {
    if (server) server.close(() => resolve())
    else resolve()
  })
}
