"use client";

import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article/article-card";

interface RecentArticlesProps {
  articles: Article[];
  searchQuery: string;
}

export function RecentArticles({ articles, searchQuery }: RecentArticlesProps) {
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold tracking-tight font-headline text-center mb-8">
        Recently Added
      </h2>
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>No articles found for your search.</p>
          <p className="text-sm">Try a different keyword.</p>
        </div>
      )}
    </section>
  );
}
