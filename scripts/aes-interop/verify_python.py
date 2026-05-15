"""Cross-check the AES interop vector pack against the Python `cryptography` library.

Loads `src/data/aes-interop-vectors.json` and asserts that:
  - AES-ECB encrypts each FIPS 197 vector to the published ciphertext.
  - AES-GCM encrypts each NIST SP 800-38D vector to the published ciphertext and tag.

Run from the repository root:

    python -m pip install cryptography
    python scripts/aes-interop/verify_python.py

Exits 0 on full parity. Exits 1 with a diff on the first mismatch.

This script intentionally uses production primitives (`AESGCM`, `Cipher(AES, ECB)`)
to confirm that the educational toolkit's outputs agree with a well-known
production reference. The toolkit itself is not production-safe; see
docs/aes-lifecycle.md for the lifecycle controls a real deployment needs.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


ROOT = Path(__file__).resolve().parents[2]
VECTORS = ROOT / "src" / "data" / "aes-interop-vectors.json"


def _hex(b: bytes) -> str:
    return b.hex()


def check_ecb(vector: dict) -> tuple[bool, str]:
    key = bytes.fromhex(vector["keyHex"])
    pt = bytes.fromhex(vector["plaintextHex"])
    expected = vector["ciphertextHex"]

    cipher = Cipher(algorithms.AES(key), modes.ECB()).encryptor()
    ct = cipher.update(pt) + cipher.finalize()
    actual = _hex(ct)
    return actual == expected, f"expected={expected} actual={actual}"


def check_gcm(vector: dict) -> tuple[bool, str]:
    key = bytes.fromhex(vector["keyHex"])
    iv = bytes.fromhex(vector["ivHex"])
    pt = bytes.fromhex(vector["plaintextHex"])
    aad = bytes.fromhex(vector["aadHex"])

    aesgcm = AESGCM(key)
    out = aesgcm.encrypt(iv, pt, aad if aad else None)
    ct, tag = out[:-16], out[-16:]
    expected_ct = vector["ciphertextHex"]
    expected_tag = vector["tagHex"]
    ct_ok = _hex(ct) == expected_ct
    tag_ok = _hex(tag) == expected_tag
    return (
        ct_ok and tag_ok,
        f"expected_ct={expected_ct} actual_ct={_hex(ct)} expected_tag={expected_tag} actual_tag={_hex(tag)}",
    )


def main() -> int:
    data = json.loads(VECTORS.read_text())
    failures: list[str] = []

    for vector in data["ecb"]:
        ok, detail = check_ecb(vector)
        label = f"ECB {vector['id']} ({vector['source']})"
        if ok:
            print(f"PASS  {label}")
        else:
            print(f"FAIL  {label}: {detail}")
            failures.append(label)

    for vector in data["gcm"]:
        ok, detail = check_gcm(vector)
        label = f"GCM {vector['id']} ({vector['source']})"
        if ok:
            print(f"PASS  {label}")
        else:
            print(f"FAIL  {label}: {detail}")
            failures.append(label)

    if failures:
        print(f"\n{len(failures)} vector(s) failed parity: {', '.join(failures)}")
        return 1
    print("\nAll vectors PASS parity against Python `cryptography`.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
