import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, Camera, X, UserCheck, Search } from "lucide-react";
import * as faceapi from "face-api.js";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [branch, setBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Photo state
  const [photo, setPhoto] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Face Detection State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const detectionIntervalRef = useRef(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const startCamera = async () => {
    setIsCapturing(true);
    setFaceDetected(false); // Reset
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions."
      });
      setIsCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsLoading(true); // Show loading while checking duplicate
      try {
        // 1. Extract Descriptor
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        ).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
          toast({
            variant: "destructive",
            title: "Detection Failed",
            description: "Please position your face clearly and try again."
          });
          setIsLoading(false);
          return;
        }

        const descriptor = Array.from(detection.descriptor);

        // 2. Check Duplicate on Backend
        const dupeRes = await fetch("http://localhost:5000/api/auth/check-duplicate-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptor })
        });
        const dupeData = await dupeRes.json();

        if (dupeData.isDuplicate) {
          toast({
            variant: "destructive",
            title: "Identity Error",
            description: dupeData.message || "This face is already registered."
          });
          setIsLoading(false);
          return;
        }

        // 3. Capture image if not duplicate
        const context = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageData = canvasRef.current.toDataURL("image/png");
        setPhoto(imageData);
        setFaceDescriptor(descriptor);
        stopCamera();
      } catch (err) {
        console.error("Capture/Verification failed", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong during facial verification."
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const stopCamera = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  // Load face-api models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          // These are for the attendance verification later
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Models loading failed", err);
      }
    };
    loadModels();
  }, []);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Detection Loop useEffect
  useEffect(() => {
    let intervalId = null;

    if (isCapturing && modelsLoaded) {
      console.log("Starting face detection loop...");
      intervalId = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const detections = await faceapi.detectSingleFace(
              videoRef.current, 
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            );
            setFaceDetected(!!detections);
          } catch (err) {
            console.error("Detection error:", err);
          }
        }
      }, 500);
      detectionIntervalRef.current = intervalId;
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        detectionIntervalRef.current = null;
      }
    };
  }, [isCapturing, modelsLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      toast({
        variant: "destructive",
        title: "Photo Required",
        description: "Please take a profile photo to create your account.",
      });
      return;
    }

    if (role === "student" && !branch) {
      toast({
        variant: "destructive",
        title: "Branch Required",
        description: "Please select your engineering branch.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role, branch, photo, faceDescriptor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      toast({
        title: "Success",
        description: "Account created successfully. Please login.",
      });
      navigate("/login");
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Radio className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Enter your details to register as a teacher or student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Capture Section */}
            <div className="flex flex-col items-center justify-center mb-6">
              {isCapturing ? (
                <div className="relative rounded-lg overflow-hidden bg-black w-32 h-32 flex items-center justify-center shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover scale-x-[-1] transition-opacity ${faceDetected ? 'opacity-100' : 'opacity-70'}`} />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute top-2 right-2">
                    {faceDetected ? (
                      <div className="bg-success/90 text-success-foreground rounded-full p-1 shadow-lg">
                        <UserCheck className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-black/60 text-white rounded-full p-1 animate-pulse shadow-lg">
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-2 flex flex-col items-center gap-1 w-full px-2">
                    {!faceDetected && <span className="text-[10px] text-white bg-black/50 px-1 rounded">Position your face clearly</span>}
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        onClick={capturePhoto} 
                        variant={faceDetected ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-6 px-3 text-xs font-semibold"
                        disabled={!faceDetected}
                      >
                        Snap
                      </Button>
                      <Button type="button" onClick={stopCamera} variant="destructive" size="icon" className="h-6 w-6">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : photo ? (
                <div className="relative rounded-lg overflow-hidden w-32 h-32 border-2 border-primary/20 group shadow-sm">
                  <img src={photo} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setPhoto(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-32 h-32 rounded-lg border-dashed border-2 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={startCamera}
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 pt-2">
              <Label>I am a:</Label>
              <RadioGroup
                defaultValue={role}
                onValueChange={setRole}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="cursor-pointer">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="cursor-pointer">Teacher</Label>
                </div>
              </RadioGroup>
            </div>

            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="branch">Engineering Branch</Label>
                <Select value={branch} onValueChange={setBranch} required>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select your branch" />
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
            )}



            <Button className="w-full mt-4" type="submit" disabled={isLoading || isCapturing}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
