
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Eye, Sparkles, Image as ImageIcon, Send, Loader2, Save, Trash2, Upload, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addArticle } from '@/lib/data';
import { categories } from '@/lib/config';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';
import { generateImage } from '@/ai/flows/generate-image';
import { cn } from '@/lib/utils';
import { generateArticleImages } from '@/ai/flows/generate-article-images';
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

type EditorState = {
    title: string;
    summary: string;
    content: string;
    category: string;
    keyTakeaways: string[];
}

const initialEditorState: EditorState = {
    title: '',
    summary: '',
    content: '',
    category: '',
    keyTakeaways: [''],
};

export default function PublishArticlePage() {
    const router = useRouter();
    const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
    
    const [isGeneratingFeaturedImage, setIsGeneratingFeaturedImage] = useState(false);
    const [isGeneratingBodyImages, setIsGeneratingBodyImages] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [slug, setSlug] = useState('');
    const [bodyImageCount, setBodyImageCount] = useState(3);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    
    const { toast } = useToast();

    const DRAFT_STORAGE_KEY = 'article_draft';

    const resetArticle = () => {
        setEditorState(initialEditorState);
        setImageUrl('');
        setAltText('');
        setImageHint('');
        setSlug('');
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        toast({ title: "Form Cleared", description: "You can now start a new article." });
    }

    // Load draft from local storage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setEditorState(draft.editorState);
                setImageUrl(draft.imageUrl || '');
                setAltText(draft.altText || '');
                setImageHint(draft.imageHint || '');
                 toast({ title: "Draft Restored", description: "Your previously saved draft has been loaded." });
            } catch (error) {
                console.error("Failed to parse draft from local storage", error);
                localStorage.removeItem(DRAFT_STORAGE_KEY);
            }
        }
    }, [toast]);

    // Save draft to local storage on change
    useEffect(() => {
        const draftData = {
            editorState,
            imageUrl,
            altText,
            imageHint,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    }, [editorState, imageUrl, altText, imageHint]);


    const handleStateChange = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
        setEditorState(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateFeaturedImage = useCallback(async (titleToGenerate: string) => {
        if (!titleToGenerate || isGeneratingFeaturedImage) return;
        
        setIsGeneratingFeaturedImage(true);
        try {
            const prompt = `photorealistic image of ${titleToGenerate}, professional automotive photography, high detail, in the style of ${editorState.category || 'repair'}`;
            const result = await generateImage({ prompt });
            setImageUrl(result.imageUrl);
            setImageHint(titleToGenerate);

        } catch (err) {
             console.error("Image Generation Failed:", err);
        } finally {
            setIsGeneratingFeaturedImage(false);
        }
    }, [editorState.category, isGeneratingFeaturedImage]);


    const handleContentChange = (newContent: string) => {
        handleStateChange('content', newContent);
    };

    const handleExecCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        const editor = document.getElementById('content-editor');
        if (editor) {
            handleContentChange(editor.innerHTML);
        }
    };
    
    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const clipboardData = event.clipboardData;
        let pastedData;

        if (clipboardData.types.includes('text/html')) {
            pastedData = clipboardData.getData('text/html');
        } else {
            let text = clipboardData.getData('text/plain');
            text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
            pastedData = text.replace(/\n/g, '<br />');
        }
        
        document.execCommand('insertHTML', false, pastedData);
        
        const editor = document.getElementById('content-editor');
        if (editor) {
            handleContentChange(editor.innerHTML);
        }
    };

    const handleKeyTakeawayChange = (index: number, value: string) => {
        const newTakeaways = [...editorState.keyTakeaways];
        newTakeaways[index] = value;
        handleStateChange('keyTakeaways', newTakeaways);
    };

    const addKeyTakeaway = () => {
        handleStateChange('keyTakeaways', [...editorState.keyTakeaways, '']);
    };

     const removeKeyTakeaway = (index: number) => {
        const newTakeaways = editorState.keyTakeaways.filter((_, i) => i !== index);
        handleStateChange('keyTakeaways', newTakeaways);
    };

    const handleManualGenerateClick = () => {
        if (!editorState.title) {
             toast({ variant: "destructive", title: "Title Needed", description: "Please provide a title to generate an image." });
             return;
        }
        handleGenerateFeaturedImage(editorState.title);
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean = false) => {
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
                    setImageUrl(dataUrl);
                } else {
                     const imgHtml = `<div style="display: flex; justify-content: center; margin: 1rem 0;"><img src="${dataUrl}" alt="${editorState.title || 'Uploaded image'}" style="max-width: 100%; border-radius: 0.5rem;" /></div>`;
                    document.execCommand('insertHTML', false, imgHtml);
                    const editor = document.getElementById('content-editor');
                    if (editor) handleContentChange(editor.innerHTML);
                    toast({ title: "Image inserted into content." });
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const handleGenerateBodyImages = async () => {
        if (!editorState.content || !editorState.title) {
            toast({ variant: "destructive", title: "Content and Title are required", description: "Please write the article content and title before generating images." });
            return;
        }
        setIsGeneratingBodyImages(true);
        
        try {
            const result = await generateArticleImages({ 
                articleContent: editorState.content, 
                articleTitle: editorState.title,
                category: editorState.category,
                imageCount: bodyImageCount 
            });

            if (!result.placements || result.placements.length === 0) {
                throw new Error("AI could not determine where to place images.");
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(editorState.content, 'text/html');

            for (const placement of result.placements) {
                const { prompt, subheading } = placement;
                const h2s = Array.from(doc.querySelectorAll('h2'));
                const targetH2 = h2s.find(h => h.textContent?.trim() === subheading.trim());

                if (targetH2) {
                    const fullPrompt = `${prompt}, related to ${editorState.title}, professional automotive photography, high detail, photorealistic`;
                    const encodedPrompt = encodeURIComponent(fullPrompt);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true`;
                    
                    const imageAlt = `${editorState.title} - ${subheading}`;
                    const imageDiv = doc.createElement('div');
                    imageDiv.style.display = 'flex';
                    imageDiv.style.justifyContent = 'center';
                    imageDiv.style.margin = '1rem 0';
                    imageDiv.innerHTML = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; border-radius: 0.5rem;" data-ai-hint="${editorState.title} ${editorState.category}" />`;
                    
                    targetH2.parentNode?.insertBefore(imageDiv, targetH2.nextSibling);
                }
            }
            
            handleStateChange('content', doc.body.innerHTML);
            toast({ title: "Images Inserted!", description: `${result.placements.length} images have been generated and placed in the article.` });

        } catch (error) {
            console.error("Failed to generate body images:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate or insert body images.";
            toast({ variant: "destructive", title: "Image Generation Failed", description: errorMessage });
        } finally {
            setIsGeneratingBodyImages(false);
        }
    }

    const handleResetBodyImages = () => {
        const newContent = editorState.content.replace(/<div style="display: flex; justify-content: center; margin: 1rem 0;"><img[^>]*><\/div>/g, '');
        handleStateChange('content', newContent);
        toast({ title: "Images Reset", description: "All body images have been removed from the content." });
    };

    const handleSave = async (status: 'published' | 'draft'): Promise<string | null> => {
        const { title, summary, content, category, keyTakeaways } = editorState;
        if (!title || !summary || !content || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill in all fields and ensure a featured image is generated before saving.",
            });
            return null;
        }

        const newSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setSlug(newSlug);

        if (status === 'published') setIsPublishing(true);
        else setIsSavingDraft(true);
        
        try {
            await addArticle({
                title,
                summary,
                content,
                category,
                keyTakeaways: keyTakeaways.filter(t => t.trim() !== ''),
                imageUrl,
                altText,
                imageHint,
                slug: newSlug,
                status,
            });
            toast({
                title: `Article ${status === 'published' ? 'Published' : 'Draft Saved'}!`,
                description: `Your article has been successfully saved.`,
            });
            
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            
            if (status === 'published') {
                router.push(`/admin/edit/${newSlug}`);
            }

            return newSlug;

        } catch(error) {
            console.error("Failed to save article", error);
            const errorMessage = error instanceof Error ? error.message : "There was an error saving your article.";
            toast({
                variant: "destructive",
                title: "Saving Failed",
                description: errorMessage,
            });
            return null;
        } finally {
            if (status === 'published') setIsPublishing(false);
            else setIsSavingDraft(false);
        }
    }

    const handlePreview = async () => {
        const draftSlug = await handleSave('draft');
        if (draftSlug) {
             window.open(`/api/draft?slug=${draftSlug}&secret=${process.env.NEXT_PUBLIC_DRAFT_MODE_SECRET || ''}`, '_blank');
        }
    }

    return (
        <div className="container mx-auto py-8">
             <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to reset?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all content, including the title, summary, and featured image. This action cannot be undone.
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
                            value={editorState.title}
                            onChange={(e) => handleStateChange('title', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Summary</Label>
                        <RichTextToolbar onExecCommand={handleExecCommand} onImageUpload={(e) => handleImageUpload(e, false)} />
                        <div
                            id="summary-editor"
                            contentEditable
                            onInput={(e) => handleStateChange('summary', e.currentTarget.innerHTML)}
                            onPaste={handlePaste}
                            dangerouslySetInnerHTML={{ __html: editorState.summary }}
                             className={cn(
                                'prose max-w-none min-h-32 w-full rounded-md rounded-t-none border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                '[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black'
                            )}
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <Label>Key Takeaways</Label>
                        <div className="space-y-2">
                            {editorState.keyTakeaways.map((takeaway, index) => (
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
                            id="content-editor"
                            contentEditable
                            onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
                            onPaste={handlePaste}
                            dangerouslySetInnerHTML={{ __html: editorState.content }}
                            className={cn(
                                'prose prose-lg max-w-none min-h-96 w-full rounded-md rounded-t-none border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                '[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1]:font-extrabold [&_h2]:font-bold [&_h3]:font-semibold [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black'
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
                                <Select onValueChange={(value) => handleStateChange('category', value)} value={editorState.category}>
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
                                    {isGeneratingFeaturedImage ? (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating image...</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || editorState.title} width={600} height={400} className="object-cover w-full h-full" data-ai-hint={imageHint || ''} />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mt-2 text-center px-4">Click "Generate" to create an image based on the title.</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" className="flex-1">
                                        <label htmlFor="featured-image-upload">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                            <input type="file" id="featured-image-upload" accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={(e) => handleImageUpload(e, true)} />
                                        </label>
                                    </Button>
                                    <Button onClick={handleManualGenerateClick} disabled={isGeneratingFeaturedImage || !editorState.title} className="flex-1">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alt-text">Alt Text (for SEO)</Label>
                                    <Input
                                        id="alt-text"
                                        placeholder="Descriptive alt text for the image..."
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
                                        disabled={isGeneratingFeaturedImage}
                                    />
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
                                        <Button variant="outline" className="flex-1" onClick={handleGenerateBodyImages} disabled={isGeneratingBodyImages || !editorState.content || !editorState.title}>
                                            {isGeneratingBodyImages ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Generate & Insert
                                        </Button>
                                    </div>
                                    <Button variant="secondary" size="sm" className="w-full" onClick={handleResetBodyImages}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Reset Body Images
                                    </Button>
                                    <p className="text-xs text-muted-foreground">Generates images and places them under relevant subheadings in your article.</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={() => handleSave('published')} disabled={isPublishing || isSavingDraft || isGeneratingFeaturedImage || isGeneratingBodyImages}>
                                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Publish Article
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => handleSave('draft')} disabled={isPublishing || isSavingDraft || isGeneratingFeaturedImage || isGeneratingBodyImages}>
                                     {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save as Draft
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={handlePreview} disabled={isSavingDraft}>
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
