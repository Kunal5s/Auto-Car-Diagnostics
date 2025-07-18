
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

export function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt to generate images.' });
            return;
        }
        setIsLoading(true);
        setImageUrls([]);

        // Simulate a delay for placeholder generation
        setTimeout(() => {
            const newUrls = Array(4).fill(null).map(() => {
                const uniqueString = Math.random().toString(36).substring(7);
                return `https://placehold.co/400x400.png?text=${uniqueString}`;
            });
            setImageUrls(newUrls);
            setIsLoading(false);
        }, 1500);
    };
    
    const copyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        toast({ title: 'Prompt Copied!', description: 'The prompt has been copied to your clipboard.' });
    };

    const handleDownload = async (imageUrl: string) => {
        if (!imageUrl) return;
        try {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `${prompt.substring(0, 20).replace(/ /g, '_') || 'generated_image'}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast({ title: 'Download Started', description: 'Your image is being downloaded.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not download the image directly. Try right-clicking to save.' });
             console.error("Download failed:", error);
        }
    };

    return (
        <section className="py-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline text-center mb-2">
                AI Image Generator (Demo)
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

                        <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full">
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
                                <p className="text-sm">This can take up to 30 seconds.</p>
                            </div>
                        ) : imageUrls.length > 0 ? (
                            <>
                                <div className="w-full grid grid-cols-2 gap-2">
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
                                <p className="text-sm">Enter a prompt to begin.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
