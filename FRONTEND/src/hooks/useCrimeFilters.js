import { useEffect, useMemo, useState } from 'react';
import { fetchCrimeTypes, fetchMunicipalities, fetchNeighborhoods, fetchSeverities } from '../config/api';

/**
 * Loads filter option lists from the backend and manages the four
 * cascading map filters (tipo de crime, gravidade, município, bairro), each of which
 * supports multiple selections. Bairros are re-fetched, pre-filtered,
 * whenever the selected municípios change, merging results across all of them.
 */
export function useCrimeFilters() {
  const [crimeTypeOptions, setCrimeTypeOptions] = useState([]);
  const [severityOptions, setSeverityOptions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [crimeTypes, setCrimeTypes] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [municipalityIds, setMunicipalityIds] = useState([]);
  const [neighborhoodIds, setNeighborhoodIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchCrimeTypes(), fetchSeverities(), fetchMunicipalities()])
      .then(([crimeTypeRows, severityRows, municipalityRows]) => {
        setCrimeTypeOptions(crimeTypeRows);
        setSeverityOptions(severityRows);
        setMunicipalities(municipalityRows);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (municipalityIds.length === 0) {
      setNeighborhoods([]);
      setNeighborhoodIds([]);
      return undefined;
    }
    let cancelled = false;
    Promise.all(municipalityIds.map((ibgeId) => fetchNeighborhoods(ibgeId)))
      .then((results) => {
        if (cancelled) return;
        const merged = results.flat();
        setNeighborhoods(merged);
        const validIds = new Set(merged.map((n) => String(n.id)));
        setNeighborhoodIds((prev) => prev.filter((id) => validIds.has(id)));
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [municipalityIds]);

  const filters = useMemo(
    () => ({ crimeTypes, severities, municipalityIds, neighborhoodIds, startDate, endDate }),
    [crimeTypes, severities, municipalityIds, neighborhoodIds, startDate, endDate]
  );

  return {
    options: { crimeTypes: crimeTypeOptions, severities: severityOptions, municipalities, neighborhoods },
    filters,
    setCrimeTypes,
    setSeverities,
    setMunicipalityIds,
    setNeighborhoodIds,
    setStartDate,
    setEndDate,
    loading,
    error,
  };
}

