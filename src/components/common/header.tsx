
"use client";

import Link from "next/link";
import { Car, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/config";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePathname } from 'next/navigation';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  const pathname = usePathname();

  // Don't render header on auth pages like sign-in, sign-up
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
      return null;
  }
  
  // A simplified header for the admin section
  if (pathname.startsWith('/admin')) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 max-w-screen-2xl items-center">
                 <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Car className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline">
                        <span className="hidden sm:inline-block">Car Diagnostics BrainAi</span>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link
                            href="/admin"
                            className="font-bold text-foreground transition-colors hover:text-foreground/80"
                        >
                           Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">
              <span className="sm:hidden">Car Diagnostics</span>
              <span className="hidden sm:inline-block">Car Diagnostics BrainAi</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="ghost">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
        </div>
      </div>
      <div className="w-full border-t">
        <div className="container px-0">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-4 lg:justify-center lg:space-x-4 lg:w-full">
              {categories.map((category) => (
                <Button key={category.name} variant="outline" size="sm" asChild>
                  <Link href={`/category/${category.name.toLowerCase().replace(/ /g, '-')}`}>{category.name}</Link>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </div>
    </header>
  );
}
