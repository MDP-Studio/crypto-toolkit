import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  throw new Error('dist/index.html is missing. Run npm run build before the performance budget check.');
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const toDiskPath = assetPath => path.join(distDir, assetPath.replace(/^\//, ''));
const entryScriptMatch = indexHtml.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/);
const stylesheetMatch = indexHtml.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/);

if (!entryScriptMatch || !stylesheetMatch) {
  throw new Error('Could not identify the entry JavaScript and stylesheet in dist/index.html.');
}

const assetFiles = fs.readdirSync(path.join(distDir, 'assets'))
  .map(name => ({ name, filePath: path.join(distDir, 'assets', name) }))
  .filter(asset => fs.statSync(asset.filePath).isFile());
const javascriptAssets = assetFiles.filter(asset => asset.name.endsWith('.js'));
const entryScriptPath = toDiskPath(entryScriptMatch[1]);
const stylesheetPath = toDiskPath(stylesheetMatch[1]);

const bytes = filePath => fs.statSync(filePath).size;
const gzipBytes = filePath => gzipSync(fs.readFileSync(filePath), { level: 9 }).byteLength;
const kib = value => `${(value / 1024).toFixed(1)} KiB`;

const measurements = [
  {
    name: 'Entry JavaScript (raw)',
    actual: bytes(entryScriptPath),
    limit: 290 * 1024,
  },
  {
    name: 'Entry JavaScript (gzip)',
    actual: gzipBytes(entryScriptPath),
    limit: 90 * 1024,
  },
  {
    name: 'Entry CSS (raw)',
    actual: bytes(stylesheetPath),
    limit: 110 * 1024,
  },
  {
    name: 'Entry CSS (gzip)',
    actual: gzipBytes(stylesheetPath),
    limit: 18 * 1024,
  },
  {
    name: 'Largest JavaScript asset',
    actual: Math.max(...javascriptAssets.map(asset => bytes(asset.filePath))),
    limit: 300 * 1024,
  },
  {
    name: 'All JavaScript assets',
    actual: javascriptAssets.reduce((sum, asset) => sum + bytes(asset.filePath), 0),
    limit: 1100 * 1024,
  },
];

console.table(measurements.map(measurement => ({
  budget: measurement.name,
  actual: kib(measurement.actual),
  limit: kib(measurement.limit),
  status: measurement.actual <= measurement.limit ? 'PASS' : 'FAIL',
})));

const failures = measurements.filter(measurement => measurement.actual > measurement.limit);
if (failures.length > 0) {
  throw new Error(`Performance budget exceeded: ${failures.map(failure => failure.name).join(', ')}`);
}
