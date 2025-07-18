
'use server';

/**
 * @fileOverview Generates SEO-friendly alt text for an image based on an article's topic.
 * This flow is deprecated in favor of a simpler, more reliable alt text generation method.
 * It now returns a simple alt text based on the title to avoid AI model calls.
 */

import {z} from 'genkit';

const GenerateAltTextInputSchema = z.object({
  articleTitle: z.string().describe('The title of the article the image is for.'),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('A simple alt text for the image.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  // Return a simple, descriptive alt text without calling an AI model to ensure stability.
  return Promise.resolve({ altText: `Featured image for article titled: ${input.articleTitle}` });
}
