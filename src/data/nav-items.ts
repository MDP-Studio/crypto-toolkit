import type { Page } from '@/App';
import {
  Activity,
  Atom,
  BadgeCheck,
  Binary,
  Box,
  Braces,
  Bug,
  Cable,
  Cake,
  Calculator,
  ChartNoAxesCombined,
  ChartScatter,
  FileKey2,
  FileSearch,
  Fingerprint,
  Flag,
  GitCompareArrows,
  Grid3X3,
  Hash,
  KeyRound,
  KeySquare,
  Landmark,
  ListChecks,
  LockKeyhole,
  MemoryStick,
  Network,
  Orbit,
  PenTool,
  RadioTower,
  RefreshCcw,
  Route,
  ScanSearch,
  SearchCheck,
  Share2,
  Shield,
  Table2,
  Timer,
  UnlockKeyhole,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  category: string;
}

// Order mirrors the home page module groups so navigation stays predictable.
export const NAV_ITEMS: NavItem[] = [
  { id: 'ec-calculator', label: 'Elliptic Curves', category: 'Cryptography', icon: Atom },
  { id: 'rsa', label: 'RSA Generator', category: 'Cryptography', icon: KeyRound },
  { id: 'ciphers', label: 'Cipher Tools', category: 'Cryptography', icon: Shield },

  { id: 'modular', label: 'Modular Arithmetic', category: 'Number Theory', icon: Calculator },
  { id: 'factorization', label: 'Factorization', category: 'Number Theory', icon: Binary },

  { id: 'ecdsa', label: 'ECDSA Signing', category: 'Workflows', icon: PenTool },
  { id: 'paillier', label: 'Paillier', category: 'Workflows', icon: Landmark },
  { id: 'elgamal', label: 'ElGamal', category: 'Workflows', icon: KeySquare },
  { id: 'diffie-hellman', label: 'Diffie-Hellman', category: 'Workflows', icon: Cable },
  { id: 'aes', label: 'AES Round', category: 'Workflows', icon: Table2 },
  { id: 'shamir', label: 'Shamir Secret Sharing', category: 'Workflows', icon: Share2 },

  { id: 'aes-gcm', label: 'AES-GCM', category: 'Composition', icon: BadgeCheck },
  { id: 'argon2', label: 'Argon2id', category: 'Composition', icon: MemoryStick },
  { id: 'tls13', label: 'TLS 1.3 Handshake', category: 'Composition', icon: LockKeyhole },
  { id: 'hmac', label: 'HMAC Walkthrough', category: 'Composition', icon: Fingerprint },

  { id: 'nonce-reuse', label: 'ECDSA Nonce Reuse', category: 'Attacks', icon: FileKey2 },
  { id: 'gcm-nonce', label: 'GCM Nonce Reuse', category: 'Attacks', icon: RadioTower },
  { id: 'padding-oracle', label: 'Padding Oracle', category: 'Attacks', icon: UnlockKeyhole },
  { id: 'textbook-rsa', label: 'Textbook RSA', category: 'Attacks', icon: Zap },
  { id: 'hash-extension', label: 'Hash Extension', category: 'Attacks', icon: Hash },
  { id: 'rsa-attack', label: 'RSA Factoring', category: 'Attacks', icon: Bug },
  { id: 'wiener', label: "Wiener's Attack", category: 'Attacks', icon: Activity },
  { id: 'bleichenbacher', label: 'Bleichenbacher', category: 'Attacks', icon: ScanSearch },
  { id: 'coppersmith', label: 'Hastad Broadcast', category: 'Attacks', icon: Route },
  { id: 'crt-fault', label: 'CRT Fault Injection', category: 'Attacks', icon: SearchCheck },
  { id: 'dh-subgroup', label: 'DH Subgroup', category: 'Attacks', icon: Network },
  { id: 'ecb-penguin', label: 'ECB Penguin', category: 'Attacks', icon: Grid3X3 },
  { id: 'mitm', label: 'Meet-in-the-Middle', category: 'Attacks', icon: GitCompareArrows },

  { id: 'lwe', label: 'Lattice (LWE)', category: 'Advanced', icon: Box },
  { id: 'schnorr', label: 'Schnorr ZKP', category: 'Advanced', icon: Orbit },
  { id: 'birthday', label: 'Birthday Collision', category: 'Advanced', icon: Cake },
  { id: 'constant-time', label: 'Constant-Time', category: 'Advanced', icon: Timer },
  { id: 'lll', label: 'LLL Reduction', category: 'Advanced', icon: ChartNoAxesCombined },

  { id: 'challenges', label: 'Challenge Hub', category: 'Practice', icon: Flag },
  { id: 'crypto-agility', label: 'Crypto-Agility Lab', category: 'Practice', icon: RefreshCcw },

  { id: 'converter', label: 'Base & Encoding', category: 'Utilities', icon: Braces },
  { id: 'substitution', label: 'Substitution Analysis', category: 'Utilities', icon: FileSearch },
  { id: 'curve-plot', label: 'EC Curve Plot', category: 'Utilities', icon: ChartScatter },
  { id: 'assurance', label: 'Assurance Matrix', category: 'Utilities', icon: ListChecks },
];
