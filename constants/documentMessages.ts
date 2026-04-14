// Shared AI extraction + verification message maps used by all upload components

export const AI_EXTRACTION_MESSAGES: Record<string, string> = {
  'req-passport':           'Detecting document type… reading identity fields',
  'req-proof-of-address':   'Verifying address details and issue date',
  'req-payslips':           'Extracting salary, employer, and pay period',
  'req-p60':                'Reading annual income and PAYE reference',
  'req-bank-statements':    'Scanning transactions and verifying account holder',
  'req-employer-reference': 'Confirming employment terms and start date',
  'req-sa302':              'Extracting self-assessment income figures',
  'req-business-accounts':  'Analysing company profit and director drawings',
  'req-contract':           'Reading contract type, salary, and start date',
  'req-deposit-proof':      'Verifying balance, account holder, and date range',
  'req-gift-letter':        'Confirming donor details and gift amount',
  'req-aip':                'Reading lender, reference number, and expiry',
  'req-employment-contract':'Reading contract type and employment conditions',
  'req-accountant-reference': 'Reading accountant details and income confirmation',
  'req-joint-payslips':     'Extracting second applicant salary and employer',
  'req-joint-bank-statements': 'Scanning second applicant transactions',
  'req-joint-passport':     'Reading second applicant identity fields',
  'req-mortgage-statement': 'Extracting outstanding balance and lender details',
  'req-rental-projection':  'Reading projected rental income and tenancy terms',
};

export const AI_VERIFIED_MESSAGES: Record<string, string> = {
  'req-passport':           'Identity confirmed — name and date of birth extracted',
  'req-proof-of-address':   'Address verified — dated within 3 months',
  'req-payslips':           'Salary confirmed — income figures sent to your application',
  'req-p60':                'Annual income verified and cross-referenced',
  'req-bank-statements':    'Statements accepted — 3 months of transactions reviewed',
  'req-employer-reference': 'Employment confirmed — start date and role extracted',
  'req-sa302':              'Self-assessment income verified',
  'req-business-accounts':  'Accounts verified — net profit figures extracted',
  'req-contract':           'Contract confirmed — terms and salary extracted',
  'req-deposit-proof':      'Deposit funds verified — balance and date confirmed',
  'req-gift-letter':        'Gift letter accepted — donor confirmed as non-repayable',
  'req-aip':                'AIP confirmed — lender reference recorded',
  'req-employment-contract':'Employment contract verified — terms confirmed',
  'req-accountant-reference': 'Accountant reference accepted',
  'req-joint-payslips':     'Second applicant income confirmed',
  'req-joint-bank-statements': 'Second applicant statements verified',
  'req-joint-passport':     'Second applicant identity confirmed',
  'req-mortgage-statement': 'Mortgage statement verified — balance extracted',
  'req-rental-projection':  'Rental projection accepted — income figures recorded',
};

// Demo extracted fields shown after verification
export const DEMO_EXTRACTED_FIELDS: Record<string, Record<string, string>> = {
  'req-passport': {
    full_name:       'Sarah Murphy',
    date_of_birth:   '15 Mar 1989',
    passport_number: 'P1234567',
    expiry:          '14 Oct 2031',
    nationality:     'Irish',
  },
  'req-payslips': {
    employer:        'TechCorp Ireland Ltd',
    gross_salary:    '€72,000 / year',
    net_monthly:     '€4,287',
    pay_period:      'March 2026',
    pps_number:      'QQ 12 34 56 C',
  },
  'req-bank-statements': {
    account_holder:  'Sarah Murphy',
    bank:            'Bank of Ireland',
    iban:            'IE12 BOFI 9000 0112 3456 78',
    period_covered:  'Jan – Mar 2026',
    avg_balance:     '€8,420',
  },
  'req-p60': {
    total_pay:       '€72,000',
    tax_paid:        '€16,480',
    tax_year:        '2025',
    employer_ref:    'TCI/2025/0012',
  },
};
