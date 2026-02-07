import { ENV } from './env'
import { TokenConfig } from '../models/token'
import MURALUSD_ABI from '../../../abi/MURALUSD.json'

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

const TOKENS: Record<string, TokenConfig> = {
  USDC: {
    symbol: 'USDC',
    address: ENV.USDC_ADDRESS,
    abi: ERC20_ABI,
    decimals: 6,
    supportsPermit: false,
    supportsRebase: false,
  },
  MURALUSD: {
    symbol: 'MURALUSD',
    address: ENV.MURALUSD_ADDRESS,
    abi: MURALUSD_ABI,
    decimals: 18,
    supportsPermit: true,
    supportsRebase: true,
  },
}

export function getToken(symbol: string): TokenConfig {
  const config = TOKENS[symbol]
  if (!config) throw new Error(`Unsupported token: ${symbol}`)
  return config
}

export function hasToken(symbol: string): boolean {
  return symbol in TOKENS
}

export function allTokens(): TokenConfig[] {
  return Object.values(TOKENS)
}
