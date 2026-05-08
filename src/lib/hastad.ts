import { gcd } from './crypto-math';
import { modInverse, modPow } from './ec-math';
import { icbrt } from './num-util';

export type HastadModuli = [bigint, bigint, bigint];
export type HastadCiphertexts = [bigint, bigint, bigint];

export function validateHastadPreconditions(m: bigint, moduli: HastadModuli): string | null {
  const [n1, n2, n3] = moduli;
  if (m < 0n) return 'm must be non-negative';
  if (n1 <= 1n || n2 <= 1n || n3 <= 1n) return 'moduli must be greater than 1';
  if (m >= n1 || m >= n2 || m >= n3) return 'm must be smaller than each modulus';
  if (gcd(n1, n2) !== 1n || gcd(n1, n3) !== 1n || gcd(n2, n3) !== 1n) {
    return 'n1, n2, and n3 must be pairwise coprime for CRT';
  }
  if (m ** 3n >= n1 * n2 * n3) {
    return 'Attack precondition failed: m^3 must be smaller than n1*n2*n3';
  }
  return null;
}

export function encryptHastadBroadcast(m: bigint, moduli: HastadModuli): HastadCiphertexts {
  return [
    modPow(m, 3n, moduli[0]),
    modPow(m, 3n, moduli[1]),
    modPow(m, 3n, moduli[2]),
  ];
}

export function recoverHastadBroadcast(
  ciphertexts: HastadCiphertexts,
  moduli: HastadModuli
): { crtValue: bigint; recovered: bigint | null } {
  const [n1, n2, n3] = moduli;
  if (gcd(n1, n2) !== 1n || gcd(n1, n3) !== 1n || gcd(n2, n3) !== 1n) {
    throw new Error('n1, n2, and n3 must be pairwise coprime for CRT');
  }

  const [c1, c2, c3] = ciphertexts;
  const N = n1 * n2 * n3;
  const N1 = N / n1;
  const N2 = N / n2;
  const N3 = N / n3;

  const y1 = modInverse(N1, n1);
  const y2 = modInverse(N2, n2);
  const y3 = modInverse(N3, n3);

  const crtValue = (c1 * N1 * y1 + c2 * N2 * y2 + c3 * N3 * y3) % N;
  const m = icbrt(crtValue);
  return { crtValue, recovered: m * m * m === crtValue ? m : null };
}
