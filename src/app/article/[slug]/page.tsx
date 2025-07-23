
"use client";

import { getArticleBySlug, getAuthor } from "@/lib/data";
import Image from "next/image";
import { Footer } from "@/components/common/footer";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Article, Author } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/header";
import { useEffect, useState, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableOfContents, type TocEntry } from "@/components/article/table-of-contents";

function AuthorInfo({ author }: { author: Author }) {
  if (!author) return null;
  return (
    <div className="mt-16 pt-8 border-t">
       <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden">
            <Image src={author.imageUrl || 'https://placehold.co/100x100.png'} alt={author.name} layout="fill" objectFit="cover" data-ai-hint="author photo" />
          </div>
          <div>
              <p className="text-sm text-muted-foreground">Written by</p>
              <h4 className="text-xl font-bold font-headline">{author.name}</h4>
              <p className="text-md text-muted-foreground">{author.role}</p>
          </div>
       </div>
       <div className="mt-4 text-muted-foreground prose max-w-none" dangerouslySetInnerHTML={{ __html: author.bio.replace(/\n/g, '<br />') }} />
    </div>
  )
}

function ArticlePageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-1/2" />
            </div>
            <Skeleton className="aspect-video w-full rounded-lg my-8" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
            </div>
        </div>
    )
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [contentWithIds, setContentWithIds] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // We fetch with drafts enabled in case we are viewing a draft preview
        const articleData = await getArticleBySlug(slug, { includeDrafts: true });
        
        if (!articleData) {
            // Let the notFound page handle it if it truly doesn't exist
            setArticle(null);
            return;
        }

        const authorData = await getAuthor();
        setAuthor(authorData);

        // Process content for TOC
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleData.content;
        const headings = tempDiv.querySelectorAll('h2, h3');
        const tocEntries: TocEntry[] = [];
        let h2Counter = 0;
        let h3Counter = 0;

        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1), 10);
            let number;

            if (level === 2) {
                h2Counter++;
                h3Counter = 0;
                number = `${h2Counter}`;
            } else { // level === 3
                if (h2Counter === 0) h2Counter = 1; // Handle case where h3 appears before h2
                h3Counter++;
                number = `${h2Counter}.${h3Counter}`;
            }
            
            const title = heading.textContent || '';
            const id = `${number}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
            
            heading.id = id;
            tocEntries.push({ id, title, level, number });
        });

        setToc(tocEntries);
        setContentWithIds(tempDiv.innerHTML);
        setArticle(articleData);
      } catch (error) {
        console.error("Failed to fetch article data:", error);
        setArticle(null); // Set to null to show not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <article className="container py-10">
            <ArticlePageSkeleton />
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    // We can use a proper notFound() call here if needed,
    // but for now, a simple message or redirect might suffice.
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container py-10 text-center">
                <h1 className="text-2xl font-bold">Article Not Found</h1>
                <p className="text-muted-foreground">The article you are looking for does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Return to Homepage</Link>
                </Button>
            </main>
            <Footer />
        </div>
    );
  }
  
  const readingTime = Math.ceil((article.content || '').split(/\s+/).length / 200);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
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
              <Badge variant="secondary">{article.category}</Badge>
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
                alt={article.altText || article.title}
                fill
                className="object-cover"
                data-ai-hint={article.imageHint}
                priority
              />
            </div>
            
            {toc.length > 0 && <TableOfContents toc={toc} />}

            <div className={cn(
              "prose prose-lg max-w-none prose-headings:font-headline prose-headings:font-semibold prose-headings:text-foreground prose-p:font-body prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              "[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl"
            )} dangerouslySetInnerHTML={{ __html: contentWithIds }} />
            
            {author && <AuthorInfo author={author} />}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

    