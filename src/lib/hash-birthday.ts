export function birthdayOutputSpace(bits: number): number {
  if (!Number.isInteger(bits) || bits < 1 || bits > 32) {
    throw new Error('bits must be an integer from 1 to 32');
  }
  return 2 ** bits;
}

export function birthdayExpectedAttempts(bits: number): number {
  return Math.round(Math.sqrt(Math.PI / 2 * birthdayOutputSpace(bits)));
}

export function truncateHashBits(fullHash: string, bits: number): { key: string; hex: string } {
  if (!Number.isInteger(bits) || bits < 1 || bits > 256) {
    throw new Error('bits must be an integer from 1 to 256');
  }
  if (!/^[0-9a-fA-F]+$/.test(fullHash)) throw new Error('hash must be hex');
  const hexChars = Math.ceil(bits / 4);
  if (fullHash.length < hexChars) throw new Error('hash is too short for requested bit length');
  const prefixBits = hexChars * 4;
  const value = BigInt('0x' + fullHash.substring(0, hexChars)) >> BigInt(prefixBits - bits);
  return {
    key: value.toString(),
    hex: value.toString(16).padStart(hexChars, '0'),
  };
}
