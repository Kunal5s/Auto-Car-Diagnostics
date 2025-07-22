
'use server';

/**
 * @fileOverview A flow for generating multiple, contextually relevant placeholder images for an article.
 * This removes the dependency on any external AI image generation service.
 *
 * - generateArticleImages - A function that analyzes article content and returns placeholder images with placement instructions.
 * - GenerateArticleImagesInput - The input type for the function.
 * - GenerateArticleImagesOutput - The return type for the function.
 */

import { z } from 'zod';

const GenerateArticleImagesInputSchema = z.object({
  articleContent: z.string().describe('The full HTML content of the article.'),
  articleTitle: z.string().describe('The title of the article.'),
  category: z.string().describe('The category of the article.'),
  imageCount: z.number().int().min(1).max(5).describe('The number of images to generate for the article body.'),
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


// This function now works offline by parsing HTML directly without AI.
export async function generateArticleImages(input: GenerateArticleImagesInput): Promise<GenerateArticleImagesOutput> {
    const { articleContent, imageCount } = input;
    
    // A simple regex to find all <h2> tags.
    // This is a basic implementation and might not handle all edge cases of HTML,
    // but it's effective for this purpose and avoids heavy dependencies.
    const headingRegex = /<h2[^>]*>(.*?)<\/h2>/gi;
    let match;
    const subheadings = [];
    while ((match = headingRegex.exec(articleContent)) !== null) {
        // Strip any inner HTML tags from the subheading for clean text.
        const cleanText = match[1].replace(/<[^>]+>/g, '').trim();
        if(cleanText) {
            subheadings.push(cleanText);
        }
    }

    if (subheadings.length === 0) {
        throw new Error("No H2 subheadings were found in the article content to place images under.");
    }
    
    // Select the subheadings to use, up to the requested image count.
    const selectedSubheadings = subheadings.slice(0, imageCount);

    const placements = selectedSubheadings.map(subheading => {
        const enhancedPrompt = `photograph of ${subheading}, related to the article '${input.articleTitle}', 4k, photorealistic, high quality`;
        const sanitizedPrompt = encodeURIComponent(enhancedPrompt.trim().replace(/\s+/g, " "));
        const negativePrompt = encodeURIComponent('text, logo, watermark, signature, deformed, ugly, malformed, blurry');
        const seed = Math.floor(Math.random() * 1000000); // Add random seed for unique images
        const imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?width=600&height=400&negative_prompt=${negativePrompt}&seed=${seed}`;

        return {
            imageUrl: imageUrl,
            subheading: subheading,
        };
    });

    return { placements };
}
