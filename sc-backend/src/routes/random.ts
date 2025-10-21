// src/routes/random.ts
import express from "express";
import crypto from "crypto";
import { getTrueRandom } from "../services/cryptoService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  res.json({ random: randomBytes });
});

router.get("/random", async (req, res) => {
  try {
    const randomValue = await getTrueRandom();
    res.json({ random: randomValue });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cosmic randomness" });
  }
});

export default router;