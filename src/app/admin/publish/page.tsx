
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Eye, Sparkles, Image as ImageIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

function RichTextEditorStub() {
    return (
        <div className="rounded-lg border bg-background">
            <div className="p-2 border-b">
                {/* This is just a visual stub for the toolbar */}
                <p className="text-sm text-muted-foreground">B I U ...</p>
            </div>
            <Textarea className="min-h-48 border-0 focus-visible:ring-0" />
        </div>
    )
}

export default function PublishArticlePage() {
    const [keyTakeaways, setKeyTakeaways] = useState(['']);
    const { toast } = useToast();

    const addTakeaway = () => {
        setKeyTakeaways([...keyTakeaways, '']);
    };

    const removeTakeaway = (index: number) => {
        const newTakeaways = keyTakeaways.filter((_, i) => i !== index);
        setKeyTakeaways(newTakeaways);
    };

    const handlePublish = () => {
        toast({
            title: "Article Published!",
            description: "Your new article is now live.",
        });
    }

    const handleSaveDraft = () => {
        toast({
            title: "Draft Saved",
            description: "Your article has been saved as a draft.",
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
                        <h1 className="text-3xl font-bold font-headline">Publish a New Article Manually</h1>
                        <p className="text-muted-foreground">Write your article below. Your work is auto-saved as a draft every few seconds.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="article-title" className="text-lg font-semibold">Article Title</Label>
                        <Input id="article-title" placeholder="Your engaging article title..." className="text-lg" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Summary</Label>
                        <RichTextEditorStub />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Content</Label>
                        <RichTextEditorStub />
                    </div>
                    
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Key Takeaways</Label>
                        {keyTakeaways.map((takeaway, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    value={takeaway} 
                                    onChange={(e) => {
                                        const newTakeaways = [...keyTakeaways];
                                        newTakeaways[index] = e.target.value;
                                        setKeyTakeaways(newTakeaways);
                                    }}
                                    placeholder={`Takeaway #${index + 1}`}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeTakeaway(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addTakeaway}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Takeaway
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Conclusion</Label>
                        <RichTextEditorStub />
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
                                <Select>
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
                                <div className="aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted/50">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mt-2">Enter a title to generate a preview image.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>AI Tools</Label>
                                <Button variant="outline" className="w-full">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Add Images
                                </Button>
                                <Select defaultValue="2">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Image</SelectItem>
                                        <SelectItem value="2">2 Images</SelectItem>
                                        <SelectItem value="3">3 Images</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Actions</Label>
                                <Button className="w-full" onClick={handlePublish}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Publish Article
                                </Button>
                                <Button variant="outline" className="w-full" onClick={handleSaveDraft}>
                                    Save as Draft
                                </Button>
                                <Button variant="ghost" className="w-full">
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
