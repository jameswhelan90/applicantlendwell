'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Plus, Minus } from 'lucide-react';

// ─── Currency Input ─────────────────────────────────────────────────────────
// Formatted currency input with automatic comma formatting and prefix

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  label?: string;
  hint?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  prefix = '£',
  label,
  hint,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format number with commas
  const formatValue = (val: string): string => {
    // Remove all non-numeric characters except decimal
    const numericValue = val.replace(/[^0-9.]/g, '');
    
    // Handle decimal places
    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Recombine with decimal if present
    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart.slice(0, 2)}`;
    }
    return formattedInteger;
  };

  // Parse formatted value back to raw number string
  const parseValue = (val: string): string => {
    return val.replace(/[^0-9.]/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const parsed = parseValue(rawValue);
    onChange(parsed);
  };

  const displayValue = value ? formatValue(value) : '';

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: '#182026' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
          style={{ color: '#6B7280' }}
        >
          {prefix}
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-8 pr-4 py-3 text-sm transition-all outline-none"
          style={{
            backgroundColor: '#ffffff',
            color: '#182026',
            boxShadow: isFocused ? '0 0 0 2px rgba(49,38,227,0.45)' : '0 1px 3px rgba(0,0,0,0.08)',
            border: 'none',
            borderRadius: '6px',
          }}
        />
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground font-medium mt-1.5">{hint}</p>
      )}
    </div>
  );
}

// ─── Date of Birth Input ────────────────────────────────────────────────────
// Three-part DOB input: Day / Month / Year

interface DOBInputProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
}

export function DOBInput({
  value,
  onChange,
  label,
  hint,
}: DOBInputProps) {
  // Parse existing value
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Sync from prop
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [value]);

  // Combine and validate
  const updateValue = (d: string, m: string, y: string) => {
    // Only update parent if we have all parts
    if (d && m && y && y.length === 4) {
      // Validate date
      const dayNum = parseInt(d, 10);
      const monthNum = parseInt(m, 10);
      const yearNum = parseInt(y, 10);
      
      // Basic validation
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
        // Check for realistic year (18-100 years old)
        const currentYear = new Date().getFullYear();
        if (yearNum >= currentYear - 100 && yearNum <= currentYear - 18) {
          const paddedMonth = m.padStart(2, '0');
          const paddedDay = d.padStart(2, '0');
          onChange(`${y}-${paddedMonth}-${paddedDay}`);
        }
      }
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(val);
    updateValue(val, month, year);
    if (val.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(val);
    updateValue(day, val, year);
    if (val.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(val);
    updateValue(day, month, val);
  };

  const inputClass = "w-full px-3 py-3 text-sm text-center transition-all outline-none";
  const [dayFocused, setDayFocused] = useState(false);
  const [monthFocused, setMonthFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);
  const getInputStyle = (focused: boolean) => ({
    backgroundColor: '#ffffff',
    color: '#182026',
    boxShadow: focused ? '0 0 0 2px rgba(49,38,227,0.45)' : '0 1px 3px rgba(0,0,0,0.08)',
    border: 'none',
    borderRadius: '6px',
  });

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: '#182026' }}>
          {label}
        </label>
      )}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            value={day}
            onChange={handleDayChange}
            onFocus={() => setDayFocused(true)}
            onBlur={() => setDayFocused(false)}
            placeholder="DD"
            maxLength={2}
            className={inputClass}
            style={getInputStyle(dayFocused)}
          />
          <p className="text-xs text-muted-foreground font-medium mt-1 text-center">Day</p>
        </div>
        <div className="flex-1">
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            value={month}
            onChange={handleMonthChange}
            onFocus={() => setMonthFocused(true)}
            onBlur={() => setMonthFocused(false)}
            placeholder="MM"
            maxLength={2}
            className={inputClass}
            style={getInputStyle(monthFocused)}
          />
          <p className="text-xs text-muted-foreground font-medium mt-1 text-center">Month</p>
        </div>
        <div className="flex-[1.5]">
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            value={year}
            onChange={handleYearChange}
            onFocus={() => setYearFocused(true)}
            onBlur={() => setYearFocused(false)}
            placeholder="YYYY"
            maxLength={4}
            className={inputClass}
            style={getInputStyle(yearFocused)}
          />
          <p className="text-xs text-muted-foreground font-medium mt-1 text-center">Year</p>
        </div>
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground font-medium mt-2">{hint}</p>
      )}
    </div>
  );
}

// ─── Number Stepper ─────────────────────────────────────────────────────────
// Numeric input with +/- buttons

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  hint?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  hint,
}: NumberStepperProps) {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: '#182026' }}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          aria-label="Decrease"
          className="w-12 h-12 flex items-center justify-center transition-all"
          style={{
            backgroundColor: value <= min ? '#F3F4F6' : '#ffffff',
            color: value <= min ? '#D1D5DB' : '#374151',
            cursor: value <= min ? 'not-allowed' : 'pointer',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div
          className="flex-1 text-center py-3 text-lg font-semibold"
          style={{
            backgroundColor: '#ffffff',
            color: '#182026',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label="Increase"
          className="w-12 h-12 flex items-center justify-center transition-all"
          style={{
            backgroundColor: value >= max ? '#F3F4F6' : '#ffffff',
            color: value >= max ? '#D1D5DB' : '#374151',
            cursor: value >= max ? 'not-allowed' : 'pointer',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground font-medium mt-1.5">{hint}</p>
      )}
    </div>
  );
}

// ─── Dynamic Age Inputs ─────────────────────────────────────────────────────
// Multiple number inputs that appear based on dependant count

interface DependantAgesInputProps {
  count: number;
  ages: number[];
  onChange: (ages: number[]) => void;
  label?: string;
}

export function DependantAgesInput({
  count,
  ages,
  onChange,
  label,
}: DependantAgesInputProps) {
  // Ensure we have the right number of age slots
  const currentAges = [...ages];
  while (currentAges.length < count) {
    currentAges.push(0);
  }

  const handleAgeChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const newAges = [...currentAges];
    newAges[index] = Math.min(Math.max(numValue, 0), 25);
    onChange(newAges.slice(0, count));
  };

  if (count === 0) return null;

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-3" style={{ color: '#182026' }}>
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={25}
              value={currentAges[index] || ''}
              onChange={(e) => handleAgeChange(index, e.target.value)}
              placeholder="0"
              className="w-full px-3 py-3 rounded-lg text-sm text-center transition-all outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                color: '#182026',
                border: 'none',
              }}
            />
            <p className="text-xs text-muted-foreground font-medium mt-1 text-center">
              Child {index + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Radio Card Group ───────────────────────────────────────────────────────
// Visual card-style selection for small choice questions

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  columns?: 1 | 2 | 3;
}

export function RadioCardGroup({
  options,
  value,
  onChange,
  label,
  columns = 1,
}: RadioCardGroupProps) {
  const gridClass = columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-3" style={{ color: '#182026' }}>
          {label}
        </label>
      )}
      <div className={`grid ${gridClass} gap-3`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="text-left p-4 rounded-lg border transition-all"
              style={{
                borderColor: isSelected ? '#473FE6' : 'hsl(220 15% 90%)',
                backgroundColor: isSelected ? 'rgba(71, 63, 230, 0.04)' : '#ffffff',
                boxShadow: isSelected ? '0 0 0 1px #473FE6' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    borderColor: isSelected ? '#473FE6' : 'hsl(220 15% 85%)',
                    backgroundColor: isSelected ? '#473FE6' : 'transparent',
                  }}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <p className="text-sm font-semibold" style={{ color: '#182026' }}>
                      {option.label}
                    </p>
                  </div>
                  {option.description && (
                    <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Searchable Select ──────────────────────────────────────────────────────
// Dropdown with search filter for long lists

interface SearchableSelectOption {
  value: string;
  label: string;
  flag?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  searchPlaceholder = 'Search...',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: '#182026' }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between px-4 py-3 text-sm transition-all outline-none"
        style={{
          backgroundColor: '#ffffff',
          color: '#182026',
          boxShadow: isOpen ? '0 0 0 2px rgba(49,38,227,0.45)' : '0 1px 3px rgba(0,0,0,0.08)',
          border: 'none',
          borderRadius: '6px',
        }}
      >
        <span className="font-medium">{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            color: '#6B7280',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            borderColor: 'hsl(220 15% 90%)',
            maxHeight: '280px',
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b" style={{ borderColor: 'hsl(220 15% 92%)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#182026',
                  border: 'none',
                  borderRadius: '4px',
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground font-medium">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left"
                    style={{
                      backgroundColor: isSelected ? 'rgba(71, 63, 230, 0.06)' : 'transparent',
                      color: '#182026',
                    }}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      {option.flag && <span style={{ fontSize: '18px', lineHeight: 1 }}>{option.flag}</span>}
                      {isSelected && <Check className="w-4 h-4" style={{ color: '#473FE6' }} />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Common nationality options ─────────────────────────────────────────────

export const NATIONALITY_OPTIONS: SearchableSelectOption[] = [
  { value: 'british',      label: 'British',      flag: '🇬🇧' },
  { value: 'irish',        label: 'Irish',        flag: '🇮🇪' },
  { value: 'polish',       label: 'Polish',       flag: '🇵🇱' },
  { value: 'romanian',     label: 'Romanian',     flag: '🇷🇴' },
  { value: 'indian',       label: 'Indian',       flag: '🇮🇳' },
  { value: 'pakistani',    label: 'Pakistani',    flag: '🇵🇰' },
  { value: 'bangladeshi',  label: 'Bangladeshi',  flag: '🇧🇩' },
  { value: 'nigerian',     label: 'Nigerian',     flag: '🇳🇬' },
  { value: 'chinese',      label: 'Chinese',      flag: '🇨🇳' },
  { value: 'italian',      label: 'Italian',      flag: '🇮🇹' },
  { value: 'portuguese',   label: 'Portuguese',   flag: '🇵🇹' },
  { value: 'spanish',      label: 'Spanish',      flag: '🇪🇸' },
  { value: 'french',       label: 'French',       flag: '🇫🇷' },
  { value: 'german',       label: 'German',       flag: '🇩🇪' },
  { value: 'american',     label: 'American',     flag: '🇺🇸' },
  { value: 'australian',   label: 'Australian',   flag: '🇦🇺' },
  { value: 'canadian',     label: 'Canadian',     flag: '🇨🇦' },
  { value: 'south_african',label: 'South African',flag: '🇿🇦' },
  { value: 'jamaican',     label: 'Jamaican',     flag: '🇯🇲' },
  { value: 'kenyan',       label: 'Kenyan',       flag: '🇰🇪' },
  { value: 'ghanaian',     label: 'Ghanaian',     flag: '🇬🇭' },
  { value: 'brazilian',    label: 'Brazilian',    flag: '🇧🇷' },
  { value: 'filipino',     label: 'Filipino',     flag: '🇵🇭' },
  { value: 'turkish',      label: 'Turkish',      flag: '🇹🇷' },
  { value: 'sri_lankan',   label: 'Sri Lankan',   flag: '🇱🇰' },
  { value: 'other',        label: 'Other' },
];

// ─── Employment status options ──────────────────────────────────────────────

export const EMPLOYMENT_STATUS_OPTIONS: RadioCardOption[] = [
  { value: 'employed', label: 'Employed', description: 'Working for an employer (PAYE)' },
  { value: 'self_employed', label: 'Self-employed', description: 'Running your own business or freelancing' },
  { value: 'contractor', label: 'Contractor', description: 'Fixed-term or contract work' },
  { value: 'retired', label: 'Retired', description: 'No longer working' },
  { value: 'other', label: 'Other', description: 'Student, unemployed, or other' },
];

// ─── Mortgage type options ──────────────────────────────────────────────────

export const MORTGAGE_TYPE_OPTIONS: RadioCardOption[] = [
  { value: 'first_time', label: 'First-time buyer', description: 'Buying your first property' },
  { value: 'moving', label: 'Moving home', description: 'Already own a home and moving' },
  { value: 'remortgage', label: 'Remortgage', description: 'Refinancing your existing mortgage' },
  { value: 'buy_to_let', label: 'Buy-to-let', description: 'Investment property to rent out' },
];

// ─── Property type options ──────────────────────────────────────────────────

export const PROPERTY_TYPE_OPTIONS: RadioCardOption[] = [
  { value: 'detached', label: 'Detached house' },
  { value: 'semi_detached', label: 'Semi-detached house' },
  { value: 'terraced', label: 'Terraced house' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'other', label: 'Other' },
];

// ─── Deposit source options ─────────────────────────────────────────────────

export const DEPOSIT_SOURCE_OPTIONS: RadioCardOption[] = [
  { value: 'savings', label: 'Personal savings', description: 'Money you have saved over time' },
  { value: 'gift', label: 'Gift from family', description: 'Money given by a family member' },
  { value: 'inheritance', label: 'Inheritance', description: 'Money received from an estate' },
  { value: 'property_sale', label: 'Property sale', description: 'Proceeds from selling another property' },
  { value: 'other', label: 'Other source', description: 'Investment returns, bonus, etc.' },
];
