
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Eye, Sparkles, Image as ImageIcon, Send, Loader2, Save, Trash2, Upload, RefreshCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { addArticle } from '@/lib/data';
import { categories } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';
import { generatePollinationsImage } from '@/ai/flows/generate-pollinations-image';
import { generateAltText } from '@/ai/flows/generate-alt-text';
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
    category: string;
    keyTakeaways: string[];
}

const initialEditorState: EditorState = {
    title: '',
    category: '',
    keyTakeaways: [''],
};

export default function PublishArticlePage() {
    const router = useRouter();
    const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingBodyImages, setIsGeneratingBodyImages] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [bodyImageCount, setBodyImageCount] = useState(3);
    const [wordCount, setWordCount] = useState(0);
    const [imageSuggestion, setImageSuggestion] = useState('');
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    
    const { toast } = useToast();

    const contentRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const contentHtml = useRef('');
    const summaryHtml = useRef('');

    const resetArticle = () => {
        setEditorState(initialEditorState);
        setImageUrl('');
        setAltText('');
        setImageHint('');
        setWordCount(0);
        setImageSuggestion('');
        if (summaryRef.current) summaryRef.current.innerHTML = '';
        if (contentRef.current) contentRef.current.innerHTML = '';
        summaryHtml.current = '';
        contentHtml.current = '';
        toast({ title: "Form Cleared", description: "You can now start a new article." });
    }

    const handleStateChange = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
        setEditorState(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateFeaturedImage = useCallback(async () => {
        const { title } = editorState;
        if (!title) {
             toast({ variant: "destructive", title: "Title is required", description: "Please enter an article title before generating an image." });
             return;
        }
        if (isGenerating) return;
        
        setIsGenerating(true);
        try {
            const [altResult, imgResult] = await Promise.all([
                generateAltText({ articleTitle: title }),
                generatePollinationsImage({ prompt: `Photorealistic image for an article titled: ${title}` }),
            ]);
            
            setImageUrl(imgResult.imageUrl);
            setAltText(altResult.altText);
            setImageHint(title.split(' ').slice(0, 2).join(' '));

        } catch (err) {
            console.error(`Image Generation Failed:`, err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Image Generation Failed",
                description: errorMessage,
            });
        } finally {
            setIsGenerating(false);
        }
    }, [editorState, isGenerating, toast]);
    
    const handleContentChange = useCallback(() => {
        if (contentRef.current) {
            contentHtml.current = contentRef.current.innerHTML;
        }
        if(summaryRef.current) {
            summaryHtml.current = summaryRef.current.innerHTML;
        }
    }, []);

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

    React.useEffect(() => {
        const observer = setupContentObserver();
        return () => observer?.disconnect();
    }, [setupContentObserver]);


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
        const { title, category } = editorState;
        const content = contentHtml.current;
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

            if (!result.placements || result.placements.length === 0) {
                throw new Error("AI could not determine where to place images.");
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            let imagesInserted = 0;

            for (const placement of result.placements) {
                const { imageUrl, subheading } = placement;
                const h2s = Array.from(doc.querySelectorAll('h2'));
                const targetH2 = h2s.find(h => h.textContent?.trim() === subheading.trim());

                if (targetH2) {
                    const imageAlt = `${title} - ${subheading}`;
                    const imageDiv = doc.createElement('div');
                    imageDiv.setAttribute('style', 'display: flex; justify-content: center; margin: 1rem 0;');
                    imageDiv.innerHTML = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; border-radius: 0.5rem;" />`;
                    
                    targetH2.parentNode?.insertBefore(imageDiv, targetH2.nextSibling);
                    imagesInserted++;
                }
            }
            
            const newContent = doc.body.innerHTML;
            if(contentRef.current) contentRef.current.innerHTML = newContent;
            handleContentChange();
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
            const newContent = contentRef.current.innerHTML.replace(/<div style="display: flex; justify-content: center; margin: 1rem 0;"><img src="https:\/\/image\.pollinations\.ai[^>]*><\/div>/g, '');
            contentRef.current.innerHTML = newContent;
            handleContentChange();
            toast({ title: "Images Reset", description: "All AI-generated body images have been removed from the content." });
        }
    };

    const handleSave = async (status: 'published' | 'draft'): Promise<{slug: string | null, success: boolean}> => {
        const { title, category, keyTakeaways } = editorState;
        const summary = summaryHtml.current;
        const content = contentHtml.current;

        if (status === 'published' && (!title || !summary || !content || !category || !imageUrl)) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "To publish, please fill in all fields and generate a featured image.",
            });
            return { slug: null, success: false };
        }
        
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter a title to save a draft." });
            return { slug: null, success: false };
        }

        const newSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

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
                description: `Your article has been successfully saved to GitHub.`,
            });
            
            if (status === 'published') {
                 resetArticle();
            }
            router.push(`/admin/edit/${newSlug}`);

            return { slug: newSlug, success: true };

        } catch(error) {
            console.error("Failed to save article", error);
            const errorMessage = error instanceof Error ? error.message : "There was an error saving your article.";
            toast({
                variant: "destructive",
                title: "Saving Failed",
                description: errorMessage,
            });
            return { slug: null, success: false };
        } finally {
            if (status === 'published') setIsPublishing(false);
            else setIsSavingDraft(false);
        }
    }

    const handlePreview = async () => {
        const { title } = editorState;
        if (!title) {
            toast({ variant: "destructive", title: "Title required", description: "Please enter a title before previewing." });
            return;
        }

        const { slug, success } = await handleSave('draft');
        if (success && slug) {
             window.open(`/api/draft?slug=${slug}&secret=${process.env.NEXT_PUBLIC_DRAFT_MODE_SECRET || ''}`, '_blank');
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
                            ref={summaryRef}
                            id="summary-editor"
                            contentEditable
                            onInput={handleContentChange}
                            onPaste={handlePaste}
                             className={cn(
                                'prose max-w-none min-h-32 w-full rounded-md rounded-t-none border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                '[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg'
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
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating...</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || editorState.title} width={600} height={400} className="object-cover w-full h-full" data-ai-hint={imageHint || ''} />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mt-2 text-center px-4">Generate an image or upload one.</p>
                                        </>
                                    )}
                                </div>
                                <Button onClick={handleGenerateFeaturedImage} disabled={!!isGenerating || !editorState.title} className="w-full">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate with Pollinations
                                </Button>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" className="flex-1">
                                        <label htmlFor="featured-image-upload">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                            <input type="file" id="featured-image-upload" accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={(e) => handleImageUpload(e, true)} />
                                        </label>
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setImageUrl('')}>
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alt-text">Alt Text (for SEO)</Label>
                                    <Input
                                        id="alt-text"
                                        placeholder="Descriptive alt text for the image..."
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
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
                                        <Button variant="outline" className="flex-1" onClick={handleGenerateBodyImages} disabled={isGeneratingBodyImages || !contentHtml.current || !editorState.title}>
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
                                <Button className="w-full" onClick={() => handleSave('published')} disabled={isPublishing || isSavingDraft || !!isGenerating || isGeneratingBodyImages}>
                                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Publish Article
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => handleSave('draft')} disabled={isPublishing || isSavingDraft || !!isGenerating || isGeneratingBodyImages}>
                                     {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save as Draft
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={handlePreview} disabled={isSavingDraft || isPublishing}>
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
