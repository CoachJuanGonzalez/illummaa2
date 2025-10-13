# 🔍 DEBUG: SMS Consent Missing from Payload

**Issue:** You checked the SMS consent box, but `sms_consent` is missing from the webhook payload.

---

## 🎯 Possible Causes

### 1. **Replit Code Not Updated** (Most Likely)
Your local code has the fix (commit 1847f1c from 21:00:24), but Replit might still be running the OLD code from before the fix.

**Test timestamp:** 21:03:38 (only 3 minutes after fix was committed)
**Possible:** Replit hadn't finished redeploying yet

### 2. **Form Not Sending consentSMS**
The checkbox state might not be reaching the backend.

---

## ✅ How to Debug

### Step 1: Check Replit Console Logs

Look for this debug log in Replit console:
```
🔍 [BACKEND DEBUG] Raw data received:
```

You should see: `consentSMS: 'true'` or `consentSMS: true`

**If you see:**
- ❌ `consentSMS: undefined` → Form is NOT sending it
- ❌ `consentSMS: false` → Form is sending false (you didn't check the box)
- ✅ `consentSMS: 'true'` → Form IS sending it, backend should process it

### Step 2: Check Browser DevTools Console

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Submit the form
4. Look for: `Consent values:`

You should see:
```javascript
Consent values: {
  consentSMS: 'true',
  timestamp: '2025-10-04T...',
  allConsents: {
    communications: 'true',
    sms: 'true',    // ← Should be 'true' if you checked it
    privacy: 'true',
    age: 'true'
  }
}
```

### Step 3: Check Network Tab Payload

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Submit the form
4. Click on `/api/submit-assessment` request
5. Go to "Payload" tab
6. Look for `consentSMS`

**Expected:** `consentSMS: "true"` or `consentSMS: true`

---

## 🔧 Solutions

### Solution 1: Wait for Replit to Redeploy

If Replit is slow to redeploy:
1. Go to Replit
2. Stop the server
3. Restart it
4. Wait for "Listening on..." message
5. Try form submission again

### Solution 2: Force Replit Update

In Replit console:
```bash
git pull origin main
npm run build
```

Then restart the server.

### Solution 3: Check if Box is Actually Checked

Make absolutely sure:
1. Fill out Steps 1-4
2. Get to Step 5 (Legal Consent)
3. **LOOK AT THE CHECKBOX** - is it actually checked? ✓
4. The SMS consent checkbox says: "I consent to receive SMS text messages..."
5. It should have a checkmark ✓

---

## 🧪 Test This Exact Scenario

Fill out the form with these exact values:

**Step 1:**
- Readiness: Immediate (0-3 months)

**Step 2:**
- First Name: Test
- Last Name: User
- Email: test@test.com
- Phone: +15145012740
- Company: Test Company
- Unit Count: 200

**Step 3:**
- Timeline: Immediate (0-3 months)
- Province: British Columbia
- Developer Type: Indigenous Community/Organization
- Government Programs: Participating in government programs
- Build Canada: Yes
- Description: Testing SMS consent

**Step 4:** (skip)

**Step 5 - CHECK ALL THREE BOXES:**
- ✅ "I consent to communications..." (CASL)
- ✅ "I consent to receive SMS text messages..." (**SMS - VERY IMPORTANT**)
- ✅ "I consent to receive marketing emails..." (Marketing)
- ✅ "I accept the privacy policy..."
- ✅ "I confirm I am 18+"

**Submit and check payload in GHL**

---

## 📋 Expected Payload (All Boxes Checked)

```json
{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@test.com",
  "phone": "+15145012740",
  "company": "Test Company",
  "project_unit_count": 200,
  "delivery_timeline": "Immediate (0-3 months)",
  "construction_province": "British Columbia",
  "developer_type": "Indigenous Community/Organization",
  "government_programs": "Participating in government programs",
  "project_description": "Testing SMS consent",
  "ai_priority_score": 100,
  "customer_tier": "elite",
  "build_canada_eligible": "Yes",
  "tags_array": [
    "Elite",
    "Dev-Indigenous",
    "Government-Participating",
    "Priority-Province",
    "ESG-Eligible",
    "Urgent",
    "CASL-Compliant",
    "SMS-Opted-In",        // ✅ Should be here
    "Marketing-Opted-In"
  ],
  "response_time": "2 hours",
  "a2p_campaign_id": "PLACEHOLDER_CAMPAIGN_ID",
  "casl_consent": true,
  "consent_timestamp": "2025-10-04T...",
  "sms_consent": true,       // ✅ Should be here
  "sms_timestamp": "2025-10-04T...",  // ✅ Should be here
  "marketing_consent": true,
  "marketing_timestamp": "2025-10-04T..."
}
```

---

## ❓ What to Tell Me

After testing, please tell me:

1. **Did you check the SMS consent box?** (Yes/No)
2. **What do you see in browser console?** (`consentSMS: 'true'` or `'false'`?)
3. **What do you see in Network tab payload?** (Does it have `consentSMS`?)
4. **What do you see in Replit console logs?** (Any debug messages?)

This will help me figure out exactly where the data is being lost!
