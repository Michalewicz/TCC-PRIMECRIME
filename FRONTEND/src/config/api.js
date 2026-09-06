export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

export function fetchCrimeTypes() {
  return getJson('/api/crime-types');
}

export function fetchSeverities() {
  return getJson('/api/severities');
}

export function fetchMunicipalities() {
  return getJson('/api/municipalities');
}

export function fetchNeighborhoods(ibgeId) {
  return getJson(`/api/municipalities/${ibgeId}/neighborhoods`);
}

export function fetchCrimeStatistics({ crimeTypes, municipalityIds, neighborhoodIds, severities, startDate, endDate } = {}) {
  const params = new URLSearchParams();
  (crimeTypes ?? []).forEach((value) => params.append('crime_type', value));
  (municipalityIds ?? []).forEach((value) => params.append('ibge_id', value));
  (neighborhoodIds ?? []).forEach((value) => params.append('neighborhood_id', value));
  (severities ?? []).forEach((value) => params.append('severity', value));
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);

  const query = params.toString();
  return getJson(`/api/crimes/statistics${query ? `?${query}` : ''}`);
}
