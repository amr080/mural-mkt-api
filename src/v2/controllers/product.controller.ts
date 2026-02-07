import { Request, Response, NextFunction } from 'express'
import { productModel } from '../models/product'
import { NotFoundError } from '../errors'

export const productController = {
  list: (_req: Request, res: Response) => {
    res.json(productModel.findAll())
  },

  getById: (req: Request, res: Response, next: NextFunction) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const product = productModel.findById(id)
    if (!product) return next(new NotFoundError('Product'))
    res.json(product)
  },
}
