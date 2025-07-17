
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Sparkles, Image as ImageIcon, Send, Loader2, Plus, Trash2 } from 'lucide-react';
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
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';

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
    const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [imageHint, setImageHint] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

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
                setKeyTakeaways(fetchedArticle.keyTakeaways || []);
                setImageUrl(fetchedArticle.imageUrl);
                setAltText(fetchedArticle.altText || '');
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

    const handleKeyTakeawayChange = (index: number, value: string) => {
        const newTakeaways = [...keyTakeaways];
        newTakeaways[index] = value;
        setKeyTakeaways(newTakeaways);
    };

    const addKeyTakeaway = () => {
        setKeyTakeaways([...keyTakeaways, '']);
    };

    const removeKeyTakeaway = (index: number) => {
        const newTakeaways = keyTakeaways.filter((_, i) => i !== index);
        setKeyTakeaways(newTakeaways);
    };

    const handleGenerateImage = async () => {
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter an article title to generate an image." });
            return;
        }
        setIsGeneratingImage(true);
        setImageUrl(''); // Clear previous image
        setAltText('');

        const prompt = `${title}, automotive ${category || 'repair'}, photorealistic, professional automotive photography, high detail`;
        const sanitizedPrompt = encodeURIComponent(prompt.trim().replace(/\s+/g, " "));
        const generatedUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?width=600&height=400&nofeed=true`;
        
        const img = new window.Image();
        img.src = generatedUrl;
        img.onload = async () => {
            setImageUrl(generatedUrl);
            setImageHint(title);
            toast({ title: "Image generated!", description: "Now generating SEO-friendly alt text..." });
            try {
                const altTextResponse = await generateAltText({ articleTitle: title });
                setAltText(altTextResponse.altText);
                toast({ title: "Alt text generated!", description: "The alt text has been automatically created and saved." });
            } catch (err) {
                 toast({ variant: "destructive", title: "Alt Text Generation Failed", description: "Could not generate alt text. You may need to write it manually." });
            } finally {
                setIsGeneratingImage(false);
            }
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
                keyTakeaways: keyTakeaways.filter(t => t.trim() !== ''),
                imageUrl,
                altText,
                imageHint,
            });
            toast({
                title: "Article Updated!",
                description: "Your changes have been saved.",
            });
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
    
    const handlePreview = () => {
        if (article) {
            window.open(`/article/${article.slug}`, '_blank');
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
                    
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Key Takeaways</Label>
                        <div className="space-y-2">
                            {keyTakeaways.map((takeaway, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`Takeaway #${index + 1}`}
                                        value={takeaway}
                                        onChange={(e) => handleKeyTakeawayChange(index, e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeKeyTakeaway(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addKeyTakeaway}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Takeaway
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Content</Label>
                        <div className="border rounded-md">
                            <RichTextToolbar textareaRef={contentTextareaRef} />
                            <Textarea 
                                ref={contentTextareaRef}
                                className="min-h-96 border-t-0 rounded-t-none" 
                                placeholder="Write the full content of your article here. You can use multiple paragraphs."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
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
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating image... <br/> Alt text will be generated next.</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || title} width={300} height={169} className="object-cover" data-ai-hint={imageHint || ''} />
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
                                <Button variant="ghost" className="w-full" onClick={handlePreview} disabled={!article}>
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
