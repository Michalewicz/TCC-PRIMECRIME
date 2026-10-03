import { useCallback, useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import './chartSetup';
import ChartLegend from './ChartLegend';
import { createDoughnutOptions } from '../../utils/chartOptions';

const NO_HIDDEN_SLICES = new Set();

/**
 * Doughnut with an HTML legend: it scrolls by itself, hovering an entry highlights its slice and
 * clicking it hides/shows the slice.
 * `slices` must be memoized (hidden slices are forgotten whenever it changes). Each slice is
 * { label, size, value, color, percentage?, group?, detail? }: `size` is the arc size (it may be
 * scaled, e.g. logarithmically) while `value` is the real figure shown in tooltips and labels.
 */
function DoughnutChart({ slices, theme, minLabelPercent, legendLabel }) {
  const chartRef = useRef(null);
  const [hiddenState, setHiddenState] = useState({ source: slices, indexes: NO_HIDDEN_SLICES });
  const hidden = hiddenState.source === slices ? hiddenState.indexes : NO_HIDDEN_SLICES;

  const data = useMemo(() => ({
    labels: slices.map((slice) => slice.label),
    datasets: [{
      data: slices.map((slice, index) => (hidden.has(index) ? 0 : slice.size)),
      backgroundColor: slices.map((slice) => slice.color),
      borderWidth: 0,
      hoverBorderWidth: 0,
      hoverOffset: 8,
    }],
  }), [slices, hidden]);

  const options = useMemo(() => createDoughnutOptions(theme, {
    values: slices.map((slice) => slice.value),
    percentages: slices.map((slice) => slice.percentage),
    details: slices.map((slice) => slice.detail),
    hidden,
    minLabelPercent,
  }), [slices, theme, hidden, minLabelPercent]);

  const legendItems = useMemo(() => {
    const items = slices.map((slice, index) => ({
      index,
      label: slice.label,
      color: slice.color,
      group: slice.group,
      hidden: hidden.has(index),
    }));
    // Entries of a group must be adjacent: groups follow the order of their first slice in the ring.
    const groups = [...new Set(items.map((item) => item.group))];
    return items.sort((first, second) => groups.indexOf(first.group) - groups.indexOf(second.group));
  }, [slices, hidden]);

  const toggleSlice = useCallback((index) => {
    const next = new Set(hidden);
    if (!next.delete(index)) next.add(index);
    setHiddenState({ source: slices, indexes: next });
  }, [hidden, slices]);

  const highlightSlice = useCallback((index) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements(index == null ? [] : [{ datasetIndex: 0, index }]);
    chart.update();
  }, []);

  return (
    <div className="doughnut-layout">
      <div className="doughnut-canvas">
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
      <ChartLegend items={legendItems} label={legendLabel} onToggle={toggleSlice} onHighlight={highlightSlice} />
    </div>
  );
}

export default DoughnutChart;
