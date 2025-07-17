
"use client";

import Link from "next/link";
import { User, Car, ShieldCheck, Cog, Signal, AlertTriangle, AppWindow, Wrench, Fuel, BatteryCharging, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const categoryIcons = {
  Engine: Cog,
  Sensors: Signal,
  OBD2: 'Obd2Icon', // Special case handled in JSX
  Alerts: AlertTriangle,
  Apps: AppWindow,
  Maintenance: Wrench,
  Fuel: Fuel,
  EVs: BatteryCharging,
  Trends: TrendingUp,
};

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Button asChild variant="ghost">
            <Link href="/admin">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </div>
      <div className="w-full border-t border-border/40">
        <div className="container px-0">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 p-4 lg:justify-center lg:space-x-8 lg:w-full">
              {categories.map((category) => (
                <Button key={category.name} variant="ghost" className="h-auto p-1 text-muted-foreground hover:text-accent-foreground">
                  {category.name}
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
