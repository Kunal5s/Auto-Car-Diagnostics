
'use server';
/**
 * @fileOverview A flow for generating multiple images in parallel using Gemini 2.0 Flash.
 *
 * - generateMultipleGeminiImages - A function that takes an array of prompts and returns an array of image data URIs.
 * - GenerateMultipleGeminiImagesInput - The input type for the function.
 * - GenerateMultipleGeminiImagesOutput - The return type for the function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GenerateMultipleGeminiImagesInputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of text prompts to generate images from.'),
});
export type GenerateMultipleGeminiImagesInput = z.infer<typeof GenerateMultipleGeminiImagesInputSchema>;

const GeneratedImageSchema = z.object({
    prompt: z.string(),
    url: z.string().describe('The data URI of the generated image.'),
});

const GenerateMultipleGeminiImagesOutputSchema = z.object({
  images: z.array(GeneratedImageSchema).describe('An array of generated image data URIs.'),
});
export type GenerateMultipleGeminiImagesOutput = z.infer<typeof GenerateMultipleGeminiImagesOutputSchema>;

export async function generateMultipleGeminiImages(input: GenerateMultipleGeminiImagesInput): Promise<GenerateMultipleGeminiImagesOutput> {
    return generateMultipleGeminiImagesFlow(input);
}

const generateMultipleGeminiImagesFlow = ai.defineFlow(
  {
    name: 'generateMultipleGeminiImagesFlow',
    inputSchema: GenerateMultipleGeminiImagesInputSchema,
    outputSchema: GenerateMultipleGeminiImagesOutputSchema,
  },
  async ({ prompts }) => {
    const imagePromises = prompts.map(prompt =>
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: prompt,
        config: {
          responseModalities: ['IMAGE'],
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ]
        },
      })
    );

    const results = await Promise.all(imagePromises);

    const images = results.map((result, index) => {
      if (!result.media?.url) {
        throw new Error(`Image generation failed for prompt: "${prompts[index]}"`);
      }
      return {
        prompt: prompts[index],
        url: result.media.url,
      };
    });

    return { images };
  }
);
