# AES Key Lifecycle and Metadata Guidance

CryptoToolkit is an **educational** AES implementation. It is correct against
FIPS 197 / NIST SP 800-38D test vectors (see [aes-interop-matrix.md](aes-interop-matrix.md)),
but correctness of the primitive is only one layer of a real deployment. Most
AES failures in the wild are not bad primitives. They are bad lifecycle: reused
nonces, missing key rotation, unauthenticated metadata, lost key material, and
silent algorithm downgrades.

This doc summarizes the lifecycle controls a production AES-GCM deployment
needs, with pointers to the authoritative sources. None of it is implemented
inside the toolkit. The toolkit is for understanding the math.

> If you need to ship AES in a real product, use [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API),
> [libsodium](https://doc.libsodium.org/), or [Google Tink](https://developers.google.com/tink).
> They give you constant-time primitives, vetted modes, and key management
> hooks. Do not lift the educational code in this repo into a product.

## 1. Nonce uniqueness is the killer constraint

AES-GCM authenticity and confidentiality both collapse the moment a `(key, IV)`
pair is reused on different plaintexts. NIST SP 800-38D, §8.3 bounds the
deterministic-construction safe limit at `2^32` invocations per key. The
random-construction bound is more conservative, since collision probability
grows quadratically: for a 96-bit random IV, the probability of a collision
crosses `2^-32` at roughly `2^32` invocations. NIST's revision-in-progress
work is tightening guidance around random-IV usage; treat anything that issues
random 96-bit IVs and approaches `2^32` invocations as needing rotation.

Operational rules:

- Prefer the deterministic IV construction described in NIST SP 800-38D §8.2.1
  (fixed field || invocation counter). Persist the counter, never reuse it,
  and rotate the key before the counter wraps.
- Do not derive the IV from the message or the plaintext; that re-introduces
  collision risk and breaks deniability.
- Random 96-bit IVs are acceptable for low-volume use, but bound the lifetime:
  rotate the key well before `2^32` random IVs have been drawn.
- An AES-GCM nonce collision is a security incident, not a performance issue.
  Plan the rotation cadence to make a collision unreachable, not just unlikely.

## 2. Authenticate metadata via AAD

GCM's `additionalData` parameter lets you bind context into the tag without
encrypting it. Use it. Anything that should not silently change without
invalidating the ciphertext belongs in the AAD:

- Key epoch / key identifier
- Algorithm and mode identifier (`aes-128-gcm-v1`)
- Recipient identity or session ID
- Format version of the surrounding envelope
- Resource path or message type, when relevant

The AAD makes downgrade attacks visible. If an attacker swaps a v2 ciphertext
into a v1 endpoint without re-encrypting, the tag will not verify. If the AAD
is empty, the surrounding envelope has to police all of that itself, which is
how every real-world AES-GCM bug ships.

This is also the OWASP Cryptographic Storage Cheat Sheet's recommended pattern
for production AEAD usage.

## 3. Key rotation triggers

Rotate the data-encryption key on whichever of these comes first:

| Trigger | Threshold | Source |
| --- | --- | --- |
| Invocation count | 2^32 GCM encryptions per key | NIST SP 800-38D §8.3 |
| Random-IV count | well below 2^32 random IVs per key | birthday bound on 96-bit IV |
| Plaintext volume | 2^39 bytes per key for GCM | NIST SP 800-38D §5.2.1.1 |
| Calendar time | 1-2 years for long-lived data-encryption keys | NIST SP 800-57 Part 1 Rev 5 §5.3.6 |
| Personnel change | immediately on departure of anyone with access | OWASP Cryptographic Storage |
| Suspected compromise | immediately, plus re-encrypt all data | OWASP Cryptographic Storage |

The first three are mechanical and should be enforced in code: when the
counter or volume crosses the threshold, the encryptor refuses and surfaces a
rotation event. The calendar trigger is a scheduled job. The last two are
incident response.

## 4. Envelope structure

A safe envelope around an AES-GCM ciphertext looks like:

```
version_byte || key_id (or key_epoch) || iv (96 bits) || ciphertext || tag (128 bits)
```

with the entire `version_byte || key_id` prefix passed in as AAD. That gives
you:

- Algorithm agility (the version byte names the suite).
- Key rotation (the key_id selects the active key; old key_ids stay accepted
  for decrypt-only until the data is re-encrypted).
- Cryptographic binding of metadata (AAD).
- A single contiguous blob that is safe to store or transmit.

This is the shape libsodium's `crypto_secretstream` and Tink's `AEAD` primitives
use under the hood. If you build your own envelope, copy this structure.

## 5. Key wrapping and storage

The data-encryption key (DEK) should never live in application memory longer
than it needs to:

- Wrap DEKs with a key-encryption key (KEK) held in a KMS / HSM / Vault Transit.
- Cache decrypted DEKs in memory only for the duration of one request or batch.
- Zeroize key buffers on release; do not rely on GC.
- Never log key material, AAD that contains secrets, or the IV-counter state.

NIST SP 800-57 Part 1 Rev 5 §5.3 has the canonical key-state machine
(pre-activation → active → deactivated → compromised → destroyed). Make sure
your storage layer can represent all five states and that key lookups for
decrypt accept `deactivated` keys but encrypt only with `active` keys.

## 6. Algorithm agility

Hard-coding `AES-128-GCM` everywhere is a maintenance liability. The version
byte in the envelope (see §4) lets you migrate to `AES-256-GCM-SIV`,
`ChaCha20-Poly1305`, or whatever NIST's SP 800-38D revision lands on without
breaking existing ciphertexts. Plan for a migration before you need one:

- Encrypt new data with the new suite.
- Decrypt old ciphertexts with their original suite (read the version byte).
- Re-encrypt opportunistically (on next write) or in a background sweep.
- Retire the old suite from the encrypt path once the re-encrypt sweep finishes.

## 7. What this toolkit deliberately does NOT do

Listed for honesty, not as a roadmap:

- No constant-time primitive. BigInt arithmetic leaks timing.
- No key zeroization. JS strings and arrays are GC'd on the GC's schedule.
- No KMS / HSM integration. Keys live in the page.
- No envelope format. The UI shows raw `(K, IV, PT, AAD) → (CT, TAG)`.
- No invocation counter, volume counter, or rotation event.
- No algorithm agility byte; the UI is hard-coded to AES-128.
- No persistent state of any kind. Reload clears everything.

Every one of those is a deliberate scope boundary for a learning tool. Production
code needs all of them.

## References

- [NIST SP 800-38D](https://csrc.nist.gov/pubs/sp/800-38d/final) - AES-GCM specification (revision in progress; this doc tracks the published 2007 edition).
- [NIST SP 800-57 Part 1 Rev 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) - Key management lifecycle and rotation cadences.
- [NIST SP 800-131A Rev 2](https://csrc.nist.gov/pubs/sp/800/131/a/r2/final) - Algorithm transitions and retirement timelines.
- [FIPS 197](https://csrc.nist.gov/pubs/fips/197/final) - AES specification.
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) - Production storage and rotation patterns.
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) - KEK / DEK separation and lifecycle states.
- [RFC 5116](https://www.rfc-editor.org/rfc/rfc5116) - Interface and semantics for AEAD algorithms (Tink and libsodium both implement this shape).
