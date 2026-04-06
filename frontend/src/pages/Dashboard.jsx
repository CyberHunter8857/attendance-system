import { useState, useEffect } from "react";
import { Users, Radio, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { StartSessionModal } from "@/components/attendance/StartSessionModal";

const StudentDashboard = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const histRes = await fetch(`http://localhost:5000/api/attendance/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const histData = await histRes.json();
      if (histRes.ok) setHistory(histData);

      const activeRes = await fetch(`http://localhost:5000/api/attendance/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeData = await activeRes.json();
      if (activeRes.ok) setActiveSessions(activeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, token]);

  const markAttendance = async (sessionId) => {
    try {
      const res = await fetch("http://localhost:5000/api/attendance/mark-present", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to mark attendance");
      
      toast({
        title: "Success",
        description: "You have been marked present."
      });
      fetchData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground capitalize">Welcome, {user?.name || "Student"}!</h1>
        <p className="mt-1 text-muted-foreground">
          Here is your personal attendance overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Attendance Rate" value="---%" icon={CheckCircle} variant="success" />
        <KPICard title="Total Check-ins" value={history.length.toString()} icon={Radio} variant="info" />
        <KPICard title="Classes Missed" value="0" icon={AlertTriangle} variant="warning" />
      </div>

      {activeSessions.length > 0 && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Radio className="h-5 w-5 animate-pulse" /> Active Sessions
            </CardTitle>
            <CardDescription>You can manually check in to the following active classes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border p-4 gap-4">
                <div>
                  <p className="font-semibold text-foreground text-lg">{session.subject}</p>
                  <p className="text-sm text-muted-foreground">Teacher: {session.teacherId?.name}</p>
                </div>
                <Button onClick={() => markAttendance(session._id)}>
                  Check In Now
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Recent History</CardTitle>
          <CardDescription>Latest attendance logs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <p className="text-sm text-muted-foreground">Loading history...</p>
          ) : history.length === 0 ? (
             <p className="text-sm text-muted-foreground">No attendance records found.</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{record.sessionId?.subject}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3"/>
                      {new Date(record.timestamp).toLocaleString()} • {record.room}
                    </p>
                  </div>
                  <Badge variant="success" className="bg-success text-success-foreground capitalize">
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const [activeSessions, setActiveSessions] = useState([]);
  const { toast } = useToast();
  
  const isStudent = user?.role === "student";

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/attendance/active", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setActiveSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isStudent && token) {
      fetchActiveSessions();
    }
  }, [isStudent, token]);

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

  // Mock data
  const recentActivity = [
    { id: 1, student: "Mayur Tamanke", room: "Room A", time: "2 mins ago", status: "present" },
    { id: 2, student: "Priya Sharma", room: "Room B", time: "5 mins ago", status: "present" },
    { id: 3, student: "Rahul Verma", room: "Room A", time: "8 mins ago", status: "present" },
    { id: 4, student: "Anjali Patel", room: "Room C", time: "12 mins ago", status: "absent" },
  ];

  const scannerStatus = [
    { id: "scanner_01", name: "Room A - Pi3B+", status: "online", detections: 24 },
    { id: "scanner_02", name: "Room B - Pi4", status: "online", detections: 18 },
    { id: "scanner_03", name: "Room C - Pi3B+", status: "offline", detections: 0 },
  ];

  if (isStudent) {
    return <StudentDashboard user={user} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor attendance and system status in real-time
          </p>
        </div>
        <StartSessionModal onSessionStarted={fetchActiveSessions} />
      </div>

      {activeSessions.length > 0 && (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
           {activeSessions.map((session) => (
             <Card key={session._id} className="border-primary">
               <CardHeader className="pb-3">
                 <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Radio className="h-5 w-5 text-primary animate-pulse" />
                        {session.subject}
                      </CardTitle>
                      <CardDescription>Started by you</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">Active</Badge>
                 </div>
               </CardHeader>
               <CardContent>
                 <Button variant="destructive" onClick={() => stopSession(session._id)}>
                   Stop Attendance
                 </Button>
               </CardContent>
             </Card>
           ))}
         </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Students" value="156" icon={Users} variant="default" />
        <KPICard title="Present Now" value="142" icon={CheckCircle} trend="up" trendValue="8.2%" variant="success" />
        <KPICard title="Active Scanners" value="2/3" icon={Radio} variant="info" />
        <KPICard title="Alerts" value="3" icon={AlertTriangle} variant="warning" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest attendance detections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.room} • {activity.time}
                    </p>
                  </div>
                  <Badge variant={activity.status === "present" ? "success" : "destructive"} className={activity.status === "present" ? "bg-success text-success-foreground" : ""}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scanner Status */}
        <Card>
          <CardHeader>
            <CardTitle>Scanner Status</CardTitle>
            <CardDescription>Real-time scanner monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scannerStatus.map((scanner) => (
                <div key={scanner.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${scanner.status === "online" ? "bg-success" : "bg-destructive"}`} />
                    <div>
                      <p className="font-medium text-foreground">{scanner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {scanner.detections} detections today
                      </p>
                    </div>
                  </div>
                  <Badge variant={scanner.status === "online" ? "outline" : "destructive"} className={scanner.status === "online" ? "border-success text-success" : ""}>
                    {scanner.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
