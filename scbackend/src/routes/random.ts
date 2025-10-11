// src/routes/random.ts
import express from "express";
import crypto from "crypto";

const router = express.Router();

router.get("/", (req, res) => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  res.json({ random: randomBytes });
});

export default router;