
'use server';
/**
 * @fileOverview A flow for generating images using Gemini. THIS IS NO LONGER USED.
 * We now use generate-alt-text and placeholder images.
 */

import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  // This flow is deprecated in favor of placeholder images.
  // Returning a placeholder to avoid breaking the UI if it's still called.
  return Promise.resolve({ imageUrl: 'https://placehold.co/600x400.png' });
}
