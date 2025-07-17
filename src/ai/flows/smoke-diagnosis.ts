
'use server';

/**
 * @fileOverview Provides a diagnosis based on the color of exhaust smoke.
 *
 * - getSmokeDiagnosis - A function that returns a diagnosis for a given smoke color.
 * - SmokeDiagnosisInput - The input type for the function.
 * - SmokeDiagnosisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const SmokeDiagnosisInputSchema = z.object({
  smokeColor: z.enum(['White', 'Blue', 'Black']).describe('The color of the exhaust smoke.'),
});
export type SmokeDiagnosisInput = z.infer<typeof SmokeDiagnosisInputSchema>;

export const SmokeDiagnosisOutputSchema = z.object({
  possibleCauses: z.array(z.string()).describe("A list of the most likely causes for this color of smoke."),
  severity: z.enum(['Low', 'Medium', 'High']).describe("The potential severity of the underlying issue. 'Low' for minor issues, 'Medium' for 'should be checked soon', 'High' for 'potentially serious engine damage'."),
  recommendation: z.string().describe("The recommended course of action for the driver."),
});
export type SmokeDiagnosisOutput = z.infer<typeof SmokeDiagnosisOutputSchema>;

export async function getSmokeDiagnosis(input: SmokeDiagnosisInput): Promise<SmokeDiagnosisOutput> {
  return smokeDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smokeDiagnosisPrompt',
  input: { schema: SmokeDiagnosisInputSchema },
  output: { schema: SmokeDiagnosisOutputSchema },
  prompt: `You are an expert mechanic diagnosing a car problem based on its exhaust smoke color. The user has reported seeing {{{smokeColor}}} smoke.

Please provide the following information for a non-expert user:
1.  **Possible Causes**: List the most common reasons for this smoke color.
2.  **Severity**: How serious is this? Choose from: 'Low', 'Medium', or 'High'.
3.  **Recommendation**: What should the driver do?

Generate the response now.`,
});

const smokeDiagnosisFlow = ai.defineFlow(
  {
    name: 'smokeDiagnosisFlow',
    inputSchema: SmokeDiagnosisInputSchema,
    outputSchema: SmokeDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Could not generate a diagnosis for the smoke color.");
    }
    return output;
  }
);
