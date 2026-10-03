export const numberFormatter = new Intl.NumberFormat('pt-BR');
export const decimalFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 126229 -> "126.229" */
export const formatCount = (value) => numberFormatter.format(value);

/** 51.66 -> "51,7" */
export const formatDecimal = (value) => decimalFormatter.format(value);

/** 51.66 -> "51,7%" */
export const formatPercent = (value) => `${decimalFormatter.format(value)}%`;

/** 4500 -> "4,5 mil"; values under 1000 stay as plain counts. */
export function formatCompactCount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';
  if (Math.abs(numericValue) >= 1000) {
    return `${numberFormatter.format(Number((numericValue / 1000).toFixed(1)))} mil`;
  }
  return numberFormatter.format(numericValue);
}
