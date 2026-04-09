import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const Reports = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [reportType, setReportType] = useState("attendance");
  const [activeReportType, setActiveReportType] = useState("attendance");
  const [classes, setClasses] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setClasses(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && newStartDate && new Date(endDate) < new Date(newStartDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Date Range",
        description: "Start date cannot be later than end date."
      });
      setEndDate("");
    }
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && newEndDate && new Date(newEndDate) < new Date(startDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Date Range",
        description: "End date cannot be earlier than start date."
      });
      return;
    }
    setEndDate(newEndDate);
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing Dates",
        description: "Please select both start and end dates."
      });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Date Range",
        description: "End date cannot be earlier than start date."
      });
      return;
    }

    setLoading(true);
    try {
      const query = new URLSearchParams({ startDate, endDate, classId: selectedClass }).toString();
      const res = await fetch(`http://localhost:5000/api/attendance/teacher/report?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setReportData(data);
        setActiveReportType(reportType);
        toast({
          title: data.length === 0 ? "No Data" : "Success",
          description: data.length === 0 ? "No records found for the selected criteria." : "Report generated successfully!"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to generate report"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching the report."
      });
    } finally {
      setLoading(false);
    }
  };

  const getProcessedData = () => {
    if (reportData.length === 0) return [];
    
    if (activeReportType === "student") {
      const studentMap = {};
      reportData.forEach(row => {
        if (!studentMap[row.email]) {
          studentMap[row.email] = { name: row.studentName, branch: row.branch, total: 0, present: 0 };
        }
        studentMap[row.email].total += 1;
        if (row.status === "Present") studentMap[row.email].present += 1;
      });
      return Object.values(studentMap).map(s => ({
        ...s,
        absent: s.total - s.present,
        percentage: s.total === 0 ? 0 : Math.round((s.present / s.total) * 100)
      })).sort((a, b) => b.percentage - a.percentage);
    }
    
    if (activeReportType === "summary") {
      const sessionMap = {};
      reportData.forEach(row => {
        const key = `${row.date}_${row.subject}_${row.branch}`;
        if (!sessionMap[key]) {
          sessionMap[key] = { date: row.date, subject: row.subject, branch: row.branch, total: 0, present: 0 };
        }
        sessionMap[key].total += 1;
        if (row.status === "Present") sessionMap[key].present += 1;
      });
      return Object.values(sessionMap).map(s => ({
        ...s,
        absent: s.total - s.present,
        percentage: s.total === 0 ? 0 : Math.round((s.present / s.total) * 100)
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return reportData;
  };

  const processedData = getProcessedData();

  const handleExportCSV = () => {
    if (processedData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No data to export. Generate a report first."
      });
      return;
    }

    let headers = [];
    let csvRows = [];
    
    if (activeReportType === "attendance") {
      headers = ["Date", "Student Name", "Email", "Branch", "Subject", "Status", "Time"];
      csvRows.push(headers.join(","));
      processedData.forEach(row => {
        const timeStr = row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : "-";
        const dateStr = new Date(row.date).toLocaleDateString();
        csvRows.push([`"${dateStr}"`, `"${row.studentName}"`, `"${row.email}"`, `"${row.branch}"`, `"${row.subject}"`, `"${row.status}"`, `"${timeStr}"`].join(","));
      });
    } else if (activeReportType === "student") {
      headers = ["Student Name", "Branch", "Total Classes", "Attended", "Absent", "Attendance %"];
      csvRows.push(headers.join(","));
      processedData.forEach(row => {
        csvRows.push([`"${row.name}"`, `"${row.branch}"`, `"${row.total}"`, `"${row.present}"`, `"${row.absent}"`, `"${row.percentage}%"`].join(","));
      });
    } else if (activeReportType === "summary") {
      headers = ["Date", "Subject", "Branch", "Total Students", "Present", "Absent", "Attendance %"];
      csvRows.push(headers.join(","));
      processedData.forEach(row => {
        const dateStr = new Date(row.date).toLocaleDateString();
        csvRows.push([`"${dateStr}"`, `"${row.subject}"`, `"${row.branch}"`, `"${row.total}"`, `"${row.present}"`, `"${row.absent}"`, `"${row.percentage}%"`].join(","));
      });
    }
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_${reportType}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Started",
      description: "Your CSV file is downloading."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Generate, visualize, and export attendance records
        </p>
      </div>

      <Card className="border-primary/20 shadow-md">
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Select filters and report format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={handleStartDateChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={handleEndDateChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-select">Class/Room</Label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.branch}) - {cls.room}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="attendance">Detailed Attendance Log</option>
                <option value="student">Student Performance</option>
                <option value="summary">Subject Summary</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleGenerateReport} className="flex-1" disabled={loading}>
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2" disabled={processedData.length === 0}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" /> Data Preview ({activeReportType === "attendance" ? "Log" : activeReportType === "student" ? "Students" : "Summary"})
          </CardTitle>
          <CardDescription>
            Showing {processedData.length} records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Filter criteria and click "Generate Report" to view data.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
                  {activeReportType === "attendance" && (
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Branch</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Time</th>
                    </tr>
                  )}
                  {activeReportType === "student" && (
                    <tr>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Branch</th>
                      <th className="px-4 py-3 font-medium text-center">Total Classes</th>
                      <th className="px-4 py-3 font-medium text-center text-success">Attended</th>
                      <th className="px-4 py-3 font-medium text-center text-destructive">Absent</th>
                      <th className="px-4 py-3 font-medium text-right">Attendance %</th>
                    </tr>
                  )}
                  {activeReportType === "summary" && (
                    <tr>
                      <th className="px-4 py-3 font-medium">Session Date</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Branch</th>
                      <th className="px-4 py-3 font-medium text-center">Total Students</th>
                      <th className="px-4 py-3 font-medium text-center text-success">Present</th>
                      <th className="px-4 py-3 font-medium text-center text-destructive">Absent</th>
                      <th className="px-4 py-3 font-medium text-right">Attendance %</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-border">
                  {activeReportType === "attendance" && processedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{row.studentName}</td>
                      <td className="px-4 py-3">{row.branch}</td>
                      <td className="px-4 py-3">{row.subject}</td>
                      <td className="px-4 py-3">
                        <Badge variant={row.status === "Present" ? "success" : "destructive"} className={row.status === "Present" ? "bg-success text-success-foreground" : ""}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                        {row.timestamp ? new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </td>
                    </tr>
                  ))}

                  {activeReportType === "student" && processedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                      <td className="px-4 py-3">{row.branch}</td>
                      <td className="px-4 py-3 text-center">{row.total}</td>
                      <td className="px-4 py-3 text-center text-success font-medium">{row.present}</td>
                      <td className="px-4 py-3 text-center text-destructive font-medium">{row.absent}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={row.percentage >= 75 ? "outline" : "destructive"} className={row.percentage >= 75 ? "border-success text-success" : ""}>
                          {row.percentage}%
                        </Badge>
                      </td>
                    </tr>
                  ))}

                  {activeReportType === "summary" && processedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{row.subject}</td>
                      <td className="px-4 py-3">{row.branch}</td>
                      <td className="px-4 py-3 text-center">{row.total}</td>
                      <td className="px-4 py-3 text-center text-success font-medium">{row.present}</td>
                      <td className="px-4 py-3 text-center text-destructive font-medium">{row.absent}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={row.percentage >= 75 ? "outline" : "destructive"} className={row.percentage >= 75 ? "border-success text-success" : ""}>
                          {row.percentage}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
