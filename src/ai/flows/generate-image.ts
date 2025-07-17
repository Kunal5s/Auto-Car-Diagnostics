
'use server';
/**
 * @fileOverview A flow for generating images using Pollinations.ai.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image from Pollinations.ai.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    // Reverted to use Pollinations.ai as requested by the user.
    const encodedPrompt = encodeURIComponent(input.prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    if (!imageUrl) {
        throw new Error('Image generation failed to produce a URL.');
    }

    return {
        imageUrl: imageUrl,
    };
}
