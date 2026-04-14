'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { useChat } from '@/context/ChatContext';
import { DocumentRequirement, RequirementStatus } from '@/types/tasks';
import { AI_EXTRACTION_MESSAGES, AI_VERIFIED_MESSAGES } from '@/constants/documentMessages';

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
      },
      {
        id: 'req-proof-of-address',
        title: 'Proof of address',
        description: 'Utility bill or bank statement dated within 3 months',
        acceptableDocuments: ['Utility bill', 'Council tax bill', 'Bank statement'],
        required: true,
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
        conditions: [{ field: 'employmentStatus', values: ['employed', 'Employed', ''] }],
      },
      {
        id: 'req-p60',
        title: 'P60',
        description: 'Most recent tax year P60 from your employer',
        acceptableDocuments: ['P60 document'],
        required: true,
        conditions: [{ field: 'employmentStatus', values: ['employed', 'Employed', ''] }],
      },
      {
        id: 'req-employment-contract',
        title: 'Employment contract',
        description: 'Current contract showing salary and terms',
        acceptableDocuments: ['Employment contract', 'Offer letter'],
        required: false,
        conditions: [{ field: 'employmentStatus', values: ['employed', 'Employed'] }],
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
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'Self-employed', 'Self Employed'] }],
      },
      {
        id: 'req-tax-overview',
        title: 'Tax Year Overview',
        description: 'HMRC Tax Year Overview for last 2-3 years',
        acceptableDocuments: ['Tax year overview document'],
        required: true,
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'Self-employed', 'Self Employed'] }],
      },
      {
        id: 'req-company-accounts',
        title: 'Company accounts',
        description: 'Last 2-3 years of certified accounts (Ltd companies)',
        acceptableDocuments: ['Certified accounts', 'Accountant letter'],
        required: false,
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'Self-employed', 'Self Employed'] }],
      },
      {
        id: 'req-accountant-reference',
        title: 'Accountant reference',
        description: 'Letter from your accountant confirming income',
        acceptableDocuments: ['Accountant letter', 'Accountant certificate'],
        required: false,
        conditions: [{ field: 'employmentStatus', values: ['self-employed', 'Self-employed', 'Self Employed'] }],
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
    case 'needs_update':
      return <AlertCircle className="w-5 h-5" style={{ color: '#E07900' }} />;
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
      return 'Issues Found';
    case 'needs_update':
      return 'Update needed';
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
    case 'needs_update':
      return '#653701';     // Warning.Text-Soft
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
    case 'needs_update':
      return '#FFF6EA';     // Warning.Fill-Soft
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
        className="w-full flex items-center gap-4 px-6 py-4 text-left card-interactive group"
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
          <p className="text-xs text-gray-500 mt-0.5 transition-colors duration-120">
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
          {doc.required ? getStatusLabel(status) : 'Optional'}
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
            {/* Drop zone or file display */}
            {!hasFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-6 text-center dropzone-interactive ${isDragging ? 'dragging' : ''}`}
                style={{
                  borderRadius: '8px',
                }}
              >
                <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: '600' }}>
                  Drop file here or click to upload
                </p>
                <p className="text-gray-500 mt-1" style={{ fontSize: '12px', fontWeight: '600' }}>
                  PDF, JPG, or PNG
                </p>
              </button>
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

                {/* Issue message */}
                {status === 'issue' && requirement?.issueMessage && (
                  <div 
                    className="flex items-center gap-2 p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: '#FFFBEB',
                      borderColor: '#FCD34D',
                    }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#E07900' }} />
                    <p className="text-xs" style={{ color: '#E07900' }}>
                      {requirement.issueMessage}
                    </p>
                  </div>
                )}

                {/* Success message */}
                {isComplete && (
                  <div 
                    className="flex items-center gap-2 p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F0FBDF',
                      borderColor: '#BEF264',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
                    <p className="text-xs font-medium" style={{ color: '#3C6006' }}>
                      Document verified successfully
                    </p>
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

// ─── Document Card Component (keeping for reference) ─────────��────────────────

function DocumentCard({
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

  const status = requirement?.status || 'required';
  const isComplete = status === 'verified';
  const isProcessing = status === 'reviewing' || status === 'uploading';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(doc.id, e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(doc.id, e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div
      className="relative p-5 transition-all duration-200 h-full"
      style={{
        backgroundColor: isDragging ? 'rgba(71, 63, 230, 0.03)' : '#ffffff',
        borderRadius: '8px',
        border: 'none',
        boxShadow: isComplete ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
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

      {/* Content ��� full height flex column so badge anchors to bottom */}
      <div className="flex flex-col h-full">
        {/* Top content */}
        <div className="flex-1">
          {/* Title */}
          <h4
            className="text-sm font-semibold"
            style={{ color: '#182026', marginBottom: '4px' }}
          >
            {doc.title}
          </h4>
          <p
            className="text-xs line-clamp-2"
            style={{ color: '#182026', fontWeight: '500' }}
          >
            {doc.description}
          </p>

          {/* Uploaded file info */}
          {requirement?.uploadedFileName && (
            <div className="flex items-center gap-2 mt-3">
              <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isComplete ? '#3C6006' : '#473FE6' }} />
              <span className="text-xs truncate font-medium" style={{ color: isComplete ? '#3C6006' : '#473FE6' }}>
                {requirement.uploadedFileName}
              </span>
            </div>
          )}

          {/* Scanning & Verifying indicator */}
          {status === 'reviewing' && (
            <div 
              className="flex items-center gap-2 mt-3 p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(71, 63, 230, 0.05)' }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: '#473FE6' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: '#473FE6' }}>
                  Scanning & Verifying
                </p>
                <p className="text-xs text-muted-foreground">
                  LendWell is reviewing your document...
                </p>
              </div>
            </div>
          )}

          {/* Issue message */}
          {status === 'issue' && requirement?.issueMessage && (
            <div 
              className="flex items-center gap-2 mt-3 p-2 rounded-lg"
              style={{ backgroundColor: '#FFF6EA' }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E07900' }} />
              <p className="text-xs" style={{ color: '#E07900' }}>
                {requirement.issueMessage}
              </p>
            </div>
          )}

          {/* Success message */}
          {isComplete && (
            <div className="flex items-center gap-1.5 mt-3">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3C6006' }} />
              <p className="text-xs font-medium" style={{ color: '#3C6006' }}>
                Document verified successfully
              </p>
            </div>
          )}
        </div>

        {/* Status badge anchored to bottom */}
        <div className="mt-4">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: getStatusBgColor(status),
              color: getStatusColor(status),
              display: 'inline-block',
            }}
          >
            {doc.required ? getStatusLabel(status) : 'Optional'}
          </span>
        </div>
      </div>
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
          className="w-9 h-9 flex items-center justify-center hidden"
          style={{
            backgroundColor: '#EEF0FD',
            borderRadius: '999px',
          }}
        >
          <Icon className="w-3 h-3" style={{ color: '#473FE6', fontSize: '12px' }} />
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
              fontWeight: '700',
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

      {/* Document category cards — hidden during upload, restored after */}
      <div 
        className="pointer-events-auto transition-opacity duration-300"
        style={{ opacity: isUploading ? 0.3 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────��────���───���─────

export function DocumentsUploadSection() {
  const { state, updateRequirementStatus } = useApplication();
  const appData = state.data;
  const requirements = state.requirements || [];

  // Upload flow state
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Filter documents based on user's application data
  const filteredCategories = useMemo(() => {
    return documentCategories
      .map((category) => {
        const filteredDocs = category.documents.filter((doc) => {
          // If no conditions, always show the document
          if (!doc.conditions || doc.conditions.length === 0) {
            return true;
          }

          // Check all conditions
          return doc.conditions.every((condition) => {
            const fieldValue = appData[condition.field as keyof typeof appData];
            
            if (condition.notEmpty) {
              return fieldValue && String(fieldValue).trim() !== '' && String(fieldValue) !== '0';
            }
            
            if (condition.values) {
              // If field is empty and we're checking for specific values, 
              // show if empty string is in the allowed values (for default/universal docs)
              if (!fieldValue || String(fieldValue).trim() === '') {
                return condition.values.includes('');
              }
              return condition.values.some(v => 
                String(fieldValue).toLowerCase().includes(v.toLowerCase())
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

  // Handle single file upload with AI simulation
  const handleUpload = useCallback((docId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Get realistic document name
    const docNames = DOCUMENT_NAME_MAPPINGS[docId] || [file.name];
    const realisticName = docNames[Math.floor(Math.random() * docNames.length)];

    // Start uploading
    updateRequirementStatus(docId, 'uploading', {
      fileName: realisticName,
      aiMessage: 'Uploading document...',
    });

    // Simulate AI processing
    setTimeout(() => {
      updateRequirementStatus(docId, 'reviewing', {
        fileName: realisticName,
        aiMessage: 'LendWell is reviewing your document...',
      });
    }, 500);

    // Simulate verification (with occasional issues for realism)
    setTimeout(() => {
      const hasIssue = Math.random() < 0.15; // 15% chance of issue
      if (hasIssue) {
        updateRequirementStatus(docId, 'issue', {
          fileName: realisticName,
          aiMessage: 'Issue detected',
          issueMessage: 'Document appears to be expired or unclear. Please upload a clearer copy.',
        });
      } else {
        updateRequirementStatus(docId, 'verified', {
          fileName: realisticName,
          aiMessage: 'Document verified successfully',
        });
      }
    }, 2500);
  }, [updateRequirementStatus]);

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
          updateRequirementStatus(f.assignedDocId, 'issue', {
            fileName: realisticName,
            aiMessage: 'Issue detected',
            issueMessage: 'Document appears to be expired or unclear. Please upload a clearer copy.',
          });
        } else {
          updateRequirementStatus(f.assignedDocId, 'verified', {
            fileName: realisticName,
            aiMessage: AI_VERIFIED_MESSAGES[f.assignedDocId] || 'Document verified successfully',
          });
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

  }, [allFilteredDocs, requirements, updateRequirementStatus]);

  return (
    <>
    <div className="w-full">
      {/* Header with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-medium mb-2" style={{ fontSize: '28px', color: '#182026', letterSpacing: '-0.01em' }}>
              Upload your documents
            </h2>
            <p 
              className="text-base"
              style={{ 
                fontSize: '20px',
                fontWeight: '500',
                color: '#182026',
                lineHeight: '1.5em'
              }}
            >
              Upload the documents lenders will need to review your application. LendWell will check each one for you.
            </p>
          </div>
        </div>

      </div>

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
