'use server';

/**
 * @fileOverview A flow that performs live web searches using the Apify API.
 *
 * - liveSearch - A function that handles the search process.
 * - LiveSearchInput - The input type for the liveSearch function.
 * - LiveSearchOutput - The return type for the liveSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LiveSearchInputSchema = z.object({
  query: z.string().describe('The search query from the user.'),
});
export type LiveSearchInput = z.infer<typeof LiveSearchInputSchema>;

const OrganicResultSchema = z.object({
    position: z.number(),
    title: z.string(),
    link: z.string(),
    snippet: z.string(),
});

const LiveSearchOutputSchema = z.object({
  organic_results: z.array(OrganicResultSchema).describe("A list of organic search results."),
});
export type LiveSearchOutput = z.infer<typeof LiveSearchOutputSchema>;

// This tool will call the Apify API to get live search results.
const getSearchResultsTool = ai.defineTool(
  {
    name: 'getSearchResults',
    description: 'Fetches live search results from the Apify API for a given query.',
    inputSchema: LiveSearchInputSchema,
    outputSchema: LiveSearchOutputSchema,
  },
  async (input) => {
    // IMPORTANT: Make sure to add your APIFY_API_TOKEN to the .env file
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken || apiToken === "your_apify_api_token_here") {
        console.error("Apify API token is not set in .env file.");
        // Return dummy data if API key is not set
        return { 
            organic_results: [
                {
                    position: 1,
                    title: "Apify API Token not configured",
                    link: "#",
                    snippet: "Please add your APIFY_API_TOKEN to the .env file to enable live search."
                }
            ]
        };
    }
    
    // Using Apify's synchronous run endpoint for the Google Search scraper
    const actorId = "apify/google-search-scraper";
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries: input.query }),
      });

      if (!response.ok) {
        throw new Error(`Apify API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Apify's Google Search Scraper can return multiple result sets if multiple queries are sent.
      // We are sending one, so we take the first result set.
      const searchResult = data[0];
      if (!searchResult || !searchResult.organicResults) {
        return { organic_results: [] };
      }

      // Ensure we only return the fields defined in our schema
      const validatedResults = searchResult.organicResults
        .filter((res: any) => res.title && res.link && res.snippet) // Ensure essential fields exist
        .map((res: any, index: number) => ({
          position: res.position || index + 1, // Use provided position or fallback to index
          title: res.title,
          link: res.link,
          snippet: res.snippet
      }));

      return { organic_results: validatedResults };
    } catch (error) {
      console.error('Error fetching from Apify API:', error);
      throw new Error('Failed to fetch search results from Apify API.');
    }
  }
);


const prompt = ai.definePrompt({
  name: 'liveSearchPrompt',
  input: { schema: LiveSearchInputSchema },
  output: { schema: LiveSearchOutputSchema },
  tools: [getSearchResultsTool],
  prompt: `You are a search assistant. Use the getSearchResults tool to find information about the user's query: {{{query}}}. Return the search results directly.`,
});


const liveSearchFlow = ai.defineFlow(
  {
    name: 'liveSearchFlow',
    inputSchema: LiveSearchInputSchema,
    outputSchema: LiveSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

// Exported wrapper function to be called from the frontend.
export async function liveSearch(input: LiveSearchInput): Promise<LiveSearchOutput> {
  return liveSearchFlow(input);
}
