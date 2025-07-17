
"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "John D.",
    text: "Finally, a car website that actually helps. The guides are clear, concise, and easy to follow. I fixed a sensor issue myself and saved a ton!",
  },
  {
    name: "Sarah K.",
    text: "As someone who knows nothing about cars, this site is a lifesaver. The AI summaries are brilliant for getting a quick overview before diving in.",
  },
  {
    name: "Mike T.",
    text: "Incredibly well-written content without the usual fluff. The OBD2 code explanations are the best I've found online. Highly recommended.",
  },
];

export function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 bg-foreground text-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              What Our Readers Say
            </h2>
            <p className="max-w-[900px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Real feedback from people we've helped.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background/10 border-border/20 text-foreground">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
