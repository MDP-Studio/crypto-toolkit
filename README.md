# CryptoToolkit

An interactive educational platform for learning cryptography by doing: 36 learning modules, a separate Challenge Hub, and an assurance matrix covering how crypto works, why it works, and how it breaks. Every attack is real: algorithms run to completion and recover secrets through the actual mathematical exploit, not pre-computed simulations.

All computation runs client-side using BigInt arithmetic with `crypto.getRandomValues()` — no server, no tracking, no data leaves your browser.

> **This is a learning tool, not a production library.** These implementations are not constant-time, do not zeroize key material, and have not been formally verified. BigInt operations in JavaScript leak timing information proportional to operand size. For production use, reach for [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [libsodium](https://doc.libsodium.org/), or [Google Tink](https://developers.google.com/tink).

**Live:** [ctool.mdpstudio.com.au](https://ctool.mdpstudio.com.au)

**MDP Studio project page:** [CipherLab / CryptoToolkit](https://mdpstudio.com.au/projects/cryptography-lab/)

Search discovery is handled with `public/robots.txt` and `public/sitemap.xml` for the canonical live root. The app remains hash-routed, so the sitemap avoids listing fake server routes for individual modules.
Static search-entry guides live under `/learn/` for high-intent topics such as exact cryptography calculators, AES-GCM nonce reuse, RSA attack demos, and the production handoff boundary; those pages link back into the interactive hash-routed modules. The calculator guide lists AES-GCM, RSA key generation, HMAC-SHA256, legacy HMAC-SHA1 document-ID helpers, SHA-1/SHA-256 hashing, Base64/hex/text conversion, elliptic curve math, modular arithmetic, factorization, and classical cipher tools.

## Modules (36 learning pages)

### Attacks (12 pages)
- **Bleichenbacher** — PKCS#1 v1.5 padding oracle with genuine interval narrowing (Steps 2a/2b/2c/3/4). Typically converges in ~10K oracle queries.
- **Padding Oracle** — Real AES-CBC inverse cipher decryption, byte-by-byte PKCS#7 recovery across all ciphertext blocks.
- **ECDSA Nonce Reuse** — Extract private key from two signatures sharing the same k. PS3 incident context.
- **GCM Nonce Reuse** — XOR ciphertexts to leak plaintext relationship + recover authentication key H.
- **Hash Length Extension** — Custom SHA-256 with exposed internal state. Real Merkle-Damgard exploit using attacker-controlled state resumption.
- **Wiener's Attack** — Continued fraction expansion of e/n recovers small private key d.
- **Hastad Broadcast** — CRT + integer cube root for e=3 (Coppersmith's theorem, simplest case).
- **CRT-RSA Fault Injection** — Single bit flip during CRT signing reveals p via GCD.
- **Textbook RSA** — Ciphertext malleability via multiplicative homomorphism.
- **RSA Factoring** — Pollard's rho + trial division, recover d, decrypt, verify.
- **DH Small Subgroup** — Malicious generators leak secret mod small order, CRT combination.
- **ECB Penguin** — Color-coded block visualization showing pattern leakage.

### Protocol Composition
- **AES-GCM** — CTR stream cipher + GHASH polynomial authentication over GF(2^128). Web Crypto comparison.
- **TLS 1.3 Handshake** — ECDHE → HKDF → ECDSA (real `crypto.subtle`) → AES-GCM encrypted application data.
- **HMAC-SHA256** - Step-by-step ipad/opad XOR, inner/outer hash with text or raw-hex key input and Web Crypto verification.
- **Argon2id** — Memory-hard password hashing via WASM Web Worker. SHA-256 timing comparison, OWASP presets.

### Workflows
- **ECDSA Signing** — Hash → sign → verify with nonce uniqueness warnings and RFC 6979 explanation.
- **AES-128 Round** — SubBytes, ShiftRows (CSS animated), MixColumns (GF(2^8) detail), AddRoundKey. FIPS 197 vectors.
- **Diffie-Hellman** — Step-by-step key exchange with shared secret derivation.
- **Paillier** — Additive homomorphic encryption: keygen, encrypt, homomorphic addition, decrypt.
- **ElGamal** — Exponential ElGamal with homomorphic multiply and bounded discrete log.
- **Shamir Secret Sharing** — Polynomial split, Lagrange interpolation, threshold reconstruction demo.

### Cryptography
- **Elliptic Curve Calculator** — Point addition, scalar multiply, Montgomery ladder, baby-step giant-step ECDLP, preset curves (secp256k1, P-192, P-256).
- **RSA Key Generator** — 16–2048 bit key generation via Web Worker, manual key computation, encrypt/decrypt. NIST notes 2048 as a transitional minimum; production should use ≥3072 per SP 800-57.
- **Cipher Tools** — Caesar (encrypt/decrypt/brute force), Vigenere, ROT13, Atbash, frequency analysis, HMAC-SHA1, and AES-128-ECB/PKCS#7 document-ID helpers.

### Number Theory
- **Modular Arithmetic** — Mod inverse, mod exponentiation, GCD/extended GCD, Euler's totient, sqrt mod p (Tonelli-Shanks), Legendre symbol, Miller-Rabin primality.
- **Integer Factorization** — Pollard's rho + trial division, totient, divisor count, next prime, prime listing up to 100K.

### Advanced
- **Lattice (LWE)** — Post-quantum encryption with error analysis and brute-force scaling table.
- **Schnorr ZKP** — Interactive zero-knowledge proof with cheating prover mode (soundness demo).
- **LLL Lattice Reduction** — 2D Gram-Schmidt orthogonalization visualization with Lovász condition.
- **Meet-in-the-Middle** — S-DES double encryption key recovery in O(2^n) vs O(2^2n) brute force.
- **Birthday Collision** — Truncated SHA-256 collision finder demonstrating the birthday bound (~√N).
- **Constant-Time Comparison** — Early-exit vs XOR-based string comparison with timing measurements. Demonstrates *why* constant-time matters; the implementations themselves use BigInt (not constant-time — see caveat above).

### Utilities
- **Base & Encoding** — SHA-1/SHA-256 hashing (LF/CRLF aware), text↔hex/binary/decimal/base64, base conversion.
- **Substitution Analysis** — Interactive cipher breaker with frequency/digraph/trigraph analysis.
- **EC Curve Plot** — Scatter plot of all F_p points for small primes with interactive selection.

## Challenge Hub

The live app includes a separate **Challenge Hub** at `#/challenges`. It keeps CryptoHack-style practice prompts separate from calculators and simulators, shows one challenge at a time, stores progress locally, and links back to the relevant learning module. The current bank has 30 custom instance challenges across 6 stages: First Contact, Building Blocks, Misuse Radar, Attack Workflows, Cryptanalysis Lab, and Human-Hard Gauntlet. The bank intentionally avoids lookup-only answers such as algorithm names, standard vector names, and generic definition recall.

## Assurance Matrix

The live app includes an **Assurance Matrix** page at `#/assurance`. It lists every module with its spec anchors, vector sources, test IDs, and known limitations. The same data generates [docs/assurance-matrix.md](docs/assurance-matrix.md) via `npm run assurance`, and `npm run ci` fails if a module is missing from the matrix.

## Release Provenance and SBOM

Release builds can publish three review artifacts: a CycloneDX SBOM, a SHA-256 checksum manifest, and an unsigned local provenance statement tied to the git commit and tag. Generate them with:

```bash
npm run release:artifacts
```

For tagged releases, follow [docs/release-provenance.md](docs/release-provenance.md). These artifacts improve supply-chain transparency only; they do not make the educational crypto code production-grade.

## AES Cross-Implementation Parity & Lifecycle Guidance

AES-ECB and AES-GCM ship with a published parity matrix against production references:

- [docs/aes-interop-matrix.md](docs/aes-interop-matrix.md) - WebCrypto / Python `cryptography` / OpenSSL CLI table over a shared NIST vector pack. Toolkit and WebCrypto are re-verified at every CI run via `npm run interop`; Python reproduces full AES-GCM AEAD parity with [scripts/aes-interop/verify_python.py](scripts/aes-interop/verify_python.py), while [scripts/aes-interop/verify_openssl.sh](scripts/aes-interop/verify_openssl.sh) verifies the AES-ECB vectors and documents the OpenSSL `enc` AEAD limitation.
- [docs/aes-lifecycle.md](docs/aes-lifecycle.md) - Key-rotation triggers, nonce-uniqueness bounds (NIST SP 800-38D §8.3), AAD metadata binding, envelope structure, and KEK/DEK separation. Tracks NIST SP 800-57 Part 1 Rev 5 and the OWASP Cryptographic Storage Cheat Sheet.

Both docs reinforce that the in-repo AES code is educational; production deployments should use Web Crypto, libsodium, or Tink.

## Production Crypto Handoff

[docs/production-handoff.md](docs/production-handoff.md) and
`/learn/production-crypto-handoff.html` define the safe transition from a
CryptoToolkit lesson to a real product design. The checklist covers library
selection, key ownership, AEAD envelopes, AAD binding, nonce allocation,
negative misuse tests, and the line where a learner must stop using demo code
and switch to Web Crypto, libsodium, Tink, or a mature backend library.

## Test Vectors & Coverage

137 tests across 9 Vitest suites, plus Playwright route smoke snapshots for every learning module, the Challenge Hub, and the assurance page. Key vector sources:

| Module | Source |
|--------|--------|
| AES-128 ECB | FIPS 197 Appendix B (encrypt + independent decrypt) |
| AES-GCM | NIST SP 800-38D Test Cases 2, 3 & 4 |
| AES interop | Toolkit vs WebCrypto vs Python `cryptography` over shared NIST vector pack; OpenSSL CLI cross-check for AES-ECB |
| SHA-256 | FIPS 180-4 (`"abc"`, empty string) |
| HMAC-SHA256 | RFC 4231 Test Cases 1 & 2, AWS SigV4 kDate |
| HMAC-SHA1 | RFC 2202 Test Cases 1 & 2 |
| AES-128-ECB/PKCS#7 | Node/OpenSSL compatibility vectors for document IDs |
| Miller-Rabin | Known primes + Carmichael numbers (561, 1105, 1729, 15841, 41041) |
| MixColumns | FIPS 197 intermediate state roundtrip |
| LWE | Encrypt/decrypt roundtrip, keygen consistency |
| Shamir SSS | Known polynomial reconstruction, t-1 insufficiency |
| Pollard's rho | 15-digit and 14-digit semiprime factorization |
| Bleichenbacher | End-to-end interval narrowing on 24-bit modulus |
| Hastad broadcast | e=3 CRT recovery and precondition rejection |

Coverage reporting is available with `npm run coverage` using the v8 provider and is included in `npm run ci`.

## Tech Stack

- **React 19** + **Vite 8** — Code-split with React.lazy (main bundle 220KB, 67KB gzipped)
- **TypeScript 5.9** — Strict mode, noUnusedLocals, verbatimModuleSyntax
- **Tailwind CSS v4** + **shadcn/ui** — Dark/light theme, responsive 320px–1280px+
- **Vitest** - 137 tests with NIST/RFC/AWS vector attribution and derived challenge-answer checks
- **Playwright** - route smoke snapshots across the app
- **BigInt** — Arbitrary precision, no external math libraries
- **Web Crypto API** — CSPRNG via `crypto.getRandomValues()`, `crypto.subtle` for ECDSA/AES/HMAC comparison
- **hash-wasm** — Argon2id WASM in dedicated Web Worker
- **ESLint** — `Math.random` banned project-wide via `no-restricted-properties`

```bash
npm install
npm run dev      # dev server at localhost:5173
npm run build    # production build
npm test         # 122 Vitest tests
npm run coverage # Vitest v8 coverage report
npm run assurance # regenerate docs/assurance-matrix.md
npm run e2e:routes # Playwright route smoke snapshots
npm run ci       # full check: tsc + lint + assurance + coverage + build + routes + prod audit
```

## Architecture

```
src/
  lib/
    ec-math.ts         # EC operations, Montgomery ladder, baby-step giant-step ECDLP
    crypto-math.ts     # RSA, primality, factorization, ciphers, Paillier, discrete log
    aes-math.ts        # AES encrypt/decrypt (FIPS 197), CTR, GCM, GHASH, GF(2^8/2^128)
    sha256.ts          # Custom SHA-256 with exposed internal state (for hash extension)
    hash-birthday.ts   # Birthday-bound truncation helpers
    lwe-math.ts        # LWE key generation, encrypt, decrypt
    hmac.ts            # HMAC-SHA256 step computation
    hmac-examples.ts   # RFC 4231 and AWS SigV4 HMAC examples
    hastad.ts          # Hastad broadcast attack CRT and cube-root helpers
    assurance.ts       # Typed assurance matrix accessors
    web-crypto.ts      # HMAC, HKDF, AES-GCM, ECDH, ECDSA via crypto.subtle
    parse.ts           # Shared BigInt parsing with 2000-char length guard
    utils.ts           # UI utility (cn)
  hooks/
    useDebouncedValue.ts  # 300ms debounce for input-triggered computation
    usePhaseStatus.ts     # Shared workflow phase status (pending/active/complete)
  workers/
    crypto.worker.ts      # RSA keygen worker with BigInt serialization
    hash.worker.ts        # Dedicated Argon2id WASM worker (loads once, reuses)
  components/
    Sidebar.tsx           # Right-side collapsible nav with category toggles
    ErrorBoundary.tsx     # Catches computation errors without crashing app
    SecurityBanner.tsx    # Collapsible timing attack warning
    StepCard.tsx          # Step-by-step workflow card
    AssuranceSummary.tsx  # Per-module evidence summary card
    ShiftRowsAnimation.tsx # CSS transform animation for AES ShiftRows
    pages/                # 37 lazy-loaded page components
  data/
    module-assurance.json # Spec anchors, vector sources, tests, known limitations
  __tests__/
    crypto.test.ts        # AES, SHA-256, EC math, number theory, LWE test vectors
    attacks.test.ts       # Attack primitive tests
e2e/
  route-smoke.spec.ts     # Playwright route smoke and regression snapshots
docs/
  assurance-matrix.md     # Generated module assurance report
```

## Design Decisions

**Custom SHA-256 instead of Web Crypto.** `crypto.subtle.digest` doesn't expose internal state. The hash length extension attack requires setting a custom initial hash value (the attacker-known MAC output) and resuming from an arbitrary midpoint — impossible with a sealed API. Built a from-scratch FIPS 180-4 implementation with `getState()` / `resume()` to make the Merkle-Damgard vulnerability tangible.

**Real attacks, not simulations.** Every attack page computes the actual exploit — the recovered plaintext is the output of the algorithm, not a pre-known value revealed with animation. This is enforced as a project rule: any demo that simulates rather than computes must be labeled explicitly. The distinction matters educationally because students need to see that these attacks are *computationally feasible*, not just theoretically possible.

**BigInt arithmetic with documented limitations.** GHASH length encoding uses 32-bit JS bitwise ops (correct for inputs < 268MB, documented in source). `generateRandomPrime` draws fresh CSPRNG candidates per iteration (FIPS 186-5 §B.3.3 compliant). Miller-Rabin uses 12 fixed witnesses + CSPRNG extras above the deterministic threshold of 3.3×10²⁴. BigInt operations are not constant-time — timing leaks are proportional to operand size (explicitly called out on the Constant-Time Comparison page). These are deliberate scope boundaries for an educational tool, not oversights — and each one has a source comment explaining the tradeoff.

**RSA keygen in a Web Worker.** Generating 2048-bit keys requires iterative primality testing that blocks the main thread for 1–5 seconds. Moved to `crypto.worker.ts` with a stale-response guard (`genIdRef`) so rapid re-generation doesn't apply an outdated result.

## Security Headers

Deployed on Netlify (`public/_headers`) and Vercel (`vercel.json`) with matching headers:

| Header | Value | Notes |
|--------|-------|-------|
| Content-Security-Policy | `script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self'; frame-ancestors 'none'` | `unsafe-inline` for Tailwind v4 + React `style={}`; `wasm-unsafe-eval` for hash-wasm's `WebAssembly.compile()` (Argon2id) |
| Strict-Transport-Security | `max-age=31536000` | 1-year HSTS, apex only (no preload — see SECURITY.md) |
| Referrer-Policy | `no-referrer` | |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | |
| Cross-Origin-Opener-Policy | `same-origin` | |
| Cross-Origin-Embedder-Policy | `require-corp` | |
| Cross-Origin-Resource-Policy | `same-origin` | |
| X-Frame-Options | `DENY` | |
| X-Content-Type-Options | `nosniff` | |
| Cache-Control | `no-cache` (HTML), `immutable` (hashed assets) | |

## Motivation

Every cryptography assignment, I'd have half a dozen calculators open in different browser tabs, and tutorials would skip the calculation between the input and the answer. CryptoToolkit is the tool I wanted when I was learning: one place where the math is visible at every step, and where the attacks actually run.

## Further Reading

- [Cryptopals Challenges](https://cryptopals.com/) — the canonical "learn crypto by breaking it" problem set
- [Dan Boneh's Cryptography Course](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/) — Stanford's free crypto course
- [RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446) — TLS 1.3 specification
- [NIST SP 800-38D](https://csrc.nist.gov/pubs/sp/800-38d/final) — AES-GCM specification
- [FIPS 197](https://csrc.nist.gov/pubs/fips/197/final) — AES specification
- [Twenty Years of Attacks on the RSA Cryptosystem](https://crypto.stanford.edu/~dabo/pubs/papers/RSA-survey.pdf) — Boneh's RSA attack survey

## License

MIT
