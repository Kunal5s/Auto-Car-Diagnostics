
'use server';
/**
 * @fileOverview A flow for generating an image using the Pollinations.ai service.
 * This implementation uses a direct URL construction method for reliability.
 *
 * - generatePollinationsImage - A function that returns a URL for a generated image.
 * - GeneratePollinationsImageInput - The input type for the function.
 * - GeneratePollinationsImageOutput - The return type for the function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GeneratePollinationsImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GeneratePollinationsImageInput = z.infer<typeof GeneratePollinationsImageInputSchema>;

const GeneratePollinationsImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the generated image from pollinations.ai.'),
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
    // Sanitize the prompt for the URL
    const sanitizedPrompt = encodeURIComponent(prompt.trim().replace(/\s+/g, " "));
    
    // Construct the URL with size parameters for a 600x400 image
    const imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?width=600&height=400`;
    
    return { imageUrl };
  }
);
