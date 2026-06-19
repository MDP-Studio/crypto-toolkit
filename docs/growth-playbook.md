# CryptoToolkit Growth Playbook

Last updated: 2026-06-01

## Positioning

CryptoToolkit should be the traffic magnet for the wider MDP Studio security portfolio: a browser-only cryptography learning lab with real computations, exact calculators, attack demos, and challenge practice.

## Search Pages

| Page | Search intent | Primary action |
| --- | --- | --- |
| `/` | cryptography calculator, AES calculator, RSA calculator, HMAC-SHA256, HMAC-SHA1 | Open a module |
| `/learn/cryptography-calculators.html` | AES-GCM calculator, RSA key generator, HMAC-SHA256, legacy HMAC-SHA1, SHA hash, Base64 converter, elliptic curve calculator | Open the exact calculator |
| `/learn/aes-gcm-failures.html` | how AES-GCM fails, GCM nonce reuse | Open the GCM nonce module |
| `/learn/rsa-attacks.html` | RSA attacks explained | Open RSA attack demos |
| `/learn/production-crypto-handoff.html` | production crypto checklist, AES-GCM implementation checklist, key management checklist | Move from the lesson to safe implementation guidance |
| `/#/challenges` | cryptography challenges | Start challenge hub |
| `/#/assurance` | crypto toolkit test vectors | Review assurance matrix |

## Weekly Tracking

Record this every Monday from Google Search Console:

| Week | Impressions | Clicks | Top query | Top page | Action |
| --- | ---: | ---: | --- | --- | --- |
| 2026-05-18 | TBD | TBD | TBD | TBD | Baseline after sitemap submission |
| 2026-06-01 | TBD | TBD | TBD | TBD | Added exact calculator guide and root metadata for calculator-intent queries |
| 2026-06-19 | TBD | TBD | TBD | TBD | Added production handoff checklist for safe-implementation searches |

## Distribution Assets

LinkedIn draft:

> I added a searchable CryptoToolkit calculator guide so the site is clearer than "cryptography lab" in search: AES-GCM, RSA key generation, HMAC-SHA256, legacy HMAC-SHA1 compatibility checks, SHA-1/SHA-256 hashing, Base64/hex/text conversion, elliptic curve math, modular arithmetic, factorization, and classical cipher tools.
>
> Try it: https://ctool.mdpstudio.com.au/learn/cryptography-calculators.html
>
> #Cryptography #CyberSecurity #WebCrypto #SecurityEngineering #PortfolioProject

Existing guide-page draft:

> I added searchable guide pages to CryptoToolkit for the two lessons people ask about most: how AES-GCM fails when nonces are reused, and how RSA breaks under weak parameters or unsafe padding. Each guide links into a runnable browser demo, so the explanation does not stop at static notes.
>
> Try it: https://ctool.mdpstudio.com.au
>
> #Cryptography #CyberSecurity #WebCrypto #SecurityEngineering #PortfolioProject

Production handoff draft:

> CryptoToolkit is a learning lab, not production crypto. I added a handoff checklist for the exact moment where the lesson should stop and a real implementation should start: AEAD envelopes, nonce allocation, AAD metadata binding, KMS/HSM boundaries, key rotation, and misuse tests.
>
> Try it: https://ctool.mdpstudio.com.au/learn/production-crypto-handoff.html
>
> #Cryptography #SecurityEngineering #AppSec #WebCrypto

Community post angle:

> I built a browser-only cryptography learning lab where the attack demos run for real at teaching sizes: RSA factoring, textbook RSA malleability, Wiener's attack, GCM nonce reuse, padding oracles, hash length extension, and more.

Short video idea:

1. Open `/learn/cryptography-calculators.html`.
2. Click into the RSA key generator and show encrypt/decrypt.
3. Return to the guide and open the HMAC-SHA256 walkthrough or the legacy HMAC-SHA1 document-ID helper.
4. Jump to `/learn/aes-gcm-failures.html`.
5. Show two ciphertexts leaking plaintext relationship.
