import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// WalletConnect Project ID for Liana Banyan Medallion System
const projectId = '1ae6035e83fa3f97168a19706fa49f4a';

export const config = getDefaultConfig({
  appName: 'Liana Banyan IP Blockchain',
  projectId,
  chains: [base, baseSepolia],
  ssr: false,
});

// Contract addresses (will be deployed per project)
export const MEDALLION_CONTRACT_ABI = [
  // ERC-1155 standard functions
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' }
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'data', type: 'bytes' }
    ],
    name: 'mintBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Medallion token IDs for different tiers
export const MEDALLION_TIERS = {
  SEED_FUNDING: 1,
  EARLY_SUPPORTER: 2,
  COMMUNITY_BUILDER: 3,
  PROJECT_CHAMPION: 4,
} as const;

// Gas estimation helpers
export const estimateGasCost = (gasUsed: bigint, gasPriceGwei: bigint): number => {
  // Convert to USD (approximate, using ~$2500 ETH price)
  const ethCost = Number(gasUsed * gasPriceGwei) / 1e18;
  const usdCost = ethCost * 2500;
  return usdCost;
};
