import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Radio, Settings, Trash2 } from "lucide-react";
import { StartSessionModal } from "@/components/attendance/StartSessionModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Classes = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", room: "", branch: "" });

  const fetchActiveSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/attendance/teacher/sessions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessions(data.filter(s => s.status === "active"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "teacher") {
      fetchClasses();
      fetchActiveSessions();
      const interval = setInterval(fetchActiveSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const stopSession = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/stop/${sessionId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Session Closed", description: "The attendance session has been ended." });
        fetchActiveSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.room || !newClass.branch) return;
    
    try {
      const res = await fetch("http://localhost:5000/api/classes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newClass)
      });
      if (res.ok) {
        toast({ title: "Class Saved", description: "Successfully created persistent class." });
        setNewClass({ name: "", room: "", branch: "" });
        setIsAddModalOpen(false);
        fetchClasses();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not create class." });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Class Deleted", description: "The class was removed." });
        fetchClasses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage classrooms and scanner configurations
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" aria-label="Add new class">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddClass}>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>
                  Create a new class to monitor attendance.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="e.g. Physics 101"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    value={newClass.room}
                    onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                    placeholder="e.g. Room D"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">Engineering Branch</Label>
                  <Select value={newClass.branch} onValueChange={(val) => setNewClass({ ...newClass, branch: val })} required>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="ENTC">ENTC</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 && <p className="text-muted-foreground col-span-full">No classes created yet.</p>}
        {classes.map((classItem) => {
          const activeSession = activeSessions.find(s => s.subject === classItem.name && s.branch === classItem.branch);
          
          return (
          <Card key={classItem._id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <div className="flex gap-2 items-center mt-1">
                    <CardDescription>{classItem.room}</CardDescription>
                    {classItem.branch && (
                      <Badge variant="secondary" className="text-xs font-normal">{classItem.branch}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => handleDeleteClass(classItem._id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Radio className="h-4 w-4 text-primary" />
                <span className="text-foreground">Scanner: Unassigned</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-foreground">
                  Geo-fence: 50m radius
                </span>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium text-foreground">Configuration</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>RSSI Threshold: -70 dBm</p>
                  <p>Last Attended: {classItem.lastAttended ? new Date(classItem.lastAttended).toLocaleString() : "Never"}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Present Students</span>
                  <span className="font-semibold text-foreground">
                    {activeSession ? activeSession.presentCount || 0 : "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {activeSession ? (
                  <Button variant="destructive" className="w-full font-semibold" onClick={() => stopSession(activeSession._id)}>
                    Stop Attendance
                  </Button>
                ) : (
                  <StartSessionModal 
                    defaultSubject={classItem.name} 
                    defaultBranch={classItem.branch} 
                    triggerClassName="w-full" 
                    onSessionStarted={() => { fetchActiveSessions(); fetchClasses(); }}
                  />
                )}
                <Button variant="outline" className="w-full gap-2" aria-label={`Configure ${classItem.name}`}>
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  );
};

export default Classes;
