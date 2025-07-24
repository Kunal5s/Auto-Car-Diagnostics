
"use client";

import React, { useState, useEffect, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Send, Loader2, ImagePlus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getArticleBySlug, updateArticle } from '@/lib/data';
import { categories } from '@/lib/config';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { generateAltText } from '@/ai/flows/generate-alt-text';

function EditArticleSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="aspect-video w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2 pt-4 border-t">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { toast } = useToast();
    const { slug } = use(params);
    
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    const loadArticle = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedArticle = await getArticleBySlug(slug, { includeDrafts: true });
            if (fetchedArticle) {
                setArticle(fetchedArticle);
                if (contentRef.current) {
                  contentRef.current.innerHTML = fetchedArticle.content;
                }
            } else {
                toast({ variant: "destructive", title: "Error", description: "Article not found." });
                router.push('/admin');
            }
        } catch (error) {
            console.error("Failed to fetch article:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch the article data." });
        } finally {
            setIsLoading(false);
        }
    }, [slug, router, toast]);

    useEffect(() => {
        loadArticle();
    }, [loadArticle]);
    
    const handleStateChange = <K extends keyof Article>(key: K, value: Article[K]) => {
        setArticle(prev => prev ? ({ ...prev, [key]: value }) : null);
    };

    const handleContentChange = useCallback(() => {
        if (contentRef.current && article) {
            handleStateChange('content', contentRef.current.innerHTML);
        }
    }, [article]);
    
    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        const html = text
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
          .replace(/\*(.*?)\*/g, '<i>$1</i>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
          .replace(/\n/g, '<br />');
        document.execCommand('insertHTML', false, html);
        handleContentChange();
    };

    const handleGenerateFeaturedImage = async () => {
        if (!article || !article.title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter a title to generate a relevant image."});
            return;
        }
        setIsGeneratingImage(true);
        try {
            const finalImageUrl = `https://placehold.co/600x400.png`;
            handleStateChange('imageUrl', finalImageUrl);
            
            const { altText: generatedAltText } = await generateAltText({ articleTitle: article.title });
            handleStateChange('altText', generatedAltText);
            
            toast({ title: "Featured Image Generated", description: "A new placeholder image and alt text have been created." });

        } catch (error) {
            console.error("Failed to generate featured image:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: errorMessage });
        } finally {
            setIsGeneratingImage(false);
        }
    };

    useEffect(() => {
        const editor = contentRef.current;
        if (!editor) return;

        const observer = new MutationObserver(() => {
            handleContentChange();
        });

        observer.observe(editor, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }, [handleContentChange]);

    const handleUpdate = async (): Promise<void> => {
        if (!article) return;
        
        const currentContent = contentRef.current?.innerHTML || article.content;
        const { title, category, imageUrl } = article;

        if (!title || !currentContent || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill in all fields and ensure there is a featured image.",
            });
            return;
        }

        setIsUpdating(true);
        try {
            const articleToUpdate: Partial<Omit<Article, 'id' | 'slug'>> = {
                title,
                content: currentContent,
                category,
                imageUrl,
                altText: article.altText,
                imageHint: article.imageHint,
            };

            await updateArticle(slug, articleToUpdate);
            toast({
                title: "Article Updated!",
                description: "Your changes have been saved.",
            });
        } catch(error) {
            console.error("Failed to update article", error);
            const errorMessage = error instanceof Error ? error.message : "There was an error saving your changes.";
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
        } finally {
            setIsUpdating(false);
        }
    }

    if (isLoading || !article) {
        return (
             <div className="container mx-auto py-8">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/admin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <EditArticleSkeleton />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Edit Article</h1>
                        <p className="text-muted-foreground">Make changes to your article below.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="article-title">Article Title</Label>
                        <Input 
                            id="article-title" 
                            placeholder="Your engaging article title..." 
                            value={article.title}
                            onChange={(e) => handleStateChange('title', e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <div
                            ref={contentRef}
                            id="content-editor"
                            contentEditable
                            onInput={handleContentChange}
                            onPaste={handlePaste}
                            dangerouslySetInnerHTML={{ __html: article.content }}
                            className={cn(
                                'prose prose-lg max-w-none min-h-96 w-full rounded-md rounded-t-none border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                '[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl'
                            )}
                        />
                    </div>
                </div>

                {/* Publishing Tools Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle>Publishing Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={(value) => handleStateChange('category', value)} value={article.category}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.name} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-4">
                                <Label>Featured Image</Label>
                                <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
                                     {isGeneratingImage ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-muted-foreground text-sm">Generating...</p>
                                        </div>
                                    ) : article.imageUrl ? (
                                        <Image src={article.imageUrl} alt={article.altText || article.title} width={600} height={400} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <ImagePlus className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-sm">Generate an image.</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                     <Button className="flex-1" onClick={handleGenerateFeaturedImage} disabled={isGeneratingImage || !article.title}>
                                        {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                        Generate
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handleUpdate} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
