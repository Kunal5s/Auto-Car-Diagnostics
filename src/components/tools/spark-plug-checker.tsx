
"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";


export function SparkPlugChecker() {
  
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Feature Unavailable</AlertTitle>
          <AlertDescription>
            The AI-powered spark plug diagnosis feature has been temporarily disabled. Please use our other available tools.
          </AlertDescription>
        </Alert>
    </div>
  );
}
