
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {enableFirebaseTelemetry} from '@genkit-ai/firebase';

enableFirebaseTelemetry();

export const geminiProModel = googleAI.model('gemini-pro');

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: geminiProModel,
});
