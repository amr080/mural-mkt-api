import { blockchainService } from './blockchain.service'
import { logger } from '../utils/logger'

const SYMBOL = 'MURALUSD'

export const muralusdService = {
  rewardMultiplier: async (): Promise<bigint> => {
    const contract = blockchainService.getContract(SYMBOL)
    return contract.rewardMultiplier()
  },

  convertToDollars: async (shares: bigint): Promise<bigint> => {
    const contract = blockchainService.getContract(SYMBOL)
    return contract.convertToDollars(shares)
  },

  convertToTokens: async (dollars: bigint): Promise<bigint> => {
    const contract = blockchainService.getContract(SYMBOL)
    return contract.convertToTokens(dollars)
  },

  sharesOf: async (account: string): Promise<bigint> => {
    const contract = blockchainService.getContract(SYMBOL)
    return contract.sharesOf(account)
  },

  permit: async (
    owner: string,
    spender: string,
    value: bigint,
    deadline: bigint,
    v: number,
    r: string,
    s: string
  ): Promise<string> => {
    const contract = blockchainService.getContract(SYMBOL, true)
    const tx = await contract.permit(owner, spender, value, deadline, v, r, s)
    logger.info('muralusd', 'permit sent', { owner, spender, txHash: tx.hash })
    const receipt = await tx.wait()
    return receipt.hash
  },

  isBlocked: async (account: string): Promise<boolean> => {
    const contract = blockchainService.getContract(SYMBOL)
    return contract.isBlocked(account)
  },

  paused: async (): Promise<boolean> => {
    const contract = blockchainService.getContract(SYMBOL)
    return contract.paused()
  },
}
