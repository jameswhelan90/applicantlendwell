import {
  ApplicationState,
  ApplicationData,
  MortgageDocument,
  DocumentRequirement,
  Agreement,
  JourneySection,
  AIActivity,
  BlockingIssue,
} from '@/types/tasks';

// ─── Empty form data ───────────────────────────────────────────────────────

export const emptyApplicationData: ApplicationData = {
  // Welcome / Orientation
  welcomeComplete: false,
  orientationComplete: false,
  
  // Identity
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  nationalInsuranceNumber: '',
  
  // Household / Circumstances
  maritalStatus: '',
  nationality: '',
  residencyStatus: '',
  dependants: '',
  dependantAges: '',
  monthlyChildcareCosts: '',
  applicationMode: '',
  
  // Second applicant (joint applications)
  secondApplicantFirstName: '',
  secondApplicantLastName: '',
  secondApplicantDob: '',
  secondApplicantEmail: '',
  secondApplicantPhone: '',
  secondApplicantEmploymentStatus: '',
  secondApplicantEmployerName: '',
  secondApplicantJobTitle: '',
  secondApplicantAnnualSalary: '',
  // Address
  currentAddress: '',
  postcode: '',
  moveInDate: '',
  residentialStatus: '',
  monthlyRent: '',
  previousAddress: '',
  // Employment
  employmentStatus: '',
  employerName: '',
  jobTitle: '',
  employmentStartDate: '',
  onProbation: '',
  contractEndDate: '',
  
  // Self-employed details
  yearsTrading: '',
  businessStructure: '',
  accountantName: '',
  accountantFirm: '',
  accountantPhone: '',
  accountantEmail: '',
  
  // Property management (buy-to-let)
  propertyManagementPlan: '',
  // Income
  annualSalary: '',
  bonus: '',
  commission: '',
  overtime: '',
  otherIncome: '',
  otherIncomeSource: '',
  // Monthly commitments
  monthlyLoans: '',
  monthlyCreditCards: '',
  monthlyChildcare: '',
  monthlyMaintenance: '',
  monthlyCarFinance: '',
  monthlyOther: '',
  // Deposit / savings
  depositAmount: '',
  depositSource: '',
  isGiftedDeposit: '',
  fundsAvailable: '',
  savingsAmount: '',
  giftorName: '',
  giftorRelationship: '',
  giftAmount: '',
  
  // Mortgage intent / goals
  buyerType: '',
  propertyValue: '',
  loanAmount: '',
  targetTimeline: '',
  currentLender: '',
  outstandingBalance: '',
  currentMortgagePayment: '',
  remortgageReason: '',
  expectedRentalIncome: '',
  existingBTLPortfolio: '',
  // House hunting
  propertyStage: '',
  propertyAddress: '',
  propertyType: '',
  propertyOccupancy: '',
  offerMade: '',
  offerAccepted: '',
  // Signature
  signatureText: '',
  signatureConfirmed: false,
  declarationConfirmed: false,
  consentConfirmed: false,
};

// ─── Journey sections ──────────────────────────────────────────────────────

export const initialSections: JourneySection[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    status: 'not_started',
    steps: ['welcome', 'orientation'],
  },
  {
    id: 'about_you',
    label: 'About You',
    status: 'not_started',
    steps: [
      'intro_about_you',
      // Identity
      'id_name',
      'id_dob',
      'id_contact',
      'id_nationality',
      'id_ni_pps',
      'id_address',
      'id_address_history',
      // Household
      'hh_circumstances',
      'hh_application_mode',
      'hh_second_applicant',
      'hh_second_applicant_contact',
      'hh_dependants',
    ],
  },
  {
    id: 'property_mortgage',
    label: 'Property & Mortgage',
    status: 'not_started',
    steps: [
      'intro_property_mortgage',
      // Intent
      'intent_type',
      'intent_remortgage',
      'intent_btl',
      'intent_timeline',
      // Property
      'prop_stage',
      'prop_details',
      'prop_value',
      // Deposit
      'dep_amount',
      'dep_source',
      'dep_gift_details',
    ],
  },
  {
    id: 'employment_income',
    label: 'Employment & Income',
    status: 'not_started',
    steps: [
      'intro_employment_income',
      // Employment
      'emp_status',
      'emp_details',
      'emp_self_employed',
      'emp_second_applicant',
      // Income
      'inc_salary',
      'inc_additional',
      'inc_second_applicant',
      // Commitments
      'commit_outgoings',
      'commit_childcare',
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    status: 'not_started',
    steps: [
      'intro_documents',
      // Progressive document uploads
      'id_upload_photo',
      'hh_upload_joint_id',
      'intent_upload_mortgage',
      'intent_upload_rental',
      'emp_upload_payslips',
      'emp_upload_tax',
      'emp_upload_joint',
      'inc_upload_bank',
      'inc_upload_joint_bank',
      'dep_upload_gift',
      'dep_upload_giftor',
      // Main upload dashboard
      'docs_overview',
    ],
  },
  {
    id: 'agreements',
    label: 'Agreements',
    status: 'not_started',
    steps: ['intro_agreements', 'ag_declarations', 'ag_signature'],
  },
  {
    id: 'collect_keys',
    label: 'Collect Your Keys',
    status: 'not_started',
    steps: ['completion'],
  },
];

// ─── Document Requirements ─────────────────────────────────────────────────

export const initialRequirements: DocumentRequirement[] = [
  // Identity & Address (always required)
  {
    id: 'req-passport',
    title: 'Photo ID',
    description: 'Valid passport or driving licence',
    acceptableDocuments: ['Passport', 'Driving licence', 'National ID card'],
    status: 'required',
    required: true,
  },
  {
    id: 'req-proof-of-address',
    title: 'Proof of address',
    description: 'Utility bill or bank statement dated within 3 months',
    acceptableDocuments: ['Utility bill', 'Council tax bill', 'Bank statement'],
    status: 'required',
    required: true,
  },
  // Employment & Income
  {
    id: 'req-payslips',
    title: 'Recent payslips',
    description: 'Last 3 months of consecutive payslips',
    acceptableDocuments: ['Payslip PDF', 'Payslip image'],
    status: 'required',
    required: true,
  },
  {
    id: 'req-p60',
    title: 'P60',
    description: 'Most recent tax year P60 from your employer',
    acceptableDocuments: ['P60 document'],
    status: 'required',
    required: true,
  },
  {
    id: 'req-employment-contract',
    title: 'Employment contract',
    description: 'Current contract showing salary and terms',
    acceptableDocuments: ['Employment contract', 'Offer letter'],
    status: 'required',
    required: false,
  },
  // Self-employment documents
  {
    id: 'req-sa302',
    title: 'SA302 Tax Calculations',
    description: 'Last 2-3 years of HMRC tax calculations',
    acceptableDocuments: ['SA302 forms', 'Tax calculation summary'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-tax-overview',
    title: 'Tax Year Overview',
    description: 'HMRC Tax Year Overview for last 2-3 years',
    acceptableDocuments: ['Tax year overview document'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-company-accounts',
    title: 'Company accounts',
    description: 'Last 2-3 years of certified accounts (Ltd companies)',
    acceptableDocuments: ['Certified accounts', 'Accountant letter'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-accountant-reference',
    title: 'Accountant reference',
    description: 'Letter from your accountant confirming income',
    acceptableDocuments: ['Accountant letter', 'Accountant certificate'],
    status: 'required',
    required: false,
  },
  // Contractor documents
  {
    id: 'req-current-contract',
    title: 'Current contract',
    description: 'Your current contracting agreement',
    acceptableDocuments: ['Contract document', 'Statement of work'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-contract-history',
    title: 'Contract history',
    description: 'Previous 12-24 months of contracts',
    acceptableDocuments: ['Previous contracts', 'Contract summary'],
    status: 'required',
    required: false,
  },
  // Bank Statements
  {
    id: 'req-bank-statements',
    title: 'Current account statements',
    description: 'Last 3 months from your main salary account',
    acceptableDocuments: ['Bank statement PDF', 'Online banking export'],
    status: 'required',
    required: true,
  },
  {
    id: 'req-savings-statements',
    title: 'Savings account statements',
    description: 'Showing deposit funds and savings history',
    acceptableDocuments: ['Savings statement', 'ISA statement'],
    status: 'required',
    required: false,
  },
  // Deposit & Savings
  {
    id: 'req-deposit-proof',
    title: 'Proof of deposit',
    description: 'Statement showing available deposit funds',
    acceptableDocuments: ['Bank statement', 'Investment statement', 'ISA statement'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-gift-letter',
    title: 'Gift letter',
    description: 'Declaration letter from person gifting funds',
    acceptableDocuments: ['Signed gift letter', 'Solicitor letter'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-giftor-statements',
    title: 'Giftor bank statements',
    description: '3 months statements from person gifting deposit',
    acceptableDocuments: ['Bank statements', 'Savings statements'],
    status: 'required',
    required: false,
  },
  // Credit Commitments
  {
    id: 'req-loan-statements',
    title: 'Loan statements',
    description: 'Current statements for any active loans',
    acceptableDocuments: ['Loan statement', 'Finance agreement'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-credit-card-statements',
    title: 'Credit card statements',
    description: 'Most recent statements showing balances',
    acceptableDocuments: ['Credit card statement'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-car-finance',
    title: 'Car finance agreement',
    description: 'HP or PCP agreement details',
    acceptableDocuments: ['Finance agreement', 'HP/PCP contract'],
    status: 'required',
    required: false,
  },
  // Property Documents
  {
    id: 'req-sale-agreement',
    title: 'Sale agreed letter',
    description: 'Estate agent confirmation of agreed sale',
    acceptableDocuments: ['Sale memorandum', 'Agent letter'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-property-details',
    title: 'Property listing',
    description: 'Estate agent listing or property details',
    acceptableDocuments: ['Property brochure', 'Listing PDF'],
    status: 'required',
    required: false,
  },
  // Additional Income
  {
    id: 'req-bonus-letter',
    title: 'Bonus confirmation',
    description: 'Letter from employer confirming bonus structure',
    acceptableDocuments: ['HR letter', 'Bonus letter'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-rental-income',
    title: 'Rental income evidence',
    description: 'Tenancy agreement and rental statements',
    acceptableDocuments: ['Tenancy agreement', 'Rental statements'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-maintenance-order',
    title: 'Maintenance order',
    description: 'Court order or agreement for child maintenance received',
    acceptableDocuments: ['Court order', 'CSA letter'],
    status: 'required',
    required: false,
  },
  // Legal & Residency
  {
    id: 'req-visa',
    title: 'Visa / BRP',
    description: 'Current visa or Biometric Residence Permit',
    acceptableDocuments: ['Visa document', 'BRP card'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-settled-status',
    title: 'Settled status proof',
    description: 'EU Settlement Scheme confirmation',
    acceptableDocuments: ['EUSS letter', 'Share code'],
    status: 'required',
    required: false,
  },
  // Second applicant documents (conditional: joint applications)
  {
    id: 'req-joint-passport',
    title: 'Second applicant Photo ID',
    description: 'Valid passport or driving licence for joint applicant',
    acceptableDocuments: ['Passport', 'Driving licence', 'National ID card'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-joint-payslips',
    title: 'Second applicant payslips',
    description: 'Last 3 months of consecutive payslips for joint applicant',
    acceptableDocuments: ['Payslip PDF', 'Payslip image'],
    status: 'required',
    required: false,
  },
  {
    id: 'req-joint-bank-statements',
    title: 'Second applicant bank statements',
    description: 'Last 3 months from joint applicant main account',
    acceptableDocuments: ['Bank statement PDF', 'Online banking export'],
    status: 'required',
    required: false,
  },
  // Remortgage documents (conditional)
  {
    id: 'req-mortgage-statement',
    title: 'Current mortgage statement',
    description: 'Most recent statement from your current lender',
    acceptableDocuments: ['Mortgage statement', 'Annual statement'],
    status: 'required',
    required: false,
  },
  // Buy-to-let documents (conditional)
  {
    id: 'req-rental-projection',
    title: 'Rental income projection',
    description: 'Expected rental income assessment or existing tenancy',
    acceptableDocuments: ['Letting agent valuation', 'AST agreement', 'Rental projection'],
    status: 'required',
    required: false,
  },
];

// ─── Documents ─────────────────────────────────────────────────────────────

export const initialDocuments: MortgageDocument[] = [
  {
    id: 'doc-payslips',
    label: 'Recent payslips',
    description: 'Last 3 months of payslips',
    status: 'required',
    required: true,
  },
  {
    id: 'doc-bank-statements',
    label: 'Bank statements',
    description: 'Last 3 months from your main current account',
    status: 'required',
    required: true,
  },
  {
    id: 'doc-passport',
    label: 'Passport or driving licence',
    description: 'Valid photo ID — ensure the photo page is clearly visible',
    status: 'required',
    required: true,
  },
  {
    id: 'doc-proof-of-address',
    label: 'Proof of address',
    description: 'Utility bill or council tax letter dated within 3 months',
    status: 'required',
    required: true,
  },
  {
    id: 'doc-sa302',
    label: 'SA302 / Tax return',
    description: 'Last 2 years — required if self-employed',
    status: 'optional',
    required: false,
  },
];

// ─── Agreements ────────────────────────────────────────────────────────────

export const initialAgreements: Agreement[] = [
  {
    id: 'ag-accuracy',
    title: 'Declaration of accuracy',
    body: 'I confirm that the information I have provided in this application is true and accurate to the best of my knowledge. I understand that providing false information is a criminal offence.',
    status: 'pending',
  },
  {
    id: 'ag-data',
    title: 'Data processing consent',
    body: 'I consent to Lendwell processing my personal data, including financial information, for the purpose of assessing my mortgage application. My data may be shared with lenders, credit reference agencies, and fraud prevention services.',
    status: 'pending',
  },
  {
    id: 'ag-credit',
    title: 'Credit check authorisation',
    body: 'I authorise Lendwell and its lending partners to conduct a credit search on my behalf. I understand this will be recorded on my credit file.',
    status: 'pending',
  },
];

// ─── AI activity ──────────────────────────────────────────────────────────��

export const initialAIActivity: AIActivity[] = [
  {
    id: 'ai-1',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    description: 'Checking application readiness',
    status: 'processing',
  },
];

// ─── Blocking issues ──────────────────��────────────────────────────────────

export const initialBlockingIssues: BlockingIssue[] = [];

// ─── Initial application state ─────────────────────────────────────────────

export const mockApplicationState: ApplicationState = {
  currentSection: 'welcome',
  sections: initialSections,
  data: emptyApplicationData,
  documents: initialDocuments,
  requirements: initialRequirements,
  agreements: initialAgreements,
  aiActivity: initialAIActivity,
  blockingIssues: initialBlockingIssues,
  readinessScore: 0,
};
