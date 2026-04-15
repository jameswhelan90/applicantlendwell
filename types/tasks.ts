// ─── Core journey types for the UK Mortgage Application ───────────────────

// 7 high-level navigation sections (simplified sidebar)
export type SectionId =
  | 'welcome'
  | 'about_you'
  | 'property_mortgage'
  | 'employment_income'
  | 'documents'
  | 'agreements'
  | 'collect_keys';

export type SectionStatus = 'not_started' | 'in_progress' | 'complete';

export type RequirementStatus =
  | 'required'       // not yet started
  | 'uploading'      // file selected, pending
  | 'reviewing'      // AI is processing
  | 'verified'       // AI confirmed
  | 'issue'          // AI found a problem
  | 'needs_update';  // document is out of date

export interface DocumentRequirement {
  id: string;
  title: string;
  description: string;
  acceptableDocuments: string[];    // plain-English examples
  status: RequirementStatus;
  required: boolean;
  uploadedFileName?: string;
  uploadedAt?: string;
  aiMessage?: string;               // contextual AI feedback
  issueMessage?: string;            // specific error if status === 'issue'
  extractedFields?: Record<string, string>;  // AI-extracted data from document
  uploadedFileCount?: number;                // for multi-file requirements (e.g. 3 payslips)
}

// ─── Document ──────────────────────────────────────────────────────────────

export type DocumentStatus =
  | 'required'
  | 'optional'
  | 'uploaded'
  | 'processing'
  | 'verified'
  | 'rejected';

export interface MortgageDocument {
  id: string;
  label: string;
  description: string;
  status: DocumentStatus;
  required: boolean;
  uploadedAt?: string;
  fileName?: string;
}

// ─── Agreement / declaration ───────────────────────────────────────────────

export type AgreementStatus = 'pending' | 'signed';

export interface Agreement {
  id: string;
  title: string;
  body: string;
  status: AgreementStatus;
}

// ─── Core application data (what gets captured across all form steps) ──────

export interface ApplicationData {
  // Welcome / Orientation
  welcomeComplete: boolean;
  orientationComplete: boolean;

  // Personal details / Identity
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  nationalInsuranceNumber: string;  // UK NI or Ireland PPS

  // Personal circumstances / Household
  maritalStatus: string;
  nationality: string;
  residencyStatus: string;        // UK resident, visa holder, etc.
  dependants: string;
  dependantAges: string;
  monthlyChildcareCosts: string;
  applicationMode: string;        // 'single' or 'joint'
  
  // Second applicant (if joint)
  secondApplicantFirstName: string;
  secondApplicantLastName: string;
  secondApplicantDob: string;
  secondApplicantEmail: string;
  secondApplicantPhone: string;
  secondApplicantEmploymentStatus: string;
  secondApplicantEmployerName: string;
  secondApplicantJobTitle: string;
  secondApplicantAnnualSalary: string;

  // Address
  currentAddress: string;
  postcode: string;
  moveInDate: string;
  residentialStatus: string;      // Owner, renting, living with family
  monthlyRent: string;
  previousAddress: string;        // If < 3 years at current address

  // Employment
  employmentStatus: string;       // employed, self-employed, contractor, retired, other
  employerName: string;
  jobTitle: string;
  employmentStartDate: string;
  onProbation: string;
  contractEndDate: string;        // If contractor
  
  // Self-employed details (conditional)
  yearsTrading: string;
  businessStructure: string;      // 'sole_trader', 'partnership', 'limited_company'
  accountantName: string;
  accountantFirm: string;
  accountantPhone: string;
  accountantEmail: string;
  
  // Property management (buy-to-let conditional)
  propertyManagementPlan: string; // 'self_managed', 'letting_agent', 'management_company'

  // Income
  annualSalary: string;
  bonus: string;
  commission: string;
  overtime: string;
  otherIncome: string;
  otherIncomeSource: string;

  // Outgoings / monthly commitments
  monthlyLoans: string;
  monthlyCreditCards: string;
  monthlyChildcare: string;
  monthlyMaintenance: string;     // Child/spousal maintenance
  monthlyCarFinance: string;
  monthlyOther: string;

  // Deposit / savings
  depositAmount: string;
  depositSource: string;          // 'savings', 'gift', 'inheritance', 'property_sale', 'other'
  isGiftedDeposit: string;
  fundsAvailable: string;         // Are funds readily available?
  savingsAmount: string;
  
  // Gift deposit details (conditional)
  giftorName: string;
  giftorRelationship: string;
  giftAmount: string;

  // Mortgage intent / goals
  buyerType: string;              // 'first_time', 'moving', 'remortgage', 'buy_to_let'
  propertyValue: string;
  loanAmount: string;
  targetTimeline: string;
  
  // Remortgage details (conditional)
  currentLender: string;
  outstandingBalance: string;
  currentMortgagePayment: string;
  remortgageReason: string;
  
  // Buy-to-let details (conditional)
  expectedRentalIncome: string;
  existingBTLPortfolio: string;

  // House hunting
  propertyStage: string;
  propertyAddress: string;
  propertyType: string;
  propertyOccupancy: string;
  offerMade: string;
  offerAccepted: string;

  // Signature
  signatureText: string;
  signatureConfirmed: boolean;
  declarationConfirmed: boolean;
  consentConfirmed: boolean;

  // Misc
  [key: string]: any;
}

// ─── Journey section ───────────────────────────────────────────────────────

export interface JourneySection {
  id: SectionId;
  label: string;
  status: SectionStatus;
  steps: string[]; // step IDs that belong to this section
}

// ─── Blocking issue ────────────────────────────────────────────────────────

export interface BlockingIssue {
  id: string;
  type: string;
  message: string;
  action?: string;
  sectionId?: SectionId;
  stepId?: string;
}

// ─── AI activity ───────────────────────────────────────────────────────────

export type ActivityType =
  | 'document_scan'
  | 'credit_check'
  | 'income_verify'
  | 'address_verify'
  | 'application_readiness'
  | 'identity_check'
  | 'employment_verify';

export interface AIActivity {
  id: string;
  timestamp: string;
  description: string;
  status: 'processing' | 'complete' | 'needs_review' | 'error';
  type?: ActivityType;
  progress?: number; // 0-100 for progress tracking
  errorMessage?: string;
}

export interface ActivityTriggerPayload {
  type: ActivityType;
  metadata?: {
    documentId?: string;
    documentName?: string;
    sectionId?: SectionId;
    stepId?: string;
    [key: string]: unknown;
  };
}

export interface ActivityStreamEvent {
  event: 'activity_started' | 'activity_progress' | 'activity_complete' | 'activity_error' | 'heartbeat';
  data: AIActivity | { timestamp: string };
}

// ─── Application state ─────────────────────────────────────────────────────

export interface ApplicationState {
  currentSection: SectionId;
  sections: JourneySection[];
  data: ApplicationData;
  documents: MortgageDocument[];
  requirements: DocumentRequirement[];
  agreements: Agreement[];
  aiActivity: AIActivity[];
  blockingIssues: BlockingIssue[];
  readinessScore: number; // 0-100
  // Tracks which fields were auto-populated from document extraction
  // Cleared when the user edits the field (trust user input)
  autofillSources: Record<string, string>;
}
