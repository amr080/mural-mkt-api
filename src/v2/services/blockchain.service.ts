import { ethers } from 'ethers'
import { ENV } from '../config/env'
import { getToken } from '../config/tokens'
import { logger } from '../utils/logger'

let provider: ethers.JsonRpcProvider | null = null
let signer: ethers.Wallet | null = null

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(ENV.POLYGON_AMOY_RPC_URL)
  }
  return provider
}

function getSigner(): ethers.Wallet {
  if (!signer) {
    signer = new ethers.Wallet(ENV.CUSTOMER_PRIVATE_KEY, getProvider())
  }
  return signer
}

function getContract(tokenSymbol: string, useSigner = false): ethers.Contract {
  const config = getToken(tokenSymbol)
  const providerOrSigner = useSigner ? getSigner() : getProvider()
  return new ethers.Contract(config.address, config.abi, providerOrSigner)
}

export const blockchainService = {
  balanceOf: async (tokenSymbol: string, address: string): Promise<bigint> => {
    const contract = getContract(tokenSymbol)
    return contract.balanceOf(address)
  },

  transfer: async (tokenSymbol: string, to: string, amount: bigint): Promise<string> => {
    const contract = getContract(tokenSymbol, true)
    const tx = await contract.transfer(to, amount)
    logger.info('blockchain', 'transfer sent', { tokenSymbol, to, txHash: tx.hash })
    const receipt = await tx.wait()
    return receipt.hash
  },

  approve: async (tokenSymbol: string, spender: string, amount: bigint): Promise<string> => {
    const contract = getContract(tokenSymbol, true)
    const tx = await contract.approve(spender, amount)
    const receipt = await tx.wait()
    return receipt.hash
  },

  allowance: async (tokenSymbol: string, owner: string, spender: string): Promise<bigint> => {
    const contract = getContract(tokenSymbol)
    return contract.allowance(owner, spender)
  },

  decimals: async (tokenSymbol: string): Promise<number> => {
    const contract = getContract(tokenSymbol)
    return contract.decimals()
  },

  getProvider,
  getSigner,
  getContract,
}
