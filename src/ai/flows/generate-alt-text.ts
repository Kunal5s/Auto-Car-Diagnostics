// generateAltText story: As an admin, when an image is generated for my article, I want AI to automatically write a descriptive, SEO-friendly alt text for it, so I don't have to do it manually.

'use server';

/**
 * @fileOverview Generates SEO-friendly alt text for an image based on an article's topic.
 *
 * - generateAltText - A function that generates the alt text.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAltTextInputSchema = z.object({
  articleTitle: z.string().describe('The title of the article the image is for.'),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated SEO-friendly alt text for the image, around 23 words.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  return generateAltTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAltTextPrompt',
  input: {schema: GenerateAltTextInputSchema},
  output: {schema: GenerateAltTextOutputSchema},
  prompt: `You are an SEO expert specializing in the automotive industry. Your task is to write a detailed, SEO-friendly alt text for an image. The image is the featured image for a blog post with the following title: "{{{articleTitle}}}".

  The alt text should:
  1.  Be approximately 23 words long.
  2.  Accurately describe a potential image related to the article title.
  3.  Incorporate relevant keywords from the title naturally.
  4.  Be descriptive and useful for visually impaired users.

  Generate the alt text now.
  `,
  config: {
    model: 'gemini-1.5-flash-latest' // Use Gemini 1.5 as requested
  }
});

const generateAltTextFlow = ai.defineFlow(
  {
    name: 'generateAltTextFlow',
    inputSchema: GenerateAltTextInputSchema,
    outputSchema: GenerateAltTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
