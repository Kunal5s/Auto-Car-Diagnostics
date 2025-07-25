
'use server';

/**
 * @fileOverview A flow for generating multiple, contextually relevant images for an article and determining their optimal placement.
 * This version uses reliable placeholder images.
 *
 * - generateArticleImages - A function that analyzes article content and generates images with placement instructions.
 * - GenerateArticleImagesInput - The input type for the function.
 * - GenerateArticleImagesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateArticleImagesInputSchema = z.object({
  articleContent: z.string().describe('The full HTML content of the article.'),
  articleTitle: z.string().describe('The title of the article.'),
  category: z.string().describe('The category of the article.'),
  imageCount: z.number().int().min(1).max(30).describe('The number of images to generate for the article body.'),
});
export type GenerateArticleImagesInput = z.infer<typeof GenerateArticleImagesInputSchema>;

const ImagePlacementInstructionSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the generated placeholder image.'),
  subheading: z.string().describe("The exact text content of the H2 subheading the image should be placed under."),
});

const GenerateArticleImagesOutputSchema = z.object({
  placements: z.array(ImagePlacementInstructionSchema).describe('An array of generated image URLs and their placement instructions.'),
});
export type GenerateArticleImagesOutput = z.infer<typeof GenerateArticleImagesOutputSchema>;


export async function generateArticleImages(input: GenerateArticleImagesInput): Promise<GenerateArticleImagesOutput> {
  return generateArticleImagesFlow(input);
}

const placementPrompt = ai.definePrompt({
    name: 'generateImagePlacementsWithPrompts',
    input: { schema: GenerateArticleImagesInputSchema },
    output: { schema: z.object({ placements: z.array(z.object({
        // The imagePrompt is no longer needed as we use placeholders, but we keep the structure for subheading targeting.
        subheading: z.string().describe("The exact text content of the H2 subheading the image should be placed under."),
    })) })},
    prompt: `You are an expert content strategist. Your task is to analyze an HTML article and decide where to best place a specified number of images to break up the text and add visual interest.

You will be given the article's HTML content. First, identify all of the H2 subheadings in the text. From that list of H2s, select the best {{{imageCount}}} subheadings to have an image placed directly after them.

Return an array of placement objects, each containing the exact text of the H2 subheading.

Article Title: {{{articleTitle}}}
Category: {{{category}}}
Article HTML Content:
---
{{{articleContent}}}
---

Generate exactly {{{imageCount}}} placement instructions.
    `,
});

const generateArticleImagesFlow = ai.defineFlow(
  {
    name: 'generateArticleImagesFlow',
    inputSchema: GenerateArticleImagesInputSchema,
    outputSchema: GenerateArticleImagesOutputSchema,
  },
  async (input) => {
    // 1. Generate the placement instructions (subheadings) using Gemini
    const { output } = await placementPrompt(input);
    
    if (!output || !output.placements || output.placements.length === 0) {
        throw new Error('Could not generate image placement instructions from the article content.');
    }
    
    // 2. For each placement, create a placeholder image URL
    const placementsWithUrls = output.placements.map(placement => ({
        imageUrl: `https://placehold.co/600x400.png`,
        subheading: placement.subheading,
    }));

    return {
        placements: placementsWithUrls,
    };
  }
);
