
import { config } from 'dotenv';
config();

// AI text generation flows are removed.
// import '@/ai/flows/summarize-article.ts';
// import '@/ai/flows/generate-alt-text.ts';
// import '@/ai/flows/spark-plug-diagnosis.ts';

// Image generation flows using Pollinations.ai
import '@/ai/flows/generate-pollinations-image.ts';
import '@/ai/flows/generate-article-images.ts';

// Tool flows
import '@/ai/flows/vin-decoder.ts';
import '@/ai/flows/warning-light-guide.ts';
import '@/ai/flows/smoke-diagnosis.ts';
import '@/ai/flows/obd-code-lookup.ts';
