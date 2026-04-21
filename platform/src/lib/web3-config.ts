import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

// WalletConnect Project ID for Liana Banyan Medallion System
const projectId = '1ae6035e83fa3f97168a19706fa49f4a';

/**
 * NETWORK ARCHITECTURE: Test-Net By Design
 * =========================================
 *
 * PERMANENT TESTNET ARCHITECTURE (per "Blockchain Without Coin or Speculation" paper):
 *
 * ALL blockchain operations use baseSepolia (TESTNET ONLY):
 *    - IP ownership history, contribution attribution, narrative data
 *    - Lives PERMANENTLY on testnet — this is deliberate, not staging
 *    - Cannot be traded, monetized, or bridged to mainnet
 *    - "Test-Net By Design" = architectural prevention of speculation
 *
 * WHY NO MAINNET - EVER:
 *    - Mainnet enables trading = enables speculation = violates SEC compliance
 *    - Platform credits are "future service coupons" not securities
 *    - No trading, no cashing in, ever — by design
 *    - This is a FEATURE, not a limitation
 *
 * The metaphor: Provenance is the STORY (priceless, non-monetizable).
 * There is no "receipt" layer because there's nothing to trade.
 */
export const config = getDefaultConfig({
  appName: 'Liana Banyan IP Blockchain',
  projectId,
  chains: [baseSepolia], // TESTNET ONLY - by design
  ssr: false,
});

/**
 * NETWORK SELECTION GUIDE
 * - baseSepolia: Use for ALL blockchain operations (permanent, by design)
 * - NO MAINNET OPTION - Test-Net By Design prevents speculation
 */
export const NETWORK_PURPOSES = {
  PROVENANCE: 'baseSepolia',      // Testnet by design - NEVER mainnet
} as const;

/**
 * MEDALLION CONTRACT ABI
 * ======================
 * ERC-1155 with NON-TRANSFERABLE enforcement.
 *
 * CRITICAL: When deploying the contract, include this in Solidity:
 *
 * ```solidity
 * function _beforeTokenTransfer(
 *     address operator,
 *     address from,
 *     address to,
 *     uint256[] memory ids,
 *     uint256[] memory amounts,
 *     bytes memory data
 * ) internal virtual override {
 *     // Allow minting (from == address(0)) and burning (to == address(0))
 *     // Block all transfers between users
 *     require(
 *         from == address(0) || to == address(0),
 *         "LianaBanyan: Medallions are non-transferable"
 *     );
 *     super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
 * }
 * ```
 *
 * This enforces "Test-Net By Design" at the contract level:
 * - Medallions can be MINTED (provenance created)
 * - Medallions can be BURNED (if needed for correction)
 * - Medallions CANNOT be transferred between wallets
 * - No secondary market possible = no speculation
 */
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
  // Non-transferable check (view function to verify contract has restriction)
  {
    inputs: [],
    name: 'isNonTransferable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'pure',
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
