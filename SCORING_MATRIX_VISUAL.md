# ILLUMMAA AI Priority Scoring Matrix - Visual Reference

**Quick Reference Guide for Priority Score Calculation**

---

## Scoring Formula (Maximum 105 points → Normalized to 100)

```
TOTAL SCORE = Unit Volume + Government + Indigenous + Priority Province + ESG + Urgency Bonus
```

---

## Scoring Factors Breakdown

### 1. UNIT VOLUME (50 points max)

```
┌──────────────────────────────────────────────────────────────┐
│  PIONEER TIER (10-49 units)           →  15 points           │
│  ────────────────────────────────────────────────────────    │
│  10  15  20  25  30  35  40  45  49                          │
│  └──────────────────────────────────┘                        │
│                                                               │
│  PREFERRED TIER (50-199 units)         →  40 points          │
│  ────────────────────────────────────────────────────────    │
│  50  60  75  100  125  150  175  199                         │
│  └─────────────────────────────────────┘                     │
│                                                               │
│  ELITE TIER (200+ units)               →  50 points          │
│  ────────────────────────────────────────────────────────    │
│  200  300  500  1000+                                        │
│  └─────────────────────────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

**Tier Boundaries:**
- 49 units = Pioneer (15 pts)
- 50 units = Preferred (40 pts) ⚡ **Tier Jump +25 pts**
- 199 units = Preferred (40 pts)
- 200 units = Elite (50 pts) ⚡ **Tier Jump +10 pts**

---

### 2. GOVERNMENT PROGRAMS (20 points max)

```
┌──────────────────────────────────────────────────────────────┐
│  "Participating in government programs"  →  +20 points       │
│  "Not participating"                     →   0 points        │
└──────────────────────────────────────────────────────────────┘
```

**Binary Score:** All or nothing

---

### 3. INDIGENOUS COMMUNITIES (15 points max)

```
┌──────────────────────────────────────────────────────────────┐
│  Developer Type: "Indigenous Community/Organization"         │
│                                          →  +15 points       │
│                                                               │
│  All Other Developer Types               →   0 points        │
└──────────────────────────────────────────────────────────────┘
```

**Developer Types:**
- Indigenous Community/Organization → **+15 pts**
- Commercial Developer (Large Projects) → 0 pts
- Government/Municipal Developer → 0 pts
- Non-Profit Housing Developer → 0 pts
- Private Developer (Medium Projects) → 0 pts
- Individual/Family Developer → 0 pts

---

### 4. PRIORITY PROVINCES (10 points max)

```
┌──────────────────────────────────────────────────────────────┐
│  PRIORITY PROVINCES (4 total)            →  +10 points       │
│  ────────────────────────────────────────────────────────    │
│  • Alberta (AB)                                              │
│  • British Columbia (BC)                                     │
│  • Ontario (ON)                                              │
│  • Northwest Territories (NWT)                               │
│                                                               │
│  ALL OTHER PROVINCES/TERRITORIES         →   0 points        │
│  ────────────────────────────────────────────────────────    │
│  • Quebec (QC)                                               │
│  • Nova Scotia (NS)                                          │
│  • New Brunswick (NB)                                        │
│  • Manitoba (MB)                                             │
│  • Saskatchewan (SK)                                         │
│  • Newfoundland and Labrador (NL)                            │
│  • Prince Edward Island (PE)                                 │
│  • Nunavut (NU)                                              │
│  • Yukon (YT)                                                │
└──────────────────────────────────────────────────────────────┘
```

---

### 5. ESG/BUILD CANADA (5 points max)

```
┌──────────────────────────────────────────────────────────────┐
│  Build Canada Eligible: "Yes"            →  +5 points        │
│  Build Canada Eligible: "No"             →   0 points        │
│  Build Canada Eligible: "I don't know"   →   0 points        │
└──────────────────────────────────────────────────────────────┘
```

**User Self-Certification:** Only "Yes" awards points

---

### 6. URGENCY BONUS (5 points max)

```
┌──────────────────────────────────────────────────────────────┐
│  CONDITIONS (BOTH must be true):                             │
│  ✓ Timeline = "Immediate (0-3 months)"                       │
│  ✓ Tier = Preferred OR Elite                                 │
│                                          →  +5 points        │
│                                                               │
│  DOES NOT APPLY TO PIONEER TIER!        →   0 points        │
└──────────────────────────────────────────────────────────────┘
```

**Examples:**
- ✅ 100 units + Immediate → +5 pts (Preferred tier qualifies)
- ✅ 300 units + Immediate → +5 pts (Elite tier qualifies)
- ❌ 30 units + Immediate → 0 pts (Pioneer tier excluded)
- ❌ 100 units + Short-term → 0 pts (Not immediate)

---

## Score Examples

### Example 1: Maximum Score (100 points)

```
Project Details:
├─ Units: 500 (Elite Tier)
├─ Timeline: Immediate (0-3 months)
├─ Government Programs: Participating
├─ Developer Type: Indigenous Community/Organization
├─ Province: British Columbia
└─ Build Canada: Yes

Calculation:
├─ Unit Volume:       50 pts (Elite)
├─ Urgency Bonus:      5 pts ✓ (Immediate + Elite)
├─ Government:        20 pts ✓
├─ Indigenous:        15 pts ✓
├─ Priority Province: 10 pts ✓ (BC)
├─ ESG/Build Canada:   5 pts ✓
├─ Raw Score:        105 pts
└─ Normalized:       100 pts (capped)

Tags: Elite, Dev-Indigenous, Government-Participating,
      Priority-Province, ESG-Eligible, Urgent, CASL-Compliant

Response Time: 2 hours
```

---

### Example 2: Pioneer Minimum (15 points)

```
Project Details:
├─ Units: 10 (Pioneer Tier)
├─ Timeline: Long-term (12+ months)
├─ Government Programs: Not participating
├─ Developer Type: Private Developer (Medium Projects)
├─ Province: Quebec
└─ Build Canada: No

Calculation:
├─ Unit Volume:       15 pts (Pioneer)
├─ Urgency Bonus:      0 pts (Long-term)
├─ Government:         0 pts
├─ Indigenous:         0 pts
├─ Priority Province:  0 pts (Quebec)
├─ ESG/Build Canada:   0 pts
└─ Total Score:       15 pts

Tags: Pioneer, CASL-Compliant

Response Time: 72 hours
```

---

### Example 3: Preferred with Multiple Bonuses (75 points)

```
Project Details:
├─ Units: 150 (Preferred Tier)
├─ Timeline: Immediate (0-3 months)
├─ Government Programs: Participating
├─ Developer Type: Non-Profit Housing Developer
├─ Province: Ontario
└─ Build Canada: I don't know

Calculation:
├─ Unit Volume:       40 pts (Preferred)
├─ Urgency Bonus:      5 pts ✓ (Immediate + Preferred)
├─ Government:        20 pts ✓
├─ Indigenous:         0 pts
├─ Priority Province: 10 pts ✓ (Ontario)
├─ ESG/Build Canada:   0 pts (I don't know)
└─ Total Score:       75 pts

Tags: Preferred, Government-Participating, Priority-Province,
      Urgent, CASL-Compliant

Response Time: 6 hours
```

---

### Example 4: Elite Base Score (50 points)

```
Project Details:
├─ Units: 200 (Elite Tier - minimum)
├─ Timeline: Medium-term (6-12 months)
├─ Government Programs: Not participating
├─ Developer Type: Commercial Developer (Large Projects)
├─ Province: Manitoba
└─ Build Canada: No

Calculation:
├─ Unit Volume:       50 pts (Elite)
├─ Urgency Bonus:      0 pts (Medium-term)
├─ Government:         0 pts
├─ Indigenous:         0 pts
├─ Priority Province:  0 pts (Manitoba)
├─ ESG/Build Canada:   0 pts
└─ Total Score:       50 pts

Tags: Elite, CASL-Compliant

Response Time: 24 hours
```

---

### Example 5: Pioneer with Government (35 points)

```
Project Details:
├─ Units: 25 (Pioneer Tier)
├─ Timeline: Medium-term (6-12 months)
├─ Government Programs: Participating
├─ Developer Type: Government/Municipal Developer
├─ Province: Nova Scotia
└─ Build Canada: I don't know

Calculation:
├─ Unit Volume:       15 pts (Pioneer)
├─ Urgency Bonus:      0 pts (Medium-term)
├─ Government:        20 pts ✓
├─ Indigenous:         0 pts
├─ Priority Province:  0 pts (Nova Scotia)
├─ ESG/Build Canada:   0 pts (I don't know)
└─ Total Score:       35 pts

Tags: Pioneer, Government-Participating, CASL-Compliant

Response Time: 72 hours
```

---

## Response Time (SLA) Thresholds

```
┌──────────────────────────────────────────────────────────────┐
│  SCORE RANGE    │  RESPONSE TIME  │  PRIORITY LEVEL         │
│  ──────────────────────────────────────────────────────────  │
│  80-100 points  │   2 hours       │  Critical (Immediate)   │
│  60-79 points   │   6 hours       │  High (Same Day)        │
│  40-59 points   │   24 hours      │  Standard (Next Day)    │
│  0-39 points    │   72 hours      │  Low (3 Days)           │
└──────────────────────────────────────────────────────────────┘
```

**Assignment Logic:**
- **80+ pts** → Senior Sales Manager (2-hour response)
- **50-79 pts** → Sales Representative (6-24 hour response)
- **0-49 pts** → Lead Development Team (24-72 hour response)

---

## Tag Generation Matrix

### Tier Tags (Mutually Exclusive - 1 tag)

```
┌──────────────────────────────────────────────────────────────┐
│  10-49 units     →  "Pioneer"                                │
│  50-199 units    →  "Preferred"                              │
│  200+ units      →  "Elite"                                  │
└──────────────────────────────────────────────────────────────┘
```

### Scoring Factor Tags (Conditional)

```
┌──────────────────────────────────────────────────────────────┐
│  Indigenous Developer         →  "Dev-Indigenous"            │
│  Government Programs Active   →  "Government-Participating"  │
│  Priority Province (4 only)   →  "Priority-Province"         │
│  Build Canada Eligible: Yes   →  "ESG-Eligible"              │
└──────────────────────────────────────────────────────────────┘
```

### Priority Tags (Conditional)

```
┌──────────────────────────────────────────────────────────────┐
│  Immediate Timeline + 50+ units  →  "Urgent"                 │
└──────────────────────────────────────────────────────────────┘
```

### Consent Tags (Conditional)

```
┌──────────────────────────────────────────────────────────────┐
│  CASL Consent (required)         →  "CASL-Compliant"         │
│  SMS Consent (optional)          →  "SMS-Opted-In"           │
│  Marketing Consent (optional)    →  "Marketing-Opted-In"     │
└──────────────────────────────────────────────────────────────┘
```

**Maximum Tags:** 12 (enforced with `.slice(0, 12)`)

---

## Tier Progression Examples

### Scenario: Same Project, Increasing Unit Count

```
┌──────────────────────────────────────────────────────────────┐
│  BOUNDARY TESTING - TIER JUMPS                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  49 units  →  Pioneer    (15 pts)                            │
│               ↓ +1 unit                                      │
│  50 units  →  Preferred  (40 pts)  ⚡ +25 point jump!        │
│               ↓ +149 units                                   │
│  199 units →  Preferred  (40 pts)  (same tier)               │
│               ↓ +1 unit                                      │
│  200 units →  Elite      (50 pts)  ⚡ +10 point jump!        │
│               ↓ +300 units                                   │
│  500 units →  Elite      (50 pts)  (same tier)               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Key Insight:** The biggest scoring jump is from Pioneer to Preferred (+25 pts)

---

## Common Scoring Scenarios

### High-Priority Combinations

| Scenario | Score | Tags | SLA |
|----------|-------|------|-----|
| Elite + All Bonuses | 100 | 7 tags | 2 hours |
| Elite + Urgent + Gov | 75 | 4 tags | 6 hours |
| Preferred + All Bonuses | 95 | 7 tags | 2 hours |
| Preferred + Urgent + Priority Province | 55 | 4 tags | 24 hours |
| Indigenous + Government (any tier) | +35 pts | +2 tags | Varies |

### Mid-Priority Combinations

| Scenario | Score | Tags | SLA |
|----------|-------|------|-----|
| Preferred Base | 40 | 1 tag | 24 hours |
| Elite Base | 50 | 1 tag | 24 hours |
| Pioneer + Government | 35 | 2 tags | 72 hours |
| Preferred + Priority Province | 50 | 2 tags | 24 hours |

### Low-Priority Combinations

| Scenario | Score | Tags | SLA |
|----------|-------|------|-----|
| Pioneer Base | 15 | 1 tag | 72 hours |
| Pioneer + Priority Province | 25 | 2 tags | 72 hours |
| Pioneer + ESG | 20 | 2 tags | 72 hours |

---

## Validation Rules Quick Reference

### Required Fields (12)
1. Readiness (planning-long/medium/short/immediate)
2. First Name (2-50 chars, letters/spaces only)
3. Last Name (2-50 chars, letters/spaces only)
4. Email (valid format)
5. Phone (E.164 international format)
6. Company (1-100 chars)
7. Project Unit Count (10-1,000,000)
8. Decision Timeline (4 options)
9. Construction Province (13 options)
10. Developer Type (6 options)
11. Government Programs (2 options)
12. Build Canada Eligible (3 options)

### Legal Consents (2 required)
1. CASL Consent (must be true)
2. Age Verification 18+ (must be true)

### Optional Fields (3)
1. Project Description (max 1000 chars)
2. SMS Consent (optional)
3. Marketing Consent (optional)

---

## Score Distribution Analysis

### Theoretical Score Ranges by Tier

```
PIONEER (10-49 units):
├─ Minimum:  15 pts (base only)
├─ Maximum:  65 pts (base + gov + indigenous + province + esg)
└─ Average:  30-40 pts (base + 1-2 bonuses)

PREFERRED (50-199 units):
├─ Minimum:  40 pts (base only)
├─ Maximum:  95 pts (base + urgency + gov + indigenous + province + esg)
└─ Average:  55-70 pts (base + urgency + 1-2 bonuses)

ELITE (200+ units):
├─ Minimum:  50 pts (base only)
├─ Maximum: 100 pts (base + urgency + all bonuses, capped from 105)
└─ Average:  65-85 pts (base + urgency + 2-3 bonuses)
```

---

## File Locations Reference

### Core Scoring Logic
- `shared/utils/scoring.ts` - Main algorithm
- Lines 55-185: `calculatePriorityScore()` function
- Lines 187-196: `determineCustomerTier()` function
- Lines 46-52: `getResponseTime()` SLA mapping

### Validation & Webhook
- `server/storage.ts` - Backend processing
- Lines 147-252: `validateFormData()` function
- Lines 345-466: `submitToGoHighLevel()` webhook
- Lines 487-545: `generateCustomerTags()` function

### Frontend Form
- `client/src/components/assessment-form.tsx`
- Lines 389-439: Tier display logic
- Lines 418-439: Response commitment text

### Schema Validation
- `shared/schema.ts`
- Lines 36-199: Form field validation rules

### Test Suite
- `test-scoring-algorithm.ts`
- 35 comprehensive test scenarios
- 100% pass rate

---

**END OF VISUAL REFERENCE GUIDE**
