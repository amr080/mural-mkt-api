import { Request, Response } from 'express'

export const healthController = {
  getHealth: (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
  },
}
