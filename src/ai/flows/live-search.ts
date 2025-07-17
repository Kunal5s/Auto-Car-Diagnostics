'use server';

/**
 * @fileOverview A flow that performs live web searches using a SERP API.
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

// This tool will call the SERP API to get live search results.
const getSearchResultsTool = ai.defineTool(
  {
    name: 'getSearchResults',
    description: 'Fetches live search results from a SERP API for a given query.',
    inputSchema: LiveSearchInputSchema,
    outputSchema: LiveSearchOutputSchema,
  },
  async (input) => {
    // IMPORTANT: Make sure to add your SERP_API_KEY to the .env file
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey || apiKey === "your_serp_api_key_here") {
        console.error("SERP API key is not set in .env file.");
        // Return dummy data if API key is not set
        return { 
            organic_results: [
                {
                    position: 1,
                    title: "SERP API Key not configured",
                    link: "#",
                    snippet: "Please add your SERP_API_KEY to the .env file to enable live search."
                }
            ]
        };
    }

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      input.query
    )}&api_key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SERP API request failed with status ${response.status}`);
      }
      const data = await response.json();
      // Ensure we only return the fields defined in our schema
      const validatedResults = data.organic_results.map((res: any) => ({
          position: res.position,
          title: res.title,
          link: res.link,
          snippet: res.snippet
      }));
      return { organic_results: validatedResults };
    } catch (error) {
      console.error('Error fetching SERP API:', error);
      throw new Error('Failed to fetch search results from SERP API.');
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
