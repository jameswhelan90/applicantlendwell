'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressSuggestion {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (address: string, postcode?: string) => void;
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'Start typing your address…',
  hint,
  autoFocus,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selected, setSelected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync if parent value changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        format: 'json',
        addressdetails: '1',
        limit: '6',
        countrycodes: 'ie,gb',
        q,
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: abortRef.current.signal,
          headers: { 'Accept-Language': 'en', 'User-Agent': 'LendWell/1.0' },
        }
      );
      const data: AddressSuggestion[] = await res.json();
      // Filter to results that have a road (skip country/region-level hits)
      const filtered = data.filter(
        (d) => d.address.road || d.address.house_number
      );
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setSelected(false);
    onChange(q); // keep parent in sync while typing

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 320);
  };

  const handleSelect = (s: AddressSuggestion) => {
    const a = s.address;
    // Build a clean single-line address
    const parts = [
      a.house_number,
      a.road,
      a.suburb || a.village,
      a.city || a.town,
      a.county,
    ].filter(Boolean);
    const formatted = parts.join(', ');
    setQuery(formatted);
    setSelected(true);
    setIsOpen(false);
    onChange(formatted, a.postcode);
    inputRef.current?.blur();
  };

  const displayName = (s: AddressSuggestion) => {
    // Shorten to the first 3–4 meaningful parts
    const parts = s.display_name.split(', ');
    return parts.slice(0, 4).join(', ');
  };

  return (
    <div ref={containerRef} className="mb-5 relative">
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#182026' }}>
        {label}
      </label>
      {hint && <p className="text-xs font-medium mb-2" style={{ color: '#5A7387' }}>{hint}</p>}

      <div className="relative">
        <MapPin
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: selected ? '#3126E3' : '#9CA3AF' }}
        />
        <input
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-3 rounded-lg text-sm font-medium transition-all outline-none"
          style={{
            backgroundColor: isFocused ? '#ffffff' : '#EDEFF3',
            color: '#182026',
            boxShadow: isFocused ? '0 0 0 2px #3126E3' : 'none',
            border: 'none',
          }}
        />
        {isLoading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin"
            style={{ color: '#3126E3' }}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 24px rgba(24,32,38,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid #F1F3F7' : 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#5A7387' }} />
              <span className="text-sm font-medium leading-snug" style={{ color: '#182026' }}>
                {displayName(s)}
              </span>
            </button>
          ))}
          <div
            className="px-4 py-2 flex items-center gap-1.5"
            style={{ backgroundColor: '#F7F8FC', borderTop: '1px solid #F1F3F7' }}
          >
            <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
              Powered by OpenStreetMap
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
