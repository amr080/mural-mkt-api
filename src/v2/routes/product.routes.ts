import { Router } from 'express'
import { productController } from '../controllers/product.controller'

const router = Router()

router.get('/', productController.list)
router.get('/:id', productController.getById)

export default router
