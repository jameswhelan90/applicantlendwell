# UX/UI Review — Lendwell Applicant Portal
**Site:** https://applicantlendwell.vercel.app  
**Reference:** *Practical UI* by Adham Dannaway  
**Date:** April 2026

---

## Summary

The application has a strong structural foundation: a clear two-column layout, a well-defined colour system, good accessibility attributes, and thoughtful progressive disclosure in the task flow. The issues below are mostly polish and consistency fixes rather than structural reworks.

---

## 1. Typography — Three Typefaces in Use

**Issue:** The app loads three typefaces: `NeuSans` (display headings), `Satoshi` (body), and `Poppins` (loaded via Google Fonts as `--font-neumorphic`). Practical UI recommends a maximum of two typefaces — one primary, one for headings if needed. Three typefaces adds visual noise, increases page weight, and risks inconsistency.

**Evidence in code:** `app/layout.tsx` imports Poppins via `next/font/google` but `globals.css` declares both NeuSans and Satoshi as the primary fonts. Poppins is assigned to `--font-neumorphic` but does not appear to be the font actually rendering.

**Fix:** Remove the Poppins import from `app/layout.tsx` entirely. Use NeuSans for display/headings and Satoshi for all body copy. Delete the `neuSans` variable and its class from the `<body>` tag.

---

## 2. Inline Hardcoded Colours Bypassing the Design System

**Issue:** Components extensively use hardcoded hex values in inline `style={{}}` props (e.g. `color: '#182026'`, `backgroundColor: '#3126E3'`, `color: '#5A7387'`) rather than the CSS variables defined in `globals.css`. This creates a maintenance risk — changing a brand colour requires a global find-and-replace instead of a single variable update. It also makes it easy for one-off values to drift from the system.

**Examples:** `components/actions/BlockingIssuesPanel.tsx`, `components/progress/JourneyTracker.tsx`, `app/page.tsx` — all use direct hex values extensively.

**Fix:** Replace inline hex values with Tailwind utility classes mapped to the CSS variables already defined (e.g. `text-foreground`, `bg-primary`, `text-muted-foreground`). Where Tailwind classes don't exist, add them to `tailwind.config.ts` using the existing CSS variable names.

---

## 3. Uppercase "YOUR JOURNEY" Label

**Issue:** The sidebar navigation renders a `YOUR JOURNEY` label in full uppercase with `textTransform: 'uppercase'`. Practical UI (Chapter 6: Copywriting) specifically advises against this — uppercase interrupts reading flow and increases cognitive load. It's also grammatically unnecessary given the label already provides context.

**Evidence:** `components/progress/JourneyTracker.tsx` line with `textTransform: 'uppercase'`.

**Fix:** Change to sentence case: `"Your journey"` and remove `textTransform: 'uppercase'` and `letterSpacing: '0.06em'`.

---

## 4. Potential Contrast Failure on Warning Text

**Issue:** The `BlockingIssuesPanel` applies `opacity: 0.8` to the warning sub-text (`color: '#653701'` at 80% opacity). WCAG 2.1 AA requires 4.5:1 contrast for small text. Reducing opacity on already-muted text risks failing this threshold against the `#FFF6EA` warning background.

**Fix:** Remove the `opacity: 0.8` and instead use a slightly lighter fixed colour value for the secondary warning text (e.g. `#7A4502`), which maintains hierarchy without risking contrast failure.

---

## 5. Hardcoded User Initials in Header

**Issue:** The header avatar displays hardcoded initials `"SM"` and name `"Sarah Murphy"`. This is a placeholder that hasn't been connected to real user data. Users will see someone else's name, which erodes trust — especially critical in a financial application.

**Evidence:** `app/page.tsx` — the avatar `div` and `<span>` both contain static strings.

**Fix:** Pull the user's name from application state (or an auth context). Derive initials dynamically. If no auth layer exists yet, at minimum remove the static name and show a generic avatar icon until authentication is implemented.

---

## 6. Chat Panel Obscures Content on Mobile

**Issue:** The floating chat button and panel are `fixed` positioned. On smaller viewports, when the chat panel is open it covers a significant portion of the main content area. The book emphasises keeping important content visible and not having UI elements compete with the primary task (filling in the application).

**Evidence:** `components/chat/FloatingChat.tsx` — the panel is fixed bottom-right with a set width and no responsive adjustment for small screens.

**Fix:** On screens below `lg`, make the chat panel take up the full viewport width (already close to this) and ensure the panel can be dismissed easily. Consider adding a semi-transparent backdrop on mobile so users can tap outside to close it.

---

## 7. Mobile Sidebar Duplication

**Issue:** The journey tracker sidebar appears twice on mobile — once in the main content column (below the task list) and once inside the documents section. Practical UI advises removing repeated or unnecessary elements to reduce cognitive load.

**Evidence:** `app/page.tsx` — `<JourneyTracker />` is rendered twice: once inside a `lg:hidden` div after the `TaskList`, and again inside another `lg:hidden` div for the documents view.

**Fix:** Consolidate into a single mobile sidebar instance. Either use a sticky bottom navigation strip for mobile, or a single conditionally rendered tracker at the bottom of the page regardless of the selected section.

---

## 8. "Ask LendWell" Button Visibility in Modal

**Issue:** Inside the form modal (`ApplicationFormModal.tsx`), the "Ask LendWell" button in the header uses `backgroundColor: 'transparent'` in its default state, making it blend into the header. Its active state (when chat is open) turns it indigo. The inactive state lacks sufficient visual affordance — users may not notice it's interactive.

**Fix:** Give the inactive state a subtle background (e.g. the `--primary-soft` fill `#EDECFD`) and keep the indigo text colour. This follows the book's principle of using brand colour on interactive elements to signal clickability without requiring the full filled state.

---

## 9. Progress Score Has No Visual Explanation

**Issue:** The `TaskList` component calculates a `readinessScore` and shows encouraging headings like "More than halfway there!" but there's no visible percentage or bar that tells users precisely where they stand. Users in a financial application context want concrete progress feedback.

**Fix:** Add a small progress bar or percentage indicator (e.g. `62% complete`) beneath the encouraging heading in `TaskList`. The visual should use the existing `--primary` colour and the data is already available via `readinessScore`.

---

## 10. Form Steps Have No Visible Back-Navigation on First Step

**Issue:** In `ApplicationFormModal.tsx`, the back arrow is hidden on the first step (`isFirstStep`). This is correct, but there is no alternative affordance explaining to the user they are at the beginning. Users who open the modal unexpectedly (e.g. clicking the wrong section) have only the `X` close button — which closes the modal entirely rather than taking them back to the overview.

**Fix:** On the first step, replace the hidden back arrow with a "← Back to overview" text link that closes the modal and returns to the dashboard. This gives users a clear mental model that the modal sits *above* the dashboard, not instead of it.

---

## Minor Notes

- **Sentence case on CTAs:** Some button labels use title case ("Start Application", "Continue to Documents"). Prefer sentence case throughout ("Start application", "Continue to documents") per Practical UI Chapter 6.
- **`collect_keys` section name:** This internal identifier surfaces in some user-facing strings. Rename to something applicant-friendly (e.g. `submit` or `final_step`) so it reads naturally if it ever appears in UI copy.
- **`max-w-3xl` / `max-w-6xl` switching:** The documents section expands to `max-w-6xl` while all other sections use `max-w-3xl`. This width jump is abrupt on large screens. Consider a smoother `max-w-5xl` for documents to reduce the jarring layout shift when switching sections.
