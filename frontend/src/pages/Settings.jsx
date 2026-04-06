import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure system preferences and thresholds
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detection Settings</CardTitle>
            <CardDescription>Configure BLE detection parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rssi-threshold">Default RSSI Threshold (dBm)</Label>
              <Input
                id="rssi-threshold"
                type="number"
                defaultValue="-70"
                aria-label="RSSI threshold"
              />
              <p className="text-xs text-muted-foreground">
                Minimum signal strength required for attendance marking
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geofence-radius">Default Geo-fence Radius (meters)</Label>
              <Input
                id="geofence-radius"
                type="number"
                defaultValue="50"
                aria-label="Geo-fence radius"
              />
              <p className="text-xs text-muted-foreground">
                Maximum distance from scanner for valid detection
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scan-interval">Scan Interval (seconds)</Label>
              <Input
                id="scan-interval"
                type="number"
                defaultValue="5"
                aria-label="Scan interval"
              />
              <p className="text-xs text-muted-foreground">
                How often scanners should report detections
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage alert and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Attendance Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when student attendance falls below threshold
                </p>
              </div>
              <Switch defaultChecked aria-label="Toggle low attendance alerts" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Scanner Offline Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when a scanner goes offline
                </p>
              </div>
              <Switch defaultChecked aria-label="Toggle scanner offline alerts" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Report Email</Label>
                <p className="text-xs text-muted-foreground">
                  Receive daily attendance summary via email
                </p>
              </div>
              <Switch aria-label="Toggle daily report email" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>General system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="attendance-threshold">Attendance Warning Threshold (%)</Label>
              <Input
                id="attendance-threshold"
                type="number"
                defaultValue="75"
                min="0"
                max="100"
                aria-label="Attendance threshold"
              />
              <p className="text-xs text-muted-foreground">
                Alert when student attendance drops below this percentage
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Mark Attendance</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically mark attendance when conditions are met
                </p>
              </div>
              <Switch defaultChecked aria-label="Toggle auto mark attendance" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
