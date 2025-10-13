# 🚨 URGENT: Frontend Form Investigation

**Issue:** You selected "Yes" but webhook shows "No"
**Backend:** ✅ Verified correct (all 3 fixes implemented in commits c4f97e2 and dfe0e51)
**Suspect:** Frontend form not sending the value correctly

---

## 🔍 Investigation Steps

### Step 1: Check Browser Console

When you submit the form, open browser DevTools (F12) and check:

1. **Console tab** - Look for any errors
2. **Network tab** - Find the POST request to `/api/submit-assessment`
3. **Click on the request** - View the "Payload" or "Request" tab
4. **Look for:** `buildCanadaEligible: "Yes"`

**If you see `buildCanadaEligible: "No"` or it's missing, the form is not capturing your selection.**

---

### Step 2: Add Temporary Debug to Form

**File:** `client/src/components/assessment-form.tsx`

**Add this debug log before line 1258:**

```typescript
// Line ~1250 - Inside handleSubmit function, before creating submission payload

// TEMPORARY DEBUG
console.log('🔍 [FORM DEBUG] Build Canada value before submission:', {
  formDataValue: formData.buildCanadaEligible,
  sanitized: sanitizeInput(formData.buildCanadaEligible || "I don't know"),
  allFormData: formData
});

// Then existing code continues...
buildCanadaEligible: sanitizeInput(formData.buildCanadaEligible || "I don't know"),
```

**Then submit the form and check browser console.**

---

### Step 3: Verify Form Field Name

**File:** `client/src/components/assessment-form.tsx`
**Line:** ~1825

**Should be EXACTLY:**
```typescript
<select
  name="buildCanadaEligible"  // ← Must match this exactly
  value={formData.buildCanadaEligible || ''}
  onChange={handleInputChange}
  // ... rest of props
>
  <option value="">Select eligibility...</option>
  <option value="Yes">Yes - Meets net-zero and affordability criteria</option>
  <option value="No">No - Does not meet criteria</option>
  <option value="I don't know">I don't know - Need more information</option>
</select>
```

**Check for:**
- ❌ Wrong name: `buildCanada` (missing "Eligible")
- ❌ Wrong name: `build_canada_eligible` (wrong case)
- ❌ Wrong value attribute: Not "Yes" exactly

---

### Step 4: Check Form State Initialization

**File:** `client/src/components/assessment-form.tsx`
**Line:** ~44 (FormData type)

**Should include:**
```typescript
interface FormData {
  // ... other fields ...
  buildCanadaEligible?: string;
  // ... other fields ...
}
```

**And initial state (line ~70):**
```typescript
const [formData, setFormData] = useState<FormData>({
  // ... other fields ...
  buildCanadaEligible: '',  // ← Should be empty string or undefined
  // ... other fields ...
});
```

---

### Step 5: Verify handleInputChange

**Check that the change handler updates buildCanadaEligible:**

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;

  // TEMPORARY DEBUG
  if (name === 'buildCanadaEligible') {
    console.log('🔍 [FORM] Build Canada field changed:', {
      name,
      value,
      type
    });
  }

  setFormData(prev => ({
    ...prev,
    [name]: value  // ← This should update buildCanadaEligible
  }));
};
```

---

## 🎯 Most Likely Issues

### Issue 1: Default Value "No" Being Set

**Check if there's any code that sets a default "No":**

```bash
# Search for "buildCanadaEligible" and "No" together
grep -r "buildCanadaEligible.*No" client/src/
```

### Issue 2: Form Validation Changing Value

**Check if validation is overriding the value:**

Look for code around line ~958 that might change it:
```typescript
if (!formData.buildCanadaEligible || formData.buildCanadaEligible === '') {
  newErrors.buildCanadaEligible = 'Please select Build Canada eligibility status';
  // ← Check if there's code here that sets a default "No"
}
```

### Issue 3: Sanitization Changing Value

**Check sanitizeInput function:**

If `sanitizeInput("Yes")` returns something other than "Yes", that's the problem.

Add debug:
```typescript
const sanitized = sanitizeInput(formData.buildCanadaEligible || "I don't know");
console.log('🔍 [SANITIZE] Build Canada:', {
  input: formData.buildCanadaEligible,
  output: sanitized
});
```

---

## 🧪 Quick Test in Browser Console

**When the form is loaded, test the field directly:**

1. Open browser console (F12)
2. Fill the form INCLUDING selecting "Yes" for Build Canada
3. Run this in console:

```javascript
// Check form state
const buildCanadaSelect = document.querySelector('select[name="buildCanadaEligible"]');
console.log('Build Canada field:', {
  exists: !!buildCanadaSelect,
  value: buildCanadaSelect?.value,
  selectedOption: buildCanadaSelect?.options[buildCanadaSelect.selectedIndex]?.text
});
```

**Expected output:**
```javascript
{
  exists: true,
  value: "Yes",
  selectedOption: "Yes - Meets net-zero and affordability criteria"
}
```

**If it shows:**
```javascript
{
  exists: true,
  value: "No",  // ← WRONG
  selectedOption: "No - Does not meet criteria"
}
```

**Then the dropdown is selecting "No" by default or something is changing it.**

---

## 🔥 Emergency Fix (If Form is the Issue)

**If the form is somehow broken, add this HARDCODED test:**

In `assessment-form.tsx` line ~1258, temporarily hardcode:

```typescript
// TEMPORARY HARDCODE FOR TESTING
buildCanadaEligible: "Yes",  // ← Hardcoded to test
// buildCanadaEligible: sanitizeInput(formData.buildCanadaEligible || "I don't know"),
```

**Then submit the form.**

**If webhook shows "Yes":**
- ✅ Backend is working
- ❌ Form field is broken

**If webhook still shows "No":**
- ❌ Backend has another issue we haven't found

---

## 📊 Expected vs Actual

### Expected Behavior:

1. User selects "Yes" → formData.buildCanadaEligible = "Yes"
2. Form submits → Payload includes `buildCanadaEligible: "Yes"`
3. Backend receives → `req.body.buildCanadaEligible = "Yes"`
4. Validation → `data.buildCanadaEligible = "Yes"`
5. Webhook → `build_canada_eligible: "Yes"`
6. Score → +5 ESG points
7. Tags → "ESG-Eligible" appears

### Actual Behavior:

1. User selects "Yes" → formData.buildCanadaEligible = ??? (unknown)
2. Form submits → Payload includes ??? (unknown)
3. Backend receives → `req.body.buildCanadaEligible = ???` (unknown)
4. Validation → `data.buildCanadaEligible = "No"` (❌ WRONG)
5. Webhook → `build_canada_eligible: "No"` (❌ WRONG)
6. Score → +0 ESG points (❌ MISSING +5)
7. Tags → "ESG-Eligible" missing (❌ WRONG)

---

## ✅ Action Items

1. **Check browser Network tab** - See actual payload sent
2. **Add form debug logs** - Track formData value
3. **Verify field name** - Must be "buildCanadaEligible" exactly
4. **Check for defaults** - Search for code setting "No"
5. **Test hardcoded "Yes"** - Confirm backend works

**Once you find where it's breaking, let me know and I'll create the fix.**

---

**Created:** 2025-10-04
**Priority:** URGENT
**Next Step:** Check browser DevTools Network tab to see actual payload
