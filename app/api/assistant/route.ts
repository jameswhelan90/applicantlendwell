import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

// Step-specific guidance context — mapped to actual StepId values
const STEP_CONTEXT: Record<string, string> = {
  // Welcome & Orientation
  welcome:
    'The applicant is on the welcome screen. Introduce them warmly to the LendWell mortgage journey. Explain that LendWell will guide them through a structured fact-find to prepare their application for lenders.',
  orientation:
    'The applicant is reviewing the application overview. Explain the process: personal details, property information, employment, income, documents, and agreements. Reassure them that they can save progress and return at any time.',

  // About You — Identity
  intro_about_you:
    'The applicant is starting the About You section. This collects identity, address, and household details that lenders require for all UK and Irish mortgage applications.',
  id_name:
    'The applicant is entering their full legal name. This must match their passport or driving licence exactly. For Irish applicants this includes any Irish-language variations on their passport.',
  id_dob:
    'The applicant is entering their date of birth. In the UK and Ireland, borrowers must typically be 18 or over at application and under 70–75 at the end of the mortgage term, depending on the lender.',
  id_contact:
    'The applicant is providing their email address and phone number. These will be used for identity verification, correspondence, and any requests from their mortgage adviser.',
  id_nationality:
    'The applicant is providing their nationality and right to reside. UK and Irish lenders require evidence of the right to remain for non-EEA nationals. EU citizens with settled or pre-settled status are generally eligible.',
  id_ni_pps:
    'The applicant is entering their National Insurance number (UK) or PPS number (Ireland). This is used for identity checks and credit referencing by lenders.',
  id_address:
    'The applicant is entering their current address. In the UK this should include the full postcode. In Ireland, Eircode is preferred. A minimum of 3 years of address history is typically required.',
  id_address_history:
    'The applicant is providing previous address history. Most UK and Irish lenders require 3 years of continuous address history for credit checks and fraud prevention.',
  id_upload_photo:
    'The applicant is uploading photo ID. Acceptable documents are a valid passport or a full driving licence. For Irish applicants, an Irish passport card is also acceptable.',

  // About You — Household
  hh_circumstances:
    'The applicant is describing their personal circumstances including marital status and dependants. This informs affordability assessments and the lender\'s household expenditure model.',
  hh_application_mode:
    'The applicant is choosing between a sole or joint application. A joint application includes a second applicant whose income and commitments will both be assessed.',
  hh_second_applicant:
    'The applicant is entering the second applicant\'s personal details. Both applicants are jointly and severally liable for the mortgage. The second applicant will also need to provide identity, employment, and income documents.',
  hh_second_applicant_contact:
    'The applicant is entering the second applicant\'s contact information for verification and correspondence.',
  hh_upload_joint_id:
    'The applicant is uploading photo ID for the second applicant. The same document standards apply: valid passport or full driving licence.',
  hh_dependants:
    'The applicant is declaring dependants. Lenders use this to calculate outgoings and stress-test affordability. In Ireland the Central Bank rules require lenders to apply an income multiplier of up to 3.5x. In the UK, the multiplier varies by lender but is typically 4–4.5x gross income.',

  // Property & Mortgage — Intent
  intro_property_mortgage:
    'The applicant is starting the Property & Mortgage section. This covers what they want to buy or refinance, the type of mortgage they need, and their timeline.',
  intent_type:
    'The applicant is selecting their mortgage type. The main options are: residential purchase, remortgage, buy-to-let, and right-to-buy. Each type has different documentation requirements and lender criteria.',
  intent_remortgage:
    'The applicant is providing details of their existing mortgage for a remortgage. They will need their current lender name, outstanding balance, and monthly payment. A current mortgage statement will be required.',
  intent_upload_mortgage:
    'The applicant is uploading their current mortgage statement. This should be the most recent statement showing the outstanding balance, monthly payment, and remaining term.',
  intent_btl:
    'The applicant is providing buy-to-let details. Lenders typically require the expected rental income to cover 125–145% of the mortgage payment. An interest-only product is common for buy-to-let. Stamp duty surcharges apply in both the UK and Ireland.',
  intent_upload_rental:
    'The applicant is uploading rental income evidence for a buy-to-let application. A letting agent valuation letter or existing tenancy agreement is typically acceptable.',
  intent_timeline:
    'The applicant is indicating their purchase timeline. This helps the adviser prepare the application and set expectations. An Agreement in Principle (AIP) is usually valid for 90 days.',

  // Property
  prop_stage:
    'The applicant is indicating how far along they are in the property search. Some lenders will issue an Agreement in Principle before a property is found. A full mortgage offer is issued once a specific property is identified and valued.',
  prop_details:
    'The applicant is providing property details including type, location, and tenure. Leasehold properties require a minimum remaining lease term — typically 70+ years in the UK and Ireland for mortgage eligibility.',
  prop_value:
    'The applicant is entering the estimated property value or agreed purchase price. The loan-to-value ratio (LTV) is calculated from this figure. Lower LTV typically means better interest rates. Many lenders offer improved rates at 60%, 75%, 80%, and 90% LTV thresholds.',

  // Employment & Income
  intro_employment_income:
    'The applicant is starting the Employment & Income section. Lenders assess income stability, type, and sustainability. PAYE employees, self-employed, and contractors are all assessed differently.',
  emp_status:
    'The applicant is selecting their employment status. Options include: employed (PAYE), self-employed (sole trader or limited company director), contractor, and retired. Each category requires different documentation.',
  emp_details:
    'The applicant is entering their employment details. Lenders typically require a minimum of 6–12 months with the current employer. New employment with a probation period may reduce the lender\'s income multiple.',
  emp_self_employed:
    'The applicant is self-employed. In the UK, lenders typically require 2–3 years of SA302 forms or HMRC tax calculations alongside the corresponding tax year overviews. In Ireland, 2–3 years of certified accounts are required. An accountant\'s reference letter is also commonly required.',
  emp_upload_payslips:
    'The applicant is uploading payslips. Most lenders require the 3 most recent consecutive payslips for PAYE employees. The payslips must show the employer name, employee name, tax code, and payment date.',
  emp_upload_tax:
    'The applicant is uploading tax returns or accounts for self-employed income verification. In the UK these are SA302 forms from HMRC. In Ireland these are Form 11 submissions or certified business accounts.',
  emp_second_applicant:
    'The applicant is providing employment details for the second applicant on a joint application.',
  emp_upload_joint:
    'The applicant is uploading employment documents for the second applicant on a joint application.',

  // Income
  inc_salary:
    'The applicant is entering their salary. Enter gross annual salary before tax and deductions. If basic salary plus regular bonus is used, lenders may apply a different multiple to the bonus portion. Lenders will verify income from payslips and the P60 (UK) or P60/end-of-year certificate (Ireland).',
  inc_additional:
    'The applicant is declaring additional income sources. These can include overtime, commission, bonuses, rental income, dividends, and state benefits. Lenders assess each type differently — guaranteed overtime and regular bonuses are usually fully accepted; variable income may be averaged over 2–3 years.',
  inc_second_applicant:
    'The applicant is providing income information for the second applicant on a joint application.',
  inc_upload_bank:
    'The applicant is uploading bank statements. Most lenders require the 3 most recent months of all current accounts and savings accounts. Statements should show the account holder\'s name, account number, sort code, and a consistent salary credit.',
  inc_upload_joint_bank:
    'The applicant is uploading bank statements for the second applicant on a joint application.',

  // Commitments
  commit_outgoings:
    'The applicant is declaring monthly financial commitments. These include personal loans, credit card minimum payments, car finance, and hire purchase agreements. Lenders use this to calculate the debt-to-income ratio and stress-test affordability at higher interest rates.',
  commit_childcare:
    'The applicant is declaring childcare costs. This is a significant outgoing for lenders\' affordability models. Costs should include nursery, childminder, after-school clubs, and any private school fees.',

  // Deposit
  dep_amount:
    'The applicant is entering their deposit amount. In the UK, a 5% minimum deposit is typical for residential purchases with a government-backed scheme. In Ireland, first-time buyers typically need a minimum 10% deposit under Central Bank macroprudential rules. Second and subsequent buyers need 20%.',
  dep_source:
    'The applicant is declaring the source of their deposit. The main categories are: personal savings, gift from family, inheritance, proceeds from a property sale, equity release, or Help to Buy. All funds must be evidenced and declared to prevent money laundering.',
  dep_gift_details:
    'The applicant is providing details of a gifted deposit. Lenders require a signed gifted deposit letter from the donor confirming the amount, their relationship to the applicant, and that the gift is non-repayable. The donor\'s bank statements showing the funds may also be required.',
  dep_upload_gift:
    'The applicant is uploading the gifted deposit letter. This must be signed by the donor and confirm the amount, the relationship to the applicant, and that the gift is not a loan.',
  dep_upload_giftor:
    'The applicant is uploading the gift donor\'s bank statements to evidence the source of the gifted funds.',

  // Documents
  intro_documents:
    'The applicant is in the documents section. LendWell will review and verify each document. Accepted file types are PDF, JPG, and PNG. Documents should be clear, unobstructed, and show all four corners.',
  docs_overview:
    'The applicant is reviewing their document checklist. LendWell will check each document for legibility, recency, and completeness. Payslips and bank statements should be dated within 3 months. Photo ID must be in date.',

  // Agreements
  intro_agreements:
    'The applicant is starting the Agreements section. They will review the key declarations required by their mortgage adviser and confirm the accuracy of their application.',
  ag_declarations:
    'The applicant is reviewing the legal declarations. These confirm that the information provided is accurate and complete. Making a false statement on a mortgage application is a criminal offence in both the UK and Ireland. The applicant should read each point carefully.',
  ag_signature:
    'The applicant is signing their application. This electronic signature confirms that all information provided is true and that the applicant consents to credit and identity checks being carried out by the adviser and lenders.',

  // Completion
  completion:
    'The applicant has completed their application. Explain what happens next: LendWell will review the information, the adviser will assess suitability, and the application will be prepared for lenders. The applicant should expect to hear from their adviser about next steps.',
};

export async function POST(req: Request) {
  try {
    const {
      messages,
      step,
      formData,
      sectionId,
    }: {
      messages: UIMessage[];
      step: string;
      formData?: Record<string, unknown>;
      sectionId?: string;
    } = await req.json();

    const stepContext =
      STEP_CONTEXT[step] ||
      'Help the applicant complete their UK or Irish mortgage application. Be concise, accurate, and reassuring.';

    // Build a readable summary of relevant form data already captured
    let formDataContext = '';
    if (formData && Object.keys(formData).length > 0) {
      const relevant = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      if (Object.keys(relevant).length > 0) {
        formDataContext = `\n\nApplication data captured so far:\n${JSON.stringify(relevant, null, 2)}`;
      }
    }

    const systemPrompt = `You are a knowledgeable mortgage application guide for LendWell, a UK and Ireland mortgage platform. You help applicants complete their mortgage application with accurate, clear, and reassuring guidance.

Current step: ${step}${sectionId ? ` (section: ${sectionId})` : ''}
Step guidance: ${stepContext}${formDataContext}

How to respond:
- Be concise — 2–3 sentences for most responses unless the applicant asks for more detail
- Use plain English appropriate for UK and Irish mortgage applicants
- Reference correct UK/Ireland-specific terminology: payslips, bank statements, proof of address, Agreement in Principle (AIP), LTV, stamp duty, first-time buyer relief, Help to Buy (UK/Ireland), Central Bank rules (Ireland), HMRC (UK), PPS number (Ireland), National Insurance number (UK)
- Never use the word "AI" — always refer to the system as "LendWell"
- Never quote specific interest rates — they change frequently and vary by lender
- Provide reassurance where applicants seem uncertain, but keep guidance factual
- If a question is outside the scope of the mortgage application, acknowledge it and redirect to the relevant step
- If the applicant has already provided data (shown above), reference it where helpful — for example, if income and outgoings are both captured, you can comment on affordability indicators
- Do not give regulated financial advice — recommend the applicant speak to their mortgage adviser for personal recommendations
- Tone: calm, professional, and trustworthy — like a knowledgeable friend guiding them through paperwork`;

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
      maxOutputTokens: 600,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[Assistant API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
