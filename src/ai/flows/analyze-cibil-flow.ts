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

const AccountDetailSchema = z.object({
    accountType: z.string().describe("The type of the credit account (e.g., Credit Card, Personal Loan)."),
    ownershipType: z.enum(['Individual', 'Guarantor', 'Joint']).describe("The ownership type of the account (e.g., Individual, Guarantor, Joint)."),
    status: z.enum(['Active', 'Closed', 'Written Off', 'Settled', 'Doubtful']).describe("The current status of the account."),
    sanctionedAmount: z.number().describe("The sanctioned loan amount or credit limit."),
    currentBalance: z.number().describe("The current outstanding balance."),
    overdueAmount: z.number().describe("The overdue amount, if any."),
    emi: z.number().optional().describe("The Equated Monthly Installment (EMI), if applicable."),
    dateOpened: z.string().describe("The date the account was opened in DD-MM-YYYY format."),
    dateClosed: z.string().optional().describe("The date the account was closed in DD-MM-YYYY format, if applicable."),
    paymentHistory: z.array(z.string()).describe("An array of strings representing the payment status for the last 36 months. Use 'STD' or '0' for paid on time, '30' for 1-30 days past due, '60' for 31-60, '90' for 61-90, '90+' or a specific number like '120' for 90+ days, and 'XXX' for no data."),
});


const PaymentTrendDataSchema = z.object({
    month: z.string().describe("The month for the data point (e.g., 'Jan '23')."),
    onTime: z.number().describe("Number of on-time payments for that month."),
    late: z.number().describe("Number of late payments for that month."),
});

const BehaviorAnalysisSchema = z.object({
    rating: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'No Data']).describe("The overall payment behavior rating."),
    summary: z.string().describe("A comprehensive, one-paragraph explanation of the payment behavior, including patterns, trends, and potential impact."),
    paymentTrend: z.array(PaymentTrendDataSchema).describe("An array of payment trend data for the last 12 months."),
    totalPayments: z.number().describe("Total number of payments recorded over the last 12 months."),
    onTimePayments: z.number().describe("Number of on-time payments over the last 12 months."),
    latePayments: z.number().describe("Number of late payments over the last 12 months."),
});


const CibilReportAnalysisSchema = z.object({
    creditScore: z.number().describe('The CIBIL credit score.'),
    consumerInformation: z.object({
        name: z.string().describe("The consumer's full name."),
        dateOfBirth: z.string().describe("The consumer's date of birth in DD-MM-YYYY format."),
        gender: z.string().describe("The consumer's gender."),
        pan: z.string().optional().describe("The consumer's PAN ID."),
        mobileNumber: z.string().optional().describe("The consumer's mobile number."),
        address: z.string().describe("The consumer's full address as mentioned in the report."),
    }),
    accountSummary: z.object({
        totalAccounts: z.number().describe('Total number of all credit accounts (active and closed).'),
        activeAccounts: z.number().describe('Number of currently active credit accounts.'),
        highCreditOrSanctionedAmount: z.number().describe('The total high credit or sanctioned amount across all accounts.'),
        currentBalance: z.number().describe('The total current balance across all accounts.'),
        overdueAmount: z.number().describe('The total overdue amount across all accounts.'),
        writtenOffAmount: z.number().describe('The total amount written off across all accounts.'),
    }),
    enquirySummary: z.object({
        totalEnquiries: z.number().describe('Total number of all credit enquiries.'),
        last30Days: z.number().describe('Number of enquiries made in the last 30 days.'),
        last12Months: z.number().describe('Number of enquiries made in the last 12 months.'),
        last24Months: z.number().describe('Number of enquiries made in the last 24 months.'),
        mostRecentEnquiryDate: z.string().describe('The date of the most recent enquiry in DD-MM-YYYY format.'),
    }),
    behavioralSummary: z.object({
        individual: BehaviorAnalysisSchema.describe("The payment behavior analysis for accounts where the ownership is 'Individual'."),
        guarantor: BehaviorAnalysisSchema.describe("The payment behavior analysis for accounts where the ownership is 'Guarantor'."),
        joint: BehaviorAnalysisSchema.describe("The payment behavior analysis for accounts where the ownership is 'Joint'."),
    }).describe("A detailed breakdown of payment behavior based on ownership type."),
    detailedAccounts: z.array(AccountDetailSchema).describe("A detailed list of all credit accounts found in the report.")
});
export type CibilReportAnalysis = z.infer<typeof CibilReportAnalysisSchema>;

export async function analyzeCibilReport(input: AnalyzeCibilReportInput): Promise<CibilReportAnalysis> {
  return analyzeCibilReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCibilReportPrompt',
  input: {schema: AnalyzeCibilReportInputSchema},
  output: {schema: CibilReportAnalysisSchema},
  prompt: `You are an expert financial analyst specializing in Indian credit reports. 
  
  Analyze the provided CIBIL report PDF and extract all the specified information in the output schema.
  
  Please provide a detailed and accurate analysis covering the following points:
  - CIBIL Score.
  - Consumer Information.
  - Account Summary.
  - Enquiry Summary.
  - Behavioral Summary: This is the most critical part. For each ownership type (Individual, Guarantor, Joint), analyze all **active** accounts. 
    - Based on the payment history of the last 12 months, provide a rating: 'Excellent' (100% on-time), 'Good' (95-99% on-time), 'Fair' (85-94% on-time), or 'Poor' (<85% on-time). If there's no data, use 'No Data'.
    - Write a comprehensive, one-paragraph summary explaining the payment behavior, noting any patterns of late payments (e.g., recent delays, specific accounts).
    - Generate a month-by-month payment trend for the last 12 months, counting the number of 'onTime' and 'late' payments across all active accounts for that ownership type. The month should be in 'Mmm 'YY' format.
    - Provide total, on-time, and late payment counts for the last 12 months.
  - Detailed Accounts: Extract a detailed list of all individual credit accounts, including their full 36-month payment history if available.

  Ensure all dates are in DD-MM-YYYY format. If a specific piece of information is not available in the report, use a reasonable default value (like 0 for numerical fields or "N/A" for strings) but try your best to find it.

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
