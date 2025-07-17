
import { categories } from "@/lib/config";
import { Card } from "@/components/ui/card";

export function ArticleCategories() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold tracking-tight font-headline text-center mb-2">
        Browse by Category
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Find articles on specific topics to solve your car problems.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.name}
            className="group flex flex-col items-center justify-center p-4 text-center transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 cursor-pointer"
          >
            <category.icon className="h-8 w-8 mb-2 text-primary group-hover:text-primary-foreground" />
            <span className="text-sm font-medium">{category.name}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
