
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {enableFirebaseTelemetry} from '@genkit-ai/firebase';

enableFirebaseTelemetry();

export const gemini15Flash = googleAI.model('gemini-1.5-flash');

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});
