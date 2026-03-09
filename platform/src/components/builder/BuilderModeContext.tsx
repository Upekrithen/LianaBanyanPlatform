import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BuilderModeContextType {
  isBuilderModeActive: boolean;
  toggleBuilderMode: () => void;
  activeLarkPanel: string | null;
  openLarkPanel: (componentId: string) => void;
  closeLarkPanel: () => void;
}

const BuilderModeContext = createContext<BuilderModeContextType | undefined>(undefined);

export function BuilderModeProvider({ children }: { children: ReactNode }) {
  const [isBuilderModeActive, setIsBuilderModeActive] = useState(false);
  const [activeLarkPanel, setActiveLarkPanel] = useState<string | null>(null);

  const toggleBuilderMode = () => {
    setIsBuilderModeActive(prev => !prev);
    if (isBuilderModeActive) {
      setActiveLarkPanel(null); // close panel when turning off mode
    }
  };

  const openLarkPanel = (componentId: string) => setActiveLarkPanel(componentId);
  const closeLarkPanel = () => setActiveLarkPanel(null);

  return (
    <BuilderModeContext.Provider value={{
      isBuilderModeActive,
      toggleBuilderMode,
      activeLarkPanel,
      openLarkPanel,
      closeLarkPanel
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
