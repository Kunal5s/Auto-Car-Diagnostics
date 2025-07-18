
"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { Hero } from "@/components/home/hero";
import { RecentArticles } from "@/components/home/recent-articles";
import { QuestionSubmission } from "@/components/home/question-submission";
import { getArticles } from "@/lib/data";
import type { Article } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { ArticleCategories } from "@/components/home/article-categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Wrench, Loader2 } from "lucide-react";
import { ImageGenerator } from "@/components/home/image-generator";

const ARTICLES_PER_PAGE = 15;

function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}

function ToolsCta() {
    return (
        <section className="py-12 text-center">
            <div className="bg-muted p-8 rounded-lg">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                    Explore Our Diagnostic Tools
                </h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Use our free interactive tools to quickly diagnose common car problems, from reading OBD2 codes to checking battery health.
                </p>
                <Button asChild size="lg" className="mt-6">
                    <Link href="/tools">View Diagnostic Tools</Link>
                </Button>
            </div>
        </section>
    );
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all articles from every category
      const fetchedArticles = await getArticles();
      
      setArticles(fetchedArticles);
      setDisplayedArticles(fetchedArticles.slice(0, ARTICLES_PER_PAGE));
      setHasMore(fetchedArticles.length > ARTICLES_PER_PAGE);
    } catch (error) {
      console.error("Failed to fetch homepage articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const newArticles = articles.slice(0, nextPage * ARTICLES_PER_PAGE);
    setDisplayedArticles(newArticles);
    setPage(nextPage);
    setHasMore(articles.length > newArticles.length);
    setTimeout(() => setIsLoadingMore(false), 500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="container mx-auto px-4">
          <ArticleCategories />
          <ToolsCta />
          <ImageGenerator />
          <section id="articles" className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Explore All Articles
              </h2>
              <p className="text-muted-foreground mt-2">
                Our library grows every day with new, in-depth articles. Here are the latest additions from all categories.
              </p>
            </div>
            {isLoading ? <ArticlesSkeleton /> : (
              <>
                {displayedArticles.length > 0 ? (
                    <RecentArticles articles={displayedArticles} />
                ) : (
                    <div className="text-center text-muted-foreground py-16 bg-muted rounded-lg">
                        <p className="text-lg font-medium">No articles have been published yet.</p>
                        <p>Check back soon for new content!</p>
                    </div>
                )}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button onClick={handleLoadMore} disabled={isLoadingMore} size="lg">
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Articles'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
          <QuestionSubmission />
        </div>
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
