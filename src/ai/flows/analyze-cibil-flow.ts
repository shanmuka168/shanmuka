'use server';

/**
 * @fileOverview An AI agent that analyzes a CIBIL report.
 *
 * - analyzeCibilReport - A function that handles the CIBIL report analysis process.
 * - AnalyzeCibilReportInput - The input type for the analyzeCibilReport function.
 * - CibilReportAnalysis - The return type for the analyzeCibilReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCibilReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A CIBIL report as a data URI that must include a MIME type (application/pdf) and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type AnalyzeCibilReportInput = z.infer<typeof AnalyzeCibilReportInputSchema>;

const CibilReportAnalysisSchema = z.object({
    creditScore: z.number().describe('The CIBIL credit score.'),
    paymentHistory: z.string().describe('A summary of the payment history.'),
    creditUtilization: z.string().describe('Analysis of the credit utilization ratio.'),
    creditMix: z.string().describe('Analysis of the credit mix (e.g., secured vs. unsecured loans).'),
    inquiries: z.string().describe('Information about recent credit inquiries.'),
    overallSummary: z.string().describe('An overall summary and recommendations for improvement.'),
});
export type CibilReportAnalysis = z.infer<typeof CibilReportAnalysisSchema>;

export async function analyzeCibilReport(input: AnalyzeCibilReportInput): Promise<CibilReportAnalysis> {
  return analyzeCibilReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCibilReportPrompt',
  input: {schema: AnalyzeCibilReportInputSchema},
  output: {schema: CibilReportAnalysisSchema},
  prompt: `You are an expert financial analyst specializing in credit reports. 
  
  Analyze the provided CIBIL report and extract the key information.
  
  Please provide a detailed analysis covering the following points:
  - CIBIL Score
  - Payment History: Summarize on-time payments, delays, and any defaults.
  - Credit Utilization: Calculate or find the credit utilization ratio and comment on it.
  - Credit Mix: Describe the mix of credit types (e.g., credit cards, auto loans, home loans).
  - Credit Inquiries: Note the number of recent hard inquiries.
  - Overall Summary: Provide a concluding summary of the credit health and suggest specific, actionable steps for improvement if necessary.

  Report: {{media url=reportDataUri}}`,
});

const analyzeCibilReportFlow = ai.defineFlow(
  {
    name: 'analyzeCibilReportFlow',
    inputSchema: AnalyzeCibilReportInputSchema,
    outputSchema: CibilReportAnalysisSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
