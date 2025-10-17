
'use server';
/**
 * @fileOverview A flow for answering questions or explaining text within a specific context.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualQASchema = z.object({
  language: z.string().describe('The language for the AI to respond in (e.g., "es", "en").'),
  selectedText: z.string().describe('The text that was selected by the user.'),
  userQuery: z.string().optional().describe('The specific question the user has about the selected text. If empty, the AI should just explain the text.'),
});
export type ContextualQAInput = z.infer<typeof ContextualQASchema>;

const ContextualQAOutputSchema = z
  .string()
  .describe(
    'The generated content as an HTML string.'
  );
export type ContextualQAOutput = z.infer<typeof ContextualQAOutputSchema>;

export async function contextualQA(
  input: ContextualQAInput
): Promise<ContextualQAOutput> {
  return contextualQAFlow(input);
}


const contextualQAFlow = ai.defineFlow(
  {
    name: 'contextualQAFlow',
    inputSchema: ContextualQASchema,
    outputSchema: ContextualQAOutputSchema,
  },
  async (input) => {
    const { language, selectedText, userQuery } = input;

    const promptText = userQuery
      ? `Based on the following text, answer the user's question. Respond in ${language}.
         User's Question: "${userQuery}"
         Selected Text: "${selectedText}"`
      : `Explain the following text clearly and concisely. Respond in ${language}.
         Selected Text: "${selectedText}"`;
    
    const {text} = await ai.generate({
      prompt: promptText,
    });
    return text;
  }
);
