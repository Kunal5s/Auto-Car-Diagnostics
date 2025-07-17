
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Upload, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAuthor, updateAuthor } from '@/lib/data';
import type { Author } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AuthorProfilePage() {
    const [author, setAuthor] = useState<Author>({ name: '', role: '', bio: '', imageUrl: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const loadAuthor = useCallback(async () => {
        setIsLoading(true);
        try {
            const authorData = await getAuthor();
            setAuthor(authorData);
        } catch (error) {
            console.error("Failed to load author data", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load author information." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAuthor();
    }, [loadAuthor]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAuthor(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 2MB." });
                return;
            }
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a PNG or JPG image." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAuthor(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateAuthor(author);
            toast({ title: "Success!", description: "Author information has been updated." });
        } catch (error) {
            console.error("Failed to save author data", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save author information." });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/admin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Author Information</CardTitle>
                        <CardDescription>Update your public author photo, name, title, and bio here. These will be shown on article pages.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-2"><Label>Author Name</Label><Input disabled /></div>
                            <div className="flex-1 space-y-2"><Label>Author Title / Role</Label><Input disabled /></div>
                        </div>
                         <div className="space-y-2"><Label>Author Photo</Label></div>
                         <div className="space-y-2"><Label>Author Bio</Label><Textarea className="min-h-48" disabled /></div>
                        <Button disabled><Loader2 className="mr-2" /> Loading...</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
         <div className="container mx-auto p-4 md:p-8">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Manage Author Information</CardTitle>
                    <CardDescription>Update your public author photo, name, title, and bio here. These will be shown on article pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="author-name">Author Name</Label>
                            <Input id="author-name" name="name" value={author.name} onChange={handleInputChange} placeholder="e.g., Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="author-role">Author Title / Role</Label>
                            <Input id="author-role" name="role" value={author.role} onChange={handleInputChange} placeholder="e.g., Lead Mechanic & Writer" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Author Photo</Label>
                        <div className="flex items-center gap-6">
                            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-muted">
                                {author.imageUrl ? (
                                    <Image src={author.imageUrl} alt="Author Photo" layout="fill" objectFit="cover" />
                                ) : (
                                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Button asChild variant="outline">
                                    <label htmlFor="photo-upload">
                                        <Upload className="mr-2" />
                                        Upload Photo
                                        <input type="file" id="photo-upload" accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={handlePhotoUpload} />
                                    </label>
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">Recommended size: 100x100 pixels. A PNG, JPG or WEBP file is required.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="author-bio">Author Bio</Label>
                        <Textarea 
                            id="author-bio" 
                            name="bio"
                            value={author.bio} 
                            onChange={handleInputChange} 
                            placeholder="Write a short bio about the author..."
                            className="min-h-48"
                        />
                    </div>

                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
