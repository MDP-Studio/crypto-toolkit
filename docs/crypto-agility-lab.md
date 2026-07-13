# Crypto-Agility Inventory and Migration Lab

The `#/crypto-agility` learning page turns NIST crypto-agility guidance into a small design exercise. It deliberately does not implement or recommend custom production cryptography.

## What the lab covers

- Inventory fields beyond algorithm names: purpose, algorithm identifier, envelope or policy version, owner, protected-data lifetime, migration target, and protocol boundary.
- A long-lived RSA key-wrapping example that receives higher post-quantum migration priority than AES-256-GCM or Argon2id.
- Versioned-envelope migration with approved dual-read, single-write behavior.
- Explicit rejection of unknown, retired, or silently downgraded formats.
- Provider-owned TLS boundaries and standardized hybrid-profile pilots.
- Failure-safe rollback that separates read compatibility from permission to create retired formats.

## Evidence boundary

The inventory is a fictional teaching system. The correct answers demonstrate migration reasoning and are covered by `src/__tests__/crypto-agility.test.ts`. They are not interoperability evidence for ML-KEM, ML-DSA, a TLS provider, or a production KMS.

Production work still needs an inventory of the real system, supported implementations, protocol-owner approval, test vectors, interoperability testing, staged telemetry, and a documented rollback decision.
