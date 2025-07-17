import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <div className="aspect-[16/9] relative overflow-hidden rounded-t-lg -mt-6 -mx-6">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={article.imageHint}
          />
        </div>
        <Badge variant="secondary" className="w-fit mt-4">{article.category}</Badge>
        <CardTitle className="font-headline pt-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{article.summary}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/article/${article.slug}`} className="flex items-center text-sm font-semibold text-primary hover:underline">
          Read more <ArrowUpRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
