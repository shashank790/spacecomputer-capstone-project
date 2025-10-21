import express from "express";
import { verifySignature } from "../services/cryptoService.js";

const router = express.Router();

function getPublicKey(beaconId: string): string | null {
    // TODO: Replace with DB lookup or file read
    const mockKeys: Record<string, string> = {
    "beacon123": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
};
return mockKeys[beaconId] || null;
}

function logPresence(beaconId: string, payload: string): void {
    console.log(`Presence logged for ${beaconId}: ${payload}`);
}

router.post("/", (req, res) => {
  const { beaconId, payload, signature } = req.body;
  const publicKey = getPublicKey(beaconId); // from DB or file

  if (!publicKey) return res.status(404).json({ error: "Beacon not found" });

  const isValid = verifySignature(publicKey, payload, signature);
  if (!isValid) return res.status(400).json({ valid: false, error: "Invalid signature" });

  logPresence(beaconId, payload); // optional audit log
  res.json({ valid: true });
});

export default router;