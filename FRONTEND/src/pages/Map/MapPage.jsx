import { useMemo } from 'react';
import FiltersBar from '../../components/FiltersBar';
import HeatMapView from '../../components/HeatMapView';
import { useFilters } from '../../contexts/FiltersContext';
import { usePersistentState } from '../../hooks/usePersistentState';

const BASE_LAYER_STORAGE_KEY = 'primecrime.map.baseLayer';

function MapPage() {
  const { options, filters, setMunicipalityIds, setNeighborhoodIds } = useFilters();
  const [baseLayer, setBaseLayer] = usePersistentState(BASE_LAYER_STORAGE_KEY, 'Mapa Claro');

  // Resolves the selected ids into human-readable labels for the map badge.
  const activeFilterLabels = useMemo(() => {
    const labels = [...filters.crimeTypes, ...filters.severities];

    const municipalityNames = options.municipalities
      .filter((m) => filters.municipalityIds.includes(String(m.ibge_id)))
      .map((m) => m.municipality_name);
    labels.push(...municipalityNames);

    const neighborhoodNames = options.neighborhoods
      .filter((n) => filters.neighborhoodIds.includes(String(n.id)))
      .map((n) => n.neighborhood_name);
    labels.push(...neighborhoodNames);

    if (filters.startDate || filters.endDate) {
      labels.push(`${filters.startDate || '...'} → ${filters.endDate || '...'}`);
    }

    return labels;
  }, [filters, options]);

  const handleSelectMunicipality = (ibgeId) => {
    if (ibgeId == null) {
      setMunicipalityIds([]);
      setNeighborhoodIds([]);
      return;
    }
    setMunicipalityIds([String(ibgeId)]);
    setNeighborhoodIds([]);
  };

  const handleSelectNeighborhood = (selection) => {
    if (selection == null) {
      setNeighborhoodIds([]);
      return;
    }
    const { ibgeId, neighborhoodId } = selection;
    setMunicipalityIds([String(ibgeId)]);
    setNeighborhoodIds([String(neighborhoodId)]);
  };

  return (
    <>
      <FiltersBar />

      <section className="map-section">
        <div className="map-card">
          <HeatMapView
            filters={filters}
            activeFilterLabels={activeFilterLabels}
            selectedBaseLayer={baseLayer}
            onBaseLayerChange={setBaseLayer}
            onSelectMunicipality={handleSelectMunicipality}
            onSelectNeighborhood={handleSelectNeighborhood}
          />
        </div>
      </section>
    </>
  );
}

export default MapPage;
