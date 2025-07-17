
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getSmokeDiagnosis } from "@/ai/flows/smoke-diagnosis";
import type { SmokeDiagnosisInput, SmokeDiagnosisOutput } from "@/ai/flows/smoke-diagnosis";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const smokeOptions: { name: SmokeDiagnosisInput['smokeColor']; colorClass: string }[] = [
    { name: "White", colorClass: "bg-gray-200 hover:bg-gray-300 text-black" },
    { name: "Blue", colorClass: "bg-blue-500 hover:bg-blue-600 text-white" },
    { name: "Black", colorClass: "bg-black hover:bg-gray-800 text-white" },
];

export function SmokeDiagnosis() {
    const [selectedColor, setSelectedColor] = useState<SmokeDiagnosisInput['smokeColor'] | null>(null);
    const [result, setResult] = useState<SmokeDiagnosisOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleColorClick = async (smokeColor: SmokeDiagnosisInput['smokeColor']) => {
        if (isLoading) return;

        setSelectedColor(smokeColor);
        setIsLoading(true);
        setResult(null);

        try {
            const diagnosis = await getSmokeDiagnosis({ smokeColor });
            setResult(diagnosis);
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
            <p className="text-center text-muted-foreground">What color is the smoke coming from your exhaust?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {smokeOptions.map((option) => (
                    <Button
                        key={option.name}
                        className={cn("h-16 text-lg font-bold transition-all", option.colorClass, selectedColor === option.name && 'ring-4 ring-primary ring-offset-2')}
                        onClick={() => handleColorClick(option.name)}
                        disabled={isLoading}
                    >
                        {isLoading && selectedColor === option.name ? <Loader2 className="animate-spin" /> : option.name}
                    </Button>
                ))}
            </div>

            {isLoading && !result && (
                 <div className="text-center text-muted-foreground p-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Our AI mechanic is analyzing the symptoms...</p>
                </div>
            )}

            {result && (
                <Card className="bg-muted border-l-4" style={{ borderLeftColor: result.severity === 'High' ? 'red' : result.severity === 'Medium' ? 'orange' : 'blue' }}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-xl">Diagnosis for {selectedColor} Smoke</CardTitle>
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
                            <h3 className="font-semibold text-foreground mb-2">Possible Causes:</h3>
                            <ul className="space-y-2">
                                {result.possibleCauses.map((cause, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
                                        <span className="text-muted-foreground">{cause}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Recommendation:</h3>
                            <p className="text-muted-foreground">{result.recommendation}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
