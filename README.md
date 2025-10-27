# Overview

Running at: https://spacecomputer-backend.onrender.com/

Available Endpoints:

🔹 Verification:
  • POST /verify-signal          → Verify a beacon signal signature
  • GET  /verify-signal           → View interactive verification form & example curl

🔹 Randomness:
  • GET  /random/cosmic           → Fetch true cosmic entropy from Orbitport
  • GET  /random/local            → Generate local cryptographic randomness (fallback)

🔹 Admin:
  • GET  /admin/list              → View all registered beacons in table format
  • POST /admin/register          → Register a new beacon (for verification tracking)
  • POST /admin/edit              → Edit an existing beacon’s name
  • POST /admin/delete            → Delete a beacon

All endpoints return JSON unless noted otherwise.

### ⚙️ Using the SDK

Our project now integrates two SDK layers — one local (custom-built) and one external (SpaceComputer’s official SDK) — to bridge communication between the frontend, backend, and the cosmic random source.

#### 📁 Local SDK: `src/sdk.ts`

This file defines two main functions:

- **`getRandom(baseUrl?)`**  
  Fetches a cryptographically secure random value from `/random`.

- **`verifySignal(publicKey, data, signature, baseUrl?)`**  
  Sends a POST request to `/verify-signal` to verify a signed payload.

Both default to `http://localhost:3000` as the backend base URL.

#### 📁 Local SDK Testing File: `src/sdkTest.ts`

A simple test script that demonstrates how to call both SDK functions.

1. Run it (in a separate terminal, while backend is running): npm run test:sdk
2. If successful, you'll see output like:
Random: { random: '2d0c9f1...' }
Verification: { verified: false }

### Orbitport SDK Integration

Our backend is directly integrated with SpaceComputer’s official Orbitport SDK (@spacecomputer-io/orbitport-sdk-ts) to power the /random endpoint with authentic Cosmic True Random Number Generator (cTRNG) values.

This SDK securely connects to SpaceComputer’s global randomness network using environment-based credentials (which we need to get) defined in .env, allowing our backend to fetch verified cosmic entropy instead of locally generated random data. The integration is handled internally within our cryptographic service and random route logic.

⚙️ Implementation Summary
- The Orbitport SDK is initialized within the backend using ORBITPORT_CLIENT_ID and ORBITPORT_CLIENT_SECRET.
- The /random endpoint now returns true cosmic entropy sourced from SpaceComputer’s cTRNG network.
- A local cryptographic fallback remains in place to ensure functionality during offline or development scenarios.
- No additional setup or installation is required — the integration is already active and operational.


---

# Concept of what needs to be done (check with mentors)
1. [Raspberry Pi Device(s)]
    → emits (publicKey, data, signature)
    → sends payload via REST request
        
2. [Backend Server (e.g., hosted on Render)]
    → /verify-signal endpoint
        → verifies signature authenticity using verifySignature()
    → /random endpoint
        → fetches cosmic entropy via Orbitport SDK (cTRNG)
        
3. [Frontend / Dashboard]
    → displays:
        ✅ Verification status
        ✅ Random cosmic values