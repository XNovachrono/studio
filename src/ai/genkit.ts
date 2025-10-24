
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {enableFirebaseTelemetry} from '@genkit-ai/firebase';

enableFirebaseTelemetry();

export const gemini15Flash = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GOOGLE_GENAI_API_KEY})],
  model: gemini15Flash,
});
