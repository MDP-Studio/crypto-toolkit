import { bytesToHex, parseHexBytes } from './encoding';
import { SHA256 } from './sha256';

export interface HmacSha256Steps {
  keyBytesHex: string;
  normalizedKeyHex: string;
  paddedKeyHex: string;
  ipadXorHex: string;
  opadXorHex: string;
  innerHash: string;
  outerHash: string;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

// RFC 2104 Section 2 / RFC 4231: HMAC pads K to the hash block size,
// then computes H((K xor opad) || H((K xor ipad) || text)).
export function computeHmacSha256Steps(
  keyBytes: Uint8Array,
  messageBytes: Uint8Array
): HmacSha256Steps {
  const blockSize = 64; // SHA-256 block size in bytes
  let normalizedKey = keyBytes;

  if (normalizedKey.length > blockSize) {
    normalizedKey = parseHexBytes(SHA256.hashBytes(normalizedKey));
  }

  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(normalizedKey);

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }

  const innerInput = new Uint8Array(blockSize + messageBytes.length);
  innerInput.set(ipad);
  innerInput.set(messageBytes, blockSize);
  const innerHash = SHA256.hashBytes(innerInput);

  const innerHashBytes = parseHexBytes(innerHash);
  const outerInput = new Uint8Array(blockSize + innerHashBytes.length);
  outerInput.set(opad);
  outerInput.set(innerHashBytes, blockSize);
  const outerHash = SHA256.hashBytes(outerInput);

  return {
    keyBytesHex: bytesToHex(keyBytes),
    normalizedKeyHex: bytesToHex(normalizedKey),
    paddedKeyHex: bytesToHex(paddedKey),
    ipadXorHex: bytesToHex(ipad),
    opadXorHex: bytesToHex(opad),
    innerHash,
    outerHash,
  };
}

export async function computeHmacSha1Hex(
  keyBytes: Uint8Array,
  messageBytes: Uint8Array
): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(keyBytes),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, toArrayBuffer(messageBytes));
  return bytesToHex(new Uint8Array(signature));
}
