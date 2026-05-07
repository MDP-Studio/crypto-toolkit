export type ByteInputEncoding = 'text' | 'hex';

export function bytesToHex(bytes: ArrayLike<number>): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function parseHexBytes(input: string): Uint8Array {
  const clean = input.replace(/0x/gi, '').replace(/[\s:_-]+/g, '');
  if (clean.length === 0) return new Uint8Array(0);
  if (clean.length % 2 !== 0) {
    throw new Error('Hex input must contain complete bytes: use an even number of hex digits.');
  }
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error('Hex input can only contain 0-9 and a-f characters.');
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function encodeBytes(input: string, encoding: ByteInputEncoding): Uint8Array {
  if (encoding === 'hex') return parseHexBytes(input);
  return new TextEncoder().encode(input);
}
