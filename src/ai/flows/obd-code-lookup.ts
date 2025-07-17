
'use server';

/**
 * @fileOverview A flow for looking up OBD-II codes using the CarAPI.app service.
 *
 * - lookupObdCode - A function that takes an OBD code and returns its definition.
 * - ObdCodeInput - The input type for the lookupObdCode function.
 * - ObdCodeOutput - The return type for the lookupObdCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { fetchCarApiData } from '@/lib/carapi';

// Input Schema
const ObdCodeInputSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{4,5}$/, { message: 'Invalid OBD code format.' }).describe('The OBD-II diagnostic trouble code, e.g., P0300.'),
});
export type ObdCodeInput = z.infer<typeof ObdCodeInputSchema>;

// Output Schema
const ObdCodeOutputSchema = z.object({
  code: z.string(),
  definition: z.string().describe('The detailed definition of the OBD-II code.'),
});
export type ObdCodeOutput = z.infer<typeof ObdCodeOutputSchema>;


// Wrapper Function for the UI to call
export async function lookupObdCode(input: ObdCodeInput): Promise<ObdCodeOutput> {
  return obdCodeLookupFlow(input);
}

// Define the Genkit Flow
const obdCodeLookupFlow = ai.defineFlow(
  {
    name: 'obdCodeLookupFlow',
    inputSchema: ObdCodeInputSchema,
    outputSchema: ObdCodeOutputSchema,
  },
  async ({ code }) => {
    try {
        const codeData = await fetchCarApiData(`obd-codes/${code.toUpperCase()}`);

        if (!codeData || !codeData.definition) {
            throw new Error(`Definition not found for code ${code}. Please check the code and try again.`);
        }

        return {
            code: codeData.code,
            definition: codeData.definition,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
             throw new Error(`The OBD code "${code}" was not found. Please verify the code is correct.`);
        }
        throw error;
    }
  }
);
