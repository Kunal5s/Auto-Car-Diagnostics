"use client";

import Link from "next/link";
import { User, Car, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Car className="h-6 w-6 text-accent" />
            <span className="font-bold font-headline sm:inline-block">
              Car Diagnostics BrainAi
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button asChild variant="ghost" size="icon">
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">
              <User className="mr-2 h-4 w-4" />
              Admin Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
