
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
    // Add safety settings to prevent generation of harmful content
    // This helps avoid errors from the image service for unsafe prompts
    config: {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH', // Allow some creative prompts but block clearly dangerous ones
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ]
    }
  },
  async ({ prompt, seed }) => {
    // Sanitize the prompt for the URL
    const sanitizedPrompt = encodeURIComponent(prompt.trim().replace(/\s+/g, " "));
    
    // Construct the base URL
    let imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}`;
    
    // Append the seed if provided
    if (seed) {
        imageUrl += `?seed=${seed}`;
    }

    return { imageUrl };
  }
);
