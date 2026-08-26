import React, { createContext, useContext, useState, useEffect } from 'react';
import { Villa } from '../types';
import { catalogueApiService } from '../services/apiService';

interface VillaContextType {
  villas: Villa[];
  loading: boolean;
  error: string | null;
  refetchVillas: () => Promise<void>;
  getVillaById: (id: string) => Villa | undefined;
  getVillaBySlug: (slug: string) => Villa | undefined;
}

const VillaContext = createContext<VillaContextType | undefined>(undefined);

export const VillaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVillas = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogueApiService.getVillas();
      setVillas(data);
    } catch (err: any) {
      console.error('Error in VillaProvider fetchVillas:', err);
      setError(err.message || 'Failed to load dynamic villa catalogue');
      setVillas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVillas();
  }, []);

  // Re-trigger animations cleanly after API data is loaded into the DOM
  useEffect(() => {
    if (!loading && villas.length > 0) {
      const timer = setTimeout(() => {
        if (typeof (window as any).initApp === 'function') {
          (window as any).initApp();
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [loading, villas.length]);

  const getVillaById = (id: string): Villa | undefined => {
    return villas.find((v) => v.id === id || v.slug === id);
  };

  const getVillaBySlug = (slug: string): Villa | undefined => {
    return villas.find((v) => v.slug === slug || v.id === slug);
  };

  return (
    <VillaContext.Provider
      value={{
        villas,
        loading,
        error,
        refetchVillas: () => fetchVillas(true),
        getVillaById,
        getVillaBySlug,
      }}
    >
      {children}
    </VillaContext.Provider>
  );
};

export const useVillas = (): VillaContextType => {
  const context = useContext(VillaContext);
  if (!context) {
    throw new Error('useVillas must be used within a VillaProvider');
  }
  return context;
};
