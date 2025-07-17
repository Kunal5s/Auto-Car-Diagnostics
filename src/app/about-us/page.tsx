import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import Image from "next/image";
import { Users, Target, Car } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-muted py-20 text-center text-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
              About Car Diagnostics BrainAi
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Empowering car owners and enthusiasts with intelligent, reliable, and accessible automotive knowledge.
            </p>
          </div>
        </div>

        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none prose-headings:font-headline prose-p:font-body prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <p>
                Welcome to Car Diagnostics BrainAi, your premier online destination for cutting-edge automotive diagnostics and repair information. Our journey began with a simple yet powerful observation: while modern vehicles have become incredibly complex, the resources available to understand and repair them have struggled to keep pace. The average car owner often feels overwhelmed by technical jargon and intimidated by the "check engine" light. We set out to change that by building a smarter, more intuitive platform that demystifies car care.
              </p>
              
              <div className="relative aspect-[16/9] my-12 rounded-lg overflow-hidden">
                <Image 
                  src="https://placehold.co/800x450.png"
                  alt="Team working on automotive technology"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="automotive technology team"
                />
              </div>

              <p>
                At our core, we are a team of automotive experts, software engineers, and AI specialists united by a passion for technology and a love for cars. We believe that everyone deserves to feel confident about their vehicle's health. Traditional repair manuals are often dense and written for seasoned professionals, while online forums can be a minefield of conflicting and sometimes incorrect advice. Car Diagnostics BrainAi bridges this gap by combining expert-verified knowledge with the power of artificial intelligence to provide clear, accurate, and actionable insights.
              </p>

              <div className="grid md:grid-cols-3 gap-8 my-16 text-center">
                <div className="flex flex-col items-center p-6 border rounded-lg border-border bg-card">
                  <Car className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-2xl font-headline mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">To make automotive knowledge accessible to everyone, from DIY novices to professional mechanics, through an intelligent, user-friendly platform.</p>
                </div>
                <div className="flex flex-col items-center p-6 border rounded-lg border-border bg-card">
                  <Target className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-2xl font-headline mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">To be the most trusted and indispensable resource for vehicle diagnostics and repair, reducing repair costs and empowering car owners worldwide.</p>
                </div>
                <div className="flex flex-col items-center p-6 border rounded-lg border-border bg-card">
                  <Users className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-2xl font-headline mb-2">Our Values</h3>
                  <p className="text-muted-foreground">We are committed to accuracy, clarity, and innovation. We prioritize our users' needs and strive to build a community founded on trust and shared knowledge.</p>
                </div>
              </div>

              <p>
                Our platform is more than just a collection of articles. It's a dynamic, learning system. The "BrainAi" in our name represents the sophisticated AI engine at the heart of our service. It analyzes vast amounts of data—from technical service bulletins and manufacturer specifications to real-world repair cases—to provide context-aware diagnostics. When you use our AI summary tool, you're tapping into this powerful system to get the most relevant information quickly. We are continuously refining our algorithms and expanding our database to ensure that Car Diagnostics BrainAi remains at the forefront of automotive technology, helping you solve problems faster and more effectively. Thank you for trusting us with your automotive needs.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
