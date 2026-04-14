'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  ApplicationState,
  ApplicationData,
  SectionId,
  SectionStatus,
  MortgageDocument,
  DocumentStatus,
  DocumentRequirement,
  RequirementStatus,
  Agreement,
  AgreementStatus,
  BlockingIssue,
} from '@/types/tasks';
import { mockApplicationState } from '@/constants/mockData';

// ─── Step IDs — every distinct screen in the form flow ────────────────────

export type StepId =
  // Welcome & Orientation
  | 'welcome'
  | 'orientation'
  // Section Intro Steps
  | 'intro_about_you'
  | 'intro_property_mortgage'
  | 'intro_employment_income'
  | 'intro_documents'
  | 'intro_agreements'
  // Identity Section
  | 'id_name'
  | 'id_dob'
  | 'id_contact'
  | 'id_nationality'
  | 'id_ni_pps'
  | 'id_address'
  | 'id_address_history'
  | 'id_upload_photo'
  // Household Section
  | 'hh_circumstances'
  | 'hh_application_mode'
  | 'hh_second_applicant'
  | 'hh_second_applicant_contact'
  | 'hh_upload_joint_id'
  | 'hh_dependants'
  // Intent Section
  | 'intent_type'
  | 'intent_remortgage'
  | 'intent_upload_mortgage'
  | 'intent_btl'
  | 'intent_upload_rental'
  | 'intent_timeline'
  // Property Section
  | 'prop_stage'
  | 'prop_details'
  | 'prop_value'
  // Employment Section
  | 'emp_status'
  | 'emp_details'
  | 'emp_self_employed'
  | 'emp_upload_payslips'
  | 'emp_upload_tax'
  | 'emp_second_applicant'
  | 'emp_upload_joint'
  // Income Section
  | 'inc_salary'
  | 'inc_additional'
  | 'inc_second_applicant'
  | 'inc_upload_bank'
  | 'inc_upload_joint_bank'
  // Commitments Section
  | 'commit_outgoings'
  | 'commit_childcare'
  // Deposit Section
  | 'dep_amount'
  | 'dep_source'
  | 'dep_gift_details'
  | 'dep_upload_gift'
  | 'dep_upload_giftor'
  // Affordability
  | 'pm_affordability'
  // Documents (main upload area)
  | 'docs_overview'
  // Agreements
  | 'ag_declarations'
  | 'ag_signature'
  // Completion
  | 'completion'
  // LEGACY: Financial Profile steps (backwards compatibility)
  | 'fp_name'
  | 'fp_dob'
  | 'fp_contact'
  | 'fp_circumstances'
  | 'fp_address'
  | 'fp_address_history'
  | 'fp_employment_status'
  | 'fp_employment_details'
  | 'fp_income'
  | 'fp_outgoings'
  | 'fp_deposit'
  | 'fp_goals'
  | 'hh_stage'
  | 'hh_property';

// Ordered list of all steps (grouped by 6 high-level sections)
export const ALL_STEPS: StepId[] = [
  // 1. Welcome
  'welcome',
  'orientation',
  // 2. About You (Identity + Household questions)
  'intro_about_you',
  'id_name',
  'id_dob',
  'id_contact',
  'id_nationality',
  'id_ni_pps',
  'id_address',
  'id_address_history',
  'hh_circumstances',
  'hh_application_mode',
  'hh_second_applicant',
  'hh_second_applicant_contact',
  'hh_dependants',
  // 3. Property & Mortgage (Intent + Property + Deposit questions)
  'intro_property_mortgage',
  'intent_type',
  'intent_remortgage',
  'intent_btl',
  'intent_timeline',
  'prop_stage',
  'prop_details',
  'prop_value',
  'dep_amount',
  'dep_source',
  'dep_gift_details',
  'pm_affordability',
  // 4. Employment & Income (Employment + Income + Commitments questions)
  'intro_employment_income',
  'emp_status',
  'emp_details',
  'emp_self_employed',
  'emp_second_applicant',
  'inc_salary',
  'inc_additional',
  'inc_second_applicant',
  'commit_outgoings',
  'commit_childcare',
  // 5. Documents (all document upload steps)
  'intro_documents',
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
  'docs_overview',
  // 6. Agreements
  'intro_agreements',
  'ag_declarations',
  'ag_signature',
  // 7. Collect Your Keys
  'completion',
];

// Which section each step belongs to (6 high-level navigation sections)
export const STEP_SECTION: Record<StepId, SectionId> = {
  // Welcome
  welcome: 'welcome',
  orientation: 'welcome',
  // Section Intro Steps
  intro_about_you: 'about_you',
  intro_property_mortgage: 'property_mortgage',
  intro_employment_income: 'employment_income',
  intro_documents: 'documents',
  intro_agreements: 'agreements',
  // About You (Identity + Household)
  id_name: 'about_you',
  id_dob: 'about_you',
  id_contact: 'about_you',
  id_nationality: 'about_you',
  id_ni_pps: 'about_you',
  id_address: 'about_you',
  id_address_history: 'about_you',
  hh_circumstances: 'about_you',
  hh_application_mode: 'about_you',
  hh_second_applicant: 'about_you',
  hh_second_applicant_contact: 'about_you',
  hh_dependants: 'about_you',
  // Property & Mortgage (Intent + Property + Deposit questions)
  intent_type: 'property_mortgage',
  intent_remortgage: 'property_mortgage',
  intent_btl: 'property_mortgage',
  intent_timeline: 'property_mortgage',
  prop_stage: 'property_mortgage',
  prop_details: 'property_mortgage',
  prop_value: 'property_mortgage',
  dep_amount: 'property_mortgage',
  dep_source: 'property_mortgage',
  dep_gift_details: 'property_mortgage',
  pm_affordability: 'property_mortgage',
  // Employment & Income (Employment + Income + Commitments questions)
  emp_status: 'employment_income',
  emp_details: 'employment_income',
  emp_self_employed: 'employment_income',
  emp_second_applicant: 'employment_income',
  inc_salary: 'employment_income',
  inc_additional: 'employment_income',
  inc_second_applicant: 'employment_income',
  commit_outgoings: 'employment_income',
  commit_childcare: 'employment_income',
  // Documents (all document upload steps)
  id_upload_photo: 'documents',
  hh_upload_joint_id: 'documents',
  intent_upload_mortgage: 'documents',
  intent_upload_rental: 'documents',
  emp_upload_payslips: 'documents',
  emp_upload_tax: 'documents',
  emp_upload_joint: 'documents',
  inc_upload_bank: 'documents',
  inc_upload_joint_bank: 'documents',
  dep_upload_gift: 'documents',
  dep_upload_giftor: 'documents',
  docs_overview: 'documents',
  // Agreements
  ag_declarations: 'agreements',
  ag_signature: 'agreements',
  // Collect Your Keys
  completion: 'collect_keys',
  // LEGACY mappings (backwards compatibility)
  fp_name: 'about_you',
  fp_dob: 'about_you',
  fp_contact: 'about_you',
  fp_circumstances: 'about_you',
  fp_address: 'about_you',
  fp_address_history: 'about_you',
  fp_employment_status: 'employment_income',
  fp_employment_details: 'employment_income',
  fp_income: 'employment_income',
  fp_outgoings: 'employment_income',
  fp_deposit: 'property_mortgage',
  fp_goals: 'property_mortgage',
  hh_stage: 'property_mortgage',
  hh_property: 'property_mortgage',
};

// First step of each section (7 high-level sections)
export const SECTION_FIRST_STEP: Record<SectionId, StepId> = {
  welcome: 'welcome',
  about_you: 'intro_about_you',
  property_mortgage: 'intro_property_mortgage',
  employment_income: 'intro_employment_income',
  documents: 'intro_documents',
  agreements: 'intro_agreements',
  collect_keys: 'completion',
};

// Human-readable section labels (7 simplified sections)
export const SECTION_LABELS: Record<SectionId, string> = {
  welcome: 'Welcome',
  about_you: 'About You',
  property_mortgage: 'Property & Mortgage',
  employment_income: 'Employment & Income',
  documents: 'Documents',
  agreements: 'Agreements',
  collect_keys: 'Collect Your Keys',
};

// Step labels shown in the modal header — must match step content exactly
export const STEP_LABELS: Record<StepId, string> = {
  // Welcome & Orientation
  welcome: 'Welcome',
  // Section Intro Steps
  intro_about_you: 'About You',
  intro_property_mortgage: 'Property & Mortgage',
  intro_employment_income: 'Employment & Income',
  intro_documents: 'Documents',
  intro_agreements: 'Finishing Up',
  orientation: 'Get Started',
  // Identity
  id_name: 'What\'s your name?',
  id_dob: 'What\'s your date of birth?',
  id_contact: 'How can we reach you?',
  id_nationality: 'Nationality and residency status',
  id_ni_pps: 'NI / PPS number',
  id_address: 'Where do you live now?',
  id_address_history: 'Previous address',
  id_upload_photo: 'Upload photo ID',
  // Household
  hh_circumstances: 'Relationship status',
  hh_application_mode: 'Solo or joint application?',
  hh_second_applicant: 'Co-applicant details',
  hh_second_applicant_contact: 'Co-applicant contact',
  hh_upload_joint_id: 'Co-applicant photo ID',
  hh_dependants: 'Dependants',
  // Intent
  intent_type: 'What type of mortgage?',
  intent_remortgage: 'Your current mortgage',
  intent_upload_mortgage: 'Mortgage statement',
  intent_btl: 'Buy-to-let details',
  intent_upload_rental: 'Rental evidence',
  intent_timeline: 'Timeline',
  // Property
  prop_stage: 'Property search',
  prop_details: 'Property details',
  prop_value: 'Property value',
  // Employment
  emp_status: 'Your employment status',
  emp_details: 'Your employer',
  emp_self_employed: 'Your business',
  emp_upload_payslips: 'Upload payslips',
  emp_upload_tax: 'Upload tax returns',
  emp_second_applicant: 'Co-applicant employment',
  emp_upload_joint: 'Co-applicant income documents',
  // Income
  inc_salary: 'Your annual income',
  inc_additional: 'Additional income',
  inc_second_applicant: 'Co-applicant income',
  inc_upload_bank: 'Upload bank statements',
  inc_upload_joint_bank: 'Co-applicant bank statements',
  // Commitments
  commit_outgoings: 'Monthly outgoings',
  commit_childcare: 'Childcare costs',
  // Deposit
  dep_amount: 'Your deposit',
  dep_source: 'Source of deposit',
  dep_gift_details: 'Gift details',
  pm_affordability: 'Your affordability estimate',
  dep_upload_gift: 'Gift letter',
  dep_upload_giftor: 'Giftor bank statements',
  // Documents
  docs_overview: 'Your documents',
  // Agreements
  ag_declarations: 'Declarations and consent',
  ag_signature: 'Your signature',
  // Completion
  completion: 'Ready to submit?',
  // LEGACY labels (backwards compatibility)
  fp_name: 'What\'s your name?',
  fp_dob: 'What\'s your date of birth?',
  fp_contact: 'How can we reach you?',
  fp_circumstances: 'Relationship status',
  fp_address: 'Where do you live?',
  fp_address_history: 'Address history',
  fp_employment_status: 'Your employment status',
  fp_employment_details: 'Your current role',
  fp_income: 'Your annual income',
  fp_outgoings: 'Monthly outgoings',
  fp_deposit: 'Your deposit and savings',
  fp_goals: 'Your mortgage goals',
  hh_stage: 'Property search',
  hh_property: 'Property details',
};

// ─── Context interface ─────────────────────────────────────────────────────

interface ApplicationContextType {
  state: ApplicationState;

  // Navigation
  currentStep: StepId;
  isModalOpen: boolean;
  navDirection: 'forward' | 'backward' | 'initial';
  selectedJourneyStep: SectionId; // Selected section in sidebar (controls main content panel)
  openModal: (step?: StepId) => void;
  closeModal: () => void;
  goToStep: (step: StepId) => void;
  goToSection: (sectionId: SectionId) => void;
  selectJourneyStep: (sectionId: SectionId) => void; // Select step without opening form
  goToNextStep: () => void;
  goToPrevStep: () => void;

  // Data
  setField: (field: string, value: any) => void;
  completeStep: (stepId: StepId) => void;

  // Documents
  updateDocumentStatus: (docId: string, status: DocumentStatus, fileName?: string) => void;
  updateRequirementStatus: (reqId: string, status: RequirementStatus, opts?: { fileName?: string; aiMessage?: string; issueMessage?: string; extractedFields?: Record<string, string> }) => void;

  // Agreements
  signAgreement: (agreementId: string) => void;

  // Derived
  currentSectionId: SectionId;
  isSectionComplete: (sectionId: SectionId) => boolean;
  readinessScore: number;
  canSubmit: boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ApplicationState>(mockApplicationState);
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navDirection, setNavDirection] = useState<'forward' | 'backward' | 'initial'>('initial');
  const [selectedJourneyStep, setSelectedJourneyStep] = useState<SectionId>('welcome');

  const currentSectionId = STEP_SECTION[currentStep];

  // ── Derived readiness ──────────────────────────────────────────────────

  const isSectionComplete = useCallback((sectionId: SectionId): boolean => {
    const section = state.sections.find((s) => s.id === sectionId);
    return section?.status === 'complete';
  }, [state.sections]);

  const readinessScore = (() => {
    const completedSections = state.sections.filter((s) => s.status === 'complete').length;
    const totalSections = state.sections.length;
    return Math.round((completedSections / totalSections) * 100);
  })();

  const canSubmit = (() => {
    const required: SectionId[] = ['welcome', 'about_you', 'property_mortgage', 'employment_income', 'documents', 'agreements'];
    return required.every((sid) => isSectionComplete(sid));
  })();

  // ── Navigation ─────────────────────────────────────────────────────────

  const openModal = useCallback((step?: StepId) => {
    if (step) {
      setNavDirection((prev) => {
        const targetIdx = ALL_STEPS.indexOf(step);
        const currentIdx = ALL_STEPS.indexOf(currentStep);
        return targetIdx >= currentIdx ? 'forward' : 'backward';
      });
      setCurrentStep(step);
    } else {
      setNavDirection('initial');
    }
    setIsModalOpen(true);
  }, [currentStep]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const goToStep = useCallback((step: StepId) => {
    setNavDirection((prev) => {
      const targetIdx = ALL_STEPS.indexOf(step);
      const currentIdx = ALL_STEPS.indexOf(currentStep);
      return targetIdx >= currentIdx ? 'forward' : 'backward';
    });
    setCurrentStep(step);
  }, [currentStep]);

  const goToSection = useCallback((sectionId: SectionId) => {
    setNavDirection('forward');
    const firstStep = SECTION_FIRST_STEP[sectionId];
    setCurrentStep(firstStep);
    setIsModalOpen(true);
  }, []);

  const selectJourneyStep = useCallback((sectionId: SectionId) => {
    setSelectedJourneyStep(sectionId);
  }, []);

  // ── Conditional step logic ────────────────────────────────────────────────
  // Returns true if the step should be shown given the current form data.
  const shouldShowStep = useCallback((stepId: StepId, data: ApplicationData): boolean => {
    const isJoint = data.applicationMode === 'joint';
    const isRemortgage = data.buyerType === 'remortgage';
    const isBtl = data.buyerType === 'buy_to_let';
    const isSelfEmployed = data.employmentStatus === 'self_employed' || data.employmentStatus === 'limited_company';
    const isGiftedDeposit = data.depositSource === 'gift';

    const conditionalMap: Partial<Record<StepId, boolean>> = {
      // Remortgage-only steps
      intent_remortgage:    isRemortgage,
      intent_upload_mortgage: isRemortgage,
      // Buy-to-let-only steps
      intent_btl:           isBtl,
      intent_upload_rental: isBtl,
      // Self-employed steps
      emp_self_employed:    isSelfEmployed,
      emp_upload_tax:       isSelfEmployed,
      emp_upload_payslips:  !isSelfEmployed,
      // Joint application steps
      hh_second_applicant:         isJoint,
      hh_second_applicant_contact: isJoint,
      hh_upload_joint_id:          isJoint,
      emp_second_applicant:        isJoint,
      emp_upload_joint:            isJoint,
      inc_second_applicant:        isJoint,
      inc_upload_joint_bank:       isJoint,
      // Gifted deposit steps
      dep_gift_details:   isGiftedDeposit,
      dep_upload_gift:    isGiftedDeposit,
      dep_upload_giftor:  isGiftedDeposit,
    };

    // If not in the map, always show
    if (!(stepId in conditionalMap)) return true;
    return conditionalMap[stepId] ?? true;
  }, []);

  const goToNextStep = useCallback(() => {
    const data = state.data;
    let idx = ALL_STEPS.indexOf(currentStep);
    while (idx < ALL_STEPS.length - 1) {
      idx += 1;
      const nextStep = ALL_STEPS[idx];
      if (shouldShowStep(nextStep, data)) {
        setNavDirection('forward');
        setCurrentStep(nextStep);
        return;
      }
    }
    setIsModalOpen(false);
  }, [currentStep, state.data, shouldShowStep]);

  const goToPrevStep = useCallback(() => {
    const data = state.data;
    let idx = ALL_STEPS.indexOf(currentStep);
    while (idx > 0) {
      idx -= 1;
      const prevStep = ALL_STEPS[idx];
      if (shouldShowStep(prevStep, data)) {
        setNavDirection('backward');
        setCurrentStep(prevStep);
        return;
      }
    }
    setIsModalOpen(false);
  }, [currentStep, state.data, shouldShowStep]);

  // ── Data updates ───────────────────────────────────────────────────────

  const setField = useCallback((field: string, value: any) => {
    setState((prev) => {
      // Clear autofill source when user edits the field — trust user input
      const newAutofillSources = { ...prev.autofillSources };
      delete newAutofillSources[field];
      return {
        ...prev,
        data: { ...prev.data, [field]: value },
        autofillSources: newAutofillSources,
      };
    });
  }, []);

  // Mark a step's section as in_progress or complete, and update currentSection
  const completeStep = useCallback((stepId: StepId) => {
    const sectionId = STEP_SECTION[stepId];
    const sectionSteps = ALL_STEPS.filter((s) => STEP_SECTION[s] === sectionId);
    const stepIdx = ALL_STEPS.indexOf(stepId);
    const nextStepIdx = stepIdx + 1;
    const nextStep = nextStepIdx < ALL_STEPS.length ? ALL_STEPS[nextStepIdx] : null;
    const isLastInSection = !nextStep || STEP_SECTION[nextStep] !== sectionId;

    setState((prev) => {
      const updatedSections = prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const newStatus: SectionStatus = isLastInSection ? 'complete' : 'in_progress';
        return { ...section, status: newStatus };
      });

      // Determine new currentSection
      const newCurrentSection = isLastInSection && nextStep
        ? STEP_SECTION[nextStep]
        : sectionId;

      // Recompute blocking issues based on verified requirements
      const allRequiredVerified = (prev.requirements || [])
        .filter((r) => r.required)
        .every((r) => r.status === 'verified');

      return {
        ...prev,
        sections: updatedSections,
        currentSection: newCurrentSection,
        blockingIssues: allRequiredVerified ? [] : prev.blockingIssues,
      };
    });

    // Move to next step
    if (nextStep) {
      setNavDirection('forward');
      setCurrentStep(nextStep);
    } else {
      setIsModalOpen(false);
    }
  }, []);

  // ── Documents ──────────────────────────────────────────────────────────

  const updateDocumentStatus = useCallback((docId: string, status: DocumentStatus, fileName?: string) => {
    setState((prev) => {
      const updatedDocs = prev.documents.map((d) => {
        if (d.id !== docId) return d;
        return {
          ...d,
          status,
          fileName: fileName ?? d.fileName,
          uploadedAt: (status === 'uploaded' || status === 'processing') ? new Date().toISOString() : d.uploadedAt,
        };
      });

      // Check if all required docs are at least uploaded → remove blocking issues
      const allRequired = updatedDocs.filter((d) => d.required);
      const allUploaded = allRequired.every(
        (d) => d.status === 'uploaded' || d.status === 'processing' || d.status === 'verified'
      );
      const blockingIssues = allUploaded ? [] : prev.blockingIssues;

      return { ...prev, documents: updatedDocs, blockingIssues };
    });
  }, []);

  // ── Requirements (new document workflow) ───────────────────────────────

  const updateRequirementStatus = useCallback((
    reqId: string,
    status: RequirementStatus,
    opts?: { fileName?: string; aiMessage?: string; issueMessage?: string; extractedFields?: Record<string, string> }
  ) => {
    setState((prev) => ({
      ...prev,
      requirements: prev.requirements.map((r) => {
        if (r.id !== reqId) return r;
        return {
          ...r,
          status,
          uploadedFileName: opts?.fileName ?? r.uploadedFileName,
          uploadedAt: (status === 'uploading' || status === 'reviewing') ? new Date().toISOString() : r.uploadedAt,
          aiMessage: opts?.aiMessage ?? r.aiMessage,
          issueMessage: opts?.issueMessage ?? r.issueMessage,
          extractedFields: opts?.extractedFields ?? r.extractedFields,
        };
      }),
    }));
  }, []);

  // ── Agreements ─────────────────────────────────────────────────────────

  const signAgreement = useCallback((agreementId: string) => {
    setState((prev) => ({
      ...prev,
      agreements: prev.agreements.map((ag) =>
        ag.id === agreementId ? { ...ag, status: 'signed' as AgreementStatus } : ag
      ),
    }));
  }, []);

  // ── Context value ──────────────────────────────────────────────────────

  const value: ApplicationContextType = {
    state,
    currentStep,
    isModalOpen,
    navDirection,
    selectedJourneyStep,
    openModal,
    closeModal,
    goToStep,
    goToSection,
    selectJourneyStep,
    goToNextStep,
    goToPrevStep,
    setField,
    completeStep,
    updateDocumentStatus,
    updateRequirementStatus,
    signAgreement,
    currentSectionId,
    isSectionComplete,
    readinessScore,
    canSubmit,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplication must be used within an ApplicationProvider');
  return ctx;
}
