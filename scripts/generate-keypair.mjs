/**
 * Run once to generate the server ECDH keypair.
 * node scripts/generate-keypair.mjs
 *
 * Copy the output into your .env file.
 */

import { webcrypto } from "node:crypto";

const { subtle } = webcrypto;

const keypair = await subtle.generateKey(
  { name: "ECDH", namedCurve: "P-256" },
  true,
  ["deriveKey", "deriveBits"]
);

const privateKeyJwk = await subtle.exportKey("jwk", keypair.privateKey);
const publicKeyJwk = await subtle.exportKey("jwk", keypair.publicKey);
