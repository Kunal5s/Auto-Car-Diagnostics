
'use server';

/**
 * @fileOverview Provides an explanation for a selected car dashboard warning light.
 *
 * - getWarningLightExplanation - A function that returns details about a warning light.
 * - WarningLightInput - The input type for the function.
 * - WarningLightOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WarningLightInputSchema = z.object({
  lightName: z.string().describe('The common name of the dashboard warning light, e.g., "Check Engine Light", "Oil Pressure Light".'),
});
export type WarningLightInput = z.infer<typeof WarningLightInputSchema>;

const WarningLightOutputSchema = z.object({
  meaning: z.string().describe("A clear and concise explanation of what the selected warning light means."),
  severity: z.enum(['Low', 'Medium', 'High']).describe("The severity level of the warning. 'Low' for informational, 'Medium' for 'check soon', 'High' for 'stop driving immediately'."),
  action: z.string().describe("The recommended course of action for the driver when this light comes on."),
});
export type WarningLightOutput = z.infer<typeof WarningLightOutputSchema>;

export async function getWarningLightExplanation(input: WarningLightInput): Promise<WarningLightOutput> {
  return warningLightGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'warningLightPrompt',
  input: { schema: WarningLightInputSchema },
  output: { schema: WarningLightOutputSchema },
  prompt: `You are an expert automotive mechanic. A user has selected a dashboard warning light and needs to understand it.

Warning Light: {{{lightName}}}

Please provide the following information in a clear and easy-to-understand manner for a non-expert:
1.  **Meaning**: What does this light indicate?
2.  **Severity**: How serious is this warning? Choose from: 'Low' (e.g., info, washer fluid low), 'Medium' (e.g., check soon, service required), or 'High' (e.g., potential damage, stop driving safely).
3.  **Action**: What should the driver do immediately and in the near future?

Generate the response now.`,
});

const warningLightGuideFlow = ai.defineFlow(
  {
    name: 'warningLightGuideFlow',
    inputSchema: WarningLightInputSchema,
    outputSchema: WarningLightOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Could not generate an explanation for the warning light.");
    }
    return output;
  }
);

