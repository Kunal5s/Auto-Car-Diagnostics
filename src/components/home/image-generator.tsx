
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Image as ImageIcon, Copy, RefreshCcw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { generatePollinationsImage } from '@/ai/flows/generate-pollinations-image';

const creativeOptions = {
    artisticStyle: ['Photographic', 'Digital Art', 'Cinematic', '3D Render', 'Anime', 'Retro'],
    aspectRatio: {
        'Widescreen (16:9)': 'width=600&height=337',
        'Standard (4:3)': 'width=600&height=450',
        'Square (1:1)': 'width=600&height=600',
        'Portrait (9:16)': 'width=337&height=600',
    },
    mood: ['None', 'Vibrant', 'Dark', 'Pastel', 'Monochromatic'],
    lighting: ['None', 'Soft Light', 'Hard Light', 'Rim Light', 'Studio Lighting'],
};

export function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [creativeSettings, setCreativeSettings] = useState({
        artisticStyle: 'Photographic',
        aspectRatio: 'width=600&height=450', // Default to 4:3
        mood: 'None',
        lighting: 'None',
    });
    const { toast } = useToast();

    const handleSettingChange = (key: keyof typeof creativeSettings, value: string) => {
        setCreativeSettings(prev => ({ ...prev, [key]: value }));
    };

    const buildFullPrompt = (): string => {
        let fullPrompt = prompt;
        if (creativeSettings.artisticStyle !== 'None') fullPrompt += `, ${creativeSettings.artisticStyle}`;
        if (creativeSettings.mood !== 'None') fullPrompt += `, ${creativeSettings.mood} mood`;
        if (creativeSettings.lighting !== 'None') fullPrompt += `, ${creativeSettings.lighting}`;
        return fullPrompt;
    };

    const handleGenerate = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt to generate an image.' });
            return;
        }
        setIsLoading(true);
        setImageUrl(null);

        try {
            const fullPrompt = buildFullPrompt();
            
            const result = await generatePollinationsImage({ 
                prompt: fullPrompt, 
                seed: Math.random() * 10000 
            });

            // Append the client-side aspect ratio setting to the URL
            const finalUrl = `${result.imageUrl}${creativeSettings.aspectRatio}`;
            setImageUrl(finalUrl);

        } catch (error) {
            console.error("Image generation failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: 'destructive',
                title: 'Image Generation Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyPrompt = () => {
        navigator.clipboard.writeText(buildFullPrompt());
        toast({ title: 'Prompt Copied!', description: 'The full prompt has been copied to your clipboard.' });
    };

    const handleDownload = async () => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Create a filename from the prompt
            const filename = `${prompt.substring(0, 30).replace(/\s/g, '_') || 'generated_image'}.png`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: 'Download Started!', description: 'Your image is being downloaded.' });
        } catch (error) {
            console.error('Download failed:', error);
            toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not download the image.' });
        }
    };

    return (
        <section className="py-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline text-center mb-2">
                AI Image Generator
            </h2>
            <p className="text-muted-foreground text-center mb-8">
                Create stunning visuals with our powerful AI. Type a prompt and watch your ideas come to life.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <Card className="p-1.5 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-lg transition-all hover:shadow-2xl">
                    <CardContent className="bg-background rounded-lg p-6 space-y-6">
                        <div>
                            <Label htmlFor="prompt-input" className="text-lg font-semibold font-headline">Enter your prompt</Label>
                            <Textarea
                                id="prompt-input"
                                placeholder="e.g., A majestic lion wearing a crown, sitting on a throne in a cosmic library..."
                                className="mt-2 min-h-32 text-base"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold font-headline">Creative Tools</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Artistic Style</Label>
                                    <Select value={creativeSettings.artisticStyle} onValueChange={(v) => handleSettingChange('artisticStyle', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{creativeOptions.artisticStyle.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Aspect Ratio</Label>
                                     <Select value={creativeSettings.aspectRatio} onValueChange={(v) => handleSettingChange('aspectRatio', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select ratio" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(creativeOptions.aspectRatio).map(([name, value]) => (
                                                <SelectItem key={value} value={value}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mood</Label>
                                    <Select value={creativeSettings.mood} onValueChange={(v) => handleSettingChange('mood', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{creativeOptions.mood.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Lighting</Label>
                                    <Select value={creativeSettings.lighting} onValueChange={(v) => handleSettingChange('lighting', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{creativeOptions.lighting.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            Generate Image
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="p-1.5 bg-gradient-to-bl from-primary/20 to-secondary/20 rounded-xl shadow-lg transition-all hover:shadow-2xl h-full">
                    <CardContent className="bg-background rounded-lg p-6 flex flex-col justify-center items-center min-h-[500px] h-full">
                        {isLoading ? (
                            <div className='flex flex-col items-center justify-center text-muted-foreground'>
                                <Loader2 className="h-20 w-20 animate-spin text-primary" />
                                <p className="mt-4 text-lg font-medium">Generating your masterpiece...</p>
                            </div>
                        ) : imageUrl ? (
                            <div className="w-full space-y-4">
                                <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: creativeSettings.aspectRatio.includes('600&height=600') ? '1/1' : creativeSettings.aspectRatio.includes('600&height=337') ? '16/9' : creativeSettings.aspectRatio.includes('337&height=600') ? '9/16' : '4/3' }}>
                                    <Image src={imageUrl} alt={`Generated image for prompt: ${prompt}`} layout="fill" objectFit="cover" />
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" onClick={handleGenerate}><RefreshCcw className="mr-2 h-4 w-4" />Regenerate</Button>
                                    <Button variant="outline" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</Button>
                                    <Button variant="outline" onClick={copyPrompt}><Copy className="mr-2 h-4 w-4" />Copy Prompt</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-20 w-20 mx-auto" />
                                <p className="mt-4 text-lg font-medium">Your generated image will appear here.</p>
                                <p className="text-sm">Enter a prompt and adjust your settings to begin.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
