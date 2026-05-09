import { describe, expect, it } from 'vitest';
import { CHALLENGE_STAGES, CHALLENGES } from '@/data/challenges';
import { aesECB, bytesToHexAES, hexToBytesAES } from '@/lib/aes-math';
import { encodeBytes, parseHexBytes } from '@/lib/encoding';
import { computeHmacSha256Steps } from '@/lib/hmac';
import { SHA256 } from '@/lib/sha256';

function mod(value: bigint, modulus: bigint) {
  return ((value % modulus) + modulus) % modulus;
}

function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
}

function invMod(value: bigint, modulus: bigint) {
  const [g, x] = egcd(mod(value, modulus), modulus);
  if (g !== 1n) throw new Error('No modular inverse');
  return mod(x, modulus);
}

function modPow(base: bigint, exponent: bigint, modulus: bigint) {
  let result = 1n;
  let power = mod(base, modulus);
  let exp = exponent;
  while (exp > 0n) {
    if (exp & 1n) result = (result * power) % modulus;
    power = (power * power) % modulus;
    exp >>= 1n;
  }
  return result;
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
}

function sha256PaddingLength(messageByteLength: number) {
  const zeroCount = (56 - ((messageByteLength + 1) % 64) + 64) % 64;
  return 1 + zeroCount + 8;
}

function gf16Multiply(a: number, b: number) {
  let x = a;
  let y = b;
  let product = 0;
  for (let i = 0; i < 4; i++) {
    if (y & 1) product ^= x;
    const highBit = x & 0x8;
    x = (x << 1) & 0xf;
    if (highBit) x ^= 0x3;
    y >>= 1;
  }
  return product & 0xf;
}

describe('challenge bank', () => {
  it('keeps challenge ids unique and attached to a known stage', () => {
    const ids = new Set(CHALLENGES.map(challenge => challenge.id));
    const stageIds = new Set(CHALLENGE_STAGES.map(stage => stage.id));

    expect(ids.size).toBe(CHALLENGES.length);
    expect(CHALLENGES.every(challenge => stageIds.has(challenge.stageId))).toBe(true);
  });

  it('keeps the staged practice bank balanced', () => {
    expect(CHALLENGE_STAGES).toHaveLength(6);
    expect(CHALLENGES).toHaveLength(30);

    for (const stage of CHALLENGE_STAGES) {
      expect(CHALLENGES.filter(challenge => challenge.stageId === stage.id)).toHaveLength(5);
    }
  });

  it('avoids lookup-only challenge answer formats', () => {
    const lookupOnlyFormats = new Set([
      'Algorithm name',
      'Problem name',
      'Construction name',
      'Mode name',
      'Padding scheme',
      'Resource name',
      'Short phrase',
    ]);

    expect(CHALLENGES.filter(challenge => lookupOnlyFormats.has(challenge.answerFormat ?? ''))).toEqual([]);
  });

  it('keeps starter and building-block answers computationally derived', () => {
    expect(CHALLENGES.find(item => item.id === 'encoding-custom-payload')?.acceptedAnswers).toContain(
      new TextDecoder().decode(new Uint8Array(hexToBytesAES('436f646578206c696b6573206d617468'))).toLowerCase()
    );

    expect(CHALLENGES.find(item => item.id === 'hash-custom-token')?.acceptedAnswers).toContain(
      SHA256.hash('ctool-stage-one')
    );

    const inverse = invMod(37n, 1019n);
    expect(CHALLENGES.find(item => item.id === 'modular-inverse-37-1019')?.acceptedAnswers).toContain(
      inverse.toString()
    );

    const dhPublic = modPow(7n, 123n, 467n);
    expect(CHALLENGES.find(item => item.id === 'dh-public-key-custom')?.acceptedAnswers).toContain(
      dhPublic.toString()
    );

    const rsaCiphertext = modPow(1234n, 17n, 8051n);
    expect(CHALLENGES.find(item => item.id === 'rsa-encrypt-custom')?.acceptedAnswers).toContain(
      rsaCiphertext.toString()
    );

    const hexHmac = computeHmacSha256Steps(
      parseHexBytes('00112233445566778899aabbccddeeff'),
      encodeBytes('ctool-stage-2', 'text')
    ).outerHash;
    expect(CHALLENGES.find(item => item.id === 'hmac-custom-hex-key')?.acceptedAnswers).toContain(hexHmac);

    const textHmac = computeHmacSha256Steps(
      encodeBytes('review-key', 'text'),
      encodeBytes('no lookup allowed', 'text')
    ).outerHash;
    expect(CHALLENGES.find(item => item.id === 'hmac-custom-text-key')?.acceptedAnswers).toContain(textHmac);

    const aesCiphertext = bytesToHexAES(
      aesECB(
        hexToBytesAES('102132435465768798a9babbdcedfe0f'),
        hexToBytesAES('000102030405060708090a0b0c0d0e0f')
      )
    );
    expect(CHALLENGES.find(item => item.id === 'aes-custom-ciphertext')?.acceptedAnswers).toContain(aesCiphertext);

    const gcmH = bytesToHexAES(aesECB(new Array(16).fill(0), hexToBytesAES('feffe9928665731c6d6a8f9467308308')));
    expect(CHALLENGES.find(item => item.id === 'gcm-auth-key-custom')?.acceptedAnswers).toContain(gcmH);
  });

  it('keeps attack-workflow and lab answers instance-based', () => {
    expect(CHALLENGES.find(item => item.id === 'textbook-rsa-tampered-message')?.acceptedAnswers).toContain(
      (77n * 3n).toString()
    );
    expect(CHALLENGES.find(item => item.id === 'dh-subgroup-custom-parity')?.acceptedAnswers).toContain(
      (19n % 2n).toString()
    );
    expect(CHALLENGES.find(item => item.id === 'shamir-secret-custom-f0')?.acceptedAnswers).toContain('197');
    expect(CHALLENGES.find(item => item.id === 'hastad-custom-message')?.acceptedAnswers).toContain('73');
    expect(CHALLENGES.find(item => item.id === 'birthday-40-work')?.acceptedAnswers).toContain(
      (2n ** 20n).toString()
    );
    expect(CHALLENGES.find(item => item.id === 'crt-fault-custom-factor')?.acceptedAnswers).toContain(
      gcd(1234n - 1295n, 3233n).toString()
    );
    expect(CHALLENGES.find(item => item.id === 'hash-extension-padding-count')?.acceptedAnswers).toContain(
      sha256PaddingLength(9 + 11).toString()
    );

    const b = 2n ** BigInt(8 * (4 - 2));
    const interval = `${2n * b}-${3n * b - 1n}`;
    expect(CHALLENGES.find(item => item.id === 'bleichenbacher-interval')?.acceptedAnswers).toContain(interval);

    expect(CHALLENGES.find(item => item.id === 'gcm-first-counter-custom')?.acceptedAnswers).toContain('00000002');
    const schnorrLeft = modPow(2n, 8n, 23n);
    const schnorrRight = (16n * modPow(8n, 5n, 23n)) % 23n;
    expect(schnorrLeft).toBe(schnorrRight);
    expect(CHALLENGES.find(item => item.id === 'schnorr-numeric-verifier')?.acceptedAnswers).toContain(
      schnorrLeft.toString()
    );
    expect(CHALLENGES.find(item => item.id === 'lwe-threshold-instance')?.acceptedAnswers).toContain('1');
  });

  it('keeps custom extreme challenge answers computationally derived', () => {
    const root = CHALLENGES.find(item => item.id === 'small-root-congruence');
    expect(modPow(42n + 37n, 3n, 11413n)).toBe(2280n);
    expect(root?.acceptedAnswers).toContain('42');

    const transcript = CHALLENGES.find(item => item.id === 'tls-transcript-hash-instance');
    const digest = SHA256.hashBytes(new Uint8Array(hexToBytesAES('010000060303a1b2c3d40200000a1301001d00200123')));
    expect(transcript?.acceptedAnswers).toContain(digest.slice(0, 16));

    const miniGhash = CHALLENGES.find(item => item.id === 'mini-ghash-tag');
    const tag = gf16Multiply(gf16Multiply(0x6, 0xb) ^ 0x5, 0xb).toString(16);
    expect(miniGhash?.acceptedAnswers).toContain(tag);
  });

  it('validates the leaky nonce private key instance', () => {
    const challenge = CHALLENGES.find(item => item.id === 'ecdsa-leaky-nonce-instance');
    const q = 1019n;
    const r = 455n;
    const candidates = [
      { z: 321n, s: 906n, residue: 13n },
      { z: 654n, s: 412n, residue: 29n },
    ];

    const matches = new Set<string>();
    for (let a = 0n; a < 16n; a++) {
      const k1 = candidates[0].residue + 32n * a;
      if (k1 <= 0n || k1 >= 512n) continue;
      const d1 = mod((candidates[0].s * k1 - candidates[0].z) * invMod(r, q), q);

      for (let b = 0n; b < 16n; b++) {
        const k2 = candidates[1].residue + 32n * b;
        if (k2 <= 0n || k2 >= 512n) continue;
        const d2 = mod((candidates[1].s * k2 - candidates[1].z) * invMod(r, q), q);
        if (d1 === d2) matches.add(d1.toString());
      }
    }

    expect([...matches]).toEqual(['731']);
    expect(challenge?.acceptedAnswers).toContain('731');
  });
});
