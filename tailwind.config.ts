import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        neumorphic: ['var(--font-neumorphic)', 'system-ui', 'sans-serif'],
      },
      // Override default font weights to enforce minimum of 500 (medium)
      fontWeight: {
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      colors: {
        /* Core / Neutral */
        background: {
          DEFAULT: 'hsl(var(--background))',
          subtle: 'hsl(var(--background-subtle))',
        },
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--card))',
          subtle: 'hsl(var(--surface-subtle))',
          muted: 'hsl(var(--surface-muted))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Brand / Interactive */
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          soft: 'hsl(var(--primary-soft))',
          medium: 'hsl(var(--primary-medium))',
        },
        brand: {
          text: 'hsl(var(--brand-text))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        /* Semantic States */
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          text: 'hsl(var(--success-text))',
          bg: 'hsl(var(--success-bg))',
          'bg-strong': 'hsl(var(--success-bg-strong))',
          border: 'hsl(var(--success-border))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          text: 'hsl(var(--warning-text))',
          bg: 'hsl(var(--warning-bg))',
          'bg-strong': 'hsl(var(--warning-bg-strong))',
          border: 'hsl(var(--warning-border))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          text: 'hsl(var(--destructive-text))',
          bg: 'hsl(var(--destructive-bg))',
          'bg-strong': 'hsl(var(--destructive-bg-strong))',
          border: 'hsl(var(--destructive-border))',
        },
        /* Accent Colors */
        violet: {
          DEFAULT: 'hsl(var(--accent-violet))',
          soft: 'hsl(var(--accent-violet-soft))',
          text: 'hsl(var(--accent-violet-text))',
        },
        linen: {
          DEFAULT: 'hsl(var(--accent-linen))',
          soft: 'hsl(var(--accent-linen-soft))',
        },
        /* Chrome */
        border: {
          DEFAULT: 'hsl(var(--border))',
          strong: 'hsl(var(--border-strong))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        // Layer elevation system
        'layer-0': 'none',
        'layer-1': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'layer-2': '0 6px 16px rgba(0, 0, 0, 0.08)',
        'layer-3': '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        // Inset for pressed states
        'inset-subtle': 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        // Legacy tokens (for backwards compatibility)
        card: '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 6px 16px rgba(0, 0, 0, 0.08)',
        'focus-ring': '0 0 0 3px hsl(var(--ring) / 0.2)',
      },
      // Interaction timing
      transitionDuration: {
        '80': '80ms',
        '120': '120ms',
      },
      transitionTimingFunction: {
        'ease-out-interaction': 'ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
