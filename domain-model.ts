export type ApplicationPhase =
  | "welcome"
  | "financial_profile"
  | "documents"
  | "house_hunting"
  | "agreements"
  | "completion";

export type ApplicationStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "completed";

export interface Application {
  id: string;
  createdAt: string;
  updatedAt: string;

  phase: ApplicationPhase;
  status: ApplicationStatus;
  progress: number;

  borrower: Borrower;
  property?: Property;

  finances: FinancialProfile;

  documents: Document[];

  affordability?: AffordabilityReport;

  recommendedProducts?: MortgageProduct[];
}

export interface Borrower {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  dateOfBirth?: string;
  maritalStatus?: "single" | "married" | "cohabiting";

  dependants?: number;

  employment: Employment;
}

export interface Employment {
  type:
    | "employed"
    | "self_employed"
    | "contractor"
    | "unemployed";

  employerName?: string;
  jobTitle?: string;

  annualIncome?: number;

  yearsInRole?: number;
}

export interface FinancialProfile {
  annualIncome: number;

  additionalIncome?: number;

  savings?: number;

  monthlyExpenses?: number;

  existingLoans?: Loan[];

  creditScore?: number;
}

export interface Loan {
  lender: string;

  balance: number;

  monthlyPayment: number;

  type:
    | "car_loan"
    | "personal_loan"
    | "credit_card"
    | "student_loan";
}

export interface Property {
  purchasePrice: number;

  address?: string;

  propertyType?:
    | "house"
    | "apartment"
    | "duplex"
    | "new_build";

  deposit: number;

  expectedCompletionDate?: string;
}

export type DocumentType =
  | "passport"
  | "payslip"
  | "bank_statement"
  | "tax_return"
  | "proof_of_address"
  | "employment_letter";

export interface Document {
  id: string;

  type: DocumentType;

  status:
    | "missing"
    | "uploaded"
    | "processing"
    | "verified";

  uploadedAt?: string;

  extractedData?: Record<string, any>;
}

export interface AffordabilityReport {
  borrowingCapacity: number;

  monthlyRepaymentEstimate: number;

  interestRateAssumption: number;

  stressTestRate: number;

  affordabilityRatio?: number;

  lenderLimits?: number;
}

export interface MortgageProduct {
  lender: string;

  productName: string;

  rate: number;

  termYears: number;

  monthlyRepayment: number;

  maxLTV: number;
}
