
import { config } from 'dotenv';
config();

// AI text generation flows are removed.
// import '@/ai/flows/summarize-article.ts';
// import '@/ai/flows/spark-plug-diagnosis.ts';

// Image generation flows are now deprecated and use placeholders.
// import '@/ai/flows/generate-gemini-image';
// import '@/ai/flows/generate-multiple-gemini-images';
// import '@/ai/flows/generate-article-images';


// Tool flows
import '@/ai/flows/vin-decoder.ts';
import '@/ai/flows/warning-light-guide.ts';
import '@/ai/flows/smoke-diagnosis.ts';
import '@/ai/flows/obd-code-lookup.ts';
