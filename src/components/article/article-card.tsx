import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const snippet = article.content.replace(/<[^>]+>/g, '').substring(0, 150) + (article.content.length > 150 ? "..." : "");

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="p-0">
        <div className="aspect-[16/9] relative overflow-hidden rounded-t-lg">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={article.imageHint}
          />
        </div>
        <div className="p-6 pb-0">
            <Badge variant="secondary" className="w-fit">{article.category}</Badge>
            <CardTitle className="font-headline pt-2">{article.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <p className="text-muted-foreground line-clamp-3">{snippet}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
         <Button asChild className="w-full">
            <Link href={`/article/${article.slug}`}>
                Read Article
                <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
