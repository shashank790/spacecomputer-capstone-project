import crypto from "crypto";
import { OrbitportSDK } from "@spacecomputer-io/orbitport-sdk-ts";

/**
 * Verifies a signature using a public key.
 * Returns true or false.
 */
export function verifySignature(publicKey: string, data: string, signature: string): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();

    // Convert signature to buffer (if it's base64, for example)
    const isValid = verify.verify(publicKey, signature, "base64");
    return isValid;
  } catch (err) {
    console.error("❌ Error verifying signature:", err);
    return false; // Prevents server crash
  }
}

const orbitport = new OrbitportSDK({
  config: {
    clientId: process.env.ORBITPORT_CLIENT_ID,
    clientSecret: process.env.ORBITPORT_CLIENT_SECRET,
  },
});

export async function getTrueRandom() {
  const result = await orbitport.ctrng.random();
  return result.data.data; // cosmic randomness
}