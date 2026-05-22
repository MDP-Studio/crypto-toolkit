# Release Provenance and SBOM Checklist

CryptoToolkit is an educational cryptography lab, not a production crypto
library. Release artifacts here improve transparency for reviewers and users,
but they do not certify the educational implementations as production-safe.

This checklist addresses OWASP Top 10:2025 A03 Software Supply Chain Failures
and A08 Software or Data Integrity Failures by producing:

- A CycloneDX JSON SBOM generated from `package-lock.json`
- A SHA-256 checksum manifest for release inputs and built `dist/` assets
- An unsigned local provenance statement with git commit, tag, build commands,
  tool versions, OWASP mapping, and release boundary

## Release Checklist

Run from a clean checkout:

```bash
npm ci
npm run ci
git tag v1.0.0
npm run release:artifacts -- --require-tag --require-clean
```

If `dist/` has not been built yet, run `npm run build` before generating the
artifacts. `npm run ci` already includes the production build.

The generated files are written to:

```text
release-artifacts/<tag-or-version-commit>/
```

Expected files:

```text
crypto-toolkit-1.0.0.sbom.cdx.json
crypto-toolkit-1.0.0.provenance.local.json
crypto-toolkit-1.0.0.sha256
```

## GitHub Release Upload

Attach the three generated files to the matching GitHub release. The release
notes should keep the boundary explicit:

```text
This release publishes SBOM, checksum, and local provenance artifacts for
reviewability. CryptoToolkit remains an educational cryptography lab and should
not be used as a production cryptographic library.
```

Do not describe the SBOM or checksum file as a security certification. They are
release transparency artifacts.

## Verify an Artifact

After downloading a release artifact set:

```bash
sha256sum -c crypto-toolkit-1.0.0.sha256
```

On Windows PowerShell, verify a single file with:

```powershell
Get-FileHash .\crypto-toolkit-1.0.0.sbom.cdx.json -Algorithm SHA256
```
