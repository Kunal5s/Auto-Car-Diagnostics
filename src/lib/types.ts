import type { LucideIcon } from "lucide-react";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  keyTakeaways: string[];
  imageUrl: string;
  altText: string;
  imageHint: string;
  category: string;
  status: 'published' | 'draft';
  publishedAt: string;
}

export interface Category {
  name: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}

export interface Author {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Tool {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
}
