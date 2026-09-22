import { useEffect, useMemo, useState } from 'react';
import HeatMapView from './components/HeatMapView';
import FilterPanel from './components/FilterPanel';
import ChartsPanel from './components/ChartsPanel';
import Sidebar from './components/Sidebar';
import { useCrimeFilters } from './hooks/useCrimeFilters';
import { useCrimeStatistics } from './hooks/useCrimeStatistics';

function App() {
  const [activePage, setActivePage] = useState('map');
  const [isDark, setIsDark] = useState(true);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('Mapa Claro');

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', !isDark);
  }, [isDark]);

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

  const clearAllFilters = () => {
    setCrimeTypes([]);
    setSeverities([]);
    setMunicipalityIds([]);
    setNeighborhoodIds([]);
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Object.values(filters).some((value) => (
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  ));

  return (
    <div className={`app-shell ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        isDark={isDark}
        onToggleTheme={() => setIsDark((current) => !current)}
      />

      <main className="app-content">
      <header className="hero">
        <div>
          <h1>
            {activePage === 'map'
              ? 'Visualização de Crimes da Baixada Santista - Mapa de Calor'
              : 'Visualização de Crimes da Baixada Santista - Gráficos'}
          </h1>
          <p>
            {activePage === 'map'
              ? 'Explore a concentração de ocorrências por cidade e, ao aproximar o mapa, por bairro. Clique em um território para filtrar por ele.'
              : 'Use os filtros para exibir resultados específicos. Passe o mouse por cima para exibir os valores.'}
          </p>
        </div>
      </header>

      <section className="filters-bar">
        <div className="filters-heading">
          <h2>Filtros</h2>
          <button
            type="button"
            className="clear-all-filters"
            onClick={clearAllFilters}
            disabled={!hasActiveFilters || filtersLoading}
          >
            Limpar filtros
          </button>
        </div>
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

      {activePage === 'map' ? (
        <section className="map-section">
          <div className="map-card">
            <HeatMapView
              filters={filters}
              activeFilterLabels={activeFilterLabels}
              selectedBaseLayer={selectedBaseLayer}
              onBaseLayerChange={setSelectedBaseLayer}
              onSelectMunicipality={handleSelectMunicipality}
              onSelectNeighborhood={handleSelectNeighborhood}
            />
          </div>
        </section>
      ) : (
        <section className="charts-section">
          <ChartsPanel
            statistics={statistics}
            filters={filters}
            isDark={isDark}
            loading={statisticsLoading}
            error={statisticsError}
          />
        </section>
      )}
      </main>
    </div>
  );
}

export default App;
