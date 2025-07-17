"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticles, deleteArticle } from '@/lib/data';
import type { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

function ArticlesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}


export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadArticles() {
      try {
        const fetchedArticles = await getArticles();
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch articles." });
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, [toast]);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await deleteArticle(articleToDelete.slug);
      setArticles(articles.filter((article) => article.slug !== articleToDelete.slug));
      toast({
        title: "Article Deleted",
        description: `"${articleToDelete.title}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the article." });
    } finally {
      setArticleToDelete(null);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <Button asChild>
            <Link href="/admin/publish">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Article
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Published Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <ArticlesSkeleton /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.slug}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                            <DropdownMenuItem disabled>Unpublish</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(article)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article
              <span className="font-bold"> "{articleToDelete?.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setArticleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
