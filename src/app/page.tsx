
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { Hero } from "@/components/home/hero";
import { QuestionSubmission } from "@/components/home/question-submission";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { ArticleCategories } from "@/components/home/article-categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { HomePageContent } from "@/components/home/home-page-content";

function ToolsCta() {
    return (
        <section className="py-12 text-center">
            <div className="bg-muted p-8 rounded-lg">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                    Explore Our Diagnostic Tools
                </h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Use our free interactive tools to quickly diagnose common car problems, from reading OBD2 codes to checking for recalls.
                </p>
                <Button asChild size="lg" className="mt-6">
                    <Link href="/tools">View Diagnostic Tools</Link>
                </Button>
            </div>
        </section>
    );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="container mx-auto px-4">
          <ArticleCategories />
          <ToolsCta />
          <HomePageContent />
          <QuestionSubmission />
        </div>
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
