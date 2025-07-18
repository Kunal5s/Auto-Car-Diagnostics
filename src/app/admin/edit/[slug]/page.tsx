
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Sparkles, Image as ImageIcon, Send, Loader2, Plus, Trash2, Upload, FileText, RefreshCcw } from 'lucide-react';
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
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';
import { generatePollinationsImage } from '@/ai/flows/generate-pollinations-image';
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { cn } from '@/lib/utils';
import { generateArticleImages } from '@/ai/flows/generate-article-images';
import { Badge } from '@/components/ui/badge';

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
    
    const [bodyImageCount, setBodyImageCount] = useState(3);
    const [wordCount, setWordCount] = useState(0);
    const [imageSuggestion, setImageSuggestion] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingBodyImages, setIsGeneratingBodyImages] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    const loadArticle = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedArticle = await getArticleBySlug(slug, { includeDrafts: true });
            if (fetchedArticle) {
                setArticle(fetchedArticle);
                if (summaryRef.current) summaryRef.current.innerHTML = fetchedArticle.summary;
                if (contentRef.current) contentRef.current.innerHTML = fetchedArticle.content;
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
    
    const handleStateChange = <K extends keyof Article>(key: K, value: Article[K]) => {
        if (!article) return;
        setArticle(prev => prev ? ({ ...prev, [key]: value }) : null);
    };

    const handleGenerateFeaturedImage = useCallback(async () => {
        if (!article || !article.title || isGenerating) return;
        
        setIsGenerating(true);
        try {
            const [altResult, imgResult] = await Promise.all([
                generateAltText({ articleTitle: article.title }),
                generatePollinationsImage({ prompt: `Photorealistic image for an article titled: ${article.title}` }),
            ]);
            
            setArticle(prev => prev ? ({
                ...prev,
                imageUrl: imgResult.imageUrl,
                altText: altResult.altText,
                imageHint: prev.title.split(' ').slice(0, 2).join(' ')
            }) : null);

        } catch (err) {
            console.error(`Image Generation Failed:`, err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Image Generation Failed",
                description: `An error occurred while generating the featured image. Please try again. ${errorMessage}`,
            });
        } finally {
            setIsGenerating(false);
        }
    }, [article, isGenerating, toast]);

    const handleContentChange = useCallback(() => {
        if (!article) return;
        if (contentRef.current) {
            handleStateChange('content', contentRef.current.innerHTML);
        }
        if(summaryRef.current) {
            handleStateChange('summary', summaryRef.current.innerHTML);
        }
    }, [article]);


    const handleExecCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleContentChange();
    };
    
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

    const handleKeyTakeawayChange = (index: number, value: string) => {
        if (!article) return;
        const newTakeaways = [...article.keyTakeaways];
        newTakeaways[index] = value;
        handleStateChange('keyTakeaways', newTakeaways);
    };

    const addKeyTakeaway = () => {
        if (!article) return;
        handleStateChange('keyTakeaways', [...article.keyTakeaways, '']);
    };

    const removeKeyTakeaway = (index: number) => {
        if (!article) return;
        const newTakeaways = article.keyTakeaways.filter((_, i) => i !== index);
        handleStateChange('keyTakeaways', newTakeaways);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean = false) => {
        if (!article) return;
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 2MB." });
                return;
            }
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a PNG, JPG, or WEBP file." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                if (isFeatured) {
                    handleStateChange('imageUrl', dataUrl);
                } else {
                    const imgHtml = `<div style="display: flex; justify-content: center; margin: 1rem 0;"><img src="${dataUrl}" alt="${article.title || 'Uploaded image'}" style="max-width: 100%; border-radius: 0.5rem;" /></div>`;
                    document.execCommand('insertHTML', false, imgHtml);
                    handleContentChange();
                    toast({ title: "Image inserted into content." });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateWordCount = useCallback(() => {
        if (contentRef.current) {
            const text = contentRef.current.innerText || "";
            const count = text.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(count);
        }
    }, []);

    const setupContentObserver = useCallback(() => {
        const editor = contentRef.current;
        if (!editor) return;

        const observer = new MutationObserver(() => {
            handleContentChange();
            calculateWordCount();
        });

        observer.observe(editor, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return observer;
    }, [handleContentChange, calculateWordCount]);

    useEffect(() => {
        if (!isLoading) {
             const observer = setupContentObserver();
             return () => observer?.disconnect();
        }
    }, [isLoading, setupContentObserver]);


    const analyzeContentForImages = () => {
        const words = wordCount;
        let suggestion = "No suggestion available.";
        if (words > 0) {
            const suggestedCount = Math.max(1, Math.round(words / 250));
            suggestion = `For a ${words}-word article, we suggest ${suggestedCount}-${suggestedCount + 1} images for better engagement.`;
        }
        setImageSuggestion(suggestion);
    };

    const handleGenerateBodyImages = async () => {
        if (!article || !article.content || !article.title) {
            toast({ variant: "destructive", title: "Content and Title are required", description: "Please write the article content and title before generating images." });
            return;
        }
        setIsGeneratingBodyImages(true);
        
        try {
            const result = await generateArticleImages({ 
                articleContent: article.content, 
                articleTitle: article.title,
                category: article.category,
                imageCount: bodyImageCount 
            });

            if (!result.placements || result.placements.length === 0) {
                throw new Error("AI could not determine where to place images.");
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(article.content, 'text/html');
            let imagesInserted = 0;

            for (const placement of result.placements) {
                const { imageUrl, subheading } = placement;
                const h2s = Array.from(doc.querySelectorAll('h2'));
                const targetH2 = h2s.find(h => h.textContent?.trim() === subheading.trim());

                if (targetH2) {
                    const imageAlt = `${article.title} - ${subheading}`;
                    const imageDiv = doc.createElement('div');
                    imageDiv.setAttribute('style', 'display: flex; justify-content: center; margin: 1rem 0;');
                    imageDiv.innerHTML = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; border-radius: 0.5rem;" />`;
                    
                    targetH2.parentNode?.insertBefore(imageDiv, targetH2.nextSibling);
                    imagesInserted++;
                }
            }
            
            const newContent = doc.body.innerHTML;
            if (contentRef.current) contentRef.current.innerHTML = newContent;
            handleStateChange('content', newContent);
            toast({ title: "Images Inserted!", description: `${imagesInserted} images have been generated and placed in the article.` });

        } catch (error) {
            console.error("Failed to generate body images:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate or insert body images.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: errorMessage });
        } finally {
            setIsGeneratingBodyImages(false);
        }
    }
    
    const handleResetBodyImages = () => {
        if (contentRef.current) {
            const newContent = contentRef.current.innerHTML.replace(/<div style="display: flex; justify-content: center; margin: 1rem 0;"><img src="https:\/\/placehold\.co\/[^>]*><\/div>/g, '');
            contentRef.current.innerHTML = newContent;
            handleStateChange('content', newContent);
            toast({ title: "Images Reset", description: "All AI-generated body images have been removed from the content." });
        }
    };

    const handleUpdate = async () => {
        if (!article) return false;
        
        const { title, summary, content, category, imageUrl, keyTakeaways } = article;

        if (!title || !summary || !content || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill in all fields and ensure there is a featured image.",
            });
            return false;
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
                altText: article.altText,
                imageHint: article.imageHint,
            });
            toast({
                title: "Article Updated!",
                description: "Your changes have been saved.",
            });
            return true;
        } catch(error) {
            console.error("Failed to update article", error);
            const errorMessage = error instanceof Error ? error.message : "There was an error saving your changes.";
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
            return false;
        } finally {
            setIsUpdating(false);
        }
    }
    
    const handlePreview = async () => {
        if (article) {
            const success = await handleUpdate();
            if (success) {
                window.open(`/api/draft?slug=${article.slug}&secret=${process.env.NEXT_PUBLIC_DRAFT_MODE_SECRET || ''}`, '_blank');
            }
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
                        <Label>Summary</Label>
                        <RichTextToolbar onExecCommand={handleExecCommand} onImageUpload={(e) => handleImageUpload(e, false)} />
                        <div
                            ref={summaryRef}
                            id="summary-editor"
                            contentEditable
                            onInput={handleContentChange}
                            onPaste={handlePaste}
                            dangerouslySetInnerHTML={{ __html: article.summary }}
                             className={cn(
                                'prose max-w-none min-h-32 w-full rounded-md rounded-t-none border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                '[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg'
                            )}
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <Label>Key Takeaways</Label>
                        <div className="space-y-2">
                            {article.keyTakeaways.map((takeaway, index) => (
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
                        <Label>Content</Label>
                        <RichTextToolbar onExecCommand={handleExecCommand} onImageUpload={(e) => handleImageUpload(e, false)} />
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
                                <div className="aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted/50 overflow-hidden">
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating...</p>
                                        </div>
                                    ) : article.imageUrl ? (
                                        <Image src={article.imageUrl} alt={article.altText || article.title} width={600} height={400} className="object-cover w-full h-full" data-ai-hint={article.imageHint || ''} />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mt-2 text-center px-4">Generate an image or upload one.</p>
                                        </>
                                    )}
                                </div>
                                <Button onClick={handleGenerateFeaturedImage} disabled={!!isGenerating || !article.title} className="w-full">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Image
                                </Button>
                                <div className="flex gap-2">
                                     <Button asChild variant="outline" className="flex-1">
                                        <label htmlFor="featured-image-upload">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                            <input type="file" id="featured-image-upload" accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={(e) => handleImageUpload(e, true)} />
                                        </label>
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => handleStateChange('imageUrl', '')}>
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alt-text">Alt Text (for SEO)</Label>
                                    <Input
                                        id="alt-text"
                                        placeholder="Descriptive alt text for the image..."
                                        value={article.altText}
                                        onChange={(e) => handleStateChange('altText', e.target.value)}
                                        disabled={!!isGenerating}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <Label>Body Images &amp; Word Count</Label>
                                    <Badge variant="outline">{wordCount} words</Badge>
                                </div>
                                <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                                    {imageSuggestion || 'Click "Analyze" for an image recommendation.'}
                                </div>
                                <Button variant="secondary" size="sm" className="w-full" onClick={analyzeContentForImages}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Analyze Content
                                </Button>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            onValueChange={(value) => setBodyImageCount(Number(value))}
                                            defaultValue={String(bodyImageCount)}
                                        >
                                            <SelectTrigger className="w-24">
                                                <SelectValue placeholder="Count" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                                                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" className="flex-1" onClick={handleGenerateBodyImages} disabled={isGeneratingBodyImages || !article.content || !article.title}>
                                            {isGeneratingBodyImages ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Generate &amp; Insert
                                        </Button>
                                    </div>
                                    <Button variant="destructive" size="sm" className="w-full" onClick={handleResetBodyImages}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Reset Body Images
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handleUpdate} disabled={isUpdating || !!isGenerating || isGeneratingBodyImages}>
                                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={handlePreview} disabled={isUpdating || !article}>
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
