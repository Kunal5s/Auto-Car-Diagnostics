import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="py-20 md:py-32 text-center">
      <div className="container">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline text-foreground">
          Genuinely Helpful Car Repair and Maintenance Guides
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
          Original, useful, and accurate help for real-life automotive problems. Written for humans, by an intelligent system focused on quality.
        </p>
        <div className="mt-8">
            <Button asChild size="lg">
                <Link href="#articles">Explore Our Articles</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
