import * as nodeCrypto from 'node:crypto';

// Guarantee `globalThis.crypto` exists early in the boot sequence so any module
// (e.g. TypeORM) can safely call `crypto.randomUUID()` during its initialization.
const providedCrypto =
  (nodeCrypto.webcrypto ?? nodeCrypto) as unknown as Crypto;

if (!globalThis.crypto) {
  (globalThis as typeof globalThis & { crypto: Crypto }).crypto =
    providedCrypto;
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  (globalThis.crypto as unknown as { randomUUID: () => string }).randomUUID =
    nodeCrypto.randomUUID.bind(nodeCrypto);
}

