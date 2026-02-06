/** Lazy getters — reads process.env at access time, not import time.
 *  Entry-point must call dotenv.config() before first access. */
export const ENV = {
  get PORT() { return Number(process.env.PORT) || 3001 },
  get MURAL_API_KEY() { return process.env.MURAL_API_KEY || '' },
  get MURAL_TRANSFER_API_KEY() { return process.env.MURAL_TRANSFER_API_KEY || '' },
  get MURAL_BASE_URL() { return process.env.MURAL_BASE_URL || 'https://api-staging.muralpay.com' },
  get CUSTOMER_PRIVATE_KEY() { return process.env.CUSTOMER_PRIVATE_KEY || '' },
  get POLYGON_AMOY_RPC_URL() { return process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology' },
  get USDC_ADDRESS() { return process.env.USDC_POLYGON_AMOY_ADDRESS || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' },
}
