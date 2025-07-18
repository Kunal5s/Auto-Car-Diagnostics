
'use server';
/**
 * @fileOverview A flow for generating images using Pollinations.ai.
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
  imageUrl: z.string().url().describe('The URL of the generated image from Pollinations.ai.'),
});
export type GeneratePollinationsImageOutput = z.infer<typeof GeneratePollinationsImageOutputSchema>;

export async function generatePollinationsImage(input: GeneratePollinationsImageInput): Promise<GeneratePollinationsImageOutput> {
  const encodedPrompt = encodeURIComponent(input.prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
  
  // Optional: You could add a check here to see if the image URL is valid before returning,
  // but for Pollinations, it's generally reliable to construct the URL directly.
  // const response = await fetch(imageUrl, { method: 'HEAD' });
  // if (!response.ok) {
  //   throw new Error('Pollinations.ai failed to generate or provide an image for the prompt.');
  // }

  return { imageUrl };
}
