import { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import './charts/chartSetup';
import ChartCard from './charts/ChartCard';
import DoughnutChart from './charts/DoughnutChart';
import { useTheme } from '../contexts/ThemeContext';
import { buildCrimeTypeStyles, getCategoryColors, UNKNOWN_CRIME_TYPE_STYLE } from '../utils/chartColors';
import {
  createCrimeTypeBarOptions,
  createLocationBarOptions,
  createMonthLineOptions,
  createRateBarOptions,
  getChartTheme,
} from '../utils/chartOptions';
import { numberFormatter } from '../utils/format';

function locationChartTitle(filters) {
  if (filters.neighborhoodIds.length > 0) return null;
  return filters.municipalityIds.length > 0 ? 'Ocorrências por bairro' : 'Ocorrências por município (top 15)';
}

const sumTotals = (rows) => rows.reduce((sum, row) => sum + row.total, 0);

/** `crimeTypes` is the catalog ({ crime_type, severity }[]) that drives the colour of each crime type. */
function ChartsPanel({ statistics, filters, crimeTypes, loading, error }) {
  const { isDark } = useTheme();
  const theme = useMemo(() => getChartTheme(isDark), [isDark]);
  const crimeTypeStyles = useMemo(() => buildCrimeTypeStyles(crimeTypes), [crimeTypes]);

  const { total, by_crime_type: byCrimeType, by_month: byMonth, by_location: byLocation } = statistics;
  const locationTitle = locationChartTitle(filters);
  const totalCrimeTypeOccurrences = sumTotals(byCrimeType);
  const totalLocationOccurrences = sumTotals(byLocation);

  // ── Crime types: coloured by severity ──
  const crimeTypeRows = useMemo(() => byCrimeType.map((row) => ({
    ...row,
    ...(crimeTypeStyles.get(row.crime_type) ?? UNKNOWN_CRIME_TYPE_STYLE),
  })), [byCrimeType, crimeTypeStyles]);

  const crimeTypeSlices = useMemo(() => crimeTypeRows.map((row) => ({
    label: row.crime_type,
    size: Math.log10(row.total + 1),
    value: row.total,
    color: row.color,
    group: row.severity,
    detail: `Gravidade: ${row.severity}`,
  })), [crimeTypeRows]);

  const crimeTypeData = useMemo(() => ({
    labels: crimeTypeRows.map((row) => row.crime_type),
    datasets: [{
      data: crimeTypeRows.map((row) => row.total),
      backgroundColor: crimeTypeRows.map((row) => row.color),
    }],
  }), [crimeTypeRows]);

  const crimeTypeOptions = useMemo(() => createCrimeTypeBarOptions(theme, {
    maxValue: Math.max(...crimeTypeRows.map((row) => row.total), 0),
    details: crimeTypeRows.map((row) => `Gravidade: ${row.severity}`),
  }), [crimeTypeRows, theme]);

  // ── Months ──
  const monthData = useMemo(() => ({
    labels: byMonth.map((row) => row.month),
    datasets: [
      {
        data: byMonth.map((row) => row.total),
        borderColor: '#5f9dff',
        backgroundColor: 'rgba(95, 157, 255, 0.25)',
        fill: true,
        tension: 0.3,
      },
    ],
  }), [byMonth]);

  const monthOptions = useMemo(() => createMonthLineOptions(theme), [theme]);

  // ── Locations (municípios / bairros) ──
  const locationColors = useMemo(() => getCategoryColors(byLocation.map((row) => row.name)), [byLocation]);

  const locationSlices = useMemo(() => byLocation.map((row, index) => ({
    label: row.name,
    size: row.total,
    value: row.total,
    percentage: row.percentage ?? 0,
    color: locationColors[index],
  })), [byLocation, locationColors]);

  const locationData = useMemo(() => ({
    labels: byLocation.map((row) => row.name),
    datasets: [{
      data: byLocation.map((row) => row.total),
      backgroundColor: locationColors,
      barThickness: 24,
    }],
  }), [byLocation, locationColors]);

  const locationOptions = useMemo(() => createLocationBarOptions(theme), [theme]);

  const homicideRateData = useMemo(() => {
    const rows = byLocation.filter((row) => row.homicide_rate_per_100k != null);
    return {
      labels: rows.map((row) => row.name),
      datasets: [
        {
          data: rows.map((row) => row.homicide_rate_per_100k),
          backgroundColor: getCategoryColors(rows.map((row) => row.name)),
          barThickness: 24,
        },
      ],
    };
  }, [byLocation]);

  const rateBarOptions = useMemo(() => createRateBarOptions(theme), [theme]);

  return (
    <div className="charts-panel" aria-label="Gráficos de ocorrências">
      <div className="charts-summary" aria-live="polite">
        <h2>TOTAL DE OCORRÊNCIAS</h2>
        <strong>{loading ? '…' : numberFormatter.format(total)}</strong>
      </div>
      {error && <p className="filter-error">Não foi possível carregar as estatísticas do servidor.</p>}

      <div className="charts-groups">
        <section className="charts-group charts-group-doughnuts">
          <div className="charts-grid">
            <ChartCard className="doughnut-chart" title="Proporção por tipo de crime" empty={!loading && byCrimeType.length === 0}>
              <DoughnutChart
                slices={crimeTypeSlices}
                theme={theme}
                minLabelPercent={1}
                legendLabel="Legenda dos tipos de crime, agrupados por gravidade"
              />
            </ChartCard>
            {locationTitle && (
              <ChartCard className="doughnut-chart" title={`Proporção ${locationTitle.replace('Ocorrências ', '')}`} empty={!loading && byLocation.length === 0}>
                <DoughnutChart
                  slices={locationSlices}
                  theme={theme}
                  minLabelPercent={4}
                  legendLabel="Legenda das localidades"
                />
              </ChartCard>
            )}
          </div>
          <div className="charts-group-total">
            TOTAL DE OCORRÊNCIAS: {numberFormatter.format(totalCrimeTypeOccurrences)}
          </div>
        </section>

        <section className="charts-group charts-group-vertical">
          <div className="charts-grid">
            <ChartCard className="crime-type-chart" title="Ocorrências por tipo de crime" empty={!loading && byCrimeType.length === 0}>
              <Bar data={crimeTypeData} options={crimeTypeOptions} />
            </ChartCard>
            <ChartCard className="month-chart" title="Ocorrências por mês" empty={!loading && byMonth.length === 0}>
              <Line data={monthData} options={monthOptions} />
            </ChartCard>
          </div>
          <div className="charts-group-total">
            TOTAL DE OCORRÊNCIAS: {numberFormatter.format(totalCrimeTypeOccurrences)}
          </div>
        </section>

        <section className="charts-group charts-group-other">
          <div className="charts-grid">
            {locationTitle && (
              <ChartCard title={locationTitle} empty={!loading && byLocation.length === 0}>
                <Bar data={locationData} options={locationOptions} />
              </ChartCard>
            )}
            {locationTitle && (
              <ChartCard title="Taxa de homicídios por 100 mil habitantes" empty={!loading && homicideRateData.labels.length === 0}>
                <Bar data={homicideRateData} options={rateBarOptions} />
              </ChartCard>
            )}
          </div>
          <div className="charts-group-total">
            TOTAL DE OCORRÊNCIAS: {numberFormatter.format(totalLocationOccurrences)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChartsPanel;
