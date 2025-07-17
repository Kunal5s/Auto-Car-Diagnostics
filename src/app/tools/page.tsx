import Link from "next/link";
import { tools } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { ArrowUpRight } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-muted py-20 text-center text-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
              Car Diagnostics Tools
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              A collection of interactive tools to help you diagnose and understand your vehicle.
            </p>
          </div>
        </div>
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Card key={tool.slug} className="flex flex-col transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <tool.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-xl">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Link href={`/tools/${tool.slug}`} className="w-full inline-flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium">
                      Open Tool <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
