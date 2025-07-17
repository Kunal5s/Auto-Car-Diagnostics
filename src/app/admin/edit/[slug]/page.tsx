
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Sparkles, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categories, getArticleBySlug, updateArticle } from '@/lib/data';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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
                    <Skeleton className="h-32 w-full" />
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


export default function EditArticlePage({ params }: { params: { slug: string }}) {
    const router = useRouter();
    const { toast } = useToast();
    const { slug } = params;
    
    const [article, setArticle] = useState<Article | null>(null);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageHint, setImageHint] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const loadArticle = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedArticle = await getArticleBySlug(slug);
            if (fetchedArticle) {
                setArticle(fetchedArticle);
                setTitle(fetchedArticle.title);
                setSummary(fetchedArticle.summary);
                setContent(fetchedArticle.content);
                setCategory(fetchedArticle.category);
                setImageUrl(fetchedArticle.imageUrl);
                setImageHint(fetchedArticle.imageHint);
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
        if (slug) {
            loadArticle();
        }
    }, [slug, loadArticle]);

    const handleGenerateImage = async () => {
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter an article title to generate an image." });
            return;
        }
        setIsGeneratingImage(true);
        setImageUrl(''); // Clear previous image

        // Sanitize the prompt for the URL
        const sanitizedPrompt = encodeURIComponent(
            `${title}, automotive ${category || 'repair'}`.trim().replace(/\s+/g, " ")
        );
        const generatedUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}`;
        
        // We can "preload" the image to show a loading state, though it's often fast
        const img = new window.Image();
        img.src = generatedUrl;
        img.onload = () => {
            setImageUrl(generatedUrl);
            setImageHint(title);
            setIsGeneratingImage(false);
        };
        img.onerror = () => {
            toast({ variant: "destructive", title: "Image Generation Failed", description: "Could not load the image from Pollinations.ai." });
            setIsGeneratingImage(false);
        }
    }

    const handleUpdate = async () => {
        if (!title || !summary || !content || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill in all fields and ensure there is a featured image.",
            });
            return;
        }

        setIsUpdating(true);
        try {
            await updateArticle(slug, {
                title,
                summary,
                content,
                category,
                imageUrl,
                imageHint,
                // Slug cannot be changed from the edit page for simplicity
            });
            toast({
                title: "Article Updated!",
                description: "Your changes have been saved.",
            });
            router.push('/admin');
        } catch(error) {
            console.error("Failed to update article", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "There was an error saving your changes.",
            });
        } finally {
            setIsUpdating(false);
        }
    }

    if (isLoading) {
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
                        <Label htmlFor="article-title" className="text-lg font-semibold">Article Title</Label>
                        <Input 
                            id="article-title" 
                            placeholder="Your engaging article title..." 
                            className="text-lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Summary</Label>
                         <Textarea 
                            className="min-h-32"
                            placeholder="A brief summary of the article..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                         />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Content</Label>
                        <Textarea 
                            className="min-h-96" 
                            placeholder="Write the full content of your article here. You can use multiple paragraphs."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
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
                                <Select onValueChange={setCategory} value={category}>
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
                            
                            <div className="space-y-2">
                                <Label>Featured Image</Label>
                                <div className="aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted/50 overflow-hidden">
                                    {isGeneratingImage ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating...</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt="Generated featured image" width={300} height={169} className="object-cover" data-ai-hint={imageHint || ''} />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mt-2 text-center px-4">Enter a title and click below to generate an image.</p>
                                        </>
                                    )}
                                </div>
                                 <Button variant="outline" className="w-full" onClick={handleGenerateImage} disabled={isGeneratingImage || !title}>
                                    {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate New Image
                                </Button>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handleUpdate} disabled={isUpdating || isGeneratingImage}>
                                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                                <Button variant="ghost" className="w-full" disabled>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
