
'use server';
/**
 * @fileOverview THIS FLOW IS DEPRECATED.
 * It previously used the Pollinations.ai service, which was unreliable.
 * It is being replaced by `generate-gemini-image.ts`.
 * Do not use this flow.
 */

import { z } from 'zod';

export async function generatePollinationsImage(input: any): Promise<any> {
    throw new Error("This image generation flow (Pollinations.ai) is deprecated and should not be used. Please use generateGeminiImage instead.");
}

