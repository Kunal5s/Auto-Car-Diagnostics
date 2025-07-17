"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function EngineTempMonitor() {
  const [temp, setTemp] = useState("");
  const [result, setResult] = useState("");

  const checkTemp = () => {
    const t = parseFloat(temp);
    let res = "";
    if (isNaN(t)) {
        res = "Please enter a valid temperature.";
    } else if (t < 90) {
        res = "Normal: Engine temperature is in the optimal operating range.";
    } else if (t <= 105) {
        res = "Slightly Hot: Engine is running warm, which is acceptable under heavy load or in hot weather. Keep an eye on it.";
    } else {
        res = "Warning! Engine is overheating. Pull over safely and turn off the engine to prevent damage.";
    }
    setResult(res);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkTemp();
    }
  }

  return (
    <div className="space-y-4">
        <div className="space-y-2">
        <Label htmlFor="temp">Enter Engine Temperature (°C)</Label>
        <div className="flex gap-2">
            <Input
              id="temp"
              type="number"
              placeholder="e.g. 95"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base"
            />
            <Button onClick={checkTemp}>Check</Button>
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
