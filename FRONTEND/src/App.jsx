import { useMemo } from 'react';
import HeatMapView from './components/HeatMapView';
import FilterPanel from './components/FilterPanel';
import ChartsPanel from './components/ChartsPanel';
import { useCrimeFilters } from './hooks/useCrimeFilters';
import { useCrimeStatistics } from './hooks/useCrimeStatistics';

function App() {
  const {
    options,
    filters,
    setCrimeTypes,
    setSeverities,
    setMunicipalityIds,
    setNeighborhoodIds,
    setStartDate,
    setEndDate,
    loading: filtersLoading,
    error: filtersError,
  } = useCrimeFilters();

  const {
    statistics,
    loading: statisticsLoading,
    error: statisticsError,
  } = useCrimeStatistics(filters);

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
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Protótipo de visualização</p>
          <h1>Mapa de calor de criminalidade na Baixada Santista</h1>
          <p>
            Explore a concentração de ocorrências por cidade e, ao aproximar o mapa,
            por bairro. Clique em um território para filtrar por ele.
          </p>
        </div>
      </header>

      <section className="filters-bar">
        <h2>Filtros</h2>
        <FilterPanel
          options={options}
          filters={filters}
          disabled={filtersLoading}
          onCrimeTypesChange={setCrimeTypes}
          onSeveritiesChange={setSeverities}
          onMunicipalityIdsChange={setMunicipalityIds}
          onNeighborhoodIdsChange={setNeighborhoodIds}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        {filtersError && (
          <p className="filter-error">Não foi possível carregar os filtros do servidor.</p>
        )}
      </section>

      <section className="map-section">
        <div className="map-card">
          <HeatMapView
            filters={filters}
            activeFilterLabels={activeFilterLabels}
            onSelectMunicipality={handleSelectMunicipality}
            onSelectNeighborhood={handleSelectNeighborhood}
          />
        </div>
      </section>

      <section className="charts-section">
        <ChartsPanel
          statistics={statistics}
          filters={filters}
          loading={statisticsLoading}
          error={statisticsError}
        />
      </section>
    </div>
  );
}

export default App;
