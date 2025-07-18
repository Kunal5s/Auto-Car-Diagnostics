import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin and telemetry disabled.
// Disabling telemetry is crucial to prevent Vercel build errors
// related to optional OpenTelemetry dependencies like '@opentelemetry/exporter-jaeger'.
export const ai = genkit({
  plugins: [googleAI()],
  enableTelemetry: false,
});
