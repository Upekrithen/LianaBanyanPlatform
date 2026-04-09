import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MascotProvince = 'southern' | 'northern';

export interface MascotConfig {
  province: MascotProvince;
  defaultImage: string;
  hoverImage: string;
  xrayOnImage: string;
  manaText: string;
  suppressedPercent: string;
  displayName: string;
}

export const SOUTHERN_MASCOT: MascotConfig = {
  province: 'southern',
  defaultImage: '/images/mascot-lrh-default.png',
  hoverImage: '/images/mascot-lrh-hover.png',
  xrayOnImage: '/images/mascot-lrh-xray-on.png',
  manaText: 'Mana',
  suppressedPercent: '85%',
  displayName: 'Little Red Hen',
};

export const NORTHERN_MASCOT: MascotConfig = {
  province: 'northern',
  defaultImage: '/images/reserve-denken/denken-correct-xray-off.png',
  hoverImage: '/images/reserve-denken/denken-xray-off.png',
  xrayOnImage: '/images/reserve-denken/denken-correct-xray-on.png',
  manaText: 'Mana',
  suppressedPercent: '62%',
  displayName: 'Denken',
};

interface BuilderModeContextType {
  isBuilderModeActive: boolean;
  toggleBuilderMode: () => void;
  activeLarkPanel: string | null;
  openLarkPanel: (componentId: string) => void;
  closeLarkPanel: () => void;
  province: MascotProvince;
  setProvince: (province: MascotProvince) => void;
  mascotConfig: MascotConfig;
}

const BuilderModeContext = createContext<BuilderModeContextType | undefined>(undefined);

export function BuilderModeProvider({ children }: { children: ReactNode }) {
  const [isBuilderModeActive, setIsBuilderModeActive] = useState(false);
  const [activeLarkPanel, setActiveLarkPanel] = useState<string | null>(null);
  const [province, setProvince] = useState<MascotProvince>('southern');

  const toggleBuilderMode = () => {
    setIsBuilderModeActive(prev => !prev);
    if (isBuilderModeActive) {
      setActiveLarkPanel(null); // close panel when turning off mode
    }
  };

  const openLarkPanel = (componentId: string) => setActiveLarkPanel(componentId);
  const closeLarkPanel = () => setActiveLarkPanel(null);
  const mascotConfig = province === 'northern' ? NORTHERN_MASCOT : SOUTHERN_MASCOT;

  return (
    <BuilderModeContext.Provider value={{
      isBuilderModeActive,
      toggleBuilderMode,
      activeLarkPanel,
      openLarkPanel,
      closeLarkPanel,
      province,
      setProvince,
      mascotConfig,
    }}>
      {children}
    </BuilderModeContext.Provider>
  );
}

export function useBuilderMode() {
  const context = useContext(BuilderModeContext);
  if (context === undefined) {
    throw new Error('useBuilderMode must be used within a BuilderModeProvider');
  }
  return context;
}

/** Safe variant — returns no-op defaults when BuilderModeProvider is absent (e.g. DSSApp, HexIsleApp) */
export function useBuilderModeSafe() {
  const context = useContext(BuilderModeContext);
  if (context === undefined) {
    return { toggleBuilderMode: () => {}, isBuilderModeActive: false } as any;
  }
  return context;
}
