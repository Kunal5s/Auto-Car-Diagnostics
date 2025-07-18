
'use server';

/**
 * @fileOverview Provides a diagnosis based on the color of exhaust smoke using a static data map.
 * This has been updated to remove any Genkit or external AI dependency.
 *
 * - getSmokeDiagnosis - A function that returns a diagnosis for a given smoke color.
 * - SmokeDiagnosisInput - The input type for the function.
 * - SmokeDiagnosisOutput - The return type for the function.
 */

import { z } from 'zod';

const SmokeDiagnosisInputSchema = z.object({
  smokeColor: z.enum(['White', 'Blue', 'Black']).describe('The color of the exhaust smoke.'),
});
export type SmokeDiagnosisInput = z.infer<typeof SmokeDiagnosisInputSchema>;

const SmokeDiagnosisOutputSchema = z.object({
  possibleCauses: z.array(z.string()).describe("A list of the most likely causes for this color of smoke."),
  severity: z.enum(['Low', 'Medium', 'High']).describe("The potential severity of the underlying issue. 'Low' for minor issues, 'Medium' for 'should be checked soon', 'High' for 'potentially serious engine damage'."),
  recommendation: z.string().describe("The recommended course of action for the driver."),
});
export type SmokeDiagnosisOutput = z.infer<typeof SmokeDiagnosisOutputSchema>;

const smokeData: Record<SmokeDiagnosisInput['smokeColor'], SmokeDiagnosisOutput> = {
    White: {
        possibleCauses: ["Normal condensation (if it disappears quickly)", "Blown head gasket (if thick and persistent)", "Cracked cylinder head or engine block"],
        severity: "High",
        recommendation: "If the smoke is thick and smells sweet, it's likely coolant. This is a serious issue. Do not drive the vehicle and have it inspected by a professional immediately."
    },
    Blue: {
        possibleCauses: ["Worn piston rings or valve seals", "Failing PCV (Positive Crankcase Ventilation) valve", "Overfilled with engine oil"],
        severity: "Medium",
        recommendation: "The engine is burning oil, which can lead to fouled spark plugs and catalytic converter damage over time. Monitor your oil level closely and schedule a professional diagnosis."
    },
    Black: {
        possibleCauses: ["Clogged air filter", "Malfunctioning fuel injector or fuel pressure regulator", "Faulty sensor (e.g., MAF sensor)"],
        severity: "Medium",
        recommendation: "The engine is burning too much fuel. This will hurt fuel economy and can damage sensors. Check the air filter first, then seek a professional diagnosis if the problem persists."
    }
}

export async function getSmokeDiagnosis({ smokeColor }: SmokeDiagnosisInput): Promise<SmokeDiagnosisOutput> {
  const output = smokeData[smokeColor];
  if (!output) {
      throw new Error("Could not generate a diagnosis for the selected smoke color.");
  }
  return output;
}
