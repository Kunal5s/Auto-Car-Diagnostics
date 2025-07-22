
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Eye, Send, Loader2, Save, Trash2, Upload, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addArticle } from '@/lib/data';
import { categories } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RichTextToolbar } from '@/components/common/rich-text-toolbar';
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

type EditorState = Omit<Article, 'id' | 'publishedAt'>

const initialEditorState: EditorState = {
    slug: '',
    title: '',
    summary: '',
    content: '',
    category: '',
    keyTakeaways: [],
    imageUrl: '',
    altText: '',
    imageHint: '',
    status: 'draft',
};

export default function PublishArticlePage() {
    const router = useRouter();
    const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
    
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    
    const { toast } = useToast();

    const contentRef = useRef<HTMLDivElement>(null);

    const resetArticle = () => {
        setEditorState(initialEditorState);
        if (contentRef.current) contentRef.current.innerHTML = '';
        toast({ title: "Form Cleared", description: "You can now start a new article." });
    }

    const handleStateChange = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
        setEditorState(prev => {
            const newState = { ...prev, [key]: value };
            if (key === 'title') {
                newState.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }
            return newState;
        });
    };
    
    const handleContentChange = useCallback(() => {
        if (contentRef.current) {
            handleStateChange('content', contentRef.current.innerHTML);
            // Auto-generate summary from the first 150 characters of content
            const summaryText = contentRef.current.innerText.substring(0, 150) + '...';
            handleStateChange('summary', summaryText);
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
                    handleStateChange('imageUrl', dataUrl);
                    handleStateChange('altText', `Image for article: ${editorState.title}`);
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

    const handleSave = async (status: 'published' | 'draft'): Promise<{slug: string | null, success: boolean}> => {
        const { title, category, content, imageUrl } = editorState;

        if (status === 'published' && (!title || !content || !category || !imageUrl)) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "To publish, please fill in all fields (Title, Content, Category) and upload a featured image.",
            });
            return { slug: null, success: false };
        }
        
        if (!title) {
            toast({ variant: "destructive", title: "Title is required", description: "Please enter a title to save a draft." });
            return { slug: null, success: false };
        }

        if (status === 'published') setIsPublishing(true);
        else setIsSavingDraft(true);
        
        try {
            const finalState = {
                ...editorState,
                summary: editorState.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...',
                keyTakeaways: [],
            }
            const newArticle = await addArticle({
                ...finalState,
                status,
            });
            toast({
                title: `Article ${status === 'published' ? 'Published' : 'Draft Saved'}!`,
                description: `Your article has been successfully saved.`,
            });
            
            if (status === 'published') {
                 resetArticle();
                 router.push(`/admin/manage`);
            } else {
                 router.push(`/admin/edit/${newArticle.slug}`);
            }

            return { slug: newArticle.slug, success: true };

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
                                <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
                                    {editorState.imageUrl ? (
                                        <Image src={editorState.imageUrl} alt={editorState.altText || editorState.title} width={600} height={400} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-sm">Upload a featured image.</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                     <Button asChild variant="outline" className="flex-1">
                                        <label htmlFor="featured-image-upload">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Image
                                            <input type="file" id="featured-image-upload" accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={(e) => handleImageUpload(e, true)} />
                                        </label>
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => handleStateChange('imageUrl', '')}>
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={() => handleSave('published')} disabled={isPublishing || isSavingDraft}>
                                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Publish Article
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => handleSave('draft')} disabled={isPublishing || isSavingDraft}>
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
