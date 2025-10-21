// src/services/commitReveal.ts
import crypto from "crypto";

const commits = new Map<string, string>(); // simple in-memory store

export function commit(seed: string): string {
  const commitHash = crypto.createHash("sha256").update(seed).digest("hex");
  commits.set(commitHash, seed);
  return commitHash;
}

export function reveal(commitHash: string): { valid: boolean; seed?: string } {
  const seed = commits.get(commitHash);
  if (!seed) return { valid: false };
  return { valid: true, seed };
}