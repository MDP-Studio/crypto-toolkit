export type QuantumExposure = 'none' | 'monitor' | 'prioritize';

export interface CryptoInventoryItem {
  id: string;
  purpose: string;
  algorithmId: string;
  formatVersion: string;
  owner: string;
  dataLifetime: string;
  quantumExposure: QuantumExposure;
  migrationTarget: string;
  boundary: string;
}

export interface CryptoAgilityOption {
  id: string;
  label: string;
  explanation: string;
}

export interface CryptoAgilityScenario {
  id: string;
  title: string;
  prompt: string;
  correctOptionId: string;
  options: CryptoAgilityOption[];
}

export const CRYPTO_INVENTORY: CryptoInventoryItem[] = [
  {
    id: 'customer-records',
    purpose: 'Encrypt customer records at rest',
    algorithmId: 'A256GCM',
    formatVersion: 'record-envelope/v2',
    owner: 'Application platform',
    dataLifetime: '7 years',
    quantumExposure: 'none',
    migrationTarget: 'Keep AES-256-GCM; preserve explicit algorithm and version fields',
    boundary: 'Application envelope and KMS-managed data key',
  },
  {
    id: 'backup-key-wrap',
    purpose: 'Wrap long-lived backup data keys',
    algorithmId: 'RSA-OAEP-256',
    formatVersion: 'backup-envelope/v1',
    owner: 'Backup platform',
    dataLifetime: '10 years',
    quantumExposure: 'prioritize',
    migrationTarget: 'Pilot a standardized ML-KEM or provider-supported hybrid wrapping profile',
    boundary: 'Backup writer, restore reader, and external KMS/HSM',
  },
  {
    id: 'api-signatures',
    purpose: 'Sign deployment approvals',
    algorithmId: 'Ed25519',
    formatVersion: 'approval-signature/v1',
    owner: 'Release engineering',
    dataLifetime: '5 years',
    quantumExposure: 'monitor',
    migrationTarget: 'Inventory verifier support and plan a versioned ML-DSA or hybrid signature profile',
    boundary: 'Signer, policy service, audit archive, and offline verifier',
  },
  {
    id: 'transport',
    purpose: 'Protect browser-to-API transport',
    algorithmId: 'TLS1.3-ECDHE-P256-AES256GCM',
    formatVersion: 'provider-policy/2026-01',
    owner: 'Hosting provider',
    dataLifetime: 'Minutes in transit',
    quantumExposure: 'monitor',
    migrationTarget: 'Track provider hybrid key-exchange support; do not replace application primitives blindly',
    boundary: 'Browser, CDN, reverse proxy, and origin',
  },
  {
    id: 'passwords',
    purpose: 'Derive password verifiers',
    algorithmId: 'Argon2id-m65536-t3-p4',
    formatVersion: 'phc-string/v1',
    owner: 'Identity service',
    dataLifetime: 'Until password rotation',
    quantumExposure: 'none',
    migrationTarget: 'Retain parameter identifiers and rehash on successful authentication when policy changes',
    boundary: 'Identity service and credential database',
  },
];

export const CRYPTO_AGILITY_SCENARIOS: CryptoAgilityScenario[] = [
  {
    id: 'versioned-envelope',
    title: 'Change an encrypted-record format',
    prompt: 'You need to introduce a new AEAD profile without making old records unreadable. Which plan preserves agility and blocks downgrade?',
    correctOptionId: 'dual-read-single-write',
    options: [
      {
        id: 'silent-swap',
        label: 'Silently replace the primitive under the existing format version',
        explanation: 'Unsafe. Readers cannot tell which algorithm produced a record, and rollback can corrupt or misinterpret data.',
      },
      {
        id: 'dual-read-single-write',
        label: 'Add a new algorithm ID and version; read approved old versions, write only the new version, reject unknown or forbidden versions',
        explanation: 'Correct. The envelope is explicit, migration is observable, and downgrade policy is enforceable.',
      },
      {
        id: 'accept-any',
        label: 'Let readers try every installed cipher until one decrypts',
        explanation: 'Unsafe. Algorithm guessing creates ambiguous behavior and can re-enable retired profiles.',
      },
    ],
  },
  {
    id: 'harvest-now',
    title: 'Prioritize post-quantum migration',
    prompt: 'Which inventory item should be investigated first for harvest-now-decrypt-later exposure?',
    correctOptionId: 'long-lived-wrap',
    options: [
      {
        id: 'long-lived-wrap',
        label: 'RSA-wrapped keys protecting ten-year backups',
        explanation: 'Correct. Long confidentiality lifetime plus public-key wrapping makes this the clearest inventory priority.',
      },
      {
        id: 'argon2',
        label: 'Argon2id password verifier parameters',
        explanation: 'Not first. Parameter agility matters, but this is not the same public-key confidentiality exposure.',
      },
      {
        id: 'aes',
        label: 'AES-256-GCM record encryption',
        explanation: 'Not first. AES-256 remains a strong symmetric choice; inventory its key-management boundary instead of replacing it reflexively.',
      },
    ],
  },
  {
    id: 'provider-boundary',
    title: 'Respect the protocol boundary',
    prompt: 'Your CDN terminates TLS. What is the safest first migration action?',
    correctOptionId: 'provider-pilot',
    options: [
      {
        id: 'custom-tls',
        label: 'Implement a custom post-quantum handshake in application JavaScript',
        explanation: 'Unsafe. This crosses the provider and browser protocol boundary and creates unaudited cryptography.',
      },
      {
        id: 'provider-pilot',
        label: 'Inventory every TLS termination point, verify provider support, and pilot a standardized hybrid profile with rollback metrics',
        explanation: 'Correct. Migration follows the actual owner and keeps protocol behavior observable.',
      },
      {
        id: 'disable-tls13',
        label: 'Disable TLS 1.3 until every client supports a post-quantum profile',
        explanation: 'Unsafe. Removing a current secure protocol does not create a safe migration path.',
      },
    ],
  },
  {
    id: 'rollback',
    title: 'Design a safe rollback',
    prompt: 'A new writer format fails in production. Which rollback plan avoids a silent downgrade?',
    correctOptionId: 'bounded-rollback',
    options: [
      {
        id: 'write-old',
        label: 'Immediately resume writing the retired format without recording the change',
        explanation: 'Unsafe. This silently recreates downgraded data and hides the scope of rollback.',
      },
      {
        id: 'bounded-rollback',
        label: 'Stop new writes, keep approved dual-read support, record the incident, and resume only with an explicit time-bounded policy decision',
        explanation: 'Correct. Read compatibility remains separate from permission to create retired formats.',
      },
      {
        id: 'delete-new',
        label: 'Delete every new-format record and restore the last backup',
        explanation: 'Unsafe. Destructive rollback is not justified without integrity and recovery evidence.',
      },
    ],
  },
];

export interface CryptoAgilityScore {
  correct: number;
  total: number;
  percent: number;
  complete: boolean;
  missedScenarioIds: string[];
}

export function scoreCryptoAgilityAnswers(answers: Record<string, string>): CryptoAgilityScore {
  const answered = CRYPTO_AGILITY_SCENARIOS.filter(scenario => Boolean(answers[scenario.id]));
  const correct = answered.filter(scenario => answers[scenario.id] === scenario.correctOptionId).length;
  return {
    correct,
    total: CRYPTO_AGILITY_SCENARIOS.length,
    percent: Math.round((correct / CRYPTO_AGILITY_SCENARIOS.length) * 100),
    complete: answered.length === CRYPTO_AGILITY_SCENARIOS.length,
    missedScenarioIds: CRYPTO_AGILITY_SCENARIOS
      .filter(scenario => answers[scenario.id] !== scenario.correctOptionId)
      .map(scenario => scenario.id),
  };
}
