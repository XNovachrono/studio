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

const EditorFlowOutputSchema = z
  .string()
  .describe(
    'The generated content as an HTML string, ready to be inserted into a rich text editor.'
  );
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

IMPORTANT: You MUST format your response as an HTML string. Do not use plain text. You can use the following HTML tags to structure the content:
- Headings: <h1>, <h2>, <h3>
- Paragraphs: <p>
- Lists: <ul>, <ol>, <li>
- Tables: <table>, <thead>, <tbody>, <tr>, <th>, <td>
- Text formatting: <b> (bold), <i> (italic), <u> (underline), <s> (strikethrough)
- Inline styles for colors: <span style="color: #...;"> for text color and <span style="background-color: #...;"> for highlights.

Your entire response should be a single HTML string that can be directly rendered inside a rich text editor. Do not wrap your response in markdown or any other format.
`,
});

const editorFlow = ai.defineFlow(
  {
    name: 'editorFlow',
    inputSchema: EditorFlowInputSchema,
    outputSchema: EditorFlowOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `You are an expert educator and content creator. A teacher has asked for your help writing a class note or assignment.
Generate clear, concise, and engaging content based on their request.

Teacher's Request: ${input.prompt}

IMPORTANT: You MUST format your response as an HTML string. Do not use plain text. You can use the following HTML tags to structure the content:
- Headings: <h1>, <h2>, <h3>
- Paragraphs: <p>
- Lists: <ul>, <ol>, <li>
- Tables: <table>, <thead>, <tbody>, <tr>, <th>, <td>
- Text formatting: <b> (bold), <i> (italic), <u> (underline), <s> (strikethrough)
- Inline styles for colors: <span style="color: #...;"> for text color and <span style="background-color: #...;"> for highlights.

Your entire response should be a single HTML string that can be directly rendered inside a rich text editor. Do not wrap your response in markdown or any other format.
`,
    });
    return text;
  }
);
