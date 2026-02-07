import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../errors'

type Validator = (body: any) => { error?: string; data?: any }

export function validate(validator: Validator) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = validator(req.body)
    if (result.error) {
      return next(new ValidationError(result.error))
    }
    req.body = result.data
    next()
  }
}
