import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-article.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/generate-alt-text.ts';
import '@/ai/flows/generate-article-images.ts';
import '@/ai/flows/vin-decoder.ts';
