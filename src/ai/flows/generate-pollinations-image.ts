
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
  seed: z.number().optional().describe('A random seed for varied image output.'),
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
  async ({ prompt, seed }) => {
    // Sanitize the prompt for the URL
    // IMPORTANT: We add common negative prompts to improve image quality and avoid common issues.
    const enhancedPrompt = `${prompt}, 4k, photorealistic, high quality, sharp focus`;
    const sanitizedPrompt = encodeURIComponent(enhancedPrompt.trim().replace(/\s+/g, " "));
    
    // Construct the base URL
    // We add a negative prompt to the URL to avoid text, watermarks, logos, and malformed features.
    let imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?negative_prompt=text%2C+logo%2C+watermark%2C+deformed%2C+ugly&`;
    
    // Append the seed if provided
    if (seed) {
        imageUrl += `seed=${seed}&`;
    }

    // Return the URL without width/height, as they will be added on the client-side
    return { imageUrl };
  }
);
