import { modPow } from './ec-math';

export interface DHSubgroupLeak {
  maliciousG: bigint;
  order: bigint;
  victimPub: bigint;
  sharedSecret: bigint;
  recoveredMod: bigint;
  explanation: string;
}

function leakForGenerator(p: bigint, secret: bigint, maliciousG: bigint, order: bigint, explanation: string): DHSubgroupLeak {
  const victimPub = modPow(maliciousG, secret, p);
  let recoveredMod = 0n;
  for (let k = 0n; k < order; k++) {
    if (modPow(maliciousG, k, p) === victimPub) {
      recoveredMod = k;
      break;
    }
  }
  return {
    maliciousG,
    order,
    victimPub,
    sharedSecret: modPow(victimPub, secret, p),
    recoveredMod,
    explanation,
  };
}

export function findDHSmallSubgroupLeaks(p: bigint, secret: bigint): DHSubgroupLeak[] {
  const results: DHSubgroupLeak[] = [];

  results.push(leakForGenerator(
    p,
    secret,
    1n,
    1n,
    'g=1: every power is 1. Shared secret is always 1 regardless of private key.'
  ));

  const g2 = p - 1n;
  const pub2 = modPow(g2, secret, p);
  results.push({
    maliciousG: g2,
    order: 2n,
    victimPub: pub2,
    sharedSecret: modPow(pub2, secret, p),
    recoveredMod: pub2 === 1n ? 0n : 1n,
    explanation: `g=p-1: has order 2. Victim's public key reveals secret mod 2 = ${pub2 === 1n ? '0 (even)' : '1 (odd)'}.`,
  });

  const pMinus1 = p - 1n;
  const testedOrders = new Set<string>(['1', '2']);
  for (let factor = 2n; factor * factor <= pMinus1; factor++) {
    if (pMinus1 % factor !== 0n) continue;
    for (const smallOrder of [factor, pMinus1 / factor]) {
      if (testedOrders.has(smallOrder.toString())) continue;
      testedOrders.add(smallOrder.toString());
      const g3 = modPow(2n, pMinus1 / smallOrder, p);
      if (g3 === 1n || modPow(g3, smallOrder, p) !== 1n) continue;
      const leak = leakForGenerator(p, secret, g3, smallOrder, '');
      leak.explanation = `g=${g3}: has order ${smallOrder}. Leaked: secret is congruent to ${leak.recoveredMod} (mod ${smallOrder}).`;
      results.push(leak);
      return results;
    }
  }

  return results;
}
