import { nextJsApiHandler } from '@genkit-ai/next';
import '@/ai/flows/categorize-transaction'; // Ensure flows are registered

export const POST = nextJsApiHandler();
