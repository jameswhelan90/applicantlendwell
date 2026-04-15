'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { useChat } from '@/context/ChatContext';
import { DocumentRequirement, RequirementStatus } from '@/types/tasks';
import {
  AI_EXTRACTION_MESSAGES,
  AI_VERIFIED_MESSAGES,
  AI_ISSUE_MESSAGES,
  DEMO_EXTRACTED_FIELDS,
} from '@/constants/documentMessages';
import { ExtractedFieldsGrid } from './ExtractedFieldsGrid';
import { useToast } from '@/components/ui/Toast';

// ─── Upload Flow Types ───────────────────────────────────────────────────────

type UploadPhase = 'idle' | 'uploading' | 'sorting' | 'scanning' | 'complete';

interface UploadingFile {
  id: string;
  originalName: string;
  assignedDocId: string;
  assignedDocTitle: string;
  progress: number;
  phase: 'uploading' | 'sorting' | 'scanning' | 'verified' | 'issue';
}

// Realistic UK/Irish mortgage document name mappings
const DOCUMENT_NAME_MAPPINGS: Record<string, string[]> = {
  'req-passport': ['Passport_Scan.pdf', 'Driving_Licence.pdf', 'Photo_ID_Verified.pdf'],
  'req-proof-of-address': ['Utility_Bill_Mar2024.pdf', 'Bank_Statement_Address.pdf', 'Council_Tax_Bill.pdf'],
  'req-payslips': ['Payslip_March_2024.pdf', 'Payslip_February_2024.pdf', 'Payslip_January_2024.pdf'],
  'req-p60': ['P60_2023-24.pdf', 'P60_Tax_Year_End.pdf'],
  'req-bank-statements': ['Current_Account_Statement.pdf', 'Salary_Account_3_Months.pdf'],
  'req-employer-reference': ['Employment_Reference_Letter.pdf', 'HR_Confirmation_Letter.pdf'],
  'req-sa302': ['SA302_Tax_Calculation.pdf', 'HMRC_Tax_Overview.pdf'],
  'req-business-accounts': ['Company_Accounts_2023.pdf', 'Certified_Accounts.pdf'],
  'req-contract': ['Employment_Contract.pdf', 'Contract_Extension.pdf'],
  'req-deposit-proof': ['Deposit_Savings_Statement.pdf', 'ISA_Statement.pdf'],
  'req-gift-letter': ['Gift_Declaration_Letter.pdf', 'Gifted_Deposit_Confirmation.pdf'],
  'req-aip': ['Agreement_In_Principle.pdf', 'Mortgage_AIP_Letter.pdf'],
};
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  MessageSquare,
  X,
  User,
  Building2,
  CreditCard,
  Home,
  FileCheck,
  Wallet,
  Receipt,
  Scale,
  Gift,
  Briefcase,
  PoundSterling,
  ChevronDown,
  Clock,
  Users,
  Camera,
  Info,
} from 'lucide-react';

// ─── Document category definitions ───────────────────────────────────────────

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  documents: DocumentDefinition[];
}

interface DocumentDefinition {
  id: string;
  title: string;
  description: string;
  acceptableDocuments: string[];
  required: boolean;
  why?: string;       // Shown in expanded state to explain why lenders need this
  minFiles?: number;  // Minimum files required before marking verified (default: 1)
  // Conditions based on ApplicationData fields
  conditions?: {
    field: string;
    values?: string[];
    notEmpty?: boolean;
  }[];
}

// ─── UK/Ireland Mortgage Document Categories ─────────────────────────────────

const documentCategories: DocumentCategory[] = [
  {
    id: 'identity',
    title: 'Identity & Address',
    description: 'Verify who you are and where you live',
    icon: User,
    documents: [
      {
        id: 'req-passport',
        title: 'Photo ID',
        description: 'Valid passport or driving licence',
        acceptableDocuments: ['Passport', 'Driving licence', 'National ID card'],
        required: true,
        why: 'Lenders are legally required to verify your identity before processing a mortgage application.',
      },
      {
        id: 'req-proof-of-address',
        title: 'Proof of address',
        description: 'Utility bill or bank statement dated within 3 months',
        acceptableDocuments: ['Utility bill', 'Council tax bill', 'Bank statement'],
        required: true,
        why: 'Lenders need to confirm your current address to comply with anti-money-laundering regulations.',
      },
    ],
  },
  {
    id: 'income-employed',
    title: 'Employment & Income',
    description: 'Evidence of your regular income',
    icon: Briefcase,
    documents: [
      {
        id: 'req-payslips',
        title: 'Recent payslips',
        description: 'Last 3 months of consecutive payslips',
        acceptableDocuments: ['Payslip PDF', 'Payslip image'],
        required: true,
        minFiles: 3,
        why: 'Lenders use your payslips to confirm your income is stable and matches what you\'ve declared in your application.',
        conditions: [{ field: 'employmentStatus', values: ['employed'] }],
      },
      {
        id: 'req-p60',
        title: 'P60',
        description: 'Most recent tax year P60 from your employer',
        acceptableDocuments: ['P60 document'],
        required: true,
        why: 'Your P60 confirms your total annual earnings and tax paid — lenders use this to cross-reference your declared income.',
        conditions: [{ field: 'employmentStatus', values: ['employed'] }],
      },
      {
        id: 'req-employment-contract',
        title: 'Employment contract',
        description: 'Current contract showing salary and terms',
        acceptableDocuments: ['Employment contract', 'Offer letter'],
        required: false,
        why: 'Uploading your contract helps lenders confirm your employment is permanent and verify your salary independently.',
        conditions: [{ field: 'employmentStatus', values: ['employed'] }],
      },
    ],
  },
  {
    id: 'income-self-employed',
    title: 'Self-Employment Income',
    description: 'Business and tax documentation',
    icon: Building2,
    documents: [
      {
        id: 'req-sa302',
        title: 'SA302 Tax Calculations',
        description: 'Last 2-3 years of HMRC tax calculations',
        acceptableDocuments: ['SA302 forms', 'Tax calculation summary'],
        required: true,
        why: 'Lenders need 2–3 years of SA302s to assess your income stability, as self-employed income can vary year to year.',
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'self_employed'] }],
      },
      {
        id: 'req-tax-overview',
        title: 'Tax Year Overview',
        description: 'HMRC Tax Year Overview for last 2-3 years',
        acceptableDocuments: ['Tax year overview document'],
        required: true,
        why: 'The Tax Year Overview confirms your SA302 figures match HMRC\'s records — most lenders require both together.',
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'self_employed'] }],
      },
      {
        id: 'req-company-accounts',
        title: 'Company accounts',
        description: 'Last 2-3 years of certified accounts (Ltd companies)',
        acceptableDocuments: ['Certified accounts', 'Accountant letter'],
        required: false,
        why: 'For limited companies, certified accounts help lenders understand the business\'s financial health alongside your personal drawings.',
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'self_employed'] }],
      },
      {
        id: 'req-accountant-reference',
        title: 'Accountant reference',
        description: 'Letter from your accountant confirming income',
        acceptableDocuments: ['Accountant letter', 'Accountant certificate'],
        required: false,
        why: 'An accountant reference can strengthen your application by providing a professional third-party confirmation of your income.',
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'self_employed'] }],
      },
    ],
  },
  {
    id: 'income-contractor',
    title: 'Contractor Income',
    description: 'Contract and income documentation',
    icon: FileCheck,
    documents: [
      {
        id: 'req-current-contract',
        title: 'Current contract',
        description: 'Your current contracting agreement',
        acceptableDocuments: ['Contract document', 'Statement of work'],
        required: true,
        conditions: [{ field: 'employmentStatus', values: ['contractor', 'Contractor'] }],
      },
      {
        id: 'req-contract-history',
        title: 'Contract history',
        description: 'Previous 12-24 months of contracts',
        acceptableDocuments: ['Previous contracts', 'Contract summary'],
        required: false,
        conditions: [{ field: 'employmentStatus', values: ['contractor', 'Contractor'] }],
      },
    ],
  },
  {
    id: 'bank-statements',
    title: 'Bank Statements',
    description: 'Transaction history from your accounts',
    icon: CreditCard,
    documents: [
      {
        id: 'req-bank-statements',
        title: 'Current account statements',
        description: 'Last 3 months from your main salary account',
        acceptableDocuments: ['Bank statement PDF', 'Online banking export'],
        required: true,
        minFiles: 3,
        why: 'Lenders review 3 months of transactions to verify your salary is paid regularly and assess your overall spending habits.',
      },
      {
        id: 'req-savings-statements',
        title: 'Savings account statements',
        description: 'Showing deposit funds and savings history',
        acceptableDocuments: ['Savings statement', 'ISA statement'],
        required: true,
        conditions: [{ field: 'depositAmount', notEmpty: true }],
      },
    ],
  },
  {
    id: 'deposit',
    title: 'Deposit & Savings',
    description: 'Evidence of your deposit funds',
    icon: Wallet,
    documents: [
      {
        id: 'req-deposit-proof',
        title: 'Proof of deposit',
        description: 'Statement showing available deposit funds',
        acceptableDocuments: ['Bank statement', 'Investment statement', 'ISA statement'],
        required: true,
        conditions: [{ field: 'depositAmount', notEmpty: true }],
      },
      {
        id: 'req-gift-letter',
        title: 'Gift letter',
        description: 'Declaration letter from person gifting funds',
        acceptableDocuments: ['Signed gift letter', 'Solicitor letter'],
        required: true,
        why: 'Lenders need written confirmation that gifted funds don\'t need to be repaid, as repayable gifts affect your affordability.',
        conditions: [{ field: 'isGiftedDeposit', values: ['yes', 'Yes', 'true'] }],
      },
      {
        id: 'req-giftor-statements',
        title: 'Giftor bank statements',
        description: '3 months statements from person gifting deposit',
        acceptableDocuments: ['Bank statements', 'Savings statements'],
        required: true,
        conditions: [{ field: 'isGiftedDeposit', values: ['yes', 'Yes', 'true'] }],
      },
    ],
  },
  {
    id: 'credit',
    title: 'Credit Commitments',
    description: 'Outstanding loans and credit',
    icon: Receipt,
    documents: [
      {
        id: 'req-loan-statements',
        title: 'Loan statements',
        description: 'Current statements for any active loans',
        acceptableDocuments: ['Loan statement', 'Finance agreement'],
        required: false,
        conditions: [{ field: 'monthlyLoans', notEmpty: true }],
      },
      {
        id: 'req-credit-card-statements',
        title: 'Credit card statements',
        description: 'Most recent statements showing balances',
        acceptableDocuments: ['Credit card statement'],
        required: false,
        conditions: [{ field: 'monthlyCreditCards', notEmpty: true }],
      },
      {
        id: 'req-car-finance',
        title: 'Car finance agreement',
        description: 'HP or PCP agreement details',
        acceptableDocuments: ['Finance agreement', 'HP/PCP contract'],
        required: false,
        conditions: [{ field: 'monthlyCarFinance', notEmpty: true }],
      },
    ],
  },
  {
    id: 'property',
    title: 'Property Documents',
    description: 'Documents for the property you are buying',
    icon: Home,
    documents: [
      {
        id: 'req-sale-agreement',
        title: 'Sale agreed letter',
        description: 'Estate agent confirmation of agreed sale',
        acceptableDocuments: ['Sale memorandum', 'Agent letter'],
        required: false,
        conditions: [{ field: 'offerAccepted', values: ['yes', 'Yes', 'true'] }],
      },
      {
        id: 'req-property-details',
        title: 'Property listing',
        description: 'Estate agent listing or property details',
        acceptableDocuments: ['Property brochure', 'Listing PDF'],
        required: false,
        conditions: [{ field: 'propertyAddress', notEmpty: true }],
      },
    ],
  },
  {
    id: 'additional',
    title: 'Additional Income',
    description: 'Evidence of other income sources',
    icon: PoundSterling,
    documents: [
      {
        id: 'req-bonus-letter',
        title: 'Bonus confirmation',
        description: 'Letter from employer confirming bonus structure',
        acceptableDocuments: ['HR letter', 'Bonus letter'],
        required: false,
        conditions: [{ field: 'bonus', notEmpty: true }],
      },
      {
        id: 'req-rental-income',
        title: 'Rental income evidence',
        description: 'Tenancy agreement and rental statements',
        acceptableDocuments: ['Tenancy agreement', 'Rental statements'],
        required: false,
        conditions: [{ field: 'otherIncomeSource', values: ['rental', 'Rental', 'property', 'Property'] }],
      },
      {
        id: 'req-maintenance-order',
        title: 'Maintenance order',
        description: 'Court order or agreement for child maintenance received',
        acceptableDocuments: ['Court order', 'CSA letter'],
        required: false,
        conditions: [{ field: 'otherIncomeSource', values: ['maintenance', 'Maintenance', 'child support'] }],
      },
    ],
  },
  {
    id: 'joint-applicant',
    title: 'Second applicant documents',
    description: 'Supporting documents for your co-applicant',
    icon: Users,
    documents: [
      {
        id: 'req-joint-passport',
        title: 'Co-applicant photo ID',
        description: 'Valid passport or driving licence for your co-applicant',
        acceptableDocuments: ['Passport', 'Driving licence'],
        required: true,
        why: 'Lenders must verify the identity of all applicants named on the mortgage.',
        conditions: [{ field: 'applicationMode', values: ['joint'] }],
      },
      {
        id: 'req-joint-payslips',
        title: 'Co-applicant payslips',
        description: 'Last 3 months of payslips for your co-applicant',
        acceptableDocuments: ['Payslip PDF', 'Payslip image'],
        required: true,
        minFiles: 3,
        why: 'Lenders need to verify your co-applicant\'s income independently to calculate joint affordability.',
        conditions: [
          { field: 'applicationMode', values: ['joint'] },
          { field: 'secondApplicantEmploymentStatus', values: ['employed'] },
        ],
      },
      {
        id: 'req-joint-bank-statements',
        title: 'Co-applicant bank statements',
        description: 'Last 3 months from co-applicant\'s main account',
        acceptableDocuments: ['Bank statement PDF'],
        required: true,
        minFiles: 3,
        why: 'Lenders review both applicants\' bank statements to assess the combined financial picture.',
        conditions: [{ field: 'applicationMode', values: ['joint'] }],
      },
    ],
  },
  {
    id: 'remortgage',
    title: 'Remortgage documents',
    description: 'Documents relating to your existing mortgage',
    icon: Home,
    documents: [
      {
        id: 'req-mortgage-statement',
        title: 'Current mortgage statement',
        description: 'Most recent annual statement from your current lender',
        acceptableDocuments: ['Annual mortgage statement'],
        required: true,
        why: 'Your current mortgage statement shows the outstanding balance and remaining term — essential information for your new lender.',
        conditions: [{ field: 'buyerType', values: ['remortgage'] }],
      },
      {
        id: 'req-redemption-statement',
        title: 'Redemption statement',
        description: 'Up-to-date figure from your lender (valid for 30 days)',
        acceptableDocuments: ['Redemption statement'],
        required: false,
        why: 'A redemption statement shows the exact amount needed to pay off your current mortgage, including any early repayment charges.',
        conditions: [{ field: 'buyerType', values: ['remortgage'] }],
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal & Residency',
    description: 'Visa and legal documentation',
    icon: Scale,
    documents: [
      {
        id: 'req-visa',
        title: 'Visa / BRP',
        description: 'Current visa or Biometric Residence Permit',
        acceptableDocuments: ['Visa document', 'BRP card'],
        required: true,
        conditions: [{ field: 'residencyStatus', values: ['visa', 'Visa holder', 'work visa', 'spouse visa'] }],
      },
      {
        id: 'req-settled-status',
        title: 'Settled status proof',
        description: 'EU Settlement Scheme confirmation',
        acceptableDocuments: ['EUSS letter', 'Share code'],
        required: false,
        conditions: [{ field: 'residencyStatus', values: ['settled', 'pre-settled', 'EU settled'] }],
      },
    ],
  },
];

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusIcon(status: RequirementStatus) {
  switch (status) {
    case 'verified':
      return <CheckCircle2 className="w-5 h-5" style={{ color: '#3C6006' }} />;
    case 'reviewing':
    case 'uploading':
      return <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#473FE6' }} />;
    case 'issue':
      return <AlertCircle className="w-5 h-5" style={{ color: '#E07900' }} />;
    case 'needs_update':
      return <Clock className="w-5 h-5" style={{ color: '#B45309' }} />;
    default:
      return <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: '#E1E8EE' }} />;
  }
}

function getStatusLabel(status: RequirementStatus, filesCount?: { uploaded: number; required: number }): string {
  switch (status) {
    case 'verified':
      if (filesCount && filesCount.required > 1) {
        return `${filesCount.uploaded}/${filesCount.required} verified`;
      }
      return 'Verified';
    case 'reviewing':
      return 'Scanning & Verifying';
    case 'uploading':
      return 'Uploading...';
    case 'issue':
      return 'Issue found';
    case 'needs_update':
      return 'Out of date';
    default:
      return 'Required';
  }
}

function getStatusColor(status: RequirementStatus): string {
  switch (status) {
    case 'verified':
      return '#3C6006';     // Success.Text-Soft
    case 'reviewing':
    case 'uploading':
      return '#3126E3';     // Indigo.Color (processing)
    case 'issue':
      return '#653701';     // Warning.Text-Soft
    case 'needs_update':
      return '#92400E';     // Amber text
    default:
      return '#5A7387';     // Primary.Color (textMuted)
  }
}

function getStatusBgColor(status: RequirementStatus): string {
  switch (status) {
    case 'verified':
      return '#EEFDD9';     // Success.Fill-Soft
    case 'reviewing':
    case 'uploading':
      return '#EDECFD';     // Indigo.Fill-Soft
    case 'issue':
      return '#FFF6EA';     // Warning.Fill-Soft
    case 'needs_update':
      return '#FEF3C7';     // Amber fill
    default:
      return '#F7F8FC';     // Primary.Fill-Soft
  }
}

// ─── Document Card Component ─────────────────────────────────────────────────

// ─── Document Accordion Item Component ──────────────────────────────────────

function DocumentAccordionItem({
  doc,
  requirement,
  onUpload,
}: {
  doc: DocumentDefinition;
  requirement?: DocumentRequirement;
  onUpload: (docId: string, files: FileList) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const status = requirement?.status || 'required';
  const isComplete = status === 'verified';
  const isProcessing = status === 'reviewing' || status === 'uploading';
  const hasFile = !!requirement?.uploadedFileName;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(doc.id, e.dataTransfer.files);
      setIsExpanded(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(doc.id, e.target.files);
      setIsExpanded(true);
    }
    e.target.value = '';
  };

  // Auto-expand when processing or file uploaded
  if ((isProcessing || hasFile) && !isExpanded) {
    setIsExpanded(true);
  }

  return (
    <div
      id={`doc-${doc.id}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Accordion header button with card styling */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 text-left card-interactive group"
        style={{
          backgroundColor: isDragging
            ? 'rgba(49,38,227,0.03)'
            : '#ffffff',
          borderRadius: '12px',
          marginBottom: '6px',
        }}
      >
        {/* Chevron with enhanced visibility on hover */}
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 expand-affordance"
          style={{ 
            color: '#6B7280',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease-out, opacity 120ms ease-out',
          }}
        />

        {/* Status icon */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {getStatusIcon(status)}
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold transition-colors duration-120"
            style={{ color: isComplete ? '#3C6006' : '#182026' }}
          >
            {doc.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 transition-colors duration-120 line-clamp-1 sm:line-clamp-none">
            {doc.description}
          </p>
        </div>

        {/* Status badge with hover elevation */}
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 badge-interactive"
          style={{
            backgroundColor: getStatusBgColor(status),
            color: getStatusColor(status),
            display: 'inline-block',
          }}
        >
          {doc.required ? getStatusLabel(status) : 'Recommended'}
        </span>
      </button>

      {/* Accordion content with smooth transition */}
      {isExpanded && (
        <div
          className="py-4 animate-in fade-in duration-150"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.00)',
            paddingLeft: '0px',
            paddingRight: '0px',
            borderRadius: '0',
            marginBottom: '0px',
            marginLeft: '0',
            marginRight: '0',
            marginTop: '-8px',
          }}
        >
          <div className="space-y-3" style={{ borderRadius: '8px' }}>

            {/* Why this document is needed */}
            {doc.why && !hasFile && (
              <div className="flex items-start gap-2 px-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#9CA3AF' }} />
                <p className="text-xs" style={{ color: '#6B7280', lineHeight: '1.5' }}>
                  {doc.why}
                </p>
              </div>
            )}

            {/* Optional document nudge */}
            {!doc.required && !hasFile && (
              <p className="text-xs px-1" style={{ color: '#9CA3AF' }}>
                Uploading this can strengthen your application and may increase the income lenders consider.
              </p>
            )}

            {/* Drop zone or file display */}
            {!hasFile ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-6 text-center dropzone-interactive ${isDragging ? 'dragging' : ''}`}
                  style={{ borderRadius: '8px' }}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                  <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: '600' }}>
                    Drop file here or click to upload
                  </p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: '12px', fontWeight: '600' }}>
                    PDF, JPG, or PNG{doc.minFiles && doc.minFiles > 1 ? ` · ${doc.minFiles} files needed` : ''}
                  </p>
                </button>

                {/* Mobile camera CTA — only on touch devices */}
                <div className="sm:hidden flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment');
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: '#F7F8FC', color: '#182026', border: '1px solid #E5E7EB' }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Take a photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute('capture');
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: '#F7F8FC', color: '#182026', border: '1px solid #E5E7EB' }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Choose
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {/* Uploaded file */}
                <div
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border transition-all duration-120"
                  style={{
                    borderColor: '#E5E7EB',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: isComplete ? '#3C6006' : '#473FE6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900">
                      {requirement?.uploadedFileName}
                    </p>
                    {requirement?.aiMessage && (
                      <p className="text-xs mt-1 text-gray-600">
                        {requirement.aiMessage}
                      </p>
                    )}
                  </div>
                  {isProcessing && (
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#473FE6' }} />
                  )}
                  {isComplete && (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
                  )}
                </div>

                {/* Issue message + replace CTA */}
                {status === 'issue' && requirement?.issueMessage && (
                  <div className="space-y-2">
                    <div
                      className="flex items-start gap-2 p-3 rounded-lg border"
                      style={{ backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E07900' }} />
                      <p className="text-xs" style={{ color: '#653701', lineHeight: '1.5' }}>
                        {requirement.issueMessage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full"
                      style={{ backgroundColor: '#FFF6EA', color: '#E07900', border: '1px solid #FCD34D' }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Replace document
                    </button>
                  </div>
                )}

                {/* Needs update message + replace CTA */}
                {status === 'needs_update' && requirement?.issueMessage && (
                  <div className="space-y-2">
                    <div
                      className="flex items-start gap-2 p-3 rounded-lg border"
                      style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }}
                    >
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                      <p className="text-xs" style={{ color: '#92400E', lineHeight: '1.5' }}>
                        {requirement.issueMessage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full"
                      style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload newer document
                    </button>
                  </div>
                )}

                {/* Success message + extracted fields */}
                {isComplete && (
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#BEF264' }}>
                    <div
                      className="flex items-center gap-2 p-3"
                      style={{ backgroundColor: '#F0FBDF' }}
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
                      <p className="text-xs font-medium" style={{ color: '#3C6006' }}>
                        {AI_VERIFIED_MESSAGES[doc.id] || 'Document verified successfully'}
                      </p>
                    </div>
                    {requirement?.extractedFields && (
                      <ExtractedFieldsGrid fields={requirement.extractedFields} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Category Section Component ──────────────────────────────────────────────

function CategorySection({
  category,
  documents,
  requirements,
  onUpload,
}: {
  category: DocumentCategory;
  documents: DocumentDefinition[];
  requirements: DocumentRequirement[];
  onUpload: (docId: string, files: FileList) => void;
}) {
  const Icon = category.icon;
  const completedCount = documents.filter(doc => {
    const req = requirements.find(r => r.id === doc.id);
    return req?.status === 'verified';
  }).length;
  const requiredCount = documents.filter(d => d.required).length;

  return (
    <div className="mb-8 last:mb-0">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="hidden sm:flex w-9 h-9 flex-shrink-0 items-center justify-center"
          style={{
            backgroundColor: '#EEF0FD',
            borderRadius: '999px',
          }}
        >
          <Icon className="w-4 h-4" style={{ color: '#473FE6' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold mb-0.5" style={{ color: '#182026', marginBottom: '2px' }}>
            {category.title}
          </h3>
          <p className="font-medium" style={{ color: '#182026', fontSize: '14px' }}>
            {category.description}
          </p>
        </div>
        {requiredCount > 0 && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '999px',
              backgroundColor: completedCount === requiredCount ? '#EEFDD9' : '#F7F8FC',
              color: completedCount === requiredCount ? '#3C6006' : '#5A7387',
            }}
          >
            {completedCount}/{requiredCount} complete
          </span>
        )}
      </div>

      {/* Documents accordion list */}
      <div>
        {documents.map((doc) => (
          <DocumentAccordionItem
            key={doc.id}
            doc={doc}
            requirement={requirements.find(r => r.id === doc.id)}
            onUpload={onUpload}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Bottom Bar ───────────────────────────────────────────────────────────────

function BottomBar({ onBrowseFiles }: { onBrowseFiles: (files: FileList) => void }) {
  const { toggleChat, isChatOpen } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -4px 16px rgba(24, 32, 38, 0.06)',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onBrowseFiles(e.target.files);
          }
          e.target.value = '';
        }}
      />

      {/* Browse files — left */}
      <button
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-md active:scale-95 flex-shrink-0"
        style={{ backgroundColor: '#473FE6', color: '#ffffff' }}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Browse files to upload"
      >
        <Upload className="w-4 h-4" />
        Browse files
      </button>

      {/* Chat with Us — right */}
      <button
        ref={chatButtonRef}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-md active:scale-95 flex-shrink-0"
        style={{
          backgroundColor: isChatOpen ? '#182026' : '#F3F4F6',
          color: isChatOpen ? '#ffffff' : '#182026',
          border: 'none',
        }}
        onClick={() => {
          const rect = chatButtonRef.current?.getBoundingClientRect();
          toggleChat(rect ? { bottom: rect.bottom, right: rect.right, left: rect.left, top: rect.top, width: rect.width } : undefined);
        }}
        aria-label={isChatOpen ? 'Close chat' : 'Chat with us'}
      >
        <MessageSquare className="w-4 h-4" />
        Chat with us
      </button>
    </div>
  );
}

// ─── Bulk Drop Zone ──────────────────────────────────────────────────────────

// Tags that should not bubble a click up to open the file dialog
const INTERACTIVE_TAGS = new Set(['BUTTON', 'A', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA']);

function BulkDropZone({
  children,
  onUpload,
  uploadPhase = 'idle',
  uploadingFiles = [],
  onBulkUpload,
}: {
  children: React.ReactNode;
  onUpload: (docId: string, files: FileList) => void;
  uploadPhase?: UploadPhase;
  uploadingFiles?: UploadingFile[];
  onBulkUpload: (files: FileList) => void;
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadPhase !== 'idle' && uploadPhase !== 'complete';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    // Handle bulk file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onBulkUpload(e.dataTransfer.files);
    }
  };

  // Open the file dialog when clicking anywhere in the zone that isn't
  // an interactive element (button, input, link, etc.)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const clickedInteractive = INTERACTIVE_TAGS.has(target.tagName) ||
      target.closest('button, a, input, label, select, textarea') !== null;
    if (!clickedInteractive) {
      fileInputRef.current?.click();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      role="button"
      tabIndex={0}
      aria-label="Click or drop files here to upload"
      className="rounded-xl transition-colors duration-200 cursor-pointer"
      style={{
        border: isDraggingOver ? '2px dashed #473FE6' : '2px dashed #E1E8EE',
        backgroundColor: isDraggingOver ? 'rgba(71, 63, 230, 0.02)' : 'rgba(250, 251, 252, 0.00)',
        padding: '24px',
        outline: 'none',
        fontWeight: '500',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      {/* Hidden file input for click-to-browse */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onBulkUpload(e.target.files);
          }
          e.target.value = '';
        }}
      />

      {/* Zone header */}
      <div className="flex items-center gap-3 mb-6 pb-5 pointer-events-none" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isUploading ? '#EEF0FD' : '#EEF0FD' }}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#473FE6' }} />
          ) : (
            <Upload className="w-4 h-4" style={{ color: '#473FE6' }} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#182026' }}>
            {isUploading 
              ? uploadPhase === 'uploading' 
                ? 'Uploading documents...'
                : uploadPhase === 'sorting'
                ? 'Sorting documents...'
                : 'Scanning & verifying documents...'
              : 'Drag and drop files anywhere in this area'
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {isUploading
              ? `Processing ${(uploadingFiles ?? []).length} file${(uploadingFiles ?? []).length !== 1 ? 's' : ''}`
              : 'LendWell will automatically categorise and match each document'
            }
          </p>
        </div>
      </div>

      {/* Upload progress overlay */}
      {isUploading && (
        <div className="mb-6">
          <div className="space-y-3">
            {(uploadingFiles ?? []).map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: file.phase === 'verified' ? '#F0FBDF' : file.phase === 'issue' ? '#FEF3C7' : '#F7F8FC',
                  opacity: file.phase === 'sorting' ? 0.7 : 1,
                  transform: file.phase === 'sorting' ? 'translateX(10px)' : 'translateX(0)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: file.phase === 'verified' ? '#ECFCCB' : file.phase === 'issue' ? '#FDE68A' : '#EEF0FD' 
                  }}
                >
                  {file.phase === 'verified' ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#3C6006' }} />
                  ) : file.phase === 'issue' ? (
                    <AlertCircle className="w-4 h-4" style={{ color: '#E07900' }} />
                  ) : file.phase === 'scanning' ? (
                    <img src="/images/lendwell-ai-logo.svg" alt="" className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#473FE6' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#182026' }}>
                    {file.assignedDocTitle}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {file.phase === 'uploading' && 'Uploading...'}
                    {file.phase === 'sorting' && `Matched to ${file.assignedDocTitle}`}
                    {file.phase === 'scanning' && 'LendWell is checking your document...'}
                    {file.phase === 'verified' && 'Verified successfully'}
                    {file.phase === 'issue' && 'Issue found — please review'}
                  </p>
                </div>
                {file.phase === 'uploading' && (
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%`, backgroundColor: '#473FE6' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document category cards */}
      <div className="pointer-events-auto" style={{ pointerEvents: isUploading ? 'none' : 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────��────���───���─────

export function DocumentsUploadSection() {
  const { state, updateRequirementStatus } = useApplication();
  const toast = useToast();
  const appData = state.data;
  const requirements = state.requirements || [];

  // Upload flow state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Dismissible instructional banner
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem('docs-banner-dismissed') === '1'
  );
  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('docs-banner-dismissed', '1');
  };

  // Filter documents based on user's application data
  const filteredCategories = useMemo(() => {
    return documentCategories
      .map((category) => {
        const filteredDocs = category.documents.filter((doc) => {
          // If no conditions, always show the document
          if (!doc.conditions || doc.conditions.length === 0) {
            return true;
          }

          // Check all conditions (AND logic across multiple conditions)
          return doc.conditions.every((condition) => {
            const fieldValue = appData[condition.field as keyof typeof appData];

            if (condition.notEmpty) {
              return fieldValue && String(fieldValue).trim() !== '' && String(fieldValue) !== '0';
            }

            if (condition.values) {
              // If field is empty, don't show conditionally-gated documents
              if (!fieldValue || String(fieldValue).trim() === '') {
                return false;
              }
              // Exact match (case-insensitive) — prevents 'self-employed'.includes('employed') bug
              return condition.values.some(v =>
                String(fieldValue).toLowerCase().trim() === v.toLowerCase().trim()
              );
            }

            return true;
          });
        });

        return {
          ...category,
          documents: filteredDocs,
        };
      })
      .filter((category) => category.documents.length > 0);
  }, [appData]);

  // Calculate overall progress
  const allFilteredDocs = filteredCategories.flatMap(c => c.documents);
  const requiredDocs = allFilteredDocs.filter(d => d.required);
  const completedDocs = requiredDocs.filter(doc => {
    const req = requirements.find(r => r.id === doc.id);
    return req?.status === 'verified';
  });
  const issueDocs = requiredDocs.filter(doc => {
    const req = requirements.find(r => r.id === doc.id);
    return req?.status === 'issue' || req?.status === 'needs_update';
  });
  const allComplete = requiredDocs.length > 0 && completedDocs.length === requiredDocs.length;
  const progressPct = requiredDocs.length > 0 ? (completedDocs.length / requiredDocs.length) * 100 : 0;

  // Handle single file upload with AI simulation
  const handleUpload = useCallback((docId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Get realistic document name
    const docNames = DOCUMENT_NAME_MAPPINGS[docId] || [file.name];
    const realisticName = docNames[Math.floor(Math.random() * docNames.length)];

    // Get the document title for toast notifications
    const docDef = allFilteredDocs.find(d => d.id === docId);
    const docTitle = docDef?.title || 'Document';

    // Start uploading
    updateRequirementStatus(docId, 'uploading', {
      fileName: realisticName,
      aiMessage: 'Uploading document...',
    });

    // Simulate AI processing
    setTimeout(() => {
      updateRequirementStatus(docId, 'reviewing', {
        fileName: realisticName,
        aiMessage: AI_EXTRACTION_MESSAGES[docId] || 'LendWell is reviewing your document...',
      });
    }, 500);

    // Simulate verification (with occasional issues for realism)
    setTimeout(() => {
      const hasIssue = Math.random() < 0.15; // 15% chance of issue
      if (hasIssue) {
        const issueMessages = AI_ISSUE_MESSAGES[docId];
        const issueMessage = issueMessages
          ? issueMessages[Math.floor(Math.random() * issueMessages.length)]
          : 'Document appears to be expired or unclear. Please upload a clearer copy.';
        updateRequirementStatus(docId, 'issue', {
          fileName: realisticName,
          aiMessage: 'Issue detected',
          issueMessage,
        });
        toast.warning(`Issue with ${docTitle} — action needed`, {
          actionLabel: 'View',
          onAction: () => {
            document.getElementById(`doc-${docId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          },
        });
      } else {
        updateRequirementStatus(docId, 'verified', {
          fileName: realisticName,
          aiMessage: AI_VERIFIED_MESSAGES[docId] || 'Document verified successfully',
          extractedFields: DEMO_EXTRACTED_FIELDS[docId],
        });
        toast.success(`${docTitle} verified`);
      }
    }, 2500);
  }, [updateRequirementStatus, allFilteredDocs, toast]);

  // Handle bulk file upload with sorting animation
  const handleBulkUpload = useCallback((files: FileList) => {
    if (files.length === 0) return;

    // Get list of required documents that haven't been uploaded yet
    const availableDocs = allFilteredDocs.filter(doc => {
      const req = requirements.find(r => r.id === doc.id);
      return !req || req.status === 'required';
    });

    if (availableDocs.length === 0) return;

    // Create uploading file entries, assigning each to a document
    const newUploadingFiles: UploadingFile[] = Array.from(files).slice(0, availableDocs.length).map((file, index) => {
      const assignedDoc = availableDocs[index];
      const docNames = DOCUMENT_NAME_MAPPINGS[assignedDoc.id] || [file.name];
      const realisticName = docNames[Math.floor(Math.random() * docNames.length)];
      
      return {
        id: `upload-${Date.now()}-${index}`,
        originalName: file.name,
        assignedDocId: assignedDoc.id,
        assignedDocTitle: assignedDoc.title,
        progress: 0,
        phase: 'uploading' as const,
      };
    });

    setUploadingFiles(newUploadingFiles);
    setUploadPhase('uploading');

    // Phase 1: Uploading progress (0-100%)
    const uploadInterval = setInterval(() => {
      setUploadingFiles(prev => prev.map(f => ({
        ...f,
        progress: Math.min(100, f.progress + Math.random() * 30),
      })));
    }, 200);

    // Phase 2: Sorting (after 1.5s)
    setTimeout(() => {
      clearInterval(uploadInterval);
      setUploadPhase('sorting');
      setUploadingFiles(prev => prev.map(f => ({ ...f, phase: 'sorting' as const, progress: 100 })));
    }, 1500);

    // Phase 3: Scanning (after 2.5s)
    setTimeout(() => {
      setUploadPhase('scanning');
      setUploadingFiles(prev => prev.map(f => ({ ...f, phase: 'scanning' as const })));
      
      // Update requirement statuses to reviewing with specific AI extraction messages
      newUploadingFiles.forEach(f => {
        const docNames = DOCUMENT_NAME_MAPPINGS[f.assignedDocId] || [f.originalName];
        const realisticName = docNames[Math.floor(Math.random() * docNames.length)];
        updateRequirementStatus(f.assignedDocId, 'reviewing', {
          fileName: realisticName,
          aiMessage: AI_EXTRACTION_MESSAGES[f.assignedDocId] || 'Classifying document…',
        });
      });
    }, 2500);

    // Phase 4: Verification (staggered, starting at 3.5s)
    newUploadingFiles.forEach((f, index) => {
      setTimeout(() => {
        const hasIssue = Math.random() < 0.1; // 10% chance of issue
        const docNames = DOCUMENT_NAME_MAPPINGS[f.assignedDocId] || [f.originalName];
        const realisticName = docNames[Math.floor(Math.random() * docNames.length)];
        
        setUploadingFiles(prev => prev.map(uf => 
          uf.id === f.id 
            ? { ...uf, phase: hasIssue ? 'issue' as const : 'verified' as const }
            : uf
        ));

        if (hasIssue) {
          const issueMessages = AI_ISSUE_MESSAGES[f.assignedDocId];
          const issueMessage = issueMessages
            ? issueMessages[Math.floor(Math.random() * issueMessages.length)]
            : 'Document appears to be expired or unclear. Please upload a clearer copy.';
          updateRequirementStatus(f.assignedDocId, 'issue', {
            fileName: realisticName,
            aiMessage: 'Issue detected',
            issueMessage,
          });
          toast.warning(`Issue with ${f.assignedDocTitle} — action needed`, {
            actionLabel: 'View',
            onAction: () => {
              document.getElementById(`doc-${f.assignedDocId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },
          });
        } else {
          updateRequirementStatus(f.assignedDocId, 'verified', {
            fileName: realisticName,
            aiMessage: AI_VERIFIED_MESSAGES[f.assignedDocId] || 'Document verified successfully',
            extractedFields: DEMO_EXTRACTED_FIELDS[f.assignedDocId],
          });
          toast.success(`${f.assignedDocTitle} verified`);
        }
      }, 3500 + (index * 600)); // Stagger each verification
    });

    // Phase 5: Complete (clear overlay after all verifications)
    setTimeout(() => {
      setUploadPhase('complete');
      setTimeout(() => {
        setUploadPhase('idle');
        setUploadingFiles([]);
      }, 1500);
    }, 3500 + (newUploadingFiles.length * 600) + 500);

  }, [allFilteredDocs, requirements, updateRequirementStatus, toast]);

  return (
    <>
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-medium mb-2 text-xl sm:text-2xl" style={{ color: '#182026', letterSpacing: '-0.01em' }}>
          Upload your documents
        </h2>
        <p className="text-sm sm:text-base" style={{ fontWeight: '500', color: '#182026', lineHeight: '1.5em' }}>
          Upload the documents lenders will need to review your application. LendWell will check each one for you.
        </p>
      </div>

      {/* Instructional banner — dismissible, first visit only */}
      {!bannerDismissed && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ backgroundColor: '#EDECFD', border: '1px solid rgba(49,38,227,0.10)' }}
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#3126E3' }} />
          <p className="text-sm font-medium flex-1" style={{ color: '#3126E3', lineHeight: '1.5' }}>
            <span className="font-semibold">Two ways to upload:</span> Drop all your documents at once and LendWell will sort them automatically, or expand each item below to upload individually.
          </p>
          <button
            type="button"
            onClick={dismissBanner}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3126E3', padding: 0, flexShrink: 0 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overall progress summary */}
      {requiredDocs.length > 0 && (
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: allComplete ? '#F0FBDF' : '#ffffff',
            border: `1px solid ${allComplete ? '#BEF264' : '#E5E7EB'}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: allComplete ? '#3C6006' : '#182026' }}>
              {allComplete
                ? 'All required documents verified — your application is ready to progress'
                : `${completedDocs.length} of ${requiredDocs.length} required documents verified`}
            </p>
            {allComplete && <CheckCircle2 className="w-4 h-4" style={{ color: '#3C6006' }} />}
          </div>

          {/* Progress bar */}
          {!allComplete && (
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: '#E5E7EB' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: '#3126E3' }}
              />
            </div>
          )}

          {issueDocs.length > 0 && (
            <p className="text-xs font-semibold" style={{ color: '#E07900' }}>
              {issueDocs.length} document{issueDocs.length > 1 ? 's' : ''} need{issueDocs.length === 1 ? 's' : ''} attention
            </p>
          )}
        </div>
      )}

      {/* Drag-and-drop zone containing all document upload cards */}
      <BulkDropZone 
        onUpload={handleUpload}
        uploadPhase={uploadPhase}
        uploadingFiles={uploadingFiles}
        onBulkUpload={handleBulkUpload}
      >
        {filteredCategories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            documents={category.documents}
            requirements={requirements}
            onUpload={handleUpload}
          />
        ))}
      </BulkDropZone>

      {/* Bottom padding so fixed bar does not overlap content */}
      <div className="h-20" aria-hidden="true" />
    </div>

    {/* Fixed bottom bar */}
    <BottomBar onBrowseFiles={handleBulkUpload} />
    </>
  );
}
