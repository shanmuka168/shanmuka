import { nextJsApiHandler } from '@genkit-ai/next';
import '@/ai/flows/categorize-transaction'; // Ensure flows are registered
import '@/ai/flows/analyze-cibil-flow';

export const POST = nextJsApiHandler();
