'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FormFooterContextType {
  label: string;
  onContinue: (() => void) | null;
  setFooter: (label: string, action: () => void) => void;
}

const FormFooterContext = createContext<FormFooterContextType | undefined>(undefined);

export function FormFooterProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState('Continue');
  const [onContinue, setOnContinue] = useState<(() => void) | null>(null);

  const setFooter = useCallback((newLabel: string, action: () => void) => {
    setLabel(newLabel);
    // useState setter with a function arg calls it as an updater, so wrap in arrow
    setOnContinue(() => action);
  }, []);

  return (
    <FormFooterContext.Provider value={{ label, onContinue, setFooter }}>
      {children}
    </FormFooterContext.Provider>
  );
}

export function useFormFooter() {
  const ctx = useContext(FormFooterContext);
  if (!ctx) throw new Error('useFormFooter must be used inside FormFooterProvider');
  return ctx;
}
