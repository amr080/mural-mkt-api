import { Request, Response, NextFunction } from 'express'
import { detectionService } from '../services/detection.service'

export const webhookController = {
  receive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await detectionService.process(req.body)
      res.json(result)
    } catch (e) {
      next(e)
    }
  },
}
