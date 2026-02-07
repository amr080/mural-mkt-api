import { Request, Response, NextFunction } from 'express'
import { createVerify } from 'crypto'
import { logger } from '../utils/logger'

let webhookPublicKey: string | null = null

export function setWebhookPublicKey(key: string) {
  webhookPublicKey = key
}

export function webhookAuth(req: Request, _res: Response, next: NextFunction) {
  if (!webhookPublicKey) {
    logger.warn('webhookAuth', 'No public key configured, skipping verification')
    return next()
  }

  const signature = req.headers['x-signature'] as string | undefined
  if (!signature) {
    return next(new Error('Missing X-Signature header'))
  }

  try {
    const verifier = createVerify('SHA256')
    verifier.update(JSON.stringify(req.body))
    const valid = verifier.verify(webhookPublicKey, signature, 'base64')
    if (!valid) {
      return next(new Error('Invalid webhook signature'))
    }
  } catch (e: any) {
    logger.error('webhookAuth', 'Signature verification failed', { error: e.message })
    return next(new Error('Webhook signature verification error'))
  }

  next()
}
