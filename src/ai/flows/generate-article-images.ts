
'use server';

/**
 * @fileOverview A flow for generating multiple, contextually relevant images for an article and determining their optimal placement.
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
  imageCount: z.number().int().min(1).max(10).describe('The number of images to generate for the article body.'),
});
export type GenerateArticleImagesInput = z.infer<typeof GenerateArticleImagesInputSchema>;

const ImagePlacementInstructionSchema = z.object({
  prompt: z.string().describe('The generated photorealistic prompt for the image.'),
  subheading: z.string().describe("The exact text content of the H2 subheading the image should be placed under."),
});

const GenerateArticleImagesOutputSchema = z.object({
  placements: z.array(ImagePlacementInstructionSchema).describe('An array of instructions for image generation and placement.'),
});
export type GenerateArticleImagesOutput = z.infer<typeof GenerateArticleImagesOutputSchema>;

export async function generateArticleImages(input: GenerateArticleImagesInput): Promise<GenerateArticleImagesOutput> {
  return generateArticleImagesFlow(input);
}

const placementPrompt = ai.definePrompt({
    name: 'generateImagePlacements',
    input: { schema: GenerateArticleImagesInputSchema },
    output: { schema: GenerateArticleImagesOutputSchema },
    prompt: `You are an expert content strategist. Your task is to analyze an HTML article and decide where to best place a specified number of images to break up the text and add visual interest.

You will be given the article's HTML content. First, identify all of the H2 subheadings in the text. From that list of H2s, select the best {{{imageCount}}} subheadings to have an image placed directly after them.

For each selected subheading, you must generate a unique, photorealistic image prompt that is directly relevant to the content in the section following that subheading.

Return an array of placement objects, each containing the exact text of the H2 subheading and the corresponding image prompt you created.

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
    // 1. Generate the placement instructions using the AI
    const { output } = await placementPrompt(input);
    
    if (!output || !output.placements || output.placements.length === 0) {
        throw new Error('Could not generate image placement instructions from the article content.');
    }
    
    // The output now contains both the prompts and the subheadings for placement.
    // The frontend will handle the URL creation and insertion.
    return output;
  }
);
