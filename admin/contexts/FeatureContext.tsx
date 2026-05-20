'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, VOYAGE_FEATURE_COOKIE } from '@/utils/cookies';

interface FeatureContextType {
  voyageEnabled: boolean;
  setVoyageEnabled: (enabled: boolean) => void;
}

const FeatureContext = createContext<FeatureContextType>({
  voyageEnabled: false,
  setVoyageEnabled: () => {},
});

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [voyageEnabled, setVoyageEnabled] = useState(false);

  // Initialize state from cookie on mount
  useEffect(() => {
    const savedState = getCookie(VOYAGE_FEATURE_COOKIE);
    if (savedState !== null) {
      setVoyageEnabled(savedState === 'true');
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <FeatureContext.Provider value={{ voyageEnabled, setVoyageEnabled }}>
      {children}
    </FeatureContext.Provider>
  );
}

export const useFeature = () => useContext(FeatureContext);
