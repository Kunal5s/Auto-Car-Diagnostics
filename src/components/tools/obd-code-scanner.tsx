"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const codes: { [key: string]: string } = {
  P0300: "Random/Multiple Cylinder Misfire Detected",
  P0420: "Catalyst System Efficiency Below Threshold (Bank 1)",
  P0171: "System Too Lean (Bank 1)",
  P0135: "O2 Sensor Heater Circuit Malfunction (Bank 1 Sensor 1)",
  P0442: "Evaporative Emission Control System Leak Detected (Small Leak)",
  P0128: "Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)"
};

export function ObdCodeScanner() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");

  const lookupCode = () => {
    const found = codes[code.toUpperCase()] || "Code not found in local database. Check for typos or consult a comprehensive list.";
    setResult(found);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      lookupCode();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          id="code"
          placeholder="Enter OBD Code (e.g. P0300)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyPress}
          className="text-base"
        />
        <Button onClick={lookupCode}>Lookup</Button>
      </div>
      {result && (
        <Card className="bg-muted">
            <CardContent className="p-4">
                <p className="font-semibold text-center">{result}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
