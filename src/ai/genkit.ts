import {genkit} from 'genkit';

// Initialize Genkit with no plugins. This allows us to define flows
// without requiring any external AI service or API keys.
export const ai = genkit({
  plugins: [],
});
