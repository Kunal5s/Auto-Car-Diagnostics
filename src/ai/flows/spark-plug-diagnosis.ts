
'use server';

/**
 * @fileOverview This flow is deprecated as vision model features have been removed.
 */

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
      'Damaged',
      'Unknown'
    ]).describe("The diagnosed condition of the spark plug based on the image."),
  analysis: z.string().describe("A detailed analysis explaining the visual indicators that led to the diagnosis."),
  recommendation: z.string().describe("The recommended course of action (e.g., 'Clean and reinstall', 'Replacement recommended')."),
});
export type SparkPlugDiagnosisOutput = z.infer<typeof SparkPlugDiagnosisOutputSchema>;


export async function diagnoseSparkPlug(input: SparkPlugDiagnosisInput): Promise<SparkPlugDiagnosisOutput> {
  // This flow is deprecated.
  throw new Error("The AI spark plug diagnosis feature is currently unavailable.");
}
