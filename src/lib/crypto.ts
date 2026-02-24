/**
 * ECDH + AES-GCM encryption utilities.
 *
 * Browser side  → encrypts payload, decrypts response
 * Server side   → decrypts payload, encrypts response
 *
 * Algorithm: ECDH P-256 key exchange + AES-GCM 256-bit symmetric encryption
 * IV: 96-bit random, generated fresh per request (guarantees unique ciphertext every time)
 */

const ALGO = { name: 'ECDH', namedCurve: 'P-256' } as const;
const AES = { name: 'AES-GCM', length: 256 } as const;

// ─── Shared helpers ───────────────────────────────────────────────────────────

function getCrypto(): SubtleCrypto {
  if (typeof window !== 'undefined') {return window.crypto.subtle;}
  
return (globalThis as any).crypto.subtle;
}

async function deriveAesKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return getCrypto().deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    AES,
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buf: ArrayBuffer): string {
  return btoa(
    Array.from(new Uint8Array(buf), (c) => String.fromCharCode(c)).join('')
  );
}

function fromBase64(str: string): Uint8Array {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

// ─── Browser (client) ─────────────────────────────────────────────────────────

/**
 * Generate a fresh ephemeral keypair for this session.
 * Call once when the interview page loads.
 */
export async function generateEphemeralKeypair(): Promise<{
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
}> {
  const keypair = await getCrypto().generateKey(ALGO, true, [
    'deriveKey',
    'deriveBits',
  ]);
  const publicKeyJwk = await getCrypto().exportKey('jwk', keypair.publicKey);
  
return { privateKey: keypair.privateKey, publicKeyJwk };
}

/**
 * Encrypt a payload before sending to the server.
 * Uses the server's public key + a fresh random IV every call.
 */
export async function encryptPayload(
  payload: object,
  serverPublicKeyJwk: JsonWebKey,
  ephemeralPrivateKey: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  const serverPublicKey = await getCrypto().importKey(
    'jwk',
    serverPublicKeyJwk,
    ALGO,
    false,
    []
  );

  const aesKey = await deriveAesKey(ephemeralPrivateKey, serverPublicKey);

  const iv = (globalThis as any).crypto.getRandomValues(new Uint8Array(12)); // 96-bit random IV
  const encoded = new TextEncoder().encode(JSON.stringify(payload));

  const ciphertext = await getCrypto().encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoded
  );

  return {
    encrypted: toBase64(ciphertext),
    iv: toBase64(iv),
  };
}

/**
 * Decrypt a response from the server.
 * Uses the server's public key + the ephemeral private key.
 */
export async function decryptResponse(
  encrypted: string,
  iv: string,
  serverPublicKeyJwk: JsonWebKey,
  ephemeralPrivateKey: CryptoKey
): Promise<any> {
  const serverPublicKey = await getCrypto().importKey(
    'jwk',
    serverPublicKeyJwk,
    ALGO,
    false,
    []
  );

  const aesKey = await deriveAesKey(ephemeralPrivateKey, serverPublicKey);

  const plaintext = await getCrypto().decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    aesKey,
    fromBase64(encrypted)
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

/**
 * Decrypt an incoming encrypted payload.
 * Uses the server private key + client's ephemeral public key.
 */
export async function serverDecryptPayload(
  encrypted: string,
  iv: string,
  clientPublicKeyJwk: JsonWebKey
): Promise<any> {
  const subtle = getCrypto();

  const serverPrivateKeyJwk = JSON.parse(
    process.env.SERVER_ECDH_PRIVATE_KEY!
  ) as JsonWebKey;

  const serverPrivateKey = await subtle.importKey(
    'jwk',
    serverPrivateKeyJwk,
    ALGO,
    false,
    ['deriveKey', 'deriveBits']
  );

  const clientPublicKey = await subtle.importKey(
    'jwk',
    clientPublicKeyJwk,
    ALGO,
    false,
    []
  );

  const aesKey = await deriveAesKey(serverPrivateKey, clientPublicKey);

  const plaintext = await subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    aesKey,
    fromBase64(encrypted)
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

/**
 * Encrypt the server response to send back to the client.
 * Uses the server private key + client's ephemeral public key.
 */
export async function serverEncryptResponse(
  data: object,
  clientPublicKeyJwk: JsonWebKey
): Promise<{ data: string; iv: string }> {
  const subtle = getCrypto();

  const serverPrivateKeyJwk = JSON.parse(
    process.env.SERVER_ECDH_PRIVATE_KEY!
  ) as JsonWebKey;

  const serverPrivateKey = await subtle.importKey(
    'jwk',
    serverPrivateKeyJwk,
    ALGO,
    false,
    ['deriveKey', 'deriveBits']
  );

  const clientPublicKey = await subtle.importKey(
    'jwk',
    clientPublicKeyJwk,
    ALGO,
    false,
    []
  );

  const aesKey = await deriveAesKey(serverPrivateKey, clientPublicKey);

  const iv = (globalThis as any).crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const ciphertext = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoded
  );

  return {
    data: toBase64(ciphertext),
    iv: toBase64(iv),
  };
}
