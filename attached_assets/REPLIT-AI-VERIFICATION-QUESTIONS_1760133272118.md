# 🔍 REPLIT AI VERIFICATION QUESTIONS
## Questions to Ask Before Approving Changes

**Purpose:** Verify Replit AI's Phase 0 implementation matches the VERIFIED prompt exactly

---

## 📝 **COPY-PASTE THIS TO REPLIT AI:**

```
Thank you for the implementation! Before I approve, I need to verify the changes match my verified prompt exactly. Please answer these questions:

---

## QUESTION 1: App.tsx Analytics Tracking

Please show me the EXACT code you added for the `useEffect` hook that tracks route changes.

**Required verification:**
- Does it contain: `analytics.trackRouteChange(location, previousLocation.current)`?
- Is it placed BEFORE the Suspense/lazy loading wrapper?
- Is the dependency array exactly: `[location]`?

Please paste the exact lines of code.

---

## QUESTION 2: Font Optimization

Please show me the EXACT Google Fonts link you added to index.html (line 47).

**Required verification:**
- Does it load ONLY 2 font families: Inter + Montserrat?
- Inter weights: 400, 600, 700, 900
- Montserrat weight: 700 only
- Does it include `&display=swap` at the end?

Please paste the exact <link> tag.

---

## QUESTION 3: robots.txt Content

You mentioned "cleaning up duplicate blocks" in robots.txt.

**Please answer:**
- What specific content did you remove?
- Why did you consider it a "duplicate"?
- Please show me the FULL robots.txt file you created (all lines)

---

## QUESTION 4: sitemap.xml URLs

Why did you use placeholder text "REPLACE_WITH_YOUR_DOMAIN" instead of the actual domain "https://illummaa.com" as specified in the verified prompt?

**Please answer:**
- Did the verified prompt contain placeholders or actual URLs?
- Please show me ALL 5 <url> entries from your sitemap.xml

---

## QUESTION 5: vite.config.ts Changes

Please show me the EXACT before/after diff for vite.config.ts.

**Required verification:**
- Does the NEW version include `rollupOptions`?
- Does it include `manualChunks` with: vendor, router, ui?
- Does it have `minify: 'terser'` anywhere? (should be NO)
- Does it have `chunkSizeWarningLimit: 1000`?

Please paste:
1. Current vite.config.ts (BEFORE changes)
2. Proposed vite.config.ts (AFTER changes)
3. List what you changed

---

## QUESTION 6: Preconnect Tags

Please show me ALL preconnect tags you added to index.html.

**Required verification:**
- fonts.googleapis.com (should already exist)
- fonts.gstatic.com with crossorigin (should already exist)
- www.googletagmanager.com (NEW - did you add this?)

Please paste all 3 <link rel="preconnect"> tags.

---

## QUESTION 7: Documentation Files

Please confirm you created these 4 files:
1. documentation/keyword-strategy.md
2. documentation/phase-0-performance-audit.md
3. documentation/google-search-console-setup.md
4. documentation/phase-0-deployment-checklist.md

For each file, please tell me:
- Did you use the EXACT content from the verified prompt?
- Or did you modify/summarize the content?

---

## QUESTION 8: What You DIDN'T Change

Please confirm you did NOT modify any of these files:
- server/routes.ts (security config)
- client/src/lib/analytics.ts (tracking functions)
- shared/utils/scoring.ts (AI priority scoring)
- shared/schema.ts (form validation)
- tailwind.config.ts (font family definitions)

Confirm: YES or NO for each file above.

---

Please answer ALL 8 questions with exact code/content before I approve any changes. I need to verify everything matches my verified prompt exactly.

Thank you!
```

---

## 🎯 **AFTER REPLIT AI RESPONDS:**

**Use this checklist to verify their answers:**

### ✅ **Question 1 Verification (App.tsx)**

Their answer should show:
```tsx
useEffect(() => {
  if (previousLocation.current && previousLocation.current !== location) {
    analytics.trackRouteChange(location, previousLocation.current);
  }
  previousLocation.current = location;
}, [location]);
```

**Red flags:**
- ❌ Missing `analytics.trackRouteChange()`
- ❌ Different dependency array
- ❌ Placed after Suspense (should be before)

---

### ✅ **Question 2 Verification (Fonts)**

Their answer should show:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Montserrat:wght@700&display=swap" rel="stylesheet">
```

**Red flags:**
- ❌ More than 2 font families
- ❌ Includes Poppins, Playfair, or Roboto
- ❌ Wrong weights for Inter (should be 400,600,700,900)
- ❌ Wrong weight for Montserrat (should be 700 only)

---

### ✅ **Question 3 Verification (robots.txt)**

Their answer should show the FULL file from verified prompt (lines 54-83).

**Red flags:**
- ❌ Missing any of the Allow directives
- ❌ Removed AhrefsBot or SemrushBot crawl-delay
- ❌ Changed any content from verified prompt

**Expected content:**
```txt
# ILLUMMAA Modular Homes - robots.txt
# Generated: 2025-10-10
# Purpose: Allow all search engines to crawl, point to sitemap

User-agent: *
Allow: /

# Sitemap location
Sitemap: https://illummaa.com/sitemap.xml

# Block known bad bots (optional)
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

# Allow all other paths
User-agent: *
Allow: /
Allow: /models/
Allow: /models/1br-compact
Allow: /models/2br-family
Allow: /models/3br-executive
```

---

### ✅ **Question 4 Verification (sitemap.xml)**

Their answer should show actual URLs, NOT placeholders.

**Expected URLs:**
```xml
<loc>https://illummaa.com/</loc>
<loc>https://illummaa.com/models/1br-compact</loc>
<loc>https://illummaa.com/models/2br-family</loc>
<loc>https://illummaa.com/models/3br-executive</loc>
<loc>https://illummaa.com/privacy-policy</loc>
```

**Red flags:**
- ❌ Contains "REPLACE_WITH_YOUR_DOMAIN"
- ❌ Contains "your-replit-project.replit.app"
- ❌ Missing any of the 5 URLs
- ❌ Wrong dates (should be 2025-10-10 or current date)

---

### ✅ **Question 5 Verification (vite.config.ts)**

Their answer should show this NEW config:
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['wouter'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-select'],
      }
    }
  },
  chunkSizeWarningLimit: 1000,
}
```

**Red flags:**
- ❌ Contains `minify: 'terser'` (should use default esbuild)
- ❌ Missing `rollupOptions`
- ❌ Missing `manualChunks`
- ❌ Changed `outDir` path

---

### ✅ **Question 6 Verification (Preconnect)**

Their answer should show 3 preconnect tags:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://www.googletagmanager.com">
```

**Red flags:**
- ❌ Missing Google Tag Manager preconnect
- ❌ Missing `crossorigin` on fonts.gstatic.com

---

### ✅ **Question 7 Verification (Documentation)**

They should confirm:
- ✅ Created all 4 files
- ✅ Used EXACT content from verified prompt
- ✅ Did NOT modify or summarize

**Red flags:**
- ❌ Modified content for "brevity"
- ❌ Created different files than specified
- ❌ Used placeholders instead of actual content

---

### ✅ **Question 8 Verification (Untouched Files)**

They should confirm they did NOT touch:
- ✅ NO changes to server/routes.ts
- ✅ NO changes to client/src/lib/analytics.ts
- ✅ NO changes to shared/utils/scoring.ts
- ✅ NO changes to shared/schema.ts
- ✅ NO changes to tailwind.config.ts

**Red flags:**
- ❌ Any "YES" answer (means they modified critical files)

---

## 🚨 **IF ANY RED FLAGS APPEAR:**

Use this response:

```
I see several discrepancies from my verified prompt. Please REVERT all changes and let me provide you with the exact code to implement.

Specific issues found:
[List the red flags you identified]

Please confirm you've reverted the changes before I proceed.
```

---

## ✅ **IF ALL VERIFICATIONS PASS:**

Use this response:

```
Perfect! All changes match my verified prompt exactly. Please proceed with implementing these changes in this order:

1. Create robots.txt (show me the file after creating)
2. Create sitemap.xml (show me the file after creating)
3. Update index.html fonts (show me the diff)
4. Add preconnect to GTM (show me the diff)
5. Update App.tsx with lazy loading (show me the diff)
6. Update vite.config.ts (show me the diff)
7. Create all 4 documentation files

After EACH step, wait for my confirmation before proceeding to the next.

Let's start with Step 1: Create robots.txt
```

---

## 📊 **TRACKING YOUR VERIFICATION**

Use this checklist as Replit AI responds:

- [ ] Question 1: Analytics tracking verified ✅/❌
- [ ] Question 2: Fonts verified (Inter + Montserrat only) ✅/❌
- [ ] Question 3: robots.txt content verified ✅/❌
- [ ] Question 4: sitemap.xml URLs verified (no placeholders) ✅/❌
- [ ] Question 5: vite.config.ts changes verified ✅/❌
- [ ] Question 6: Preconnect tags verified ✅/❌
- [ ] Question 7: Documentation files verified ✅/❌
- [ ] Question 8: Critical files untouched ✅/❌

**All 8 must be ✅ before approving!**

---

## 🎯 **SUMMARY**

**What you're checking:**
1. ✅ Analytics tracking preserved
2. ✅ Correct fonts (not placeholders or wrong fonts)
3. ✅ Clean robots.txt (no unauthorized removals)
4. ✅ Real URLs in sitemap (not placeholders)
5. ✅ Optimized vite config (esbuild, not terser)
6. ✅ All preconnect tags present
7. ✅ Documentation complete and unmodified
8. ✅ Critical files untouched (security, scoring, analytics)

**Why this matters:**
- Protects your Google Analytics tracking
- Protects your AI priority scoring system
- Protects your enterprise security
- Ensures SEO files are production-ready (no placeholders)
- Verifies performance optimizations are correct

---

**COPY THE QUESTIONS ABOVE TO REPLIT AI NOW** ⬆️

After they respond, use the verification checklists to approve or reject their changes.

**Good luck! 🚀**
