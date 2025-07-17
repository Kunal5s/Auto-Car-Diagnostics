"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { Hero } from "@/components/home/hero";
import { ArticleCategories } from "@/components/home/article-categories";
import { RecentArticles } from "@/components/home/recent-articles";
import { QuestionSubmission } from "@/components/home/question-submission";
import { getArticles } from "@/lib/data";
import type { Article } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";

function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const fetchedArticles = await getArticles();
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-grow">
        <Hero />
        <div className="container mx-auto px-4">
          <ArticleCategories />
          {loading ? <ArticlesSkeleton /> : <RecentArticles articles={articles} searchQuery={searchQuery} />}
          <QuestionSubmission />
        </div>
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
