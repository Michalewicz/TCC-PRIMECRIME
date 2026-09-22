import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LogarithmicScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LogarithmicScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Tooltip,
  ChartDataLabels
);

// Shared across bar and doughnut charts so the same category always gets the same color.
const PALETTE = [
  '#7c5cff', '#6f8cff', '#5f9dff', '#50adff', '#42bdf2',
  '#8a63d8', '#756ed9', '#6485e6', '#579fe8', '#48b8df',
];

function percentageOf(value, dataArr) {
  const total = dataArr.reduce((sum, v) => sum + v, 0);
  return total ? (value / total) * 100 : 0;
}

function formatCompactNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';
  if (Math.abs(numericValue) >= 1000) {
    return `${Number((numericValue / 1000).toFixed(1))} mil`;
  }
  return String(numericValue);
}

function getChartTheme(isDark) {
  return isDark
    ? {
        text: '#f5f7fb',
        grid: 'rgba(245, 247, 251, 0.08)',
        axis: '#f5f7fb',
        doughnutBorder: '#f5f7fb',
        tooltip: '#0b1a2b',
      }
    : {
        text: '#111827',
        grid: 'rgba(17, 24, 39, 0.16)',
        axis: '#111827',
        doughnutBorder: '#111827',
        tooltip: '#ffffff',
      };
}

function createBaseOptions(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: theme.tooltip, titleColor: theme.text, bodyColor: theme.text },
      datalabels: { display: false },
    },
    scales: {
      x: {
        ticks: { color: theme.text },
        grid: { color: theme.grid },
        border: { color: theme.axis },
      },
      y: {
        ticks: { color: theme.text },
        grid: { color: theme.grid },
        border: { color: theme.axis },
        beginAtZero: true,
      },
    },
  };
}

function createDoughnutOptions(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    radius: '85%',
    plugins: {
      legend: { position: 'right', labels: { color: theme.text, boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        position: 'nearest',
        xAlign: 'center',
        yAlign: 'bottom',
        caretPadding: 20,
        backgroundColor: theme.tooltip,
        titleColor: theme.text,
        bodyColor: theme.text,
        callbacks: {
          label: (context) => {
            const pct = percentageOf(context.parsed, context.dataset.data);
            return `${context.label}: ${context.parsed} (${pct.toFixed(1)}%)`;
          },
        },
      },
      datalabels: {
        color: theme.text,
        font: { size: 11, weight: 'bold' },
        formatter: (value, context) => {
          const pct = percentageOf(value, context.dataset.data);
          return pct >= 4 ? `${pct.toFixed(1)}%` : '';
        },
      },
    },
  };
}

function paletteColors(count) {
  return Array.from({ length: count }, (_, i) => PALETTE[i % PALETTE.length]);
}

function buildCrimeTypeDoughnutOptions(values, theme) {
  const doughnutOptions = createDoughnutOptions(theme);
  return {
    ...doughnutOptions,
    plugins: {
      ...doughnutOptions.plugins,
      tooltip: {
        ...doughnutOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const value = values[context.dataIndex] ?? 0;
            const pct = percentageOf(value, values);
            return `${context.label}: ${value} (${pct.toFixed(1)}%)`;
          },
        },
      },
      datalabels: {
        ...doughnutOptions.plugins.datalabels,
        formatter: (_value, context) => {
          const value = values[context.dataIndex] ?? 0;
          const pct = percentageOf(value, values);
          return pct >= 1 ? `${pct.toFixed(1)}%` : '';
        },
      },
    },
  };
}

/** Doughnut options whose tooltip/labels read the backend-computed percentage for each row
 *  (accurate even when `by_location` is capped to the top 15 entries). */
function buildLocationDoughnutOptions(percentages, theme) {
  const doughnutOptions = createDoughnutOptions(theme);
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

function createRateBarOptions(theme) {
  const baseOptions = createBaseOptions(theme);
  return {
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
}


function locationChartTitle(filters) {
  if (filters.neighborhoodIds.length > 0) return null;
  return filters.municipalityIds.length > 0 ? 'Ocorrências por bairro' : 'Ocorrências por município (top 15)';
}

function ChartCard({ className = '', title, empty, children }) {
  return (
    <div className={`chart-card ${className}`.trim()}>
      <h3>{title}</h3>
      <div className="chart-canvas">
        {empty ? <p className="chart-empty">Sem dados para os filtros selecionados</p> : children}
      </div>
    </div>
  );
}

function ChartsPanel({ statistics, filters, isDark, loading, error }) {
  const { total, by_crime_type: byCrimeType, by_month: byMonth, by_location: byLocation } = statistics;
  const locationTitle = locationChartTitle(filters);
  const chartTheme = getChartTheme(isDark);
  const baseOptions = createBaseOptions(chartTheme);
  const crimeTypeMax = Math.max(...byCrimeType.map((row) => row.total), 0);
  const crimeTypeOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        type: 'logarithmic',
        min: 1,
        max: crimeTypeMax > 0 ? Math.ceil(crimeTypeMax * 1.1) : undefined,
        ticks: {
          ...baseOptions.scales.y.ticks,
          autoSkip: true,
          maxTicksLimit: 7,
          callback: (value) => {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue) || numericValue <= 0) return '';

            const exponent = Math.log10(numericValue);
            if (!Number.isInteger(exponent)) return '';

            if (numericValue >= 1000) {
              return `${numericValue / 1000} mil`;
            }
            return String(numericValue);
          },
        },
      },
    },
  };
  const monthOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: (value) => formatCompactNumber(value),
        },
      },
    },
  };
  const doughnutOptions = createDoughnutOptions(chartTheme);
  const crimeTypeValues = byCrimeType.map((row) => row.total);
  const crimeTypeDoughnutOptions = buildCrimeTypeDoughnutOptions(crimeTypeValues, chartTheme);
  const rateBarOptions = createRateBarOptions(chartTheme);

  const crimeTypeData = {
    labels: byCrimeType.map((row) => row.crime_type),
    datasets: [{
      data: byCrimeType.map((row) => row.total),
      backgroundColor: paletteColors(byCrimeType.length),
    }],
  };

  const monthData = {
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
  };

  const locationData = {
    labels: byLocation.map((row) => row.name),
    datasets: [{
      data: byLocation.map((row) => row.total),
      backgroundColor: paletteColors(byLocation.length),
      barThickness: 24,
    }],
  };

  const crimeTypeShareData = {
    labels: byCrimeType.map((row) => row.crime_type),
    datasets: [{
      data: byCrimeType.map((row) => Math.log10(row.total + 1)),
      backgroundColor: paletteColors(byCrimeType.length),
      borderWidth: 0,
      hoverBorderWidth: 0,
    }],
  };

  const locationShareData = {
    labels: byLocation.map((row) => row.name),
    datasets: [{
      data: byLocation.map((row) => row.total),
      backgroundColor: paletteColors(byLocation.length),
      borderWidth: 0,
      hoverBorderWidth: 0,
    }],
  };
  const locationPercentages = byLocation.map((row) => row.percentage ?? 0);
  const locationDoughnutOptions = buildLocationDoughnutOptions(locationPercentages, chartTheme);

  const homicideRateRows = byLocation.filter((row) => row.homicide_rate_per_100k != null);
  const homicideRateData = {
    labels: homicideRateRows.map((row) => row.name),
    datasets: [
      {
        data: homicideRateRows.map((row) => row.homicide_rate_per_100k),
        backgroundColor: paletteColors(homicideRateRows.length),
        barThickness: 24,
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
        <ChartCard className="crime-type-chart" title="Ocorrências por tipo de crime" empty={!loading && byCrimeType.length === 0}>
          <Bar data={crimeTypeData} options={crimeTypeOptions} />
        </ChartCard>

        <ChartCard className="doughnut-chart" title="Proporção por tipo de crime" empty={!loading && byCrimeType.length === 0}>
          <Doughnut data={crimeTypeShareData} options={crimeTypeDoughnutOptions} />
        </ChartCard>

        <ChartCard className="month-chart" title="Ocorrências por mês" empty={!loading && byMonth.length === 0}>
          <Line data={monthData} options={monthOptions} />
        </ChartCard>

        {locationTitle && (
          <ChartCard title={locationTitle} empty={!loading && byLocation.length === 0}>
            <Bar data={locationData} options={{ ...baseOptions, indexAxis: 'y' }} />
          </ChartCard>
        )}

        {locationTitle && (
          <ChartCard className="doughnut-chart" title={`Proporção ${locationTitle.replace('Ocorrências ', '')}`} empty={!loading && byLocation.length === 0}>
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
