import ChartsPanel from '../../components/ChartsPanel';
import FiltersBar from '../../components/FiltersBar';
import { useFilters } from '../../contexts/FiltersContext';
import { useCrimeStatistics } from '../../hooks/useCrimeStatistics';

function DashboardPage() {
  const { options, filters } = useFilters();
  const { statistics, loading, error } = useCrimeStatistics(filters);

  return (
    <>
      <FiltersBar sticky />

      <section className="charts-section">
        <ChartsPanel
          statistics={statistics}
          filters={filters}
          crimeTypes={options.crimeTypes}
          loading={loading}
          error={error}
        />
      </section>
    </>
  );
}

export default DashboardPage;
