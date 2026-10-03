/**
 * Chart palettes (dark -> light) for crime types, keyed by the severity they belong to.
 * Keys follow the severities produced by SCRIPTS/extract.py (compared without accents or case);
 * add an entry here to give a new severity its own hue.
 */
export const SEVERITY_PALETTES = {
  MORTE: ['#87122F', '#AD1833', '#D31D32', '#E43740', '#E9605D', '#EE8C84'],
  HEDIONDO: ['#502079', '#70299B', '#9532BD', '#B44CCF', '#CB6ED8', '#DE90E2'],
  ROUBO: ['#932D06', '#BC4308', '#E65C0A', '#F67E25', '#F89F4F', '#F9BC78'],
  FURTO: ['#0E5D8B', '#126DB3', '#1678DA', '#3081EB', '#588FEE', '#7FA2F2'],
  'LESAO CORPORAL': ['#936006', '#BC8508', '#E6AD0A', '#F6CA25', '#F8DD4F', '#F9EB78'],
  'PORTE ARMA': ['#1C7D6B', '#23A18F', '#2BC5B6', '#45D6D0', '#68DDDE', '#8CE1E6'],
  ENTORPECENTES: ['#1F7A36', '#279D4D', '#30C067', '#49D287', '#6CDAA5', '#8FE3C0'],
};

/** Neutral palette for crime types whose severity is unknown or has no palette above. */
export const FALLBACK_SEVERITY = 'OUTROS';
export const FALLBACK_PALETTE = ['#424D57', '#546170', '#677689', '#7E8A9D', '#96A0B0', '#AFB6C3'];
