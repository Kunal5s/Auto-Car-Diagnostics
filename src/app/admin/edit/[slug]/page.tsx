
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
import { getArticleBySlug, updateArticle } from '@/lib/data';
import { categories } from '@/lib/config';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { generateArticleImages } from '@/ai/flows/generate-article-images';
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';
import { generateImage } from '@/ai/flows/generate-image';
import { useDebounce } from '@/hooks/use-debounce';

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
    const [bodyImageCount, setBodyImageCount] = useState(3);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingFeaturedImage, setIsGeneratingFeaturedImage] = useState(false);
    const [isGeneratingBodyImages, setIsGeneratingBodyImages] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const contentRef = useRef<HTMLTextAreaElement>(null);
    const debouncedTitle = useDebounce(title, 1500);

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

    const handleGenerateFeaturedImage = useCallback(async (titleToGenerate: string) => {
        if (!titleToGenerate || isGeneratingFeaturedImage || imageUrl) {
            return;
        }
        
        setIsGeneratingFeaturedImage(true);
        setAltText('');

        try {
            const prompt = `${titleToGenerate}, automotive ${category || 'repair'}`;
            const result = await generateImage({ prompt });
            setImageUrl(result.imageUrl);
            setImageHint(titleToGenerate);
            toast({ title: "Image generated!", description: "Now generating SEO-friendly alt text..." });
            
            const altTextResponse = await generateAltText({ articleTitle: titleToGenerate });
            setAltText(altTextResponse.altText);
            toast({ title: "Alt text generated!", description: "The alt text has been automatically created." });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: `Could not generate image or alt text. ${errorMessage}` });
        } finally {
            setIsGeneratingFeaturedImage(false);
        }
    }, [category, isGeneratingFeaturedImage, imageUrl, toast]);
    
    useEffect(() => {
        if (debouncedTitle && article && debouncedTitle !== article.title) {
            handleGenerateFeaturedImage(debouncedTitle);
        }
    }, [debouncedTitle, article, handleGenerateFeaturedImage]);


    const handleGenerateBodyImages = async () => {
        if (!content || !title) {
            toast({ variant: "destructive", title: "Content and Title are required", description: "Please write the article content and title before generating images." });
            return;
        }
        setIsGeneratingBodyImages(true);
        
        try {
            const result = await generateArticleImages({ 
                articleContent: content, 
                articleTitle: title,
                category: category,
                imageCount: bodyImageCount 
            });

            const { imageUrls } = result;
            if (!imageUrls || imageUrls.length === 0) {
                throw new Error("No images were generated.");
            }

            let newContent = content;
            for (const generatedImageUrl of imageUrls) {
                const imageAlt = `${title} - illustration`;
                newContent += `\n\n<img src="${generatedImageUrl}" alt="${imageAlt}" class="my-8 rounded-lg" data-ai-hint="${title} ${category}" />`;
            }

            setContent(newContent.trim());
            toast({ title: "Images Appended!", description: `${imageUrls.length} images have been generated and added to the end of the article.` });

        } catch (error) {
            console.error("Failed to generate body images:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate or insert body images.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: errorMessage });
        } finally {
            setIsGeneratingBodyImages(false);
        }
    }
    
    const handleResetBodyImages = () => {
        const newContent = content.replace(/<img[^>]*>\n\n?/g, '');
        setContent(newContent);
        toast({ title: "Images Reset", description: "All body images have been removed from the content." });
    };

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
                        <Label htmlFor="article-title">Article Title</Label>
                        <Input 
                            id="article-title" 
                            placeholder="Your engaging article title..." 
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                // If title is changed, clear old image to allow regeneration
                                if(e.target.value !== (article?.title || '')) {
                                    setImageUrl('');
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Summary</Label>
                         <Textarea 
                            className="min-h-32"
                            placeholder="A brief summary of the article..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                         />
                    </div>
                    
                    <div className="space-y-4">
                        <Label>Key Takeaways</Label>
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
                        <Label>Content</Label>
                        <RichTextToolbar content={content} onContentChange={setContent} />
                        <Textarea 
                            ref={contentRef}
                            className="min-h-96 rounded-t-none" 
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
                                    {isGeneratingFeaturedImage ? (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating image... <br/> Alt text will be generated next.</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || title} width={300} height={169} className="object-cover w-full h-full" data-ai-hint={imageHint || ''} />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mt-2 text-center px-4">Finish typing a title to automatically generate an image.</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label>Generate Body Images</Label>
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
                                                {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                                                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" className="flex-1" onClick={handleGenerateBodyImages} disabled={isGeneratingBodyImages || !content || !title}>
                                            {isGeneratingBodyImages ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Generate & Insert
                                        </Button>
                                    </div>
                                    <Button variant="secondary" size="sm" className="w-full" onClick={handleResetBodyImages}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Reset Body Images
                                    </Button>
                                    <p className="text-xs text-muted-foreground">Generates images and adds them to the end of your content. You can then drag and drop them to reorder.</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handleUpdate} disabled={isUpdating || isGeneratingFeaturedImage || isGeneratingBodyImages}>
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
