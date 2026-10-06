import { FALLBACK_PALETTE, FALLBACK_SEVERITY, SEVERITY_PALETTES } from '../config/severityPalettes';

// ── Categorical colours (locations): random but stable per label ──────────────

const CATEGORY_COLOR_CACHE = new Map();

function hslToHex(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = hue / 60;
  const second = chroma * (1 - Math.abs((section % 2) - 1));
  const offset = lightness - chroma / 2;
  const channels = section < 1 ? [chroma, second, 0]
    : section < 2 ? [second, chroma, 0]
      : section < 3 ? [0, chroma, second]
        : section < 4 ? [0, second, chroma]
          : section < 5 ? [second, 0, chroma]
            : [chroma, 0, second];
  return `#${channels.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

/** Picks, out of random candidates, the colour farthest from the ones already in use. */
function categoryColor(existingColors) {
  let bestColor = '#9852FF';
  let bestDistance = -1;
  const existingRgb = existingColors.map(hexToRgb);

  for (let attempt = 0; attempt < 64; attempt += 1) {
    const candidate = hslToHex(
      183 + Math.random() * 82,
      0.66 + Math.random() * 0.2,
      0.49 + Math.random() * 0.13
    );
    const candidateRgb = hexToRgb(candidate);
    const nearestDistance = existingRgb.length
      ? Math.min(...existingRgb.map((color) => color.reduce((sum, channel, index) => sum + ((channel - candidateRgb[index]) ** 2), 0)))
      : Infinity;

    if (nearestDistance > bestDistance) {
      bestColor = candidate;
      bestDistance = nearestDistance;
    }
  }
  return bestColor;
}

/** One colour per label; a label keeps its colour for the whole session. */
export function getCategoryColors(labels) {
  return labels.map((label) => {
    const key = String(label);
    if (!CATEGORY_COLOR_CACHE.has(key)) {
      CATEGORY_COLOR_CACHE.set(key, categoryColor([...CATEGORY_COLOR_CACHE.values()]));
    }
    return CATEGORY_COLOR_CACHE.get(key);
  });
}

// ── Crime-type colours: one palette per severity ──────────────────────────────

export const UNKNOWN_CRIME_TYPE_STYLE = Object.freeze({
  severity: FALLBACK_SEVERITY,
  color: FALLBACK_PALETTE[Math.floor((FALLBACK_PALETTE.length - 1) / 2)],
});

function normalizeKey(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

const SEVERITY_ORDER = Object.keys(SEVERITY_PALETTES);

/** Orders severities as in the palette table (unknown ones last) so each colour family stays contiguous. */
export function compareBySeverity(first, second) {
  const rank = (severity) => {
    const index = SEVERITY_ORDER.indexOf(normalizeKey(severity));
    return index === -1 ? SEVERITY_ORDER.length : index;
  };
  return rank(first) - rank(second);
}

/** Spreads `count` items across the palette so same-severity crime types stay easy to tell apart. */
function paletteIndex(position, count, paletteLength) {
  if (count <= 1) return Math.floor((paletteLength - 1) / 2);
  if (count > paletteLength) return position % paletteLength;
  return Math.round((position * (paletteLength - 1)) / (count - 1));
}

/**
 * Maps every crime type of the catalog ({ crime_type, severity }[]) to { severity, color }.
 * Built from the full catalog (not the filtered statistics) so a crime type keeps its colour
 * whatever filters are active.
 */
export function buildCrimeTypeStyles(crimeTypes = []) {
  const bySeverity = new Map();
  crimeTypes.forEach(({ crime_type: name, severity }) => {
    const key = normalizeKey(severity) || FALLBACK_SEVERITY;
    if (!bySeverity.has(key)) bySeverity.set(key, []);
    bySeverity.get(key).push({ name, severity: severity || FALLBACK_SEVERITY });
  });

  const styles = new Map();
  bySeverity.forEach((members, key) => {
    const palette = SEVERITY_PALETTES[key] ?? FALLBACK_PALETTE;
    [...members]
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'))
      .forEach(({ name, severity }, position) => {
        styles.set(name, { severity, color: palette[paletteIndex(position, members.length, palette.length)] });
      });
  });
  return styles;
}
