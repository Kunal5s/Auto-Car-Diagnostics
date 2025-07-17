"use client";

import { useState } from "react";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { liveSearch, LiveSearchOutput } from "@/ai/flows/live-search";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LiveSearchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);
    try {
      const searchResults = await liveSearch({ query });
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch search results. Please check your API token and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline text-center">
              Live Car Diagnostics Search
            </h1>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Get real-time answers to your car-related questions from across the web.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2">
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'symptoms of a bad alternator'"
                className="flex-grow"
                required
              />
              <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <SearchIcon className="h-5 w-5" />
                )}
                <span className="sr-only">Search</span>
              </Button>
            </form>

            <div className="mt-12">
              {isLoading && (
                 <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                 </div>
              )}
              {results && (
                 <Card className="bg-card/50 border-primary">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Search Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {results.organic_results.length > 0 ? (
                            results.organic_results.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <Link href={item.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-accent hover:underline">
                                        {item.title}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">{item.link}</p>
                                    <p className="text-foreground/90">{item.snippet}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">No results found.</p>
                        )}
                    </CardContent>
                 </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
