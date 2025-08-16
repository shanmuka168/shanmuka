import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-transaction.ts';
import '@/ai/flows/analyze-cibil-flow.ts';
import '@/ai/flows/analyze-bank-statement-flow.ts';
import '@/ai/flows/summarize-payment-behavior.ts';
