// Cross-implementation parity for AES-ECB and AES-GCM.
// Same vector pack drives the toolkit, WebCrypto (crypto.subtle), and the
// Python/OpenSSL reproducibility helpers under scripts/aes-interop/. Treat a
// failure here as the educational implementation diverging from a production
// reference, not as a test-environment flake.

import { describe, it, expect } from 'vitest';
import vectors from '../data/aes-interop-vectors.json';
import { aesECB, aesECBDecrypt, aesGCM, hexToBytesAES, bytesToHexAES } from '../lib/aes-math';
import { webCryptoAESGCM } from '../lib/web-crypto';

function hexToU8(hex: string): Uint8Array {
  return Uint8Array.from(hexToBytesAES(hex));
}

function u8ToHex(u8: Uint8Array): string {
  return Array.from(u8, b => b.toString(16).padStart(2, '0')).join('');
}

// crypto.subtle's TypeScript types require an explicit ArrayBuffer because a
// Uint8Array could be backed by SharedArrayBuffer in some runtimes. Slicing
// .buffer gives us a fresh ArrayBuffer view, matching the pattern in
// src/lib/web-crypto.ts.
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

describe('AES-ECB interop (FIPS 197)', () => {
  for (const v of vectors.ecb) {
    it(`toolkit aesECB matches ${v.source} (${v.id})`, () => {
      const ct = aesECB(hexToBytesAES(v.plaintextHex), hexToBytesAES(v.keyHex));
      expect(bytesToHexAES(ct)).toBe(v.ciphertextHex);
    });

    it(`toolkit aesECBDecrypt matches ${v.source} (${v.id})`, () => {
      const pt = aesECBDecrypt(hexToBytesAES(v.ciphertextHex), hexToBytesAES(v.keyHex));
      expect(bytesToHexAES(pt)).toBe(v.plaintextHex);
    });

    // WebCrypto exposes AES-CBC, not raw ECB. For a single 16-byte block,
    // AES-CBC with a zero IV is equivalent to AES-ECB (CBC XORs the first
    // block with the zero IV before the cipher call). Use that equivalence
    // to cross-check the toolkit's single-block ECB output against the
    // browser/runtime's constant-time AES.
    it(`WebCrypto AES-CBC zero-IV first block matches ${v.source} (${v.id})`, async () => {
      const key = await crypto.subtle.importKey(
        'raw',
        toArrayBuffer(hexToU8(v.keyHex)),
        'AES-CBC',
        false,
        ['encrypt']
      );
      const out = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: new ArrayBuffer(16) },
        key,
        toArrayBuffer(hexToU8(v.plaintextHex))
      );
      const firstBlock = new Uint8Array(out).slice(0, 16);
      expect(u8ToHex(firstBlock)).toBe(v.ciphertextHex);
    });
  }
});

describe('AES-GCM interop (NIST SP 800-38D)', () => {
  for (const v of vectors.gcm) {
    it(`toolkit aesGCM matches ${v.source} (${v.id})`, () => {
      const result = aesGCM(
        hexToBytesAES(v.plaintextHex),
        hexToBytesAES(v.keyHex),
        hexToBytesAES(v.ivHex),
        hexToBytesAES(v.aadHex)
      );
      expect(bytesToHexAES(result.ciphertext)).toBe(v.ciphertextHex);
      expect(bytesToHexAES(result.tag)).toBe(v.tagHex);
    });

    it(`WebCrypto AES-GCM matches ${v.source} (${v.id})`, async () => {
      const out = await webCryptoAESGCM(
        hexToU8(v.plaintextHex),
        hexToU8(v.keyHex),
        hexToU8(v.ivHex),
        hexToU8(v.aadHex)
      );
      expect(out).not.toBeNull();
      if (!out) return;
      expect(u8ToHex(out.ciphertext)).toBe(v.ciphertextHex);
      expect(u8ToHex(out.tag)).toBe(v.tagHex);
    });

    it(`toolkit and WebCrypto agree on ${v.source} (${v.id})`, async () => {
      const toolkit = aesGCM(
        hexToBytesAES(v.plaintextHex),
        hexToBytesAES(v.keyHex),
        hexToBytesAES(v.ivHex),
        hexToBytesAES(v.aadHex)
      );
      const subtle = await webCryptoAESGCM(
        hexToU8(v.plaintextHex),
        hexToU8(v.keyHex),
        hexToU8(v.ivHex),
        hexToU8(v.aadHex)
      );
      expect(subtle).not.toBeNull();
      if (!subtle) return;
      expect(bytesToHexAES(toolkit.ciphertext)).toBe(u8ToHex(subtle.ciphertext));
      expect(bytesToHexAES(toolkit.tag)).toBe(u8ToHex(subtle.tag));
    });
  }
});
