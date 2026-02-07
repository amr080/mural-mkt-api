import { Request, Response, NextFunction } from 'express'

const cache = new Map<string, { statusCode: number; body: any }>()

export function idempotency(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'POST') return next()

  const key = req.headers['idempotency-key'] as string | undefined
  if (!key) return next()

  const cached = cache.get(key)
  if (cached) {
    res.status(cached.statusCode).json(cached.body)
    return
  }

  const originalJson = res.json.bind(res)
  res.json = function (body: any) {
    cache.set(key, { statusCode: res.statusCode, body })
    return originalJson(body)
  }

  next()
}
