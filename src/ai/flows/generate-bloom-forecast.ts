'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting future bloom events based on historical data and current conditions.
 *
 * - generateBloomForecast - A function that triggers the bloom forecast generation.
 * - GenerateBloomForecastInput - The input type for the generateBloomForecast function.
 * - GenerateBloomForecastOutput - The output type for the generateBloomForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBloomForecastInputSchema = z.object({
  location: z
    .string()
    .describe(
      'The location for which to generate the bloom forecast. Specify as City, State, Country'
    ),
  startDate: z
    .string()
    .describe(
      'The start date for the forecast period.  Specify as YYYY-MM-DD'
    ),
  endDate: z
    .string()
    .describe(
      'The end date for the forecast period. Specify as YYYY-MM-DD'
    ),
});
export type GenerateBloomForecastInput = z.infer<
  typeof GenerateBloomForecastInputSchema
>;

const GenerateBloomForecastOutputSchema = z.object({
  forecast: z.string().describe('A description of the predicted bloom events.'),
});
export type GenerateBloomForecastOutput = z.infer<
  typeof GenerateBloomForecastOutputSchema
>;

export async function generateBloomForecast(
  input: GenerateBloomForecastInput
): Promise<GenerateBloomForecastOutput> {
  return generateBloomForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBloomForecastPrompt',
  input: {schema: GenerateBloomForecastInputSchema},
  output: {schema: GenerateBloomForecastOutputSchema},
  prompt: `You are an expert in predicting plant blooming events.

  Based on historical climate data, current conditions, and satellite data, generate a forecast for bloom events in the specified location and time period.  Use all the information at your disposal to generate the most accurate forecast.

  Location: {{{location}}}
  Start Date: {{{startDate}}}
  End Date: {{{endDate}}}`,
});

const generateBloomForecastFlow = ai.defineFlow(
  {
    name: 'generateBloomForecastFlow',
    inputSchema: GenerateBloomForecastInputSchema,
    outputSchema: GenerateBloomForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
