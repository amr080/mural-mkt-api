import { Router } from 'express'
import { orderController } from '../controllers/order.controller'
import { validate } from '../middleware/validate'
import { validateCreateOrder } from '../utils/dto'

const router = Router()

router.get('/', orderController.list)
router.get('/:id', orderController.getById)
router.post('/', validate(validateCreateOrder), orderController.create)

export default router
