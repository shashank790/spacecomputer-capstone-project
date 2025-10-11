import crypto from "crypto";

export function verifySignature(publicKey: string, data: string, signature: string): boolean {
  const verifier = crypto.createVerify("SHA256");
  verifier.update(data);
  verifier.end();
  return verifier.verify(publicKey, signature, "base64");
}