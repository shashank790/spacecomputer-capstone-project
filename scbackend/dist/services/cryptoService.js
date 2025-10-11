"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = verifySignature;
const crypto_1 = __importDefault(require("crypto"));
function verifySignature(publicKey, data, signature) {
    const verifier = crypto_1.default.createVerify("SHA256");
    verifier.update(data);
    verifier.end();
    return verifier.verify(publicKey, signature, "base64");
}
