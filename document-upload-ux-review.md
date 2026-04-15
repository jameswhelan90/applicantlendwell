# Document Upload UX/UI Review — Lendwell Applicant Portal
**Scope:** `components/documents/`, `constants/documentMessages.ts`, `types/tasks.ts`  
**Goal:** World-class document upload experience for UK/Ireland mortgage applicants  
**Reviewer role:** Senior product designer  

---

## Context for Claude Code

This review covers the document upload section at `/documents` in the Lendwell mortgage portal. The system has a solid technical foundation — dynamic document filtering, AI scan simulation, extracted field display, bulk drag-and-drop, per-document accordions, and a bottom action bar. The issues below are primarily about clarity, feedback quality, trust, and the resolution flow when things go wrong. Fix these and the experience becomes genuinely best-in-class.

The issues are ordered by user impact. Treat Priority 1 items as blockers to a great experience.

---

## Priority 1 — Critical Experience Gaps

### Issue 1: Issue messages are generic and leave users stuck

**Problem:** When a document scan fails, the issue message is hardcoded to one generic string: `"Document appears to be expired or unclear. Please upload a clearer copy."` This is set in `DocumentsUploadSection.tsx` `handleUpload()` via `Math.random() < 0.15`. Mortgage applicants are anxious by default. A vague error on a financial document causes real distress and kills completion rates.

**What should happen:** Issue messages must be specific, human, and actionable — and different per document type. Additionally, there is no explicit re-upload CTA. The user sees an orange alert but has to intuit that they can drop a new file over the existing one.

**Fix:**

1. In `constants/documentMessages.ts`, add an `AI_ISSUE_MESSAGES` map with specific per-document issue messages:

```ts
export const AI_ISSUE_MESSAGES: Record<string, string[]> = {
  'req-passport': [
    'The document appears to be expired — your passport must be valid.',
    'We couldn't read the photo page clearly. Please re-scan in better light.',
  ],
  'req-proof-of-address': [
    'This document is dated more than 3 months ago. Please upload a more recent one.',
    'The address on this document doesn't match what you entered in your application.',
  ],
  'req-payslips': [
    'This payslip appears to be more than 3 months old. Lenders require your 3 most recent payslips.',
    'We couldn't verify the employer name on this payslip. Please ensure it's your most recent payslip.',
  ],
  'req-p60': [
    'This P60 doesn't appear to be from the most recent tax year.',
    'We couldn't read the income figures clearly. Please upload a higher quality scan.',
  ],
  'req-bank-statements': [
    'This statement doesn't cover a full calendar month. Lenders need 3 complete months.',
    'The account holder name doesn't match your application. Please check you've uploaded the correct statement.',
  ],
  'req-sa302': [
    'This SA302 appears to be from more than 3 years ago. Lenders need the last 2–3 years.',
    'We couldn't verify this as an official HMRC document. Please download directly from HMRC online.',
  ],
  'req-deposit-proof': [
    'The account balance shown is lower than the deposit amount in your application.',
    'This statement is more than 3 months old. Lenders need a current statement.',
  ],
  'req-gift-letter': [
    'The gift letter must be signed by the donor. Please ask them to sign and re-upload.',
    'The gift letter doesn't state that the funds are non-repayable. This is a lender requirement.',
  ],
  // ... add for all document types
};
```

2. In `DocumentsUploadSection.tsx` `handleUpload()`, select a random message from the relevant document's issue array.

3. In `DocumentAccordionItem`, when status is `issue`, add an explicit **"Replace document"** button below the issue alert (not just the implicit drop zone). It should be a clear secondary button: `<button onClick={() => fileInputRef.current?.click()}>Replace document</button>`.

---

### Issue 2: Verified state doesn't show extracted fields

**Problem:** `InlineDocumentPrompt` shows a beautiful extracted-fields grid after verification (passport number, name, DOB, salary, etc.) — this is the "wow" moment that proves AI is doing real work. But `DocumentAccordionItem` — the component used for the main document list — only shows `"Document verified successfully"`. The extracted data exists in `requirement.extractedFields` but is never rendered in the accordion view.

**Fix:** In `DocumentAccordionItem`, after the success message, add the same extracted fields grid used in `InlineDocumentPrompt`. Create a shared `<ExtractedFieldsGrid fields={requirement.extractedFields} />` component and use it in both places. Add the `DEMO_EXTRACTED_FIELDS` map entries for all document types in `constants/documentMessages.ts`. This is the single highest-trust-building moment in the entire upload experience — don't hide it.

---

### Issue 3: Self-employed users see employed-only documents (condition matching bug)

**Problem:** In `DocumentsUploadSection.tsx`, payslips and P60 have this condition:

```ts
conditions: [{ field: 'employmentStatus', values: ['employed', 'Employed', ''] }]
```

The condition check uses `String(fieldValue).toLowerCase().includes(v.toLowerCase())`. The value `'self-employed'` includes the substring `'employed'`, so self-employed users will see payslip and P60 requirements — documents they cannot provide.

**Fix:** Change the condition matching from `includes()` to exact match:

```ts
// In filteredCategories useMemo, change:
return condition.values.some(v =>
  String(fieldValue).toLowerCase().includes(v.toLowerCase())
);

// To:
return condition.values.some(v =>
  String(fieldValue).toLowerCase().trim() === v.toLowerCase().trim()
);
```

Then update the condition values to be exact: remove `''` as a default-show mechanism and instead handle the "no employment status yet" case by showing all income categories until the field is filled (explicit null check).

---

### Issue 4: No completion progress indicator at the top of the page

**Problem:** The `completedDocs / requiredDocs` calculation exists in the component but the result is only shown per-category (e.g., "1/2 complete" on each section header). There is no top-level summary showing overall progress. A mortgage applicant with 12 required documents who has uploaded 4 has no clear sense of where they stand.

**Fix:** Add a sticky summary bar at the top of `DocumentsUploadSection`, below the main page header. It should show:

- A progress bar: `completedDocs.length / requiredDocs.length * 100%`
- Text: `"4 of 12 required documents verified"` 
- A secondary line when there are issues: `"2 documents need attention"` in orange
- When complete: `"All required documents verified — your application is ready to progress"` in green

This bar should update reactively. Use the existing colour tokens: `--primary` for the bar fill, `--success` for the complete state.

---

### Issue 5: Bulk upload sorting animation is invisible where it matters

**Problem:** During bulk upload, the entire document list is dimmed to `opacity: 0.3` and the sorting progress appears only in the BulkDropZone header. Users' eyes follow the list — they want to see which document slot each file is going into. The current animation (a subtle `translateX` on the file row in the drop zone header) doesn't visually connect uploaded files to their assigned slots in the list below.

**Fix:** 

1. Remove the `opacity: 0.3` dim on the document list during upload. Instead, animate individual accordion items:
   - When a file is being assigned to a document slot, that document's accordion row should pulse with a blue highlight (`backgroundColor: '#EDECFD'`) and show an inline status "Sorting..." with a spinner.
   - When the file is confirmed for that slot, the row animates to the `uploading` state immediately — giving the user visual confirmation of the AI's decision.

2. The BulkDropZone header can still show the file list for files that haven't been assigned yet, but the primary feedback should be in the list rows, not a separate panel above them.

---

## Priority 2 — Significant UX Improvements

### Issue 6: `needs_update` status is visually identical to `issue`

**Problem:** `RequirementStatus` has both `issue` (something was wrong with the document) and `needs_update` (the document was valid but has become stale — e.g., a proof of address uploaded 4 months ago). Both render with the same orange warning badge and `AlertCircle` icon. These are meaningfully different situations: one requires a different document, the other requires a fresher version of the same one.

**Fix:** 

- `issue` → orange `AlertCircle` with message "Issue found" (current)
- `needs_update` → amber `Clock` icon with message "Out of date" 

For `needs_update`, the accordion content should say something like: *"This document was uploaded 4 months ago. Proof of address must be dated within the last 3 months. Please upload a more recent copy."* and include an explicit re-upload button.

Also add staleness logic: in `ApplicationContext.tsx`, add a `useEffect` that runs on mount and scans all requirements with `uploadedAt` set. If `Date.now() - new Date(uploadedAt).getTime() > 90 * 24 * 60 * 60 * 1000` (90 days) and the document type is time-sensitive (proof of address, bank statements, payslips), mark it as `needs_update` with an appropriate message.

---

### Issue 7: The document list doesn't explain why each document is needed

**Problem:** Descriptions like *"Utility bill or bank statement dated within 3 months"* tell applicants what to upload but not why lenders need it. For a first-time buyer, the requirement for 3 months of bank statements or a P60 can feel invasive. Anxiety at this stage causes drop-off.

**Fix:** Add a `why` field to `DocumentDefinition` (alongside the existing `description`):

```ts
interface DocumentDefinition {
  // ...existing fields
  why?: string; // Shown in expanded accordion state
}
```

Example values:
- Payslips: `"Lenders use your payslips to confirm your income is stable and matches what you've declared."`
- Bank statements: `"Lenders review 3 months of transactions to assess your spending habits and verify your salary is being paid regularly."`
- Gift letter: `"If part of your deposit is a gift, lenders need written confirmation it doesn't need to be repaid, as this affects your affordability."`

Show the `why` text in the expanded accordion state, above the drop zone, in muted text. This is not noise — it's trust-building context that reduces support queries.

---

### Issue 8: Joint application documents are missing from the document list

**Problem:** `types/tasks.ts` and `constants/documentMessages.ts` include entries for second-applicant documents (`req-joint-payslips`, `req-joint-bank-statements`, `req-joint-passport`) but `documentCategories` in `DocumentsUploadSection.tsx` contains no joint application category. If `applicationMode === 'joint'` (set in the form), the second applicant's documents are simply never requested.

**Fix:** Add a `joint-applicant` category to `documentCategories`:

```ts
{
  id: 'joint-applicant',
  title: 'Second applicant documents',
  description: 'Supporting documents for your co-applicant',
  icon: Users,  // add to imports
  documents: [
    {
      id: 'req-joint-passport',
      title: 'Co-applicant photo ID',
      description: 'Valid passport or driving licence for your co-applicant',
      acceptableDocuments: ['Passport', 'Driving licence'],
      required: true,
      conditions: [{ field: 'applicationMode', values: ['joint'] }],
    },
    {
      id: 'req-joint-payslips',
      title: 'Co-applicant payslips',
      description: 'Last 3 months of consecutive payslips',
      acceptableDocuments: ['Payslip PDF', 'Payslip image'],
      required: true,
      conditions: [
        { field: 'applicationMode', values: ['joint'] },
        { field: 'secondApplicantEmploymentStatus', values: ['employed', 'Employed'] },
      ],
    },
    {
      id: 'req-joint-bank-statements',
      title: 'Co-applicant bank statements',
      description: 'Last 3 months from co-applicant\'s main account',
      acceptableDocuments: ['Bank statement PDF'],
      required: true,
      conditions: [{ field: 'applicationMode', values: ['joint'] }],
    },
  ],
}
```

---

### Issue 9: Remortgage applicants are missing key documents

**Problem:** The `buyerType` field distinguishes remortgage applicants but the document list has no remortgage-specific category. Remortgage applicants need: current mortgage statement, redemption statement, and potentially a property valuation report. Without these, a remortgage application cannot progress.

**Fix:** Add a `remortgage` category:

```ts
{
  id: 'remortgage',
  title: 'Remortgage documents',
  description: 'Documents relating to your existing mortgage',
  icon: Home,
  documents: [
    {
      id: 'req-mortgage-statement',
      title: 'Current mortgage statement',
      description: 'Most recent annual mortgage statement from your current lender',
      acceptableDocuments: ['Mortgage statement', 'Annual statement'],
      required: true,
      conditions: [{ field: 'buyerType', values: ['remortgage'] }],
    },
    {
      id: 'req-redemption-statement',
      title: 'Redemption statement',
      description: 'Up-to-date redemption figure from your lender (valid 30 days)',
      acceptableDocuments: ['Redemption statement'],
      required: false,
      conditions: [{ field: 'buyerType', values: ['remortgage'] }],
    },
  ],
}
```

---

### Issue 10: Scan completion has no user notification

**Problem:** When a document transitions from `reviewing` to `verified` or `issue`, there is no toast or alert to the user if they've scrolled away or are in another part of the app. The `AIActivityIndicator` in the header shows a spinner during activity, but when it stops there's no "✓ Payslips verified" confirmation that pulls attention.

**Fix:** In `ApplicationContext.tsx`, when `updateRequirementStatus` transitions a document to `verified` or `issue`, dispatch a toast notification. Add a lightweight toast system (or use the existing `AIActivityIndicator` pattern) to show:

- Verified: `"✓ [Document name] verified"` — green, auto-dismiss after 4 seconds  
- Issue: `"⚠ Issue with [Document name] — action needed"` — orange, stays until dismissed, links to the relevant accordion item (smooth scroll + auto-expand)

For the issue toast specifically: clicking it should scroll the user to the relevant accordion item and expand it. This is the most important navigation flow in the whole experience — an applicant who uploaded and moved on needs to be brought back precisely to the problem.

---

### Issue 11: Optional documents have no value explanation

**Problem:** Optional documents display as `"Optional"` badge in grey. Users don't know whether uploading them will help their application, and the temptation is to ignore them entirely. In mortgage applications, optional documents like a bonus confirmation letter or rental income evidence can meaningfully strengthen the case.

**Fix:** Rename the badge from `"Optional"` to `"Can strengthen your case"` for documents that are conditional on income fields. For documents that are truly optional extras, use `"Recommended"`. The accordion expansion for optional docs should include a brief one-liner explaining the benefit: *"Uploading this can increase the income lenders will use in your affordability calculation."*

---

## Priority 3 — Polish and Trust Details

### Issue 12: Category icons are imported but hidden

**Problem:** In `CategorySection`, the icon container has `className="... hidden"`. The icons (`User`, `Briefcase`, `Building2`, `CreditCard`, `Home`, `Wallet`, etc.) are imported and wired up but never shown. Category headers currently have no visual anchor — they're just text.

**Fix:** Remove `hidden` from the icon container class. Size the icon circle at `w-9 h-9` with `backgroundColor: '#EEF0FD'` and the icon at `w-4 h-4` in indigo. This gives each category a distinct visual identity and helps users navigate the list faster (icons are scannable; text headings require reading).

---

### Issue 13: "Document verified successfully" is the same for every document

**Problem:** In `DocumentAccordionItem`, the success state always renders: `"Document verified successfully"`. The `AI_VERIFIED_MESSAGES` constant in `documentMessages.ts` has specific, meaningful per-document verified messages (e.g., *"Salary confirmed — income figures sent to your application"*) but they're not being used in the accordion view.

**Fix:** In `DocumentAccordionItem`, replace the hardcoded `"Document verified successfully"` string with `AI_VERIFIED_MESSAGES[doc.id] || 'Document verified successfully'`. This one-line change makes every successful scan feel purposeful and specific.

---

### Issue 14: Only one file is processed per upload slot despite `multiple` being set

**Problem:** `DocumentAccordionItem` accepts `multiple` files on its file input, and `handleUpload` in the parent receives a `FileList`, but the implementation only processes `files[0]`. For documents requiring multiple files (3 payslips, 3 bank statements), the user must upload three times — once per accordion open. The second and third files are silently discarded.

**Fix:** In `handleUpload`, when `files.length > 1`, process all files sequentially and show each as a separate uploaded file row within the accordion. The requirement status should only move to `verified` when the minimum required file count is reached (configurable per `DocumentDefinition` with a `minFiles?: number` field). For payslips, `minFiles: 3` — for a P60, `minFiles: 1`.

---

### Issue 15: The `DocumentCard` component is dead code

**Problem:** `DocumentCard` (~130 lines) is declared in `DocumentsUploadSection.tsx` with a comment `// keeping for reference` but is never rendered. It adds noise to the file and will confuse future developers.

**Fix:** Delete `DocumentCard`. If a grid layout view is ever needed, it can be rebuilt. If you want to keep it for reference, move it to a separate `DocumentCard.tsx` file and note it as a future variant.

---

### Issue 16: Mobile camera upload is not surfaced

**Problem:** The file inputs accept `image/*` which triggers camera on mobile. But this is not communicated anywhere in the UI — users on phones don't know they can photograph documents directly. Given that a significant portion of UK mortgage applicants will be on mobile, this is a missed conversion opportunity.

**Fix:** In the `DocumentAccordionItem` drop zone (the expanded state before upload), add a secondary CTA below the primary drop zone that only renders on touch devices (`@media (hover: none)`): 

```
📷 Take a photo  |  📁 Choose from library
```

Detect mobile via a `useMobile()` hook or media query and conditionally show this two-button row instead of / in addition to the drag-drop zone. Both buttons trigger the same file input but with different `capture` attributes.

---

### Issue 17: The bulk upload and individual upload paradigms aren't explained

**Problem:** The page has two upload modes — bulk (drop anything anywhere, AI sorts it) and per-document (expand accordion, upload to specific slot). These aren't explained, and most users will not discover the bulk mode because the drop zone border is very faint (`#E1E8EE` dashed) and small relative to the page.

**Fix:** At the top of `DocumentsUploadSection`, add a brief instructional banner (dismissible, stored in `localStorage`):

> **Two ways to upload:** Drop all your documents at once and LendWell will sort them automatically, or expand each item below to upload individually.

Style it as a soft blue info banner (`backgroundColor: '#EDECFD'`, `color: '#3126E3'`). Include a dismiss X. This banner should only appear on first visit to the documents section.

---

### Issue 18: The document list should be driven by an API, not hardcoded

**Problem:** `documentCategories` is a large static array hardcoded inside `DocumentsUploadSection.tsx`. If lender requirements change (e.g., a specific lender now requires a 12-month bank statement instead of 3, or a new document type is needed for Help to Buy), a code change and deployment is required. This is operationally unsustainable.

**Fix (architectural):** Move `documentCategories` to an API route (`/api/documents/requirements`) that accepts the current `ApplicationData` and returns the filtered, applicable document list with all metadata. The component becomes a pure renderer. This allows:

- Lender-specific document sets (different lenders have different requirements)
- A/B testing document orderings
- Instant updates without deploys
- Future: AI-generated document requirements based on applicant profile

For now, the API can simply return the same static data. But the component should be refactored to fetch from this endpoint rather than computing locally — this is the right architecture for a production mortgage platform.

---

## Summary Table

| # | Issue | File(s) | Priority |
|---|-------|---------|----------|
| 1 | Generic issue messages + no re-upload CTA | `DocumentsUploadSection.tsx`, `documentMessages.ts` | P1 |
| 2 | Extracted fields not shown in accordion verified state | `DocumentsUploadSection.tsx`, `InlineDocumentPrompt.tsx` | P1 |
| 3 | Self-employed users see employed documents (substring match bug) | `DocumentsUploadSection.tsx` | P1 |
| 4 | No top-level progress indicator | `DocumentsUploadSection.tsx` | P1 |
| 5 | Bulk upload sorting invisible on document list | `DocumentsUploadSection.tsx` | P1 |
| 6 | `needs_update` visually identical to `issue` | `DocumentsUploadSection.tsx`, `types/tasks.ts` | P2 |
| 7 | Documents don't explain why they're needed | `DocumentsUploadSection.tsx` | P2 |
| 8 | Joint application documents missing | `DocumentsUploadSection.tsx`, `documentMessages.ts` | P2 |
| 9 | Remortgage documents missing | `DocumentsUploadSection.tsx`, `documentMessages.ts` | P2 |
| 10 | No notification when scan completes | `ApplicationContext.tsx` | P2 |
| 11 | Optional documents have no value explanation | `DocumentsUploadSection.tsx` | P2 |
| 12 | Category icons imported but hidden | `DocumentsUploadSection.tsx` | P3 |
| 13 | Verified message is generic (not using `AI_VERIFIED_MESSAGES`) | `DocumentsUploadSection.tsx` | P3 |
| 14 | Multi-file upload silently discards all but first file | `DocumentsUploadSection.tsx` | P3 |
| 15 | `DocumentCard` is dead code | `DocumentsUploadSection.tsx` | P3 |
| 16 | Mobile camera upload not surfaced | `DocumentsUploadSection.tsx` | P3 |
| 17 | Bulk upload mode not explained | `DocumentsUploadSection.tsx` | P3 |
| 18 | Document list should be API-driven | `DocumentsUploadSection.tsx`, new `/api/documents/requirements` | P3 |
