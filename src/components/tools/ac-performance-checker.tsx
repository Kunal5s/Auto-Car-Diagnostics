
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AcPerformanceChecker() {
  const [result, setResult] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isChecking) {
      timer = setTimeout(() => {
        const random = Math.random();
        const checkResult = random > 0.7 
          ? 'Simulation indicates AC cooling is weaker than expected. The system may be low on refrigerant or have a faulty component.' 
          : 'AC performance appears to be good. The system is providing adequate cooling.';
        setResult(checkResult);
        setIsChecking(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isChecking]);

  const checkAC = () => {
    setResult("");
    setIsChecking(true);
  };

  return (
    <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Note: This tool simulates a basic AC performance check.</p>
        <Button onClick={checkAC} disabled={isChecking} className="w-full">
            {isChecking ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Check...
                </>
            ) : (
                'Run AC Performance Check'
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
