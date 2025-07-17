
'use server';
/**
 * @fileOverview A flow for generating images using Pollinations.ai.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image from Pollinations.ai.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  // Construct the URL for Pollinations.ai
  const encodedPrompt = encodeURIComponent(input.prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
  
  // Directly return the URL without calling Genkit, as requested.
  return {
    imageUrl: imageUrl
  };
}
