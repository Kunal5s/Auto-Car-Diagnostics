// vin-decoder.ts story: As a user, I want to enter my Vehicle Identification Number (VIN) to get detailed information about my car and check for any open safety recalls.

'use server';

/**
 * @fileOverview A flow for decoding a VIN and checking for recalls using the NHTSA API.
 *
 * - decodeVin - A function that takes a VIN and returns vehicle details and recall information.
 * - VinInput - The input type for the decodeVin function.
 * - VinOutput - The return type for the decodeVin function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const VinInputSchema = z.object({
  vin: z.string().length(17, { message: 'VIN must be exactly 17 characters.' }).describe('The 17-character Vehicle Identification Number.'),
});
export type VinInput = z.infer<typeof VinInputSchema>;

// Output Schema
const VehicleInfoSchema = z.object({
  Make: z.string(),
  Model: z.string(),
  ModelYear: z.string(),
  BodyClass: z.string().optional(),
  EngineCylinders: z.string().optional(),
  DisplacementL: z.string().optional(),
  FuelTypePrimary: z.string().optional(),
  PlantCity: z.string().optional(),
  PlantCountry: z.string().optional(),
});

const RecallInfoSchema = z.object({
  Manufacturer: z.string(),
  NHTSACampaignNumber: z.string(),
  ReportReceivedDate: z.string(),
  Component: z.string(),
  Summary: z.string(),
});

const VinOutputSchema = z.object({
  vehicleInfo: VehicleInfoSchema.describe('Detailed information about the decoded vehicle.'),
  recalls: z.array(RecallInfoSchema).describe('A list of safety recalls associated with the vehicle.'),
});
export type VinOutput = z.infer<typeof VinOutputSchema>;

// Wrapper Function for the UI to call
export async function decodeVin(input: VinInput): Promise<VinOutput> {
  return vinDecoderFlow(input);
}


// Define the Genkit Flow
const vinDecoderFlow = ai.defineFlow(
  {
    name: 'vinDecoderFlow',
    inputSchema: VinInputSchema,
    outputSchema: VinOutputSchema,
  },
  async ({ vin }) => {
    // 1. Decode the VIN
    const vinDetailsResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/${vin}?format=json`);
    if (!vinDetailsResponse.ok) {
        throw new Error(`Failed to fetch VIN details. Status: ${vinDetailsResponse.status}`);
    }
    const vinDetailsJson = await vinDetailsResponse.json();

    const vehicleData = vinDetailsJson.Results.find((r: any) => r.Variable === 'Make')?.Value ? vinDetailsJson.Results : [];
    if (vehicleData.length === 0) {
        throw new Error('Invalid VIN or no data found. Please check the VIN and try again.');
    }

    const getVal = (variable: string) => vehicleData.find((r: any) => r.Variable === variable)?.Value || '';

    const vehicleInfo: z.infer<typeof VehicleInfoSchema> = {
        Make: getVal('Make'),
        Model: getVal('Model'),
        ModelYear: getVal('Model Year'),
        BodyClass: getVal('Body Class'),
        EngineCylinders: getVal('Engine Number of Cylinders'),
        DisplacementL: getVal('Displacement (L)'),
        FuelTypePrimary: getVal('Fuel Type - Primary'),
        PlantCity: getVal('Plant City'),
        PlantCountry: getVal('Plant Country'),
    };

    if (!vehicleInfo.Make || !vehicleInfo.Model || !vehicleInfo.ModelYear) {
        throw new Error('Could not determine Make, Model, or Year from VIN.');
    }

    // 2. Fetch Recalls
    const recallsResponse = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${vehicleInfo.Make}&model=${vehicleInfo.Model}&modelYear=${vehicleInfo.ModelYear}`);
     if (!recallsResponse.ok) {
        // If recalls fail, don't throw an error, just return an empty array
        return { vehicleInfo, recalls: [] };
    }
    const recallsJson = await recallsResponse.json();

    const recalls: z.infer<typeof RecallInfoSchema>[] = recallsJson.results.map((r: any) => ({
        Manufacturer: r.Manufacturer,
        NHTSACampaignNumber: r.CampaignNumber,
        ReportReceivedDate: r.ReportReceivedDate,
        Component: r.Component,
        Summary: r.Summary,
    }));

    return { vehicleInfo, recalls };
  }
);
