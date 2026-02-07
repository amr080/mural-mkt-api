import { AppError } from './AppError'

export { AppError }

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, detail: string) {
    super(`${service}: ${detail}`, 502, false)
  }
}
