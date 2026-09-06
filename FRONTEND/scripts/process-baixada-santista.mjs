/**
 * Builds the Baixada Santista map layers from src/data/baixada santista1.geojson:
 *  - public/baixada-santista-neighborhoods.geojson (one polygon per bairro)
 *  - public/baixada-santista-municipalities.geojson (bairro polygons dissolved per city)
 *
 * Run from the FRONTEND folder:
 *   node scripts/process-baixada-santista.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dissolve } from '@turf/dissolve';
import { featureCollection, polygon } from '@turf/helpers';

const __dir = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dir, '..', 'src', 'data', 'baixada santista1.geojson');
const NEIGHBORHOODS_OUTPUT = resolve(__dir, '..', 'public', 'baixada-santista-neighborhoods.geojson');
const MUNICIPALITIES_OUTPUT = resolve(__dir, '..', 'public', 'baixada-santista-municipalities.geojson');

const PRECISION = 1e6; // ~11 cm — trims IBGE's excessive floating point noise

function roundPt([lng, lat]) {
  return [Math.round(lng * PRECISION) / PRECISION, Math.round(lat * PRECISION) / PRECISION];
}

function roundRing(ring) {
  return ring.map(roundPt);
}

function isValidPolygon(geometry) {
  return (
    geometry?.type === 'Polygon' &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length > 0 &&
    geometry.coordinates[0].length >= 4
  );
}

console.log('Reading', INPUT);
const raw = readFileSync(INPUT, 'utf-8');
const data = JSON.parse(raw);

const validFeatures = data.features.filter((f) => isValidPolygon(f.geometry));
console.log(`Kept ${validFeatures.length}/${data.features.length} features with valid geometry.`);

// ─── Neighborhoods layer ──────────────────────────────────────────────────────
const neighborhoodFeatures = validFeatures.map((f) => ({
  type: 'Feature',
  properties: {
    ibge_id: Number(f.properties.CD_MUN),
    municipality_name: f.properties.NM_MUN,
    neighborhood_name: f.properties.NM_BAIRRO,
  },
  geometry: {
    type: 'Polygon',
    coordinates: f.geometry.coordinates.map(roundRing),
  },
}));

writeFileSync(
  NEIGHBORHOODS_OUTPUT,
  JSON.stringify({ type: 'FeatureCollection', features: neighborhoodFeatures }),
  'utf-8'
);
console.log(`Written ${neighborhoodFeatures.length} neighborhoods to ${NEIGHBORHOODS_OUTPUT}`);

// ─── Municipalities layer (dissolve bairros sharing the same CD_MUN) ─────────
const municipalityNames = new Map();
for (const f of validFeatures) {
  municipalityNames.set(f.properties.CD_MUN, f.properties.NM_MUN);
}

const dissolveInput = featureCollection(
  validFeatures.map((f) =>
    polygon(f.geometry.coordinates, { CD_MUN: f.properties.CD_MUN })
  )
);

console.log('Dissolving bairro polygons into municipality territories…');
const dissolved = dissolve(dissolveInput, { propertyName: 'CD_MUN' });

const municipalityFeatures = dissolved.features.map((f) => {
  const cdMun = f.properties.CD_MUN;
  return {
    type: 'Feature',
    properties: {
      ibge_id: Number(cdMun),
      municipality_name: municipalityNames.get(cdMun),
    },
    geometry: {
      type: f.geometry.type,
      coordinates:
        f.geometry.type === 'Polygon'
          ? f.geometry.coordinates.map(roundRing)
          : f.geometry.coordinates.map((poly) => poly.map(roundRing)),
    },
  };
});

writeFileSync(
  MUNICIPALITIES_OUTPUT,
  JSON.stringify({ type: 'FeatureCollection', features: municipalityFeatures }),
  'utf-8'
);
console.log(`Written ${municipalityFeatures.length} municipalities to ${MUNICIPALITIES_OUTPUT}`);
