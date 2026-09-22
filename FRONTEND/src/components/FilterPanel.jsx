import MultiSelectDropdown from './MultiSelectDropdown';

const MIN_DATA_DATE = '1202-01-18T19:03';
const MAX_DATA_DATE = '2026-06-30T21:12';

function FilterPanel({
  options,
  filters,
  disabled,
  onCrimeTypesChange,
  onSeveritiesChange,
  onMunicipalityIdsChange,
  onNeighborhoodIdsChange,
  onStartDateChange,
  onEndDateChange,
}) {
  const { crimeTypes, severities: severityOptions, municipalities, neighborhoods } = options;
  const {
    crimeTypes: selectedCrimeTypes,
    severities: selectedSeverities,
    municipalityIds,
    neighborhoodIds,
    startDate,
    endDate,
  } = filters;

  return (
    <div className="filter-panel" aria-label="Filtros do mapa">
      <MultiSelectDropdown
        id="filter-crime-type"
        label="Tipo de crime"
        placeholder="Todos"
        disabled={disabled}
        values={selectedCrimeTypes}
        options={crimeTypes.map(({ crime_type }) => ({ value: crime_type, label: crime_type }))}
        onChange={onCrimeTypesChange}
      />

      <MultiSelectDropdown
        id="filter-severity"
        label="Gravidade do crime"
        placeholder="Todas"
        disabled={disabled}
        values={selectedSeverities}
        options={severityOptions.map(({ severity }) => ({ value: severity, label: severity }))}
        onChange={onSeveritiesChange}
      />

      <MultiSelectDropdown
        id="filter-municipality"
        label="Município"
        placeholder="Todos"
        disabled={disabled}
        values={municipalityIds}
        options={municipalities.map(({ ibge_id, municipality_name }) => ({
          value: ibge_id,
          label: municipality_name,
        }))}
        onChange={onMunicipalityIdsChange}
      />

      <MultiSelectDropdown
        id="filter-neighborhood"
        label="Bairro"
        placeholder={municipalityIds.length > 0 ? 'Todos' : 'Selecione um município'}
        disabled={disabled || municipalityIds.length === 0}
        values={neighborhoodIds}
        options={neighborhoods.map(({ id, neighborhood_name }) => ({ value: id, label: neighborhood_name }))}
        onChange={onNeighborhoodIdsChange}
      />

      <div className="filter-field">
        <label htmlFor="filter-start-date">Data início</label>
        <input
          id="filter-start-date"
          type="datetime-local"
          value={startDate}
          disabled={disabled}
          min={MIN_DATA_DATE}
          max={endDate || MAX_DATA_DATE}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-end-date">Data fim</label>
        <input
          id="filter-end-date"
          type="datetime-local"
          value={endDate}
          disabled={disabled}
          min={startDate || MIN_DATA_DATE}
          max={MAX_DATA_DATE}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default FilterPanel;

