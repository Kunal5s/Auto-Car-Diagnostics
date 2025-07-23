
'use server';

/**
 * @fileOverview A flow for looking up OBD-II codes. THIS FEATURE IS DISABLED.
 * The connection to the external CarAPI.app service has been removed.
 *
 * - lookupObdCode - This function will now throw an error.
 * - ObdCodeInput - The input type for the lookupObdCode function.
 * - ObdCodeOutput - The return type for the lookupObdCode function.
 */

import { z } from 'zod';

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


// This function is now non-operational.
export async function lookupObdCode({ code }: ObdCodeInput): Promise<ObdCodeOutput> {
    throw new Error(`The OBD Code Lookup service is currently unavailable.`);
}
