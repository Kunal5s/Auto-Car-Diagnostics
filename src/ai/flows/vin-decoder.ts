
'use server';

/**
 * @fileOverview A flow for decoding a VIN and checking for recalls using the CarAPI.app service.
 * This has been updated to remove any Genkit or external AI dependency.
 *
 * - decodeVin - A function that takes a VIN and returns detailed vehicle information and recalls.
 * - VinInput - The input type for the decodeVin function.
 * - VinOutput - The return type for the decodeVin function.
 */

import { z } from 'zod';
import { fetchCarApiData } from '@/lib/carapi';

// Input Schema
const VinInputSchema = z.object({
  vin: z.string().length(17, { message: 'VIN must be exactly 17 characters.' }).describe('The 17-character Vehicle Identification Number.'),
});
export type VinInput = z.infer<typeof VinInputSchema>;

// Output Schema for Vehicle Details from CarAPI
const VehicleInfoSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  engine: z.string().optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  body: z.string().optional(),
  ext_color: z.string().optional(),
  int_color: z.string().optional(),
  mileage_city: z.number().nullable().optional(),
  mileage_highway: z.number().nullable().optional(),
});

// Output Schema for Recalls from CarAPI
const RecallInfoSchema = z.object({
  component: z.string(),
  consequence: z.string(),
  description: z.string(),
  remedy: z.string().nullable(),
  notes: z.string().nullable(),
  model_year: z.string(),
  make: z.string(),
  model: z.string(),
  report_date: z.string(),
  nhtsa_id: z.string(),
});

const VinOutputSchema = z.object({
  vehicleInfo: VehicleInfoSchema.describe('Detailed information about the decoded vehicle.'),
  recalls: z.array(RecallInfoSchema).describe('A list of safety recalls associated with the vehicle.'),
});
export type VinOutput = z.infer<typeof VinOutputSchema>;

// This is now a standard server function, no external AI model needed.
export async function decodeVin({ vin }: VinInput): Promise<VinOutput> {
    // Using Promise.all to fetch VIN details and recalls concurrently for better performance
    const [vinDetails, recallData] = await Promise.all([
        fetchCarApiData(`vin/${vin}`),
        fetchCarApiData('recalls', { vin })
    ]);

    if (!vinDetails || !vinDetails.make) {
        throw new Error('Invalid VIN or no data found. Please check the VIN and try again.');
    }
    
    // The recalls might be nested in a 'data' property
    const recalls = recallData?.data || recallData || [];

    return {
      vehicleInfo: vinDetails,
      recalls: recalls,
    };
}
