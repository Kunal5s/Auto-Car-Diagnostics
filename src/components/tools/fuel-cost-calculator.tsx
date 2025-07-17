"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function FuelCostCalculator() {
  const [km, setKm] = useState("");
  const [eff, setEff] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState("");

  const calculateCost = () => {
    const distance = parseFloat(km);
    const efficiency = parseFloat(eff);
    const fuelPrice = parseFloat(price);

    if (isNaN(distance) || isNaN(efficiency) || isNaN(fuelPrice)) {
        setResult("Please fill in all fields with valid numbers.");
        return;
    }
    
    if (efficiency <= 0) {
        setResult("Fuel efficiency must be greater than zero.");
        return;
    }

    const cost = (distance / efficiency) * fuelPrice;
    setResult(`Estimated Fuel Cost: ₹${cost.toFixed(2)}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="km">Distance (km)</Label>
          <Input id="km" type="number" placeholder="e.g. 400" value={km} onChange={(e) => setKm(e.target.value)} className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eff">Fuel Efficiency (km/l)</Label>
          <Input id="eff" type="number" placeholder="e.g. 15" value={eff} onChange={(e) => setEff(e.target.value)} className="text-base" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Fuel Price (per liter)</Label>
        <Input id="price" type="number" placeholder="e.g. 105.50" value={price} onChange={(e) => setPrice(e.target.value)} className="text-base" />
      </div>
      <Button onClick={calculateCost} className="w-full">Calculate</Button>
      {result && (
        <Card className="bg-muted mt-4">
            <CardContent className="p-4">
                <p className="font-semibold text-center text-lg">{result}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
