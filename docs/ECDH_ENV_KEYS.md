# ECDH keys for .env

## How to generate

```bash
node scripts/generate-keypair.mjs
```

Copy the two printed lines into your `.env`.

## What you get

- **SERVER_ECDH_PRIVATE_KEY** — private key (JWK). Server only, keep secret.
- **NEXT_PUBLIC_SERVER_ECDH_PUBLIC_KEY** — public key (JWK). Safe for client; add to `.env` so the app can encrypt API traffic.

Both are P-256 ECDH keys in JWK format.
