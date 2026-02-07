import { Router } from 'express'
import { webhookController } from '../controllers/webhook.controller'
import { webhookAuth } from '../middleware/webhookAuth'

const router = Router()

router.post('/', webhookAuth, webhookController.receive)

export default router
