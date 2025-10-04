'use server';
/**
 * @fileOverview Detects and monitors plant blooming events globally using AI models.
 *
 * - detectAndMonitorBlooms - A function that initiates the bloom detection and monitoring process.
 * - DetectAndMonitorBloomsInput - The input type for the detectAndMonitorBlooms function.
 * - DetectAndMonitorBloomsOutput - The return type for the detectAndMonitorBlooms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAndMonitorBloomsInputSchema = z.object({
  location: z
    .string()
    .describe("The geographic location for bloom detection and monitoring (e.g., 'California, USA')."),
  startDate: z.string().describe('The start date for monitoring (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for monitoring (YYYY-MM-DD).'),
});
export type DetectAndMonitorBloomsInput = z.infer<typeof DetectAndMonitorBloomsInputSchema>;

const DetectAndMonitorBloomsOutputSchema = z.object({
  bloomStatus: z
    .string()
    .describe('The current bloom status for the specified location and time period.'),
  confidenceLevel: z.number().describe('The confidence level of the bloom detection (0-1).'),
  satelliteDataUsed: z.array(z.string()).describe('List of satellite data sources used (e.g., MODIS, Landsat).'),
});
export type DetectAndMonitorBloomsOutput = z.infer<typeof DetectAndMonitorBloomsOutputSchema>;

export async function detectAndMonitorBlooms(input: DetectAndMonitorBloomsInput): Promise<DetectAndMonitorBloomsOutput> {
  return detectAndMonitorBloomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAndMonitorBloomsPrompt',
  input: {schema: DetectAndMonitorBloomsInputSchema},
  output: {schema: DetectAndMonitorBloomsOutputSchema},
  prompt: `You are an AI expert in analyzing Earth observation data to detect and monitor plant blooming events.

  Analyze satellite data and vegetation indices for the specified location and time period to determine the bloom status.
  Return the bloom status, confidence level, and the satellite data sources used.

  Location: {{{location}}}
  Start Date: {{{startDate}}}
  End Date: {{{endDate}}}
  
  Consider factors like vegetation indices, soil moisture, and climate patterns to provide an accurate bloom status.
  Ensure the confidence level reflects the reliability of the bloom detection based on available data.
  Identify the specific satellite data sources (e.g., MODIS, Landsat) that contributed to the analysis.
  `,
});

const detectAndMonitorBloomsFlow = ai.defineFlow(
  {
    name: 'detectAndMonitorBloomsFlow',
    inputSchema: DetectAndMonitorBloomsInputSchema,
    outputSchema: DetectAndMonitorBloomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
