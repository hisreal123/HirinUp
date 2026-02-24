'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import {
  generateEphemeralKeypair,
  encryptPayload,
  decryptResponse,
} from '@/lib/crypto';

/**
 * Hook that provides an encrypted fetch function for the interview flow.
 *
 * - Generates a fresh ephemeral ECDH keypair on mount (per session)
 * - Encrypts every request payload before sending
 * - Decrypts every response automatically
 * - Destroys keys when component unmounts
 *
 * Network tab shows only ciphertext — no readable field names or values.
 */
export function useEncryptedFetch() {
  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyJwkRef = useRef<JsonWebKey | null>(null);
  const [isReady, setIsReady] = useState(false);
  const serverPublicKeyJwk = JSON.parse(
    process.env.NEXT_PUBLIC_SERVER_ECDH_PUBLIC_KEY!
  ) as JsonWebKey;

  useEffect(() => {
    // Generate fresh keypair when interview session starts
    generateEphemeralKeypair().then(({ privateKey, publicKeyJwk }) => {
      privateKeyRef.current = privateKey;
      publicKeyJwkRef.current = publicKeyJwk;
      setIsReady(true);
    });

    return () => {
      // Destroy keys on unmount
      privateKeyRef.current = null;
      publicKeyJwkRef.current = null;
      setIsReady(false);
    };
  }, []);

  const encryptedFetch = useCallback(
    async (url: string, payload: object): Promise<any> => {
      if (!privateKeyRef.current || !publicKeyJwkRef.current) {
        throw new Error('Encryption keys not ready');
      }

      // Encrypt the payload
      const { encrypted, iv } = await encryptPayload(
        payload,
        serverPublicKeyJwk,
        privateKeyRef.current
      );

      // Send ciphertext + client public key (server needs it to derive shared secret)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: encrypted,
          iv,
          cpk: publicKeyJwkRef.current, // client public key
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Request failed: ${res.status}`);
      }

      const body = await res.json();

      // If response is encrypted, decrypt it
      if (body.data && body.iv) {
        return decryptResponse(
          body.data,
          body.iv,
          serverPublicKeyJwk,
          privateKeyRef.current!
        );
      }

      // Fallback: return plain response (for endpoints not yet encrypted)
      return body;
    },
    [serverPublicKeyJwk]
  );

  return { encryptedFetch, isReady };
}
