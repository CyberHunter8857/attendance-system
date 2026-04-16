from bluepy.btle import Scanner, DefaultDelegate
import time
import requests

#  ***** UPDATE THIS *****
BACKEND_URL = "http://10.134.2.150:5000/api/attendance/mark-ble"     # example: 192.168.1.5

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        super().__init__()

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            print(f"🔹 New device: {dev.addr}")
        elif isNewData:
            print(f"🔹 Updated data: {dev.addr}")


def identify(mac, rssi):
    try:
        res = requests.post(BACKEND_URL, json={"mac": mac, "rssi": rssi, "room": "Raspberry Pi Scanner"})
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
                name = dev.getValueText(9) or dev.getValueText(8) or "Unknown Name"
                
                # Extract 128-bit Service UUID if broadcasted (resolves MAC randomization issues)
                device_id = dev.addr
                for (adtype, desc, value) in dev.getScanData():
                    # 6 = Incomplete 128-bit UUIDs, 7 = Complete 128-bit UUIDs
                    if adtype in [6, 7]:
                        device_id = value
                        break
                
                print(f"Device {dev.addr} ({name}) | RSSI: {dev.rssi} dB | ID: {device_id}")
                identify(device_id, dev.rssi)

            print("----------------------------\n")
            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Scan stopped.")


if __name__ == "__main__":
    main()
