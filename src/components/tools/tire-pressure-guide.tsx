"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function TirePressureGuide() {
  const [psi, setPsi] = useState("");
  const [result, setResult] = useState("");

  const checkTirePressure = () => {
    const p = parseFloat(psi);
    let res = "";
    if (isNaN(p)) {
        res = "Please enter a valid PSI value.";
    } else if (p >= 30 && p <= 35) {
        res = "Optimal: Tire pressure is in the ideal range for most passenger cars.";
    } else if (p < 30) {
        res = "Low: Tire pressure is too low. This can cause poor handling and fuel economy. Please add air.";
    } else {
        res = "High: Tire pressure is too high. This can cause a harsh ride and reduced traction. Please release some air.";
    }
    setResult(res);
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkTirePressure();
    }
  }


  return (
    <div className="space-y-4">
       <div className="space-y-2">
        <Label htmlFor="psi">Enter Tire Pressure (PSI)</Label>
        <div className="flex gap-2">
            <Input
              id="psi"
              type="number"
              placeholder="e.g. 32"
              value={psi}
              onChange={(e) => setPsi(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base"
            />
            <Button onClick={checkTirePressure}>Check</Button>
        </div>
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
