import type { Page } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import {
  Atom,
  Binary,
  CircuitBoard,
  Flag,
  Link2,
  LockKeyhole,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

interface Category {
  name: string;
  icon: LucideIcon;
  accent: string;
  bg: string;
  pages: { id: Page; label: string; desc: string }[];
}

const CATEGORIES: Category[] = [
  {
    name: 'Cryptography',
    icon: LockKeyhole,
    accent: 'text-blue-400',
    bg: 'hover:bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30',
    pages: [
      { id: 'ec-calculator', label: 'Elliptic Curves', desc: 'Point addition, scalar multiply' },
      { id: 'rsa', label: 'RSA Generator', desc: 'Key generation, encrypt/decrypt' },
      { id: 'ciphers', label: 'Cipher Tools', desc: 'Caesar, Vigenere, ROT13' },
    ],
  },
  {
    name: 'Number Theory',
    icon: Binary,
    accent: 'text-purple-400',
    bg: 'hover:bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30',
    pages: [
      { id: 'modular', label: 'Modular Arithmetic', desc: 'Inverse, GCD, totient, primality' },
      { id: 'factorization', label: 'Factorization', desc: 'Prime factorization' },
    ],
  },
  {
    name: 'Workflows',
    icon: CircuitBoard,
    accent: 'text-green-400',
    bg: 'hover:bg-green-500/5 border-green-500/10 hover:border-green-500/30',
    pages: [
      { id: 'ecdsa', label: 'ECDSA Signing', desc: 'Hash -> sign -> verify' },
      { id: 'paillier', label: 'Paillier', desc: 'Homomorphic encryption' },
      { id: 'elgamal', label: 'ElGamal', desc: 'Homomorphic multiply' },
      { id: 'diffie-hellman', label: 'Diffie-Hellman', desc: 'Key exchange' },
      { id: 'aes', label: 'AES Round', desc: 'State matrix transforms' },
      { id: 'shamir', label: 'Shamir SSS', desc: 'Secret sharing' },
    ],
  },
  {
    name: 'Composition',
    icon: Link2,
    accent: 'text-orange-400',
    bg: 'hover:bg-orange-500/5 border-orange-500/10 hover:border-orange-500/30',
    pages: [
      { id: 'aes-gcm', label: 'AES-GCM', desc: 'Authenticated encryption' },
      { id: 'argon2', label: 'Argon2id', desc: 'Memory-hard hashing' },
      { id: 'tls13', label: 'TLS 1.3', desc: 'Full handshake simulation' },
      { id: 'hmac', label: 'HMAC', desc: 'Step-by-step walkthrough' },
    ],
  },
  {
    name: 'Attacks',
    icon: ShieldAlert,
    accent: 'text-red-400',
    bg: 'hover:bg-red-500/5 border-red-500/10 hover:border-red-500/30',
    pages: [
      { id: 'nonce-reuse', label: 'ECDSA Nonce Reuse', desc: 'Private key extraction' },
      { id: 'gcm-nonce', label: 'GCM Nonce Reuse', desc: 'Plaintext XOR leak' },
      { id: 'padding-oracle', label: 'Padding Oracle', desc: 'CBC byte-by-byte' },
      { id: 'textbook-rsa', label: 'Textbook RSA', desc: 'Ciphertext malleability' },
      { id: 'hash-extension', label: 'Hash Extension', desc: 'Merkle-Damgard exploit' },
      { id: 'rsa-attack', label: 'RSA Factoring', desc: 'Factor n -> recover d' },
      { id: 'wiener', label: "Wiener's Attack", desc: 'Continued fractions' },
      { id: 'bleichenbacher', label: 'Bleichenbacher', desc: 'PKCS#1 v1.5 oracle' },
      { id: 'coppersmith', label: 'Hastad Broadcast', desc: 'CRT + cube root' },
      { id: 'crt-fault', label: 'CRT Fault', desc: 'Fault injection' },
      { id: 'dh-subgroup', label: 'DH Subgroup', desc: 'Small-order attack' },
      { id: 'ecb-penguin', label: 'ECB Penguin', desc: 'Pattern leakage' },
      { id: 'mitm', label: 'Meet-in-the-Middle', desc: '2DES MITM attack' },
    ],
  },
  {
    name: 'Advanced',
    icon: Atom,
    accent: 'text-cyan-400',
    bg: 'hover:bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/30',
    pages: [
      { id: 'lwe', label: 'Lattice (LWE)', desc: 'Post-quantum encryption' },
      { id: 'schnorr', label: 'Schnorr ZKP', desc: 'Zero-knowledge proof' },
      { id: 'birthday', label: 'Birthday Collision', desc: 'Hash collision finder' },
      { id: 'constant-time', label: 'Constant-Time', desc: 'Timing attack demo' },
      { id: 'lll', label: 'LLL Reduction', desc: '2D lattice basis reduction' },
    ],
  },
  {
    name: 'Practice',
    icon: Flag,
    accent: 'text-amber-400',
    bg: 'hover:bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30',
    pages: [
      { id: 'challenges', label: 'Challenge Hub', desc: 'Standalone crypto exercises' },
    ],
  },
  {
    name: 'Utilities',
    icon: Wrench,
    accent: 'text-gray-400',
    bg: 'hover:bg-gray-500/5 border-gray-500/10 hover:border-gray-500/30',
    pages: [
      { id: 'converter', label: 'Base & Encoding', desc: 'SHA hash, hex, base64' },
      { id: 'substitution', label: 'Substitution Analysis', desc: 'Cipher breaker' },
      { id: 'curve-plot', label: 'EC Curve Plot', desc: 'F_p scatter plot' },
      { id: 'assurance', label: 'Assurance Matrix', desc: 'Specs, vectors, tests' },
    ],
  },
];

export function Home({ onNavigate }: HomeProps) {
  const totalLearningModules = CATEGORIES.reduce(
    (sum, cat) => sum + cat.pages.filter(page => page.id !== 'assurance' && page.id !== 'challenges').length,
    0
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="relative isolate rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/10 px-6 py-10 md:py-14 text-center">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {totalLearningModules} Learning Modules
          </div>
          <h1 className="pb-1 text-3xl md:text-4xl font-bold leading-[1.2] text-foreground">
            CryptoToolkit
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-7 md:leading-8 pb-0.5">
            An educational platform for applied cryptography. From elliptic curves to TLS 1.3 handshakes,
            from AES internals to post-quantum lattice encryption.
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            {['Client-Side BigInt', 'Web Crypto API', 'WASM Argon2id', 'Code-Split'].map(tag => (
              <span key={tag} className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 rounded px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section aria-labelledby="about-cryptotoolkit" className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.35fr] gap-5 border-y border-border/70 py-6">
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase text-primary tracking-normal">About this project</p>
          <h2 id="about-cryptotoolkit" className="text-2xl font-semibold tracking-normal">
            Cryptography by doing, not just reading static notes.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            CryptoToolkit is an interactive educational platform for learning how crypto works, why it works,
            and how it breaks. The attack modules are designed to run the actual exploit path instead of revealing
            pre-computed answers.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Built by Meidie Fei as part of a cybersecurity portfolio focused on reproducible, browser-based security tooling.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'Real computation',
              body: 'Modules use BigInt arithmetic, Web Crypto comparisons, WASM Argon2id, and test vectors so the result comes from the algorithm.',
            },
            {
              title: 'Browser-only lab',
              body: 'Computation runs client-side. There is no tracking server, and learning inputs do not leave the browser.',
            },
            {
              title: 'Clear boundary',
              body: 'This is a learning tool, not a production crypto library. Timing and memory-safety limitations stay visible.',
            },
          ].map(item => (
            <div key={item.title} className="rounded-lg border border-border/70 bg-card/50 p-4">
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;

          return (
            <Card key={cat.name} className={`${cat.bg} transition-all duration-200 group`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background/70 ${cat.accent}`}>
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <h3 className={`text-sm font-semibold ${cat.accent}`}>{cat.name}</h3>
                  <span className="text-[10px] text-muted-foreground/50 ml-auto">{cat.pages.length}</span>
                </div>
                <div className="space-y-0.5">
                  {cat.pages.map(pg => (
                    <button
                      key={pg.id}
                      onClick={() => onNavigate(pg.id)}
                      className="w-full text-left px-2.5 py-2 rounded-md hover:bg-background/80 transition-all group/item flex flex-col items-start gap-0.5"
                    >
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors leading-tight">{pg.label}</span>
                      <span className="text-[11px] text-muted-foreground/55 leading-snug">{pg.desc}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
