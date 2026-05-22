// Dedicated Web Worker for memory-hard hashing (Argon2id)
// WASM module loaded once on worker init, reused across calls

let argon2idFn: typeof import('hash-wasm').argon2id | null = null;

type HashWorkerRequest = {
  id: number;
  password: string;
  salt: string;
  memorySize: number;
  iterations: number;
  parallelism: number;
  hashLength: number;
};

function fail(id: number, error: string) {
  self.postMessage({ id, result: null, error });
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

// Load WASM module once on worker startup
async function init() {
  const { argon2id } = await import('hash-wasm');
  argon2idFn = argon2id;
  self.postMessage({ type: 'ready' });
}

init();

self.onmessage = async (e: MessageEvent<HashWorkerRequest>) => {
  const { id, password, salt, memorySize, iterations, parallelism, hashLength } = e.data;

  if (!argon2idFn) {
    fail(id, 'WASM not loaded yet');
    return;
  }

  try {
    if (!isIntInRange(id, 0, Number.MAX_SAFE_INTEGER)) { fail(0, 'Invalid request id'); return; }
    if (typeof password !== 'string') { fail(id, 'password must be a string'); return; }
    if (typeof salt !== 'string') { fail(id, 'salt must be a string'); return; }
    if (!isIntInRange(memorySize, 8, 262144)) { fail(id, 'memorySize must be an integer from 8-262144 KB'); return; }
    if (!isIntInRange(iterations, 1, 10)) { fail(id, 'iterations must be an integer from 1-10'); return; }
    if (!isIntInRange(parallelism, 1, 8)) { fail(id, 'parallelism must be an integer from 1-8'); return; }
    if (!isIntInRange(hashLength, 4, 128)) { fail(id, 'hashLength must be an integer from 4-128 bytes'); return; }

    const t0 = performance.now();
    const hash = await argon2idFn({
      password,
      salt,
      parallelism,
      iterations,
      memorySize,
      hashLength,
      outputType: 'hex',
    });
    const timeMs = performance.now() - t0;

    self.postMessage({
      id,
      result: { hash, timeMs: Math.round(timeMs), memorySize },
      error: null,
    });
  } catch (err) {
      console.debug('Recovered from non-fatal error in src/workers/hash.worker.ts:67.', err);
    self.postMessage({ id, result: null, error: String(err) });
  }
};
