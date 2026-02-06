import express from 'express'
import cors from 'cors'
import http from 'http'
import { ENV } from './config'
import healthRouter from './routes/health'

let server: http.Server | null = null

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use('/health', healthRouter)

  // Route groups
  try { app.use('/products', require('./routes/products').default) } catch (e) { console.error('[mount] products failed:', e) }
  try { app.use('/orders', require('./routes/orders').default) } catch (e) { console.error('[mount] orders failed:', e) }
  try { app.use('/mural-webhook', require('./routes/muralWebhook').default) } catch (e) { console.error('[mount] mural-webhook failed:', e) }
  try { app.use('/payouts', require('./routes/payouts').default) } catch (e) { console.error('[mount] payouts failed:', e) }

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

if (require.main === module) {
  startServer()
}
