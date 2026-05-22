import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const requireTag = process.argv.includes('--require-tag');
const requireClean = process.argv.includes('--require-clean') || requireTag;

function readJson(file) {
  return JSON.parse(readFileSync(path.join(root, file), 'utf8'));
}

function git(args, fallback = '') {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (error) {
    if (process.env.RELEASE_ARTIFACTS_DEBUG) {
      console.debug(`git ${args.join(' ')} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return fallback;
  }
}

function command(commandName, args, fallback = '') {
  const candidates = process.platform === 'win32' ? [commandName, `${commandName}.cmd`] : [commandName];
  for (const candidate of candidates) {
    try {
      return execFileSync(candidate, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (error) {
      if (process.env.RELEASE_ARTIFACTS_DEBUG) {
        console.debug(`${candidate} ${args.join(' ')} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  return fallback;
}

function npmVersion() {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const match = userAgent.match(/npm\/([^\s]+)/);
  if (match?.[1]) {
    return match[1];
  }
  return command('npm', ['--version'], 'npm unavailable');
}

function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
}

function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    if (entry.isFile()) {
      return [fullPath];
    }
    return [];
  });
}

function packageNameFromLockPath(lockPath) {
  const parts = lockPath.split('node_modules/').filter(Boolean);
  const leaf = parts.at(-1);
  if (!leaf) {
    return null;
  }

  const segments = leaf.split('/');
  if (segments[0]?.startsWith('@') && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }
  return segments[0] ?? null;
}

function npmPurl(name, version) {
  const encodedName = name.startsWith('@')
    ? `%40${name.slice(1).replace('/', '/')}`
    : encodeURIComponent(name);
  return `pkg:npm/${encodedName}@${encodeURIComponent(version)}`;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
const commit = git(['rev-parse', 'HEAD'], 'unknown');
const shortCommit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], 'unknown');
const tag = git(['describe', '--tags', '--exact-match', 'HEAD'], '');
const status = git(['status', '--porcelain'], '');
const isDirty = status.length > 0;

if (requireTag && !tag) {
  console.error('release:artifacts requires HEAD to match an annotated or lightweight git tag.');
  process.exit(1);
}

if (requireClean && isDirty) {
  console.error('release:artifacts requires a clean worktree.');
  process.exit(1);
}

const releaseId = tag || `${pkg.version}-${shortCommit}`;
const outDir = path.join(root, 'release-artifacts', releaseId);
mkdirSync(outDir, { recursive: true });

const rootComponentRef = `pkg:npm/${pkg.name}@${pkg.version}`;
const components = Object.entries(lock.packages ?? {})
  .filter(([lockPath, info]) => lockPath && info?.version)
  .map(([lockPath, info]) => {
    const name = info.name ?? packageNameFromLockPath(lockPath);
    if (!name) {
      return null;
    }

    const component = {
      type: 'library',
      'bom-ref': npmPurl(name, info.version),
      name,
      version: info.version,
      purl: npmPurl(name, info.version),
      properties: [
        {
          name: 'crypto-toolkit:dependency-scope',
          value: info.dev ? 'development-or-build' : 'runtime',
        },
      ],
    };

    if (info.resolved) {
      component.externalReferences = [
        {
          type: 'distribution',
          url: info.resolved,
        },
      ];
    }

    return component;
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

const generatedAt = new Date().toISOString();
const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  serialNumber: `urn:uuid:${randomUUID()}`,
  version: 1,
  metadata: {
    timestamp: generatedAt,
    tools: {
      components: [
        {
          type: 'application',
          name: 'scripts/generate-release-artifacts.mjs',
          version: '1',
        },
      ],
    },
    component: {
      type: 'application',
      'bom-ref': rootComponentRef,
      name: pkg.name,
      version: pkg.version,
    },
  },
  components,
  properties: [
    {
      name: 'crypto-toolkit:release-boundary',
      value: 'Educational cryptography learning tool. SBOM is release transparency, not production cryptographic certification.',
    },
  ],
};

const sbomPath = path.join(outDir, `${pkg.name}-${pkg.version}.sbom.cdx.json`);
writeFileSync(sbomPath, `${JSON.stringify(sbom, null, 2)}\n`, 'utf8');

const trackedInputs = [
  'package.json',
  'package-lock.json',
  'README.md',
  'SECURITY.md',
  'public/_headers',
  'vercel.json',
].filter((file) => existsSync(path.join(root, file)));

const distFiles = walkFiles(path.join(root, 'dist'));
const subjectFiles = [
  ...trackedInputs.map((file) => path.join(root, file)),
  ...distFiles,
  sbomPath,
];

const subjects = subjectFiles.map((file) => ({
  path: toPosix(path.relative(root, file)),
  sha256: sha256(file),
  bytes: statSync(file).size,
}));

const provenance = {
  predicateType: 'https://mdpstudio.com.au/provenance/local-build/v1',
  generatedAt,
  subject: {
    name: pkg.name,
    version: pkg.version,
    releaseId,
    git: {
      commit,
      branch,
      tag: tag || null,
      dirty: isDirty,
    },
  },
  build: {
    node: process.version,
    npm: npmVersion(),
    commands: [
      'npm ci',
      'npm run ci',
      'npm run build',
      'npm run release:artifacts -- --require-tag --require-clean',
    ],
  },
  owaspMapping: [
    {
      id: 'OWASP Top 10:2025 A03',
      control: 'Software supply chain inventory through SBOM generation.',
      url: 'https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/',
    },
    {
      id: 'OWASP Top 10:2025 A08',
      control: 'Release integrity through checksum artifacts and provenance metadata.',
      url: 'https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/',
    },
  ],
  releaseBoundary: 'This provenance statement is unsigned local build metadata. It does not claim SLSA compliance or production-grade cryptography.',
  subjects,
};

const provenancePath = path.join(outDir, `${pkg.name}-${pkg.version}.provenance.local.json`);
writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');

const checksumTargets = [...subjectFiles, provenancePath].sort((a, b) =>
  toPosix(path.relative(root, a)).localeCompare(toPosix(path.relative(root, b))),
);
const checksumLines = checksumTargets.map((file) => `${sha256(file)}  ${toPosix(path.relative(root, file))}`);
const checksumPath = path.join(outDir, `${pkg.name}-${pkg.version}.sha256`);
writeFileSync(checksumPath, `${checksumLines.join('\n')}\n`, 'utf8');

console.log(`Release artifacts written to ${path.relative(root, outDir)}`);
console.log(`- ${path.relative(root, sbomPath)}`);
console.log(`- ${path.relative(root, provenancePath)}`);
console.log(`- ${path.relative(root, checksumPath)}`);
