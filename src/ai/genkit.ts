
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {enableFirebaseTelemetry} from '@genkit-ai/firebase';

enableFirebaseTelemetry();

export const geminiProModel = googleAI.model('gemini-pro');

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyA1EQRofvpASthsReB_C5wSRyGQoElkojk" }),
  ],
  model: geminiProModel,
});
