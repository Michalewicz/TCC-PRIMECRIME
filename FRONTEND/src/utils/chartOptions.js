import { formatCompactCount, formatCount, formatDecimal, formatPercent } from './format';

export const CHART_LOCALE = 'pt-BR';

export function getChartTheme(isDark) {
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

function percentageOf(value, values) {
  const total = values.reduce((sum, current) => sum + current, 0);
  return total ? (value / total) * 100 : 0;
}

function createTooltipOptions(theme, extra = {}) {
  return {
    backgroundColor: theme.tooltip,
    titleColor: theme.text,
    bodyColor: theme.text,
    ...extra,
  };
}

function createBaseOptions(theme, tooltipCallbacks) {
  return {
    locale: CHART_LOCALE,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: createTooltipOptions(theme, { callbacks: tooltipCallbacks }),
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

/** Vertical bars on a logarithmic axis; `details[i]` is an extra tooltip line for bar i. */
export function createCrimeTypeBarOptions(theme, { maxValue, details = [] }) {
  const base = createBaseOptions(theme, {
    label: (context) => formatCount(context.parsed.y),
    afterLabel: (context) => details[context.dataIndex],
  });
  return {
    ...base,
    scales: {
      ...base.scales,
      y: {
        ...base.scales.y,
        type: 'logarithmic',
        min: 1,
        max: maxValue > 0 ? Math.ceil(maxValue * 1.1) : undefined,
        ticks: {
          ...base.scales.y.ticks,
          autoSkip: true,
          maxTicksLimit: 7,
          // Only powers of ten get a tick label (1, 10, 100, 1 mil, ...).
          callback: (value) => {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue) || numericValue <= 0) return '';
            return Number.isInteger(Math.log10(numericValue)) ? formatCompactCount(numericValue) : '';
          },
        },
      },
    },
  };
}

export function createMonthLineOptions(theme) {
  const base = createBaseOptions(theme, {
    label: (context) => formatCount(context.parsed.y),
  });
  return {
    ...base,
    scales: {
      ...base.scales,
      y: {
        ...base.scales.y,
        ticks: {
          ...base.scales.y.ticks,
          callback: (value) => formatCompactCount(value),
        },
      },
    },
  };
}

export function createLocationBarOptions(theme) {
  const base = createBaseOptions(theme, {
    label: (context) => formatCount(context.parsed.x),
  });
  return { ...base, indexAxis: 'y' };
}

export function createRateBarOptions(theme) {
  const base = createBaseOptions(theme, {
    label: (context) => `${formatDecimal(context.parsed.x)} / 100 mil hab.`,
  });
  return { ...base, indexAxis: 'y' };
}

/**
 * Doughnut whose arc sizes may be scaled, so tooltips and labels read the real `values`.
 * `percentages` (when given) override the share computed from `values`, which is wrong whenever
 * the dataset is capped (e.g. top 15). `hidden` lists slice indexes toggled off in the legend.
 */
export function createDoughnutOptions(theme, { values, percentages, hidden = new Set(), minLabelPercent, details = [] }) {
  const shareOf = (index) => percentages?.[index] ?? percentageOf(values[index] ?? 0, values);

  return {
    locale: CHART_LOCALE,
    responsive: true,
    maintainAspectRatio: false,
    radius: '85%',
    plugins: {
      tooltip: createTooltipOptions(theme, {
        position: 'nearest',
        xAlign: 'center',
        yAlign: 'bottom',
        caretPadding: 20,
        callbacks: {
          label: (context) => {
            const value = values[context.dataIndex] ?? 0;
            return `${context.label}: ${formatCount(value)} (${formatPercent(shareOf(context.dataIndex))})`;
          },
          afterLabel: (context) => details[context.dataIndex],
        },
      }),
      datalabels: {
        color: theme.text,
        font: { size: 11, weight: 'bold' },
        formatter: (_value, context) => {
          if (hidden.has(context.dataIndex)) return '';
          const share = shareOf(context.dataIndex);
          return share >= minLabelPercent ? formatPercent(share) : '';
        },
      },
    },
  };
}
