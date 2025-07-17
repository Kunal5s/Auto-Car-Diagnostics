
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Eye, Sparkles, Image as ImageIcon, Send, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addArticle, getArticleBySlug } from '@/lib/data';
import { categories } from '@/lib/config';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { generateArticleImages } from '@/ai/flows/generate-article-images';
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';
import { generateImage } from '@/ai/flows/generate-image';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

type EditorState = {
    title: string;
    summary: string;
    content: string;
    category: string;
    keyTakeaways: string[];
}

export default function PublishArticlePage() {
    const router = useRouter();
    const [editorState, setEditorState] = useState<EditorState>({
        title: '',
        summary: '',
        content: '',
        category: '',
        keyTakeaways: [''],
    });
    
    const [isGeneratingFeaturedImage, setIsGeneratingFeaturedImage] = useState(false);
    const [isGeneratingBodyImages, setIsGeneratingBodyImages] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [slug, setSlug] = useState('');
    const [bodyImageCount, setBodyImageCount] = useState(3);
    
    const { toast } = useToast();
    const debouncedTitle = useDebounce(editorState.title, 1500);

    const DRAFT_STORAGE_KEY = 'article_draft';

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

    const handleGenerateFeaturedImage = useCallback(async (titleToGenerate: string) => {
        if (!titleToGenerate || isGeneratingFeaturedImage) {
            return;
        }
        
        setIsGeneratingFeaturedImage(true);
        setImageUrl('');
        setAltText('');

        try {
            const prompt = `${titleToGenerate}, automotive ${editorState.category || 'repair'}`;
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
    }, [editorState.category, isGeneratingFeaturedImage, toast]);

    useEffect(() => {
        if (debouncedTitle) {
            handleGenerateFeaturedImage(debouncedTitle);
        }
    }, [debouncedTitle, handleGenerateFeaturedImage]);


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

            const { imageUrls } = result;
            if (!imageUrls || imageUrls.length === 0) {
                throw new Error("No images were generated.");
            }

            let newContent = editorState.content;
            for (const generatedImageUrl of imageUrls) {
                const imageAlt = `${editorState.title} - illustration`;
                newContent += `<p><img src="${generatedImageUrl}" alt="${imageAlt}" style="margin-top: 1rem; margin-bottom: 1rem; border-radius: 0.5rem;" data-ai-hint="${editorState.title} ${editorState.category}" /></p>`;
            }

            handleStateChange('content', newContent.trim());
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
        const newContent = editorState.content.replace(/<p><img[^>]*><\/p>/g, '');
        handleStateChange('content', newContent);
        toast({ title: "Images Reset", description: "All body images have been removed from the content." });
    };

    const handleSave = async (status: 'published' | 'draft') => {
        const { title, summary, content, category, keyTakeaways } = editorState;
        if (!title || !summary || !content || !category || !imageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill in all fields and ensure a featured image is generated before saving.",
            });
            return;
        }

        const newSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existingArticle = await getArticleBySlug(newSlug);
        if (existingArticle) {
            toast({
                variant: "destructive",
                title: "Slug Conflict",
                description: "An article with this title (and slug) already exists. Please choose a unique title.",
            });
            return;
        }
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
            
            // Clear the draft from local storage after successful save
            localStorage.removeItem(DRAFT_STORAGE_KEY);

            router.push(`/admin/edit/${newSlug}`);
        } catch(error) {
            console.error("Failed to save article", error);
            const errorMessage = error instanceof Error ? error.message : "There was an error saving your article.";
            toast({
                variant: "destructive",
                title: "Saving Failed",
                description: errorMessage,
            });
        } finally {
            if (status === 'published') setIsPublishing(false);
            else setIsSavingDraft(false);
        }
    }

    const handlePreview = () => {
        toast({
            variant: "destructive",
            title: "Cannot Preview",
            description: "You must save the article as a draft before you can preview it.",
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
                         <Textarea 
                            className="min-h-32"
                            placeholder="A brief summary of the article..."
                            value={editorState.summary}
                            onChange={(e) => handleStateChange('summary', e.target.value)}
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
                        <RichTextToolbar onExecCommand={handleExecCommand} />
                        <div
                            id="content-editor"
                            contentEditable
                            onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
                            dangerouslySetInnerHTML={{ __html: editorState.content }}
                            className={cn(
                                'prose prose-lg max-w-none min-h-96 w-full rounded-md rounded-t-none border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
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
                            
                            <div className="space-y-2">
                                <Label>Featured Image</Label>
                                <div className="aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted/50 overflow-hidden">
                                    {isGeneratingFeaturedImage ? (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground mt-2">Generating image... <br/> Alt text will be generated next.</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <Image src={imageUrl} alt={altText || editorState.title} width={600} height={400} className="object-cover w-full h-full" data-ai-hint={imageHint || ''} />
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
                                        <Button variant="outline" className="flex-1" onClick={handleGenerateBodyImages} disabled={isGeneratingBodyImages || !editorState.content || !editorState.title}>
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
                                <Button className="w-full" onClick={() => handleSave('published')} disabled={isPublishing || isSavingDraft || isGeneratingFeaturedImage || isGeneratingBodyImages}>
                                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Publish Article
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => handleSave('draft')} disabled={isPublishing || isSavingDraft || isGeneratingFeaturedImage || isGeneratingBodyImages}>
                                     {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save as Draft
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={handlePreview} disabled>
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
