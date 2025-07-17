
"use client";

import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article/article-card";

interface RecentArticlesProps {
  articles: Article[];
}

export function RecentArticles({ articles }: RecentArticlesProps) {

  return (
    <section id="articles" className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Recently Added Articles
        </h2>
        <p className="text-muted-foreground mt-2">
          Our library grows every day with new, in-depth articles. Here are the latest additions.
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>No articles found.</p>
        </div>
      )}
    </section>
  );
}
