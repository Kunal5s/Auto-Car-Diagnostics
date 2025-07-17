
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2, Eye, Sparkles, Image as ImageIcon, Send, Bold, Italic, Underline, Link2, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Quote, Redo, Undo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categories, addArticle } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { generateImage } from '@/ai/flows/generate-image';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';


function RichTextEditorToolbar() {
    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-card/50">
            <div className="flex items-center gap-1">
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><Underline className="h-4 w-4" /></Button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <div className="flex items-center gap-1">
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><Link2 className="h-4 w-4" /></Button>
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><Quote className="h-4 w-4" /></Button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <div className="flex items-center gap-1">
                 <Select defaultValue="p" disabled>
                    <SelectTrigger className="w-auto h-8 text-xs border-0 focus:ring-0">
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="p">Paragraph</SelectItem>
                        <SelectItem value="h1"><Heading1 className="inline-block h-4 w-4 mr-2" /> Heading 1</SelectItem>
                        <SelectItem value="h2"><Heading2 className="inline-block h-4 w-4 mr-2" /> Heading 2</SelectItem>
                        <SelectItem value="h3"><Heading3 className="inline-block h-4 w-4 mr-2" /> Heading 3</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <Separator orientation="vertical" className="h-6 mx-1" />
            <div className="flex items-center gap-1">
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><AlignLeft className="h-4 w-4" /></Button>
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><AlignCenter className="h-4 w-4" /></Button>
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><AlignRight className="h-4 w-4" /></Button>
            </div>
             <Separator orientation="vertical" className="h-6 mx-1" />
            <div className="flex items-center gap-1">
                <Button disabled variant="ghost" size="icon" className="h-8 w-8"><Undo className="h-4 w-4" /></Button>
                <Button disabled variant="ghost" size="icon" className="h-8 w-4"><Redo className="h-4 w-4" /></Button>
            </div>
        </div>
    )
}


export default function PublishArticlePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageHint, setImageHint] = useState('');
    
    const { toast } = useToast();

    const handleGenerateImage = async () => {
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter an article title to generate an image." });
            return;
        }
        setIsGeneratingImage(true);
        setImageUrl('');
        try {
            const hint = `automotive ${category || 'repair'}`;
            const result = await generateImage({ prompt: `${title}, ${hint}` });
            if (result.imageUrl) {
                setImageUrl(result.imageUrl);
                setImageHint(hint);
            } else {
                throw new Error("Image generation failed to return a URL.");
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Image Generation Failed", description: "Could not generate a featured image. Please try again." });
        } finally {
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
                imageHint,
                slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                isFeatured: false,
                publishedAt: new Date().toISOString(),
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
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating...</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt="Generated featured image" width={300} height={169} className="object-cover" />
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
