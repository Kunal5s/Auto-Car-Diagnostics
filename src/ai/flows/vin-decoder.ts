
'use server';

/**
 * @fileOverview A flow for decoding a VIN. THIS FEATURE IS DISABLED.
 * The connection to the external CarAPI.app service has been removed.
 *
 * - decodeVin - This function will now throw an error.
 * - VinInput - The input type for the decodeVin function.
 * - VinOutput - The return type for the decodeVin function.
 */

import { z } from 'zod';

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

// This function is now non-operational.
export async function decodeVin({ vin }: VinInput): Promise<VinOutput> {
    throw new Error('The VIN Decoder service is currently unavailable.');
}
