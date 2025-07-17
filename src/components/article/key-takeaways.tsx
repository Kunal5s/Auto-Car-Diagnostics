import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KeyTakeawaysProps {
    takeaways: string[];
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
    if (!takeaways || takeaways.length === 0) {
        return null;
    }

    return (
        <Card className="my-8 bg-muted/50 border-secondary">
            <CardHeader>
                <CardTitle className="flex items-center font-headline text-foreground">
                    Key Takeaways
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {takeaways.map((takeaway, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-3 mt-1 shrink-0 text-primary" />
                            <span className="text-muted-foreground">{takeaway}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
