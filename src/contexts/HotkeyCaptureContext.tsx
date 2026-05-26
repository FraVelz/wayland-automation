import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface HotkeyCaptureContextValue {
  isCapturing: boolean;
  setCapturing: (active: boolean) => void;
}

const HotkeyCaptureContext = createContext<HotkeyCaptureContextValue | null>(null);

export function HotkeyCaptureProvider({ children }: { children: ReactNode }) {
  const [isCapturing, setIsCapturing] = useState(false);

  const setCapturing = useCallback((active: boolean) => {
    setIsCapturing(active);
  }, []);

  const value = useMemo(
    () => ({
      isCapturing,
      setCapturing,
    }),
    [isCapturing, setCapturing],
  );

  return (
    <HotkeyCaptureContext.Provider value={value}>{children}</HotkeyCaptureContext.Provider>
  );
}

export function useHotkeyCapture(): HotkeyCaptureContextValue {
  const ctx = useContext(HotkeyCaptureContext);
  if (!ctx) {
    throw new Error("useHotkeyCapture debe usarse dentro de HotkeyCaptureProvider");
  }
  return ctx;
}
