
"use client";

import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article/article-card";

interface RecentArticlesProps {
  articles: Article[];
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  // The parent component now handles loading and empty states.
  // This component's role is just to render the list of articles it's given.
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16 bg-muted rounded-lg">
        <p className="text-lg font-medium">No articles have been published yet.</p>
        <p>Check back soon for new content!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
