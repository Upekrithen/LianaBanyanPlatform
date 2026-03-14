/**
 * IPFS SERVICE — Immutable Metadata Storage
 * ==========================================
 * 
 * Per "Blockchain Without Coin or Speculation" paper:
 * "The metadata itself is stored on IPFS, where content addressing 
 * ensures it cannot be modified without changing the hash."
 * 
 * This service handles:
 * 1. Uploading innovation metadata to IPFS
 * 2. Generating content-addressed URIs (CIDs)
 * 3. Verifying metadata integrity
 * 
 * The proof chain:
 * USPTO Filing → Blockchain Hash → IPFS Metadata → Innovation Token
 * 
 * Innovation #1226: Recipe IP Ledger Hash (SHA-256 stamp)
 */

// IPFS Gateway options (using public gateways, can upgrade to dedicated)
const IPFS_GATEWAYS = {
  // Pinata is recommended for production (requires API key)
  PINATA: 'https://gateway.pinata.cloud/ipfs/',
  // Public gateways (free but less reliable)
  IPFS_IO: 'https://ipfs.io/ipfs/',
  CLOUDFLARE: 'https://cloudflare-ipfs.com/ipfs/',
  DWEB: 'https://dweb.link/ipfs/',
} as const;

// Default gateway for reading
const DEFAULT_GATEWAY = IPFS_GATEWAYS.DWEB;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InnovationMetadata {
  // Required fields
  innovation_number: number;
  title: string;
  description: string;
  category: string;
  
  // Provenance
  created_at: string;           // ISO timestamp
  creator_id?: string;          // Member UUID (hashed for privacy)
  contributors?: string[];      // Array of contributor hashes
  
  // Patent linkage
  patent_application?: string;  // e.g., "63/925,672"
  patent_status?: 'provisional' | 'filed' | 'pending' | 'granted';
  
  // Platform context
  initiative?: string;          // Which of the Sweet Sixteen
  bag_number?: number;          // Patent bag grouping
  
  // Valuation (internal, non-speculative)
  internal_valuation_credits?: number;
  valuation_date?: string;
  
  // Verification
  content_hash?: string;        // SHA-256 of core content
  previous_version_cid?: string; // For version chains
}

export interface MedallionMetadata {
  // ERC-1155 standard fields
  name: string;
  description: string;
  image: string;                // IPFS URI or URL
  
  // Custom attributes (OpenSea compatible)
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: 'number' | 'date' | 'boost_number' | 'boost_percentage';
  }>;
  
  // Liana Banyan specific
  medallion_tier: 'seed' | 'early_supporter' | 'community_builder' | 'project_champion';
  project_id: string;
  innovation_references?: number[];  // Innovation numbers this medallion relates to
  
  // Non-transferable notice
  transfer_restriction: 'non-transferable';
  restriction_reason: string;
}

export interface IPFSUploadResult {
  cid: string;                  // Content Identifier (hash)
  uri: string;                  // Full IPFS URI (ipfs://CID)
  gateway_url: string;          // HTTP gateway URL for viewing
  size_bytes: number;
  uploaded_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HASH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate SHA-256 hash of content
 * Used for content verification and IP Ledger stamps
 */
export async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify content matches a known hash
 */
export async function verifyContentHash(content: string, expectedHash: string): Promise<boolean> {
  const actualHash = await generateContentHash(content);
  return actualHash === expectedHash;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IPFS OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Upload JSON metadata to IPFS via Pinata
 * Requires VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY env vars
 *
 * ARCHITECTURE NOTE: Currently calls Pinata directly from the browser.
 * For production, this should be routed through a Supabase Edge Function
 * so the Pinata secret key is never exposed in the client bundle.
 * See OAuth architecture pattern in socialOAuth.ts for reference.
 */
export async function uploadToIPFS(
  metadata: InnovationMetadata | MedallionMetadata,
  name: string
): Promise<IPFSUploadResult> {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    // ═══════════════════════════════════════════════════════════════════════════
    // INFRASTRUCTURE NOTE — IPFS MOCK FALLBACK
    // ═══════════════════════════════════════════════════════════════════════════
    // Currently returns a deterministic mock CID (not a real IPFS hash).
    // These mock CIDs will NOT resolve on any IPFS gateway.
    //
    // TO ACTIVATE REAL IPFS:
    // 1. Create a Pinata account at https://app.pinata.cloud
    // 2. Generate API keys (Admin scope recommended)
    // 3. Set env vars: VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY
    //    NOTE: In production, move these to a Supabase Edge Function to avoid
    //    exposing the secret key in the browser bundle. VITE_ prefix means
    //    client-side exposure. The uploadToIPFS function should call an Edge
    //    Function which holds the real Pinata secret server-side.
    // 4. Once keys are set, this fallback is bypassed automatically.
    //
    // Related: Innovation #1226 (Recipe IP Ledger Hash)
    // Proof chain: USPTO Filing → Blockchain Hash → IPFS Metadata → Innovation Token
    // ═══════════════════════════════════════════════════════════════════════════
    console.warn('IPFS: Pinata keys not configured, using mock CID');
    return generateMockIPFSResult(metadata, name);
  }
  
  const jsonString = JSON.stringify(metadata, null, 2);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: name,
        keyvalues: {
          platform: 'liana-banyan',
          type: 'innovation_number' in metadata ? 'innovation' : 'medallion',
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`IPFS upload failed: ${error}`);
  }
  
  const result = await response.json();
  const cid = result.IpfsHash;
  
  return {
    cid,
    uri: `ipfs://${cid}`,
    gateway_url: `${DEFAULT_GATEWAY}${cid}`,
    size_bytes: new TextEncoder().encode(jsonString).length,
    uploaded_at: new Date().toISOString(),
  };
}

/**
 * Generate mock IPFS result for development/testing
 *
 * INFRASTRUCTURE NOTE: This produces FAKE CIDs that look like real IPFS hashes
 * (bafybeig... prefix) but will NOT resolve on any gateway. Any CID starting
 * with this pattern that was generated before Pinata keys were configured is
 * a mock and should be re-uploaded once real IPFS is active.
 *
 * The CID is deterministic (same input → same output) so identical metadata
 * will produce the same mock CID, which is useful for testing deduplication.
 */
function generateMockIPFSResult(
  metadata: InnovationMetadata | MedallionMetadata,
  name: string
): IPFSUploadResult {
  // Generate a deterministic mock CID based on content
  const content = JSON.stringify(metadata);
  const mockCid = `bafybeig${btoa(content.slice(0, 32)).replace(/[^a-z0-9]/gi, '').slice(0, 52).toLowerCase()}`;
  
  return {
    cid: mockCid,
    uri: `ipfs://${mockCid}`,
    gateway_url: `${DEFAULT_GATEWAY}${mockCid}`,
    size_bytes: new TextEncoder().encode(content).length,
    uploaded_at: new Date().toISOString(),
  };
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  // Try multiple gateways in case one is down
  const gateways = Object.values(IPFS_GATEWAYS);
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(`${gateway}${cid}`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`IPFS gateway ${gateway} failed, trying next...`);
    }
  }
  
  throw new Error(`Failed to fetch from IPFS: ${cid}`);
}

/**
 * Verify IPFS content matches expected hash
 */
export async function verifyIPFSContent(cid: string, expectedHash: string): Promise<boolean> {
  try {
    const content = await fetchFromIPFS<unknown>(cid);
    const contentString = JSON.stringify(content);
    return await verifyContentHash(contentString, expectedHash);
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INNOVATION METADATA HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create standard innovation metadata for IPFS upload
 */
export function createInnovationMetadata(
  innovationNumber: number,
  title: string,
  description: string,
  category: string,
  options?: Partial<InnovationMetadata>
): InnovationMetadata {
  const metadata: InnovationMetadata = {
    innovation_number: innovationNumber,
    title,
    description,
    category,
    created_at: new Date().toISOString(),
    ...options,
  };
  
  return metadata;
}

/**
 * Create medallion metadata for ERC-1155 token
 */
export function createMedallionMetadata(
  name: string,
  description: string,
  tier: MedallionMetadata['medallion_tier'],
  projectId: string,
  imageUrl: string,
  innovationRefs?: number[]
): MedallionMetadata {
  const tierAttributes: Record<typeof tier, { rarity: string; level: number }> = {
    seed: { rarity: 'Common', level: 1 },
    early_supporter: { rarity: 'Uncommon', level: 2 },
    community_builder: { rarity: 'Rare', level: 3 },
    project_champion: { rarity: 'Legendary', level: 4 },
  };
  
  return {
    name,
    description,
    image: imageUrl,
    attributes: [
      { trait_type: 'Tier', value: tier },
      { trait_type: 'Rarity', value: tierAttributes[tier].rarity },
      { trait_type: 'Level', value: tierAttributes[tier].level, display_type: 'number' },
      { trait_type: 'Platform', value: 'Liana Banyan' },
      { trait_type: 'Transferable', value: 'No' },
    ],
    medallion_tier: tier,
    project_id: projectId,
    innovation_references: innovationRefs,
    transfer_restriction: 'non-transferable',
    restriction_reason: 'Test-Net By Design: Medallions are provenance records, not tradeable assets. They signify contribution history and cannot be sold, transferred, or speculated upon.',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// IP LEDGER INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a complete IP Ledger entry with IPFS backing
 * This is the full "proof chain" described in the paper:
 * USPTO Filing → Blockchain Hash → IPFS Metadata → Innovation Token
 */
export interface IPLedgerEntry {
  innovation_number: number;
  content_hash: string;         // SHA-256 of innovation content
  ipfs_cid: string;             // IPFS content identifier
  ipfs_uri: string;             // ipfs://CID
  blockchain_tx?: string;       // Transaction hash when anchored
  patent_application?: string;  // USPTO application number
  created_at: string;
}

export async function createIPLedgerEntry(
  metadata: InnovationMetadata
): Promise<IPLedgerEntry> {
  // Generate content hash
  const contentHash = await generateContentHash(JSON.stringify(metadata));
  
  // Add hash to metadata
  const metadataWithHash: InnovationMetadata = {
    ...metadata,
    content_hash: contentHash,
  };
  
  // Upload to IPFS
  const ipfsResult = await uploadToIPFS(
    metadataWithHash,
    `innovation-${metadata.innovation_number}`
  );
  
  return {
    innovation_number: metadata.innovation_number,
    content_hash: contentHash,
    ipfs_cid: ipfsResult.cid,
    ipfs_uri: ipfsResult.uri,
    patent_application: metadata.patent_application,
    created_at: ipfsResult.uploaded_at,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Platform patent portfolio stats
 * Updated: February 18, 2026
 */
export const PATENT_PORTFOLIO_STATS = {
  total_innovations: 1630,
  utility_patent_percentage: 99,
  formal_claims: 1336,
  filed_applications: 7,
  crown_jewels_definite: 8,
  crown_jewels_possible: 9,
  queries_run: 130,
  prior_art_reviewed: 330,

  // Standard description for use across platform
  description: "The patent portfolio behind this platform includes 1,630 documented innovations — 99% utility patents, not design — protected by 1,336 formal claims across 6 provisional applications. Eight definite with 9 more out of the first 130 so far have survived a deep dive against the U.S. patent office with no prior art found.",
} as const;
