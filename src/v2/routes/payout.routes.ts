import { Router } from 'express'
import { payoutController } from '../controllers/payout.controller'

const router = Router()

router.get('/', payoutController.list)
router.get('/:id', payoutController.getById)

export default router
