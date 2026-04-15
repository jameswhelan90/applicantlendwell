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
  'req-redemption-statement': 'Reading redemption figure and validity date',
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
  'req-redemption-statement': 'Redemption figure recorded',
  'req-rental-projection':  'Rental projection accepted — income figures recorded',
};

// Per-document specific issue messages (2 per type — one is picked at random)
export const AI_ISSUE_MESSAGES: Record<string, string[]> = {
  'req-passport': [
    'The document appears to be expired — your passport must be valid.',
    'We couldn\'t read the photo page clearly. Please re-scan in better lighting.',
  ],
  'req-proof-of-address': [
    'This document is dated more than 3 months ago. Please upload a more recent one.',
    'The address on this document doesn\'t match what you entered in your application.',
  ],
  'req-payslips': [
    'This payslip appears to be more than 3 months old. Lenders require your 3 most recent payslips.',
    'We couldn\'t verify the employer name on this payslip. Please ensure it\'s your most recent one.',
  ],
  'req-p60': [
    'This P60 doesn\'t appear to be from the most recent tax year.',
    'We couldn\'t read the income figures clearly. Please upload a higher quality scan.',
  ],
  'req-bank-statements': [
    'This statement doesn\'t cover a full calendar month. Lenders need 3 complete months.',
    'The account holder name doesn\'t match your application. Please check you\'ve uploaded the correct statement.',
  ],
  'req-sa302': [
    'This SA302 appears to be from more than 3 years ago. Lenders need the last 2–3 years.',
    'We couldn\'t verify this as an official HMRC document. Please download directly from HMRC online.',
  ],
  'req-deposit-proof': [
    'The account balance shown is lower than the deposit amount in your application.',
    'This statement is more than 3 months old. Lenders need a current statement.',
  ],
  'req-gift-letter': [
    'The gift letter must be signed by the donor. Please ask them to sign and re-upload.',
    'The gift letter doesn\'t state that the funds are non-repayable. This is a lender requirement.',
  ],
  'req-employer-reference': [
    'We couldn\'t verify the company letterhead on this document. Please ensure it\'s on official headed paper.',
    'The reference is undated. Please ask your employer to include the date.',
  ],
  'req-employment-contract': [
    'The contract appears to be unsigned. Please ensure both parties have signed.',
    'We couldn\'t read the salary figure clearly. Please upload a clearer copy.',
  ],
  'req-business-accounts': [
    'These accounts appear to be more than 2 years old. Lenders need the most recent 2 years.',
    'We couldn\'t verify the accountant\'s signature on these accounts.',
  ],
  'req-accountant-reference': [
    'The reference doesn\'t appear to be on official letterhead. Please ask your accountant to reissue it.',
    'We couldn\'t read the income figures clearly. Please upload a higher quality scan.',
  ],
  'req-contract': [
    'The contract end date is within 3 months — lenders may require further evidence of renewal.',
    'We couldn\'t read the day rate or salary clearly. Please upload a clearer copy.',
  ],
  'req-aip': [
    'This Agreement in Principle appears to have expired. Please obtain a fresh one from your lender.',
    'We couldn\'t read the lender reference number. Please upload a clearer copy.',
  ],
  'req-joint-passport': [
    'The second applicant\'s document appears to be expired — it must be valid.',
    'We couldn\'t read the photo page clearly. Please re-scan in better lighting.',
  ],
  'req-joint-payslips': [
    'This payslip appears to be more than 3 months old. Please upload the most recent payslips.',
    'We couldn\'t verify the employer name on this payslip.',
  ],
  'req-joint-bank-statements': [
    'This statement doesn\'t cover a full calendar month. Please upload 3 complete months.',
    'The account holder name doesn\'t match the second applicant\'s details.',
  ],
  'req-mortgage-statement': [
    'This statement appears to be more than 12 months old. Please upload your most recent annual statement.',
    'We couldn\'t read the outstanding balance clearly. Please upload a clearer copy.',
  ],
  'req-redemption-statement': [
    'This redemption statement has expired — they are typically valid for 30 days.',
    'We couldn\'t read the redemption figure clearly. Please request a new statement from your lender.',
  ],
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
  'req-joint-passport': {
    full_name:       'David Murphy',
    date_of_birth:   '22 Jun 1987',
    passport_number: 'P7654321',
    expiry:          '20 May 2030',
    nationality:     'Irish',
  },
  'req-payslips': {
    employer:        'TechCorp Ireland Ltd',
    gross_salary:    '€72,000 / year',
    net_monthly:     '€4,287',
    pay_period:      'March 2026',
    pps_number:      'QQ 12 34 56 C',
  },
  'req-joint-payslips': {
    employer:        'Dublin City Council',
    gross_salary:    '€54,000 / year',
    net_monthly:     '€3,310',
    pay_period:      'March 2026',
  },
  'req-p60': {
    total_pay:       '€72,000',
    tax_paid:        '€16,480',
    tax_year:        '2025',
    employer_ref:    'TCI/2025/0012',
  },
  'req-bank-statements': {
    account_holder:  'Sarah Murphy',
    bank:            'Bank of Ireland',
    iban:            'IE12 BOFI 9000 0112 3456 78',
    period_covered:  'Jan – Mar 2026',
    avg_balance:     '€8,420',
  },
  'req-joint-bank-statements': {
    account_holder:  'David Murphy',
    bank:            'AIB',
    period_covered:  'Jan – Mar 2026',
    avg_balance:     '€6,150',
  },
  'req-proof-of-address': {
    name:            'Sarah Murphy',
    address:         '14 Clontarf Road, Dublin 3',
    document_date:   '28 Feb 2026',
    issuer:          'Electric Ireland',
  },
  'req-deposit-proof': {
    account_holder:  'Sarah Murphy',
    balance:         '€48,500',
    statement_date:  '31 Mar 2026',
    bank:            'Bank of Ireland',
  },
  'req-sa302': {
    total_income:    '€89,400',
    tax_paid:        '€22,140',
    tax_year:        '2025',
    utr_number:      '1234 56789 0',
  },
  'req-mortgage-statement': {
    lender:          'AIB Mortgages',
    outstanding_balance: '€214,000',
    monthly_payment: '€1,180',
    statement_date:  'Jan 2026',
  },
  'req-gift-letter': {
    donor_name:      'Michael Murphy',
    gift_amount:     '€20,000',
    relationship:    'Father',
    non_repayable:   'Confirmed',
  },
  'req-employer-reference': {
    employer:        'TechCorp Ireland Ltd',
    employee:        'Sarah Murphy',
    employment_type: 'Permanent',
    start_date:      '14 Sep 2019',
  },
};
