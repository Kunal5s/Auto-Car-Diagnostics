
'use server';
/**
 * @fileOverview A flow for generating multiple images. THIS FLOW IS DEPRECATED.
 * It now returns static placeholder URLs to remove the dependency on Google Gemini.
 *
 * - generateMultipleGeminiImages - A function that returns an array of placeholder image URLs.
 * - GenerateMultipleGeminiImagesInput - The input type for the function.
 * - GenerateMultipleGeminiImagesOutput - The return type for the function.
 */

import { z } from 'zod';

const GenerateMultipleGeminiImagesInputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of text prompts to generate images from.'),
});
export type GenerateMultipleGeminiImagesInput = z.infer<typeof GenerateMultipleGeminiImagesInputSchema>;

const GeneratedImageSchema = z.object({
    prompt: z.string(),
    url: z.string().describe('The placeholder URL.'),
});

const GenerateMultipleGeminiImagesOutputSchema = z.object({
  images: z.array(GeneratedImageSchema).describe('An array of generated placeholder image data.'),
});
export type GenerateMultipleGeminiImagesOutput = z.infer<typeof GenerateMultipleGeminiImagesOutputSchema>;

export async function generateMultipleGeminiImages(input: GenerateMultipleGeminiImagesInput): Promise<GenerateMultipleGeminiImagesOutput> {
    const images = input.prompts.map(prompt => ({
        prompt: prompt,
        url: 'https://placehold.co/600x400.png',
    }));
    return Promise.resolve({ images });
}
