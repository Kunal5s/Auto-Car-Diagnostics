
import { getArticles } from "@/lib/data";
import { ArticleList } from "@/components/home/article-list";

export async function HomePageContent() {
    const allArticles = await getArticles();
    return (
        <section id="articles" className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Explore All Articles
              </h2>
              <p className="text-muted-foreground mt-2">
                Our library grows every day with new, in-depth articles. Here are the latest additions from all categories.
              </p>
            </div>
            <ArticleList allArticles={allArticles} />
        </section>
    );
}
