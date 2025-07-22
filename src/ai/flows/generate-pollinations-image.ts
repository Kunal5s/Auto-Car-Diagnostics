
'use server';
/**
 * @fileOverview A flow for generating an image using the Pollinations.ai service.
 * This has been updated to remove any Genkit or external AI dependency.
 *
 * - generatePollinationsImage - A function that returns a URL for a generated image.
 * - GeneratePollinationsImageInput - The input type for the function.
 * - GeneratePollinationsImageOutput - The return type for the function.
 */

import { z } from 'zod';

const GeneratePollinationsImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
  seed: z.number().optional().describe('A random seed for varied image output.'),
});
export type GeneratePollinationsImageInput = z.infer<typeof GeneratePollinationsImageInputSchema>;

const GeneratePollinationsImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the generated image from pollinations.ai.'),
});
export type GeneratePollinationsImageOutput = z.infer<typeof GeneratePollinationsImageOutputSchema>;

// This is now a standard server function, no external AI model needed.
export async function generatePollinationsImage(input: GeneratePollinationsImageInput): Promise<GeneratePollinationsImageOutput> {
    const { prompt, seed } = input;
    
    // Sanitize the prompt for the URL
    const enhancedPrompt = `${prompt}, 4k, photorealistic, high quality, sharp focus`;
    const sanitizedPrompt = encodeURIComponent(enhancedPrompt.trim().replace(/\s+/g, " "));
    
    // Add a strong negative prompt to avoid text, watermarks, etc.
    const negativePrompt = encodeURIComponent('text, logo, watermark, signature, deformed, ugly, malformed');
    
    let imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?negative_prompt=${negativePrompt}&`;
    
    if (seed) {
        imageUrl += `seed=${seed}&`;
    }

    // The final URL will be constructed on the client, this just provides the base.
    return { imageUrl };
}
