from bluepy.btle import Scanner, DefaultDelegate
import time
import requests

#  ***** UPDATE THIS *****
BACKEND_URL = "http://YOUR_PC_IP:5000/api/identify"     # example: 192.168.1.5

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        super().__init__()

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            print(f"🔹 New device: {dev.addr}")
        elif isNewData:
            print(f"🔹 Updated data: {dev.addr}")


def identify(mac):
    try:
        res = requests.post(BACKEND_URL, json={"mac": mac})
        data = res.json()

        if data.get("found"):
            print(f"✅ Device {mac} → Student: {data['student']}")
        else:
            print(f"❌ Device {mac} → Student Not Found")

    except Exception as e:
        print("⚠️  Backend Error:", e)


def main():
    scanner = Scanner().withDelegate(ScanDelegate())

    print("\n🔍 Scanning for BLE devices... (Ctrl+C to stop)\n")

    try:
        while True:
            devices = scanner.scan(5.0)
            print("\n----- Detected Devices -----")

            for dev in devices:
                print(f"Device {dev.addr} (RSSI: {dev.rssi} dB)")
                identify(dev.addr)

            print("----------------------------\n")
            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Scan stopped.")


if __name__ == "__main__":
    main()
