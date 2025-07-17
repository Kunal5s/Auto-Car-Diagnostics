
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function AirFilterChecker() {
  const [km, setKm] = useState("");
  const [result, setResult] = useState("");

  const checkAirFilter = () => {
    const distance = parseInt(km);
    let res = "";
    if (isNaN(distance)) {
      res = "Please enter a valid number for kilometers.";
    } else if (distance >= 15000) {
      res = "It's time to inspect your air filter. It may need replacement to ensure optimal engine performance.";
    } else {
      res = "Your air filter should still be in acceptable condition based on this mileage.";
    }
    setResult(res);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkAirFilter();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="km">Kilometers since last filter change</Label>
        <div className="flex gap-2">
            <Input
              id="km"
              type="number"
              placeholder="e.g. 12000"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base"
            />
            <Button onClick={checkAirFilter}>Check</Button>
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
