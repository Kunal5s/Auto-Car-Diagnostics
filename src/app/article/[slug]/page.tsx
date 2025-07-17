import { getArticleBySlug } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { ArticleSummarizer } from "@/components/article/article-summarizer";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// This is a dummy component for header as we can't pass state to it from here
function StaticHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-accent"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-bold font-headline sm:inline-block">
              Car Diagnostics BrainAi
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}


export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }
  
  const readingTime = Math.ceil(article.content.split(/\s+/).length / 200);

  return (
    <div className="flex flex-col min-h-screen">
      <StaticHeader />
      <main className="flex-grow">
        <article className="container py-10">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="mb-8">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all articles
              </Link>
            </Button>
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit bg-accent/20 text-accent border-none">{article.category}</Badge>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-headline">
                {article.title}
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <time dateTime={article.publishedAt}>
                    {format(new Date(article.publishedAt), "MMMM d, yyyy")}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>

            <div className="aspect-[16/9] relative overflow-hidden rounded-lg my-8">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                data-ai-hint={article.imageHint}
                priority
              />
            </div>

            <ArticleSummarizer articleContent={article.content} />

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-headline prose-p:font-body prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
                {article.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
