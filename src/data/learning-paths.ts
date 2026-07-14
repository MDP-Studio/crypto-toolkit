import type { Page } from '@/App';

export interface LearningPathStep {
  id: Page;
  label: string;
  purpose: string;
}

export interface LearningPath {
  id: string;
  title: string;
  audience: string;
  outcome: string;
  estimatedMinutes: number;
  steps: LearningPathStep[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'foundations',
    title: 'Build the foundations',
    audience: 'Start here',
    outcome: 'Move from encoding and modular arithmetic to an authenticated-encryption workflow.',
    estimatedMinutes: 75,
    steps: [
      { id: 'converter', label: 'Base & Encoding', purpose: 'Separate representation from encryption.' },
      { id: 'modular', label: 'Modular Arithmetic', purpose: 'Learn the arithmetic behind public-key systems.' },
      { id: 'diffie-hellman', label: 'Diffie-Hellman', purpose: 'Derive a shared secret over a public channel.' },
      { id: 'aes', label: 'AES Round', purpose: 'Inspect the block-cipher transformations.' },
      { id: 'aes-gcm', label: 'AES-GCM', purpose: 'Add authentication and understand nonce discipline.' },
    ],
  },
  {
    id: 'failure-modes',
    title: 'Break unsafe crypto',
    audience: 'Security practitioners',
    outcome: 'Follow concrete exploit paths from visible patterns to key and plaintext recovery.',
    estimatedMinutes: 90,
    steps: [
      { id: 'ecb-penguin', label: 'ECB Pattern Leakage', purpose: 'See why encryption without semantic security leaks structure.' },
      { id: 'nonce-reuse', label: 'ECDSA Nonce Reuse', purpose: 'Recover a signing key from repeated nonces.' },
      { id: 'gcm-nonce', label: 'GCM Nonce Reuse', purpose: 'Observe confidentiality and authentication failure.' },
      { id: 'padding-oracle', label: 'Padding Oracle', purpose: 'Recover CBC plaintext through an error oracle.' },
      { id: 'textbook-rsa', label: 'Textbook RSA', purpose: 'Exploit malleability when padding is absent.' },
      { id: 'rsa-attack', label: 'RSA Factoring', purpose: 'Connect weak key size to private-key recovery.' },
    ],
  },
  {
    id: 'production-judgment',
    title: 'Develop production judgment',
    audience: 'Builders and reviewers',
    outcome: 'Recognise implementation boundaries, migration risks, and the evidence needed before release.',
    estimatedMinutes: 65,
    steps: [
      { id: 'constant-time', label: 'Constant-Time Comparison', purpose: 'Identify timing leakage and its limits in JavaScript.' },
      { id: 'argon2', label: 'Argon2id', purpose: 'Choose memory-hard password hashing parameters.' },
      { id: 'tls13', label: 'TLS 1.3', purpose: 'Trace how mature primitives compose into a protocol.' },
      { id: 'crypto-agility', label: 'Crypto-Agility Lab', purpose: 'Make safe versioning and migration decisions.' },
      { id: 'assurance', label: 'Assurance Matrix', purpose: 'Review specs, vectors, tests, and known limitations.' },
    ],
  },
];

export const LEARNING_PATH_SCOPE_NOTICE =
  'These paths teach concepts and review judgment. They do not qualify the browser implementations for production use.';

export function findLearningPath(page: Page) {
  for (const path of LEARNING_PATHS) {
    const stepIndex = path.steps.findIndex(step => step.id === page);
    if (stepIndex >= 0) return { path, stepIndex };
  }
  return undefined;
}
