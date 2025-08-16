
'use server';
/**
 * @fileOverview An AI agent that summarizes payment behavior.
 *
 * - summarizePaymentBehavior - A function that handles the payment behavior summarization.
 * - SummarizePaymentBehaviorInput - The input type for the summarizePaymentBehavior function.
 * - SummarizePaymentBehaviorOutput - The return type for the summarizePaymentBehavior function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PaymentHistoryDetailSchema = z.object({
    accountType: z.string().describe("The type of the credit account."),
    history: z.array(z.string()).describe("An array of DPD strings for the filtered period."),
});

const SummarizePaymentBehaviorInputSchema = z.object({
  rating: z.string().describe("The overall payment behavior rating (e.g., 'Excellent', 'Good')."),
  totalPayments: z.number().describe("Total number of payments recorded for the period."),
  onTimePayments: z.number().describe("Number of on-time payments for the period."),
  latePayments: z.number().describe("Number of late payments for the period."),
  paymentHistory: z.array(PaymentHistoryDetailSchema).describe("A detailed breakdown of payment history for each account in this category.")
});

export type SummarizePaymentBehaviorInput = z.infer<typeof SummarizePaymentBehaviorInputSchema>;

const SummarizePaymentBehaviorOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A comprehensive, one-paragraph explanation of the payment behavior for the given period, including patterns, trends, and potential impact.'
    ),
});
export type SummarizePaymentBehaviorOutput = z.infer<typeof SummarizePaymentBehaviorOutputSchema>;

export async function summarizePaymentBehavior(
  input: SummarizePaymentBehaviorInput
): Promise<SummarizePaymentBehaviorOutput> {
  return summarizePaymentBehaviorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePaymentBehaviorPrompt',
  input: {schema: SummarizePaymentBehaviorInputSchema},
  output: {schema: SummarizePaymentBehaviorOutputSchema},
  prompt: `You are a financial analyst. Based on the provided data for a specific time period, generate a concise, one-paragraph summary of the user's payment behavior.

Your summary should be easy to understand for a non-expert. If the payment history is good, be encouraging and mention the benefits. If there are late payments, point them out constructively and explain the potential impact on their credit score without being alarming.

Data for Analysis:
- Behavior Rating: {{{rating}}}
- Total Payments Made: {{{totalPayments}}}
- On-Time Payments: {{{onTimePayments}}}
- Late Payments: {{{latePayments}}}

- Detailed Payment History:
{{#each paymentHistory}}
  - Account: {{{accountType}}}, Payments (DPD): [{{#each history}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}]
{{/each}}
`,
});

const summarizePaymentBehaviorFlow = ai.defineFlow(
  {
    name: 'summarizePaymentBehaviorFlow',
    inputSchema: SummarizePaymentBehaviorInputSchema,
    outputSchema: SummarizePaymentBehaviorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
