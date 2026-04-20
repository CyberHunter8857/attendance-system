import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, BookOpen, PlusCircle, Network, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StartSessionModal({ onSessionStarted, defaultSubject = "", defaultBranch = "", triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [branch, setBranch] = useState(defaultBranch);
  const [radius, setRadius] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  const handleStart = async (e) => {
    e.preventDefault();
    if (!subject || !branch) {
      toast({ variant: "destructive", title: "Error", description: "Subject and Branch are required." });
      return;
    }

    setIsLoading(true);
    try {
      // Get Teacher Location
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
        } else {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(new Error("Please enable location permissions to start a session.")),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        }
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch("/api/attendance/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          subject, 
          branch, 
          latitude, 
          longitude, 
          radius: Number(radius) 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start session");

      toast({
        title: "Session Started",
        description: `Attendance session for ${subject} is now active.`,
      });

      setOpen(false);
      setSubject("");
      setBranch("");
      if (onSessionStarted) onSessionStarted(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`gap-2 ${triggerClassName}`}>
          <PlusCircle className="h-4 w-4" />
          Start Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleStart}>
          <DialogHeader>
            <DialogTitle>Start Attendance Session</DialogTitle>
            <DialogDescription>
              Launch a new attendance session. The date is recorded automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Subject Name
              </Label>
              <Input
                id="subject"
                placeholder="e.g. Computer Science 101"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch" className="flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                Target Branch
              </Label>
              <Select value={branch} onValueChange={setBranch} required>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select target branch" />
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
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date
              </Label>
              <Input value={new Date().toLocaleDateString()} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="radius" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Attendance Radius (meters)
              </Label>
              <Input
                id="radius"
                type="number"
                placeholder="e.g. 500"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                min="10"
                max="5000"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Students must be within this distance from your current location.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !subject || !branch}>
              {isLoading ? "Starting..." : "Start Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
