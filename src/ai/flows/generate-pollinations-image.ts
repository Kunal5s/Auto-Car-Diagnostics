
'use server';
/**
 * @fileOverview A flow for generating a stable placeholder image.
 * This replaces the previous, unreliable Pollinations.ai implementation.
 *
 * - generatePollinationsImage - A function that returns a URL for a placeholder image.
 * - GeneratePollinationsImageInput - The input type for the function.
 * - GeneratePollinationsImageOutput - The return type for the function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GeneratePollinationsImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from. This is used for context but the output is a placeholder.'),
});
export type GeneratePollinationsImageInput = z.infer<typeof GeneratePollinationsImageInputSchema>;

const GeneratePollinationsImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the generated placeholder image.'),
});
export type GeneratePollinationsImageOutput = z.infer<typeof GeneratePollinationsImageOutputSchema>;

export async function generatePollinationsImage(input: GeneratePollinationsImageInput): Promise<GeneratePollinationsImageOutput> {
    return generatePollinationsImageFlow(input);
}


const generatePollinationsImageFlow = ai.defineFlow(
  {
    name: 'generatePollinationsImageFlow',
    inputSchema: GeneratePollinationsImageInputSchema,
    outputSchema: GeneratePollinationsImageOutputSchema,
  },
  async ({ prompt }) => {
    // Return a reliable, high-quality placeholder image.
    // This removes the dependency on the unstable external service.
    const imageUrl = `https://placehold.co/600x400.png`;
    
    return { imageUrl };
  }
);
