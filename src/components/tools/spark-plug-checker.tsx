
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, CheckCircle } from "lucide-react";
import { diagnoseSparkPlug } from "@/ai/flows/spark-plug-diagnosis";
import type { SparkPlugDiagnosisOutput } from "@/ai/flows/spark-plug-diagnosis";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SparkPlugChecker() {
  const [result, setResult] = useState<SparkPlugDiagnosisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API is not supported by this browser.');
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function to stop video stream when component unmounts
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [toast]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUri = canvas.toDataURL('image/jpeg');

    try {
      const diagnosisResult = await diagnoseSparkPlug({ imageDataUri });
      setResult(diagnosisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {hasCameraPermission === false && (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access in your browser to use this feature.
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={captureAndAnalyze} disabled={isLoading || !hasCameraPermission} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Camera className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Analyzing...' : 'Capture & Analyze'}
      </Button>

      {result && (
        <Card className="bg-muted">
          <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-xl">AI Diagnosis</CardTitle>
                </div>
                <Badge className={cn(
                    result.condition === 'Normal' ? 'bg-green-500' : 'bg-yellow-500',
                    'text-white'
                )}>
                    {result.condition}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Analysis:</h3>
              <p className="text-muted-foreground">{result.analysis}</p>
            </div>
             <div>
                <h3 className="font-semibold text-foreground">Recommendation:</h3>
                <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary" />
                    <p className="text-muted-foreground">{result.recommendation}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
