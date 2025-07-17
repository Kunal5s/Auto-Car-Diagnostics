
"use client";

import { useState, useEffect } from "react";
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
import { Wrench } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        // We only fetch published articles for the homepage
        const fetchedArticles = await getArticles({ includeDrafts: false });
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
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="container mx-auto px-4">
          <ArticleCategories />
          <ToolsCta />
          {loading ? <ArticlesSkeleton /> : <RecentArticles articles={articles} />}
          <QuestionSubmission />
        </div>
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
