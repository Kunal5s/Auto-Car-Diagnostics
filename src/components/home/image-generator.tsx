
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

const imageStyles = ["photorealistic", "anime", "fantasy art", "pixel art", "cyberpunk", "steampunk", "watercolor"];
const colorProfiles = ["vibrant colors", "monochromatic", "pastel colors", "black and white", "neon"];
const moods = ["dramatic lighting", "cinematic lighting", "cheerful", "dark and moody", "ethereal"];
const aspectRatios = {
    "Square (1:1)": { width: 512, height: 512 },
    "Portrait (2:3)": { width: 512, height: 768 },
    "Landscape (3:2)": { width: 768, height: 512 },
};

export function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(imageStyles[0]);
    const [color, setColor] = useState(colorProfiles[0]);
    const [mood, setMood] = useState(moods[0]);
    const [ratio, setRatio] = useState("Square (1:1)");
    const [numImages, setNumImages] = useState(4);

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const constructPrompt = () => {
        return `${prompt}, ${style}, ${color}, ${mood}`;
    };

    const handleGenerate = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt to generate images.' });
            return;
        }
        setIsLoading(true);
        setImageUrls([]);

        const fullPrompt = constructPrompt();
        const sanitizedPrompt = encodeURIComponent(fullPrompt.trim().replace(/\s+/g, " "));
        const negativePrompt = encodeURIComponent('text, logo, watermark, signature, deformed, ugly, malformed, blurry');
        
        const { width, height } = aspectRatios[ratio as keyof typeof aspectRatios];

        const urls = Array(numImages).fill(null).map(() => {
            const seed = Math.floor(Math.random() * 100000); // Generate a random seed for variation
            return `https://image.pollinations.ai/prompt/${sanitizedPrompt}?width=${width}&height=${height}&negative_prompt=${negativePrompt}&seed=${seed}`;
        });
        
        // This preloads the images in the background to make them appear faster
        const imagePromises = urls.map(url => new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = reject;
        }));

        try {
            await Promise.all(imagePromises);
            setImageUrls(urls);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Image Loading Failed', description: 'Could not load images from the generator. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyPrompt = () => {
        navigator.clipboard.writeText(constructPrompt());
        toast({ title: 'Prompt Copied!', description: 'The full prompt has been copied to your clipboard.' });
    };

    const handleDownload = async (imageUrl: string) => {
        if (!imageUrl) return;
        try {
            // Using fetch to get the image as a blob to bypass CORS issues for direct download
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${prompt.substring(0, 20).replace(/ /g, '_') || 'generated_image'}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            toast({ title: 'Download Started', description: 'Your image is being downloaded.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not download the image. Try right-clicking to save.' });
             console.error("Download failed:", error);
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
                    <CardContent className="bg-background rounded-lg p-6 space-y-4">
                        <div>
                            <Label htmlFor="prompt-input" className="text-lg font-semibold font-headline">1. Enter your prompt</Label>
                            <Textarea
                                id="prompt-input"
                                placeholder="e.g., A majestic lion wearing a crown, sitting on a throne in a cosmic library..."
                                className="mt-2 min-h-24 text-base"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <Label className="text-lg font-semibold font-headline">2. Customize your image</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-1.5">
                                    <Label>Style</Label>
                                    <Select value={style} onValueChange={setStyle}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{imageStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-1.5">
                                    <Label>Color</Label>
                                    <Select value={color} onValueChange={setColor}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{colorProfiles.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Mood & Lighting</Label>
                                    <Select value={mood} onValueChange={setMood}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Aspect Ratio</Label>
                                    <Select value={ratio} onValueChange={setRatio}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{Object.keys(aspectRatios).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <Label>Number of Images</Label>
                                    <Select value={String(numImages)} onValueChange={(val) => setNumImages(Number(val))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Image</SelectItem>
                                            <SelectItem value="2">2 Images</SelectItem>
                                            <SelectItem value="3">3 Images</SelectItem>
                                            <SelectItem value="4">4 Images</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full !mt-6">
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            Generate Images
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="p-1.5 bg-gradient-to-bl from-primary/20 to-secondary/20 rounded-xl shadow-lg transition-all hover:shadow-2xl h-full">
                    <CardContent className="bg-background rounded-lg p-6 flex flex-col justify-center items-center min-h-[500px] h-full space-y-4">
                        {isLoading ? (
                            <div className='flex flex-col items-center justify-center text-muted-foreground'>
                                <Loader2 className="h-20 w-20 animate-spin text-primary" />
                                <p className="mt-4 text-lg font-medium">Generating your masterpieces...</p>
                                <p className="text-sm">This can take a few moments.</p>
                            </div>
                        ) : imageUrls.length > 0 ? (
                            <>
                                <div className={cn(
                                    "w-full grid gap-2",
                                    numImages === 1 ? "grid-cols-1" : "grid-cols-2",
                                )}>
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative w-full rounded-lg overflow-hidden group aspect-square">
                                            <Image src={url} alt={`Generated image ${index + 1} for prompt: ${prompt}`} layout="fill" objectFit="cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="icon" onClick={() => handleDownload(url)}>
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button variant="outline" onClick={handleGenerate}><RefreshCcw className="mr-2 h-4 w-4" />Regenerate</Button>
                                    <Button variant="outline" onClick={copyPrompt}><Copy className="mr-2 h-4 w-4" />Copy Prompt</Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-20 w-20 mx-auto" />
                                <p className="mt-4 text-lg font-medium">Your generated images will appear here.</p>
                                <p className="text-sm">Enter a prompt and customize the options to begin.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
