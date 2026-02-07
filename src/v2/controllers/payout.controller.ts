import { Request, Response, NextFunction } from 'express'
import { muralService } from '../services/mural.service'

export const payoutController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await muralService.searchPayouts()
      res.json(data)
    } catch (e) {
      next(e)
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const data = await muralService.getPayout(id)
      res.json(data)
    } catch (e) {
      next(e)
    }
  },
}
