
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Image as ImageIcon, Copy, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const creativeOptions = {
    artisticStyle: ['Photographic', 'Digital Art', 'Cinematic', '3D Render', 'Anime', 'Retro'],
    aspectRatio: {
        'Square (1:1)': '?width=600&height=600',
        'Widescreen (16:9)': '?width=600&height=337',
        'Portrait (9:16)': '?width=337&height=600',
        'Standard (4:3)': '?width=600&height=450',
    },
    mood: ['None', 'Vibrant', 'Dark', 'Pastel', 'Monochromatic'],
    lighting: ['None', 'Soft Light', 'Hard Light', 'Rim Light', 'Studio Lighting'],
};

const sanitizePrompt = (prompt: string): string => {
    return encodeURIComponent(prompt.trim().replace(/\s+/g, " "));
};

export function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [creativeSettings, setCreativeSettings] = useState({
        artisticStyle: 'Photographic',
        aspectRatio: '?width=600&height=450', // Default to 4:3
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

    const handleGenerate = () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt to generate images.' });
            return;
        }
        setIsLoading(true);
        setImages([]);

        const fullPrompt = buildFullPrompt();
        const sanitized = sanitizePrompt(fullPrompt);
        
        // Use a timeout to simulate network and generation time
        setTimeout(() => {
             const imageUrls = Array(4).fill(null).map((_, i) => 
                `https://image.pollinations.ai/prompt/${sanitized}${creativeSettings.aspectRatio}&seed=${Math.random() * 10000}`
            );
            setImages(imageUrls);
            setIsLoading(false);
        }, 2000); // 2 second delay
    };
    
    const copyPrompt = () => {
        navigator.clipboard.writeText(buildFullPrompt());
        toast({ title: 'Prompt Copied!', description: 'The full prompt has been copied to your clipboard.' });
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
                            Generate 4 Images
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="p-1.5 bg-gradient-to-bl from-primary/20 to-secondary/20 rounded-xl shadow-lg transition-all hover:shadow-2xl h-full">
                    <CardContent className="bg-background rounded-lg p-6 flex flex-col justify-center items-center min-h-[500px] h-full">
                        {isLoading ? (
                             <div className="grid grid-cols-2 gap-4 w-full">
                                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                            </div>
                        ) : images.length > 0 ? (
                            <div className="w-full space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((src, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <Image src={src} alt={`Generated image ${index + 1} for prompt: ${prompt}`} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" onClick={handleGenerate}><RefreshCcw className="mr-2 h-4 w-4" />Regenerate</Button>
                                    <Button variant="outline" onClick={copyPrompt}><Copy className="mr-2 h-4 w-4" />Copy Prompt</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-20 w-20 mx-auto" />
                                <p className="mt-4 text-lg font-medium">Your generated images will appear here.</p>
                                <p className="text-sm">Enter a prompt and adjust your settings to begin.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
