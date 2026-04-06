import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock student data
  const students = [
    {
      id: "stu_001",
      name: "Mayur Tamanke",
      roll: "3402056",
      email: "mayurtamanke9423@gmail.com",
      phone: "+91 94232 12345",
      devices: [{ mac: "67:a6:0f:2e:9d:12", label: "Pixel 4a" }],
      attendance: { present: 42, absent: 3, percentage: 93 },
      status: "active",
    },
    {
      id: "stu_002",
      name: "Priya Sharma",
      roll: "3402057",
      email: "priya.sharma@example.com",
      phone: "+91 98765 43210",
      devices: [{ mac: "45:3c:1a:8f:7e:21", label: "OnePlus 8" }],
      attendance: { present: 40, absent: 5, percentage: 89 },
      status: "active",
    },
    {
      id: "stu_003",
      name: "Rahul Verma",
      roll: "3402058",
      email: "rahul.verma@example.com",
      phone: "+91 87654 32109",
      devices: [{ mac: "89:2d:4b:6c:3a:15", label: "Samsung S21" }],
      attendance: { present: 44, absent: 1, percentage: 98 },
      status: "active",
    },
    {
      id: "stu_004",
      name: "Anjali Patel",
      roll: "3402059",
      email: "anjali.patel@example.com",
      phone: "+91 76543 21098",
      devices: [{ mac: "23:8a:5f:1c:9e:44", label: "iPhone 12" }],
      attendance: { present: 38, absent: 7, percentage: 84 },
      status: "warning",
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll.includes(searchQuery) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button className="gap-2" aria-label="Add new student">
          <UserPlus className="h-4 w-4" />
          Add Student
        </Button>
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
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredStudents.map((student) => {
              const attendanceBadge = getAttendanceBadge(student.attendance.percentage);
              return (
                <Link
                  key={student.id}
                  to={`/students/${student.id}`}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <div className="rounded-xl border border-border bg-card p-4 shadow-md transition-shadow hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">Roll: {student.roll}</p>
                      </div>
                      <Badge {...attendanceBadge}>
                        {student.attendance.percentage}%
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{student.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="text-sm">
                        <span className="font-medium text-success">
                          {student.attendance.present} Present
                        </span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="font-medium text-destructive">
                          {student.attendance.absent} Absent
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Device: {student.devices[0]?.label || "Not registered"}
                      </p>
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
