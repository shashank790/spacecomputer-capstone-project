"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/random.ts
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    const randomBytes = crypto_1.default.randomBytes(32).toString("hex");
    res.json({ random: randomBytes });
});
exports.default = router;
