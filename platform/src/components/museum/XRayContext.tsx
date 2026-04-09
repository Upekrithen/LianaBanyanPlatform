/**
 * XRayContext — Museum X-Ray Goggles mode.
 * When active: keyholes glow, annotations appear, LRH shows thermal vision.
 * Toggle by clicking the LRH character anywhere.
 *
 * activePanel tracks which XRayPanel the character has teleported to.
 * null = character is at the FAB (home position).
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface XRayContextValue {
  xrayOn: boolean;
  toggleXray: () => void;
  setXray: (on: boolean) => void;
  activePanel: string | null;
  setActivePanel: (id: string | null) => void;
}

const XRayCtx = createContext<XRayContextValue>({
  xrayOn: false,
  toggleXray: () => {},
  setXray: () => {},
  activePanel: null,
  setActivePanel: () => {},
});

export function XRayProvider({ children }: { children: ReactNode }) {
  const [xrayOn, setXrayOn] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const toggleXray = useCallback(() => {
    setXrayOn((v) => {
      if (v) setActivePanel(null);
      return !v;
    });
  }, []);

  return (
    <XRayCtx.Provider value={{ xrayOn, toggleXray, setXray: setXrayOn, activePanel, setActivePanel }}>
      {children}
    </XRayCtx.Provider>
  );
}

export function useXRay() {
  return useContext(XRayCtx);
}
