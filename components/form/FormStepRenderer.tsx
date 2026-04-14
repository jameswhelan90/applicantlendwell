'use client';

import { useState, useRef, useEffect } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { StepId } from '@/context/ApplicationContext';
import { ApplicationData, MortgageDocument } from '@/types/tasks';
import { useFormFooter } from './FormFooterContext';
import { useActivityStream } from '@/hooks/useActivityStream';
import { RequirementsDocuments } from '@/components/documents/RequirementsDocuments';
import { InlineDocumentPrompt } from '@/components/documents/InlineDocumentPrompt';
import {
  CurrencyInput,
  DOBInput,
  NumberStepper,
  DependantAgesInput,
  RadioCardGroup,
  SearchableSelect,
  NATIONALITY_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  MORTGAGE_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  DEPOSIT_SOURCE_OPTIONS,
} from './EnhancedInputs';
import {
  Upload,
  CheckCircle2,
  FileText,
  Clock,
  AlertCircle,
  Loader2,
  PenLine,
  Check,
  ArrowRight,
  User,
  Home,
  Briefcase,
  Shield,
  Type,
} from 'lucide-react';

// ─── Shared primitives ──────────────────────────────────────────────────────

function SectionLabel({ text: _text, isSecondary: _isSecondary }: { text: string; isSecondary?: boolean }) {
  return null;
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-10">
      <h1
        className="font-display font-medium text-balance leading-tight mb-3"
        style={{ fontSize: '2rem', color: '#182026' }}
      >
        {title}
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed" style={{ fontWeight: '500' }}>
        {description}
      </p>
    </div>
  );
}

// Auto-focus first input in a step for keyboard-first interactions
function useAutoFocusFirstInput() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('input:not([disabled])') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);
}

// Register the continue action with the fixed modal footer
function useStepFooter(action: () => void, label = 'Continue') {
  const { setFooter } = useFormFooter();
  useEffect(() => {
    setFooter(label, action);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#182026' }}>
        {label}
      </label>
      {hint && <p className="text-xs text-muted-foreground font-medium mb-2">{hint}</p>}
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-md border text-sm font-medium transition-colors outline-none focus:border-[#473FE6] focus:ring-2 focus:ring-[#473FE6]/20"
        style={{ borderColor: 'hsl(220 15% 90%)', backgroundColor: '#ffffff', color: '#182026' }}
      />
    </div>
  );
}

// ─── Country data ────────────────────────────────────────────────────────────
const COUNTRIES: { value: string; label: string; flag: string }[] = [
  { value: 'AF', label: 'Afghan', flag: '🇦🇫' },
  { value: 'AL', label: 'Albanian', flag: '🇦🇱' },
  { value: 'DZ', label: 'Algerian', flag: '🇩🇿' },
  { value: 'AD', label: 'Andorran', flag: '🇦🇩' },
  { value: 'AO', label: 'Angolan', flag: '🇦🇴' },
  { value: 'AG', label: 'Antiguan', flag: '🇦🇬' },
  { value: 'AR', label: 'Argentine', flag: '🇦🇷' },
  { value: 'AM', label: 'Armenian', flag: '🇦🇲' },
  { value: 'AU', label: 'Australian', flag: '🇦🇺' },
  { value: 'AT', label: 'Austrian', flag: '🇦🇹' },
  { value: 'AZ', label: 'Azerbaijani', flag: '🇦🇿' },
  { value: 'BS', label: 'Bahamian', flag: '🇧🇸' },
  { value: 'BH', label: 'Bahraini', flag: '🇧🇭' },
  { value: 'BD', label: 'Bangladeshi', flag: '🇧🇩' },
  { value: 'BB', label: 'Barbadian', flag: '🇧🇧' },
  { value: 'BY', label: 'Belarusian', flag: '🇧🇾' },
  { value: 'BE', label: 'Belgian', flag: '🇧🇪' },
  { value: 'BZ', label: 'Belizean', flag: '🇧🇿' },
  { value: 'BJ', label: 'Beninese', flag: '🇧🇯' },
  { value: 'BT', label: 'Bhutanese', flag: '🇧🇹' },
  { value: 'BO', label: 'Bolivian', flag: '🇧🇴' },
  { value: 'BA', label: 'Bosnian', flag: '🇧🇦' },
  { value: 'BW', label: 'Botswanan', flag: '🇧🇼' },
  { value: 'BR', label: 'Brazilian', flag: '🇧🇷' },
  { value: 'BN', label: 'Bruneian', flag: '🇧🇳' },
  { value: 'BG', label: 'Bulgarian', flag: '🇧🇬' },
  { value: 'BF', label: 'Burkinabe', flag: '🇧🇫' },
  { value: 'BI', label: 'Burundian', flag: '🇧🇮' },
  { value: 'KH', label: 'Cambodian', flag: '🇰🇭' },
  { value: 'CM', label: 'Cameroonian', flag: '🇨🇲' },
  { value: 'CA', label: 'Canadian', flag: '🇨🇦' },
  { value: 'CV', label: 'Cape Verdean', flag: '🇨🇻' },
  { value: 'CF', label: 'Central African', flag: '🇨🇫' },
  { value: 'TD', label: 'Chadian', flag: '🇹🇩' },
  { value: 'CL', label: 'Chilean', flag: '🇨🇱' },
  { value: 'CN', label: 'Chinese', flag: '🇨🇳' },
  { value: 'CO', label: 'Colombian', flag: '🇨🇴' },
  { value: 'KM', label: 'Comorian', flag: '🇰🇲' },
  { value: 'CG', label: 'Congolese', flag: '🇨🇬' },
  { value: 'CR', label: 'Costa Rican', flag: '🇨🇷' },
  { value: 'HR', label: 'Croatian', flag: '🇭🇷' },
  { value: 'CU', label: 'Cuban', flag: '🇨🇺' },
  { value: 'CY', label: 'Cypriot', flag: '🇨🇾' },
  { value: 'CZ', label: 'Czech', flag: '🇨🇿' },
  { value: 'DK', label: 'Danish', flag: '🇩🇰' },
  { value: 'DJ', label: 'Djiboutian', flag: '🇩🇯' },
  { value: 'DM', label: 'Dominican', flag: '🇩🇲' },
  { value: 'DO', label: 'Dominican Republic', flag: '🇩🇴' },
  { value: 'EC', label: 'Ecuadorian', flag: '🇪🇨' },
  { value: 'EG', label: 'Egyptian', flag: '🇪🇬' },
  { value: 'SV', label: 'Salvadoran', flag: '🇸🇻' },
  { value: 'GQ', label: 'Equatorial Guinean', flag: '🇬🇶' },
  { value: 'ER', label: 'Eritrean', flag: '🇪🇷' },
  { value: 'EE', label: 'Estonian', flag: '🇪🇪' },
  { value: 'SZ', label: 'Swazi', flag: '🇸🇿' },
  { value: 'ET', label: 'Ethiopian', flag: '🇪🇹' },
  { value: 'FJ', label: 'Fijian', flag: '🇫🇯' },
  { value: 'FI', label: 'Finnish', flag: '🇫🇮' },
  { value: 'FR', label: 'French', flag: '🇫🇷' },
  { value: 'GA', label: 'Gabonese', flag: '🇬🇦' },
  { value: 'GM', label: 'Gambian', flag: '🇬🇲' },
  { value: 'GE', label: 'Georgian', flag: '🇬🇪' },
  { value: 'DE', label: 'German', flag: '🇩🇪' },
  { value: 'GH', label: 'Ghanaian', flag: '🇬🇭' },
  { value: 'GR', label: 'Greek', flag: '🇬🇷' },
  { value: 'GD', label: 'Grenadian', flag: '🇬🇩' },
  { value: 'GT', label: 'Guatemalan', flag: '🇬🇹' },
  { value: 'GN', label: 'Guinean', flag: '🇬🇳' },
  { value: 'GW', label: 'Guinea-Bissauan', flag: '🇬🇼' },
  { value: 'GY', label: 'Guyanese', flag: '🇬🇾' },
  { value: 'HT', label: 'Haitian', flag: '🇭🇹' },
  { value: 'HN', label: 'Honduran', flag: '🇭🇳' },
  { value: 'HU', label: 'Hungarian', flag: '🇭🇺' },
  { value: 'IS', label: 'Icelandic', flag: '����🇸' },
  { value: 'IN', label: 'Indian', flag: '🇮🇳' },
  { value: 'ID', label: 'Indonesian', flag: '🇮🇩' },
  { value: 'IR', label: 'Iranian', flag: '🇮🇷' },
  { value: 'IQ', label: 'Iraqi', flag: '🇮🇶' },
  { value: 'IE', label: 'Irish', flag: '🇮🇪' },
  { value: 'IL', label: 'Israeli', flag: '🇮🇱' },
  { value: 'IT', label: 'Italian', flag: '🇮🇹' },
  { value: 'JM', label: 'Jamaican', flag: '🇯🇲' },
  { value: 'JP', label: 'Japanese', flag: '🇯🇵' },
  { value: 'JO', label: 'Jordanian', flag: '🇯🇴' },
  { value: 'KZ', label: 'Kazakhstani', flag: '🇰🇿' },
  { value: 'KE', label: 'Kenyan', flag: '🇰🇪' },
  { value: 'KI', label: 'I-Kiribati', flag: '🇰🇮' },
  { value: 'KP', label: 'North Korean', flag: '🇰🇵' },
  { value: 'KR', label: 'South Korean', flag: '🇰🇷' },
  { value: 'KW', label: 'Kuwaiti', flag: '🇰🇼' },
  { value: 'KG', label: 'Kyrgyz', flag: '🇰🇬' },
  { value: 'LA', label: 'Laotian', flag: '🇱🇦' },
  { value: 'LV', label: 'Latvian', flag: '🇱🇻' },
  { value: 'LB', label: 'Lebanese', flag: '🇱🇧' },
  { value: 'LS', label: 'Lesothan', flag: '🇱🇸' },
  { value: 'LR', label: 'Liberian', flag: '🇱🇷' },
  { value: 'LY', label: 'Libyan', flag: '🇱🇾' },
  { value: 'LI', label: 'Liechtensteiner', flag: '🇱🇮' },
  { value: 'LT', label: 'Lithuanian', flag: '🇱🇹' },
  { value: 'LU', label: 'Luxembourgish', flag: '🇱🇺' },
  { value: 'MG', label: 'Malagasy', flag: '🇲🇬' },
  { value: 'MW', label: 'Malawian', flag: '🇲🇼' },
  { value: 'MY', label: 'Malaysian', flag: '🇲🇾' },
  { value: 'MV', label: 'Maldivian', flag: '🇲🇻' },
  { value: 'ML', label: 'Malian', flag: '🇲🇱' },
  { value: 'MT', label: 'Maltese', flag: '🇲🇹' },
  { value: 'MH', label: 'Marshallese', flag: '🇲🇭' },
  { value: 'MR', label: 'Mauritanian', flag: '🇲🇷' },
  { value: 'MU', label: 'Mauritian', flag: '🇲🇺' },
  { value: 'MX', label: 'Mexican', flag: '🇲🇽' },
  { value: 'FM', label: 'Micronesian', flag: '🇫🇲' },
  { value: 'MD', label: 'Moldovan', flag: '🇲🇩' },
  { value: 'MC', label: 'Monegasque', flag: '🇲🇨' },
  { value: 'MN', label: 'Mongolian', flag: '🇲🇳' },
  { value: 'ME', label: 'Montenegrin', flag: '🇲🇪' },
  { value: 'MA', label: 'Moroccan', flag: '🇲🇦' },
  { value: 'MZ', label: 'Mozambican', flag: '🇲🇿' },
  { value: 'MM', label: 'Burmese', flag: '🇲🇲' },
  { value: 'NA', label: 'Namibian', flag: '🇳🇦' },
  { value: 'NR', label: 'Nauruan', flag: '🇳🇷' },
  { value: 'NP', label: 'Nepali', flag: '🇳🇵' },
  { value: 'NL', label: 'Dutch', flag: '🇳🇱' },
  { value: 'NZ', label: 'New Zealander', flag: '🇳🇿' },
  { value: 'NI', label: 'Nicaraguan', flag: '🇳🇮' },
  { value: 'NE', label: 'Nigerien', flag: '🇳🇪' },
  { value: 'NG', label: 'Nigerian', flag: '🇳🇬' },
  { value: 'MK', label: 'Macedonian', flag: '🇲🇰' },
  { value: 'NO', label: 'Norwegian', flag: '🇳🇴' },
  { value: 'OM', label: 'Omani', flag: '🇴🇲' },
  { value: 'PK', label: 'Pakistani', flag: '🇵🇰' },
  { value: 'PW', label: 'Palauan', flag: '🇵🇼' },
  { value: 'PA', label: 'Panamanian', flag: '🇵🇦' },
  { value: 'PG', label: 'Papua New Guinean', flag: '🇵🇬' },
  { value: 'PY', label: 'Paraguayan', flag: '🇵🇾' },
  { value: 'PE', label: 'Peruvian', flag: '🇵🇪' },
  { value: 'PH', label: 'Filipino', flag: '🇵🇭' },
  { value: 'PL', label: 'Polish', flag: '🇵🇱' },
  { value: 'PT', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'QA', label: 'Qatari', flag: '🇶🇦' },
  { value: 'RO', label: 'Romanian', flag: '🇷🇴' },
  { value: 'RU', label: 'Russian', flag: '🇷🇺' },
  { value: 'RW', label: 'Rwandan', flag: '🇷🇼' },
  { value: 'KN', label: 'Kittitian', flag: '🇰🇳' },
  { value: 'LC', label: 'Saint Lucian', flag: '🇱🇨' },
  { value: 'VC', label: 'Vincentian', flag: '🇻🇨' },
  { value: 'WS', label: 'Samoan', flag: '🇼🇸' },
  { value: 'SM', label: 'Sammarinese', flag: '🇸🇲' },
  { value: 'ST', label: 'Sao Tomean', flag: '🇸🇹' },
  { value: 'SA', label: 'Saudi', flag: '🇸🇦' },
  { value: 'SN', label: 'Senegalese', flag: '🇸🇳' },
  { value: 'RS', label: 'Serbian', flag: '🇷🇸' },
  { value: 'SC', label: 'Seychellois', flag: '🇸🇨' },
  { value: 'SL', label: 'Sierra Leonean', flag: '🇸🇱' },
  { value: 'SG', label: 'Singaporean', flag: '🇸🇬' },
  { value: 'SK', label: 'Slovak', flag: '🇸🇰' },
  { value: 'SI', label: 'Slovenian', flag: '🇸🇮' },
  { value: 'SB', label: 'Solomon Islander', flag: '🇸🇧' },
  { value: 'SO', label: 'Somali', flag: '🇸🇴' },
  { value: 'ZA', label: 'South African', flag: '🇿🇦' },
  { value: 'SS', label: 'South Sudanese', flag: '🇸🇸' },
  { value: 'ES', label: 'Spanish', flag: '🇪🇸' },
  { value: 'LK', label: 'Sri Lankan', flag: '🇱🇰' },
  { value: 'SD', label: 'Sudanese', flag: '🇸🇩' },
  { value: 'SR', label: 'Surinamese', flag: '🇸🇷' },
  { value: 'SE', label: 'Swedish', flag: '🇸🇪' },
  { value: 'CH', label: 'Swiss', flag: '🇨🇭' },
  { value: 'SY', label: 'Syrian', flag: '🇸🇾' },
  { value: 'TW', label: 'Taiwanese', flag: '🇹🇼' },
  { value: 'TJ', label: 'Tajik', flag: '🇹🇯' },
  { value: 'TZ', label: 'Tanzanian', flag: '🇹🇿' },
  { value: 'TH', label: 'Thai', flag: '🇹🇭' },
  { value: 'TL', label: 'Timorese', flag: '🇹🇱' },
  { value: 'TG', label: 'Togolese', flag: '🇹🇬' },
  { value: 'TO', label: 'Tongan', flag: '🇹🇴' },
  { value: 'TT', label: 'Trinidadian', flag: '🇹🇹' },
  { value: 'TN', label: 'Tunisian', flag: '🇹🇳' },
  { value: 'TR', label: 'Turkish', flag: '🇹🇷' },
  { value: 'TM', label: 'Turkmen', flag: '🇹🇲' },
  { value: 'TV', label: 'Tuvaluan', flag: '🇹🇻' },
  { value: 'UG', label: 'Ugandan', flag: '🇺🇬' },
  { value: 'UA', label: 'Ukrainian', flag: '🇺🇦' },
  { value: 'AE', label: 'Emirati', flag: '🇦🇪' },
  { value: 'GB', label: 'British', flag: '🇬🇧' },
  { value: 'US', label: 'American', flag: '🇺🇸' },
  { value: 'UY', label: 'Uruguayan', flag: '🇺🇾' },
  { value: 'UZ', label: 'Uzbek', flag: '🇺🇿' },
  { value: 'VU', label: 'Vanuatuan', flag: '🇻🇺' },
  { value: 'VE', label: 'Venezuelan', flag: '🇻🇪' },
  { value: 'VN', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'YE', label: 'Yemeni', flag: '🇾🇪' },
  { value: 'ZM', label: 'Zambian', flag: '🇿🇲' },
  { value: 'ZW', label: 'Zimbabwean', flag: '🇿🇼' },
];

// Pin commonly selected nationalities to the top
const PINNED = ['GB', 'IE', 'IN', 'PK', 'PL', 'NG', 'ZA', 'AU', 'US', 'CN'];

function CountrySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.value === value);

  const filtered = query.trim()
    ? COUNTRIES.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : [
        ...COUNTRIES.filter((c) => PINNED.includes(c.value)),
        { value: '__divider__', label: '', flag: '' },
        ...COUNTRIES.filter((c) => !PINNED.includes(c.value)).sort((a, b) =>
          a.label.localeCompare(b.label)
        ),
      ];

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="mb-5" ref={containerRef}>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#182026' }}>
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-md border text-sm font-medium transition-colors outline-none"
        style={{
          borderColor: open ? '#473FE6' : 'hsl(220 15% 90%)',
          backgroundColor: '#ffffff',
          boxShadow: open ? '0 0 0 2px rgba(71,63,230,0.15)' : 'none',
          color: selected ? '#182026' : '#9CA3AF',
        }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <>
              <span className="text-base leading-none flex-shrink-0">{selected.flag}</span>
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span>Select nationality</span>
          )}
        </span>
        <svg
          className="w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 rounded-lg border overflow-hidden"
          style={{
            width: containerRef.current?.offsetWidth ?? 280,
            backgroundColor: '#ffffff',
            borderColor: 'hsl(220 15% 90%)',
            boxShadow: '0 8px 24px rgba(24,32,38,0.12)',
          }}
        >
          {/* Search box */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: 'hsl(220 15% 92%)' }}
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: '#9CA3AF' }}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <circle cx="6.5" cy="6.5" r="4" />
              <path d="M11 11l2.5 2.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 text-sm outline-none bg-transparent font-medium placeholder:text-muted-foreground"
              style={{ color: '#182026' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="overflow-y-auto" style={{ maxHeight: '224px' }} role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground font-medium">No results found</li>
            ) : (
              filtered.map((c) =>
                c.value === '__divider__' ? (
                  <li key="divider" className="px-3 py-1.5">
                    <div className="border-t" style={{ borderColor: 'hsl(220 15% 92%)' }} />
                  </li>
                ) : (
                  <li key={c.value} role="option" aria-selected={c.value === value}>
                    <button
                      type="button"
                      onClick={() => { onChange(c.value); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left transition-colors"
                      style={{
                        backgroundColor: c.value === value ? 'rgba(71,63,230,0.06)' : 'transparent',
                        color: '#182026',
                      }}
                      onMouseEnter={(e) => {
                        if (c.value !== value) e.currentTarget.style.backgroundColor = 'hsl(220 15% 97%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = c.value === value ? 'rgba(71,63,230,0.06)' : 'transparent';
                      }}
                    >
                      <span className="text-base leading-none w-5 text-center flex-shrink-0">{c.flag}</span>
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.value === value && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#473FE6' }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </li>
                )
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
  columns = 1,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  columns?: 1 | 2 | 3;
  hint?: string;
}) {
  const gridCols = columns === 3 ? 'grid-cols-3' : columns === 2 ? 'grid-cols-2' : 'grid-cols-1';
  
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold mb-3" style={{ color: '#182026' }}>
        {label}
      </label>
      {hint && <p className="text-xs text-muted-foreground font-medium mb-2">{hint}</p>}
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((o) => {
          const isSelected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className="flex items-center gap-3 px-4 py-3 border text-left transition-all"
              style={{
                borderColor: isSelected ? '#473FE6' : 'hsl(220 15% 90%)',
                backgroundColor: isSelected ? 'rgba(71, 63, 230, 0.04)' : '#ffffff',
                boxShadow: isSelected ? '0 0 0 1px #473FE6' : 'none',
                borderRadius: '8px',
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: isSelected ? '#473FE6' : 'hsl(220 15% 85%)',
                  backgroundColor: isSelected ? '#473FE6' : 'transparent',
                }}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium" style={{ color: '#182026' }}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Alias for backward compatibility
const SelectInput = RadioGroup;

function OptionCard({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-lg border transition-all"
      style={{
        borderColor: selected ? '#473FE6' : 'hsl(220 15% 90%)',
        backgroundColor: selected ? 'rgba(71, 63, 230, 0.04)' : '#ffffff',
        boxShadow: selected ? '0 0 0 1px #473FE6' : 'none',
      }}
    >
      <div
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
        style={{
          borderColor: selected ? '#473FE6' : 'hsl(220 15% 85%)',
          backgroundColor: selected ? '#473FE6' : 'transparent',
        }}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#182026' }}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </button>
  );
}

function CheckboxRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-lg border transition-all"
      style={{
        borderColor: checked ? '#473FE6' : 'hsl(220 15% 90%)',
        backgroundColor: checked ? 'rgba(71, 63, 230, 0.04)' : '#ffffff',
        boxShadow: checked ? '0 0 0 1px #473FE6' : 'none',
      }}
    >
      <div
        className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
        style={{
          borderColor: checked ? '#473FE6' : 'hsl(220 15% 85%)',
          backgroundColor: checked ? '#473FE6' : 'transparent',
        }}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#182026' }}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </button>
  );
}

// ─── 1. Welcome ─────────────────────────────────────────────────────────────

// Typing indicator component - three bouncing dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: '#9CA3AF',
          animation: 'typingBounce 1.4s ease-in-out infinite',
          animationDelay: '0ms',
        }}
      />
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: '#9CA3AF',
          animation: 'typingBounce 1.4s ease-in-out infinite',
          animationDelay: '200ms',
        }}
      />
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: '#9CA3AF',
          animation: 'typingBounce 1.4s ease-in-out infinite',
          animationDelay: '400ms',
        }}
      />
      <style jsx>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Animated text component - types out character by character
function AnimatedText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        // Variable speed: faster for spaces and punctuation, slightly random for natural feel
        const char = text[currentIndex - 1];
        const baseDelay = char === ' ' ? 10 : char === '.' || char === ',' ? 80 : 25;
        const jitter = Math.random() * 15;
        setTimeout(typeNextChar, baseDelay + jitter);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    // Small initial delay before starting to type
    const startTimer = setTimeout(typeNextChar, 100);
    return () => clearTimeout(startTimer);
  }, [text, onComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <span
          className="inline-block w-0.5 h-4 ml-0.5 align-middle"
          style={{
            backgroundColor: '#473FE6',
            animation: 'cursorBlink 0.8s ease-in-out infinite',
          }}
        />
      )}
      <style jsx>{`
        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

// Chat bubble component with animated text support
function ChatBubble({
  message,
  isVisible,
  animate,
  onAnimationComplete,
}: {
  message: string;
  isVisible: boolean;
  animate?: boolean;
  onAnimationComplete?: () => void;
}) {
  if (!isVisible) return null;
  return (
    <div
      className="max-w-[85%] px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ backgroundColor: '#F1F3F7', borderRadius: '8px' }}
    >
      <p className="text-[15px] leading-relaxed" style={{ color: '#182026' }}>
        {animate ? (
          <AnimatedText text={message} onComplete={onAnimationComplete} />
        ) : (
          message
        )}
      </p>
    </div>
  );
}

function WelcomeStep() {
  const { completeStep } = useApplication();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1); // -1 = not started
  const [completedMessages, setCompletedMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useStepFooter(() => completeStep('welcome'));

  const messages = [
    "Hi there! I'm Sarah, your dedicated mortgage advisor.",
    "I'm here to guide you through every step of your mortgage journey and make the process as smooth as possible.",
    "Over the next few minutes, we'll gather some essential information. Don't worry — your data is secure, and I'll explain everything along the way.",
    "Ready to get started? Just click 'Continue' below whenever you're ready.",
  ];

  // Start the conversation
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(false);
      setCurrentMessageIndex(0);
    }, 1000);
    return () => clearTimeout(startTimer);
  }, []);

  const handleMessageComplete = (index: number) => {
    setCompletedMessages((prev) => [...prev, index]);
    
    // Move to next message after a pause
    if (index < messages.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentMessageIndex(index + 1);
      }, 800);
    }
  };

  // Auto-scroll to bottom as messages appear or animate
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessageIndex, completedMessages, isTyping]);

  return (
    <div className="w-full">
      {/* Chat container */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(24, 32, 38, 0.06)',
        }}
      >
        {/* Chat header — advisor info */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid #F1F3F7' }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bristol1-LccOjH08cdx6tLEzIFNynaSCoWK6y7.jpg"
              alt="Sarah Mitchell"
              className="w-11 h-11 rounded-full object-cover"
            />
            {/* Online indicator */}
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: '#22C55E' }}
            />
          </div>
          {/* Name and status */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#182026' }}>
              Sarah Mitchell
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              Your Mortgage Advisor
            </p>
          </div>
        </div>

        {/* Chat messages area */}
        <div
          ref={chatContainerRef}
          className="px-5 py-6 space-y-3 overflow-y-auto"
          style={{ minHeight: '280px', maxHeight: '400px' }}
        >
          {/* Message bubbles */}
          {messages.map((msg, idx) => {
            const isCompleted = completedMessages.includes(idx);
            const isCurrentlyTyping = currentMessageIndex === idx && !isCompleted;
            const shouldShow = idx <= currentMessageIndex;

            if (!shouldShow) return null;

            return (
              <div key={idx} className="flex items-end gap-2">
                {/* Small avatar for first message only */}
                {idx === 0 && (
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bristol1-LccOjH08cdx6tLEzIFNynaSCoWK6y7.jpg"
                    alt=""
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                {idx !== 0 && <div className="w-6 flex-shrink-0" />}
                <ChatBubble
                  message={msg}
                  isVisible={true}
                  animate={isCurrentlyTyping}
                  onAnimationComplete={() => handleMessageComplete(idx)}
                />
              </div>
            );
          })}

          {/* Typing indicator - shows between messages */}
          {isTyping && currentMessageIndex < messages.length - 1 && (
            <div className="flex items-end gap-2">
              {currentMessageIndex === -1 && (
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bristol1-LccOjH08cdx6tLEzIFNynaSCoWK6y7.jpg"
                  alt=""
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              )}
              {currentMessageIndex >= 0 && <div className="w-6 flex-shrink-0" />}
              <div
                className="rounded-2xl rounded-tl-md"
                style={{ backgroundColor: '#F1F3F7' }}
              >
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Orientation Step ─────────────────────────────────────────────────────────

function OrientationStep() {
  const { completeStep } = useApplication();
  useStepFooter(() => completeStep('orientation'), 'Start Application');

  return (
    <div className="text-center py-8">
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#EDECFD' }}
      >
        <CheckCircle2 className="w-8 h-8" style={{ color: '#3126E3' }} />
      </div>
      <h1
        className="font-display font-medium text-2xl mb-4"
        style={{ color: '#182026' }}
      >
        Let&apos;s get you mortgage-ready
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
        We&apos;ll guide you through each step of your application. Your progress is saved automatically, 
        and you can return at any time.
      </p>
      <div
        className="space-y-3 text-left max-w-sm mx-auto"
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
        }}
      >
        {[
          'Answer questions about yourself and your finances',
          'Upload documents when prompted',
          'LendWell will verify everything automatically',
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: '#F0FBDF' }}
            >
              <Check className="w-3 h-3" style={{ color: '#3C6006' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#182026' }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Introduction Components ─────────────────────────────────────────

interface SectionIntroProps {
  stepId: StepId;
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  buttonText?: string;
}

function SectionIntroPanel({ stepId, icon, title, description, bullets, buttonText = 'Start Section' }: SectionIntroProps) {
  const { completeStep } = useApplication();
  useStepFooter(() => completeStep(stepId), buttonText);

  return (
    <div className="text-center py-6">
      <div
        className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#EDECFD' }}
      >
        {icon}
      </div>
      <h1
        className="font-display font-medium text-2xl mb-3"
        style={{ color: '#182026' }}
      >
        {title}
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-6 font-medium">
        {description}
      </p>
      <div className="rounded-lg mb-2" style={{ backgroundColor: '#ffffff', padding: '20px' }}>
        <p className="text-sm font-semibold mb-3 text-left" style={{ color: '#182026' }}>
          What&apos;s in this section
        </p>
        <div className="space-y-2 text-left">
          {bullets.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#F0FBDF' }}
              >
                <Check className="w-3 h-3" style={{ color: '#3C6006' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#182026' }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntroAboutYouStep() {
  return (
    <SectionIntroPanel
      stepId="intro_about_you"
      icon={<User className="w-7 h-7" style={{ color: '#3126E3' }} />}
      title="About You"
      description="We need to collect some personal details that lenders require to assess your mortgage application."
      bullets={[
        'Confirm your identity and contact details',
        'Tell us about your household',
        'Provide residency and address information',
      ]}
    />
  );
}

function IntroPropertyMortgageStep() {
  return (
    <SectionIntroPanel
      stepId="intro_property_mortgage"
      icon={<Home className="w-7 h-7" style={{ color: '#3126E3' }} />}
      title="Property & Mortgage"
      description="This section helps lenders understand your property goals and mortgage requirements."
      bullets={[
        'Tell us what you want to buy or refinance',
        'Share the estimated property value',
        'Provide details about your deposit',
      ]}
    />
  );
}

function IntroEmploymentIncomeStep() {
  return (
    <SectionIntroPanel
      stepId="intro_employment_income"
      icon={<Briefcase className="w-7 h-7" style={{ color: '#3126E3' }} />}
      title="Employment & Income"
      description="Lenders need to understand your income stability and financial commitments to assess affordability."
      bullets={[
        'Tell us about your job or business',
        'Share your income sources',
        'Provide details about monthly commitments',
      ]}
    />
  );
}

function IntroDocumentsStep() {
  return (
    <SectionIntroPanel
      stepId="intro_documents"
      icon={<FileText className="w-7 h-7" style={{ color: '#3126E3' }} />}
      title="Documents"
      description="We need to verify the information you have provided with supporting documents."
      bullets={[
        'Upload identity documents (passport or driving licence)',
        'Provide income evidence (payslips or tax returns)',
        'Share bank statements to confirm your finances',
      ]}
    />
  );
}

function IntroAgreementsStep() {
  return (
    <SectionIntroPanel
      stepId="intro_agreements"
      icon={<CheckCircle2 className="w-7 h-7" style={{ color: '#3126E3' }} />}
      title="Finishing Up"
      description="You are almost there. Once everything is submitted, LendWell will help prepare your application for lenders."
      bullets={[
        'Review the final details of your application',
        'Provide consent for lenders to review your information',
        'Understand what happens next as your application is prepared',
      ]}
      buttonText="Review & Complete"
    />
  );
}

// ─── Identity Section Steps ──────────────────────────────────────────────────

function IdNameStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_name'));

  return (
    <div>
      <StepHeading
        title="What is your name?"
        description="We will use your legal name throughout your mortgage application."
      />
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput label="First name" value={d.firstName} onChange={(v) => setField('firstName', v)} placeholder="Sarah" autoFocus />
        <TextInput label="Last name" value={d.lastName} onChange={(v) => setField('lastName', v)} placeholder="Murphy" />
      </div>
    </div>
  );
}

function IdDobStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_dob'));

  return (
    <div>
      <StepHeading
        title="When were you born?"
        description="Your date of birth helps us verify your identity and check mortgage eligibility."
      />
      <DOBInput 
        label="Date of birth" 
        value={d.dateOfBirth} 
        onChange={(v) => setField('dateOfBirth', v)} 
        hint="You must be at least 18 years old to apply"
      />
    </div>
  );
}

function IdContactStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_contact'));

  return (
    <div>
      <StepHeading
        title="Contact details"
        description="We will only contact you about your mortgage application."
      />
      <TextInput label="Phone number" value={d.phone} onChange={(v) => setField('phone', v)} placeholder="+44 7700 900000" type="tel" autoFocus />
      <TextInput label="Email address" value={d.email} onChange={(v) => setField('email', v)} placeholder="sarah@example.com" type="email" />
    </div>
  );
}

function IdNationalityStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_nationality'));

  return (
    <div>
      <StepHeading
        title="Nationality and residency"
        description="Lenders need to verify your right to reside and work in the UK or Ireland."
      />
      <div className="mb-6">
        <SearchableSelect 
          label="Nationality" 
          value={d.nationality} 
          onChange={(v) => setField('nationality', v)} 
          options={NATIONALITY_OPTIONS}
          placeholder="Select your nationality"
          searchPlaceholder="Search nationalities..."
        />
      </div>
      <SelectInput
        label="UK/Ireland residency status"
        value={d.residencyStatus}
        onChange={(v) => setField('residencyStatus', v)}
        options={[
          { value: 'uk_citizen', label: 'UK/Irish citizen' },
          { value: 'indefinite_leave', label: 'Indefinite leave to remain' },
          { value: 'settled_status', label: 'EU Settled Status' },
          { value: 'visa_holder', label: 'Visa holder' },
          { value: 'other', label: 'Other' },
        ]}
      />
    </div>
  );
}

function IdNiPpsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_ni_pps'));

  return (
    <div>
      <StepHeading
        title="National Insurance or PPS number"
        description="Your NI number (UK) or PPS number (Ireland) is used for identity verification and credit checks."
      />
      <TextInput 
        label="NI / PPS number" 
        value={d.nationalInsuranceNumber} 
        onChange={(v) => setField('nationalInsuranceNumber', v)} 
        placeholder="QQ 12 34 56 C"
        hint="Format: 2 letters, 6 numbers, 1 letter (e.g., QQ 12 34 56 C)"
        autoFocus 
      />
    </div>
  );
}

function IdAddressStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_address'));

  return (
    <div>
      <StepHeading
        title="Current address"
        description="Where you live now. Most lenders require at least 3 years of address history."
      />
      <TextInput label="Address" value={d.currentAddress} onChange={(v) => setField('currentAddress', v)} placeholder="14 Elm Street, London" autoFocus />
      <TextInput label="Postcode / Eircode" value={d.postcode} onChange={(v) => setField('postcode', v)} placeholder="SW1A 1AA" />
      <TextInput label="Move-in date" value={d.moveInDate} onChange={(v) => setField('moveInDate', v)} type="date" />
      <SelectInput
        label="Residential status"
        value={d.residentialStatus}
        onChange={(v) => setField('residentialStatus', v)}
        options={[
          { value: 'owner', label: 'Homeowner (with mortgage)' },
          { value: 'owner_outright', label: 'Homeowner (no mortgage)' },
          { value: 'renting', label: 'Renting' },
          { value: 'living_with_family', label: 'Living with family' },
          { value: 'other', label: 'Other' },
        ]}
      />
    </div>
  );
}

function IdAddressHistoryStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('id_address_history'));

  return (
    <div>
      <StepHeading
        title="Previous address"
        description="If you have been at your current address less than 3 years, please provide your previous address."
      />
      <TextInput 
        label="Previous address" 
        value={d.previousAddress} 
        onChange={(v) => setField('previousAddress', v)} 
        placeholder="Previous address (if less than 3 years at current)"
        autoFocus 
      />
      {/* Contextual document prompt after identity questions */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3">While you&apos;re here...</p>
        <InlineDocumentPrompt 
          requirementId="req-passport" 
          title="Upload your photo ID now"
          description="Passport or driving licence helps verify your identity"
        />
      </div>
    </div>
  );
}

function IdUploadPhotoStep() {
  const { completeStep } = useApplication();
  useStepFooter(() => completeStep('id_upload_photo'));

  return (
    <div>
      <StepHeading
        title="Upload your photo ID"
        description="A valid passport or driving licence helps verify your identity."
      />
      <InlineDocumentPrompt requirementId="req-passport" />
    </div>
  );
}

// ─── Household Section Steps ─────────────────────────────────────────────────

function HhCircumstancesStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('hh_circumstances'));

  return (
    <div>
      <StepHeading
        title="Personal circumstances"
        description="This information helps lenders understand your financial responsibilities."
      />
      <SelectInput
        label="Marital / relationship status"
        value={d.maritalStatus}
        onChange={(v) => setField('maritalStatus', v)}
        columns={2}
        options={[
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
          { value: 'civil_partnership', label: 'Civil Partnership' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widowed', label: 'Widowed' },
          { value: 'cohabiting', label: 'Cohabiting' },
        ]}
      />
    </div>
  );
}

function HhApplicationModeStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('hh_application_mode'));

  return (
    <div>
      <StepHeading
        title="Are you applying alone or with someone?"
        description="Joint applications can increase borrowing power. Your co-applicant will need to provide their details too."
      />
      <SelectInput
        label="Application type"
        value={d.applicationMode}
        onChange={(v) => setField('applicationMode', v)}
        options={[
          { value: 'single', label: 'Just me (sole application)' },
          { value: 'joint', label: 'With a partner or co-applicant (joint application)' },
        ]}
      />
    </div>
  );
}

function HhSecondApplicantStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('hh_second_applicant'));

  // Skip if not a joint application
  useEffect(() => {
    if (shouldSkip) {
      completeStep('hh_second_applicant');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Second applicant details"
        description="We need some basic information about your co-applicant."
      />
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput label="First name" value={d.secondApplicantFirstName} onChange={(v) => setField('secondApplicantFirstName', v)} placeholder="John" autoFocus />
        <TextInput label="Last name" value={d.secondApplicantLastName} onChange={(v) => setField('secondApplicantLastName', v)} placeholder="Murphy" />
      </div>
      <TextInput label="Date of birth" value={d.secondApplicantDob} onChange={(v) => setField('secondApplicantDob', v)} type="date" />
    </div>
  );
}

function HhSecondApplicantContactStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('hh_second_applicant_contact'));

  // Skip if not a joint application
  useEffect(() => {
    if (shouldSkip) {
      completeStep('hh_second_applicant_contact');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Second applicant contact details"
        description="We may need to contact your co-applicant directly."
      />
      <TextInput label="Email address" value={d.secondApplicantEmail} onChange={(v) => setField('secondApplicantEmail', v)} placeholder="john@example.com" type="email" autoFocus />
      <TextInput label="Phone number" value={d.secondApplicantPhone} onChange={(v) => setField('secondApplicantPhone', v)} placeholder="+44 7700 900001" type="tel" />
    </div>
  );
}

function HhUploadJointIdStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('hh_upload_joint_id'));

  // Skip if not a joint application
  useEffect(() => {
    if (shouldSkip) {
      completeStep('hh_upload_joint_id');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Second applicant photo ID"
        description="We need a valid passport or driving licence for your co-applicant."
      />
      <InlineDocumentPrompt 
        requirementId="req-joint-passport" 
        condition={d.applicationMode === 'joint'}
        title="Second applicant Photo ID"
        description="Valid passport or driving licence for your co-applicant"
      />
    </div>
  );
}

function HhDependantsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('hh_dependants'));

  const dependantCount = parseInt(d.dependants, 10) || 0;
  
  // Parse existing ages from comma-separated string or array
  const parseAges = (): number[] => {
    if (!d.dependantAges) return [];
    if (typeof d.dependantAges === 'string') {
      return d.dependantAges.split(',').map((a: string) => parseInt(a.trim(), 10) || 0).filter((a: number) => a > 0);
    }
    return [];
  };

  const handleAgesChange = (ages: number[]) => {
    setField('dependantAges', ages.join(', '));
  };

  return (
    <div>
      <StepHeading
        title="Dependants"
        description="Do you have any children or other dependants who rely on you financially?"
      />
      <div className="mb-6">
        <NumberStepper
          label="Number of dependants"
          value={dependantCount}
          onChange={(v) => setField('dependants', v.toString())}
          min={0}
          max={10}
          hint="Children under 18 or others who rely on you financially"
        />
      </div>
      {dependantCount > 0 && (
        <>
          <div className="mb-6">
            <DependantAgesInput
              label="Ages of your dependants"
              count={dependantCount}
              ages={parseAges()}
              onChange={handleAgesChange}
            />
          </div>
          <CurrencyInput 
            label="Monthly childcare costs" 
            value={d.monthlyChildcareCosts} 
            onChange={(v) => setField('monthlyChildcareCosts', v)} 
            hint="Nursery, childminder, after-school clubs, etc."
          />
        </>
      )}
    </div>
  );
}

// ─── Intent Section Steps ────────────────────────────────────────────────────

function IntentTypeStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('intent_type'));

  return (
    <div>
      <StepHeading
        title="What type of mortgage do you need?"
        description="This helps us find the right lenders and products for your situation."
      />
      <RadioCardGroup
        options={MORTGAGE_TYPE_OPTIONS}
        value={d.buyerType}
        onChange={(v) => setField('buyerType', v)}
      />
    </div>
  );
}

function IntentRemortgageStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.buyerType !== 'remortgage';
  
  useStepFooter(() => completeStep('intent_remortgage'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('intent_remortgage');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Current mortgage details"
        description="Tell us about your existing mortgage so we can find better options."
      />
      <TextInput label="Current lender" value={d.currentLender} onChange={(v) => setField('currentLender', v)} placeholder="e.g., NatWest, Halifax" autoFocus />
      <div className="mb-6">
        <CurrencyInput label="Outstanding balance" value={d.outstandingBalance} onChange={(v) => setField('outstandingBalance', v)} placeholder="180,000" />
      </div>
      <div className="mb-6">
        <CurrencyInput label="Current monthly payment" value={d.currentMortgagePayment} onChange={(v) => setField('currentMortgagePayment', v)} placeholder="950" />
      </div>
      <SelectInput
        label="Reason for remortgaging"
        value={d.remortgageReason}
        onChange={(v) => setField('remortgageReason', v)}
        options={[
          { value: 'better_rate', label: 'Looking for a better rate' },
          { value: 'release_equity', label: 'Releasing equity' },
          { value: 'consolidate_debt', label: 'Consolidating debt' },
          { value: 'home_improvements', label: 'Home improvements' },
          { value: 'end_of_term', label: 'Current deal ending' },
        ]}
      />
      {/* Contextual document prompt for remortgage */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3">You&apos;ll need...</p>
        <InlineDocumentPrompt 
          requirementId="req-mortgage-statement" 
          title="Current mortgage statement"
          description="Most recent statement from your current lender"
        />
      </div>
    </div>
  );
}

function IntentUploadMortgageStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.buyerType !== 'remortgage';
  
  useStepFooter(() => completeStep('intent_upload_mortgage'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('intent_upload_mortgage');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Current mortgage statement"
        description="Please upload your most recent mortgage statement from your current lender."
      />
      <InlineDocumentPrompt 
        requirementId="req-mortgage-statement" 
        condition={d.buyerType === 'remortgage'}
      />
    </div>
  );
}

function IntentBtlStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('intent_btl'));

  const shouldSkip = d.buyerType !== 'buy_to_let';
  
  useEffect(() => {
    if (shouldSkip) {
      completeStep('intent_btl');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Buy-to-let details"
        description="Lenders will assess rental income to ensure the mortgage is affordable."
      />
      <div className="mb-6">
        <CurrencyInput 
          label="Expected monthly rental income" 
          value={d.expectedRentalIncome} 
          onChange={(v) => setField('expectedRentalIncome', v)} 
          placeholder="1,200"
          hint="Based on local market rates or letting agent valuation"
        />
      </div>
      <SelectInput
        label="Property management plan"
        value={d.propertyManagementPlan}
        onChange={(v) => setField('propertyManagementPlan', v)}
        options={[
          { value: 'self_managed', label: 'I will manage the property myself' },
          { value: 'letting_agent', label: 'Through a letting agent' },
          { value: 'management_company', label: 'Professional management company' },
        ]}
      />
      <SelectInput
        label="Existing BTL portfolio"
        value={d.existingBTLPortfolio}
        onChange={(v) => setField('existingBTLPortfolio', v)}
        options={[
          { value: '0', label: 'This will be my first BTL property' },
          { value: '1-3', label: '1-3 properties' },
          { value: '4+', label: '4 or more properties (portfolio landlord)' },
        ]}
      />
      {/* Contextual document prompt for BTL */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3">You&apos;ll need...</p>
        <InlineDocumentPrompt 
          requirementId="req-rental-projection" 
          title="Rental income evidence"
          description="Letting agent valuation or existing tenancy agreement"
        />
      </div>
    </div>
  );
}

function IntentUploadRentalStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.buyerType !== 'buy_to_let';
  
  useStepFooter(() => completeStep('intent_upload_rental'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('intent_upload_rental');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Rental income evidence"
        description="Upload a rental projection from a letting agent, or existing tenancy agreement if applicable."
      />
      <InlineDocumentPrompt 
        requirementId="req-rental-projection" 
        condition={d.buyerType === 'buy_to_let'}
      />
    </div>
  );
}

function IntentTimelineStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('intent_timeline'));

  return (
    <div>
      <StepHeading
        title="When do you need the mortgage?"
        description="This helps us prioritise your application appropriately."
      />
      <SelectInput
        label="Target timeline"
        value={d.targetTimeline}
        onChange={(v) => setField('targetTimeline', v)}
        options={[
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3_months', label: 'Within 1-3 months' },
          { value: '3-6_months', label: 'Within 3-6 months' },
          { value: '6+_months', label: 'More than 6 months away' },
          { value: 'just_exploring', label: 'Just exploring options' },
        ]}
      />
    </div>
  );
}

// ─── Property Section Steps ────────────────────────────────��─────────────────

function PropStageStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('prop_stage'));

  return (
    <div>
      <StepHeading
        title="Have you found a property?"
        description="Let us know where you are in your property search."
      />
      <SelectInput
        label="Property status"
        value={d.propertyStage}
        onChange={(v) => setField('propertyStage', v)}
        options={[
          { value: 'not_looking', label: 'Not started looking yet' },
          { value: 'searching', label: 'Actively searching' },
          { value: 'found', label: 'Found a property' },
          { value: 'offer_made', label: 'Made an offer' },
          { value: 'offer_accepted', label: 'Offer accepted' },
        ]}
      />
    </div>
  );
}

function PropDetailsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('prop_details'));

  const hasProperty = d.propertyStage === 'found' || d.propertyStage === 'offer_made' || d.propertyStage === 'offer_accepted';

  return (
    <div>
      <StepHeading
        title={hasProperty ? "Property details" : "What type of property are you looking for?"}
        description={hasProperty ? "Tell us about the property you have found." : "This helps us estimate your borrowing needs."}
      />
      {hasProperty && (
        <TextInput 
          label="Property address" 
          value={d.propertyAddress} 
          onChange={(v) => setField('propertyAddress', v)} 
          placeholder="123 Main Street, London"
          autoFocus 
        />
      )}
      <SelectInput
        label="Property type"
        value={d.propertyType}
        onChange={(v) => setField('propertyType', v)}
        options={[
          { value: 'detached', label: 'Detached house' },
          { value: 'semi_detached', label: 'Semi-detached house' },
          { value: 'terraced', label: 'Terraced house' },
          { value: 'flat', label: 'Flat / Apartment' },
          { value: 'bungalow', label: 'Bungalow' },
          { value: 'new_build', label: 'New build' },
        ]}
      />
      <SelectInput
        label="Intended use"
        value={d.propertyOccupancy}
        onChange={(v) => setField('propertyOccupancy', v)}
        options={[
          { value: 'primary_residence', label: 'Primary residence' },
          { value: 'second_home', label: 'Second home / Holiday home' },
          { value: 'buy_to_let', label: 'Buy-to-let' },
        ]}
      />
    </div>
  );
}

function PropValueStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('prop_value'));

  return (
    <div>
      <StepHeading
        title="Property value and loan amount"
        description="This helps us calculate your loan-to-value ratio and find suitable products."
      />
      <div className="space-y-4">
        <CurrencyInput 
          label="Property value / Purchase price" 
          value={d.propertyValue} 
          onChange={(v) => setField('propertyValue', v)} 
          placeholder="350,000"
        />
        <CurrencyInput 
          label="Loan amount needed" 
          value={d.loanAmount} 
          onChange={(v) => setField('loanAmount', v)} 
          placeholder="280,000"
          hint="Property value minus your deposit"
        />
      </div>
    </div>
  );
}

// ─── Employment Section Steps ────────────────────────────────────────────────

function EmpStatusStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('emp_status'));

  return (
    <div>
      <StepHeading
        title="What is your employment status?"
        description="Your employment type determines which documents we will need."
      />
      <RadioCardGroup
        options={EMPLOYMENT_STATUS_OPTIONS}
        value={d.employmentStatus}
        onChange={(v) => setField('employmentStatus', v)}
      />
    </div>
  );
}

function EmpDetailsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const isEmployed = d.employmentStatus === 'employed' || d.employmentStatus === 'contractor';
  const shouldSkip = !isEmployed;
  
  useStepFooter(() => completeStep('emp_details'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('emp_details');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Employment details"
        description="Tell us about your current employer."
      />
      <TextInput label="Employer name" value={d.employerName} onChange={(v) => setField('employerName', v)} placeholder="Acme Corporation" autoFocus />
      <TextInput label="Job title" value={d.jobTitle} onChange={(v) => setField('jobTitle', v)} placeholder="Senior Developer" />
      <TextInput label="Start date" value={d.employmentStartDate} onChange={(v) => setField('employmentStartDate', v)} type="date" />
      <SelectInput
        label="Are you on probation?"
        value={d.onProbation}
        onChange={(v) => setField('onProbation', v)}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ]}
      />
      {/* Contextual document prompt after employment details */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3">While you&apos;re here...</p>
        <InlineDocumentPrompt 
          requirementId="req-payslips" 
          title="Upload your payslips now"
          description="Last 3 months of consecutive payslips"
        />
      </div>
    </div>
  );
}

function EmpSelfEmployedStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const isSelfEmployed = d.employmentStatus === 'self_employed' || d.employmentStatus === 'director';
  const shouldSkip = !isSelfEmployed;
  
  useStepFooter(() => completeStep('emp_self_employed'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('emp_self_employed');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Self-employment details"
        description="Lenders typically require 2-3 years of accounts or tax returns for self-employed applicants."
      />
      <TextInput label="Business name" value={d.employerName} onChange={(v) => setField('employerName', v)} placeholder="Murphy Consulting Ltd" autoFocus />
      <TextInput label="Your role" value={d.jobTitle} onChange={(v) => setField('jobTitle', v)} placeholder="Director / Owner" />
      <SelectInput
        label="Business structure"
        value={d.businessStructure}
        onChange={(v) => setField('businessStructure', v)}
        options={[
          { value: 'sole_trader', label: 'Sole trader' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'limited_company', label: 'Limited company' },
        ]}
      />
      <SelectInput
        label="Years trading"
        value={d.yearsTrading}
        onChange={(v) => setField('yearsTrading', v)}
        options={[
          { value: 'less_than_1', label: 'Less than 1 year' },
          { value: '1_to_2', label: '1-2 years' },
          { value: '2_to_3', label: '2-3 years' },
          { value: '3_plus', label: '3+ years' },
        ]}
      />
      
      {/* Accountant details section */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: '#182026' }}>Accountant details</p>
        <TextInput label="Accountant name" value={d.accountantName} onChange={(v) => setField('accountantName', v)} placeholder="John Smith" />
        <TextInput label="Accountant firm" value={d.accountantFirm} onChange={(v) => setField('accountantFirm', v)} placeholder="Smith & Co Accountants" />
        <TextInput label="Accountant email" value={d.accountantEmail} onChange={(v) => setField('accountantEmail', v)} placeholder="john@smithandco.com" type="email" />
        <TextInput label="Accountant phone" value={d.accountantPhone} onChange={(v) => setField('accountantPhone', v)} placeholder="+44 20 1234 5678" type="tel" />
      </div>

      {/* Contextual document prompt for self-employed */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Documents you&apos;ll need...</p>
        <div className="space-y-3">
          <InlineDocumentPrompt 
            requirementId="req-sa302" 
            title="SA302 or tax returns"
            description="Last 2 years of HMRC tax calculations"
          />
          <InlineDocumentPrompt 
            requirementId="req-accountant-reference" 
            title="Accountant reference letter"
            description="Confirmation of income from your accountant"
          />
        </div>
      </div>
    </div>
  );
}

function EmpUploadPayslipsStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const isEmployed = d.employmentStatus === 'employed' || d.employmentStatus === 'contractor';
  const shouldSkip = !isEmployed;
  
  useStepFooter(() => completeStep('emp_upload_payslips'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('emp_upload_payslips');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Upload your payslips"
        description="Please upload your last 3 consecutive monthly payslips."
      />
      <InlineDocumentPrompt 
        requirementId="req-payslips" 
        condition={isEmployed}
      />
    </div>
  );
}

function EmpUploadTaxStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const isSelfEmployed = d.employmentStatus === 'self_employed' || d.employmentStatus === 'director';
  const shouldSkip = !isSelfEmployed;
  
  useStepFooter(() => completeStep('emp_upload_tax'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('emp_upload_tax');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Upload your SA302 or tax returns"
        description="Please upload your last 2 years of HMRC tax calculations (SA302) or certified accounts."
      />
      <InlineDocumentPrompt 
        requirementId="req-sa302" 
        condition={isSelfEmployed}
        title="SA302 / Tax Returns"
        description="Last 2 years of HMRC tax calculations"
      />
      <div className="mt-4">
        <InlineDocumentPrompt 
          requirementId="req-accountant-reference" 
          condition={isSelfEmployed}
          title="Accountant&apos;s Certificate (optional)"
          description="Letter from your accountant confirming income"
        />
      </div>
    </div>
  );
}

function EmpSecondApplicantStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('emp_second_applicant'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('emp_second_applicant');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Second applicant employment"
        description="Tell us about your co-applicant&apos;s employment."
      />
      <SelectInput
        label="Employment status"
        value={d.secondApplicantEmploymentStatus}
        onChange={(v) => setField('secondApplicantEmploymentStatus', v)}
        options={[
          { value: 'employed', label: 'Employed (PAYE)' },
          { value: 'self_employed', label: 'Self-employed' },
          { value: 'director', label: 'Company director' },
          { value: 'retired', label: 'Retired' },
          { value: 'not_working', label: 'Not currently working' },
        ]}
      />
      {(d.secondApplicantEmploymentStatus === 'employed' || d.secondApplicantEmploymentStatus === 'director') && (
        <>
          <TextInput label="Employer / Business name" value={d.secondApplicantEmployerName} onChange={(v) => setField('secondApplicantEmployerName', v)} placeholder="Company name" />
          <TextInput label="Job title" value={d.secondApplicantJobTitle} onChange={(v) => setField('secondApplicantJobTitle', v)} placeholder="Job title" />
        </>
      )}
    </div>
  );
}

function EmpUploadJointStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('emp_upload_joint'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('emp_upload_joint');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  const isJointEmployed = d.secondApplicantEmploymentStatus === 'employed';
  const isJointSelfEmployed = d.secondApplicantEmploymentStatus === 'self_employed' || d.secondApplicantEmploymentStatus === 'director';

  return (
    <div>
      <StepHeading
        title="Second applicant income evidence"
        description="Please upload income evidence for your co-applicant."
      />
      {isJointEmployed && (
        <InlineDocumentPrompt 
          requirementId="req-joint-payslips" 
          condition={isJointEmployed}
          title="Second applicant payslips"
          description="Last 3 months of consecutive payslips"
        />
      )}
      {isJointSelfEmployed && (
        <InlineDocumentPrompt 
          requirementId="req-sa302" 
          condition={isJointSelfEmployed}
          title="Second applicant SA302 / Tax returns"
          description="Last 2 years of tax calculations"
        />
      )}
    </div>
  );
}

// ─── Income Section Steps ────────────────────────────────────────────────────

function IncSalaryStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('inc_salary'));

  return (
    <div>
      <StepHeading
        title="Your income"
        description="Please provide your annual income before tax."
      />
      <CurrencyInput 
        label="Annual salary / Self-employed income" 
        value={d.annualSalary} 
        onChange={(v) => setField('annualSalary', v)} 
        placeholder="65,000"
        hint="Your gross annual income before deductions"
      />
    </div>
  );
}

function IncAdditionalStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('inc_additional'));

  return (
    <div>
      <StepHeading
        title="Additional income"
        description="Do you receive any regular additional income? This can increase your borrowing power."
      />
      <div className="space-y-4">
        <CurrencyInput label="Annual bonus" value={d.bonus} onChange={(v) => setField('bonus', v)} placeholder="5,000" />
        <CurrencyInput label="Annual commission" value={d.commission} onChange={(v) => setField('commission', v)} placeholder="0" />
        <CurrencyInput label="Regular overtime" value={d.overtime} onChange={(v) => setField('overtime', v)} placeholder="0" />
        <CurrencyInput label="Other income" value={d.otherIncome} onChange={(v) => setField('otherIncome', v)} placeholder="0" />
        {d.otherIncome && d.otherIncome !== '0' && (
          <TextInput label="Other income source" value={d.otherIncomeSource} onChange={(v) => setField('otherIncomeSource', v)} placeholder="e.g., rental income, dividends" />
        )}
      </div>
      {/* Contextual document prompt after income questions */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3">While you&apos;re here...</p>
        <InlineDocumentPrompt 
          requirementId="req-bank-statements" 
          title="Upload your bank statements now"
          description="Last 3 months from your main current account"
        />
      </div>
    </div>
  );
}

function IncSecondApplicantStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('inc_second_applicant'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('inc_second_applicant');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Second applicant income"
        description="Please provide your co-applicant&apos;s annual income."
      />
      <TextInput 
        label="Annual salary" 
        value={d.secondApplicantAnnualSalary} 
        onChange={(v) => setField('secondApplicantAnnualSalary', v)} 
        placeholder="£45,000"
        autoFocus 
      />
    </div>
  );
}

function IncUploadBankStep() {
  const { completeStep } = useApplication();
  useStepFooter(() => completeStep('inc_upload_bank'));

  return (
    <div>
      <StepHeading
        title="Upload your bank statements"
        description="Please upload your last 3 months of bank statements from your main current account."
      />
      <InlineDocumentPrompt requirementId="req-bank-statements" />
    </div>
  );
}

function IncUploadJointBankStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.applicationMode !== 'joint';
  
  useStepFooter(() => completeStep('inc_upload_joint_bank'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('inc_upload_joint_bank');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Second applicant bank statements"
        description="Please upload your co-applicant&apos;s last 3 months of bank statements."
      />
      <InlineDocumentPrompt 
        requirementId="req-joint-bank-statements" 
        condition={d.applicationMode === 'joint'}
      />
    </div>
  );
}

// ─── Commitments Section Steps ───────────────────────────────────────────────

function CommitOutgoingsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('commit_outgoings'));

  return (
    <div>
      <StepHeading
        title="Monthly financial commitments"
        description="Please tell us about any regular monthly payments you make. Enter 0 if none."
      />
      <TextInput label="Loan repayments" value={d.monthlyLoans} onChange={(v) => setField('monthlyLoans', v)} placeholder="£0" autoFocus />
      <TextInput label="Credit card payments" value={d.monthlyCreditCards} onChange={(v) => setField('monthlyCreditCards', v)} placeholder="£0" />
      <TextInput label="Car finance" value={d.monthlyCarFinance} onChange={(v) => setField('monthlyCarFinance', v)} placeholder="£0" />
      <TextInput label="Maintenance payments" value={d.monthlyMaintenance} onChange={(v) => setField('monthlyMaintenance', v)} placeholder="£0" hint="Child or spousal maintenance" />
      <TextInput label="Other regular commitments" value={d.monthlyOther} onChange={(v) => setField('monthlyOther', v)} placeholder="£0" />
    </div>
  );
}

function CommitChildcareStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = !d.dependants || d.dependants === '0' || d.monthlyChildcareCosts;
  
  useStepFooter(() => completeStep('commit_childcare'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('commit_childcare');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Childcare costs"
        description="If you have regular childcare costs, please tell us the monthly amount."
      />
      <TextInput 
        label="Monthly childcare costs" 
        value={d.monthlyChildcare} 
        onChange={(v) => setField('monthlyChildcare', v)} 
        placeholder="£800"
        hint="Nursery, childminder, after-school clubs, etc."
        autoFocus 
      />
    </div>
  );
}

// ─── Deposit Section Steps ───────────────────────────────────────────────────

function DepAmountStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('dep_amount'));

  return (
    <div>
      <StepHeading
        title="Your deposit"
        description="How much deposit do you have available?"
      />
      <div className="mb-6">
        <CurrencyInput 
          label="Deposit amount" 
          value={d.depositAmount} 
          onChange={(v) => setField('depositAmount', v)} 
          placeholder="70,000"
        />
      </div>
      <SelectInput
        label="Are these funds readily available?"
        value={d.fundsAvailable}
        onChange={(v) => setField('fundsAvailable', v)}
        options={[
          { value: 'yes', label: 'Yes, in savings/current account' },
          { value: 'investments', label: 'Yes, but in investments (need to sell)' },
          { value: 'property_sale', label: 'From property sale (not yet completed)' },
          { value: 'no', label: 'Not yet available' },
        ]}
      />
    </div>
  );
}

function DepSourceStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('dep_source'));

  return (
    <div>
      <StepHeading
        title="Source of deposit"
        description="Lenders need to verify where your deposit funds come from."
      />
      <RadioCardGroup
        options={DEPOSIT_SOURCE_OPTIONS}
        value={d.depositSource}
        onChange={(v) => setField('depositSource', v)}
      />
    </div>
  );
}

function DepGiftDetailsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.depositSource !== 'gift';
  
  useStepFooter(() => completeStep('dep_gift_details'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('dep_gift_details');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Gift details"
        description="Please provide details about the person gifting you funds."
      />
      <TextInput label="Giftor&apos;s full name" value={d.giftorName} onChange={(v) => setField('giftorName', v)} placeholder="Margaret Murphy" autoFocus />
      <SelectInput
        label="Relationship to you"
        value={d.giftorRelationship}
        onChange={(v) => setField('giftorRelationship', v)}
        options={[
          { value: 'parent', label: 'Parent' },
          { value: 'grandparent', label: 'Grandparent' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'other_family', label: 'Other family member' },
          { value: 'friend', label: 'Friend' },
        ]}
      />
      <CurrencyInput label="Gift amount" value={d.giftAmount} onChange={(v) => setField('giftAmount', v)} placeholder="30,000" />
    </div>
  );
}

function DepUploadGiftStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.depositSource !== 'gift';
  
  useStepFooter(() => completeStep('dep_upload_gift'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('dep_upload_gift');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Gift letter"
        description="Please upload a signed gift letter from the person gifting you funds."
      />
      <InlineDocumentPrompt 
        requirementId="req-gift-letter" 
        condition={d.depositSource === 'gift'}
      />
    </div>
  );
}

function DepUploadGiftorStep() {
  const { state, completeStep } = useApplication();
  const d = state.data;
  const shouldSkip = d.depositSource !== 'gift';
  
  useStepFooter(() => completeStep('dep_upload_giftor'));

  useEffect(() => {
    if (shouldSkip) {
      completeStep('dep_upload_giftor');
    }
  }, [shouldSkip, completeStep]);

  if (shouldSkip) return null;

  return (
    <div>
      <StepHeading
        title="Giftor&apos;s bank statements"
        description="Please upload 3 months of bank statements from the person gifting you funds, showing the source of their funds."
      />
      <InlineDocumentPrompt 
        requirementId="req-giftor-statements" 
        condition={d.depositSource === 'gift'}
      />
    </div>
  );
}

// ─── LEGACY: Financial Profile Steps (keeping for backwards compatibility) ──

// ─── 2. Financial Profile — Name (micro-step 1 of 4) ─────────��────────────────

function FPNameStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;

  useStepFooter(() => completeStep('fp_name'));

  return (
    <div>
      <SectionLabel text="Personal Details" />
      <StepHeading
        title="What is your name?"
        description="We will use your legal name throughout your mortgage application."
      />
      <div className="grid grid-cols-2 gap-x-4">
        <TextInput label="First name" value={d.firstName} onChange={(v) => setField('firstName', v)} placeholder="Sarah" autoFocus />
        <TextInput label="Last name" value={d.lastName} onChange={(v) => setField('lastName', v)} placeholder="Murphy" />
      </div>
    </div>
  );
}

// ─── 2b. Financial Profile — Date of Birth (micro-step 2 of 4) ────────────────

function FPDobStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;

  useStepFooter(() => completeStep('fp_dob'));

  return (
    <div>
      <SectionLabel text="Personal Details" />
      <StepHeading
        title="When were you born?"
        description="Your date of birth helps us verify your identity and check mortgage eligibility."
      />
      <TextInput label="Date of birth" value={d.dateOfBirth} onChange={(v) => setField('dateOfBirth', v)} type="date" autoFocus />
    </div>
  );
}

// ─── 3. Financial Profile — Contact details ──────────────────────────────��──

function FPContactStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;

  useStepFooter(() => completeStep('fp_contact'));

  return (
    <div>
      <SectionLabel text="Contact Details" />
      <StepHeading
        title="Contact details"
        description="We will only contact you about your mortgage application."
      />
      <TextInput label="Phone number" value={d.phone} onChange={(v) => setField('phone', v)} placeholder="+44 7700 900000" type="tel" autoFocus />
      <TextInput label="Email address" value={d.email} onChange={(v) => setField('email', v)} placeholder="sarah@example.com" type="email" />
    </div>
  );
}

// ─── 4. Financial Profile — Personal circumstances ──────────────────────────

function FPCircumstancesStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;

  useStepFooter(() => completeStep('fp_circumstances'));

  return (
    <div>
      <SectionLabel text="Personal Circumstances" />
      <StepHeading
        title="Personal circumstances"
        description="This information helps lenders understand your financial responsibilities."
      />
<SelectInput
  label="Marital / relationship status"
  value={d.maritalStatus}
  onChange={(v) => setField('maritalStatus', v)}
  columns={2}
  options={[
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'civil_partnership', label: 'Civil Partnership' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'cohabiting', label: 'Cohabiting' },
  ]}
      />
      <CountrySelect label="Nationality" value={d.nationality} onChange={(v) => setField('nationality', v)} />
      <SelectInput
        label="UK residency status"
        value={d.residencyStatus}
        onChange={(v) => setField('residencyStatus', v)}
        options={[
          { value: 'uk_citizen', label: 'UK citizen' },
          { value: 'indefinite_leave', label: 'Indefinite leave to remain' },
          { value: 'visa_holder', label: 'Visa holder' },
          { value: 'other', label: 'Other' },
        ]}
      />
      <SelectInput
        label="Number of dependants"
        value={d.dependants}
        onChange={(v) => setField('dependants', v)}
        options={[
          { value: '0', label: 'None' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4+', label: '4 or more' },
        ]}
      />
    </div>
  );
}

// ─── 3. Financial Profile — Address (micro-step 1 of 2) ─────────────────────

function FPAddressStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('fp_address'));

  return (
    <div>
      <SectionLabel text="Your Address" />
      <StepHeading
        title="Where do you live?"
        description="We need your current address for identity verification."
      />
      <TextInput
        label="Current address"
        value={d.currentAddress}
        onChange={(v) => setField('currentAddress', v)}
        placeholder="14 Elm Street, London"
        autoFocus
      />
      <TextInput
        label="Postcode"
        value={d.postcode}
        onChange={(v) => setField('postcode', v)}
        placeholder="SW1A 1AA"
      />
    </div>
  );
}

// ─── 6. Financial Profile — Address history ─────────────────────────────────

function FPAddressHistoryStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('fp_address_history'));

  // Calculate if they've been at current address less than 3 years
  const needsPreviousAddress = d.moveInDate && (() => {
    const moveIn = new Date(d.moveInDate);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    return moveIn > threeYearsAgo;
  })();

  return (
    <div>
      <SectionLabel text="Address History" />
      <StepHeading
        title="Address history"
        description="Lenders typically look at your address history for the past 3 years."
      />
      <TextInput
        label="Date you moved in"
        value={d.moveInDate}
        onChange={(v) => setField('moveInDate', v)}
        type="date"
        autoFocus
      />
<SelectInput
  label="Residential status"
  value={d.residentialStatus}
  onChange={(v) => setField('residentialStatus', v)}
  columns={2}
  options={[
    { value: 'homeowner', label: 'Homeowner' },
    { value: 'renting', label: 'Renting' },
    { value: 'with_family', label: 'Living with family' },
    { value: 'other', label: 'Other' },
  ]}
      />
      {d.residentialStatus === 'renting' && (
        <CurrencyInput
          label="Monthly rent"
          value={d.monthlyRent}
          onChange={(v) => setField('monthlyRent', v)}
          placeholder="1,200"
        />
      )}
      {needsPreviousAddress && (
        <TextInput
          label="Previous address"
          value={d.previousAddress}
          onChange={(v) => setField('previousAddress', v)}
          placeholder="Your address before moving to your current home"
          hint="Since you moved in less than 3 years ago, please provide your previous address."
        />
      )}
    </div>
  );
}

// ─── 7. Financial Profile — Employment status ───────────────────────────────

function FPEmploymentStatusStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('fp_employment_status'));

  return (
    <div>
      <SectionLabel text="Employment" />
      <StepHeading
        title="Employment status"
        description="This helps us understand your income type and the documents you will need."
      />
<SelectInput
  label="What is your employment status?"
  value={d.employmentStatus}
  onChange={(v) => setField('employmentStatus', v)}
  columns={2}
  options={[
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self-employed' },
    { value: 'director', label: 'Company Director' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'retired', label: 'Retired' },
    { value: 'unemployed', label: 'Not employed' },
  ]}
      />
    </div>
  );
}

// ─── 8. Financial Profile — Employment details (conditional) ────────────────

function FPEmploymentDetailsStep() {
  const { state, setField, completeStep, goToNextStep } = useApplication();
  const d = state.data;

  // Skip this step if retired or unemployed
  const shouldSkip = d.employmentStatus === 'retired' || d.employmentStatus === 'unemployed';
  
  useStepFooter(() => {
    if (shouldSkip) {
      goToNextStep();
    } else {
      completeStep('fp_employment_details');
    }
  });

  // Auto-skip if not applicable
  if (shouldSkip) {
    return (
      <div>
        <SectionLabel text="Employment" />
        <StepHeading
          title="Employment details"
          description="This step is not applicable based on your employment status."
        />
        <p className="text-sm text-muted-foreground">Click continue to proceed to the next step.</p>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel text="Employment" />
      <StepHeading
        title="Employment details"
        description="Tell us about your current role."
      />
      <TextInput
        label={d.employmentStatus === 'self_employed' ? 'Business name' : 'Employer name'}
        value={d.employerName}
        onChange={(v) => setField('employerName', v)}
        placeholder={d.employmentStatus === 'self_employed' ? 'Murphy Consulting Ltd' : 'Acme Ltd'}
        autoFocus
      />
      <TextInput
        label="Job title"
        value={d.jobTitle}
        onChange={(v) => setField('jobTitle', v)}
        placeholder="Senior Software Engineer"
      />
      <TextInput
        label="Start date"
        value={d.employmentStartDate}
        onChange={(v) => setField('employmentStartDate', v)}
        type="date"
      />
  {d.employmentStatus === 'employed' && (
<SelectInput
  label="Are you currently on probation?"
  value={d.onProbation}
  onChange={(v) => setField('onProbation', v)}
  columns={2}
  options={[
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' },
  ]}
        />
      )}
      {d.employmentStatus === 'contractor' && (
        <TextInput
          label="Contract end date"
          value={d.contractEndDate}
          onChange={(v) => setField('contractEndDate', v)}
          type="date"
          hint="When does your current contract end?"
        />
      )}
    </div>
  );
}

// ─── 9. Financial Profile — Income ───���──────────────────────────────────────

function FPIncomeStep() {
  const { state, setField, completeStep } = useApplication();
  const { triggerActivity } = useActivityStream();
  const d = state.data;
  useStepFooter(() => {
    triggerActivity('income_verify');
    completeStep('fp_income');
  });

  return (
    <div>
      <SectionLabel text="Income" />
      <StepHeading
        title="Your income"
        description="Enter your annual income before tax. Include all regular income sources."
      />
      <CurrencyInput
        label="Annual base salary"
        value={d.annualSalary}
        onChange={(v) => setField('annualSalary', v)}
        placeholder="55,000"
        hint="Your gross annual salary before deductions."
      />
      <CurrencyInput
        label="Annual bonus"
        value={d.bonus}
        onChange={(v) => setField('bonus', v)}
        placeholder="0"
        hint="Average annual bonus if applicable."
      />
      <CurrencyInput
        label="Annual commission"
        value={d.commission}
        onChange={(v) => setField('commission', v)}
        placeholder="0"
        hint="Average annual commission if applicable."
      />
      <CurrencyInput
        label="Annual overtime"
        value={d.overtime}
        onChange={(v) => setField('overtime', v)}
        placeholder="0"
        hint="Average annual overtime if applicable."
      />
      <CurrencyInput
        label="Other annual income"
        value={d.otherIncome}
        onChange={(v) => setField('otherIncome', v)}
        placeholder="0"
      />
      {d.otherIncome && parseInt(d.otherIncome) > 0 && (
        <TextInput
          label="Source of other income"
          value={d.otherIncomeSource}
          onChange={(v) => setField('otherIncomeSource', v)}
          placeholder="e.g. rental income, freelance work"
        />
      )}
    </div>
  );
}

// ─── 10. Financial Profile — Monthly commitments ────────────────────────────

function FPOutgoingsStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('fp_outgoings'));

  return (
    <div>
      <SectionLabel text="Monthly Commitments" />
      <StepHeading
        title="Monthly commitments"
        description="Enter your regular monthly financial commitments. Enter 0 if not applicable."
      />
      <CurrencyInput
        label="Loan repayments"
        value={d.monthlyLoans}
        onChange={(v) => setField('monthlyLoans', v)}
        placeholder="0"
        hint="Personal loans, student loans, etc."
      />
      <CurrencyInput
        label="Credit card repayments"
        value={d.monthlyCreditCards}
        onChange={(v) => setField('monthlyCreditCards', v)}
        placeholder="0"
        hint="Minimum monthly payments on credit cards."
      />
      <CurrencyInput
        label="Childcare costs"
        value={d.monthlyChildcare}
        onChange={(v) => setField('monthlyChildcare', v)}
        placeholder="0"
      />
      <CurrencyInput
        label="Maintenance payments"
        value={d.monthlyMaintenance}
        onChange={(v) => setField('monthlyMaintenance', v)}
        placeholder="0"
        hint="Child maintenance or spousal maintenance."
      />
      <CurrencyInput
        label="Car finance"
        value={d.monthlyCarFinance}
        onChange={(v) => setField('monthlyCarFinance', v)}
        placeholder="0"
        hint="Monthly car loan or lease payments."
      />
      <CurrencyInput
        label="Other commitments"
        value={d.monthlyOther}
        onChange={(v) => setField('monthlyOther', v)}
        placeholder="0"
        hint="Any other regular monthly payments."
      />
    </div>
  );
}

// ─── 11. Financial Profile — Deposit and savings ────────────────────────────

function FPDepositStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('fp_deposit'));

  return (
    <div>
      <SectionLabel text="Deposit" />
      <StepHeading
        title="Deposit and savings"
        description="Tell us about your deposit and where it is coming from."
      />
      <CurrencyInput
        label="Deposit amount"
        value={d.depositAmount}
        onChange={(v) => setField('depositAmount', v)}
        placeholder="40,000"
        hint="The amount you plan to put down as a deposit."
      />
      <SelectInput
        label="Source of deposit"
        value={d.depositSource}
        onChange={(v) => setField('depositSource', v)}
        options={[
          { value: 'savings', label: 'Personal savings' },
          { value: 'gift', label: 'Gift from family' },
          { value: 'equity', label: 'Equity from existing property' },
          { value: 'inheritance', label: 'Inheritance' },
          { value: 'other', label: 'Other' },
        ]}
      />
  {d.depositSource === 'gift' && (
<SelectInput
  label="Is this a gifted deposit?"
  value={d.isGiftedDeposit}
  onChange={(v) => setField('isGiftedDeposit', v)}
  columns={2}
  options={[
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ]}
          hint="A gifted deposit letter from the donor will be required."
        />
      )}
<SelectInput
  label="Are these funds readily available?"
  value={d.fundsAvailable}
  onChange={(v) => setField('fundsAvailable', v)}
  columns={2}
  options={[
    { value: 'yes', label: 'Yes, ready to use' },
    { value: 'no', label: 'No, need to liquidate' },
  ]}
      />
      <CurrencyInput
        label="Total savings available"
        value={d.savingsAmount}
        onChange={(v) => setField('savingsAmount', v)}
        placeholder="15,000"
        hint="All savings currently accessible to you, including the deposit."
      />
    </div>
  );
}

// ─── 12. Financial Profile — Mortgage goals ─────────────────────────────────

function FPGoalsStep() {
  const { state, setField, completeStep } = useApplication();
  const { triggerActivity } = useActivityStream();
  const d = state.data;
  useStepFooter(() => {
    triggerActivity('application_readiness', { sectionId: 'about_you' });
    completeStep('fp_goals');
  });

  return (
    <div>
      <SectionLabel text="Mortgage Goals" />
      <StepHeading
        title="Mortgage goals"
        description="Tell us what you are looking to achieve with this application."
      />
<SelectInput
  label="I am a..."
  value={d.buyerType}
  onChange={(v) => setField('buyerType', v)}
  columns={2}
  options={[
    { value: 'first_time', label: 'First-time buyer' },
    { value: 'home_mover', label: 'Home mover' },
    { value: 'remortgage', label: 'Remortgaging' },
    { value: 'btl', label: 'Buy-to-let investor' },
  ]}
      />
      <CurrencyInput
        label="Target property value"
        value={d.propertyValue}
        onChange={(v) => setField('propertyValue', v)}
        placeholder="350,000"
      />
      <CurrencyInput
        label="Mortgage amount required"
        value={d.loanAmount}
        onChange={(v) => setField('loanAmount', v)}
        placeholder="280,000"
        hint="Typically property value minus your deposit."
      />
      <SelectInput
        label="Target timeline to purchase"
        value={d.targetTimeline}
        onChange={(v) => setField('targetTimeline', v)}
        options={[
          { value: 'asap', label: 'As soon as possible' },
          { value: '3_months', label: 'Within 3 months' },
          { value: '6_months', label: 'Within 6 months' },
          { value: '12_months', label: 'Within 12 months' },
          { value: 'not_sure', label: 'Not sure yet' },
        ]}
      />
    </div>
  );
}

// ─── 9. Documents ─────────────────────────────────────────────────────────────

function DocumentStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'verified':
      return <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />;
    case 'uploaded':
    case 'processing':
      return <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: '#473FE6' }} />;
    case 'rejected':
      return <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#E07900' }} />;
    default:
      return <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />;
  }
}

function DocumentRow({
  doc,
  onUpload,
}: {
  doc: MortgageDocument;
  onUpload: (docId: string) => void;
}) {
  const isActionable = doc.status === 'required' || doc.status === 'rejected';
  const isUploaded = doc.status === 'uploaded' || doc.status === 'processing' || doc.status === 'verified';

  const statusLabel: Record<string, string> = {
    required: doc.required ? 'Required' : 'Optional',
    optional: 'Optional',
    uploaded: 'Uploaded',
    processing: 'Processing',
    verified: 'Verified',
    rejected: 'Needs attention',
  };

  const statusColor: Record<string, string> = {
    required: '#5A7387',      // Primary.Color (neutral)
    optional: '#5A7387',      // Primary.Color (neutral)
    uploaded: '#3126E3',      // Indigo.Color (processing)
    processing: '#3126E3',    // Indigo.Color (processing)
    verified: '#3C6006',      // Success.Text-Soft
    rejected: '#653701',      // Warning.Text-Soft
  };

  return (
    <li
      className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-lg"
      style={{
        backgroundColor: '#ffffff',
        border: doc.status === 'rejected' ? '1px solid #FFDAAF' : '1px solid #E1E8EE',
      }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <DocumentStatusIcon status={doc.status} />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug" style={{ color: '#182026' }}>
            {doc.label}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-snug">
            {doc.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-semibold" style={{ color: statusColor[doc.status] }}>
          {statusLabel[doc.status]}
        </span>
        {isActionable && (
          <button
            onClick={() => onUpload(doc.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full btn-interactive"
            style={{ backgroundColor: '#3126E3', color: '#ffffff' }}
          >
            Upload
          </button>
        )}
        {isUploaded && (
          <button
            onClick={() => onUpload(doc.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: '#F1F3F7', color: '#182026' }}
          >
            Replace
          </button>
        )}
      </div>
    </li>
  );
}

function DocsOverviewStep() {
  const { completeStep } = useApplication();
  useStepFooter(() => completeStep('docs_overview'));

  return (
    <div>
      <SectionLabel text="Documents" />
      <StepHeading
        title="Upload your documents"
        description="Upload the documents lenders will need to review your application. LendWell will check each one and let you know if anything else is needed."
      />
      <RequirementsDocuments />
    </div>
  );
}

// ─── 10 & 11. House Hunting ──────────────────────────────────────────────────

function HHStageStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('hh_stage'));

  return (
    <div>
      <SectionLabel text="House Hunting — 1 of 2" />
      <StepHeading
        title="Where are you in your property search?"
        description="This helps us understand how urgently you need a mortgage offer and what details we need from you."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          { value: 'not_started', label: 'Not started yet', description: 'Exploring options, not actively searching' },
          { value: 'searching', label: 'Actively searching', description: 'Viewing properties, no offer yet' },
          { value: 'offer_made', label: 'Offer made', description: 'Made an offer on a property' },
          { value: 'offer_accepted', label: 'Offer accepted', description: 'Offer accepted — have a property' },
        ].map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={d.propertyStage === opt.value}
            onSelect={() => setField('propertyStage', opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function HHPropertyStep() {
  const { state, setField, completeStep } = useApplication();
  const d = state.data;
  useStepFooter(() => completeStep('hh_property'));

  const hasProperty = d.propertyStage === 'offer_made' || d.propertyStage === 'offer_accepted';

  return (
    <div>
      <SectionLabel text="House Hunting — 2 of 2" />
      <StepHeading
        title={hasProperty ? 'Property details' : 'Your property preferences'}
        description={
          hasProperty
            ? 'Tell us about the property you have made an offer on.'
            : 'Give us a sense of what you are looking for — you can update this later.'
        }
      />
      {hasProperty && (
        <TextInput
          label="Property address"
          value={d.propertyAddress}
          onChange={(v) => setField('propertyAddress', v)}
          placeholder="42 Oak Road, Bristol, BS1 3AB"
        />
      )}
<SelectInput
  label="Property type"
  value={d.propertyType}
  onChange={(v) => setField('propertyType', v)}
  columns={2}
  options={[
    { value: 'detached', label: 'Detached' },
    { value: 'semi_detached', label: 'Semi-detached' },
    { value: 'terraced', label: 'Terraced' },
    { value: 'flat', label: 'Flat / Apartment' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'new_build', label: 'New build' },
  ]}
      />
<SelectInput
  label="Intended use"
  value={d.propertyOccupancy}
  onChange={(v) => setField('propertyOccupancy', v)}
  columns={2}
        options={[
          { value: 'primary', label: 'Primary residence' },
          { value: 'buy_to_let', label: 'Buy-to-let / investment' },
          { value: 'holiday', label: 'Holiday home' },
        ]}
      />
    </div>
  );
}

// ─── 12. Agreements — Declarations ────────────────��──���──────────────────────

function AGDeclarationsStep() {
  const { state, signAgreement, setField, completeStep } = useApplication();
  const agreements = state.agreements;
  const d = state.data;
  useStepFooter(() => completeStep('ag_declarations'), 'Proceed to signature');

  return (
    <div>
      <SectionLabel text="Agreements — 1 of 2" />
      <StepHeading
        title="Declarations and consent"
        description="Please read each statement carefully and confirm your agreement before signing."
      />

      <div className="space-y-3 mb-8">
        {agreements.map((ag) => (
          <div
            key={ag.id}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: ag.status === 'signed' ? 'rgba(124, 201, 14, 0.40)' : '#E5E7EB',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ backgroundColor: ag.status === 'signed' ? '#F8FEEB' : '#F9FAFB' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#182026' }}>{ag.title}</p>
              {ag.status === 'signed' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
              ) : (
                <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Not yet confirmed</span>
              )}
            </div>
            <div className="px-5 py-4" style={{ borderTop: '1px solid #F1F3F7' }}>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{ag.body}</p>
              {ag.status !== 'signed' && (
                <button
                  onClick={() => signAgreement(ag.id)}
                  className="mt-4 text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#473FE6', color: '#ffffff' }}
                >
                  I confirm and agree
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <CheckboxRow
          label="I confirm all information I have provided is accurate"
          description="I understand that providing false or misleading information may invalidate my application."
          checked={d.declarationConfirmed}
          onChange={(v) => setField('declarationConfirmed', v)}
        />
        <CheckboxRow
          label="I consent to my data being processed"
          description="For the purposes of assessing this mortgage application, including credit checks and sharing with lenders."
          checked={d.consentConfirmed}
          onChange={(v) => setField('consentConfirmed', v)}
        />
      </div>

    </div>
  );
}

// ─── 13. Agreements — Signature ─────────────────────────────────────────────

function AGSignatureStep() {
  const { state, setField, completeStep, goToPrevStep } = useApplication();
  const { triggerActivity } = useActivityStream();
  const d = state.data;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Your Name';

  // Use proper footer integration
  useStepFooter(() => {
    saveSignature();
  }, 'Save Signature');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Set drawing style
    ctx.strokeStyle = '#182026';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [signatureMode]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
    setSignatureSaved(false);
  };

  const saveSignature = () => {
    triggerActivity('identity_check');
    setSignatureSaved(true);
    setField('signatureConfirmed', true);
    
    // After a short delay, proceed to next step
    setTimeout(() => {
      completeStep('ag_signature');
    }, 1500);
  };

  const canSave = signatureMode === 'draw' 
    ? hasDrawnSignature 
    : d.signatureText.trim().length > 0;

  return (
    <div>
      <SectionLabel text="Agreements — 2 of 2" />
      <StepHeading
        title="Create Your Signature"
        description="This signature will be used to sign all legal documents in your application."
      />

      {/* Tab Switcher */}
      <div
        className="flex rounded-full p-1 mb-6"
        style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}
      >
        <button
          onClick={() => setSignatureMode('draw')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all"
          style={{
            backgroundColor: signatureMode === 'draw' ? '#ffffff' : 'transparent',
            color: signatureMode === 'draw' ? '#182026' : '#6B7280',
            boxShadow: signatureMode === 'draw' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <PenLine className="w-4 h-4" />
          Draw
        </button>
        <button
          onClick={() => setSignatureMode('type')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all"
          style={{
            backgroundColor: signatureMode === 'type' ? '#ffffff' : 'transparent',
            color: signatureMode === 'type' ? '#182026' : '#6B7280',
            boxShadow: signatureMode === 'type' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Type className="w-4 h-4" />
          Type
        </button>
      </div>

      {/* Draw Mode */}
      {signatureMode === 'draw' && (
        <div className="mb-4">
          <div
            className="relative rounded-lg overflow-hidden mb-3"
            style={{
              border: '2px dashed #D1D5DB',
              backgroundColor: '#ffffff',
              minHeight: '200px',
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair touch-none"
              style={{ height: '200px' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <button
            onClick={clearCanvas}
            className="text-sm font-medium"
            style={{ color: '#473FE6' }}
          >
            Clear & redraw
          </button>
        </div>
      )}

      {/* Type Mode */}
      {signatureMode === 'type' && (
        <div className="mb-4">
          <div
            className="relative overflow-hidden mb-3"
            style={{
              borderRadius: '8px',
              border: '2px dashed #D1D5DB',
              backgroundColor: '#ffffff',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {d.signatureText ? (
              <p
                className="text-4xl"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  color: '#182026',
                }}
              >
                {d.signatureText}
              </p>
            ) : (
              <p className="text-muted-foreground font-medium">
                Your signature will appear here
              </p>
            )}
          </div>
          <input
            type="text"
            value={d.signatureText}
            onChange={(e) => setField('signatureText', e.target.value)}
            placeholder={fullName}
            className="w-full px-4 py-3 border text-sm transition-colors outline-none focus:border-[#473FE6] focus:ring-2 focus:ring-[#473FE6]/20"
            style={{
              borderRadius: '8px',
              borderColor: 'hsl(220 15% 90%)',
              backgroundColor: '#ffffff',
              color: '#182026',
            }}
          />
        </div>
      )}

      {/* Security Notice */}
      <div
        className="flex items-start gap-3 p-4 mb-8"
        style={{ borderRadius: '8px', backgroundColor: '#F0F5FF', border: '1px solid #DBEAFE' }}
      >
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#473FE6' }} />
        <p className="text-sm font-medium" style={{ color: '#1E40AF' }}>
          Your signature is encrypted and stored securely. It will only be applied when you explicitly sign a document.
        </p>
      </div>

      {/* Saved Confirmation */}
      {signatureSaved && (
        <div
          className="flex items-center gap-3 rounded-lg p-4"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: '#16A34A' }} />
          <p className="text-sm font-medium" style={{ color: '#166534' }}>
            Your signature has been saved securely.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── 14. Completion ───────────────────────────────────────────────────────────

function CompletionStep() {
  const { state, closeModal, canSubmit } = useApplication();
  const { setFooter } = useFormFooter();

  // No Continue button on the completion screen — submit is handled inline
  useEffect(() => {
    setFooter('', () => {});
  }, []);

  const sections = state.sections.filter((s) => s.id !== 'collect_keys');
  const completedSections = sections.filter((s) => s.status === 'complete');
  const incompleteSections = sections.filter((s) => s.status !== 'complete');

  return (
    <div>
      <SectionLabel text="Completion" />
      <div className="mb-10">
        {canSubmit ? (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: '#F0FBDF' }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: '#3C6006' }} />
            </div>
            <h1
              className="font-display font-medium text-balance leading-tight mb-3"
              style={{ fontSize: '2rem', color: '#182026' }}
            >
              Your application is ready
            </h1>
            <p className="text-base text-muted-foreground font-medium leading-relaxed">
              All sections are complete. Review your summary below and submit when you are ready.
            </p>
          </>
        ) : (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: '#FFF6EA' }}
            >
              <AlertCircle className="w-7 h-7" style={{ color: '#E07900' }} />
            </div>
            <h1
              className="font-display font-medium text-balance leading-tight mb-3"
              style={{ fontSize: '2rem', color: '#182026' }}
            >
              Almost there
            </h1>
            <p className="text-base text-muted-foreground font-medium leading-relaxed">
              A few sections still need to be completed before you can submit.
            </p>
          </>
        )}
      </div>

      {/* Section summary */}
      <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid #F1F3F7' }}>
        {sections.map((section, i) => (
          <div
            key={section.id}
            className="flex items-center gap-4 px-5 py-3.5"
            style={{
              borderTop: i > 0 ? '1px solid #F1F3F7' : 'none',
              backgroundColor: '#ffffff',
            }}
          >
            {section.status === 'complete' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
            ) : (
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#F1F3F7', border: '1px solid #E5E7EB' }}
              />
            )}
            <p
              className="text-sm flex-1"
              style={{
                color: section.status === 'complete' ? '#182026' : '#9CA3AF',
                fontWeight: '600',
              }}
            >
  {section.id === 'welcome' ? 'Welcome' :
  section.id === 'about_you' ? 'About You' :
  section.id === 'property_mortgage' ? 'Property & Mortgage' :
  section.id === 'employment_income' ? 'Employment & Income' :
  section.id === 'documents' ? 'Documents' :
  section.id === 'agreements' ? 'Agreements' :
  section.id === 'collect_keys' ? 'Collect Your Keys' : section.id}
            </p>
            {section.status === 'complete' ? (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#F0FBDF', color: '#3C6006' }}
              >
                Complete
              </span>
            ) : (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#F1F3F7', color: '#9CA3AF' }}
              >
                Incomplete
              </span>
            )}
          </div>
        ))}
      </div>

      {canSubmit ? (
        <div className="flex items-center gap-4">
          <button
            onClick={closeModal}
            className="inline-flex items-center gap-2 font-semibold text-sm px-8 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ backgroundColor: '#473FE6', color: '#ffffff' }}
          >
            Submit application
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={closeModal}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Save and return later
          </button>
        </div>
      ) : (
        <button
          onClick={closeModal}
          className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ backgroundColor: '#473FE6', color: '#ffffff' }}
        >
          Return to overview
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

export function FormStepRenderer() {
  const { currentStep } = useApplication();

  switch (currentStep) {
    // Welcome & Orientation
    case 'welcome':              return <WelcomeStep />;
    case 'orientation':          return <OrientationStep />;
    
    // Section Intro Steps
    case 'intro_about_you':      return <IntroAboutYouStep />;
    case 'intro_property_mortgage': return <IntroPropertyMortgageStep />;
    case 'intro_employment_income': return <IntroEmploymentIncomeStep />;
    case 'intro_documents':      return <IntroDocumentsStep />;
    case 'intro_agreements':     return <IntroAgreementsStep />;
    
    // Identity Section
    case 'id_name':              return <IdNameStep />;
    case 'id_dob':               return <IdDobStep />;
    case 'id_contact':           return <IdContactStep />;
    case 'id_nationality':       return <IdNationalityStep />;
    case 'id_ni_pps':            return <IdNiPpsStep />;
    case 'id_address':           return <IdAddressStep />;
    case 'id_address_history':   return <IdAddressHistoryStep />;
    case 'id_upload_photo':      return <IdUploadPhotoStep />;
    
    // Household Section
    case 'hh_circumstances':     return <HhCircumstancesStep />;
    case 'hh_application_mode':  return <HhApplicationModeStep />;
    case 'hh_second_applicant':  return <HhSecondApplicantStep />;
    case 'hh_second_applicant_contact': return <HhSecondApplicantContactStep />;
    case 'hh_upload_joint_id':   return <HhUploadJointIdStep />;
    case 'hh_dependants':        return <HhDependantsStep />;
    
    // Intent Section
    case 'intent_type':          return <IntentTypeStep />;
    case 'intent_remortgage':    return <IntentRemortgageStep />;
    case 'intent_upload_mortgage': return <IntentUploadMortgageStep />;
    case 'intent_btl':           return <IntentBtlStep />;
    case 'intent_upload_rental': return <IntentUploadRentalStep />;
    case 'intent_timeline':      return <IntentTimelineStep />;
    
    // Property Section
    case 'prop_stage':           return <PropStageStep />;
    case 'prop_details':         return <PropDetailsStep />;
    case 'prop_value':           return <PropValueStep />;
    
    // Employment Section
    case 'emp_status':           return <EmpStatusStep />;
    case 'emp_details':          return <EmpDetailsStep />;
    case 'emp_self_employed':    return <EmpSelfEmployedStep />;
    case 'emp_upload_payslips':  return <EmpUploadPayslipsStep />;
    case 'emp_upload_tax':       return <EmpUploadTaxStep />;
    case 'emp_second_applicant': return <EmpSecondApplicantStep />;
    case 'emp_upload_joint':     return <EmpUploadJointStep />;
    
    // Income Section
    case 'inc_salary':           return <IncSalaryStep />;
    case 'inc_additional':       return <IncAdditionalStep />;
    case 'inc_second_applicant': return <IncSecondApplicantStep />;
    case 'inc_upload_bank':      return <IncUploadBankStep />;
    case 'inc_upload_joint_bank': return <IncUploadJointBankStep />;
    
    // Commitments Section
    case 'commit_outgoings':     return <CommitOutgoingsStep />;
    case 'commit_childcare':     return <CommitChildcareStep />;
    
    // Deposit Section
    case 'dep_amount':           return <DepAmountStep />;
    case 'dep_source':           return <DepSourceStep />;
    case 'dep_gift_details':     return <DepGiftDetailsStep />;
    case 'dep_upload_gift':      return <DepUploadGiftStep />;
    case 'dep_upload_giftor':    return <DepUploadGiftorStep />;
    
    // Documents (main upload area - preserved)
    case 'docs_overview':        return <DocsOverviewStep />;
    
    // Agreements
    case 'ag_declarations':      return <AGDeclarationsStep />;
    case 'ag_signature':         return <AGSignatureStep />;
    
    // Completion
    case 'completion':           return <CompletionStep />;
    
    // LEGACY: Financial Profile steps (for backwards compatibility)
    case 'fp_name':              return <FPNameStep />;
    case 'fp_dob':               return <FPDobStep />;
    case 'fp_contact':           return <FPContactStep />;
    case 'fp_circumstances':     return <FPCircumstancesStep />;
    case 'fp_address':           return <FPAddressStep />;
    case 'fp_address_history':   return <FPAddressHistoryStep />;
    case 'fp_employment_status': return <FPEmploymentStatusStep />;
    case 'fp_employment_details':return <FPEmploymentDetailsStep />;
    case 'fp_income':            return <FPIncomeStep />;
    case 'fp_outgoings':         return <FPOutgoingsStep />;
    case 'fp_deposit':           return <FPDepositStep />;
    case 'fp_goals':             return <FPGoalsStep />;
    case 'hh_stage':             return <HHStageStep />;
    case 'hh_property':          return <HHPropertyStep />;
    
    default:                     return null;
  }
}
