import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8787";
const SERVICE_UUID      = import.meta.env.VITE_SERVICE_UUID!;
const ID_CHAR_UUID      = import.meta.env.VITE_ID_CHAR_UUID!;
const SIGN_NONCE_UUID   = import.meta.env.VITE_SIGN_NONCE_UUID!;
const SIGN_RESP_UUID    = import.meta.env.VITE_SIGN_RESP_UUID!;

function bytesToHex(b: ArrayBuffer | Uint8Array): string {
  const u8 = b instanceof Uint8Array ? b : new Uint8Array(b);
  return Array.from(u8).map(x => x.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2) throw new Error("bad hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i*2, i*2+2), 16);
  return out;
}
function be64ToMs(buf: ArrayBuffer | Uint8Array): number {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (u8.length !== 8) throw new Error("ts must be 8 bytes");
  let n = 0n;
  for (let i = 0; i < 8; i++) n = (n << 8n) | BigInt(u8[i]);
  return Number(n);
}

type Conn = {
  idChar: BluetoothRemoteGATTCharacteristic;
  signNonceChar: BluetoothRemoteGATTCharacteristic;
  signRespChar: BluetoothRemoteGATTCharacteristic;
};

export default function App() {
  const [supported, setSupported] = useState(false);
  const [beaconIdHex, setBeaconIdHex] = useState("");
  const [nonceHex, setNonceHex] = useState("");
  const [tsMs, setTsMs] = useState("");
  const [sigHex, setSigHex] = useState("");
  const [verified, setVerified] = useState<null | boolean>(null);
  const [err, setErr] = useState("");

  const conn = useRef<Conn | null>(null);
  const notifyAttached = useRef(false);

  useEffect(() => setSupported(!!navigator.bluetooth), []);

  async function connectBeacon() {
    try {
      setErr(""); setVerified(null);
      if (!navigator.bluetooth) throw new Error("Web Bluetooth not supported");
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });
      const server = await device.gatt!.connect();
      const svc = await server.getPrimaryService(SERVICE_UUID);
      const idChar = await svc.getCharacteristic(ID_CHAR_UUID);
      const signNonceChar = await svc.getCharacteristic(SIGN_NONCE_UUID);
      const signRespChar = await svc.getCharacteristic(SIGN_RESP_UUID);
      conn.current = { idChar, signNonceChar, signRespChar };

      // Read 8-byte Beacon ID
      const idVal = await idChar.readValue();
      setBeaconIdHex(bytesToHex(idVal.buffer).toLowerCase());
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  async function verifyPresence() {
    try {
      setErr(""); setVerified(null); setTsMs(""); setSigHex(""); setNonceHex("");
      if (!conn.current) throw new Error("Not connected");

      const r = await fetch(`${API}/api/nonce`);
      if (!r.ok) throw new Error(`nonce failed: ${r.status}`);
      const { nonceHex } = await r.json();
      setNonceHex(nonceHex);

      if (!notifyAttached.current) {
        await conn.current.signRespChar.startNotifications();
        conn.current.signRespChar.addEventListener("characteristicvaluechanged", onNotify);
        notifyAttached.current = true;
      }

      await conn.current.signNonceChar.writeValueWithoutResponse(hexToBytes(nonceHex));
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  async function onNotify(ev: Event) {
    try {
      const char = ev.target as BluetoothRemoteGATTCharacteristic;
      const dv = char.value as DataView;
      const raw = new Uint8Array(dv.buffer);
      if (raw.length !== 72) { setErr(`Expected 72B, got ${raw.length}`); return; }

      const tsBytes = raw.slice(0, 8);
      const sigBytes = raw.slice(8);
      const ms = be64ToMs(tsBytes);
      const sig = bytesToHex(sigBytes);

      setTsMs(String(ms));
      setSigHex(sig);

      const res = await fetch(`${API}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beaconIdHex,
          nonceHex,
          tsMs: String(ms),
          sigHex: sig
        })
      });
      const json = await res.json();
      setVerified(!!json.ok);
      if (!json.ok && json.error) setErr(json.error);
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h2>Beacon Presence MVP</h2>
      {!supported && <p style={{ color: "crimson" }}>Web Bluetooth not supported in this browser.</p>}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={connectBeacon} disabled={!supported}>Connect to Beacon</button>
        <button onClick={verifyPresence} disabled={!beaconIdHex}>Verify Presence</button>
      </div>

      <hr />
      <div><b>Beacon ID</b>: {beaconIdHex || "—"}</div>
      <div><b>Nonce</b>: {nonceHex || "—"}</div>
      <div><b>Timestamp (ms)</b>: {tsMs || "—"}</div>
      <div><b>Signature (hex)</b>: <span style={{ wordBreak: "break-all" }}>{sigHex || "—"}</span></div>
      <div><b>Verified</b>: {verified === null ? "—" : (verified ? "✅ true" : "❌ false")}</div>

      {err && (
        <div style={{ marginTop: 10, padding: 8, background: "#fee", border: "1px solid #faa", borderRadius: 6 }}>
          <b>Error:</b> {err}
        </div>
      )}
    </div>
  );
}
