
'use server';

/**
 * @fileOverview Provides an explanation for a selected car dashboard warning light using a static data map.
 * This has been updated to remove any Genkit or external AI dependency.
 *
 * - getWarningLightExplanation - A function that returns details about a warning light.
 * - WarningLightInput - The input type for the function.
 * - WarningLightOutput - The return type for the function.
 */

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

const lightData: Record<string, WarningLightOutput> = {
    "Check Engine Light": {
        meaning: "Indicates a problem with the engine's management system. It could be a simple issue like a loose gas cap or something more serious.",
        severity: "Medium",
        action: "The vehicle should be scanned for OBD2 trouble codes. While the car is usually safe to drive, you should get it checked by a professional soon to avoid potential damage."
    },
    "Oil Pressure Light": {
        meaning: "Indicates a loss of oil pressure, which is critical for engine lubrication. This could be due to low oil level or a failing oil pump.",
        severity: "High",
        action: "Pull over and stop the engine immediately to prevent catastrophic engine damage. Check the oil level and do not drive until the issue is resolved."
    },
    "Engine Temperature Warning Light": {
        meaning: "The engine is overheating. This could be due to low coolant, a leak in the cooling system, or a faulty water pump or thermostat.",
        severity: "High",
        action: "Pull over and turn off the engine as soon as it is safe to do so. Let the engine cool down completely before checking coolant levels. Do not open the radiator cap while hot."
    },
    "Battery or Charging System Light": {
        meaning: "Indicates that the battery is not charging properly. This is usually due to a problem with the alternator or the battery itself.",
        severity: "Medium",
        action: "Turn off all non-essential electronics (radio, AC). The car may run for a short time on battery power, but you should drive directly to a mechanic to get it tested."
    },
    "Brake System Warning Light": {
        meaning: "Indicates a problem with the brake system, such as low brake fluid or an issue with the anti-lock braking system (ABS). It may also mean the parking brake is engaged.",
        severity: "High",
        action: "Check if the parking brake is fully released. If it is and the light remains on, pull over safely. Test your brakes cautiously. The vehicle may not be safe to drive."
    },
    "Tire Pressure Monitoring System (TPMS) Light": {
        meaning: "Indicates that the pressure in one or more of your tires is significantly low.",
        severity: "Low",
        action: "Find a safe place to pull over and check your tire pressures with a gauge. Inflate any low tires to the recommended PSI found on the sticker inside your driver's door jamb."
    },
    "Washer Fluid Low Light": {
        meaning: "Indicates the windshield washer fluid reservoir is low.",
        severity: "Low",
        action: "Refill the washer fluid reservoir at your earliest convenience. This is not an urgent mechanical issue."
    },
    "Exterior Light Fault": {
        meaning: "Indicates that one of your exterior lights, such as a headlight, taillight, or turn signal, has burned out.",
        severity: "Low",
        action: "Visually inspect all your exterior lights to identify which one is out and replace the bulb as soon as possible for safety."
    },
};

export async function getWarningLightExplanation({ lightName }: WarningLightInput): Promise<WarningLightOutput> {
    const output = lightData[lightName];
    if (!output) {
        throw new Error(`Could not find an explanation for the light: ${lightName}`);
    }
    return output;
}
