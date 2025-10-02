# COMPLETE REPLIT PROMPT: Fix Phone Input UX/UI Issues & Country Code Display

**VERIFIED & FACT-CHECKED AGAINST CODEBASE**
**Date:** October 1, 2025
**Security Status:** ✅ All enterprise security measures preserved
**Breaking Changes:** ❌ None - All existing functionality maintained

---

## EXECUTIVE SUMMARY

This prompt addresses **3 critical issues** with the phone number input system:

1. **Desktop Layout Bug** - Country selector and phone input have unequal widths
2. **Backend +1 Injection Bug** - Non-+1 country codes (e.g., Aruba +297) get corrupted with an extra "+1" prefix
3. **UX Requirement** - Display only Aruba and Canada in dropdown while preserving all validation logic

**Root Cause Identified:**
The bug is in `server/storage.ts` line 324: `formatCanadianPhone()` is being applied to ALL phone numbers, not just Canadian ones, causing `+2975971234` to become `+12975971234`.

---

## ISSUE #1: Desktop Layout - Unequal Input Widths

### Current Implementation (Lines 1860-1895)

**File:** `client/src/components/assessment-form.tsx`

```tsx
{/* Current - BROKEN LAYOUT */}
<div className="flex flex-col sm:flex-row gap-2">
  <select className="w-full sm:w-auto px-3 py-3..." />
  <input className="w-full sm:flex-1 px-4 py-3..." />
</div>
```

**Problem:** On desktop, `sm:w-auto` shrinks the select to content width while `sm:flex-1` expands the input, creating unequal "bubbles".

### ✅ FIX #1: Match First Name/Last Name Grid Layout

**Reference Pattern (Lines 1792-1832):**
```tsx
{/* First Name & Last Name - CORRECT EXAMPLE */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label>First Name</label>
    <input className="w-full px-4 py-3 rounded-lg..." />
  </div>
  <div>
    <label>Last Name</label>
    <input className="w-full px-4 py-3 rounded-lg..." />
  </div>
</div>
```

**REPLACE Lines 1854-1909 with:**

```tsx
<div>
  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-phone">
    Phone Number <span className="text-red-500">*</span>
  </label>

  {/* Match First Name/Last Name grid layout for equal-width "bubbles" */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Country Code Selector - Equal width on desktop */}
    <div>
      <select
        value={selectedCountry}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none bg-white"
        data-testid="select-country"
      >
        {DISPLAY_COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name} ({country.callingCode})
          </option>
        ))}
      </select>
    </div>

    {/* Phone Number Input - Equal width on desktop */}
    <div>
      <input
        type="tel"
        name="phone"
        inputMode="numeric"
        value={phoneInput}
        onChange={handlePhoneChange}
        placeholder={
          selectedCountry === 'CA' ? "(416) 555-1234" :
          selectedCountry === 'AW' ? "597 1234" :
          "Enter phone number"
        }
        className={`w-full px-4 py-3 rounded-lg border ${
          errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
        required
        data-testid="input-phone"
      />
    </div>
  </div>

  {/* Error message */}
  {errors.phone && (
    <p className="text-red-500 text-xs mt-1" data-testid="error-phone">
      {errors.phone}
    </p>
  )}

  {/* Helper text */}
  <p className="text-gray-500 text-xs mt-1">
    Select your country and enter your phone number
  </p>
</div>
```

**Security:** ✅ No changes to input validation or sanitization
**Breaking Changes:** ❌ None - Pure CSS layout change

---

## ISSUE #2: Backend +1 Injection Bug (CRITICAL)

### Root Cause Analysis

**Problem Location:** `server/storage.ts` Line 324

```tsx
// CURRENT - BUGGY CODE
phone: formatCanadianPhone(formData.phone),
```

**Bug Behavior:**
- Frontend sends: `+2975971234` (Aruba)
- Backend `formatCanadianPhone()` sees 10 digits without +1 prefix
- Backend adds +1, creating: `+12975971234` ❌

**Function Analysis (Lines 245-254):**
```tsx
function formatCanadianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;  // ❌ ASSUMES ALL 10-digit numbers are North American
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone;  // ✅ Fallback returns original
}
```

### ✅ FIX #2A: Update formatCanadianPhone to Handle All Countries

**File:** `server/storage.ts`

**REPLACE Lines 245-254 with:**

```tsx
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // If phone already has + prefix (E.164 format), it's already formatted
  if (phone.startsWith('+')) {
    return phone;
  }

  // Only apply +1 logic if phone is exactly 10 digits (legacy North American format)
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;  // North American number without country code
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;  // North American number with 1 prefix
  }

  // For all other formats, return as-is (already has country code)
  return phone;
}
```

### ✅ FIX #2B: Rename Function Call

**REPLACE Line 324:**

```tsx
// OLD
phone: formatCanadianPhone(formData.phone),

// NEW
phone: formatPhoneNumber(formData.phone),
```

**Security:** ✅ Maintains all sanitization (DOMPurify on line 172)
**Breaking Changes:** ❌ None - Canada/USA phones work identically, international phones now work correctly

---

## ISSUE #3: Limit Dropdown to 2 Countries (Aruba & Canada)

### Current Implementation

**File:** `client/src/components/assessment-form.tsx`

All 249+ countries are displayed in the dropdown (Line 67-324: `ALL_COUNTRIES` array).

### ✅ FIX #3: Create Display-Only Country List

**ADD after Line 324 (immediately after the closing bracket of `ALL_COUNTRIES`):**

```tsx
// UI Display: Show only primary markets (Aruba & Canada)
// Note: ALL_COUNTRIES is still used for validation logic throughout the codebase
const DISPLAY_COUNTRIES = [
  { code: 'AW', name: 'Aruba', flag: '🇦🇼', callingCode: '+297' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
];
```

**UPDATE Line 1869:**

```tsx
// OLD
{ALL_COUNTRIES.map((country) => (

// NEW
{DISPLAY_COUNTRIES.map((country) => (
```

**⚠️ CRITICAL - DO NOT CHANGE:**
- Line 327: `const [selectedCountry, setSelectedCountry] = useState<string>('CA');` (Keep default as 'CA')
- Line 638, 643, 649, 692, 697: Keep `ALL_COUNTRIES.find()` for country code lookups
- Line 942, 961: Keep `ALL_COUNTRIES.find()` for validation error messages
- All `isValidPhoneNumber()` calls: No changes needed

**Security:** ✅ All validation logic unchanged
**Breaking Changes:** ❌ None - Validation still supports all 249+ countries

---

## VERIFICATION CHECKLIST

After implementing all fixes, verify:

### Desktop Layout
- [ ] Country selector and phone input have **equal widths** on desktop (like First/Last name)
- [ ] Both inputs stack vertically on mobile
- [ ] Both inputs are side-by-side on desktop (md: breakpoint)

### Country Dropdown
- [ ] Dropdown shows **only 2 options**: Aruba, Canada (in that order)
- [ ] Default selection is Canada (+1)

### Phone Validation & Storage
- [ ] **Aruba Test:** Enter `2975971234` with Aruba selected
  - Display shows: `297 5971234` (formatted)
  - Review & Submit shows: `+2975971234`
  - JSON payload shows: `"phone": "+2975971234"` ✅ (NOT `"+12975971234"`)

- [ ] **Canada Test:** Enter `4165551234` with Canada selected
  - Display shows: `(416) 555-1234` (formatted)
  - Review & Submit shows: `+14165551234`
  - JSON payload shows: `"phone": "+14165551234"` ✅

### Security & Functionality
- [ ] All phone numbers pass through `sanitizeInput()` (line 434-443)
- [ ] Backend phone validation still uses `isValidPhoneNumber()` (line 787)
- [ ] Backend sanitization still uses `DOMPurify` (line 172)
- [ ] No changes to existing validation logic
- [ ] Country switching behavior preserved (hybrid approach from yesterday)

---

## SECURITY AUDIT SUMMARY

✅ **Enterprise Security Measures Preserved:**

1. **Input Sanitization (Frontend):**
   - Line 434-443: `sanitizeInput()` removes XSS vectors (`<>`, `javascript:`, event handlers)
   - 1000-character limit prevents DoS
   - No changes to sanitization logic

2. **Input Sanitization (Backend):**
   - Line 172: `DOMPurify.sanitize()` on phone input
   - Line 784-791: Zod schema validation with `isValidPhoneNumber()`
   - Line 365-368: Payload size limit (100KB) enforced

3. **CSRF Protection:**
   - Line 1124: `csrfToken` validation before submission
   - No changes to CSRF logic

4. **Rate Limiting:**
   - Lines 90-141 (`storage.ts`): IP-based submission throttling (24-hour window)
   - No changes to rate limiting

5. **Content Security:**
   - Line 363-367 (`routes.ts`): Security headers (X-Frame-Options, XSS-Protection, etc.)
   - No changes to security headers

---

## FILES MODIFIED

### Frontend Changes
**File:** `client/src/components/assessment-form.tsx`

1. **Add** `DISPLAY_COUNTRIES` constant (after line 324)
2. **Update** Lines 1854-1909 (phone input layout)
3. **Update** Line 1869 (dropdown country source)

### Backend Changes
**File:** `server/storage.ts`

1. **Rename & Update** Lines 245-254 (`formatCanadianPhone` → `formatPhoneNumber`)
2. **Update** Line 324 (function call)

---

## IMPLEMENTATION NOTES

1. **No Database Changes:** All changes are code-only
2. **No Breaking API Changes:** Payload structure remains identical
3. **Backward Compatible:** Existing phone numbers in system unaffected
4. **Default Behavior:** Canada remains default country (most common use case)
5. **Future Extensibility:** To add more countries to dropdown, simply add to `DISPLAY_COUNTRIES` array

---

## EXPECTED OUTCOMES

### Before Implementation
- ❌ Desktop layout: Unequal input widths
- ❌ Aruba phone: `+2975971234` → `+12975971234` (corrupted)
- ❌ Dropdown: 249+ countries shown

### After Implementation
- ✅ Desktop layout: Equal input widths (grid-based)
- ✅ Aruba phone: `+2975971234` → `+2975971234` (preserved)
- ✅ Dropdown: 2 countries shown (Aruba, Canada)

---

**END OF VERIFIED PROMPT**
