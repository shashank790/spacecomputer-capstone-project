"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cryptoService_1 = require("../services/cryptoService");
const router = express_1.default.Router();
function getPublicKey(beaconId) {
    // TODO: Replace with DB lookup or file read
    const mockKeys = {
        "beacon123": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
    };
    return mockKeys[beaconId] || null;
}
function logPresence(beaconId, payload) {
    console.log(`Presence logged for ${beaconId}: ${payload}`);
}
router.post("/", (req, res) => {
    const { beaconId, payload, signature } = req.body;
    const publicKey = getPublicKey(beaconId); // from DB or file
    if (!publicKey)
        return res.status(404).json({ error: "Beacon not found" });
    const isValid = (0, cryptoService_1.verifySignature)(publicKey, payload, signature);
    if (!isValid)
        return res.status(400).json({ valid: false, error: "Invalid signature" });
    logPresence(beaconId, payload); // optional audit log
    res.json({ valid: true });
});
exports.default = router;
