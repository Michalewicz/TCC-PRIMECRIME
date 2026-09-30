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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className={`app-shell ${isDark ? 'dark-theme' : 'light-theme'} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        isDark={isDark}
        onToggleTheme={() => setIsDark((current) => !current)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      />

      <main className="app-content">
      {activePage !== 'details' && <section className="filters-bar">
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
      </section>}

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
        <>
          <section className="about-section details-about">
            <h2>SOBRE O PROJETO</h2>
            <p>Espaço reservado para apresentar o projeto PrimeCrimes, seus objetivos e o contexto da análise criminal na Baixada Santista.</p>
          </section>
          <section className="details-page" aria-label="Detalhes do projeto">
            <article className="details-card">
              <h2>METODOLOGIA</h2>
              <p>Espaço reservado para descrever os critérios de organização, tratamento e análise dos dados.</p>
            </article>
            <article className="details-card">
              <h2>FONTES DE DADOS</h2>
              <p>Espaço reservado para identificar as fontes, períodos de referência e atualizações dos dados.</p>
            </article>
            <article className="details-card">
              <h2>COBERTURA GEOGRÁFICA</h2>
              <p>Espaço reservado para detalhar os municípios e bairros representados nas visualizações.</p>
            </article>
            <article className="details-card">
              <h2>LIMITAÇÕES</h2>
              <p>Espaço reservado para informar limitações, critérios de interpretação e possíveis lacunas dos dados.</p>
            </article>
          </section>
        </>
      )}
      <footer className="site-footer">PrimeCrimes criado por Rafael Michalewicz e Sandro Gabriel</footer>
      </main>
    </div>
  );
}

export default App;
