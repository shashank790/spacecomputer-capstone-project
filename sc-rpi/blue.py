#!/usr/bin/env python3
"""
Send bytes over RFCOMM (classic Bluetooth) using PyBluez.

Usage examples:
  # send "Hello" to device with address 00:11:22:33:44:55
  python bt_rfc_send.py --addr 00:11:22:33:44:55 --data "Hello"

  # discover first device and send
  python bt_rfc_send.py --discover --data "Testing 1 2 3"
"""

import argparse
from bluetooth import discover_devices, BluetoothSocket, RFCOMM, BluetoothError

def discover_first():
    print("Discovering nearby Bluetooth devices (8s)...")
    devices = discover_devices(duration=8, lookup_names=True)
    if not devices:
        raise RuntimeError("No Bluetooth devices found.")
    addr, name = devices[0]
    print(f"Found device: {name} [{addr}]")
    return addr

def send_rfc(addr, data: bytes, port: int = 1, timeout: float = 10.0):
    sock = BluetoothSocket(RFCOMM)
    sock.settimeout(timeout)
    try:
        print(f"Connecting to {addr}:{port} ...")
        sock.connect((addr, port))
        print(f"Connected. Sending {len(data)} bytes...")
        sock.send(data)
        print("Send complete.")
    except BluetoothError as e:
        raise RuntimeError(f"Bluetooth error: {e}")
    finally:
        try:
            sock.close()
        except Exception:
            pass

def main():
    p = argparse.ArgumentParser(description="Send RFCOMM Bluetooth packet (PyBluez)")
    p.add_argument("--addr", help="Bluetooth address (e.g. 00:11:22:33:44:55)")
    p.add_argument("--discover", action="store_true", help="Discover and use first found device")
    p.add_argument("--port", type=int, default=1, help="RFCOMM port (default 1)")
    p.add_argument("--data", required=True, help="String data to send (will be encoded as UTF-8)")
    args = p.parse_args()

    if args.discover:
        addr = discover_first()
    elif args.addr:
        addr = args.addr
    else:
        p.error("Either --addr or --discover must be provided.")

    send_rfc(addr, args.data.encode("utf-8"), port=args.port)

if __name__ == "__main__":
    main()

