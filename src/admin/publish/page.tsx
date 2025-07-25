
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    ArrowLeft, Send, Loader2, RefreshCcw, ImagePlus, Wand2, Upload, Bold, Italic, Underline, Strikethrough, 
    List, ListOrdered, Quote, Link as LinkIcon, Pilcrow, RemoveFormatting
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addArticle } from '@/lib/data';
import { categories } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
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
import type { Article } from '@/lib/types';
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { generateArticleImages } from '@/ai/flows/generate-article-images';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';

function EditorToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement> }) {
    const handleCommand = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
        }
    };
    
    const handleLink = () => {
        const url = prompt("Enter the URL:");
        if (url) {
            handleCommand('createLink', url);
        }
    };

    return (
        <div className="flex items-center gap-1 p-1 border rounded-t-md bg-muted flex-wrap">
            <Toggle size="sm" onPressedChange={() => handleCommand('bold')}><Bold className="h-4 w-4" /></Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('italic')}><Italic className="h-4 w-4" /></Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('underline')}><Underline className="h-4 w-4" /></Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('strikethrough')}><Strikethrough className="h-4 w-4" /></Toggle>
            <Separator orientation="vertical" className="h-6" />
            <Toggle size="sm" onPressedChange={() => handleCommand('insertUnorderedList')}><List className="h-4 w-4" /></Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('formatBlock', 'blockquote')}><Quote className="h-4 w-4" /></Toggle>
            <Button variant="ghost" size="sm" onClick={handleLink}><LinkIcon className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6" />
            <Toggle size="sm" onPressedChange={() => handleCommand('formatBlock', 'h2')}>H2</Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('formatBlock', 'h3')}>H3</Toggle>
            <Toggle size="sm" onPressedChange={() => handleCommand('formatBlock', 'p')}><Pilcrow className="h-4 w-4" /></Toggle>
            <Separator orientation="vertical" className="h-6" />
             <Button variant="ghost" size="sm" onClick={() => handleCommand('removeFormat')}><RemoveFormatting className="h-4 w-4" /></Button>
        </div>
    );
}

export default function PublishArticlePage() {
    const router = useRouter();
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [imageHint, setImageHint] = useState('');
    
    const [isPublishing, setIsPublishing] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingBodyImages, setIsGeneratingBodyImages] = useState(false);
    
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [bodyImageCount, setBodyImageCount] = useState<number>(3);
    
    const contentRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    };
    
    const resetArticle = () => {
        setTitle('');
        setSlug('');
        setContent('');
        setCategory('');
        setImageUrl('');
        setAltText('');
        setImageHint('');
        if (contentRef.current) contentRef.current.innerHTML = '';
        toast({ title: "Form Cleared", description: "You can now start a new article." });
    }

    const handleContentChange = useCallback(() => {
        if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
        }
    }, []);
    
    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleContentChange();
    };
    
    const handleGenerateFeaturedImage = async () => {
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter a title to generate a relevant image."});
            return;
        }
        setIsGeneratingImage(true);
        try {
            const finalImageUrl = `https://placehold.co/600x400.png`;
            setImageUrl(finalImageUrl);
            
            const { altText: generatedAltText } = await generateAltText({ articleTitle: title });
            setAltText(generatedAltText);
            
            toast({ title: "Featured Image Generated", description: "A new placeholder image and alt text have been created." });

        } catch (error) {
            console.error("Failed to generate featured image:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: errorMessage });
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImageUrl(base64String);
                toast({ title: "Image Uploaded", description: "The image has been successfully uploaded." });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateBodyImages = async () => {
        const currentContent = contentRef.current?.innerHTML || content;
        if (!currentContent) {
            toast({ variant: "destructive", title: "Content is required", description: "Please write some content with H2 subheadings to insert images." });
            return;
        }
         if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "An article title is needed to generate relevant images." });
            return;
        }
        setIsGeneratingBodyImages(true);
        try {
            const { placements } = await generateArticleImages({
                articleContent: currentContent,
                articleTitle: title,
                category: category,
                imageCount: bodyImageCount,
            });

            if (placements.length === 0) {
                 toast({ title: "No Subheadings Found", description: "Couldn't find any H2 subheadings to insert images after." });
                 setIsGeneratingBodyImages(false);
                 return;
            }
            
            let newContent = currentContent;
            for (const placement of placements) {
                const subheadingHtml = `<h2>${placement.subheading}</h2>`;
                const imageHtml = `<div style="display: flex; justify-content: center; margin: 1rem 0;"><img src="${placement.imageUrl}" alt="${placement.subheading}" style="max-width: 100%; border-radius: 0.5rem;" /></div>`;
                newContent = newContent.replace(subheadingHtml, `${subheadingHtml}${imageHtml}`);
            }

            if (contentRef.current) {
                contentRef.current.innerHTML = newContent;
            }
            setContent(newContent);
            
            toast({ title: "Body Images Inserted", description: `${placements.length} images have been generated and added to your article.` });

        } catch (error) {
             console.error("Failed to generate body images:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: errorMessage });
        } finally {
            setIsGeneratingBodyImages(false);
        }
    };
    
    const handlePublish = async () => {
        const currentContent = contentRef.current?.innerHTML || content;

        if (!title || !currentContent || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "To publish, please fill in all fields: Title, Content, Category, and Featured Image.",
            });
            return;
        }

        setIsPublishing(true);
        
        try {
            const articleToSave: Omit<Article, 'id' | 'publishedAt'> = {
                title,
                slug,
                content: currentContent,
                category: category || categories[0].name,
                imageUrl,
                altText,
                imageHint,
                status: 'published',
            };
            
            const newArticle = await addArticle(articleToSave);
            toast({
                title: `Article Published!`,
                description: `Your article has been successfully saved.`,
            });
            
            if (newArticle?.slug) {
                router.push(`/admin/edit/${newArticle.slug}`);
            }

        } catch(error) {
            console.error("Failed to save article", error);
            const errorMessage = error instanceof Error ? error.message : "There was an error saving your article.";
            toast({
                variant: "destructive",
                title: "Saving Failed",
                description: errorMessage,
            });
        } finally {
            setIsPublishing(false);
        }
    }

    return (
        <div className="container mx-auto py-8">
             <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to reset?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all content, including the title and featured image. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { resetArticle(); setIsResetDialogOpen(false); }} className="bg-destructive hover:bg-destructive/90">Reset</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                 <Button variant="destructive" size="sm" onClick={() => setIsResetDialogOpen(true)}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset Article
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
                        <Label htmlFor="article-title">Article Title</Label>
                        <Input 
                            id="article-title" 
                            placeholder="Your engaging article title..." 
                            value={title}
                            onChange={handleTitleChange}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <EditorToolbar editorRef={contentRef} />
                        <div
                            ref={contentRef}
                            id="content-editor"
                            contentEditable
                            onInput={handleContentChange}
                            onPaste={handlePaste}
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

                            {/* Featured Image Section */}
                            <div className="space-y-4">
                                <Label>Featured Image</Label>
                                <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
                                    {isGeneratingImage ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-muted-foreground text-sm">Generating...</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || title} width={600} height={400} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <ImagePlus className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-sm">Generate or upload an image.</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                     <Input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                    <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </Button>
                                    <Button className="flex-1" onClick={handleGenerateFeaturedImage} disabled={isGeneratingImage || !title}>
                                        {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                        Generate
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="alt-text" className="text-xs">Alt Text (for SEO)</Label>
                                    <Input id="alt-text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Descriptive alt text..."/>
                                </div>
                            </div>
                            
                            {/* Body Images Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <Label>Body Images</Label>
                                <CardDescription>Insert images into your article body based on H2 subheadings.</CardDescription>
                                <div className="flex gap-2">
                                    <Select onValueChange={(value) => setBodyImageCount(parseInt(value))} defaultValue="3">
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 20 }, (_, i) => i + 1).map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button className="flex-1" onClick={handleGenerateBodyImages} disabled={isGeneratingBodyImages || !content}>
                                        {isGeneratingBodyImages ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                                        Generate & Insert
                                    </Button>
                                </div>
                            </div>


                            {/* Actions Section */}
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handlePublish} disabled={isPublishing}>
                                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Publish Article
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    