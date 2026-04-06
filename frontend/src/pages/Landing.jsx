import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Users, FileText, Shield, Zap, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Radio,
      title: "Real-time Monitoring",
      description: "Track BLE device detections across all classrooms in real-time",
    },
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profiles with attendance history",
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate and export attendance reports in multiple formats",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with accurate geo-fencing",
    },
    {
      icon: Zap,
      title: "Automated Processing",
      description: "Automatic attendance marking based on configurable rules",
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Insightful metrics and trends for better decision making",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Radio className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">BLE-Powered Attendance</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-6xl">
              Advanced Attendance System
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Monitor and manage attendance with precision using Raspberry Pi BLE scanners.
              Real-time tracking, automated processing, and comprehensive reporting in one platform.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/monitor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Live Monitor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for modern attendance management
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-muted-foreground">
              Leveraging the best tools for performance and reliability
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• React 18 with Vite</p>
                  <p>• Tailwind CSS for styling</p>
                  <p>• React Router for navigation</p>
                  <p>• React Query for data fetching</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hardware</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Raspberry Pi 3B+ / 4</p>
                  <p>• Bluetooth Low Energy (BLE)</p>
                  <p>• GPS for geo-fencing</p>
                  <p>• Real-time RSSI monitoring</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Automated attendance marking</p>
                  <p>• CSV export functionality</p>
                  <p>• Real-time notifications</p>
                  <p>• Responsive design</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Experience modern attendance management with our comprehensive system
            </p>
            <Link to="/dashboard">
              <Button size="lg">Access Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Advanced Attendance System © 2025</p>
            <p className="mt-2">Built with React, Tailwind CSS, and Raspberry Pi</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
