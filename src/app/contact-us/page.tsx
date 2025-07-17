"use client";

import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactUsPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="bg-muted py-20 text-center text-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
              Contact Us
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              We're here to help. Whether you have a question, feedback, or a partnership inquiry, please reach out.
            </p>
          </div>
        </div>

        <div className="container py-16 md:py-24">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="prose prose-lg max-w-none prose-headings:font-headline prose-p:font-body">
              <h2>Get in Touch</h2>
              <p>
                Your feedback and questions are important to us. At Car Diagnostics BrainAi, we are constantly striving to improve our platform and provide the most accurate, helpful information possible. If you've encountered an issue, have a suggestion for a new feature, or need clarification on one of our articles, please don't hesitate to use the contact form. Our dedicated support team reviews every message and will do their best to respond in a timely manner.
              </p>
              <p>
                For partnership opportunities, media inquiries, or to learn more about how our AI-driven diagnostics can be integrated into your business, please contact us directly through the provided channels. We are open to collaborating with automotive businesses, educational institutions, and technology partners who share our vision of making car care more accessible and intelligent.
              </p>
              <div className="mt-8 space-y-4 not-prose">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 mr-4 text-primary" />
                  <a href="mailto:info@cardiagnosticsai.com" className="text-muted-foreground hover:text-primary">info@cardiagnosticsai.com</a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 mr-4 text-primary" />
                  <span className="text-muted-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 mr-4 text-primary" />
                  <span className="text-muted-foreground">San Francisco, CA</span>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we will get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" type="text" placeholder="e.g., Feedback on an article" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea id="message" placeholder="Please type your message here..." className="min-h-32" required />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
