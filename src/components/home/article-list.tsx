
"use client";

import { useState, useEffect } from "react";
import type { Article } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentArticles } from "@/components/home/recent-articles";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  );
}

interface ArticleListProps {
    allArticles: Article[];
}

export function ArticleList({ allArticles }: ArticleListProps) {
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        setDisplayedArticles(allArticles.slice(0, ARTICLES_PER_PAGE));
        setHasMore(allArticles.length > ARTICLES_PER_PAGE);
        setIsLoading(false);
    }, [allArticles]);

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        const newArticles = allArticles.slice(0, nextPage * ARTICLES_PER_PAGE);
        setDisplayedArticles(newArticles);
        setPage(nextPage);
        setHasMore(allArticles.length > newArticles.length);
        setTimeout(() => setIsLoadingMore(false), 500);
    };

    if (isLoading) {
        return <ArticlesSkeleton />;
    }

    return (
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
    )
}
