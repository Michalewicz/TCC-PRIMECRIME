/** Risk bands shared by the map and the chart tooltips; `intensity` is a 0..1 share of the highest total in view. */
export function getRiskLevel(intensity) {
  if (intensity == null)    return { label: 'Sem dados',  color: '#9aa4b2' };
  if (intensity >= 0.8)     return { label: 'Muito alto', color: '#7f0000' };
  if (intensity >= 0.6)     return { label: 'Alto',       color: '#b71c1c' };
  if (intensity >= 0.4)     return { label: 'Médio',      color: '#e53935' };
  if (intensity >= 0.2)     return { label: 'Baixo',      color: '#ef9a9a' };
  return                           { label: 'Muito baixo',color: '#ffcdd2' };
}

export function getRiskColor(intensity) {
  return getRiskLevel(intensity).color;
}
