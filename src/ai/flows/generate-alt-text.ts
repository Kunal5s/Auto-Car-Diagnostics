
'use server';

/**
 * @fileOverview Generates SEO-friendly alt text for an image based on an article's topic.
 * This version uses a simple, non-AI approach to avoid external dependencies.
 */

import {z} from 'zod';

const GenerateAltTextInputSchema = z.object({
  articleTitle: z.string().describe('The title of the article the image is for.'),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated SEO-friendly alt text for the image.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  // Return a simple, descriptive alt text without calling an AI model.
  return Promise.resolve({ altText: `Featured image for article: ${input.articleTitle}` });
}
