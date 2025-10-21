"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cryptoService_js_1 = require("./services/cryptoService.js"); // 👈 note the `.js` extension!
const crypto_1 = require("crypto");
const app = (0, express_1.default)();
app.use(express_1.default.json());
/**
 * POST /verify-signal
 * Verifies a signed beacon payload using stored public keys
 */
app.post("/verify-signal", async (req, res) => {
    try {
        const { publicKey, data, signature } = req.body;
        if (!publicKey || !data || !signature) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const isValid = (0, cryptoService_js_1.verifySignature)(publicKey, data, signature);
        res.json({ verified: isValid });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
/**
 * GET /random
 * Returns a cryptographically secure random number
 */
app.get("/random", (req, res) => {
    try {
        const randomValue = (0, crypto_1.randomBytes)(32).toString("hex");
        res.json({ random: randomValue });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to generate randomness" });
    }
});
/**
 * Start the server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
