import { getRandom, verifySignal } from "./sdk.js";

async function run() {
  const random = await getRandom();
  console.log("Random:", random);

  const verification = await verifySignal("abc123", "hello world", "valid");
  console.log("Verification:", verification);
}

run();