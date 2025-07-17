
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function BeltConditionEstimator() {
  const [years, setYears] = useState("");
  const [result, setResult] = useState("");

  const checkBelt = () => {
    const y = parseInt(years);
    let res = "";
    if (isNaN(y)) {
      res = "Please enter a valid number of years.";
    } else if (y >= 5) {
      res = "Based on age, your drive belts are due for a visual inspection. Look for cracks, fraying, or glazing.";
    } else {
      res = "Belts are likely in good condition, but regular visual checks are always recommended.";
    }
    setResult(res);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkBelt();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="years">Years Since Last Belt Change</Label>
        <div className="flex gap-2">
            <Input
              id="years"
              type="number"
              placeholder="e.g. 4"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base"
            />
            <Button onClick={checkBelt}>Check</Button>
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
