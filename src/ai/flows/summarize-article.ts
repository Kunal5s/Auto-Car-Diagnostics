
'use server';

/**
 * @fileOverview This flow is deprecated as text generation features have been removed.
 */

import { z } from 'genkit';

const SummarizeArticleInputSchema = z.object({
  articleText: z.string().describe('The text content of the car repair article to summarize.'),
});
type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the car repair article.'),
});
type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  // This flow is deprecated.
  throw new Error("The AI summarizer feature is currently unavailable.");
}
