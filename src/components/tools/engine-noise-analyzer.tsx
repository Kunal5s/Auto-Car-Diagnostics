
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function EngineNoiseAnalyzer() {
  const [result, setResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      timer = setTimeout(() => {
        const random = Math.random();
        const analysisResult = random > 0.7 
          ? 'Simulation detected an unusual noise (e.g., clicking, grinding). It is recommended to have a professional inspect the engine.' 
          : 'Simulated analysis suggests engine sounds are within normal operational parameters. No unusual noises detected.';
        setResult(analysisResult);
        setIsAnalyzing(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isAnalyzing]);

  const analyzeNoise = () => {
    setResult("");
    setIsAnalyzing(true);
  };

  return (
    <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Note: This tool simulates an engine noise check for demonstration purposes. It does not analyze microphone input.</p>
        <Button onClick={analyzeNoise} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                'Simulate Engine Noise Check'
            )}
        </Button>
      {result && (
        <Card className="bg-muted mt-4">
            <CardContent className="p-4">
                <p className="font-semibold text-center">{result}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
