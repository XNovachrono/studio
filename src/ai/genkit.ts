
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {enableFirebaseTelemetry} from '@genkit-ai/firebase';

enableFirebaseTelemetry();

export const gemini15Flash = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyC2bLv4_Mqcnfw-eaztHlwTatGlWtlWe1Q" }),
  ],
  model: gemini15Flash,
});
