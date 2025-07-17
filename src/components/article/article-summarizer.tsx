"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { summarizeArticle } from "@/ai/flows/summarize-article";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function ArticleSummarizer({ articleContent }: { articleContent: string }) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary("");
    try {
      const result = await summarizeArticle({ articleText: articleContent });
      setSummary(result.summary);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to summarize the article. Please try again.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8">
      <div className="text-center">
        <Button onClick={handleSummarize} disabled={isLoading} size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Summarize with AI
        </Button>
      </div>

      {summary && (
        <Card className="mt-8 bg-muted/50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center font-headline text-primary">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
