"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function BatteryHealthCheck() {
  const [voltage, setVoltage] = useState("");
  const [result, setResult] = useState("");

  const checkBattery = () => {
    const v = parseFloat(voltage);
    let res = "";
    if (isNaN(v)) {
        res = "Please enter a valid voltage.";
    } else if (v >= 12.6) {
        res = "Excellent: Battery is fully charged and healthy.";
    } else if (v >= 12.4) {
        res = "Good: Battery is moderately charged.";
    } else if (v >= 12.2) {
        res = "Fair: Battery is low. Consider charging soon.";
    } else {
        res = "Poor: Battery is discharged or potentially faulty.";
    }
    setResult(res);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkBattery();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voltage">Enter Battery Voltage (V)</Label>
        <div className="flex gap-2">
            <Input
              id="voltage"
              type="number"
              step="0.1"
              placeholder="e.g. 12.5"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base"
            />
            <Button onClick={checkBattery}>Check</Button>
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
