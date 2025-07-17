import { getArticles } from "@/lib/data";
import { ArticleCard } from "@/components/article/article-card";

export async function FeaturedGuides() {
  const allArticles = await getArticles();
  const featuredArticles = allArticles.filter((article) => article.isFeatured);

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold tracking-tight font-headline text-center mb-2">
        Featured Guides
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Hand-picked guides to help you master your vehicle.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
