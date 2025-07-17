
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SparkPlugChecker() {
  const [mileage, setMileage] = useState("");
  const [result, setResult] = useState("");

  const checkSparkPlugs = () => {
    const m = parseInt(mileage);
    let res = "";
    if (isNaN(m)) {
      res = "Please enter a valid mileage.";
    } else if (m >= 30000) {
      res = "High mileage detected. Spark plugs may need inspection or replacement soon.";
    } else {
      res = "Mileage is within normal range. Spark plugs are likely in good condition.";
    }
    setResult(res);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkSparkPlugs();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mileage">Mileage since last change (km)</Label>
        <div className="flex gap-2">
            <Input
              id="mileage"
              type="number"
              placeholder="e.g. 25000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base"
            />
            <Button onClick={checkSparkPlugs}>Check</Button>
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
