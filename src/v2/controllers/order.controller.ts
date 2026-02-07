import { Request, Response, NextFunction } from 'express'
import { orderModel } from '../models/order'
import { checkoutService } from '../services/checkout.service'
import { NotFoundError } from '../errors'

export const orderController = {
  list: (_req: Request, res: Response) => {
    res.json(orderModel.findAll())
  },

  getById: (req: Request, res: Response, next: NextFunction) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const order = orderModel.findById(id)
    if (!order) return next(new NotFoundError('Order'))
    res.json(order)
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await checkoutService.execute(req.body)
      res.status(201).json(order)
    } catch (e) {
      next(e)
    }
  },
}
