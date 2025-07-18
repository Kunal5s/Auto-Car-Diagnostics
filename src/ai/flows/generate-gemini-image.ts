
'use server';
/**
 * @fileOverview A flow for generating a single image using the Gemini 2.0 Flash model.
 *
 * - generateGeminiImage - A function that returns a data URI for a generated image.
 * - GenerateGeminiImageInput - The input type for the function.
 * - GenerateGeminiImageOutput - The return type for the function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GenerateGeminiImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateGeminiImageInput = z.infer<typeof GenerateGeminiImageInputSchema>;

const GenerateGeminiImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateGeminiImageOutput = z.infer<typeof GenerateGeminiImageOutputSchema>;

export async function generateGeminiImage(input: GenerateGeminiImageInput): Promise<GenerateGeminiImageOutput> {
    return generateGeminiImageFlow(input);
}


const generateGeminiImageFlow = ai.defineFlow(
  {
    name: 'generateGeminiImageFlow',
    inputSchema: GenerateGeminiImageInputSchema,
    outputSchema: GenerateGeminiImageOutputSchema,
  },
  async ({ prompt }) => {
    
    const { media } = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
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
    });

    if (!media?.url) {
      throw new Error("Image generation failed to produce an image.");
    }

    return { imageUrl: media.url };
  }
);
