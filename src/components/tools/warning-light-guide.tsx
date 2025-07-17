
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getWarningLightExplanation, type WarningLightOutput } from "@/ai/flows/warning-light-guide";
import { AlertTriangle, Droplet, Thermometer, BatteryWarning, CircleDot, Wind, Lightbulb } from "lucide-react";
import { Obd2Icon } from "@/components/icons/obd2-icon";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const lights = [
  { name: "Check Engine", icon: Obd2Icon, lightName: "Check Engine Light" },
  { name: "Oil Pressure", icon: Droplet, lightName: "Oil Pressure Light" },
  { name: "Engine Temp", icon: Thermometer, lightName: "Engine Temperature Warning Light" },
  { name: "Battery", icon: BatteryWarning, lightName: "Battery or Charging System Light" },
  { name: "Brake System", icon: AlertTriangle, lightName: "Brake System Warning Light" },
  { name: "Tire Pressure (TPMS)", icon: CircleDot, lightName: "Tire Pressure Monitoring System (TPMS) Light" },
  { name: "Washer Fluid", icon: Wind, lightName: "Washer Fluid Low Light" },
  { name: "Exterior Light", icon: Lightbulb, lightName: "Exterior Light Fault" },
];

const severityColors = {
    Low: 'bg-blue-500',
    Medium: 'bg-yellow-500',
    High: 'bg-red-500',
};

export function WarningLightGuide() {
    const [selectedLight, setSelectedLight] = useState<string | null>(null);
    const [result, setResult] = useState<WarningLightOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleLightClick = async (lightName: string) => {
        if (isLoading) return;
        
        setSelectedLight(lightName);
        setIsLoading(true);
        setResult(null);

        try {
            const explanation = await getWarningLightExplanation({ lightName });
            setResult(explanation);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-center text-muted-foreground">Select a warning light below to get a detailed explanation from our AI assistant.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {lights.map((light) => (
                    <Button
                        key={light.name}
                        variant="outline"
                        className={cn(
                            "flex flex-col h-24 items-center justify-center gap-2 text-center transition-all",
                            selectedLight === light.lightName && "ring-2 ring-primary"
                        )}
                        onClick={() => handleLightClick(light.lightName)}
                        disabled={isLoading}
                    >
                        <light.icon className="h-6 w-6" />
                        <span className="text-xs text-center">{light.name}</span>
                    </Button>
                ))}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {result && (
                <Card className="bg-muted border-l-4" style={{ borderLeftColor: result.severity === 'High' ? 'red' : result.severity === 'Medium' ? 'orange' : 'blue' }}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                           <div>
                                <CardTitle className="font-headline text-xl">{selectedLight}</CardTitle>
                                <CardDescription>AI-Generated Explanation</CardDescription>
                           </div>
                           <Badge className={cn(
                               "text-white",
                               result.severity === 'High' ? 'bg-destructive hover:bg-destructive' :
                               result.severity === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-500' :
                               'bg-blue-500 hover:bg-blue-500'
                           )}>
                            {result.severity} Severity
                           </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-foreground">Meaning</h3>
                            <p className="text-muted-foreground">{result.meaning}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-foreground">Recommended Action</h3>
                            <p className="text-muted-foreground">{result.action}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
