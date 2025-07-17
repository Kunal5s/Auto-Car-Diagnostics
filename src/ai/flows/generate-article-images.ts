
'use server';

/**
 * @fileOverview A flow for generating multiple, contextually relevant images for an article.
 *
 * - generateArticleImages - A function that analyzes article content and generates a specified number of images.
 * - GenerateArticleImagesInput - The input type for the function.
 * - GenerateArticleImagesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateArticleImagesInputSchema = z.object({
  articleContent: z.string().describe('The full text content of the article.'),
  articleTitle: z.string().describe('The title of the article.'),
  category: z.string().describe('The category of the article.'),
  imageCount: z.number().int().min(1).max(10).describe('The number of images to generate for the article body.'),
});
export type GenerateArticleImagesInput = z.infer<typeof GenerateArticleImagesInputSchema>;

const GenerateArticleImagesOutputSchema = z.object({
  imageUrls: z.array(z.string()).describe('An array of data URIs for the generated images.'),
});
export type GenerateArticleImagesOutput = z.infer<typeof GenerateArticleImagesOutputSchema>;

export async function generateArticleImages(input: GenerateArticleImagesInput): Promise<GenerateArticleImagesOutput> {
  return generateArticleImagesFlow(input);
}


const topicPrompt = ai.definePrompt({
    name: 'generateImageTopics',
    input: { schema: GenerateArticleImagesInputSchema },
    output: { schema: z.object({ topics: z.array(z.string()).describe('A list of diverse, specific, and visually interesting image prompts.') }) },
    prompt: `Based on the following article content, generate {{{imageCount}}} distinct and visually compelling image prompts. Each prompt should be a short phrase describing a specific scene, concept, or component mentioned in the article. The prompts should be suitable for a photorealistic image generation model.

    Article Title: {{{articleTitle}}}
    Category: {{{category}}}
    Article Content:
    ---
    {{{articleContent}}}
    ---

    Generate exactly {{{imageCount}}} prompts.
    `,
});


const generateArticleImagesFlow = ai.defineFlow(
  {
    name: 'generateArticleImagesFlow',
    inputSchema: GenerateArticleImagesInputSchema,
    outputSchema: GenerateArticleImagesOutputSchema,
  },
  async (input) => {
    // 1. Generate descriptive topics from the article content
    const { output } = await topicPrompt(input);
    const topics = output?.topics || [];

    if (topics.length === 0) {
        throw new Error('Could not generate image topics from article content.');
    }

    // 2. Generate an image for each topic in parallel
    const imagePromises = topics.map(topic => {
        const fullPrompt = `${topic}, related to ${input.articleTitle}, professional automotive photography, high detail, photorealistic`;
        return ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: fullPrompt,
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
        });
    });

    const results = await Promise.all(imagePromises);

    const imageUrls = results.map(result => {
        if (!result.media.url) {
            console.warn('Image generation failed for one of the topics.');
            // Return a placeholder or handle the error as needed
            return 'https://placehold.co/600x400.png';
        }
        return result.media.url;
    });

    return { imageUrls };
  }
);
