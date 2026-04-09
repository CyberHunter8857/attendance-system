import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, Signal } from "lucide-react";

const LiveMonitor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock detection data
  const detections = [
    {
      id: 1,
      deviceMac: "67:a6:0f:2e:9d:12",
      studentId: "3402056",
      studentName: "Mayur Tamanke",
      rssi: -66,
      serviceUUID: "0000fef3-0000-1000-8000-00805f9b34fb",
      room: "Room A - Pi3B+",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      status: "detected",
    },
    {
      id: 2,
      deviceMac: "45:3c:1a:8f:7e:21",
      studentId: "3402057",
      studentName: "Priya Sharma",
      rssi: -72,
      serviceUUID: "0000fef3-0000-1000-8000-00805f9b34fb",
      room: "Room B - Pi4",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: "detected",
    },
    {
      id: 3,
      deviceMac: "89:2d:4b:6c:3a:15",
      studentId: "3402058",
      studentName: "Rahul Verma",
      rssi: -58,
      serviceUUID: "0000fef3-0000-1000-8000-00805f9b34fb",
      room: "Room A - Pi3B+",
      timestamp: new Date(Date.now() - 45000).toISOString(),
      status: "detected",
    },
    {
      id: 4,
      deviceMac: "12:7f:9e:4a:6d:33",
      studentId: null,
      studentName: "Unknown Device",
      rssi: -45,
      serviceUUID: "0000180f-0000-1000-8000-00805f9b34fb",
      room: "Room A - Pi3B+",
      timestamp: new Date(Date.now() - 15000).toISOString(),
      status: "unregistered",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSignalStrength = (rssi) => {
    if (rssi >= -60) return { label: "Strong", color: "text-success" };
    if (rssi >= -70) return { label: "Medium", color: "text-warning" };
    return { label: "Weak", color: "text-destructive" };
  };

  const getTimeSince = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const filteredDetections = detections.filter(
    (detection) =>
      detection.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detection.deviceMac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detection.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 px-4 py-6 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live Monitor</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Real-time BLE device detection across all scanners
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 w-full sm:w-auto justify-center"
          aria-label="Refresh detections"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-none sm:border shadow-none sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Active Detections</CardTitle>
              <CardDescription>
                Showing {filteredDetections.length} device(s) currently detected
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search detections"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">MAC Address</th>
                  <th className="pb-3 pr-4">Signal</th>
                  <th className="pb-3 pr-4">Room</th>
                  <th className="pb-3 pr-4">Last Seen</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetections.map((detection) => {
                  const signal = getSignalStrength(detection.rssi);
                  return (
                    <tr
                      key={detection.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="py-4 pr-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {detection.studentName}
                          </p>
                          {detection.studentId && (
                            <p className="text-sm text-muted-foreground">
                              ID: {detection.studentId}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                          {detection.deviceMac}
                        </code>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <Signal className={`h-4 w-4 ${signal.color}`} />
                          <span className={`text-sm font-medium ${signal.color}`}>
                            {detection.rssi} dBm
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{signal.label}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-sm text-foreground">{detection.room}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-sm text-foreground">
                          {getTimeSince(detection.timestamp)}
                        </p>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            detection.status === "detected" ? "success" : "outline"
                          }
                          className={
                            detection.status === "detected"
                              ? "bg-success text-success-foreground"
                              : "border-warning text-warning"
                          }
                        >
                          {detection.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredDetections.map((detection) => {
              const signal = getSignalStrength(detection.rssi);
              return (
                <div 
                  key={detection.id} 
                  className="rounded-xl border border-border p-4 space-y-3 bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-foreground text-base">
                        {detection.studentName}
                      </p>
                      {detection.studentId && (
                        <p className="text-xs text-muted-foreground">ID: {detection.studentId}</p>
                      )}
                    </div>
                    <Badge
                      variant={detection.status === "detected" ? "success" : "outline"}
                      className={
                        detection.status === "detected"
                          ? "bg-success text-success-foreground text-[10px]"
                          : "border-warning text-warning text-[10px]"
                      }
                    >
                      {detection.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Device Info</p>
                      <code className="block rounded bg-muted/50 px-2 py-1 text-[11px] text-foreground w-fit">
                        {detection.deviceMac}
                      </code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Signal</p>
                      <div className="flex items-center gap-1.5">
                        <Signal className={`h-3 w-3 ${signal.color}`} />
                        <span className={`font-bold ${signal.color}`}>
                          {detection.rssi} dBm
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                      <p className="text-foreground font-medium">{detection.room}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Seen</p>
                      <p className="text-foreground">{getTimeSince(detection.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMonitor;
