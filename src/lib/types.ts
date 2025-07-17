import type { LucideIcon } from "lucide-react";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  status: 'published' | 'draft';
  publishedAt: string;
}

export interface Category {
  name: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}
