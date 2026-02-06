import { Router } from 'express'
import { store } from '../store'

const router = Router()

router.get('/', (_, res) => res.json(store.getProducts()))

router.get('/:id', (req, res) => {
  const p = store.getProduct(req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})

export default router
