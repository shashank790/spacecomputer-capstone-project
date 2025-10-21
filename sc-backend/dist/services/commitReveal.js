"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = commit;
exports.reveal = reveal;
// src/services/commitReveal.ts
const crypto_1 = __importDefault(require("crypto"));
const commits = new Map(); // simple in-memory store
function commit(seed) {
    const commitHash = crypto_1.default.createHash("sha256").update(seed).digest("hex");
    commits.set(commitHash, seed);
    return commitHash;
}
function reveal(commitHash) {
    const seed = commits.get(commitHash);
    if (!seed)
        return { valid: false };
    return { valid: true, seed };
}
