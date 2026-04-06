import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    toast.success("Report generated successfully!");
  };

  const handleExportCSV = () => {
    toast.success("CSV export initiated");
  };

  const reportTypes = [
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Detailed attendance records for selected period",
      icon: FileText,
    },
    {
      id: "summary",
      title: "Summary Report",
      description: "Overview of attendance statistics",
      icon: Calendar,
    },
    {
      id: "student",
      title: "Student-wise Report",
      description: "Individual student attendance breakdown",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-muted-foreground">
          Generate and export attendance reports
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                Select parameters to generate your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="End date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-select">Class/Room</Label>
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Select class"
                >
                  <option value="all">All Classes</option>
                  <option value="class_01">Computer Science 301 - Room A</option>
                  <option value="class_02">Data Structures 202 - Room B</option>
                  <option value="class_03">Algorithms 401 - Room C</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGenerateReport} className="flex-1">
                  Generate Report
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="gap-2"
                  aria-label="Export as CSV"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Types</CardTitle>
              <CardDescription>Available report formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <type.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{type.title}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Attendance Report - March 2025", date: "2025-03-15", size: "2.4 MB" },
              { name: "Summary Report - February 2025", date: "2025-02-28", size: "1.8 MB" },
              { name: "Student Report - January 2025", date: "2025-01-31", size: "3.2 MB" },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" aria-label={`Download ${report.name}`}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
