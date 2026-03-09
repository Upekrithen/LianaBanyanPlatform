export type RootType = 'single' | 'twin' | 'tri' | 'quad' | 'ring';
export type BiomeType = 'harvest' | 'navigate' | 'engineer' | 'battle' | 'seek' | 'magic' | 'train' | 'neutral';

export interface RootConfig {
  type: RootType;
  allowedBiomes: BiomeType[];
  pinCount: number;
  radius: number; // radius of the pin spread
}

export interface SocketConfig {
  id: string;
  type: RootType;
  biome: BiomeType;
  position: [number, number, number];
  isOccupied: boolean;
}

// The core mapping of which roots can go in which biomes
export const ROOT_DICTIONARY: Record<RootType, RootConfig> = {
  single: {
    type: 'single',
    allowedBiomes: ['neutral', 'harvest', 'train'],
    pinCount: 1,
    radius: 0
  },
  twin: {
    type: 'twin',
    allowedBiomes: ['navigate', 'seek'],
    pinCount: 2,
    radius: 0.5
  },
  tri: {
    type: 'tri',
    allowedBiomes: ['magic', 'battle'],
    pinCount: 3,
    radius: 0.6
  },
  quad: {
    type: 'quad',
    allowedBiomes: ['engineer'],
    pinCount: 4,
    radius: 0.7
  },
  ring: {
    type: 'ring',
    allowedBiomes: ['harvest', 'engineer', 'magic'], // Advanced structures
    pinCount: 8,
    radius: 1.0
  }
};

/**
 * Validates if a specific root type can be placed in a specific socket.
 * "If it fits, it sits."
 */
export const validateRootLock = (rootType: RootType, socket: SocketConfig): boolean => {
  if (socket.isOccupied) return false;
  
  // Physical fit check (does the pin configuration match the hole configuration?)
  if (rootType !== socket.type) return false;

  // Biome compatibility check
  const config = ROOT_DICTIONARY[rootType];
  return config.allowedBiomes.includes(socket.biome) || config.allowedBiomes.includes('neutral');
};
