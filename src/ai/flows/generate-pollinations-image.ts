
'use server';
/**
 * @fileOverview A flow for generating images using Pollinations.ai. THIS IS NO LONGER USED.
 * We now use generate-alt-text and placeholder images.
 *
 * - generatePollinationsImage - A function that generates an image based on a text prompt.
 * - GeneratePollinationsImageInput - The input type for the function.
 * - GeneratePollinationsImageOutput - The return type for the function.
 */

import { z } from 'zod';

const GeneratePollinationsImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GeneratePollinationsImageInput = z.infer<typeof GeneratePollinationsImageInputSchema>;

const GeneratePollinationsImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the generated image.'),
});
export type GeneratePollinationsImageOutput = z.infer<typeof GeneratePollinationsImageOutputSchema>;

export async function generatePollinationsImage(input: GeneratePollinationsImageInput): Promise<GeneratePollinationsImageOutput> {
  // This flow is deprecated in favor of placeholder images.
  // Returning a placeholder to avoid breaking the UI if it's still called.
  return { imageUrl: 'https://placehold.co/600x400.png' };
}
