
'use server';
/**
 * @fileOverview A flow for generating a single image. THIS FLOW IS DEPRECATED.
 * It now returns a static placeholder URL to remove the dependency on Google Gemini.
 *
 * - generateGeminiImage - A function that returns a placeholder image URL.
 * - GenerateGeminiImageInput - The input type for the function.
 * - GenerateGeminiImageOutput - The return type for the function.
 */

import { z } from 'zod';

const GenerateGeminiImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateGeminiImageInput = z.infer<typeof GenerateGeminiImageInputSchema>;

const GenerateGeminiImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateGeminiImageOutput = z.infer<typeof GenerateGeminiImageOutputSchema>;

export async function generateGeminiImage(input: GenerateGeminiImageInput): Promise<GenerateGeminiImageOutput> {
    // Return a placeholder to avoid breaking the UI if it's still called.
    return Promise.resolve({ imageUrl: 'https://placehold.co/600x400.png' });
}
