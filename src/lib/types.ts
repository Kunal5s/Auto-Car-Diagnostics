import type { LucideIcon } from "lucide-react";

export interface Article {
  id: string; // Unique identifier
  slug: string;
  title: string;
  content: string;
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
