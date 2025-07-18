
'use server';

/**
 * @fileOverview A flow for generating multiple, contextually relevant images for an article using Pollinations.ai.
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
  imageUrl: z.string().url().describe('The URL of the generated image.'),
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
        imagePrompt: z.string().describe('A descriptive, photorealistic image prompt based on the subheading and article context.'),
        subheading: z.string().describe("The exact text content of the H2 subheading the image should be placed under."),
    })) })},
    prompt: `You are an expert content strategist and visual director. Your task is to analyze an HTML article and create compelling, photorealistic image prompts to be placed after key subheadings.

You will be given the article's HTML content. First, identify all of the H2 subheadings. From that list, select the best {{{imageCount}}} subheadings to have an image placed after them.

For each selected subheading, create a detailed, specific, and photorealistic image prompt that visually represents the content of that section. The prompt should be suitable for a text-to-image AI like Pollinations.ai.

Return an array of objects, each containing:
1. 'subheading': The exact text of the H2 subheading.
2. 'imagePrompt': The generated photorealistic image prompt.

Article Title: {{{articleTitle}}}
Category: {{{category}}}
Article HTML Content:
---
{{{articleContent}}}
---

Generate exactly {{{imageCount}}} placement instructions with unique image prompts.
    `,
});

const generateArticleImagesFlow = ai.defineFlow(
  {
    name: 'generateArticleImagesFlow',
    inputSchema: GenerateArticleImagesInputSchema,
    outputSchema: GenerateArticleImagesOutputSchema,
  },
  async (input) => {
    // 1. Generate the placement instructions and image prompts using Gemini.
    const { output } = await placementPrompt(input);
    
    if (!output || !output.placements || output.placements.length === 0) {
        throw new Error("AI could not determine where to place images or create prompts from the article content.");
    }
    
    // 2. For each placement, create an image URL using the generated prompt.
    const placementsWithUrls = output.placements.map(placement => {
        const enhancedPrompt = `${placement.imagePrompt}, 4k, photorealistic`;
        const sanitizedPrompt = encodeURIComponent(enhancedPrompt.trim().replace(/\s+/g, " "));
        // We add a negative prompt to the URL to avoid text, watermarks, logos, and malformed features.
        const imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?width=600&height=400&negative_prompt=text%2C+logo%2C+watermark%2C+deformed%2C+ugly`;
        
        return {
            imageUrl,
            subheading: placement.subheading,
        };
    });

    return {
        placements: placementsWithUrls,
    };
  }
);
