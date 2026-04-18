import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, CheckCircle, Radio, AlertTriangle } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";

const Profile = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ attendanceRate: 100, totalCheckins: 0, missedClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // If the user isn't a student, they might not have stats
      if (user?.role !== "student") {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:5000/api/attendance/student/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user, token]);

  const photoUrl = user?.photo 
    ? (user.photo.startsWith('http') ? user.photo : `http://localhost:5000${user.photo}`)
    : null;


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground capitalize">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          View your personal details and account status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="col-span-1 md:col-span-1 shadow-md border-primary/20 flex flex-col items-center pt-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted mb-4 bg-primary/10 flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-primary/50" />
            )}
          </div>
          <CardHeader className="text-center pb-2 flex flex-col items-center">
            <CardTitle className="text-2xl font-bold">{user?.name || "Student"}</CardTitle>
            <CardDescription className="capitalize font-medium text-primary mb-1">
              {user?.role || "User"}
            </CardDescription>
            {user?.branch && (
              <Badge variant="secondary" className="w-fit">{user.branch}</Badge>
            )}
          </CardHeader>
          <CardContent className="w-full text-center pb-8 pt-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Column */}
        {user?.role === "student" && (
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Attendance Overview</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-muted rounded-xl"></div>
                <div className="h-24 bg-muted rounded-xl"></div>
                <div className="h-24 bg-muted rounded-xl"></div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <KPICard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={CheckCircle} variant="success" />
                <KPICard title="Total Check-ins" value={stats.totalCheckins.toString()} icon={Radio} variant="info" />
                <KPICard title="Classes Missed" value={stats.missedClasses.toString()} icon={AlertTriangle} variant="warning" />
              </div>
            )}

            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" /> Account Details
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Account ID</span>
                    <span className="font-mono text-sm">{user?.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Authentication</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">Secure</Badge>
                  </div>
               </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
