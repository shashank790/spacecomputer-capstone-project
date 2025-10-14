# Backend Overview

Our backend is a TypeScript + Express server that handles cryptographic verification, Proof of Presence (PoP) validation, and random number generation. It’s structured into modular folders: routes/ for API endpoints (GET /random returns mock cTRNG data, POST /verify-signal verifies PoP signals), services/ for core cryptographic logic (cryptoService, commitReveal), and db/ for connection setup. This backend enables secure PoP verification and forms the foundation for the client SDK and frontend integration.

Our instance is running at https://spacecomputer-backend.onrender.com/ so you can use this URL to access our endpoints for better convenience than running on http://localhost:3000/. Instructions below detail usage in http://localhost:3000/ but it's replacable with https://spacecomputer-backend.onrender.com/.

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

The SDK provides simple helper functions to interact with the backend from any TypeScript or JavaScript project.

#### 📁 File: `src/sdk.ts`

This file defines two main functions:

- **`getRandom(baseUrl?)`**  
  Fetches a cryptographically secure random value from `/random`.

- **`verifySignal(publicKey, data, signature, baseUrl?)`**  
  Sends a POST request to `/verify-signal` to verify a signed payload.

Both default to `http://localhost:3000` as the backend base URL.

#### 📁 SDK Testing File: `src/sdkTest.ts`

A simple test script that demonstrates how to call both SDK functions.

1. Run it (in a separate terminal, while your backend is running): npm run test:sdk
2. If successful, you'll see output like:
Random: { random: '2d0c9f1...' }
Verification: { verified: false }