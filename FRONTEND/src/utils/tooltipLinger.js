/**
 * Chart.js plugin: keeps the tooltip on screen for a few seconds after the pointer leaves the
 * data (or the chart), so it can be read while the user moves around the chart.
 * Hovering another element replaces it immediately. Configure with `plugins.tooltipLinger.delay` (ms).
 */
const DEFAULT_DELAY_MS = 3000;

const states = new WeakMap();

function getState(chart) {
  let state = states.get(chart);
  if (!state) {
    state = { active: null, position: null, timer: null };
    states.set(chart, state);
  }
  return state;
}

function clearTimer(state) {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function isStillValid(chart, active) {
  return active.every(({ datasetIndex, index }) => (
    chart.data.datasets[datasetIndex] && chart.getDatasetMeta(datasetIndex).data[index]
  ));
}

function hide(chart) {
  const state = states.get(chart);
  if (!state) return;
  state.timer = null;
  state.active = null;
  if (!chart.ctx) return;
  chart.tooltip.setActiveElements([], { x: 0, y: 0 });
  chart.update();
}

export const tooltipLinger = {
  id: 'tooltipLinger',
  defaults: { delay: DEFAULT_DELAY_MS },

  afterEvent(chart, args, options) {
    // Replayed events (fired by chart.update) carry no new pointer information.
    if (args.replay || !chart.tooltip || !(options.delay > 0)) return;

    const state = getState(chart);
    const active = chart.tooltip.getActiveElements();

    if (active.length > 0) {
      clearTimer(state);
      state.active = active.map(({ datasetIndex, index }) => ({ datasetIndex, index }));
      state.position = { x: args.event.x, y: args.event.y };
      return;
    }

    if (!state.active) return;
    if (!isStillValid(chart, state.active)) {
      clearTimer(state);
      state.active = null;
      return;
    }

    chart.tooltip.setActiveElements(state.active, state.position);
    args.changed = true;
    if (!state.timer) state.timer = setTimeout(() => hide(chart), options.delay);
  },

  afterDestroy(chart) {
    const state = states.get(chart);
    if (!state) return;
    clearTimer(state);
    states.delete(chart);
  },
};
