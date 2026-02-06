import { Router, Request, Response } from 'express'
import { muralClient } from '../muralClient'

const router = Router()

/** GET /payouts — list all COP withdrawals from Mural */
router.get('/', async (_: Request, res: Response) => {
  try {
    const data = await muralClient.searchPayouts()
    res.json(data)
  } catch (e: any) {
    res.status(502).json({ error: e.message })
  }
})

/** GET /payouts/:id — live payout status from Mural */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  try {
    const data = await muralClient.getPayout(id)
    res.json(data)
  } catch (e: any) {
    res.status(502).json({ error: e.message })
  }
})

export default router
