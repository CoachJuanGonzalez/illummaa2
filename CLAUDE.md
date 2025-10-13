# PROJECT MEMORY - ILLUMMAA
## B2B Modular Housing Platform (Canada)

### PROJECT OVERVIEW
- **Purpose:** B2B-only platform connecting developers with modular housing solutions
- **Minimum Qualification:** 10 units (residential inquiries redirect to Remax.ca)
- **Business Model:** 3-tier partnership system with AI priority scoring
- **Status:** Production-ready (QA: 98/100, approved for deployment)
- **Domain:** https://illummaa.com
- **Target Market:** Canadian developers, government agencies, Indigenous communities

### BUSINESS MODEL

#### 3-Tier B2B Partnership System
| Tier | Unit Range | Unit Volume Score | Benefits |
|------|------------|-------------------|----------|
| **Pioneer** | 10-49 units | 15 points | Entry-level partnership |
| **Preferred** | 50-199 units | 40 points | Enhanced partnership benefits |
| **Elite** | 200+ units | 50 points | Premium partnership tier |

#### AI Priority Scoring Algorithm (0-100 scale)
**Location:** `shared/utils/scoring.ts` (217 lines) - NEVER MODIFY

**5-Factor Scoring System:**
1. **Unit Volume:** 50 points max (tier-based: 15/40/50)
2. **Government Programs:** 20 points (CMHC First-Time Buyer, Indigenous Housing, Build Canada)
3. **Indigenous Communities:** 15 points (prioritized for housing initiatives)
4. **Priority Provinces:** 10 points (Alberta, BC, Ontario, NWT)
5. **ESG/Build Canada:** 5 points (sustainability programs)
6. **Urgency Bonus:** 5 points (timeline < 6 months)

**Score Ranges:**
- 70-100: High Priority (Elite tier typical)
- 40-69: Medium Priority (Preferred tier typical)
- 0-39: Standard Priority (Pioneer tier typical)

### TECH STACK

#### Frontend
- **React:** 18.3.1 + TypeScript 5.6.3
- **Build Tool:** Vite 5.4.20
- **Routing:** Wouter 3.3.5 (SPA - 5 routes)
- **UI Framework:** Radix UI (18 components) + Tailwind CSS 3.4.17
- **Forms:** React Hook Form 7.55.0 + @hookform/resolvers 3.10.0
- **Validation:** Zod 3.24.2 + libphonenumber-js 1.12.23
- **Icons:** Lucide React 0.453.0
- **State Management:** @tanstack/react-query 5.60.5
- **Sanitization:** isomorphic-dompurify 2.26.0

#### Backend
- **Runtime:** Node.js (ES modules)
- **Framework:** Express 4.21.2
- **Database:** Neon serverless PostgreSQL (via Drizzle ORM 0.39.1)
- **Security:** Helmet 8.1.0, express-rate-limit 8.1.0, express-brute 1.0.1
- **Session:** express-session 1.18.1 + connect-pg-simple 10.0.0
- **Input Sanitization:** DOMPurify 3.2.6, validator 13.15.15

#### Analytics
- **Platform:** Google Analytics 4
- **Environment Variable:** `VITE_GA_MEASUREMENT_ID`
- **Implementation:** `client/src/lib/analytics.ts` (392 lines) - NEVER MODIFY
- **8 Event Types Tracked:**
  1. navigation_click (header/footer nav)
  2. assessment_step_start (form tracking)
  3. assessment_step_complete (step progression)
  4. assessment_complete (full submission)
  5. assessment_abandonment (exit intent)
  6. conversion (qualified lead)
  7. generate_lead (form submission)
  8. page_view (SPA route changes)

#### Deployment
- **Primary:** Replit-ready (plugins configured in vite.config.ts)
- **Alternative:** Railway (app deployment)
- **Current Config:** vite.config.ts (37 lines) - Code splitting ready for Phase 4

### FILE STRUCTURE

#### Local Paths
```
C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\
├── illummaa-github\                    # Main codebase
│   ├── client\                         # Frontend (React)
│   │   ├── src\
│   │   │   ├── lib\
│   │   │   │   └── analytics.ts        # GA4 tracking (392 lines) ⚠️ NEVER MODIFY
│   │   │   ├── pages\                  # Route components (5 pages)
│   │   │   └── App.tsx                 # Entry point + routing
│   │   ├── public\
│   │   │   ├── robots.txt              # SEO crawling (production domain)
│   │   │   └── sitemap.xml             # SEO sitemap (5 URLs)
│   │   └── index.html                  # Meta tags + font optimization
│   ├── server\
│   │   └── routes.ts                   # Security (lines 218-352) ⚠️ NEVER MODIFY
│   ├── shared\
│   │   └── utils\
│   │       └── scoring.ts              # AI algorithm (217 lines) ⚠️ NEVER MODIFY
│   ├── vite.config.ts                  # Build config (code splitting ready)
│   └── package.json                    # Dependencies (71 packages)
├── REPLIT-PROMPT-FULL-JOURNEY-ALL-PHASES-100-PERCENT-SEO-LLM.md  # 67 items, 7 phases
├── REPLIT-PROMPT-SAFETY-AUDIT-REPORT.md                           # 99.5/100 safety rating
├── QA-TEST-REPORT-PRODUCTION-READY.md                             # 98/100 system health
└── [71 .md files]                      # Documentation history
```

#### Google Drive (Once Synced)
```
G:\My Drive\PVRPOSE AI\ILLUMMAA\
```

### CRITICAL FILES - NEVER MODIFY

#### 1. analytics.ts (392 lines)
**Path:** `client/src/lib/analytics.ts`
**Why Critical:** Complete GA4 tracking implementation with 8 event types
**Protected Code Sections:**
- Lines 74-84: `trackNavigation()`
- Lines 87-98: `trackHeaderNavClick()`
- Lines 102-113: `trackFooterNavClick()`
- Lines 135-142: `trackAssessmentStart()`
- Lines 144-158: `trackAssessmentStepComplete()`
- Lines 182-207: `trackAssessmentComplete()`
- Lines 251-257: `trackConversion()`
- Lines 259-271: `trackLeadGeneration()`
- Lines 274-282: `trackRouteChange()` (SPA tracking)

**Impact if Modified:** Loss of analytics data, broken funnel tracking, inability to measure ROI

#### 2. scoring.ts (217 lines)
**Path:** `shared/utils/scoring.ts`
**Why Critical:** AI priority scoring algorithm with 5-factor calculation
**Protected Functions:**
- Lines 55-184: `calculatePriorityScore()` (main algorithm)
- Lines 100-114: Unit volume scoring (tier-based)
- Lines 116-128: Government programs detection
- Lines 130-138: Indigenous communities detection
- Lines 140-152: Priority provinces scoring
- Lines 154-162: ESG/Build Canada detection
- Lines 164-177: Urgency timeline bonus
- Lines 188-196: `determineCustomerTier()` (tier assignment)

**Impact if Modified:** Incorrect lead prioritization, broken CRM workflows, misaligned sales process

#### 3. routes.ts (Lines 218-352)
**Path:** `server/routes.ts`
**Why Critical:** Enterprise-grade security implementation
**Protected Code Sections:**
- Lines 218-247: Helmet security headers (CSP, HSTS, noSniff, frame guard, XSS filter)
- Lines 274-287: Brute force protection (3 retries, 5-60 min lockout)
- Lines 290-335: Multi-tier rate limiting (5000/15min, 100/5min SMS, 200/10min)
- Lines 191-208: IP normalization (X-Forwarded-For handling)

**Impact if Modified:** Security vulnerabilities, DDoS exposure, legal compliance violations

### CURRENT IMPLEMENTATION STATUS

#### Phase 0: Basic SEO (100% Complete ✅)
**Status:** Production-ready, no further action needed

**Completed Items:**
1. ✅ **robots.txt** - Production domain (illummaa.com), crawl delays for aggressive bots
2. ✅ **sitemap.xml** - 5 URLs with production domain (no placeholders)
3. ✅ **Font Optimization** - 90% reduction (25+ fonts → 2 fonts: Inter + Montserrat)
4. ✅ **Meta Tags** - Open Graph, Twitter Cards, descriptions
5. ✅ **Performance Preconnect** - Google Fonts, Google Tag Manager

**Files Modified in Phase 0:**
- `client/public/robots.txt` (25 lines)
- `client/public/sitemap.xml` (45 lines)
- `client/index.html` (59 lines - line 51 for fonts)

#### Phases 1-7: Advanced SEO + LLM (Ready for Implementation)
**Master Roadmap:** `REPLIT-PROMPT-FULL-JOURNEY-ALL-PHASES-100-PERCENT-SEO-LLM.md`
**Total Items:** 67 across 7 phases
**Safety Rating:** 99.5/100 (verified via REPLIT-PROMPT-SAFETY-AUDIT-REPORT.md)

**Phase Breakdown:**

| Phase | Focus Area | Items | Status |
|-------|------------|-------|--------|
| **Phase 1** | Intermediate SEO | 6 items | 📋 Ready |
| **Phase 2** | Advanced On-Page | 8 items | 📋 Ready |
| **Phase 3** | E-E-A-T Content | 7 items | 📋 Ready |
| **Phase 4** | Technical Excellence | 8 items | 📋 Ready |
| **Phase 5** | Authority Building | 8 items | 📋 Ready |
| **Phase 6** | LLM/AEO Optimization | 16 items | 📋 Ready |
| **Phase 7** | Analytics & Tracking | 7 items | 📋 Ready |

**Key Phase 4 Item (Code Splitting):**
- **Item 4.3:** vite.config.ts enhancement (40% bundle reduction: 660KB → 400KB)
- **Status:** ❌ Skipped in Phase 0 (per decision) - ready for Phase 4 implementation
- **Expected Results:** 5-7 chunk files, 5-10 point PageSpeed improvement
- **Code Location:** REPLIT-PROMPT lines 1671-1723 (full implementation with manualChunks)

### LEGAL COMPLIANCE (MANDATORY)

#### Canadian Privacy & Communications Laws
- **CASL (Anti-Spam):** Express consent required for all communications
- **PIPEDA (Privacy):** Privacy policy consent required before data collection
- **A2P 10DLC (SMS):** Optional SMS consent with timestamp validation
- **TCPA (Telemarketing):** Express consent for calls/texts
- **AODA/WCAG AA (Accessibility):** Full keyboard navigation, screen reader support, color contrast

#### Implementation Status
✅ **100% Compliant** - All legal requirements implemented and verified in QA report

**Key Files:**
- Assessment form consent checkboxes (required/optional distinction)
- Privacy policy modal integration
- SMS consent timestamp validation
- WCAG AA compliance (semantic HTML, ARIA labels, keyboard navigation)

### ENTERPRISE SECURITY MEASURES

#### Helmet Security Headers (routes.ts:218-247)
```typescript
helmet({
  contentSecurityPolicy: { /* CSP rules */ },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: 'sameorigin' },
  xssFilter: true
})
```

#### Rate Limiting (routes.ts:290-335)
- **Strict Limiter:** 5000 requests / 15 minutes
- **SMS Consent Limiter:** 100 requests / 5 minutes
- **Enhanced Strict Limiter:** 200 requests / 10 minutes

#### Brute Force Protection (routes.ts:274-287)
- **Free Retries:** 3 attempts
- **Min Wait:** 5 minutes
- **Max Wait:** 60 minutes
- **Store:** PostgreSQL-backed (persistent across restarts)

#### Additional Security
- **CORS:** Production domains only (illummaa.com)
- **CSRF Tokens:** `crypto.randomBytes(32)`
- **Input Sanitization:** DOMPurify + validator.js
- **IP Duplicate Prevention:** 24hr known IPs, 8hr sessions
- **Session Security:** httpOnly, secure, sameSite cookies

### QA BASELINE (Current Production Status)

**Overall System Health Score:** 98/100 ✅

**Category Scores:**
- **Responsive Design:** 100/100 (320px - 4K+ support)
- **Assessment Form:** 100/100 (10-field validation, step tracking)
- **Security:** 100/100 (enterprise-grade, all measures implemented)
- **Legal Compliance:** 100/100 (CASL, PIPEDA, A2P 10DLC, TCPA, AODA)
- **Performance:** 95/100 (can add +5 with vite code splitting in Phase 4)
- **Accessibility:** 100/100 (WCAG AA compliant)
- **Analytics:** 100/100 (8 GA4 events, complete funnel tracking)

**Recommendation:** APPROVED FOR IMMEDIATE PRODUCTION DEPLOYMENT 🚀

**Source:** `QA-TEST-REPORT-PRODUCTION-READY.md`

### CRITICAL RULES FOR ALL CODE CHANGES

#### 🚫 NEVER MODIFY
1. **analytics.ts** (392 lines) - GA4 tracking system
2. **scoring.ts** (217 lines) - AI priority algorithm
3. **routes.ts lines 218-352** - Enterprise security code
4. **Assessment form logic** - Field validation, step tracking
5. **3-tier system** - Pioneer/Preferred/Elite calculations

#### ✅ ALWAYS PRESERVE
1. **GA4 Event Tracking** - All 8 event types must continue firing
2. **AI Scoring Algorithm** - 5-factor calculation must remain intact
3. **Enterprise Security** - Helmet, rate limiting, brute force, CSRF, sanitization
4. **Legal Compliance** - CASL, PIPEDA, A2P 10DLC, TCPA, AODA/WCAG AA
5. **Production Readiness** - No breaking changes, maintain 98/100 QA score

#### ✨ ALL CHANGES MUST BE
1. **Additive/Enhancement Only** - No removals or breaking modifications
2. **Thoroughly Tested** - Verify no side effects on critical systems
3. **SEO/LLM Focused** - Align with Phases 1-7 roadmap
4. **Performance Optimized** - Code splitting, lazy loading, caching
5. **Accessibility Maintained** - WCAG AA compliance required

#### ⚠️ SPECIAL CONSIDERATIONS
1. **Replit Compatibility** - Preserve `@replit/vite-plugin-cartographer` plugin
2. **Environment Variables** - Never commit `VITE_GA_MEASUREMENT_ID` value
3. **Database Migrations** - Use Drizzle ORM schema changes only
4. **SPA Routing** - Maintain Wouter route structure (5 routes)
5. **Component Structure** - Keep Radix UI + Tailwind CSS architecture

### ROUTES & PAGES

#### Current SPA Routes (5 pages)
**Router:** Wouter 3.3.5 (client/src/App.tsx:37-43)

| Route | Component | Purpose | Analytics Event |
|-------|-----------|---------|-----------------|
| `/` | Home | Landing page, assessment form | assessment_start, page_view |
| `/models/1br-compact` | Model1BRCompact | 1-bedroom model details | navigation_click, page_view |
| `/models/2br-family` | Model2BRFamily | 2-bedroom model details | navigation_click, page_view |
| `/models/3br-executive` | Model3BRExecutive | 3-bedroom model details | navigation_click, page_view |
| `*` (404) | NotFound | 404 error page | page_view |

**Lazy Loading:** All routes use React.lazy() for code splitting (App.tsx:9-14)

### PERFORMANCE OPTIMIZATIONS

#### Current Optimizations (Phase 0)
1. ✅ **Font Reduction:** 90% smaller (25+ fonts → 2 fonts)
2. ✅ **Lazy Loading:** Route-based code splitting (React.lazy)
3. ✅ **Preconnect:** Google Fonts, Google Tag Manager
4. ✅ **Build Minification:** esbuild (vite.config.ts)

#### Ready for Phase 4
1. 📋 **Vite Manual Chunks:** 40% bundle reduction (vendor, router, ui, analytics, icons)
2. 📋 **Image Optimization:** WebP, lazy loading, srcset
3. 📋 **CDN Integration:** Static assets delivery
4. 📋 **Service Worker:** Offline caching (PWA-ready)

**Expected Impact:** 95/100 → 100/100 performance score (+5 points)

### TOKEN LIMITS & MEMORY OPTIMIZATION

**This File Size:** ~1,100 lines (~8,500 tokens)
**Recommendation:** Use in combination with User Memory for complete context
**Refresh Frequency:** Update after each phase completion (track status changes)

### KEY DEPENDENCIES (package.json verified)

#### Production Dependencies (71 total)
**Critical for Reference:**
- @radix-ui/* (18 UI components)
- @tanstack/react-query: 5.60.5
- react: 18.3.1
- react-dom: 18.3.1
- wouter: 3.3.5
- express: 4.21.2
- helmet: 8.1.0
- express-rate-limit: 8.1.0
- express-brute: 1.0.1
- dompurify: 3.2.6
- isomorphic-dompurify: 2.26.0
- libphonenumber-js: 1.12.23
- zod: 3.24.2
- drizzle-orm: 0.39.1
- lucide-react: 0.453.0

#### Dev Dependencies (Key Tools)
- @replit/vite-plugin-cartographer: 0.3.0
- typescript: 5.6.3
- vite: 5.4.20
- tailwindcss: 3.4.17

### DOCUMENTATION HISTORY (71 .md files)

**Key Reference Files:**
- REPLIT-PROMPT-FULL-JOURNEY-ALL-PHASES-100-PERCENT-SEO-LLM.md (master roadmap)
- REPLIT-PROMPT-SAFETY-AUDIT-REPORT.md (safety verification)
- QA-TEST-REPORT-PRODUCTION-READY.md (system health baseline)
- AI scoring analysis reports (5 versions documenting algorithm evolution)
- Bug fix verification reports (SMS consent, Build Canada logic, WCAG AA compliance)

**Documentation Pattern:** Iterative development with thorough fact-checking and verification at each stage

---

## QUICK REFERENCE CHECKLIST

**Before Any Code Change:**
- [ ] Read relevant files first (never blind edit)
- [ ] Verify change doesn't touch analytics.ts, scoring.ts, or security code
- [ ] Check REPLIT-PROMPT roadmap alignment (Phases 1-7)
- [ ] Ensure additive/enhancement only (no breaking changes)
- [ ] Test for side effects on GA4 tracking, AI scoring, or security

**After Code Change:**
- [ ] Verify all 8 GA4 events still fire correctly
- [ ] Test AI scoring calculation produces same results
- [ ] Confirm security headers/rate limiting/CSRF still active
- [ ] Validate legal compliance maintained (consent forms, privacy)
- [ ] Run QA checks to maintain 98/100+ system health score

**For New Features:**
- [ ] Add GA4 event tracking if user interaction involved
- [ ] Update relevant documentation (.md files)
- [ ] Consider performance impact (lazy loading, code splitting)
- [ ] Ensure WCAG AA accessibility compliance
- [ ] Verify Replit compatibility (don't break plugins)
