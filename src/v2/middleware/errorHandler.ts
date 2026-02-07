import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors'
import { logger } from '../utils/logger'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('errorHandler', err.message, { statusCode: err.statusCode })
    }
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  logger.error('errorHandler', 'Unhandled error', { message: err.message, stack: err.stack })
  res.status(500).json({ error: 'Internal server error' })
}
