import crypto from "crypto";

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