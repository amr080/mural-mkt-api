import express from 'express'
import cors from 'cors'
import { createV2Router } from './routes'
import { idempotency } from './middleware/idempotency'
import { errorHandler } from './middleware/errorHandler'

export function createV2App() {
  const app = express.Router()

  app.use(cors())
  app.use(express.json())
  app.use(idempotency)
  app.use(createV2Router())
  app.use(errorHandler)

  return app
}
