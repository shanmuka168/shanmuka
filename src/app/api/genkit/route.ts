import { nextJsApiHandler } from '@genkit-ai/next';
import '@/ai/flows/categorize-transaction'; // Ensure flows are registered
import '@/ai/flows/analyze-cibil-flow';
import '@/ai/flows/analyze-bank-statement-flow';
import '@/ai/flows/summarize-payment-behavior';

export const POST = nextJsApiHandler();
