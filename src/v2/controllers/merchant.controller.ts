import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { merchantModel } from '../models/merchant'
import { NotFoundError } from '../errors'

export const merchantController = {
  list: (_req: Request, res: Response) => {
    res.json(merchantModel.findAll())
  },

  getById: (req: Request, res: Response, next: NextFunction) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const merchant = merchantModel.findById(id)
    if (!merchant) return next(new NotFoundError('Merchant'))
    res.json(merchant)
  },

  create: (req: Request, res: Response) => {
    const merchant = merchantModel.create({
      id: `mch_${randomUUID()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    })
    res.status(201).json(merchant)
  },

  update: (req: Request, res: Response, next: NextFunction) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const updated = merchantModel.update(id, req.body)
    if (!updated) return next(new NotFoundError('Merchant'))
    res.json(updated)
  },
}
