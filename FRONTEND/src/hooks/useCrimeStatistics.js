import { useEffect, useState } from 'react';
import { fetchCrimeStatistics } from '../config/api';

const EMPTY_STATISTICS = { total: 0, by_crime_type: [], by_month: [], by_location: [] };

/** Re-fetches aggregated crime statistics whenever the active filters change. */
export function useCrimeStatistics(filters) {
  const [statistics, setStatistics] = useState(EMPTY_STATISTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCrimeStatistics(filters)
      .then((data) => {
        if (!cancelled) {
          setStatistics(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return { statistics, loading, error };
}
