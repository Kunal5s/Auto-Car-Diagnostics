
'use server';

/**
 * @fileOverview Visually analyzes a spark plug image to diagnose its condition.
 *
 * - diagnoseSparkPlug - A function that returns a diagnosis for a spark plug image.
 * - SparkPlugDiagnosisInput - The input type for the function.
 * - SparkPlugDiagnosisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SparkPlugDiagnosisInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a spark plug, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SparkPlugDiagnosisInput = z.infer<typeof SparkPlugDiagnosisInputSchema>;

const SparkPlugDiagnosisOutputSchema = z.object({
  condition: z.enum([
      'Normal', 
      'Carbon-Fouled', 
      'Oil-Fouled', 
      'Overheated', 
      'Worn Out', 
      'Damaged'
    ]).describe("The diagnosed condition of the spark plug based on the image."),
  analysis: z.string().describe("A detailed analysis explaining the visual indicators that led to the diagnosis."),
  recommendation: z.string().describe("The recommended course of action (e.g., 'Clean and reinstall', 'Replacement recommended')."),
});
export type SparkPlugDiagnosisOutput = z.infer<typeof SparkPlugDiagnosisOutputSchema>;


export async function diagnoseSparkPlug(input: SparkPlugDiagnosisInput): Promise<SparkPlugDiagnosisOutput> {
  return sparkPlugDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sparkPlugDiagnosisPrompt',
  input: { schema: SparkPlugDiagnosisInputSchema },
  output: { schema: SparkPlugDiagnosisOutputSchema },
  prompt: `You are an expert mechanic specializing in engine diagnostics. Analyze the provided image of a spark plug.

Based on the visual characteristics of the electrode, insulator, and threads in the image, determine the spark plug's condition.

Image of Spark Plug: {{media url=imageDataUri}}

Your analysis should identify key features like carbon deposits (black, sooty), oil residue (shiny, black), blistering or melting on the insulator (overheating), or excessive wear on the electrode.

Provide the following:
1.  **Condition**: Choose one of the following: Normal, Carbon-Fouled, Oil-Fouled, Overheated, Worn Out, Damaged.
2.  **Analysis**: A brief explanation of the visual evidence.
3.  **Recommendation**: What should the user do next?
`,
});

const sparkPlugDiagnosisFlow = ai.defineFlow(
  {
    name: 'sparkPlugDiagnosisFlow',
    inputSchema: SparkPlugDiagnosisInputSchema,
    outputSchema: SparkPlugDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Could not generate a diagnosis for the spark plug image.");
    }
    return output;
  }
);
