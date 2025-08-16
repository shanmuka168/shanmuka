'use server';

/**
 * @fileOverview An AI agent that analyzes a bank statement.
 *
 * - analyzeBankStatement - A function that handles the bank statement analysis process.
 * - AnalyzeBankStatementInput - The input type for the analyzeBankStatement function.
 * - BankStatementAnalysis - The return type for the analyzeBankStatement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Transaction } from '@/lib/types';

const AnalyzeBankStatementInputSchema = z.object({
  statementDataUri: z
    .string()
    .describe(
      "A bank statement as a data URI that must include a MIME type (e.g., application/pdf) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeBankStatementInput = z.infer<typeof AnalyzeBankStatementInputSchema>;


const TransactionSchema = z.object({
    id: z.string().describe("A unique, randomly generated ID for the transaction (e.g., a UUID)."),
    date: z.string().describe("The date of the transaction in ISO 8601 format (YYYY-MM-DD)."),
    description: z.string().describe("A concise but complete description of the transaction as it appears on the statement."),
    amount: z.number().describe("The transaction amount as a positive number."),
    type: z.enum(['income', 'expense']).describe("The type of transaction, either 'income' for credits or 'expense' for debits."),
    category: z.string().describe("The category of the transaction (e.g., 'Groceries', 'Rent', 'Salary'). Default to 'Uncategorized' if the category is not obvious from the description."),
});

const BankStatementAnalysisSchema = z.object({
    transactions: z.array(TransactionSchema).describe('A list of all transactions extracted from the bank statement.'),
    summary: z.object({
        totalIncome: z.number().describe('The sum of all income transactions.'),
        totalExpenses: z.number().describe('The sum of all expense transactions.'),
        netSavings: z.number().describe('The net savings, calculated as total income minus total expenses.'),
        startDate: z.string().describe("The start date of the statement period in ISO 8601 format (YYYY-MM-DD)."),
        endDate: z.string().describe("The end date of the statement period in ISO 8601 format (YYYY-MM-DD)."),
    })
});
export type BankStatementAnalysis = z.infer<typeof BankStatementAnalysisSchema>;

export async function analyzeBankStatement(input: AnalyzeBankStatementInput): Promise<BankStatementAnalysis> {
  return analyzeBankStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBankStatementPrompt',
  input: {schema: AnalyzeBankStatementInputSchema},
  output: {schema: BankStatementAnalysisSchema},
  prompt: `You are an expert financial analyst. Analyze the provided bank statement and extract all transactions. For each transaction, provide a unique ID, date, description, amount, type (income or expense), and a category. Also, provide a summary of the statement including total income, total expenses, net savings, and the statement period.

  Bank Statement: {{media url=statementDataUri}}`,
});

const analyzeBankStatementFlow = ai.defineFlow(
  {
    name: 'analyzeBankStatementFlow',
    inputSchema: AnalyzeBankStatementInputSchema,
    outputSchema: BankStatementAnalysisSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
