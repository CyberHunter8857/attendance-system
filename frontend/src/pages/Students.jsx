import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [branchFilter, setBranchFilter] = useState("All");
  const { token } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const qs = branchFilter !== "All" ? `?branch=${encodeURIComponent(branchFilter)}` : "";
        const res = await fetch(`/api/attendance/teacher/students${qs}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStudents(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchStudents();
  }, [token, branchFilter]);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAttendanceBadge = (percentage) => {
    if (percentage >= 90) return { variant: "success", className: "bg-success text-success-foreground" };
    if (percentage >= 75) return { variant: "default", className: "" };
    return { variant: "destructive", className: "" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="mt-1 text-muted-foreground">
            Manage student profiles and track attendance
          </p>
        </div>

      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>
                {filteredStudents.length} student(s) found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Branches</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="ENTC">ENTC</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search students"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredStudents.map((student) => {
              return (
                <Link
                  key={student._id}
                  to={`/students/${student._id}`}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <div className="rounded-xl border border-border bg-card p-4 shadow-md transition-shadow hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex gap-3 items-center">
                        {student.photo ? (
                          <img src={student.photo.startsWith('http') ? student.photo : `${student.photo}`} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                        ) : (

                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary/50" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{student.name}</h3>
                          <Badge variant="secondary" className="font-normal text-xs mt-1">{student.branch || "Unassigned"}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="text-sm text-muted-foreground italic">
                        More details available in profile
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
