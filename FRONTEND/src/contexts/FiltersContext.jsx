import { createContext, useContext } from 'react';
import { useCrimeFilters } from '../hooks/useCrimeFilters';

const FiltersContext = createContext(null);

/** Keeps a single filters state alive across pages, so filters survive navigation. */
export function FiltersProvider({ children }) {
  const filters = useCrimeFilters();
  return <FiltersContext.Provider value={filters}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) throw new Error('useFilters must be used inside a FiltersProvider');
  return context;
}
