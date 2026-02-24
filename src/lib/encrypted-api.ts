'use client';

/**
 * Plain async encrypted API call — works inside useEffect and anywhere (no React hooks needed).
 * Generates a fresh ephemeral keypair per call → unique ciphertext every request.
 */

import {
  generateEphemeralKeypair,
  encryptPayload,
  decryptResponse,
} from '@/lib/crypto';

export async function encryptedApiCall<T = any>(
  url: string,
  payload: object
): Promise<T> {
  const serverPublicKeyJwk = JSON.parse(
    process.env.NEXT_PUBLIC_SERVER_ECDH_PUBLIC_KEY!
  ) as JsonWebKey;

  const { privateKey, publicKeyJwk } = await generateEphemeralKeypair();

  const { encrypted, iv } = await encryptPayload(
    payload,
    serverPublicKeyJwk,
    privateKey
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: encrypted, iv, cpk: publicKeyJwk }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }

  const body = await res.json();

  if (body.data && body.iv) {
    return decryptResponse(body.data, body.iv, serverPublicKeyJwk, privateKey);
  }

  return body;
}
