
"use client";

import Link from "next/link";
import { Car, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/config";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

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
                </div>
            </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">
              <span className="sm:hidden">Car Diagnostics</span>
              <span className="hidden sm:inline-block">Car Diagnostics BrainAi</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
            <Button asChild>
                <Link href="/admin">
                    <LogIn className="mr-2 h-4 w-4"/>
                    Admin
                </Link>
            </Button>
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
