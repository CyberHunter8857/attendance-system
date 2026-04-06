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
import { Calendar, BookOpen, PlusCircle } from "lucide-react";

export function StartSessionModal({ onSessionStarted }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  const handleStart = async (e) => {
    e.preventDefault();
    if (!subject) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/attendance/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start session");

      toast({
        title: "Session Started",
        description: `Attendance session for ${subject} is now active.`,
      });

      setOpen(false);
      setSubject("");
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
        <Button className="gap-2">
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
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date
              </Label>
              <Input value={new Date().toLocaleDateString()} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !subject}>
              {isLoading ? "Starting..." : "Start Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
