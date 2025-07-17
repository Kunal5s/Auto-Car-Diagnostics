
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Eye, Sparkles, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categories, addArticle } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { generateAltText } from '@/ai/flows/generate-alt-text';


export default function PublishArticlePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [imageHint, setImageHint] = useState('');
    
    const { toast } = useToast();

    const handleGenerateImage = async () => {
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter an article title to generate an image." });
            return;
        }
        setIsGeneratingImage(true);
        setImageUrl('');
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

    const handlePublish = async () => {
        if (!title || !summary || !content || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill in all fields and generate a featured image before publishing.",
            });
            return;
        }

        setIsPublishing(true);
        try {
            await addArticle({
                title,
                summary,
                content,
                category,
                imageUrl,
                altText,
                imageHint,
                slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            });
            toast({
                title: "Article Published!",
                description: "Your new article is now live.",
            });
            router.push('/admin');
        } catch(error) {
            console.error("Failed to publish article", error);
            toast({
                variant: "destructive",
                title: "Publishing Failed",
                description: "There was an error saving your article.",
            });
        } finally {
            setIsPublishing(false);
        }
    }

    const handleSaveDraft = () => {
        toast({
            title: "Draft Saved",
            description: "Your article has been saved as a draft. (This is a demo feature)",
        });
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
                        <h1 className="text-3xl font-bold font-headline">Publish a New Article</h1>
                        <p className="text-muted-foreground">Fill in the details below to create a new article.</p>
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
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating image... <br/> Alt text will be generated next.</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || title} width={600} height={400} className="object-cover" />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mt-2 text-center px-4">Enter a title and click below to generate an image.</p>
                                        </>
                                    )}
                                </div>
                                 <Button variant="outline" className="w-full" onClick={handleGenerateImage} disabled={isGeneratingImage || !title}>
                                    {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate Featured Image
                                </Button>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handlePublish} disabled={isPublishing || isGeneratingImage}>
                                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Publish Article
                                </Button>
                                <Button variant="outline" className="w-full" onClick={handleSaveDraft}>
                                    Save as Draft
                                </Button>
                                <Button variant="ghost" className="w-full" disabled>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview Article
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
