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
    paymentHistory: z.array(z.string()).describe("An array of strings representing the payment status. Use 'STD' or '0' for paid on time, '30' for 1-30 days past due, '60' for 31-60, '90' for 61-90, '90+' or a specific number like '120' for 90+ days, and 'XXX' for no data."),
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
    overallSummary: z.string().describe('A concise, one-paragraph overall summary of the credit report, highlighting the most important positive and negative aspects.'),
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
  - Consumer Information: Extract the person's name, date of birth, gender, and full address.
  - Account Summary: Extract the total number of accounts, number of active accounts, total high credit/sanctioned amount, total current balance, total overdue amount, and total written-off amount. All values should be numbers.
  - Enquiry Summary: Extract the total number of enquiries, enquiries in the last 30 days, 12 months, and 24 months. Also, provide the date of the most recent enquiry.
  - Overall Summary: Write a concise, one-paragraph summary of the credit health based on the report.
  - Detailed Accounts: Extract a detailed list of all individual credit accounts. For each account, provide the account type, ownership type, status, sanctioned amount, current balance, overdue amount, EMI, date opened, and payment history. For payment history, extract the actual DPD values like 'STD', '0', '30', '90', 'XXX' etc.

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
