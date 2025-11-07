'use server';

/**
 * @fileOverview Analyzes individual line items on a customer's statement to identify potentially problematic entries.
 *
 * - analyzeStatementLineItem - Analyzes a single line item on a customer statement.
 * - StatementLineItemAnalysisInput - The input type for the analyzeStatementLineItem function.
 * - StatementLineItemAnalysisOutput - The return type for the analyzeStatementLineItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StatementLineItemAnalysisInputSchema = z.object({
  itemDescription: z.string().describe('Description of the line item (sale, payment, return).'),
  itemAmount: z.number().describe('The monetary value of the line item.'),
  customerName: z.string().describe('The name of the customer.'),
  customerSalesHistory: z.string().describe('Brief summary of the customer sales history.'),
});

export type StatementLineItemAnalysisInput = z.infer<
  typeof StatementLineItemAnalysisInputSchema
>;

const StatementLineItemAnalysisOutputSchema = z.object({
  isPotentiallyProblematic: z
    .boolean()
    .describe(
      'True if the line item is potentially problematic and requires manual review, false otherwise.'
    ),
  reason: z
    .string()
    .describe(
      'The reason why the line item is flagged as potentially problematic. Empty string if not problematic.'
    ),
});

export type StatementLineItemAnalysisOutput = z.infer<
  typeof StatementLineItemAnalysisOutputSchema
>;

export async function analyzeStatementLineItem(
  input: StatementLineItemAnalysisInput
): Promise<StatementLineItemAnalysisOutput> {
  return statementLineItemAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'statementLineItemAnalysisPrompt',
  input: {schema: StatementLineItemAnalysisInputSchema},
  output: {schema: StatementLineItemAnalysisOutputSchema},
  prompt: `You are an AI assistant that analyzes financial transactions for irregularities.

  You are provided with a line item description, amount, customer name and customer history.

  Determine if the line item is potentially problematic based on the provided information.

  Consider factors such as unusually large amounts, inconsistent descriptions, or discrepancies with the customer's past behavior.

  Customer Name: {{{customerName}}}
  Customer Sales History: {{{customerSalesHistory}}}
  Item Description: {{{itemDescription}}}
  Item Amount: {{{itemAmount}}}

  Return a JSON object indicating whether the item is potentially problematic and the reason.
  `,
});

const statementLineItemAnalysisFlow = ai.defineFlow(
  {
    name: 'statementLineItemAnalysisFlow',
    inputSchema: StatementLineItemAnalysisInputSchema,
    outputSchema: StatementLineItemAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
