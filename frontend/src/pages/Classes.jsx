import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Radio, Settings } from "lucide-react";

const Classes = () => {
  const classes = [
    {
      id: "class_01",
      name: "Computer Science 301",
      room: "Room A",
      scanner: { id: "scanner_01", name: "Pi3B+", status: "online" },
      location: { lat: 18.45, lng: 73.8 },
      geoFence: { radius: 50 },
      rssiThreshold: -70,
      students: 45,
      schedule: "Mon, Wed, Fri - 9:00 AM",
    },
    {
      id: "class_02",
      name: "Data Structures 202",
      room: "Room B",
      scanner: { id: "scanner_02", name: "Pi4", status: "online" },
      location: { lat: 18.451, lng: 73.801 },
      geoFence: { radius: 50 },
      rssiThreshold: -70,
      students: 38,
      schedule: "Tue, Thu - 11:00 AM",
    },
    {
      id: "class_03",
      name: "Algorithms 401",
      room: "Room C",
      scanner: { id: "scanner_03", name: "Pi3B+", status: "offline" },
      location: { lat: 18.449, lng: 73.799 },
      geoFence: { radius: 50 },
      rssiThreshold: -70,
      students: 52,
      schedule: "Mon, Wed - 2:00 PM",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage classrooms and scanner configurations
          </p>
        </div>
        <Button className="gap-2" aria-label="Add new class">
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <CardDescription>{classItem.room}</CardDescription>
                </div>
                <Badge
                  variant={classItem.scanner.status === "online" ? "success" : "destructive"}
                  className={
                    classItem.scanner.status === "online"
                      ? "bg-success text-success-foreground"
                      : ""
                  }
                >
                  {classItem.scanner.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Radio className="h-4 w-4 text-primary" />
                <span className="text-foreground">Scanner: {classItem.scanner.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-foreground">
                  Geo-fence: {classItem.geoFence.radius}m radius
                </span>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium text-foreground">Configuration</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>RSSI Threshold: {classItem.rssiThreshold} dBm</p>
                  <p>Location: {classItem.location.lat}, {classItem.location.lng}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled Students</span>
                  <span className="font-semibold text-foreground">{classItem.students}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{classItem.schedule}</p>
              </div>

              <Button variant="outline" className="w-full gap-2" aria-label={`Configure ${classItem.name}`}>
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classes;
