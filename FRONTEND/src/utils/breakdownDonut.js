import { getCategoryColors } from './chartColors';
import { formatCount, formatPercent } from './format';

/**
 * Interactive donut + legend shown inside the map tooltips, in the style of the charts page:
 * same stable colours, percentage labels on the slices, hover highlight and click-to-hide.
 * The markup is a plain string (Leaflet tooltips are HTML); `attachBreakdownInteraction` wires it up.
 */

const CENTER = 42;
const OUTER_RADIUS = 38;
const INNER_RADIUS = 21;
const LABEL_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;
const MIN_LABEL_PERCENT = 7;

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function pointOnCircle(radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return [CENTER + Math.cos(radians) * radius, CENTER + Math.sin(radians) * radius];
}

/** Inner SVG markup: slices, percentage labels and the centre readout (`focus` = hovered index). */
function renderDonut(rows, hidden, focus) {
  const visibleTotal = rows.reduce((sum, row, index) => (hidden.has(index) ? sum : sum + row.total), 0);
  const focusRow = focus != null && !hidden.has(focus) ? rows[focus] : null;
  const slices = [];
  const labels = [];
  let currentAngle = -90;

  rows.forEach((row, index) => {
    if (hidden.has(index) || !visibleTotal) return;
    const share = (row.total / visibleTotal) * 100;
    // A single slice can't be drawn as one arc (start === end), so stop just short of a full turn.
    const angle = Math.min((row.total / visibleTotal) * 360, 359.99);
    const endAngle = currentAngle + angle;
    const [outerStartX, outerStartY] = pointOnCircle(OUTER_RADIUS, currentAngle);
    const [outerEndX, outerEndY] = pointOnCircle(OUTER_RADIUS, endAngle);
    const [innerEndX, innerEndY] = pointOnCircle(INNER_RADIUS, endAngle);
    const [innerStartX, innerStartY] = pointOnCircle(INNER_RADIUS, currentAngle);
    const largeArc = angle > 180 ? 1 : 0;
    const active = index === focus ? ' is-active' : '';
    slices.push(`<path class="crime-tooltip-slice${active}" data-index="${index}" fill="${row.color}" d="M ${outerStartX} ${outerStartY} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 1 ${outerEndX} ${outerEndY} L ${innerEndX} ${innerEndY} A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${innerStartX} ${innerStartY} Z"><title>${escapeHtml(row.name)}: ${formatCount(row.total)} (${formatPercent(share)})</title></path>`);
    if (share >= MIN_LABEL_PERCENT) {
      const [labelX, labelY] = pointOnCircle(LABEL_RADIUS, currentAngle + angle / 2);
      labels.push(`<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="central">${formatPercent(share)}</text>`);
    }
    currentAngle = endAngle;
  });

  const [mainText, subText] = focusRow
    ? [formatPercent((focusRow.total / visibleTotal) * 100), formatCount(focusRow.total)]
    : [formatCount(visibleTotal), 'total'];
  const centre = `<text class="crime-tooltip-donut-centre" x="${CENTER}" y="${CENTER - 3}" text-anchor="middle" dominant-baseline="central">${mainText}</text>`
    + `<text class="crime-tooltip-donut-sub" x="${CENTER}" y="${CENTER + 6}" text-anchor="middle" dominant-baseline="central">${subText}</text>`;

  return `${slices.join('')}${labels.join('')}${centre}`;
}

/** `rows` are { name, total } sorted as they should be listed. */
export function buildBreakdownDonut(rows, {
  label = 'Ocorrências por bairro',
  emptyMessage = 'Sem ocorrências nos bairros para estes filtros',
} = {}) {
  if (!rows.length || !rows.some((row) => row.total > 0)) {
    return `<div class="crime-tooltip-breakdown-empty">${escapeHtml(emptyMessage)}</div>`;
  }

  const colors = getCategoryColors(rows.map((row) => row.name));
  const coloredRows = rows.map((row, index) => ({ name: row.name, total: row.total, color: colors[index] }));

  const legend = coloredRows.map((row, index) => `
    <button type="button" class="crime-tooltip-neighborhood-row" data-index="${index}" aria-pressed="true" title="${escapeHtml(row.name)}">
      <span class="crime-tooltip-neighborhood-swatch" style="background:${row.color}"></span>
      <span class="crime-tooltip-neighborhood-name">${escapeHtml(row.name)}</span>
      <span class="crime-tooltip-neighborhood-value">${formatCount(row.total)}</span>
    </button>`).join('');

  return `
    <div class="crime-tooltip-breakdown" data-rows="${escapeHtml(JSON.stringify(coloredRows))}">
      <svg class="crime-tooltip-donut" viewBox="0 0 84 84" role="img" aria-label="${escapeHtml(label)}">${renderDonut(coloredRows, new Set(), null)}</svg>
      <div class="crime-tooltip-neighborhoods">${legend}</div>
    </div>`;
}

/**
 * Makes the breakdown inside `root` (a tooltip element) interactive: hovering a slice or a legend
 * entry highlights it, clicking hides/shows it (the ring then redistributes among what is left).
 */
export function attachBreakdownInteraction(root) {
  const breakdown = root?.querySelector('.crime-tooltip-breakdown');
  if (!breakdown || breakdown.dataset.interactive) return;
  breakdown.dataset.interactive = 'true';

  const rows = JSON.parse(breakdown.dataset.rows);
  const svg = breakdown.querySelector('svg');
  const hidden = new Set();
  let focus = null;

  const render = () => {
    svg.innerHTML = renderDonut(rows, hidden, focus);
    breakdown.classList.toggle('has-focus', focus != null && !hidden.has(focus));
    breakdown.querySelectorAll('.crime-tooltip-neighborhood-row').forEach((button) => {
      const index = Number(button.dataset.index);
      button.classList.toggle('is-hidden', hidden.has(index));
      button.classList.toggle('is-active', index === focus && !hidden.has(index));
      button.setAttribute('aria-pressed', String(!hidden.has(index)));
    });
  };

  const indexOf = (event) => {
    const target = event.target.closest?.('[data-index]');
    return target && breakdown.contains(target) ? Number(target.dataset.index) : null;
  };

  breakdown.addEventListener('pointerover', (event) => {
    const index = indexOf(event);
    if (index === focus) return;
    focus = index;
    render();
  });
  breakdown.addEventListener('pointerleave', () => {
    if (focus == null) return;
    focus = null;
    render();
  });
  breakdown.addEventListener('click', (event) => {
    const index = indexOf(event);
    if (index == null) return;
    if (hidden.has(index)) hidden.delete(index);
    else if (hidden.size < rows.length - 1) hidden.add(index);
    render();
  });
}
