# 🔧 FINAL REPLIT PROMPT: Make SMS Consent Optional

---

## Fix SMS Consent Optional - 2 File Changes

**ISSUE:** SMS consent is incorrectly required. Users cannot submit form without checking it.

---

### FILE 1: `client/src/components/assessment-form.tsx`

**Find lines 1018-1023:**
```typescript
      case 5: // Legal Consent
        if (!formData.consentCommunications) {
          newErrors.consentCommunications = 'Communication consent is required by CASL';
        }
        if (!formData.consentSMS) {
          newErrors.consentSMS = 'SMS consent is required for text messaging';
        }
        if (!formData.privacyPolicy) {
          newErrors.privacyPolicy = 'Privacy policy acceptance is required by PIPEDA';
        }
```

**Replace with:**
```typescript
      case 5: // Legal Consent
        if (!formData.consentCommunications) {
          newErrors.consentCommunications = 'Communication consent is required by CASL';
        }
        // SMS consent is OPTIONAL (A2P 10DLC compliance - must be opt-in, not forced)
        if (!formData.privacyPolicy) {
          newErrors.privacyPolicy = 'Privacy policy acceptance is required by PIPEDA';
        }
```

---

### FILE 2: `server/routes.ts`

**Find lines 507-525:**
```typescript
      // Enhanced SMS consent validation

      // More flexible SMS consent validation (handle both string and boolean)
      const consentSMSValue = String(req.body.consentSMS).toLowerCase();
      if (!req.body.consentSMS || (consentSMSValue !== 'true' && req.body.consentSMS !== true)) {
        console.warn('SMS consent security validation failed:', {
          ip: req.ip,
          consentSMS: req.body.consentSMS,
          consentSMSValue,
          type: typeof req.body.consentSMS,
          timestamp: new Date().toISOString()
        });

        return res.status(400).json({
          success: false,
          error: 'SMS consent validation failed',
          message: 'SMS consent security validation failed'
        });
      }
```

**Replace with:**
```typescript
      // SMS consent is OPTIONAL (A2P 10DLC compliance - must be opt-in, not forced)
      // Only validate timestamp if consent is provided
```

**IMPORTANT:** KEEP lines 527-544 unchanged (timestamp security validation).

---

## Why This Works:

✅ Removes blocking validation (frontend + backend)
✅ Allows form submission with OR without SMS consent
✅ Maintains timestamp security (replay attack prevention)
✅ Webhook includes sms_consent ONLY when user opts in
✅ A2P 10DLC compliant (opt-in only)
✅ All enterprise security measures maintained

---

## Testing After Deployment:

✅ Submit form without SMS consent → Should succeed
✅ Submit form with SMS consent → Should succeed
✅ Check GHL webhook for both scenarios
