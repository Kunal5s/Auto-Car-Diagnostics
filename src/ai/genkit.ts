import {genkit} from 'genkit';

// Initialize Genkit with no plugins and telemetry disabled.
// Disabling telemetry is crucial to prevent Vercel build errors
// related to optional OpenTelemetry dependencies like '@opentelemetry/exporter-jaeger'.
export const ai = genkit({
  plugins: [],
  enableTelemetry: false,
});
