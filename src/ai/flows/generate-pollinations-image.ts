
'use server';
/**
 * @fileOverview A flow for generating images using Pollinations.ai.
 *
 * - generatePollinationsImage - A function that generates an image based on a text prompt.
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
  imageUrl: z.string().url().describe('The URL of the generated image.'),
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
    // Construct the URL for Pollinations.ai with specific parameters for a photorealistic style
    const fullPrompt = `${prompt}, professional automotive photography, high detail, photorealistic, 8k`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    // Add width and height parameters to the URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true`;
    
    return { imageUrl };
  }
);
