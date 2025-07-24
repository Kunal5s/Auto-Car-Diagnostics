
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getArticles, deleteArticle, updateArticle } from '@/lib/data';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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
import { Skeleton } from '@/components/ui/skeleton';

function AdminDashboardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function AdminDashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const { toast } = useToast();

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        try {
            const allArticles = await getArticles({ includeDrafts: true });
            setArticles(allArticles);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch articles." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const handleDeleteClick = (article: Article) => {
        setArticleToDelete(article);
        setDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;

        setIsDeleting(articleToDelete.slug);
        try {
            await deleteArticle(articleToDelete.slug);
            toast({ title: "Success", description: "Article deleted successfully." });
            setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
        } catch (error) {
            console.error("Failed to delete article:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete the article." });
        } finally {
            setIsDeleting(null);
            setArticleToDelete(null);
            setDialogOpen(false);
        }
    };
    
    const handleToggleStatus = async (article: Article) => {
        setIsToggling(article.id);
        const newStatus = article.status === 'published' ? 'draft' : 'published';
        try {
            await updateArticle(article.slug, { status: newStatus });
            toast({ title: "Success", description: `Article status changed to ${newStatus}.` });
            loadArticles(); // Reload to get updated article list
        } catch (error) {
            console.error("Failed to toggle status:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update article status." });
        } finally {
            setIsToggling(null);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the article
                            <span className="font-bold"> "{articleToDelete?.title}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
                <AdminDashboardSkeleton />
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="font-headline text-3xl">Admin Dashboard</CardTitle>
                                <CardDescription>Manage your articles here. You can create, edit, and delete posts.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/publish">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Article
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Published Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {articles.length > 0 ? articles.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">{article.title}</TableCell>
                                        <TableCell>{article.category}</TableCell>
                                        <TableCell>
                                            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                                {article.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(article)} disabled={isToggling === article.id}>
                                                    {isToggling === article.id ? <Loader2 className="h-4 w-4 animate-spin"/> : (article.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/edit/${article.slug}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(article)} disabled={isDeleting === article.slug}>
                                                    {isDeleting === article.slug ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No articles found. Start by creating one!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
