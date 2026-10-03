import { numberFormatter } from './format';

/**
 * Markup of the info cards shared by the map (Leaflet) and the chart tooltips.
 * Class names are styled by the `.crime-tooltip-*` rules in styles.css.
 */

export const BREAKDOWN_PALETTE = ['#7c5cff', '#6f8cff', '#5f9dff', '#50adff', '#42bdf2', '#8a63d8', '#756ed9', '#6485e6'];

const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function safeColor(color, fallback) {
  return HEX_COLOR.test(color ?? '') ? color : fallback;
}

function pointOnCircle(radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return [42 + Math.cos(radians) * radius, 42 + Math.sin(radians) * radius];
}

/** Donut plus scrollable legend. `rows` are { name, total, color? }; palette colours fill in the gaps. */
export function buildBreakdownHtml(rows, {
  label = 'Ocorrências por bairro',
  emptyMessage = 'Sem ocorrências nos bairros para estes filtros',
} = {}) {
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  if (!rows.length || !total) {
    return `<div class="crime-tooltip-breakdown-empty">${escapeHtml(emptyMessage)}</div>`;
  }

  const colorOf = (row, index) => safeColor(row.color, BREAKDOWN_PALETTE[index % BREAKDOWN_PALETTE.length]);
  let currentAngle = -90;
  const paths = [];

  rows.forEach((row, index) => {
    // A single slice can't be drawn as one arc (start === end), so stop just short of a full turn.
    const angle = Math.min((row.total / total) * 360, 359.99);
    const endAngle = currentAngle + angle;
    const outerStart = pointOnCircle(38, currentAngle);
    const outerEnd = pointOnCircle(38, endAngle);
    const innerEnd = pointOnCircle(21, endAngle);
    const innerStart = pointOnCircle(21, currentAngle);
    const largeArc = angle > 180 ? 1 : 0;
    paths.push(`<path d="M ${outerStart[0]} ${outerStart[1]} A 38 38 0 ${largeArc} 1 ${outerEnd[0]} ${outerEnd[1]} L ${innerEnd[0]} ${innerEnd[1]} A 21 21 0 ${largeArc} 0 ${innerStart[0]} ${innerStart[1]} Z" fill="${colorOf(row, index)}"/>`);
    currentAngle = endAngle;
  });

  const legend = rows.map((row, index) => `
    <div class="crime-tooltip-neighborhood-row">
      <span class="crime-tooltip-neighborhood-swatch" style="background:${colorOf(row, index)}"></span>
      <span class="crime-tooltip-neighborhood-name">${escapeHtml(row.name)}</span>
      <span class="crime-tooltip-neighborhood-value">${numberFormatter.format(row.total)}</span>
    </div>
  `).join('');

  return `
    <div class="crime-tooltip-breakdown">
      <svg class="crime-tooltip-donut" viewBox="0 0 84 84" role="img" aria-label="${escapeHtml(label)}">
        ${paths.join('')}
      </svg>
      <div class="crime-tooltip-neighborhoods">${legend}</div>
    </div>
  `;
}

/**
 * Card content: title, optional breakdown ({ rows, label? }), optional level row ({ color, label })
 * and metric lines (strings or { text, className }; the first one is the highlighted total).
 */
export function buildTooltipHtml({ title, breakdown, level, lines = [] }) {
  const breakdownHtml = breakdown?.rows?.length ? buildBreakdownHtml(breakdown.rows, breakdown) : '';
  const levelHtml = level
    ? `
    <div class="crime-tooltip-row">
      <span class="crime-tooltip-dot" style="background:${safeColor(level.color, '#9aa4b2')}"></span>
      <span class="crime-tooltip-level">${escapeHtml(level.label)}</span>
    </div>`
    : '';
  const linesHtml = lines.map((line, index) => {
    const { text, className } = typeof line === 'string'
      ? { text: line, className: index === 0 ? 'crime-tooltip-total' : 'crime-tooltip-percentage' }
      : line;
    return `
    <div class="${className}">${escapeHtml(text)}</div>`;
  }).join('');

  return `
    <div class="crime-tooltip-title">${escapeHtml(title)}</div>
    ${breakdownHtml}${levelHtml}${linesHtml}
  `;
}
