import { ChevronDown, ChevronUp } from 'lucide-react';
import FilterPanel from './FilterPanel';
import { useFilters } from '../contexts/FiltersContext';
import { usePersistentState } from '../hooks/usePersistentState';

const COLLAPSED_STORAGE_KEY = 'primecrime.filters.collapsed';

/**
 * Filters section shared by the pages that filter data. It can be collapsed to a single line
 * (remembered across pages and reloads) and, with `sticky`, follows the page scroll.
 */
function FiltersBar({ sticky = false }) {
  const {
    options,
    filters,
    loading,
    error,
    hasActiveFilters,
    activeFilterCount,
    clearAll,
    setCrimeTypes,
    setSeverities,
    setMunicipalityIds,
    setNeighborhoodIds,
    setStartDate,
    setEndDate,
  } = useFilters();
  const [collapsed, setCollapsed] = usePersistentState(COLLAPSED_STORAGE_KEY, false);
  const ToggleIcon = collapsed ? ChevronDown : ChevronUp;
  const className = ['filters-bar', sticky && 'is-sticky', collapsed && 'is-collapsed'].filter(Boolean).join(' ');

  return (
    <section className={className} aria-label="Filtros">
      <div className="filters-heading">
        <h2>Filtros</h2>
        {collapsed && hasActiveFilters && (
          <span className="filters-active-count">
            {activeFilterCount} {activeFilterCount === 1 ? 'ativo' : 'ativos'}
          </span>
        )}
        <div className="filters-actions">
          <button
            type="button"
            className="clear-all-filters"
            onClick={clearAll}
            disabled={!hasActiveFilters || loading}
          >
            Limpar filtros
          </button>
          <button
            type="button"
            className="filters-collapse-toggle"
            onClick={() => setCollapsed((current) => !current)}
            aria-expanded={!collapsed}
            aria-controls="filters-body"
          >
            <ToggleIcon size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>{collapsed ? 'Expandir' : 'Recolher'}</span>
          </button>
        </div>
      </div>

      <div id="filters-body" hidden={collapsed}>
        {!collapsed && (
          <>
            <FilterPanel
              options={options}
              filters={filters}
              disabled={loading}
              onCrimeTypesChange={setCrimeTypes}
              onSeveritiesChange={setSeverities}
              onMunicipalityIdsChange={setMunicipalityIds}
              onNeighborhoodIdsChange={setNeighborhoodIds}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            {error && (
              <p className="filter-error">Não foi possível carregar os filtros do servidor.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default FiltersBar;
