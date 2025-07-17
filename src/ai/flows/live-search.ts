
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
import { ApifyClient } from 'apify-client';

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
    
    const client = new ApifyClient({ token: apiToken });
    const actorId = "apify/google-search-scraper";

    try {
      // Run the actor and wait for it to finish
      const run = await client.actor(actorId).call({
        queries: input.query,
        resultsPerPage: 10,
      });

      // Fetch actor results from the run's dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      const searchResult = items?.[0] as any;

      if (!searchResult || !Array.isArray(searchResult.organicResults)) {
        console.warn("No organicResults found in Apify response:", items);
        return { organic_results: [] };
      }
      
      // Ensure we only return the fields defined in our schema and filter out any invalid entries
      const validatedResults = searchResult.organicResults
        .map((res: any, index: number) => ({
          position: res.position || index + 1, // Use provided position or fallback to index
          title: res.title || "Untitled",
          link: res.url || "#", // Apify uses 'url', not 'link'
          snippet: res.description || "No snippet available." // Apify uses 'description', not 'snippet'
        }))
        .filter((res: any) => {
          // Add a safe parse check to ensure data conforms to our schema
          const parsed = OrganicResultSchema.safeParse(res);
          if (!parsed.success) {
            console.warn("Invalid search result item filtered out:", res, parsed.error);
          }
          return parsed.success;
        });
        
      return { organic_results: validatedResults };

    } catch (error) {
      console.error('Error fetching from Apify API:', error);
      // It's better to throw the error so the frontend can catch it and display a message.
      throw new Error('Failed to fetch search results from Apify API.');
    }
  }
);

const liveSearchFlow = ai.defineFlow(
  {
    name: 'liveSearchFlow',
    inputSchema: LiveSearchInputSchema,
    outputSchema: LiveSearchOutputSchema,
  },
  async (input) => {
    // Call the tool directly instead of going through an LLM
    return await getSearchResultsTool(input);
  }
);

// Exported wrapper function to be called from the frontend.
export async function liveSearch(input: LiveSearchInput): Promise<LiveSearchOutput> {
  return liveSearchFlow(input);
}
