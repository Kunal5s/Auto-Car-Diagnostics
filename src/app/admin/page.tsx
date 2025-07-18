
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePenLine, PlusCircle, User, GalleryVertical, NotebookPen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AdminCard = ({ icon: Icon, title, description, buttonText, href, disabled = false }: { icon: React.ElementType, title: string, description: string, buttonText: string, href: string, disabled?: boolean }) => {
  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="bg-muted p-3 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button asChild className="w-full" disabled={disabled}>
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto py-8 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome! Manage your content from here.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminCard
            icon={PlusCircle}
            title="Create with AI"
            description="Generate a new SEO-friendly article with AI assistance."
            buttonText="Generate Article"
            href="/admin/publish"
          />
          <AdminCard
            icon={FilePenLine}
            title="Manual Publish"
            description="Write, format, and publish your own articles from scratch."
            buttonText="Write Manually"
            href="/admin/publish"
          />
          <AdminCard
            icon={GalleryVertical}
            title="Create Web Story"
            description="Build and publish engaging, tappable Web Stories for Google."
            buttonText="Build Story"
            href="#"
            disabled={true}
          />
          <AdminCard
            icon={NotebookPen}
            title="Manage Articles"
            description="Find, modify, and manage all previously published articles."
            buttonText="Manage Content"
            href="/admin/manage"
          />
          <AdminCard
            icon={User}
            title="Manage Author"
            description="Update the author's public photo, name, title, and bio."
            buttonText="Update Author Info"
            href="/admin/author"
          />
        </div>
      </div>
    </div>
  );
}
