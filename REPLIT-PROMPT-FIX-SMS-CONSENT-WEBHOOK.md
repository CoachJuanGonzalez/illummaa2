# 🔧 REPLIT PROMPT: Fix SMS Consent Missing from Webhook

## ISSUE:
SMS consent is checked by user but NOT appearing in GHL webhook payload.

## ROOT CAUSE:
Backend missing `consentSMS` field mapping in `mapFrontendToBackend` function.

---

## FIX 1: Add consentSMS Mapping

**File:** `server/routes.ts`

**Find lines 126-130:**
```typescript
    // ENTERPRISE SECURITY: Correct separation of required CASL consent from optional marketing consent
    // Required CASL consent (always true for form submissions)
    consentMarketing: Boolean(frontendData.consentCommunications === true || frontendData.consentCommunications === 'true'),
    // Optional marketing consent (only when user explicitly opts in)
    marketingConsent: Boolean(frontendData.marketingConsent === true || frontendData.marketingConsent === 'true'),
```

**Replace with:**
```typescript
    // ENTERPRISE SECURITY: Correct separation of required CASL consent from optional marketing consent
    // Required CASL consent (always true for form submissions)
    consentMarketing: Boolean(frontendData.consentCommunications === true || frontendData.consentCommunications === 'true'),
    // Optional SMS consent (A2P 10DLC compliance - opt-in only)
    consentSMS: Boolean(frontendData.consentSMS === true || frontendData.consentSMS === 'true'),
    // Optional marketing consent (only when user explicitly opts in)
    marketingConsent: Boolean(frontendData.marketingConsent === true || frontendData.marketingConsent === 'true'),
```

---

## FIX 2: Update CASL Consent Text

**File:** `client/src/components/assessment-form.tsx`

**Find line 2143:**
```typescript
I consent to CASL compliance (Required for SMS) <span className="text-red-500">*</span>
```

**Replace with:**
```typescript
I consent to receive communications from ILLUMMAA (Required by CASL) <span className="text-red-500">*</span>
```

---

## WHY THIS WORKS:

**Backend Flow:**
1. Frontend sends: `consentSMS: "true"`
2. NEW mapping converts: `consentSMS: true` (boolean)
3. storage.ts receives: `formData.consentSMS = true`
4. Webhook includes:
   ```json
   {
     "sms_consent": true,
     "sms_timestamp": "2025-10-05T..."
   }
   ```

**Frontend Clarity:**
- CASL consent text no longer says "Required for SMS" (confusing)
- Now says "Required by CASL" (legally accurate)
- SMS consent remains separate and optional

---

## EXPECTED RESULT:

**When SMS consent checked:**
```json
{
  "casl_consent": true,
  "consent_timestamp": "...",
  "sms_consent": true,          ✅ Now appears!
  "sms_timestamp": "...",        ✅ Now appears!
  "marketing_consent": true,
  "marketing_timestamp": "..."
}
```

**When SMS consent NOT checked:**
```json
{
  "casl_consent": true,
  "consent_timestamp": "...",
  "marketing_consent": true,
  "marketing_timestamp": "..."
}
```

---

## TESTING:
1. Check SMS consent checkbox
2. Submit form
3. Verify GHL webhook shows `sms_consent: true`
4. Test without SMS checked - verify no `sms_consent` field
