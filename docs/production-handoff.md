# Production Crypto Handoff Checklist

CryptoToolkit is an educational lab. It helps people see cryptographic
mechanics and failure modes, but it is not a production cryptography library.
This checklist is the handoff boundary for anyone who learns a workflow here
and then needs to build a real system.

## First Decision: Do Not Port The Demo

Use a maintained production primitive instead of copying code from the lab:

| Need | Use instead | Why |
| --- | --- | --- |
| Browser symmetric encryption | Web Crypto API `AES-GCM` | Native implementation, browser-supported key objects, no JavaScript BigInt secret math |
| Backend AEAD | libsodium `crypto_aead_*` or Google Tink `AEAD` | Misuse-resistant wrappers, tested primitives, keyset support |
| Password hashing | Argon2id through a maintained backend library | Calibrated memory and iteration parameters, server-side resource policy |
| Signatures | Web Crypto, libsodium, Tink, or language-native libraries | Avoid nonce, padding, and format errors |
| Key storage | KMS, HSM, Vault Transit, or cloud key management | Separation of key-encryption keys from application data |

If a production design cannot name the library, key owner, rotation trigger,
envelope format, and rollback plan, it is not ready to receive real secrets.

## Minimum Handoff Questions

Answer these before building beyond a prototype:

1. What asset is protected: message body, file, database field, token, backup,
   or transport session?
2. What threat is in scope: stolen storage, malicious admin, network attacker,
   offline password guessing, tenant escape, or tampering?
3. Where are keys generated, stored, rotated, revoked, backed up, and destroyed?
4. How are nonces or IVs allocated, persisted, and prevented from repeating?
5. Which metadata is authenticated as AAD?
6. How will old ciphertexts be decrypted after a key or algorithm migration?
7. What telemetry proves encryption succeeded without logging plaintext, keys,
   passphrases, raw tokens, or customer secrets?
8. What incident process runs if a key, nonce counter, dependency, or envelope
   version is compromised?

## Safe AEAD Envelope Shape

A production AEAD envelope should bind its security metadata into the
authentication tag:

```text
suite_id || key_id || nonce || ciphertext || tag
```

Pass `suite_id || key_id || tenant_id || resource_type || resource_id` as AAD
when those fields are security-relevant. The AAD does not need to be secret, but
it must not be silently mutable.

Recommended baseline:

- Use an AEAD mode such as AES-GCM, AES-GCM-SIV, XChaCha20-Poly1305, or a
  Tink/libsodium wrapper that chooses the envelope for you.
- Generate or allocate nonces according to the library guidance. For AES-GCM,
  prove uniqueness under each key and rotate before operational limits.
- Store an explicit suite version so old ciphertexts can still be decrypted
  during migrations.
- Use an active key only for encryption. Allow deactivated keys for decrypt-only
  until data is re-encrypted.
- Keep KEKs in a KMS, HSM, or Vault Transit style service. Keep DEKs scoped to
  one tenant, dataset, or purpose.

## Misuse Cases To Test

Treat these as required negative tests for a real implementation:

- Reused nonce or repeated invocation counter is rejected before encryption.
- Swapping `key_id`, `suite_id`, tenant, or resource metadata breaks
  authentication.
- Old suite ciphertext can be decrypted but not newly encrypted.
- Weak password or undersized Argon2id parameters are rejected.
- Truncated, extra-field, unknown-version, and huge-envelope inputs fail closed.
- Decrypt failure does not reveal whether the passphrase, tag, or metadata was
  wrong.
- Logs, traces, metrics, and error pages never include plaintext, key material,
  passphrases, raw envelopes, or customer secrets.

## What CryptoToolkit Can Help Validate

CryptoToolkit is useful for:

- Showing how primitives work at teaching scale.
- Demonstrating what goes wrong when RSA padding, AES-GCM nonces, ECDSA nonces,
  MAC construction, or timing behavior are mishandled.
- Checking small test vectors and explaining AAD, tags, key derivation, and
  attack preconditions.

CryptoToolkit is not useful for:

- Generating production keys.
- Protecting real customer data.
- Proving side-channel resistance.
- Auditing a KMS integration.
- Certifying compliance with FIPS, PCI DSS, SOC 2, ISO 27001, or Common
  Criteria.

## References

- [NIST SP 800-38D](https://csrc.nist.gov/pubs/sp/800-38d/final) for AES-GCM.
- [NIST SP 800-57 Part 1 Rev 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final) for key management lifecycle.
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) for storage design.
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) for key lifecycle and separation.
- [RFC 5116](https://www.rfc-editor.org/rfc/rfc5116) for AEAD interface semantics.
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [libsodium](https://doc.libsodium.org/), and [Google Tink](https://developers.google.com/tink) for production-grade implementation surfaces.
