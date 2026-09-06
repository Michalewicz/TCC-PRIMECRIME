import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Tooltip,
  ChartDataLabels
);

const TEXT_COLOR = '#f5f7fb';
const GRID_COLOR = 'rgba(245, 247, 251, 0.08)';
// Shared across bar and doughnut charts so the same category always gets the same color.
const PALETTE = [
  '#74c0fc', '#d7263d', '#f4b942', '#7ed957', '#2ec4b6',
  '#ff6b35', '#9a6fb0', '#4d96ff', '#ffd166', '#06d6a0',
];

function percentageOf(value, dataArr) {
  const total = dataArr.reduce((sum, v) => sum + v, 0);
  return total ? (value / total) * 100 : 0;
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#0b1a2b', titleColor: TEXT_COLOR, bodyColor: TEXT_COLOR },
    datalabels: { display: false },
  },
  scales: {
    x: { ticks: { color: TEXT_COLOR }, grid: { color: GRID_COLOR } },
    y: { ticks: { color: TEXT_COLOR }, grid: { color: GRID_COLOR }, beginAtZero: true },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { color: TEXT_COLOR, boxWidth: 12, font: { size: 11 } } },
    tooltip: {
      backgroundColor: '#0b1a2b',
      titleColor: TEXT_COLOR,
      bodyColor: TEXT_COLOR,
      callbacks: {
        label: (context) => {
          const pct = percentageOf(context.parsed, context.dataset.data);
          return `${context.label}: ${context.parsed} (${pct.toFixed(1)}%)`;
        },
      },
    },
    datalabels: {
      color: '#ffffff',
      font: { size: 11, weight: 'bold' },
      formatter: (value, context) => {
        const pct = percentageOf(value, context.dataset.data);
        return pct >= 4 ? `${pct.toFixed(1)}%` : '';
      },
    },
  },
};

function paletteColors(count) {
  return Array.from({ length: count }, (_, i) => PALETTE[i % PALETTE.length]);
}

/** Doughnut options whose tooltip/labels read the backend-computed percentage for each row
 *  (accurate even when `by_location` is capped to the top 15 entries). */
function buildLocationDoughnutOptions(percentages) {
  return {
    ...doughnutOptions,
    plugins: {
      ...doughnutOptions.plugins,
      tooltip: {
        ...doughnutOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const pct = percentages[context.dataIndex] ?? 0;
            return `${context.label}: ${context.parsed} (${pct.toFixed(1)}%)`;
          },
        },
      },
      datalabels: {
        ...doughnutOptions.plugins.datalabels,
        formatter: (_value, context) => {
          const pct = percentages[context.dataIndex] ?? 0;
          return pct >= 4 ? `${pct.toFixed(1)}%` : '';
        },
      },
    },
  };
}

const rateBarOptions = {
  ...baseOptions,
  indexAxis: 'y',
  plugins: {
    ...baseOptions.plugins,
    tooltip: {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        label: (context) => `${context.parsed.x.toFixed(1)} / 100 mil hab.`,
      },
    },
  },
};


function locationChartTitle(filters) {
  if (filters.neighborhoodIds.length > 0) return null;
  return filters.municipalityIds.length > 0 ? 'Ocorrências por bairro' : 'Ocorrências por município (top 15)';
}

function ChartCard({ title, empty, children }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-canvas">
        {empty ? <p className="chart-empty">Sem dados para os filtros selecionados</p> : children}
      </div>
    </div>
  );
}

function ChartsPanel({ statistics, filters, loading, error }) {
  const { total, by_crime_type: byCrimeType, by_month: byMonth, by_location: byLocation } = statistics;
  const locationTitle = locationChartTitle(filters);

  const crimeTypeData = {
    labels: byCrimeType.map((row) => row.crime_type),
    datasets: [{ data: byCrimeType.map((row) => row.total), backgroundColor: paletteColors(byCrimeType.length) }],
  };

  const monthData = {
    labels: byMonth.map((row) => row.month),
    datasets: [
      {
        data: byMonth.map((row) => row.total),
        borderColor: '#f4b942',
        backgroundColor: 'rgba(244, 185, 66, 0.25)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const locationData = {
    labels: byLocation.map((row) => row.name),
    datasets: [{ data: byLocation.map((row) => row.total), backgroundColor: paletteColors(byLocation.length) }],
  };

  const crimeTypeShareData = {
    labels: byCrimeType.map((row) => row.crime_type),
    datasets: [{ data: byCrimeType.map((row) => row.total), backgroundColor: paletteColors(byCrimeType.length) }],
  };

  const locationShareData = {
    labels: byLocation.map((row) => row.name),
    datasets: [{ data: byLocation.map((row) => row.total), backgroundColor: paletteColors(byLocation.length) }],
  };
  const locationPercentages = byLocation.map((row) => row.percentage ?? 0);
  const locationDoughnutOptions = buildLocationDoughnutOptions(locationPercentages);

  const homicideRateRows = byLocation.filter((row) => row.homicide_rate_per_100k != null);
  const homicideRateData = {
    labels: homicideRateRows.map((row) => row.name),
    datasets: [
      {
        data: homicideRateRows.map((row) => row.homicide_rate_per_100k),
        backgroundColor: paletteColors(homicideRateRows.length),
      },
    ],
  };

  return (
    <div className="charts-panel" aria-label="Gráficos de ocorrências">
      <div className="charts-summary">
        {loading ? 'Carregando estatísticas…' : `Total de ocorrências: ${total}`}
      </div>
      {error && <p className="filter-error">Não foi possível carregar as estatísticas do servidor.</p>}

      <div className="charts-grid">
        <ChartCard title="Ocorrências por tipo de crime" empty={!loading && byCrimeType.length === 0}>
          <Bar data={crimeTypeData} options={baseOptions} />
        </ChartCard>

        <ChartCard title="Proporção por tipo de crime" empty={!loading && byCrimeType.length === 0}>
          <Doughnut data={crimeTypeShareData} options={doughnutOptions} />
        </ChartCard>

        <ChartCard title="Ocorrências por mês" empty={!loading && byMonth.length === 0}>
          <Line data={monthData} options={baseOptions} />
        </ChartCard>

        {locationTitle && (
          <ChartCard title={locationTitle} empty={!loading && byLocation.length === 0}>
            <Bar data={locationData} options={{ ...baseOptions, indexAxis: 'y' }} />
          </ChartCard>
        )}

        {locationTitle && (
          <ChartCard title={`Proporção ${locationTitle.replace('Ocorrências ', '')}`} empty={!loading && byLocation.length === 0}>
            <Doughnut data={locationShareData} options={locationDoughnutOptions} />
          </ChartCard>
        )}

        {locationTitle && (
          <ChartCard
            title="Taxa de homicídios por 100 mil habitantes"
            empty={!loading && homicideRateRows.length === 0}
          >
            <Bar data={homicideRateData} options={rateBarOptions} />
          </ChartCard>
        )}
      </div>
    </div>
  );
}

export default ChartsPanel;
