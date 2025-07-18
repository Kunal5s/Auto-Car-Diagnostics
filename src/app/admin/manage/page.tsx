
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { getArticles, deleteArticle, updateArticle } from '@/lib/data';
import type { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, MoreHorizontal, Edit, Trash, Eye, EyeOff, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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


export default function ManageArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const fetchedArticles = await getArticles({ includeDrafts: true });
      setArticles(fetchedArticles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch articles." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    startTransition(async () => {
        try {
            await deleteArticle(articleToDelete.slug);
            toast({
                title: "Article Deleted",
                description: `"${articleToDelete.title}" has been successfully deleted.`,
            });
            fetchArticles(); // Refetch articles to update the list
        } catch (error) {
            console.error("Failed to delete article:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not delete the article.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        } finally {
            setArticleToDelete(null);
        }
    });
  };
  
  const togglePublishState = (article: Article) => {
    startTransition(async () => {
      try {
        const newStatus = article.status === 'published' ? 'draft' : 'published';
        
        await updateArticle(article.slug, { status: newStatus });
        
        toast({
          title: `Article ${newStatus === 'published' ? 'Published' : 'Unpublished'}`,
          description: `"${article.title}" is now a ${newStatus}.`
        });
        
        fetchArticles();

      } catch (error) {
        console.error("Failed to update article status:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not update the article status.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      }
    });
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-6">
            <Button variant="ghost" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <ArticlesSkeleton /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={cn(isPending && "opacity-50 pointer-events-none")}>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                       <TableCell>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(article.publishedAt), "MMM d, yyyy 'at' h:mm a")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/edit/${article.slug}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePublishState(article)}>
                              {article.status === 'published' ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                             <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(article)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
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
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
