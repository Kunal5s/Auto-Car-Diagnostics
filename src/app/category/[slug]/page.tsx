
"use client";

import { useState, useEffect, useCallback, use } from "react";
import { notFound } from "next/navigation";
import { getArticlesByCategory } from "@/lib/data";
import type { Article } from "@/lib/types";
import { categories } from "@/lib/config";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { ArticleCard } from "@/components/article/article-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const category = categories.find(c => c.name.toLowerCase().replace(/ /g, '-') === slug);

  const loadArticles = useCallback(async () => {
    if (!category) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const fetchedArticles = await getArticlesByCategory(category.name);
      setArticles(fetchedArticles);
      setDisplayedArticles(fetchedArticles.slice(0, ARTICLES_PER_PAGE));
      setHasMore(fetchedArticles.length > ARTICLES_PER_PAGE);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

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
    // Simulate network delay for better UX
    setTimeout(() => setIsLoadingMore(false), 500);
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container py-8">
                 <Button asChild variant="ghost" className="mb-8">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to homepage
                    </Link>
                </Button>
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-1/3 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                </div>
                <ArticlesSkeleton />
            </main>
            <Footer />
        </div>
    );
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-8">
        <Button asChild variant="ghost" className="mb-8">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to homepage
            </Link>
        </Button>
        <div className="text-center mb-12">
            <category.icon className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
                {category.name} Articles
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Browse all articles related to {category.name}.
            </p>
        </div>

        {displayedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-xl">No articles found in this category yet.</p>
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
                'Load More'
              )}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
