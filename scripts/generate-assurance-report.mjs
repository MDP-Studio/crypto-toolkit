import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'src', 'data', 'module-assurance.json');
const outputPath = path.join(root, 'docs', 'assurance-matrix.md');

const expectedIds = [
  'ec-calculator',
  'rsa',
  'modular',
  'converter',
  'factorization',
  'ciphers',
  'ecdsa',
  'paillier',
  'elgamal',
  'rsa-attack',
  'substitution',
  'diffie-hellman',
  'aes',
  'nonce-reuse',
  'lwe',
  'schnorr',
  'aes-gcm',
  'argon2',
  'tls13',
  'padding-oracle',
  'textbook-rsa',
  'hash-extension',
  'shamir',
  'gcm-nonce',
  'hmac',
  'ecb-penguin',
  'dh-subgroup',
  'wiener',
  'curve-plot',
  'bleichenbacher',
  'coppersmith',
  'crt-fault',
  'birthday',
  'constant-time',
  'lll',
  'mitm',
];

const requiredFields = [
  'id',
  'title',
  'category',
  'evidenceLevel',
  'specSections',
  'vectorSources',
  'testIds',
  'limitations',
];

const validLevels = new Set(['strong', 'moderate', 'limited']);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readModules() {
  const modules = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  assert(Array.isArray(modules), 'Assurance data must be an array');
  return modules;
}

function validateModules(modules) {
  const seen = new Set();
  for (const module of modules) {
    for (const field of requiredFields) {
      assert(Object.hasOwn(module, field), `${module.id ?? 'unknown'} is missing ${field}`);
    }
    assert(typeof module.id === 'string' && module.id.length > 0, 'Module id must be a non-empty string');
    assert(!seen.has(module.id), `Duplicate assurance module id: ${module.id}`);
    seen.add(module.id);
    assert(typeof module.title === 'string' && module.title.length > 0, `${module.id} title must be present`);
    assert(typeof module.category === 'string' && module.category.length > 0, `${module.id} category must be present`);
    assert(validLevels.has(module.evidenceLevel), `${module.id} evidenceLevel must be strong, moderate, or limited`);
    for (const field of ['specSections', 'vectorSources', 'testIds', 'limitations']) {
      assert(Array.isArray(module[field]) && module[field].length > 0, `${module.id} ${field} must have at least one entry`);
      assert(module[field].every(value => typeof value === 'string' && value.trim().length > 0), `${module.id} ${field} entries must be strings`);
    }
  }

  const ids = new Set(modules.map(module => module.id));
  for (const expectedId of expectedIds) {
    assert(ids.has(expectedId), `Missing assurance entry for ${expectedId}`);
  }
  for (const id of ids) {
    assert(expectedIds.includes(id), `Unknown assurance id: ${id}`);
  }
}

function escapeCell(value) {
  return String(value)
    .replaceAll('|', '\\|')
    .replace(/\s+/g, ' ')
    .trim();
}

function joinCell(values) {
  return values.map(escapeCell).join('<br>');
}

function evidenceCounts(modules) {
  return modules.reduce((counts, module) => {
    counts[module.evidenceLevel] += 1;
    return counts;
  }, { strong: 0, moderate: 0, limited: 0 });
}

function renderReport(modules) {
  const sorted = [...modules].sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  const counts = evidenceCounts(sorted);
  const lines = [
    '# CryptoToolkit Assurance Matrix',
    '',
    'Generated from `src/data/module-assurance.json` by `npm run assurance`.',
    '',
    '## Summary',
    '',
    `- Modules covered: ${sorted.length}`,
    `- Strong evidence: ${counts.strong}`,
    `- Moderate evidence: ${counts.moderate}`,
    `- Limited evidence: ${counts.limited}`,
    '',
    'Evidence level means the current assurance quality for the educational module, not production cryptographic certification.',
    '',
    '## Matrix',
    '',
    '| Module | Category | Evidence | Spec section | Vector source | Test ID | Known limitations |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const module of sorted) {
    lines.push([
      `[${escapeCell(module.title)}](../#/${escapeCell(module.id)})`,
      escapeCell(module.category),
      escapeCell(module.evidenceLevel),
      joinCell(module.specSections),
      joinCell(module.vectorSources),
      joinCell(module.testIds),
      joinCell(module.limitations),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }

  lines.push(
    '',
    '## Maintenance Rules',
    '',
    '- Add or update the assurance entry whenever a module, route, test, spec anchor, or limitation changes.',
    '- Keep evidence levels conservative. Prefer limited over moderate when direct test coverage is missing.',
    '- Do not add new learning modules without adding an assurance entry and route smoke coverage.'
  );

  return `${lines.join('\n')}\n`;
}

const modules = readModules();
validateModules(modules);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, renderReport(modules), 'utf8');
console.log(`Generated ${path.relative(root, outputPath)} for ${modules.length} modules.`);
