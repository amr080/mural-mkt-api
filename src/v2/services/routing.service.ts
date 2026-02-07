import { ethers } from 'ethers'
import { ENV } from '../config/env'
import { blockchainService } from './blockchain.service'
import { logger } from '../utils/logger'
import ROUTING_ABI from '../../../abi/XFTRoutingFactoryV6.json'

function getRoutingContract(useSigner = false): ethers.Contract {
  const providerOrSigner = useSigner ? blockchainService.getSigner() : blockchainService.getProvider()
  return new ethers.Contract(ENV.ROUTING_FACTORY_ADDRESS, ROUTING_ABI, providerOrSigner)
}

export const routingService = {
  getAllRails: async (): Promise<string[]> => {
    const contract = getRoutingContract()
    return contract.getAllRails()
  },

  getAllWallets: async (): Promise<any[]> => {
    const contract = getRoutingContract()
    return contract.getAllWallets()
  },

  getWalletsByRail: async (rail: string): Promise<any[]> => {
    const contract = getRoutingContract()
    return contract.getWalletsByRail(rail)
  },

  deployWallet: async (rail: string, id: string): Promise<string> => {
    const contract = getRoutingContract(true)
    const fn = `deploy${rail}Wallet`
    if (typeof contract[fn] !== 'function') throw new Error(`No deploy function for rail: ${rail}`)
    const tx = await contract[fn](id)
    logger.info('routing', 'wallet deployed', { rail, id, txHash: tx.hash })
    const receipt = await tx.wait()
    return receipt.hash
  },

  mintToRail: async (rail: string, id: string, amount: bigint): Promise<string> => {
    const contract = getRoutingContract(true)
    const fn = `mintTo${rail}`
    if (typeof contract[fn] !== 'function') throw new Error(`No mint function for rail: ${rail}`)
    const tx = await contract[fn](id, amount)
    logger.info('routing', 'minted to rail', { rail, id, txHash: tx.hash })
    const receipt = await tx.wait()
    return receipt.hash
  },

  burnFromRail: async (rail: string, id: string, amount: bigint): Promise<string> => {
    const contract = getRoutingContract(true)
    const fn = `burnFrom${rail}`
    if (typeof contract[fn] !== 'function') throw new Error(`No burn function for rail: ${rail}`)
    const tx = await contract[fn](id, amount)
    const receipt = await tx.wait()
    return receipt.hash
  },

  transferByRail: async (rail: string, from: string, to: string, amount: bigint): Promise<string> => {
    const contract = getRoutingContract(true)
    const fn = `transfer${rail}`
    if (typeof contract[fn] !== 'function') throw new Error(`No transfer function for rail: ${rail}`)
    const tx = await contract[fn](from, to, amount)
    logger.info('routing', 'rail transfer', { rail, from, to, txHash: tx.hash })
    const receipt = await tx.wait()
    return receipt.hash
  },
}
