/**
 * Converts BR_Municipios_2025.json (GeometryCollection) into a browser-ready
 * GeoJSON FeatureCollection with simplified geometries and mock crime intensity.
 *
 * Run from the FRONTEND folder:
 *   node scripts/process-geo.mjs
 *
 * Output: public/br-municipalities.geojson  (~5-8 MB)
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const INPUT  = resolve(__dir, '..', 'BR_Municipios_2025.json');
const OUTPUT = resolve(__dir, '..', 'public', 'br-municipalities.geojson');

// Douglas-Peucker polyline simplification (works on [lng, lat] arrays)
function perpendicularDistance(pt, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return Math.sqrt((pt[0] - a[0]) ** 2 + (pt[1] - a[1]) ** 2);
  return Math.abs(dy * pt[0] - dx * pt[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

function douglasPeucker(pts, tol) {
  if (pts.length <= 2) return pts;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > tol) {
    const l = douglasPeucker(pts.slice(0, idx + 1), tol);
    const r = douglasPeucker(pts.slice(idx), tol);
    return [...l.slice(0, -1), ...r];
  }
  return [pts[0], pts[pts.length - 1]];
}

const PRECISION = 1000; // 3 decimal places ≈ 110 m
const TOLERANCE = 0.01; // ~1 km Douglas-Peucker tolerance

function roundPt(pt) {
  return [Math.round(pt[0] * PRECISION) / PRECISION, Math.round(pt[1] * PRECISION) / PRECISION];
}

function simplifyRing(ring) {
  const simplified = douglasPeucker(ring, TOLERANCE);
  // Ensure ring closure and minimum vertex count (GeoJSON requires ≥4)
  const rounded = simplified.map(roundPt);
  if (rounded.length < 4) return null;
  const first = rounded[0];
  const last  = rounded[rounded.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) rounded.push(first);
  return rounded;
}

function simplifyGeometry(geom) {
  if (!geom) return null;

  if (geom.type === 'Polygon') {
    const rings = geom.coordinates.map(simplifyRing).filter(Boolean);
    if (!rings.length) return null;
    return { type: 'Polygon', coordinates: rings };
  }

  if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates
      .map(poly => poly.map(simplifyRing).filter(Boolean))
      .filter(poly => poly.length > 0);
    if (!polys.length) return null;
    return { type: 'MultiPolygon', coordinates: polys };
  }

  return geom; // Point / other — leave as-is
}

// Seeded pseudo-random for reproducible demo intensities
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ──────────────────────────────────────────────────────────
console.log('Reading', INPUT);
const raw  = readFileSync(INPUT, 'utf-8');

console.log('Parsing JSON…');
const data = JSON.parse(raw);

const geometries = Array.isArray(data.geometries)
  ? data.geometries
  : Array.isArray(data.features)
    ? data.features.map(f => f.geometry)
    : [];

console.log(`Found ${geometries.length} geometries. Simplifying…`);

const rng = seededRandom(42);

const features = geometries
  .map((geom, i) => {
    const simplified = simplifyGeometry(geom);
    if (!simplified) return null;
    return {
      type: 'Feature',
      properties: {
        id: i,
        // intensity is mock crime data (0–1); replace with real backend data
        intensity: parseFloat(rng().toFixed(2)),
      },
      geometry: simplified,
    };
  })
  .filter(Boolean);

console.log(`Kept ${features.length} features after simplification.`);

const output = JSON.stringify({ type: 'FeatureCollection', features });

writeFileSync(OUTPUT, output, 'utf-8');

const sizeMB = (output.length / 1024 / 1024).toFixed(2);
console.log(`Written to ${OUTPUT}  (${sizeMB} MB)`);
