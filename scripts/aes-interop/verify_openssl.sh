#!/usr/bin/env bash
# Cross-check the AES interop vector pack against the system `openssl` binary.
#
# Reads src/data/aes-interop-vectors.json and asserts that the OpenSSL CLI
# reproduces the AES-ECB published ciphertexts. Run from repo root:
#
#     bash scripts/aes-interop/verify_openssl.sh
#
# Requires:
#   * openssl in PATH
#   * node in PATH (for JSON parsing only; no crypto)
#   * xxd in PATH (binutils on most distros / Git Bash on Windows)
#
# Exits 0 when AES-ECB parity passes. AES-GCM is intentionally skipped because
# the OpenSSL `enc` CLI does not expose reliable AEAD tag verification; use
# verify_python.py for full AES-GCM ciphertext and tag parity.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VECTORS="${ROOT}/src/data/aes-interop-vectors.json"

if [[ ! -f "${VECTORS}" ]]; then
  echo "Cannot find vector pack at ${VECTORS}" >&2
  exit 1
fi

for bin in openssl node xxd; do
  if ! command -v "${bin}" >/dev/null 2>&1; then
    echo "Required dependency '${bin}' not found in PATH" >&2
    exit 1
  fi
done

OPENSSL_VERSION="$(openssl version | awk '{print $2}')"
echo "openssl: ${OPENSSL_VERSION}"
echo

TMPDIR_REAL="$(mktemp -d)"
trap 'rm -rf "${TMPDIR_REAL}"' EXIT

# Emit each vector as one pipe-separated line: kind|id|key|iv|pt|aad|ct|tag.
# The delimiter is intentionally non-whitespace so Bash preserves empty fields.
node - "${VECTORS}" <<'JS' > "${TMPDIR_REAL}/vectors.tsv"
const fs = require('node:fs');
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (const v of data.ecb) {
  console.log(['ecb', v.id, v.keyHex, '', v.plaintextHex, '', v.ciphertextHex, ''].join('|'));
}
for (const v of data.gcm) {
  console.log([
    'gcm',
    v.id,
    v.keyHex,
    v.ivHex,
    v.plaintextHex,
    v.aadHex,
    v.ciphertextHex,
    v.tagHex,
  ].join('|'));
}
JS

failures=0
total=0
skipped=0

check_ecb() {
  local id="$1" key="$2" pt="$3" expected_ct="$4"
  local pt_bin="${TMPDIR_REAL}/${id}.pt.bin"
  local ct_bin="${TMPDIR_REAL}/${id}.ct.bin"
  printf "%s" "${pt}" | xxd -r -p > "${pt_bin}"
  openssl enc -aes-128-ecb -nopad -K "${key}" -in "${pt_bin}" -out "${ct_bin}" 2>/dev/null
  local actual
  actual="$(xxd -p -c 1024 "${ct_bin}" | tr -d '\n')"
  if [[ "${actual}" == "${expected_ct}" ]]; then
    printf 'PASS  ECB %s\n' "${id}"
  else
    printf 'FAIL  ECB %s\n  expected=%s\n  actual  =%s\n' "${id}" "${expected_ct}" "${actual}"
    failures=$((failures + 1))
  fi
}

check_gcm() {
  local id="$1" key="$2" iv="$3" pt="$4" aad="$5" expected_ct="$6" expected_tag="$7"
  # Keep every field referenced so TSV format drift still fails under set -u.
  : "${key}" "${iv}" "${pt}" "${aad}" "${expected_ct}" "${expected_tag}"
  printf 'SKIP  GCM %s (OpenSSL enc does not expose AEAD tag verification; run verify_python.py)\n' "${id}"
}

while IFS='|' read -r kind id key iv pt aad ct tag; do
  total=$((total + 1))
  case "${kind}" in
    ecb) check_ecb "${id}" "${key}" "${pt}" "${ct}" ;;
    gcm) check_gcm "${id}" "${key}" "${iv}" "${pt}" "${aad}" "${ct}" "${tag}"; skipped=$((skipped + 1)) ;;
    *) echo "unknown kind: ${kind}" >&2; exit 1 ;;
  esac
done < "${TMPDIR_REAL}/vectors.tsv"

echo
if (( failures > 0 )); then
  echo "${failures} of ${total} vector(s) failed parity against OpenSSL."
  exit 1
fi
checked=$((total - skipped))
echo "${checked} vector(s) PASS parity against OpenSSL CLI; ${skipped} AES-GCM vector(s) skipped because OpenSSL enc does not verify AEAD tags."
echo "Run scripts/aes-interop/verify_python.py for full AES-GCM ciphertext and tag parity."
