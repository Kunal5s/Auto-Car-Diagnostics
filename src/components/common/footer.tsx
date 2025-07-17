import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Mail, Phone, MapPin, Twitter, Linkedin, Heart } from "lucide-react";

function PinterestIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 12c0-2.3-1.4-4.2-3.3-4.2-.9 0-1.7.4-2.2.9.2-1 .6-2.3 1-3.2.5-1.1-1.3-1.2-1.8.3C5.5 7.4 5 9.4 5 10.9c0 3.3 2.1 6.1 5.1 6.1 2.1 0 3.1-1.7 2.8-3.4-.3-1.8-1-3.2-1-3.2s.7 1.4 1.4 2.3c.8 1 1.7 2 2.7 2 3.3 0 5.5-3.7 5.5-7.2 0-3.2-2-5.4-5.2-5.4-3.7 0-5.8 2.8-5.8 5.2 0 .9.3 1.8.8 2.3z" />
      </svg>
    )
  }

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="bg-[hsl(250_10%_8%)] py-12 text-center text-foreground">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Get Our Best Content Weekly
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join our newsletter for helpful maintenance advice and new article alerts.
          </p>
          <div className="mt-6 flex max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-r-none focus:ring-accent"
              aria-label="Email for newsletter"
            />
            <Button type="submit" className="rounded-l-none bg-accent text-accent-foreground hover:bg-accent/90">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
      <div className="container py-12 text-foreground">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-3 lg:col-span-2">
                <div className="flex items-center">
                    <Car className="h-8 w-8 mr-2 text-accent" />
                    <h3 className="text-xl font-bold font-headline">Car Diagnostics BrainAi</h3>
                </div>
                <p className="text-muted-foreground max-w-sm">
                Your ultimate destination for AI-powered car diagnostics, maintenance tips, and automotive technology insights. Stay ahead with expert-curated content and cutting-edge diagnostic solutions.
                </p>
                <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-accent"><Twitter /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-accent"><PinterestIcon /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-accent"><Linkedin /></Link>
                </div>
            </div>
            <div>
                <h4 className="font-bold tracking-wide text-muted-foreground mb-4">QUICK LINKS</h4>
                <ul className="space-y-2">
                    <li><Link href="/about-us" className="text-muted-foreground hover:text-accent hover:underline">About Us</Link></li>
                    <li><Link href="/contact-us" className="text-muted-foreground hover:text-accent hover:underline">Contact Us</Link></li>
                    <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-accent hover:underline">Privacy Policy</Link></li>
                    <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-accent hover:underline">Terms of Service</Link></li>
                    <li><Link href="/disclaimer" className="text-muted-foreground hover:text-accent hover:underline">Disclaimer</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold tracking-wide text-muted-foreground mb-4">CONTACT INFO</h4>
                <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-accent" />
                        <span>info@cardiagnosticsai.com</span>
                    </li>
                    <li className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-accent" />
                        <span>+1 (555) 123-4567</span>
                    </li>
                    <li className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-accent" />
                        <span>San Francisco, CA</span>
                    </li>
                </ul>
            </div>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Car Diagnostics BrainAi. All rights reserved.
          </p>
          <p className="flex items-center text-sm text-muted-foreground mt-2 sm:mt-0">
            Made with <Heart className="h-4 w-4 mx-1.5 text-red-500 fill-current" /> for automotive enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
}
