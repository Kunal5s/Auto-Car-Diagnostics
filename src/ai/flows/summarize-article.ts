
'use server';

/**
 * @fileOverview This flow is deprecated as text generation features have been removed.
 * It now throws an error to indicate it is non-functional.
 */

import { z } from 'zod';

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
