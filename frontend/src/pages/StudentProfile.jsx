import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Clock, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import { useToast } from "@/components/ui/use-toast";


const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ attendanceRate: 0, totalCheckins: 0, missedClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Info
        const userRes = await fetch(`/api/auth/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setStudent(userData);
        }

        // Fetch Attendance Info
        const histRes = await fetch(`/api/attendance/student/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.history || []);
          if (histData.stats) setStats(histData.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token && id) fetchData();
  }, [id, token]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}? This will remove all their attendance data and profile photo. This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/auth/student/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        // If not OK, try to get error message from JSON, or fallback to text/status
        let errorMessage = `Server Error: ${res.status}`;
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            errorMessage = errData.error || errorMessage;
          } else {
             const text = await res.text();
             console.error("Non-JSON Error Response:", text);
          }
        } catch (e) {
          console.error("Error parsing error response", e);
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      toast({
        title: "Delete Successful",
        description: "Student and all associated data have been removed."
      });
      navigate("/students");
    } catch (err) {

      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err.message
      });
    } finally {
      setIsDeleting(false);
    }
  };


  if (loading) return <div className="p-8 animate-pulse text-center">Loading profile...</div>;
  if (!student) return <div className="p-8 text-center text-destructive">Student not found.</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Button>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-1/3">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
             {student.photo ? (
               <img src={student.photo.startsWith('http') ? student.photo : `${student.photo}`} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-md" />
             ) : (

               <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center shadow-md">
                 <span className="text-4xl text-primary font-bold">{student.name.charAt(0).toUpperCase()}</span>
               </div>
             )}
             <div>
               <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
               <Badge variant="secondary" className="mt-2">{student.branch || "No Branch Assigned"}</Badge>
             </div>
             <div className="w-full border-t border-border pt-4 px-6 pb-6">
               <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mb-4">
                 <Mail className="h-4 w-4" />
                 <span>{student.email}</span>
               </div>
               
               {user?.role === "teacher" && (
                  <Button 
                    variant="destructive" 
                    className="w-full gap-2 mt-2" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete Student"}
                  </Button>
               )}
             </div>

          </CardContent>
        </Card>

        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={CheckCircle} variant={stats.attendanceRate >= 75 ? "success" : "warning"} />
            <KPICard title="Total Check-ins" value={stats.totalCheckins.toString()} icon={Clock} variant="info" />
            <KPICard title="Missed Classes" value={stats.missedClasses.toString()} icon={AlertTriangle} variant="destructive" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Detailed log of recent check-ins and absences</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found yet.</p>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                  {history.map((record) => (
                    <div key={record._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{record.sessionId?.subject}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3"/>
                          {new Date(record.timestamp).toLocaleString()} • {record.room}
                        </p>
                      </div>
                      <Badge variant={record.status === "present" ? "success" : "destructive"} className={record.status === "present" ? "bg-success text-success-foreground capitalize" : "capitalize"}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
