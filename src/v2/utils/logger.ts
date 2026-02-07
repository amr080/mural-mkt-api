type Level = 'info' | 'warn' | 'error' | 'debug'

function emit(level: Level, context: string, message: string, data?: Record<string, any>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...data,
  }
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  info: (ctx: string, msg: string, data?: Record<string, any>) => emit('info', ctx, msg, data),
  warn: (ctx: string, msg: string, data?: Record<string, any>) => emit('warn', ctx, msg, data),
  error: (ctx: string, msg: string, data?: Record<string, any>) => emit('error', ctx, msg, data),
  debug: (ctx: string, msg: string, data?: Record<string, any>) => emit('debug', ctx, msg, data),
}
