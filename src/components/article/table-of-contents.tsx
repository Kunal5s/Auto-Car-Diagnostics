
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { List } from "lucide-react";

export interface TocEntry {
  id: string;
  title: string;
  level: number;
  number: string;
}

interface TableOfContentsProps {
  toc: TocEntry[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  if (toc.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        const offset = 100; // Offset for sticky header
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
  };

  return (
    <div className="mb-12">
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full border rounded-lg bg-card shadow-sm">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="px-6 py-4 text-lg font-bold font-headline hover:no-underline">
                    <div className="flex items-center gap-3">
                        <List className="h-5 w-5" />
                        Contents
                    </div>
                </AccordionTrigger>
                <AccordionContent className="border-t">
                    <ul className="py-4 pr-6 space-y-1">
                        {toc.map((entry) => (
                            <li key={entry.id} className="group">
                                <a 
                                  href={`#${entry.id}`} 
                                  onClick={(e) => handleLinkClick(e, entry.id)}
                                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                                  style={{ paddingLeft: `${(entry.level - 2) * 1.5 + 1.5}rem`}}
                                >
                                    <span className="flex-shrink-0 text-right text-xs font-mono bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground rounded-md w-10 px-2 py-1 transition-colors">
                                        {entry.number}
                                    </span>
                                    <span className="leading-snug">{entry.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
