# 🔍 Build Canada Diagnostic - Track Missing "Yes" Value

**Issue:** User selected "Yes" in form, but webhook shows "No"
**Need:** Debug logging to track where value is lost

---

## 🔍 Debug Patch to Add

Add these debug logs to track the value through the entire data flow:

### Debug Point 1: After Sanitization (routes.ts ~line 557)

**Add after line 557 (after sanitization loop):**

```typescript
// DEBUG: Track Build Canada value flow
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 [BUILD CANADA DEBUG 1] After sanitization:', {
    inReqBody: req.body.buildCanadaEligible,
    inSanitized: sanitized.buildCanadaEligible,
    type: typeof sanitized.buildCanadaEligible
  });
}
```

### Debug Point 2: After Mapping (routes.ts ~line 563)

**Add after line 563 (after mapFrontendToBackend call):**

```typescript
// DEBUG: Track Build Canada after mapping
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 [BUILD CANADA DEBUG 2] After mapping:', {
    inMappedBody: mappedBody.buildCanadaEligible,
    type: typeof mappedBody.buildCanadaEligible
  });
}
```

### Debug Point 3: After Validation (routes.ts ~line 637)

**Add after line 637 (after validateFormData call):**

```typescript
// DEBUG: Track Build Canada after validation
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 [BUILD CANADA DEBUG 3] After validation:', {
    inData: data?.buildCanadaEligible,
    type: typeof data?.buildCanadaEligible
  });
}
```

### Debug Point 4: In Validation Function (storage.ts ~line 193)

**Add after line 193 (after buildCanadaEligible sanitization):**

```typescript
buildCanadaEligible: sanitizeOptionalEnum(rawData.buildCanadaEligible),
// DEBUG: Verify field is included
...(process.env.NODE_ENV === 'development' && {
  _debug_buildCanada: {
    raw: rawData.buildCanadaEligible,
    sanitized: sanitizeOptionalEnum(rawData.buildCanadaEligible)
  }
}),
```

---

## 🎯 What These Logs Will Show

When you submit the form with "Yes" selected, you should see:

```
🔍 [BUILD CANADA DEBUG 1] After sanitization: {
  inReqBody: 'Yes',
  inSanitized: 'Yes',
  type: 'string'
}

🔍 [BUILD CANADA DEBUG 2] After mapping: {
  inMappedBody: 'Yes',
  type: 'string'
}

🔍 [BUILD CANADA DEBUG 3] After validation: {
  inData: 'Yes',
  type: 'string'
}

🔍 [ESG TAG DEBUG]: {
  buildCanadaEligible: 'Yes',
  type: 'string',
  willAddTag: true
}
```

**If any of these show "No" or undefined, that's where the value is being lost.**

---

## 🚨 Possible Issues to Check

### Issue 1: Frontend Form Field Name Mismatch

**Check:** `client/src/components/assessment-form.tsx` line ~1825

**Should be:**
```typescript
<select
  name="buildCanadaEligible"  // ← Must match exactly
  value={formData.buildCanadaEligible || ''}
  onChange={handleInputChange}
```

**Common mistake:**
- Field name: `buildCanada` (missing "Eligible")
- Field name: `build_canada_eligible` (wrong casing)

### Issue 2: Form State Not Updated

**Check:** Does `formData.buildCanadaEligible` update when you select "Yes"?

Add console.log in form's `handleInputChange`:
```typescript
const handleInputChange = (e: React.ChangeEvent<...>) => {
  const { name, value } = e.target;
  if (name === 'buildCanadaEligible') {
    console.log('🔍 [FORM] Build Canada changed to:', value);
  }
  // ... rest of handler
};
```

### Issue 3: Form Submission Payload

**Check:** What's actually being sent in the POST request?

Add debug before form submission (assessment-form.tsx ~line 1258):
```typescript
// Before submission
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 [FORM SUBMIT] Payload:', {
    buildCanadaEligible: formData.buildCanadaEligible,
    allFormData: formData
  });
}

const response = await fetch('/api/submit-assessment', {
  method: 'POST',
  body: JSON.stringify({
    ...formData,
    buildCanadaEligible: sanitizeInput(formData.buildCanadaEligible || "I don't know"),
    // ... rest
  })
});
```

### Issue 4: Default Value Override

**Check:** Line 176 in routes.ts might be overriding with default

**Current:**
```typescript
buildCanadaEligible: frontendData.buildCanadaEligible || "I don't know",
```

**If `frontendData.buildCanadaEligible` is empty string or null, this becomes "I don't know"**

**Better:**
```typescript
buildCanadaEligible: frontendData.buildCanadaEligible ?? "I don't know",
```

(Use `??` instead of `||` to only default on null/undefined, not empty string)

---

## 🔧 Quick Test

**In Replit console, run this after form submission:**

1. Check request body received:
   ```javascript
   // Add this temporary log in routes.ts line 490
   console.log('📥 [REQUEST BODY]:', JSON.stringify(req.body, null, 2));
   ```

2. Look for:
   ```json
   {
     "buildCanadaEligible": "Yes",  // ← Should be "Yes"
     // ... other fields
   }
   ```

**If it's missing or "No" here, the problem is in the frontend form.**

**If it's "Yes" here but becomes "No" later, the problem is in backend processing.**

---

## 🎯 Most Likely Cause

Based on your webhook showing `"build_canada_eligible": "No"`, I suspect:

**Theory 1:** Frontend form is not sending the value
- Field name mismatch
- Form state not updating
- Submission payload missing the field

**Theory 2:** Backend is overriding it
- Line 176 using `||` instead of `??`
- Empty string being treated as falsy

**Theory 3:** Validation is dropping it
- Already fixed (line 193 is correct)
- Unlikely since we verified the code

---

## ✅ Next Steps

1. **Add the 4 debug points above**
2. **Submit form with "Yes" selected**
3. **Check Replit console logs**
4. **Share the debug output**

The logs will show exactly where "Yes" becomes "No".

---

**Created:** 2025-10-04
**Purpose:** Diagnostic logging for Build Canada value tracking
**Expected Result:** Identify exact point where "Yes" is lost
