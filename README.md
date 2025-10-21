# Backend Overview

Our backend is a TypeScript + Express server that handles cryptographic verification, Proof of Presence (PoP) validation, and random number generation. It’s structured into modular folders: routes/ for API endpoints (GET /random returns mock cTRNG data, POST /verify-signal verifies PoP signals), services/ for core cryptographic logic (cryptoService, commitReveal), and db/ for connection setup. This backend enables secure PoP verification and forms the foundation for the client SDK and frontend integration.

Our instance is running at https://spacecomputer-backend.onrender.com/ so you can use this URL to access our endpoints for better convenience than running on http://localhost:3000/. Instructions below detail usage in http://localhost:3000/ but it's replacable with https://spacecomputer-backend.onrender.com/.

Accessible endpoints:
GET /random: https://spacecomputer-backend.onrender.com/random
GET /verify-signal: https://spacecomputer-backend.onrender.com/verify-signal
POST /verify-signal: has to be done manually via terminal (using curl)

---

## 🚀 Setup & Run

1. Clone repo and navigate to the backend folder: cd scbackend

2. Install dependencies: npm install

3. Run server: npm run dev

4. Open browser and visit (it will say the backend is running): http://localhost:3000/


## 🔐 Endpoints

1. GET /random: Generates a 32-byte cryptographically secure random value.
Test via curl: curl http://localhost:3000/random

2. POST /verify-signal: Verifies a signed beacon payload using a public key, data, and signature.
Example curl command:
   curl -X POST http://localhost:3000/verify-signal \
     -H "Content-Type: application/json" \
     -d '{
       "publicKey": "abc123",
       "data": "hello world",
       "signature": "valid"
     }'

Example response: { "verified": true }
If any required field is missing: { "error": "Missing required fields" }

3. GET /verify-signal: You can also visit http://localhost:3000/verify-signal to see an example curl command displayed in your browser.


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