# Quick Start Commands - Blog Infrastructure
## ILLUMMAA Week 1-2 Implementation

**Last Updated:** 2025-10-14
**Implementation Time:** 2-4 hours (Week 1: 1-2 hours, Week 2: 1-2 hours)

---

## Pre-Flight Checks (5 minutes)

```bash
# Navigate to project root
cd "C:\Users\Juan Gonzalez\Documents\PVRPOSE AI\ILLUMMAA\illummaa2-github"

# Verify protected files intact
wc -l client/src/lib/analytics.ts    # Expected: 391 lines
wc -l shared/utils/scoring.ts         # Expected: 217 lines

# Check Node.js and npm
node --version  # Should be 18+ or 20+
npm --version   # Should be 8+

# Verify database connection
echo $DATABASE_URL  # Should show Neon PostgreSQL connection string

# Create backup
git stash save "Pre-blog-implementation backup $(date +%Y%m%d_%H%M%S)"
```

---

## Week 1: Database & Backend (1-2 hours)

### Step 1: Add Schema to shared/schema.ts (10 minutes)

```bash
# Open schema file
code shared/schema.ts

# Add blog schema from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 1)
# Append to end of file (after existing tables)
```

**What to add:**
- Authors table (15 lines)
- Blog categories table (17 lines)
- Blog posts table (75 lines with future-proofing)
- Post versions table (15 lines)
- Blog tags table (10 lines)
- Post tags junction table (12 lines)
- Drizzle ORM relations (45 lines)

### Step 2: Run Database Migration (5 minutes)

**Option A: Using Drizzle Kit (Recommended)**

```bash
# Install Drizzle Kit (if not already installed)
npm install -D drizzle-kit

# Create drizzle.config.ts
cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './shared/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!
  }
} satisfies Config;
EOF

# Generate migration
npx drizzle-kit generate:pg

# Apply migration to database
npx drizzle-kit push:pg

# Verify tables created
psql "$DATABASE_URL" -c "\dt" | grep blog
# Expected output: blog_posts, blog_categories, blog_tags, post_tags, post_versions, authors
```

**Option B: Manual SQL Migration**

```bash
# Create migration file
mkdir -p drizzle/migrations
code drizzle/migrations/0001_blog_infrastructure.sql

# Copy SQL from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 2 - Option B)

# Apply migration
psql "$DATABASE_URL" -f drizzle/migrations/0001_blog_infrastructure.sql

# Verify seed data
psql "$DATABASE_URL" -c "SELECT name, email FROM authors;"
# Expected: ILLUMMAA Editorial Team

psql "$DATABASE_URL" -c "SELECT name_en, slug_en FROM blog_categories;"
# Expected: 5 categories (Modular Housing, Sustainability, Government Programs, Indigenous Housing, Case Studies)
```

### Step 3: Add Backend API Routes to server/routes.ts (20 minutes)

```bash
# Open server/routes.ts
code server/routes.ts

# Scroll to line 352 (after protected security code)
# Add blog API routes from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 3)
# Total additions: ~350 lines
```

**What to add:**
- Imports: `desc`, `eq`, `and`, `sql`, `ilike` from drizzle-orm
- Imports: Blog schema tables
- 4 Public routes (GET /api/blog/posts, GET /api/blog/posts/:slug, GET /api/blog/categories, GET /api/blog/related/:postId)
- 3 Admin routes (POST /api/blog/admin/posts, PUT /api/blog/admin/posts/:id, DELETE /api/blog/admin/posts/:id)

### Step 4: Add RSS Feed Routes to server/routes.ts (10 minutes)

```bash
# Continue editing server/routes.ts
# Add RSS feed implementation from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 4)
# Total additions: ~120 lines
```

**What to add:**
- `escapeXml()` helper function
- GET /en/rss.xml route
- GET /fr/rss.xml route

### Step 5: Test Week 1 Implementation (15 minutes)

```bash
# Start development server
npm run dev

# Test API endpoints (in new terminal or Postman)
curl http://localhost:5000/api/blog/categories?lang=en
# Expected: JSON array with 5 categories

curl http://localhost:5000/api/blog/posts?lang=en
# Expected: {"posts": [], "pagination": {...}} (empty until you create posts)

# Test RSS feeds (in browser)
# Visit: http://localhost:5000/en/rss.xml
# Expected: Valid XML with channel title "ILLUMMAA Blog - Modular Housing Insights"

# Create test post (Postman or curl)
curl -X POST http://localhost:5000/api/blog/admin/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "Test Post",
    "title_fr": "Article de test",
    "content_en": "<p>Test content in English</p>",
    "content_fr": "<p>Contenu de test en français</p>",
    "excerpt_en": "Test excerpt",
    "excerpt_fr": "Extrait de test",
    "author_id": "00000000-0000-0000-0000-000000000001",
    "status": "published",
    "reading_time_minutes": 5
  }'

# Fetch created post
curl http://localhost:5000/api/blog/posts?lang=en
# Expected: JSON array with 1 post
```

---

## Week 2: Frontend & Code Splitting (1-2 hours)

### Step 6: Update vite.config.ts (5 minutes)

```bash
# BACKUP ORIGINAL (important!)
cp vite.config.ts vite.config.ts.backup

# Replace vite.config.ts with enhanced version
code vite.config.ts

# Copy entire file from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 5)
# Key additions: rollupOptions.output.manualChunks (40% bundle reduction)
```

### Step 7: Update App.tsx with Blog Routes (5 minutes)

```bash
# Open App.tsx
code client/src/App.tsx

# Add lazy-loaded blog routes after line 14
# From WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 6)
```

**What to add:**
- 3 lazy imports: BlogLanding, BlogPost, BlogCategory
- 3 routes in <Switch>: /:lang(en|fr)/blog, /:lang(en|fr)/blog/category/:category, /:lang(en|fr)/blog/:slug

### Step 8: Create blog-analytics.ts (10 minutes)

```bash
# Create new file (EXTENDS analytics.ts, does NOT modify)
code client/src/lib/blog-analytics.ts

# Copy entire file from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 7)
# Total: ~200 lines (4 tracking functions + 1 React hook)
```

### Step 9: Add i18next Translations (5 minutes)

```bash
# Open English translations
code client/src/locales/en.json

# Add "blog" object from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 8)
# 12 keys: title, subtitle, readMore, backToBlog, etc.

# Open French translations
code client/src/locales/fr.json

# Add "blog" object (French version)
```

### Step 10: Create Blog Page Components (20 minutes)

```bash
# Create BlogLanding.tsx
code client/src/pages/BlogLanding.tsx
# Copy from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 9)
# 478 lines - Blog landing page with category filter

# Create BlogPost.tsx
code client/src/pages/BlogPost.tsx
# Copy from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 10)
# 380 lines - Single post with SEO, analytics, social sharing

# Create BlogCategory.tsx
code client/src/pages/BlogCategory.tsx
# Copy from WEEK_1-2_IMPLEMENTATION_GUIDE.md (Step 11)
# 127 lines - Category-filtered posts
```

### Step 11: Install Missing Dependencies (if needed) (2 minutes)

```bash
# Check if react-helmet-async is installed (used in BlogPost.tsx)
npm list react-helmet-async

# If not installed:
npm install react-helmet-async

# Update client/src/main.tsx to wrap with HelmetProvider
# (Only if using Helmet - optional for Week 1-2)
```

### Step 12: Test Week 2 Implementation (20 minutes)

```bash
# Build project (verify code splitting)
npm run build

# Check bundle sizes
ls -lh dist/public/assets/*.js

# Expected output:
# vendor-react-[hash].js   ~120KB
# ui-radix-[hash].js        ~80KB
# vendor-query-[hash].js    ~25KB
# analytics-[hash].js       ~20KB
# icons-[hash].js           ~40KB
# blog-[hash].js            ~100KB (lazy-loaded)
# Total initial load: ~360KB (down from 660KB) ✅

# Start dev server
npm run dev

# Test blog routes (in browser)
# Visit: http://localhost:5000/en/blog
# Expected: Blog landing page with "No blog posts found" (if no published posts)

# Create test post via admin API (see Week 1 Step 5)
# Then visit: http://localhost:5000/en/blog
# Expected: Blog post card displayed

# Click post card
# Visit: http://localhost:5000/en/blog/test-post
# Expected: Full post page with SEO meta tags, reading progress tracking

# Test language switching
# Visit: http://localhost:5000/fr/blog
# Expected: French blog landing page

# Test 404 handling
# Visit: http://localhost:5000/en/blog/non-existent-post
# Expected: 404 message + "Back to Blog" button

# Verify analytics.ts untouched
wc -l client/src/lib/analytics.ts  # Should still be 391 lines
```

### Step 13: Run Lighthouse Audit (10 minutes)

```bash
# Build production bundle
npm run build

# Serve production build
npx serve dist/public -l 3000

# Open Chrome DevTools
# Navigate to: http://localhost:3000/en/blog
# Run Lighthouse audit (Desktop)

# Expected scores:
# Performance:    95+ ✅
# Accessibility:  100 ✅
# Best Practices: 100 ✅
# SEO:            100 ✅
```

---

## Verification Commands (Quick Health Check)

```bash
# Database tables
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'blog%' OR table_name = 'authors';"
# Expected: 6 tables

# Protected files unchanged
git diff client/src/lib/analytics.ts  # Should be empty
git diff shared/utils/scoring.ts      # Should be empty
git diff -U0 server/routes.ts | grep -A5 -B5 "218,352"  # Security code should be unchanged

# Bundle size (after build)
du -sh dist/public/assets/*.js | sort -h
# Largest file should be ~120KB (vendor-react)

# API health check
curl -s http://localhost:5000/api/blog/categories?lang=en | jq '.[] | .name'
# Expected: "Modular Housing", "Sustainability", etc.

# RSS feed validation
curl -s http://localhost:5000/en/rss.xml | head -10
# Expected: <?xml version="1.0" encoding="UTF-8"?>
```

---

## Rollback Commands (If Needed)

```bash
# Restore from stash
git stash pop

# Or hard reset (WARNING: loses all changes)
git reset --hard HEAD

# Rebuild with original config
npm run build

# Drop blog tables (if database corrupted)
psql "$DATABASE_URL" << 'EOF'
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS blog_tags CASCADE;
DROP TABLE IF EXISTS post_versions CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
EOF
```

---

## Next Steps After Week 1-2

**Week 3-4: Admin Dashboard**
- Tiptap rich text editor
- Cloudinary image upload
- Draft/publish workflow UI

**Week 5-6: SEO Phases 1-3**
- Enhanced schema markup
- Image optimization (WebP)
- E-E-A-T content

**Week 7-8: LLM/AEO (Phase 6)**
- SpeakableSpecification schema
- FAQ schema
- Voice search optimization

---

## Troubleshooting

**Problem:** `psql: command not found`
**Solution:** Install PostgreSQL client or use Neon SQL Editor at https://console.neon.tech/

**Problem:** Database migration fails with "permission denied"
**Solution:** Verify `DATABASE_URL` is correct and user has CREATE TABLE permissions

**Problem:** `npm run build` shows bundle size > 500KB
**Solution:** Verify vite.config.ts manualChunks configuration is correct

**Problem:** Blog routes show 404
**Solution:** Verify App.tsx routes are added and dev server restarted

**Problem:** Analytics events not firing
**Solution:** Check GA4 Debug Mode in Chrome DevTools → Network tab → Filter "google-analytics"

**Problem:** i18next translations not working
**Solution:** Verify en.json and fr.json syntax (valid JSON, no trailing commas)

---

## Support

**Documentation:**
- Full Implementation Guide: `WEEK_1-2_IMPLEMENTATION_GUIDE.md`
- Replit Clarification: `REPLIT_CLARIFICATION_PROMPT.md`
- SEO Roadmap: `REPLIT-PROMPT-FULL-JOURNEY-ALL-PHASES-100-PERCENT-SEO-LLM_PHASE2_UPDATED.md`

**Need Help?**
Ask me specific questions about:
- Database schema questions
- API endpoint debugging
- Frontend component issues
- Code splitting problems
- Analytics tracking verification
