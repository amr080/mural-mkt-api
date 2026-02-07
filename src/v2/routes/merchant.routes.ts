import { Router } from 'express'
import { merchantController } from '../controllers/merchant.controller'
import { validate } from '../middleware/validate'
import { validateCreateMerchant, validateUpdateMerchant } from '../utils/dto'

const router = Router()

router.get('/', merchantController.list)
router.get('/:id', merchantController.getById)
router.post('/', validate(validateCreateMerchant), merchantController.create)
router.patch('/:id', validate(validateUpdateMerchant), merchantController.update)

export default router
