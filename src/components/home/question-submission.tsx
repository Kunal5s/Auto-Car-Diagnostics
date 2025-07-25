
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Send } from "lucide-react";

export function QuestionSubmission() {
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Question Submitted!",
      description: "Thanks for your submission. We'll answer it in a future article.",
    });
  };

  return (
    <section className="py-12">
        <Card className="max-w-3xl mx-auto bg-muted/50 border-2 border-dashed border-primary">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Have a Question?</CardTitle>
                <CardDescription>
                Can't find an answer? Submit your question below, and our experts might cover it in a future article.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <Textarea
                        placeholder="e.g., How do I know when to replace my brake pads?"
                        className="resize-none h-32"
                    />
                    <Button onClick={handleSubmit} className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Submit Question
                    </Button>
                </div>
            </CardContent>
        </Card>
    </section>
  );
}
