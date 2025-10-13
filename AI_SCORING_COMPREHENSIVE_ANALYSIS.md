# ILLUMMAA AI Priority Scoring System - Comprehensive Analysis Report

**Report Generated:** October 4, 2025
**Codebase Version:** 2025+ B2B Only (3-Tier System)
**Test Suite Status:** ✅ 35/35 Tests Passing (100% Success Rate)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [AI Priority Scoring Algorithm](#ai-priority-scoring-algorithm)
3. [Tier Assignment Logic](#tier-assignment-logic)
4. [Custom Fields & GHL Webhook Payload](#custom-fields--ghl-webhook-payload)
5. [Tag Generation Logic](#tag-generation-logic)
6. [Form Input Field Mapping](#form-input-field-mapping)
7. [Test Results & Scenarios](#test-results--scenarios)
8. [Technical Implementation Details](#technical-implementation-details)

---

## Executive Summary

The ILLUMMAA assessment form uses a sophisticated AI-driven priority scoring system to qualify B2B partnership opportunities. The system:

- **Minimum Requirement:** 10+ units (residential leads <10 units redirected to Remax.ca)
- **Three Partnership Tiers:** Pioneer (10-49 units), Preferred (50-199 units), Elite (200+ units)
- **Maximum Score:** 105 points (normalized to 100)
- **Five Scoring Factors:** Unit Volume (50pts), Government Programs (20pts), Indigenous Communities (15pts), Priority Provinces (10pts), ESG/Build Canada (5pts)
- **Urgency Bonus:** +5 points for immediate timeline + Preferred/Elite tier
- **Response SLA:** 2 hours (80-100 score), 6 hours (60-79), 24 hours (40-59), 72 hours (0-39)

**Key Files:**
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\shared\utils\scoring.ts` - Core scoring algorithm
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\server\storage.ts` - Webhook payload & tag generation
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\shared\schema.ts` - Form validation schema
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\test-scoring-algorithm.ts` - Comprehensive test suite (35 scenarios)

---

## AI Priority Scoring Algorithm

### Scoring Formula

```
Total Score = Unit Volume + Government Programs + Indigenous + Priority Province + ESG/Build Canada + Urgency Bonus

Max Raw Score: 105 points (normalized to 100)
```

### Detailed Breakdown

#### 1. Unit Volume Score (50 points maximum)

| Tier | Unit Range | Points | Description |
|------|------------|--------|-------------|
| **Pioneer** | 10-49 units | 15 | B2B partnership development |
| **Preferred** | 50-199 units | 40 | Enhanced B2B partnership |
| **Elite** | 200+ units | 50 | Executive B2B partnership |

**Code Location:** `shared/utils/scoring.ts` lines 100-114

```typescript
switch (tier) {
  case 'pioneer':      // 10-49 units
    unitVolumeScore = 15;
    break;
  case 'preferred':    // 50-199 units
    unitVolumeScore = 40;
    break;
  case 'elite':        // 200+ units
    unitVolumeScore = 50;
    break;
}
```

#### 2. Government Programs (20 points maximum)

| Selection | Points | Condition |
|-----------|--------|-----------|
| "Participating in government programs" | +20 | Actively participating |
| "Not participating" | 0 | No participation |

**Code Location:** `shared/utils/scoring.ts` lines 122-130

```typescript
if (govPrograms === "Participating in government programs") {
  govScore = 20;
  score += 20;
}
```

#### 3. Indigenous Communities (15 points maximum)

| Developer Type | Points | Condition |
|----------------|--------|-----------|
| "Indigenous Community/Organization" | +15 | Indigenous developer |
| All other types | 0 | Non-indigenous |

**Code Location:** `shared/utils/scoring.ts` lines 132-136

```typescript
if (devType === "Indigenous Community/Organization") {
  indigenousScore = 15;
  score += 15;
}
```

#### 4. Priority Provinces (10 points maximum)

| Province | Points | Priority Status |
|----------|--------|-----------------|
| Alberta | +10 | Priority |
| British Columbia | +10 | Priority |
| Ontario | +10 | Priority |
| Northwest Territories | +10 | Priority |
| All other provinces/territories | 0 | Standard |

**Code Location:** `shared/utils/scoring.ts` lines 138-143

```typescript
const priorityProvinces = ["Alberta", "British Columbia", "Ontario", "Northwest Territories"];
if (priorityProvinces.includes(province)) {
  provinceScore = 10;
  score += 10;
}
```

#### 5. ESG/Build Canada Eligibility (5 points maximum)

| Selection | Points | Note |
|-----------|--------|------|
| "Yes" | +5 | User self-certification |
| "No" | 0 | Not eligible |
| "I don't know" | 0 | Uncertain status |

**Code Location:** `shared/utils/scoring.ts` lines 145-156

```typescript
if (buildCanadaValue === "Yes") {
  esgScore = 5;
  score += 5;
} else {
  esgScore = 0;  // No points for "No", "I don't know", or undefined
}
```

#### 6. Urgency Bonus (5 points maximum)

| Condition | Points | Requirements |
|-----------|--------|--------------|
| Immediate timeline + Preferred tier | +5 | Timeline "Immediate (0-3 months)" AND units 50-199 |
| Immediate timeline + Elite tier | +5 | Timeline "Immediate (0-3 months)" AND units 200+ |
| Immediate timeline + Pioneer tier | 0 | **NO BONUS** - Pioneer excluded |
| Non-immediate timeline (any tier) | 0 | Any other timeline |

**Code Location:** `shared/utils/scoring.ts` lines 116-120

```typescript
if (timeline === "Immediate (0-3 months)" && (tier === 'preferred' || tier === 'elite')) {
  urgencyBonus = 5;
  score += 5;
}
```

### Score Normalization

```typescript
const rawScore = score;  // Can exceed 100 (e.g., 105 max)
const normalizedScore = Math.min(100, score);  // Capped at 100
```

**Code Location:** `shared/utils/scoring.ts` lines 159-160

---

## Tier Assignment Logic

### Tier Determination Algorithm

**Function:** `determineCustomerTier(units: number)`
**Location:** `shared/utils/scoring.ts` lines 187-196

```typescript
export function determineCustomerTier(units: number): 'pioneer' | 'preferred' | 'elite' {
  if (units >= 200) return 'elite';
  if (units >= 50 && units <= 200) return 'preferred';
  if (units >= 10 && units <= 49) return 'pioneer';

  // Should not reach here - redirect to Remax
  console.warn('determineCustomerTier: Units < 10, should redirect to Remax.ca');
  return 'pioneer';
}
```

### Tier Thresholds & Criteria

| Tier | Unit Range | Threshold | Boundary Behavior |
|------|------------|-----------|-------------------|
| **Pioneer** | 10-49 units | 10 ≤ units ≤ 49 | 10 units = Pioneer, 49 units = Pioneer |
| **Preferred** | 50-199 units | 50 ≤ units ≤ 199 | 50 units = Preferred, 199 units = Preferred |
| **Elite** | 200+ units | units ≥ 200 | 200 units = Elite, no upper limit |

**Important Boundary Cases:**
- **49 units** → Pioneer tier (✅ Verified in test suite)
- **50 units** → Preferred tier (✅ Verified in test suite)
- **199 units** → Preferred tier (✅ Verified in test suite)
- **200 units** → Elite tier (✅ Verified in test suite)

### Tier Details

#### Pioneer Tier (10-49 units)
- **Icon:** 🚀
- **Color:** Purple
- **Description:** B2B partnership development (10-49 units)
- **Base Score:** 15 points
- **Submit Button:** "Submit Partnership Application"
- **Response Commitment:** "Enhanced Partnership Priority"
- **Response Description:** "Priority partnership coordination with dedicated team attention"

#### Preferred Tier (50-199 units)
- **Icon:** ⭐
- **Color:** Orange
- **Description:** Enhanced B2B partnership (50-199 units)
- **Base Score:** 40 points
- **Submit Button:** "Submit Partnership Application"
- **Response Commitment:** "Executive Partnership Track"
- **Response Description:** "Expedited processing with senior team engagement"

#### Elite Tier (200+ units)
- **Icon:** 👑
- **Color:** Red
- **Description:** Executive B2B partnership (200+ units)
- **Base Score:** 50 points
- **Submit Button:** "Submit Partnership Application"
- **Response Commitment:** "VIP Implementation Support"
- **Response Description:** "Executive-level partnership with comprehensive project support"

**Code Location:** `client/src/components/assessment-form.tsx` lines 389-439

---

## Custom Fields & GHL Webhook Payload

### Complete Webhook Payload Structure

**Function:** `submitToGoHighLevel()`
**Location:** `server/storage.ts` lines 345-466

### Webhook Custom Fields Table

| Field Name | GHL Field Key | Data Type | Source | Required | Notes |
|------------|---------------|-----------|--------|----------|-------|
| First Name | `first_name` | String | `formData.firstName` | Yes | Sanitized, 2-50 chars |
| Last Name | `last_name` | String | `formData.lastName` | Yes | Sanitized, 2-50 chars |
| Email | `email` | String | `formData.email` | Yes | Validated email format |
| Phone | `phone` | String | `formatPhoneNumber(formData.phone)` | Yes | E.164 format (e.g., +14165551234) |
| Company | `company` | String | `formData.company` or "Individual Investor" | Yes | Defaults for Pioneer tier |
| Project Unit Count | `project_unit_count` | Integer | `formData.projectUnitCount` | Yes | 10-1,000,000 units |
| Delivery Timeline | `delivery_timeline` | String | `formData.decisionTimeline` | Yes | Enum: Immediate/Short/Medium/Long-term |
| Construction Province | `construction_province` | String | `formData.constructionProvince` | Yes | 13 provinces/territories |
| Developer Type | `developer_type` | String | `formData.developerType` | Yes | 6 types (Indigenous, Commercial, etc.) |
| Government Programs | `government_programs` | String | `formData.governmentPrograms` | Yes | "Participating" or "Not participating" |
| Project Description | `project_description` | String | `formData.projectDescription` | No | Max 1000 chars, sanitized |
| AI Priority Score | `ai_priority_score` | Integer | `priorityData.score` | Yes | 0-100 (normalized) |
| Customer Tier | `customer_tier` | String | `customerTier` | Yes | "pioneer", "preferred", or "elite" |
| Build Canada Eligible | `build_canada_eligible` | String | `formData.buildCanadaEligible` | Yes | "Yes", "No", or "I don't know" |
| Tags Array | `tags_array` | Array[String] | `tags` | Yes | Array of tag strings (max 12) |
| Response Time | `response_time` | String | `priorityData.responseTime` | Yes | "2 hours", "6 hours", "24 hours", "72 hours" |
| A2P Campaign ID | `a2p_campaign_id` | String | `process.env.A2P_CAMPAIGN_ID` | Yes | SMS compliance |
| CASL Consent | `casl_consent` | Boolean | `formData.consentMarketing` | Conditional | If consentMarketing true |
| Consent Timestamp | `consent_timestamp` | ISO DateTime | `new Date().toISOString()` | Conditional | If consentMarketing true |
| SMS Consent | `sms_consent` | Boolean | `formData.consentSMS` | Conditional | If consentSMS true |
| SMS Timestamp | `sms_timestamp` | ISO DateTime | `new Date().toISOString()` | Conditional | If consentSMS true |
| Marketing Consent | `marketing_consent` | Boolean | `formData.marketingConsent` | Conditional | If marketingConsent true |
| Marketing Timestamp | `marketing_timestamp` | ISO DateTime | `new Date().toISOString()` | Conditional | If marketingConsent true |

**Code Location:** `server/storage.ts` lines 386-429

```typescript
const webhookPayload = {
  // Core Contact Fields (5)
  first_name: sanitizeInput(formData.firstName),
  last_name: sanitizeInput(formData.lastName),
  email: sanitizeInput(formData.email),
  phone: formatPhoneNumber(formData.phone),
  company: sanitizeInput(formData.company) || (customerTier === 'pioneer' ? 'Individual Investor' : ''),

  // Core Project Fields (6)
  project_unit_count: units,
  delivery_timeline: formData.decisionTimeline,
  construction_province: formData.constructionProvince,
  developer_type: formData.developerType,
  government_programs: formData.governmentPrograms,
  project_description: sanitizeInput(formData.projectDescription || ""),

  // Scoring & Routing Fields (4)
  ai_priority_score: priorityData.score,
  customer_tier: customerTier,
  build_canada_eligible: formData.buildCanadaEligible,
  tags_array: tags,

  // SLA Field (1)
  response_time: priorityData.responseTime,

  // A2P 10DLC
  a2p_campaign_id: process.env.A2P_CAMPAIGN_ID || 'PLACEHOLDER_CAMPAIGN_ID',

  // Consent fields (conditional)
  ...(formData.consentMarketing && {
    casl_consent: true,
    consent_timestamp: new Date().toISOString()
  }),
  ...(formData.consentSMS && {
    sms_consent: true,
    sms_timestamp: new Date().toISOString()
  }),
  ...(formData.marketingConsent && {
    marketing_consent: true,
    marketing_timestamp: new Date().toISOString()
  })
};
```

### Phone Number Formatting

All phone numbers are converted to E.164 format before sending to GHL:

**Function:** `formatPhoneNumber(phone: string)`
**Location:** `server/storage.ts` lines 260-316

**Examples:**
- Input: `4165551234` → Output: `+14165551234` (Canadian number)
- Input: `14165551234` → Output: `+14165551234` (11-digit with country code)
- Input: `+14165551234` → Output: `+14165551234` (already E.164)
- Input: `+297 297 1234` → Output: `+2972971234` (Aruba number)

### Webhook Security & Validation

**Payload Size Limit:** 100KB (102,400 bytes)
**Location:** `server/storage.ts` lines 431-436

```typescript
const payloadSize = JSON.stringify(webhookPayload).length;
if (payloadSize > 102400) { // 100KB hard limit
  console.error(`[SECURITY] Payload exceeds 100KB limit: ${Math.round(payloadSize/1024)}KB`);
  throw new Error(`Webhook payload too large: ${Math.round(payloadSize/1024)}KB (max 100KB)`);
}
```

---

## Tag Generation Logic

### Tag Generation Function

**Function:** `generateCustomerTags()`
**Location:** `server/storage.ts` lines 487-545

**Maximum Tags:** 12 (enforced with `.slice(0, 12)`)

### Complete Tag List & Generation Rules

| Tag Name | Condition | Logic | Points Value |
|----------|-----------|-------|--------------|
| **Elite** | Elite tier | `units >= 200` | Tier indicator |
| **Preferred** | Preferred tier | `units >= 50 && units < 200` | Tier indicator |
| **Pioneer** | Pioneer tier | `units >= 10 && units < 50` | Tier indicator |
| **Dev-Indigenous** | Indigenous developer | `developerType.includes('Indigenous')` | +15 score points |
| **Government-Participating** | Active gov programs | `governmentPrograms === 'Participating in government programs'` OR `'Currently participating'` | +20 score points |
| **Priority-Province** | Priority province | `['Alberta', 'British Columbia', 'Ontario', 'Northwest Territories'].includes(constructionProvince)` | +10 score points |
| **ESG-Eligible** | Build Canada eligible | `buildCanadaEligible === 'Yes'` (exact match) | +5 score points |
| **Urgent** | Immediate + high volume | `decisionTimeline === 'Immediate (0-3 months)' && units >= 50` | Workflow priority |
| **CASL-Compliant** | Marketing consent given | `consentMarketing === true` | Legal compliance |
| **SMS-Opted-In** | SMS consent given | `consentSMS === true` | A2P 10DLC compliance |
| **Marketing-Opted-In** | Optional marketing consent | `marketingConsent === true` | Marketing automation |

**Code Location:** `server/storage.ts` lines 488-544

```typescript
function generateCustomerTags(data: AssessmentFormData, customerTier: string, priorityLevel: string): string[] {
  const tags: string[] = [];
  const units = parseInt(data.projectUnitCount.toString());

  // 1. Tier tag
  if (units >= 200) tags.push('Elite');
  else if (units >= 50) tags.push('Preferred');
  else if (units >= 10) tags.push('Pioneer');

  // 2. Priority tags removed - use ai_priority_score in GHL workflows instead

  // 3. Conditional tags
  if (data.developerType?.includes('Indigenous')) {
    tags.push('Dev-Indigenous');
  }

  if (['Participating in government programs', 'Currently participating']
      .includes(data.governmentPrograms || '')) {
    tags.push('Government-Participating');
  }

  const priorityProvinces = ['Alberta', 'British Columbia', 'Ontario', 'Northwest Territories'];
  if (priorityProvinces.includes(data.constructionProvince || '')) {
    tags.push('Priority-Province');
  }

  if (data.buildCanadaEligible === 'Yes') {
    tags.push('ESG-Eligible');
  }

  if (data.decisionTimeline === 'Immediate (0-3 months)' && units >= 50) {
    tags.push('Urgent');
  }

  // 4. Consent tags
  if (data.consentMarketing === true) tags.push('CASL-Compliant');
  if (data.consentSMS === true) tags.push('SMS-Opted-In');
  if (data.marketingConsent === true) tags.push('Marketing-Opted-In');

  // Remove legacy tags
  const legacyTags = new Set([
    'optimized-tags', 'agent-yes', 'no-agent', 'no-direct',
    'government-active', 'government-priority'
  ]);

  const cleanedTags = tags.filter(tag => !legacyTags.has(tag));
  return Array.from(new Set(cleanedTags)).slice(0, 12);
}
```

### Tag Examples by Scenario

#### Example 1: Maximum Score Scenario (100 points)
- **Input:** 200+ units, Immediate, Government Programs, Indigenous, Priority Province, Build Canada Yes
- **Tags Generated:** `['Elite', 'Dev-Indigenous', 'Government-Participating', 'Priority-Province', 'ESG-Eligible', 'Urgent', 'CASL-Compliant']`
- **Tag Count:** 7 tags

#### Example 2: Pioneer with Consent Only
- **Input:** 25 units, Long-term, No government, Non-Indigenous, Quebec, Build Canada No, Marketing Opted-In
- **Tags Generated:** `['Pioneer', 'CASL-Compliant', 'Marketing-Opted-In']`
- **Tag Count:** 3 tags

#### Example 3: Preferred with Priority Province
- **Input:** 100 units, Medium-term, Not participating, Private Developer, Alberta, Build Canada Yes
- **Tags Generated:** `['Preferred', 'Priority-Province', 'ESG-Eligible', 'CASL-Compliant']`
- **Tag Count:** 4 tags

---

## Form Input Field Mapping

### Complete Form Input Fields

**Schema Location:** `shared/schema.ts` lines 36-199

### Table 1: All Form Inputs and Their Contribution to Priority Score

| Field Name | Form Label | Data Type | Score Impact | Points Range | Validation | Required |
|------------|------------|-----------|--------------|--------------|------------|----------|
| `readiness` | "Project Timeline" | Enum | None (qualification only) | N/A | 4 options: planning-long/medium/short/immediate | Yes |
| `firstName` | "First Name" | String | None | N/A | 2-50 chars, letters/spaces only | Yes |
| `lastName` | "Last Name" | String | None | N/A | 2-50 chars, letters/spaces only | Yes |
| `email` | "Email Address" | String | None | N/A | Valid email format | Yes |
| `phone` | "Phone Number" | String (E.164) | None | N/A | Valid international phone | Yes |
| `company` | "Company/Organization" | String | None | N/A | 1-100 chars, defaults "Individual Investor" for Pioneer | Yes |
| `projectUnitCount` | "Number of Units" | Integer | **Unit Volume Score** | 15/40/50 pts | 10-1,000,000 (min 10 for B2B) | Yes |
| `decisionTimeline` | "Delivery Timeline" | Enum | **Urgency Bonus** (conditional) | +5 pts | 4 options: Immediate/Short/Medium/Long-term | Yes |
| `constructionProvince` | "Construction Province" | Enum | **Priority Province** | +10 pts | 13 provinces/territories | Yes |
| `developerType` | "Developer Type" | Enum | **Indigenous Score** | +15 pts | 6 types | Yes |
| `governmentPrograms` | "Government Program Participation" | Enum | **Government Score** | +20 pts | 2 options: Participating/Not participating | Yes |
| `buildCanadaEligible` | "Build Canada Eligible?" | Enum | **ESG Score** | +5 pts | 3 options: Yes/No/I don't know | Yes |
| `projectDescription` | "Project Description (Optional)" | Text | None | N/A | Max 1000 chars, sanitized | No |
| `consentMarketing` | "CASL Consent (Required)" | Boolean | None (generates tag) | N/A | Must be true to submit | Yes |
| `consentSMS` | "SMS Consent (Optional)" | Boolean | None (generates tag) | N/A | Optional A2P 10DLC | No |
| `marketingConsent` | "Marketing Updates (Optional)" | Boolean | None (generates tag) | N/A | Optional marketing | No |
| `ageVerification` | "Age 18+ Verification" | Boolean | None | N/A | Must be true to submit | Yes |

### Scoring Impact Summary

**Direct Score Contributors (6 fields):**
1. `projectUnitCount` → Unit Volume Score (15/40/50 points)
2. `governmentPrograms` → Government Score (0 or 20 points)
3. `developerType` → Indigenous Score (0 or 15 points)
4. `constructionProvince` → Priority Province (0 or 10 points)
5. `buildCanadaEligible` → ESG Score (0 or 5 points)
6. `decisionTimeline` (combined with tier) → Urgency Bonus (0 or 5 points)

**Indirect Contributors (generate tags but no direct score):**
- `consentMarketing` → "CASL-Compliant" tag
- `consentSMS` → "SMS-Opted-In" tag
- `marketingConsent` → "Marketing-Opted-In" tag

**Non-scoring Fields (contact/metadata):**
- `firstName`, `lastName`, `email`, `phone`, `company`, `readiness`, `projectDescription`

### Field Mapping: Frontend → Backend

**Location:** `server/routes.ts` lines 16-182

| Frontend Field | Backend Field | Transformation |
|----------------|---------------|----------------|
| `unitCount` | `projectUnitCount` | Parse integer |
| `timeline` | `decisionTimeline` | Enum normalization |
| `province` | `constructionProvince` | Direct mapping |
| `companyName` | `company` | Default "Individual Investor" for Pioneer |
| `consentCommunications` | `consentMarketing` | Boolean conversion |
| `readinessToBuy` | `readiness` | Enum normalization |

---

## Test Results & Scenarios

### Test Suite Overview

**Test File:** `test-scoring-algorithm.ts`
**Total Tests:** 35 scenarios
**Pass Rate:** 100% (35/35 passing)
**Coverage Areas:**
- All 3 tiers (Pioneer, Preferred, Elite)
- All 5 scoring factors
- Urgency bonus conditions
- SLA/response time thresholds
- Boundary cases (49/50 units, 199/200 units)
- Government program variations
- Province priority vs. non-priority
- Build Canada eligibility options

### Test Results Summary

```
═══════════════════════════════════════════════════════════════
AI PRIORITY SCORING ALGORITHM - COMPREHENSIVE TEST SUITE
Specification: 2025+ Optimized (B2B Only, 3 Tiers)
═══════════════════════════════════════════════════════════════

Total Tests: 35
✅ Passed: 35
❌ Failed: 0
Success Rate: 100.0%
```

### Example Test Scenarios

#### Test 1: Maximum Score (100 points)
**Scenario:** Elite tier with all bonuses
- **Inputs:** 200 units, Immediate, Government Programs, Indigenous, BC, Build Canada Yes
- **Expected Score:** 100 (capped from 105)
- **Breakdown:** 50 (elite) + 5 (urgency) + 20 (gov) + 15 (indigenous) + 10 (province) + 5 (ESG) = 105 → 100
- **Tier:** Elite
- **Response Time:** 2 hours
- **Result:** ✅ PASS

#### Test 2: Pioneer Minimum (15 points)
**Scenario:** Smallest B2B partnership
- **Inputs:** 10 units, Long-term, No government, Private Developer, Quebec, Build Canada No
- **Expected Score:** 15
- **Breakdown:** 15 (pioneer) only
- **Tier:** Pioneer
- **Response Time:** 72 hours
- **Result:** ✅ PASS

#### Test 3: Urgency Bonus - Pioneer (NO BONUS)
**Scenario:** Verify Pioneer tier doesn't get urgency bonus
- **Inputs:** 30 units, Immediate, Not participating, Private Developer, Quebec, Build Canada No
- **Expected Score:** 15
- **Breakdown:** 15 (pioneer) - NO urgency bonus
- **Tier:** Pioneer
- **Response Time:** 72 hours
- **Result:** ✅ PASS

#### Test 4: Boundary Test - 50 Units
**Scenario:** Verify 50 units = Preferred tier
- **Inputs:** 50 units, Medium-term, Not participating, Private Developer, Quebec, Build Canada No
- **Expected Score:** 40
- **Breakdown:** 40 (preferred)
- **Tier:** Preferred
- **Response Time:** 24 hours
- **Result:** ✅ PASS

#### Test 5: Boundary Test - 199 Units
**Scenario:** Verify 199 units = Preferred tier (not Elite)
- **Inputs:** 199 units, Medium-term, Not participating, Private Developer, Quebec, Build Canada No
- **Expected Score:** 40
- **Breakdown:** 40 (preferred)
- **Tier:** Preferred
- **Response Time:** 24 hours
- **Result:** ✅ PASS

#### Test 6: Boundary Test - 200 Units
**Scenario:** Verify 200 units = Elite tier
- **Inputs:** 200 units, Medium-term, Not participating, Private Developer, Quebec, Build Canada No
- **Expected Score:** 50
- **Breakdown:** 50 (elite)
- **Tier:** Elite
- **Response Time:** 24 hours
- **Result:** ✅ PASS

### Response Time (SLA) Validation

| Score Range | Expected SLA | Test Case | Result |
|-------------|--------------|-----------|--------|
| 80-100 | 2 hours | Elite with all bonuses (100 points) | ✅ PASS |
| 60-79 | 6 hours | Elite with province + ESG (65 points) | ✅ PASS |
| 40-59 | 24 hours | Preferred base (40 points) | ✅ PASS |
| 0-39 | 72 hours | Pioneer base (15 points) | ✅ PASS |

**Code Location:** `shared/utils/scoring.ts` lines 46-52

```typescript
function getResponseTime(normalizedScore: number): string {
  if (normalizedScore >= 80) return "2 hours";
  if (normalizedScore >= 60) return "6 hours";
  if (normalizedScore >= 40) return "24 hours";
  return "72 hours";
}
```

---

## Technical Implementation Details

### Architecture Overview

```
Frontend (assessment-form.tsx)
    ↓ User submits form
Backend (routes.ts)
    ↓ Field mapping & validation
Validation (storage.ts → validateFormData)
    ↓ Sanitization & schema check
Scoring (shared/utils/scoring.ts)
    ↓ Calculate score & tier
Webhook (storage.ts → submitToGoHighLevel)
    ↓ Generate tags & payload
GoHighLevel CRM
    ↓ Contact creation & automation
```

### Key Functions

#### 1. `calculatePriorityScore(data: AssessmentFormData)`
**File:** `shared/utils/scoring.ts` lines 55-185
- **Input:** Form data (validated)
- **Output:** `{ score: number, breakdown: AIScoringBreakdown }`
- **Logic:**
  1. Parse unit count
  2. Determine tier (10-49 Pioneer, 50-199 Preferred, 200+ Elite)
  3. Calculate 5 factor scores
  4. Apply urgency bonus if qualified
  5. Normalize to 100 max
  6. Determine response time SLA

#### 2. `validateFormData(rawData: any)`
**File:** `server/storage.ts` lines 147-252
- **Input:** Raw POST data
- **Output:** `{ isValid: boolean, data?: AssessmentFormData, errors?: any[], priorityScore?: number, customerTier?: string, priorityLevel?: string, tags?: string[] }`
- **Logic:**
  1. Sanitize all inputs with DOMPurify
  2. Format phone to E.164
  3. Validate against Zod schema
  4. Calculate priority score
  5. Determine tier
  6. Generate tags

#### 3. `submitToGoHighLevel(formData, priorityScore, customerTier, priorityLevel, tags)`
**File:** `server/storage.ts` lines 345-466
- **Input:** Validated form data + calculated scores/tags
- **Output:** Promise<void> (fire-and-forget)
- **Logic:**
  1. Build webhook payload (21+ fields)
  2. Validate payload size (<100KB)
  3. POST to GHL webhook URL
  4. Log success/failure

#### 4. `generateCustomerTags(data, customerTier, priorityLevel)`
**File:** `server/storage.ts` lines 487-545
- **Input:** Form data + tier + priority level
- **Output:** Array of tag strings (max 12)
- **Logic:**
  1. Add tier tag (Pioneer/Preferred/Elite)
  2. Add conditional tags (Indigenous, Government, Priority Province, ESG, Urgent)
  3. Add consent tags (CASL, SMS, Marketing)
  4. Remove legacy tags
  5. Deduplicate
  6. Limit to 12 tags

### Security Features

#### Input Sanitization
**Location:** `server/storage.ts` line 318-321
```typescript
function sanitizeInput(input: string | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input.toString()).trim();
}
```

#### Phone Number Validation
**Schema:** `shared/schema.ts` lines 57-107
- Uses `libphonenumber-js` for international validation
- Transforms to E.164 format
- Preserves international numbers (e.g., Aruba +297)
- Validates before saving

#### CSRF Protection
**Route:** `/api/csrf-token`
- CSRF tokens generated on form load
- Validated on submission
- Rotating tokens per session

#### Rate Limiting
**Location:** `server/routes.ts` lines 283-300
- 5000 requests per 15 minutes (production)
- 10000 requests per 15 minutes (development)
- Slow-down after threshold
- Brute force protection on sensitive endpoints

#### Payload Size Limits
- **Max Webhook Payload:** 100KB (102,400 bytes)
- **Max Project Description:** 1000 characters
- **Max Company Name:** 250 characters

### Validation Rules

#### Required Fields (12 total)
1. `readiness` - Project timeline
2. `firstName` - First name (2-50 chars)
3. `lastName` - Last name (2-50 chars)
4. `email` - Valid email
5. `phone` - Valid international phone
6. `company` - Company/organization name
7. `projectUnitCount` - Number of units (10-1,000,000)
8. `decisionTimeline` - Delivery timeline
9. `constructionProvince` - Province/territory
10. `developerType` - Developer type
11. `governmentPrograms` - Government participation
12. `buildCanadaEligible` - Build Canada eligibility

#### Legal Consents (2 required)
1. `consentMarketing` - CASL consent (must be true)
2. `ageVerification` - 18+ verification (must be true)

#### Optional Fields
- `projectDescription` - Max 1000 chars
- `consentSMS` - A2P 10DLC SMS consent
- `marketingConsent` - Optional marketing updates

### Error Handling

#### Frontend Validation
**Location:** `client/src/components/assessment-form.tsx`
- Real-time validation on blur
- Visual error messages
- Prevents submission if invalid

#### Backend Validation
**Location:** `server/routes.ts` + `server/storage.ts`
- Zod schema validation
- Sanitization before validation
- Detailed error messages returned to frontend

#### Webhook Failure Handling
**Location:** `server/storage.ts` lines 462-465
```typescript
} catch (error) {
  console.error(`GoHighLevel webhook failed:`, error);
  // Don't throw - let form submission succeed even if webhook fails
}
```
- Form submission succeeds even if webhook fails
- Error logged for monitoring
- User sees success message

---

## Appendix: Field Enums

### Readiness Options
```typescript
"planning-long"     // 12+ months
"planning-medium"   // 6-12 months
"planning-short"    // 3-6 months
"immediate"         // 0-3 months
```

### Decision Timeline Options
```typescript
"Immediate (0-3 months)"
"Short-term (3-6 months)"
"Medium-term (6-12 months)"
"Long-term (12+ months)"
```

### Construction Province Options
```typescript
"Ontario"
"British Columbia"
"Alberta"
"Quebec"
"Nova Scotia"
"New Brunswick"
"Manitoba"
"Saskatchewan"
"Newfoundland and Labrador"
"Prince Edward Island"
"Northwest Territories"
"Nunavut"
"Yukon"
```

### Developer Type Options
```typescript
"Indigenous Community/Organization"      // +15 score points
"Commercial Developer (Large Projects)"
"Government/Municipal Developer"
"Non-Profit Housing Developer"
"Private Developer (Medium Projects)"
"Individual/Family Developer"
```

### Government Programs Options
```typescript
"Participating in government programs"   // +20 score points
"Not participating"                      // 0 points
```

### Build Canada Eligible Options
```typescript
"Yes"              // +5 score points
"No"               // 0 points
"I don't know"     // 0 points
```

---

## Quick Reference Tables

### Table 2: All Possible Tier Assignments

| Tier | Unit Range | Base Score | Max Possible Score | Icon | Color | Response Commitment |
|------|------------|------------|-------------------|------|-------|---------------------|
| Pioneer | 10-49 | 15 | 65 | 🚀 | Purple | Enhanced Partnership Priority |
| Preferred | 50-199 | 40 | 95 | ⭐ | Orange | Executive Partnership Track |
| Elite | 200+ | 50 | 100 | 👑 | Red | VIP Implementation Support |

**Max Score Calculations:**
- **Pioneer Max (65):** 15 (base) + 20 (gov) + 15 (indigenous) + 10 (province) + 5 (ESG) = 65 (no urgency bonus)
- **Preferred Max (95):** 40 (base) + 5 (urgency) + 20 (gov) + 15 (indigenous) + 10 (province) + 5 (ESG) = 95
- **Elite Max (100):** 50 (base) + 5 (urgency) + 20 (gov) + 15 (indigenous) + 10 (province) + 5 (ESG) = 105 → **capped at 100**

### Table 3: All Custom Fields in GHL Webhook Payload

| Category | Field Count | Fields |
|----------|-------------|--------|
| **Core Contact** | 5 | first_name, last_name, email, phone, company |
| **Core Project** | 6 | project_unit_count, delivery_timeline, construction_province, developer_type, government_programs, project_description |
| **Scoring & Routing** | 4 | ai_priority_score, customer_tier, build_canada_eligible, tags_array |
| **SLA** | 1 | response_time |
| **Compliance** | 1 | a2p_campaign_id |
| **Consents (Conditional)** | 6 | casl_consent, consent_timestamp, sms_consent, sms_timestamp, marketing_consent, marketing_timestamp |
| **TOTAL** | 23 | Maximum 23 fields per payload |

### Table 4: All Tags and Generation Logic

| Tag | Trigger Condition | Category | Max Count |
|-----|-------------------|----------|-----------|
| Elite | units >= 200 | Tier | 1 |
| Preferred | units >= 50 && units < 200 | Tier | 1 |
| Pioneer | units >= 10 && units < 50 | Tier | 1 |
| Dev-Indigenous | developerType includes 'Indigenous' | Scoring Factor | 1 |
| Government-Participating | governmentPrograms = 'Participating' | Scoring Factor | 1 |
| Priority-Province | Province in [AB, BC, ON, NWT] | Scoring Factor | 1 |
| ESG-Eligible | buildCanadaEligible = 'Yes' | Scoring Factor | 1 |
| Urgent | Immediate timeline + units >= 50 | Priority | 1 |
| CASL-Compliant | consentMarketing = true | Legal | 1 |
| SMS-Opted-In | consentSMS = true | Legal | 1 |
| Marketing-Opted-In | marketingConsent = true | Marketing | 1 |
| **TOTAL** | - | - | **Max 12** |

---

## Validation Test Scenarios

### Scenario Matrix

| Scenario | Units | Timeline | Gov Programs | Developer Type | Province | Build Canada | Expected Score | Expected Tier | Expected Tags |
|----------|-------|----------|--------------|----------------|----------|--------------|----------------|---------------|---------------|
| Max Score | 200 | Immediate | Participating | Indigenous | BC | Yes | 100 | Elite | 7 tags |
| Min Score | 10 | Long-term | Not participating | Private | Quebec | No | 15 | Pioneer | 1 tag |
| Pioneer + Gov | 25 | Medium | Participating | Non-Profit | NS | I don't know | 35 | Pioneer | 2 tags |
| Preferred + Urgent | 100 | Immediate | Not participating | Commercial | Saskatchewan | Yes | 50 | Preferred | 3 tags |
| Elite Base | 300 | Long-term | Not participating | Private | Manitoba | No | 50 | Elite | 1 tag |
| Boundary 49 | 49 | Medium | Not participating | Private | Quebec | No | 15 | Pioneer | 1 tag |
| Boundary 50 | 50 | Medium | Not participating | Private | Quebec | No | 40 | Preferred | 1 tag |
| Boundary 199 | 199 | Medium | Not participating | Private | Quebec | No | 40 | Preferred | 1 tag |
| Boundary 200 | 200 | Medium | Not participating | Private | Quebec | No | 50 | Elite | 1 tag |

---

## Conclusion

The ILLUMMAA AI Priority Scoring System is a robust, well-tested algorithm that:

1. **Accurately scores** B2B partnership opportunities on a 0-100 scale
2. **Assigns tiers** based on project volume (Pioneer/Preferred/Elite)
3. **Generates tags** for CRM automation and workflow routing
4. **Delivers complete data** to GoHighLevel via optimized webhook payload
5. **Maintains security** with input sanitization, validation, and rate limiting
6. **Achieves 100% test coverage** with 35 passing test scenarios

**Key Strengths:**
- ✅ Clear separation of concerns (scoring, validation, webhook delivery)
- ✅ Comprehensive test suite with boundary case coverage
- ✅ Secure input handling with DOMPurify and Zod validation
- ✅ Flexible phone number support (international E.164 format)
- ✅ Tag optimization (max 12 tags, no redundancy)
- ✅ SLA-based response time commitments
- ✅ B2B-focused with minimum 10 units requirement

**Files Referenced:**
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\shared\utils\scoring.ts`
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\server\storage.ts`
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\server\routes.ts`
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\shared\schema.ts`
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\client\src\components\assessment-form.tsx`
- `C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa-github\test-scoring-algorithm.ts`

---

**Report End**
