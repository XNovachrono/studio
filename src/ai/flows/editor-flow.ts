'use server';
/**
 * @fileOverview A flow for generating content within the rich text editor.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditorFlowInputSchema = z.object({
  prompt: z.string().describe('The user prompt to generate content from.'),
});
export type EditorFlowInput = z.infer<typeof EditorFlowInputSchema>;

const EditorFlowOutputSchema = z.string().describe('The generated text content.');
export type EditorFlowOutput = z.infer<typeof EditorFlowOutputSchema>;

export async function generateEditorContent(
  input: EditorFlowInput
): Promise<EditorFlowOutput> {
  return editorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editorPrompt',
  input: {schema: EditorFlowInputSchema},
  output: {schema: EditorFlowOutputSchema},
  prompt: `You are an expert educator and content creator. A teacher has asked for your help writing a class note or assignment.
Generate clear, concise, and engaging content based on their request.

Teacher's Request: {{{prompt}}}
`,
});

const editorFlow = ai.defineFlow(
  {
    name: 'editorFlow',
    inputSchema: EditorFlowInputSchema,
    outputSchema: EditorFlowOutputSchema,
  },
  async input => {
    const {text} = await ai.generate(input.prompt);
    return text;
  }
);
