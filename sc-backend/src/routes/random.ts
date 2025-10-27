// src/routes/random.ts
import express from "express";
import { getTrueRandom } from "../services/cryptoService.js";
import crypto from "crypto";

const router = express.Router();

// Local fallback randomness
router.get("/local", (req, res) => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  res.json({ source: "local", random: randomBytes });
});

// Cosmic randomness via OrbitPort SDK
router.get("/cosmic", async (req, res) => {
  try {
    const randomValue = await getTrueRandom();
    res.json({ source: "cosmic", random: randomValue });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cosmic randomness" });
  }
});

export default router;