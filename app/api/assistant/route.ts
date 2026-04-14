import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export const maxDuration = 30;

// Step-specific context for contextual AI guidance
const STEP_CONTEXT: Record<string, string> = {
  fp_name: 'The user is entering their name. Help them understand they should use their legal name as it appears on official documents.',
  fp_dob: 'The user is entering their date of birth. Age requirements typically range from 18-75 at mortgage term end.',
  fp_contact: 'The user is providing contact details. Verification will be required via email and phone.',
  fp_circumstances: 'The user is describing their personal circumstances. This helps assess their financial situation.',
  fp_address: 'The user is entering their current address. Address history may be needed if they have moved recently.',
  fp_address_history: 'The user is uploading proof of address or entering address history.',
  fp_employment_status: 'The user is selecting their employment status. Different documentation is needed for different employment types.',
  fp_employment_details: 'The user is providing employment details including company, role, and tenure.',
  fp_income: 'The user is entering income information. This should include all sources: salary, bonuses, overtime, additional income.',
  fp_outgoings: 'The user is listing monthly commitments and outgoings. This affects affordability calculations.',
  fp_deposit: 'The user is providing deposit information. Source of funds documentation will be required.',
  fp_goals: 'The user is setting their mortgage goals including borrowing amount and property preferences.',
  docs_overview: 'The user is in the documents section. AI-powered verification will scan and validate uploaded documents.',
  hh_stage: 'The user is indicating their property search stage.',
  hh_property: 'The user is providing property details for valuation and mortgage assessment.',
  ag_declarations: 'The user is reviewing legal declarations. These are binding statements that must be read carefully.',
  ag_signature: 'The user is signing their application to confirm accuracy and completeness.',
};

export async function POST(req: Request) {
  try {
    const { messages, step, formData }: { 
      messages: UIMessage[]; 
      step: string;
      formData?: Record<string, unknown>;
    } = await req.json();

    // Build system prompt with step context and form data
    const stepContext = STEP_CONTEXT[step] || 'Help the user complete their mortgage application.';
    
    let formDataContext = '';
    if (formData && Object.keys(formData).length > 0) {
      formDataContext = `\n\nCurrent form data:\n${JSON.stringify(formData, null, 2)}`;
    }

    const systemPrompt = `You are an intelligent mortgage application assistant. You provide helpful, concise guidance to users completing their mortgage application.

Current step context: ${stepContext}${formDataContext}

Guidelines:
- Be concise and direct - aim for 2-3 sentences max unless more detail is requested
- Provide actionable advice specific to the current step
- If you notice potential issues with their form data, mention them helpfully
- Use a friendly, professional tone
- Do not make up specific rates or figures - use general guidance
- If asked about something outside your expertise, acknowledge it and stay focused on the application`;

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
      maxOutputTokens: 500,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[Assistant API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate assistant response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
