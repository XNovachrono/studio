
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {enableFirebaseTelemetry} from '@genkit-ai/firebase';

enableFirebaseTelemetry();

// Define a constant for the model to be used across flows
export const gemini15Flash = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  plugins: [
    // The API key is passed here to ensure all AI calls are properly authenticated.
    googleAI({ apiKey: "AIzaSyC2bLv4_Mqcnfw-eaztHlwTatGlWtlWe1Q" }),
  ],
  // We don't need to set a global model here, as we'll specify it in each call.
});
