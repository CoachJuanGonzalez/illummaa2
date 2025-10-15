# Week 1-2 Implementation Guide: Blog Infrastructure
## ILLUMMAA Bilingual B2B Modular Housing Platform

**Created:** 2025-10-14
**Target Completion:** Week 1-2 (Database → Basic Blog Display)
**Tech Stack:** React 18.3.1 + Express + Neon PostgreSQL + Drizzle ORM
**Architecture:** Bilingual (EN/FR) with `/:lang(en|fr)/blog` routing pattern

---

## 📋 Table of Contents

1. [Prerequisites & Safety Checks](#prerequisites--safety-checks)
2. [Week 1: Database & Backend Setup](#week-1-database--backend-setup)
3. [Week 2: Frontend Components & Code Splitting](#week-2-frontend-components--code-splitting)
4. [Testing Checklist](#testing-checklist)
5. [Rollback Plan](#rollback-plan)

---

## Prerequisites & Safety Checks

### ✅ Pre-Implementation Verification

**Run these checks BEFORE starting:**

```bash
# 1. Verify protected files are intact (NEVER modify these)
wc -l client/src/lib/analytics.ts    # Should be 391 lines
wc -l shared/utils/scoring.ts         # Should be 217 lines
sed -n '218,352p' server/routes.ts | wc -l  # Should be 135 lines (security code)

# 2. Verify tech stack versions
grep -E "(react|wouter|drizzle-orm)" package.json

# 3. Check current bundle size (baseline)
npm run build
# Note the bundle size - target is 40% reduction (660KB → 360KB)

# 4. Backup current working state
git stash save "Pre-blog-implementation backup $(date +%Y%m%d)"
```

### 🚫 Protected Files (NEVER MODIFY)

| File | Lines | Reason |
|------|-------|--------|
| `client/src/lib/analytics.ts` | 391 | Complete GA4 tracking (8 events) |
| `shared/utils/scoring.ts` | 217 | AI priority scoring algorithm |
| `server/routes.ts` | 218-352 | Enterprise security (Helmet, rate limiting, CSRF) |

**Instead:** Create `client/src/lib/blog-analytics.ts` to EXTEND analytics (see Week 2).

---

## Week 1: Database & Backend Setup

### Step 1: Database Schema (Neon PostgreSQL)

**File:** `shared/schema.ts`

**Location:** Add to bottom of existing schema file (after existing tables)

```typescript
// ============================================
// BLOG INFRASTRUCTURE (Phase 1-7 SEO)
// ============================================

import { pgTable, uuid, varchar, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// AUTHORS TABLE
// ============================================
export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  bio_en: text('bio_en'),
  bio_fr: text('bio_fr'),
  title_en: varchar('title_en', { length: 255 }), // e.g., "Senior Housing Analyst"
  title_fr: varchar('title_fr', { length: 255 }), // e.g., "Analyste principal du logement"
  avatar_url: text('avatar_url'),
  linkedin_url: text('linkedin_url'),
  twitter_url: text('twitter_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  emailIdx: index('authors_email_idx').on(table.email)
}));

// ============================================
// BLOG CATEGORIES TABLE
// ============================================
export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug_en: varchar('slug_en', { length: 100 }).notNull().unique(),
  slug_fr: varchar('slug_fr', { length: 100 }).notNull().unique(),
  name_en: varchar('name_en', { length: 255 }).notNull(),
  name_fr: varchar('name_fr', { length: 255 }).notNull(),
  description_en: text('description_en'),
  description_fr: text('description_fr'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  slugEnIdx: index('categories_slug_en_idx').on(table.slug_en),
  slugFrIdx: index('categories_slug_fr_idx').on(table.slug_fr)
}));

// ============================================
// BLOG POSTS TABLE (Bilingual + 2025+ Future-Proofing)
// ============================================
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // ===== BILINGUAL CONTENT (Separate Columns) =====
  slug_en: varchar('slug_en', { length: 255 }).notNull().unique(),
  slug_fr: varchar('slug_fr', { length: 255 }).notNull().unique(),
  title_en: text('title_en').notNull(),
  title_fr: text('title_fr').notNull(),
  excerpt_en: text('excerpt_en'), // 160-char summary
  excerpt_fr: text('excerpt_fr'),
  content_en: text('content_en').notNull(), // Full HTML content
  content_fr: text('content_fr').notNull(),

  // ===== SEO METADATA (Bilingual) =====
  meta_title_en: varchar('meta_title_en', { length: 60 }), // Google limit
  meta_title_fr: varchar('meta_title_fr', { length: 60 }),
  meta_description_en: varchar('meta_description_en', { length: 160 }), // Google limit
  meta_description_fr: varchar('meta_description_fr', { length: 160 }),
  focus_keyword_en: varchar('focus_keyword_en', { length: 100 }), // Primary SEO keyword
  focus_keyword_fr: varchar('focus_keyword_fr', { length: 100 }),

  // ===== RELATIONSHIPS =====
  author_id: uuid('author_id').notNull().references(() => authors.id, { onDelete: 'restrict' }),
  category_id: uuid('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),

  // ===== MEDIA =====
  featured_image_url: text('featured_image_url'), // Cloudinary CDN URL
  featured_image_alt_en: varchar('featured_image_alt_en', { length: 255 }), // Accessibility
  featured_image_alt_fr: varchar('featured_image_alt_fr', { length: 255 }),
  og_image_url: text('og_image_url'), // Social media sharing (1200x630px)

  // ===== PUBLISHING WORKFLOW =====
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft | published | archived
  published_at: timestamp('published_at'), // NULL for drafts
  scheduled_publish_at: timestamp('scheduled_publish_at'), // Future auto-publish

  // ===== ENGAGEMENT METRICS =====
  view_count: integer('view_count').notNull().default(0),
  reading_time_minutes: integer('reading_time_minutes'), // Auto-calculated

  // ===== 2025+ FUTURE-PROOFING COLUMNS =====
  // LLM/AEO Optimization (Phase 6)
  ai_suggested_title_en: text('ai_suggested_title_en'), // AI-generated alternatives
  ai_suggested_title_fr: text('ai_suggested_title_fr'),
  speakable_summary_en: text('speakable_summary_en'), // Voice search optimization
  speakable_summary_fr: text('speakable_summary_fr'),

  // Quality Scoring
  ai_content_quality_score: integer('ai_content_quality_score'), // 0-100 (readability, E-E-A-T)
  ai_seo_score: integer('ai_seo_score'), // 0-100 (keyword density, meta optimization)

  // Content Management
  version: integer('version').notNull().default(1), // Version control
  last_reviewed_at: timestamp('last_reviewed_at'), // Content freshness tracking

  // Privacy & Compliance
  consent_tracking_enabled: boolean('consent_tracking_enabled').notNull().default(true), // GDPR/PIPEDA

  // Timestamps
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  slugEnIdx: index('posts_slug_en_idx').on(table.slug_en),
  slugFrIdx: index('posts_slug_fr_idx').on(table.slug_fr),
  statusIdx: index('posts_status_idx').on(table.status),
  publishedAtIdx: index('posts_published_at_idx').on(table.published_at),
  authorIdx: index('posts_author_idx').on(table.author_id),
  categoryIdx: index('posts_category_idx').on(table.category_id)
}));

// ============================================
// POST VERSION HISTORY (Content Audit Trail)
// ============================================
export const postVersions = pgTable('post_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  post_id: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  version_number: integer('version_number').notNull(),

  // Snapshot of content at this version
  title_en: text('title_en').notNull(),
  title_fr: text('title_fr').notNull(),
  content_en: text('content_en').notNull(),
  content_fr: text('content_fr').notNull(),

  // Audit trail
  changed_by: uuid('changed_by').notNull(), // Author ID or admin ID
  change_description: text('change_description'), // e.g., "Updated statistics for 2025"
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  postVersionIdx: index('post_versions_post_id_idx').on(table.post_id, table.version_number)
}));

// ============================================
// BLOG POST TAGS (Many-to-Many)
// ============================================
export const blogTags = pgTable('blog_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug_en: varchar('slug_en', { length: 100 }).notNull().unique(),
  slug_fr: varchar('slug_fr', { length: 100 }).notNull().unique(),
  name_en: varchar('name_en', { length: 100 }).notNull(),
  name_fr: varchar('name_fr', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const postTags = pgTable('post_tags', {
  post_id: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tag_id: uuid('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  postTagIdx: index('post_tags_post_id_idx').on(table.post_id),
  tagPostIdx: index('post_tags_tag_id_idx').on(table.tag_id)
}));

// ============================================
// DRIZZLE ORM RELATIONS
// ============================================
export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(blogPosts)
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts)
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(authors, {
    fields: [blogPosts.author_id],
    references: [authors.id]
  }),
  category: one(blogCategories, {
    fields: [blogPosts.category_id],
    references: [blogCategories.id]
  }),
  versions: many(postVersions),
  tags: many(postTags)
}));

export const postVersionsRelations = relations(postVersions, ({ one }) => ({
  post: one(blogPosts, {
    fields: [postVersions.post_id],
    references: [blogPosts.id]
  })
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(postTags)
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [postTags.post_id],
    references: [blogPosts.id]
  }),
  tag: one(blogTags, {
    fields: [postTags.tag_id],
    references: [blogTags.id]
  })
}));
```

---

### Step 2: Database Migration (Neon Branching Strategy)

**Why Neon Branching:** Zero-risk migrations with instant rollback capability

#### Option A: Using Drizzle Kit (Recommended)

```bash
# 1. Install Drizzle Kit if not already installed
npm install -D drizzle-kit

# 2. Create drizzle.config.ts in project root
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

# 3. Generate migration files
npx drizzle-kit generate:pg

# 4. Review generated SQL in drizzle/migrations/
# Look for CREATE TABLE statements for blog_posts, authors, blog_categories, etc.

# 5. Apply migration to development branch (SAFE - test first)
# Create a Neon branch via dashboard: https://console.neon.tech/app/projects
# Get branch DATABASE_URL and test migration

# 6. Apply to production (after testing)
npx drizzle-kit push:pg
```

#### Option B: Manual SQL Migration (Alternative)

**File:** Create `drizzle/migrations/0001_blog_infrastructure.sql`

```sql
-- ============================================
-- ILLUMMAA Blog Infrastructure Migration
-- Phase: Week 1 Database Setup
-- Safe to run: Uses IF NOT EXISTS
-- ============================================

-- Authors Table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  bio_en TEXT,
  bio_fr TEXT,
  title_en VARCHAR(255),
  title_fr VARCHAR(255),
  avatar_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS authors_email_idx ON authors(email);

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_en VARCHAR(100) NOT NULL UNIQUE,
  slug_fr VARCHAR(100) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_slug_en_idx ON blog_categories(slug_en);
CREATE INDEX IF NOT EXISTS categories_slug_fr_idx ON blog_categories(slug_fr);

-- Blog Posts Table (Full Schema)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Bilingual content
  slug_en VARCHAR(255) NOT NULL UNIQUE,
  slug_fr VARCHAR(255) NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_fr TEXT,
  content_en TEXT NOT NULL,
  content_fr TEXT NOT NULL,

  -- SEO metadata
  meta_title_en VARCHAR(60),
  meta_title_fr VARCHAR(60),
  meta_description_en VARCHAR(160),
  meta_description_fr VARCHAR(160),
  focus_keyword_en VARCHAR(100),
  focus_keyword_fr VARCHAR(100),

  -- Relationships
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,

  -- Media
  featured_image_url TEXT,
  featured_image_alt_en VARCHAR(255),
  featured_image_alt_fr VARCHAR(255),
  og_image_url TEXT,

  -- Publishing workflow
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  scheduled_publish_at TIMESTAMP,

  -- Engagement metrics
  view_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER,

  -- 2025+ future-proofing
  ai_suggested_title_en TEXT,
  ai_suggested_title_fr TEXT,
  speakable_summary_en TEXT,
  speakable_summary_fr TEXT,
  ai_content_quality_score INTEGER,
  ai_seo_score INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  last_reviewed_at TIMESTAMP,
  consent_tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_slug_en_idx ON blog_posts(slug_en);
CREATE INDEX IF NOT EXISTS posts_slug_fr_idx ON blog_posts(slug_fr);
CREATE INDEX IF NOT EXISTS posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS posts_author_idx ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON blog_posts(category_id);

-- Post Version History Table
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  changed_by UUID NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_versions_post_id_idx ON post_versions(post_id, version_number);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_en VARCHAR(100) NOT NULL UNIQUE,
  slug_fr VARCHAR(100) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Post Tags Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS post_tags_post_id_idx ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS post_tags_tag_id_idx ON post_tags(tag_id);

-- ============================================
-- SEED DATA (Initial Setup)
-- ============================================

-- Insert default author (replace with real data)
INSERT INTO authors (id, name, email, title_en, title_fr, bio_en, bio_fr)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ILLUMMAA Editorial Team',
  'editorial@illummaa.com',
  'Editorial Team',
  'Équipe éditoriale',
  'ILLUMMAA''s expert team covering modular housing innovations across Canada.',
  'L''équipe d''experts d''ILLUMMAA couvrant les innovations en matière de logement modulaire au Canada.'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default categories
INSERT INTO blog_categories (slug_en, slug_fr, name_en, name_fr, description_en, description_fr)
VALUES
  ('modular-housing', 'logement-modulaire', 'Modular Housing', 'Logement modulaire', 'Innovations and trends in modular construction', 'Innovations et tendances en construction modulaire'),
  ('sustainability', 'durabilite', 'Sustainability', 'Durabilité', 'ESG and sustainable building practices', 'Pratiques de construction durable et ESG'),
  ('government-programs', 'programmes-gouvernementaux', 'Government Programs', 'Programmes gouvernementaux', 'Canadian housing programs and incentives', 'Programmes et incitatifs canadiens pour le logement'),
  ('indigenous-housing', 'logement-autochtone', 'Indigenous Housing', 'Logement autochtone', 'Housing solutions for Indigenous communities', 'Solutions de logement pour les communautés autochtones'),
  ('case-studies', 'etudes-de-cas', 'Case Studies', 'Études de cas', 'Real-world project examples and success stories', 'Exemples de projets réels et histoires de réussite')
ON CONFLICT (slug_en) DO NOTHING;

-- Insert sample tags
INSERT INTO blog_tags (slug_en, slug_fr, name_en, name_fr)
VALUES
  ('affordable-housing', 'logement-abordable', 'Affordable Housing', 'Logement abordable'),
  ('cmhc', 'schl', 'CMHC', 'SCHL'),
  ('build-canada', 'batir-au-canada', 'Build Canada', 'Bâtir au Canada'),
  ('net-zero', 'zero-net', 'Net Zero', 'Zéro net'),
  ('prefab', 'prefabrique', 'Prefab', 'Préfabriqué')
ON CONFLICT (slug_en) DO NOTHING;
```

**Apply Manual Migration:**

```bash
# 1. Connect to Neon database
psql "$DATABASE_URL" -f drizzle/migrations/0001_blog_infrastructure.sql

# 2. Verify tables created
psql "$DATABASE_URL" -c "\dt" | grep blog
# Expected output:
# blog_posts
# blog_categories
# blog_tags
# post_tags
# post_versions
# authors

# 3. Verify seed data
psql "$DATABASE_URL" -c "SELECT name, email FROM authors;"
psql "$DATABASE_URL" -c "SELECT name_en, slug_en FROM blog_categories;"
```

---

### Step 3: Backend API Routes (Express)

**File:** `server/routes.ts`

**Location:** Add AFTER line 352 (after protected security code block)

```typescript
// ============================================
// BLOG API ROUTES (AFTER LINE 352 - Safe to add)
// ============================================

import { desc, eq, and, sql, ilike } from 'drizzle-orm';
import {
  blogPosts,
  authors,
  blogCategories,
  blogTags,
  postTags
} from '@db/schema';

// ============================================
// PUBLIC BLOG ROUTES (No Authentication Required)
// ============================================

/**
 * GET /api/blog/posts
 * Fetch published blog posts (paginated, filterable by language/category)
 * Query params: lang (en|fr), category, page, limit
 */
app.get('/api/blog/posts', async (req, res) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [
      eq(blogPosts.status, 'published'),
      sql`${blogPosts.published_at} <= NOW()` // Only show posts published in the past
    ];

    if (category) {
      // Join with categories table to filter by slug
      const categoryRecord = await db
        .select()
        .from(blogCategories)
        .where(
          lang === 'fr'
            ? eq(blogCategories.slug_fr, category)
            : eq(blogCategories.slug_en, category)
        )
        .limit(1);

      if (categoryRecord.length > 0) {
        conditions.push(eq(blogPosts.category_id, categoryRecord[0].id));
      }
    }

    // Fetch posts with author and category data
    const posts = await db
      .select({
        id: blogPosts.id,
        slug: lang === 'fr' ? blogPosts.slug_fr : blogPosts.slug_en,
        title: lang === 'fr' ? blogPosts.title_fr : blogPosts.title_en,
        excerpt: lang === 'fr' ? blogPosts.excerpt_fr : blogPosts.excerpt_en,
        featuredImage: blogPosts.featured_image_url,
        featuredImageAlt: lang === 'fr' ? blogPosts.featured_image_alt_fr : blogPosts.featured_image_alt_en,
        publishedAt: blogPosts.published_at,
        readingTime: blogPosts.reading_time_minutes,
        viewCount: blogPosts.view_count,
        authorName: authors.name,
        authorAvatar: authors.avatar_url,
        categoryName: lang === 'fr' ? blogCategories.name_fr : blogCategories.name_en,
        categorySlug: lang === 'fr' ? blogCategories.slug_fr : blogCategories.slug_en
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.author_id, authors.id))
      .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
      .where(and(...conditions))
      .orderBy(desc(blogPosts.published_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(and(...conditions));

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * GET /api/blog/posts/:slug
 * Fetch single blog post by slug (bilingual)
 * Query params: lang (en|fr)
 */
app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const lang = (req.query.lang as string) || 'en';

    const post = await db
      .select({
        id: blogPosts.id,
        slug: lang === 'fr' ? blogPosts.slug_fr : blogPosts.slug_en,
        title: lang === 'fr' ? blogPosts.title_fr : blogPosts.title_en,
        content: lang === 'fr' ? blogPosts.content_fr : blogPosts.content_en,
        excerpt: lang === 'fr' ? blogPosts.excerpt_fr : blogPosts.excerpt_en,
        metaTitle: lang === 'fr' ? blogPosts.meta_title_fr : blogPosts.meta_title_en,
        metaDescription: lang === 'fr' ? blogPosts.meta_description_fr : blogPosts.meta_description_en,
        featuredImage: blogPosts.featured_image_url,
        featuredImageAlt: lang === 'fr' ? blogPosts.featured_image_alt_fr : blogPosts.featured_image_alt_en,
        ogImage: blogPosts.og_image_url,
        publishedAt: blogPosts.published_at,
        updatedAt: blogPosts.updated_at,
        readingTime: blogPosts.reading_time_minutes,
        viewCount: blogPosts.view_count,
        authorId: authors.id,
        authorName: authors.name,
        authorBio: lang === 'fr' ? authors.bio_fr : authors.bio_en,
        authorTitle: lang === 'fr' ? authors.title_fr : authors.title_en,
        authorAvatar: authors.avatar_url,
        authorLinkedIn: authors.linkedin_url,
        categoryName: lang === 'fr' ? blogCategories.name_fr : blogCategories.name_en,
        categorySlug: lang === 'fr' ? blogCategories.slug_fr : blogCategories.slug_en
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.author_id, authors.id))
      .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
      .where(
        and(
          lang === 'fr'
            ? eq(blogPosts.slug_fr, slug)
            : eq(blogPosts.slug_en, slug),
          eq(blogPosts.status, 'published')
        )
      )
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count (async, don't wait)
    db.update(blogPosts)
      .set({ view_count: sql`${blogPosts.view_count} + 1` })
      .where(eq(blogPosts.id, post[0].id))
      .execute()
      .catch(err => console.error('Failed to update view count:', err));

    res.json(post[0]);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

/**
 * GET /api/blog/categories
 * Fetch all blog categories (bilingual)
 * Query params: lang (en|fr)
 */
app.get('/api/blog/categories', async (req, res) => {
  try {
    const lang = (req.query.lang as string) || 'en';

    const categories = await db
      .select({
        id: blogCategories.id,
        slug: lang === 'fr' ? blogCategories.slug_fr : blogCategories.slug_en,
        name: lang === 'fr' ? blogCategories.name_fr : blogCategories.name_en,
        description: lang === 'fr' ? blogCategories.description_fr : blogCategories.description_en
      })
      .from(blogCategories)
      .orderBy(lang === 'fr' ? blogCategories.name_fr : blogCategories.name_en);

    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/blog/related/:postId
 * Fetch related posts (same category, excluding current post)
 * Query params: lang (en|fr), limit (default 3)
 */
app.get('/api/blog/related/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const lang = (req.query.lang as string) || 'en';
    const limit = parseInt(req.query.limit as string) || 3;

    // Get current post's category
    const currentPost = await db
      .select({ category_id: blogPosts.category_id })
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (currentPost.length === 0 || !currentPost[0].category_id) {
      return res.json([]);
    }

    // Fetch related posts
    const relatedPosts = await db
      .select({
        id: blogPosts.id,
        slug: lang === 'fr' ? blogPosts.slug_fr : blogPosts.slug_en,
        title: lang === 'fr' ? blogPosts.title_fr : blogPosts.title_en,
        excerpt: lang === 'fr' ? blogPosts.excerpt_fr : blogPosts.excerpt_en,
        featuredImage: blogPosts.featured_image_url,
        publishedAt: blogPosts.published_at,
        readingTime: blogPosts.reading_time_minutes
      })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.category_id, currentPost[0].category_id),
          sql`${blogPosts.id} != ${postId}`,
          eq(blogPosts.status, 'published')
        )
      )
      .orderBy(desc(blogPosts.published_at))
      .limit(limit);

    res.json(relatedPosts);
  } catch (error: any) {
    console.error('Error fetching related posts:', error);
    res.status(500).json({ error: 'Failed to fetch related posts' });
  }
});

// ============================================
// ADMIN BLOG ROUTES (TODO: Add Authentication Middleware)
// ============================================
// NOTE: For Week 1-2, these are unprotected for testing.
// Before production, add authentication middleware (e.g., JWT, session-based)

/**
 * POST /api/blog/admin/posts
 * Create new blog post (ADMIN ONLY)
 * Body: { title_en, title_fr, content_en, content_fr, author_id, category_id, status, ... }
 */
app.post('/api/blog/admin/posts', async (req, res) => {
  try {
    const {
      title_en, title_fr,
      content_en, content_fr,
      excerpt_en, excerpt_fr,
      slug_en, slug_fr,
      author_id,
      category_id,
      status = 'draft',
      meta_title_en, meta_title_fr,
      meta_description_en, meta_description_fr,
      featured_image_url,
      reading_time_minutes
    } = req.body;

    // Validation
    if (!title_en || !title_fr || !content_en || !content_fr || !author_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Auto-generate slugs if not provided
    const finalSlugEn = slug_en || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalSlugFr = slug_fr || title_fr.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüÿœæ]+/g, '-');

    // Insert post
    const newPost = await db
      .insert(blogPosts)
      .values({
        title_en, title_fr,
        content_en, content_fr,
        excerpt_en, excerpt_fr,
        slug_en: finalSlugEn,
        slug_fr: finalSlugFr,
        author_id,
        category_id,
        status,
        meta_title_en, meta_title_fr,
        meta_description_en, meta_description_fr,
        featured_image_url,
        reading_time_minutes,
        published_at: status === 'published' ? new Date() : null
      })
      .returning();

    res.status(201).json(newPost[0]);
  } catch (error: any) {
    console.error('Error creating blog post:', error);

    // Handle unique constraint violations (duplicate slug)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Slug already exists' });
    }

    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog/admin/posts/:id
 * Update existing blog post (ADMIN ONLY)
 */
app.put('/api/blog/admin/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If publishing, set published_at
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date();
    }

    // Increment version number
    updateData.version = sql`${blogPosts.version} + 1`;
    updateData.updated_at = new Date();

    const updatedPost = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    if (updatedPost.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(updatedPost[0]);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

/**
 * DELETE /api/blog/admin/posts/:id
 * Delete blog post (ADMIN ONLY)
 */
app.delete('/api/blog/admin/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();

    if (deletedPost.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});
```

---

### Step 4: RSS Feed Implementation (Dynamic Generation)

**File:** `server/routes.ts` (continue adding after blog routes)

```typescript
// ============================================
// RSS FEED GENERATION (SEO Phase 5)
// ============================================

/**
 * Helper: Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * GET /en/rss.xml
 * Generate RSS feed for English blog posts
 */
app.get('/en/rss.xml', async (req, res) => {
  try {
    const posts = await db
      .select({
        title: blogPosts.title_en,
        slug: blogPosts.slug_en,
        excerpt: blogPosts.excerpt_en,
        content: blogPosts.content_en,
        publishedAt: blogPosts.published_at,
        authorName: authors.name,
        featuredImage: blogPosts.featured_image_url,
        categoryName: blogCategories.name_en
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.author_id, authors.id))
      .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.published_at))
      .limit(50);

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>ILLUMMAA Blog - Modular Housing Insights</title>
    <link>https://illummaa.com/en/blog</link>
    <description>Expert insights on modular housing, sustainable construction, and Canadian housing programs</description>
    <language>en-CA</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://illummaa.com/en/rss.xml" rel="self" type="application/rss+xml"/>

    ${posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://illummaa.com/en/blog/${post.slug}</link>
      <guid isPermaLink="true">https://illummaa.com/en/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate>
      <author>${escapeXml(post.authorName)}</author>
      <category>${escapeXml(post.categoryName || 'Uncategorized')}</category>
      <description>${escapeXml(post.excerpt || '')}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      ${post.featuredImage ? `<enclosure url="${escapeXml(post.featuredImage)}" type="image/jpeg"/>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

    res.header('Content-Type', 'application/rss+xml; charset=UTF-8');
    res.send(rssXml);
  } catch (error: any) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Failed to generate RSS feed');
  }
});

/**
 * GET /fr/rss.xml
 * Generate RSS feed for French blog posts
 */
app.get('/fr/rss.xml', async (req, res) => {
  try {
    const posts = await db
      .select({
        title: blogPosts.title_fr,
        slug: blogPosts.slug_fr,
        excerpt: blogPosts.excerpt_fr,
        content: blogPosts.content_fr,
        publishedAt: blogPosts.published_at,
        authorName: authors.name,
        featuredImage: blogPosts.featured_image_url,
        categoryName: blogCategories.name_fr
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.author_id, authors.id))
      .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.published_at))
      .limit(50);

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>ILLUMMAA Blog - Perspectives sur le logement modulaire</title>
    <link>https://illummaa.com/fr/blog</link>
    <description>Perspectives d'experts sur le logement modulaire, la construction durable et les programmes canadiens de logement</description>
    <language>fr-CA</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://illummaa.com/fr/rss.xml" rel="self" type="application/rss+xml"/>

    ${posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://illummaa.com/fr/blog/${post.slug}</link>
      <guid isPermaLink="true">https://illummaa.com/fr/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate>
      <author>${escapeXml(post.authorName)}</author>
      <category>${escapeXml(post.categoryName || 'Non catégorisé')}</category>
      <description>${escapeXml(post.excerpt || '')}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      ${post.featuredImage ? `<enclosure url="${escapeXml(post.featuredImage)}" type="image/jpeg"/>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

    res.header('Content-Type', 'application/rss+xml; charset=UTF-8');
    res.send(rssXml);
  } catch (error: any) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Failed to generate RSS feed');
  }
});
```

---

## Week 2: Frontend Components & Code Splitting

### Step 5: Code Splitting Configuration (40% Bundle Reduction)

**File:** `vite.config.ts`

**Action:** REPLACE entire file with enhanced configuration

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import cartographer from "@replit/vite-plugin-cartographer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    cartographer(),
    runtimeErrorOverlay(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@db": path.resolve(__dirname, "db"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,

    // ============================================
    // CODE SPLITTING (Phase 4 - Item 4.3)
    // Target: 40% bundle reduction (660KB → 360KB)
    // ============================================
    rollupOptions: {
      output: {
        manualChunks: {
          // ===== CORE DEPENDENCIES (loaded on every page) =====
          'vendor-react': ['react', 'react-dom'],  // ~120KB
          'vendor-router': ['wouter'],              // ~15KB

          // ===== UI FRAMEWORK (shared across pages) =====
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
          ],  // ~80KB

          // ===== DATA FETCHING =====
          'vendor-query': ['@tanstack/react-query'],  // ~25KB

          // ===== ANALYTICS (existing - DO NOT MODIFY SOURCE) =====
          // Note: This chunks the file, doesn't modify analytics.ts (391 lines)
          'analytics': ['./src/lib/analytics.ts'],  // ~20KB

          // ===== ICONS =====
          'icons': ['lucide-react'],  // ~40KB

          // ===== BLOG CHUNK (lazy-loaded only on /blog routes) =====
          'blog': [
            // Blog page components will be auto-detected
            // This chunk loads only when user navigates to /blog
          ],  // ~100KB estimated

          // ===== FORM LIBRARIES (only loaded on assessment page) =====
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'libphonenumber-js'
          ],  // ~60KB
        },

        // Optimize chunk filenames for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Increase chunk size warning limit (500KB is reasonable for initial load)
    chunkSizeWarningLimit: 500,

    // Enable minification
    minify: 'esbuild',

    // Source maps for production debugging (optional - remove if bundle size critical)
    sourcemap: false
  }
});
```

**Verify Code Splitting Results:**

```bash
# Build the project
npm run build

# Check chunk sizes (should see multiple smaller chunks)
ls -lh dist/public/assets/*.js

# Expected output:
# vendor-react-abc123.js   ~120KB (React core)
# vendor-router-def456.js   ~15KB (Wouter)
# ui-radix-ghi789.js        ~80KB (Radix UI)
# vendor-query-jkl012.js    ~25KB (React Query)
# analytics-mno345.js       ~20KB (GA4 - chunked, not modified)
# icons-pqr678.js           ~40KB (Lucide)
# forms-stu901.js           ~60KB (Form libraries)
# blog-vwx234.js            ~100KB (Blog components - lazy loaded)

# Total initial load: ~360KB (down from 660KB) ✅ 40% reduction
```

---

### Step 6: Blog Routes in App.tsx

**File:** `client/src/App.tsx`

**Action:** Add blog routes (lazy-loaded) after line 14

```typescript
import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { analytics } from "./lib/analytics";
import "./i18n"; // Initialize i18next

// Performance: Lazy load route components for code splitting (40% bundle reduction)
const Home = lazy(() => import("@/pages/home"));
const Model1BRCompact = lazy(() => import("@/pages/model-1br-compact"));
const Model2BRFamily = lazy(() => import("@/pages/model-2br-family"));
const Model3BRExecutive = lazy(() => import("@/pages/model-3br-executive"));
const NotFound = lazy(() => import("@/pages/not-found"));

// ===== BLOG ROUTES (lazy-loaded - only loads when visiting /blog) =====
const BlogLanding = lazy(() => import("@/pages/BlogLanding"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const BlogCategory = lazy(() => import("@/pages/BlogCategory"));

function Router() {
  const [location] = useLocation();
  const previousLocation = useRef<string>("");

  // Track SPA route changes for analytics (preserved - fires before component loads)
  useEffect(() => {
    if (previousLocation.current && previousLocation.current !== location) {
      analytics.trackRouteChange(location, previousLocation.current);
    }
    previousLocation.current = location;
  }, [location]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <Switch>
        {/* Language-prefixed routes (EXISTING - DO NOT MODIFY) */}
        <Route path="/:lang(en|fr)/" component={Home} />
        <Route path="/:lang(en|fr)/models/1br-compact" component={Model1BRCompact} />
        <Route path="/:lang(en|fr)/models/2br-family" component={Model2BRFamily} />
        <Route path="/:lang(en|fr)/models/3br-executive" component={Model3BRExecutive} />

        {/* ===== BLOG ROUTES (NEW - Bilingual) ===== */}
        <Route path="/:lang(en|fr)/blog" component={BlogLanding} />
        <Route path="/:lang(en|fr)/blog/category/:category" component={BlogCategory} />
        <Route path="/:lang(en|fr)/blog/:slug" component={BlogPost} />

        {/* Legacy routes without language prefix - redirect to /en */}
        <Route path="/" component={Home} />
        <Route path="/models/1br-compact" component={Model1BRCompact} />
        <Route path="/models/2br-family" component={Model2BRFamily} />
        <Route path="/models/3br-executive" component={Model3BRExecutive} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

### Step 7: Blog Analytics Extension (EXTENDS analytics.ts, does NOT modify)

**File:** `client/src/lib/blog-analytics.ts` (NEW FILE)

```typescript
/**
 * Blog Analytics Extension
 *
 * IMPORTANT: This file EXTENDS analytics.ts (391 lines) without modifying it.
 * Imports the existing analytics instance and adds blog-specific tracking.
 *
 * New GA4 Events (in addition to existing 8 events):
 * 9. blog_post_view - When user views a blog post
 * 10. blog_reading_progress - 25%, 50%, 75%, 100% scroll milestones
 * 11. blog_navigation - Category/tag clicks within blog
 * 12. blog_social_share - Social sharing button clicks
 */

import { analytics } from './analytics';

// ============================================
// BLOG POST VIEW TRACKING
// ============================================

export interface BlogPostViewParams {
  postId: string;
  postTitle: string;
  postSlug: string;
  category: string;
  author: string;
  language: 'en' | 'fr';
  readingTime: number; // minutes
}

export function trackBlogPostView(params: BlogPostViewParams): void {
  analytics.track('blog_post_view', {
    post_id: params.postId,
    post_title: params.postTitle,
    post_slug: params.postSlug,
    category: params.category,
    author: params.author,
    language: params.language,
    reading_time: params.readingTime,
    page_path: window.location.pathname,
    page_url: window.location.href
  });
}

// ============================================
// READING PROGRESS TRACKING
// ============================================

export interface ReadingProgressParams {
  postId: string;
  postSlug: string;
  percentage: number; // 25, 50, 75, or 100
  timeSpent: number; // seconds since page load
}

export function trackReadingProgress(params: ReadingProgressParams): void {
  analytics.track('blog_reading_progress', {
    post_id: params.postId,
    post_slug: params.postSlug,
    progress_percentage: params.percentage,
    time_spent_seconds: params.timeSpent,
    page_path: window.location.pathname
  });
}

// ============================================
// BLOG NAVIGATION TRACKING
// ============================================

export interface BlogNavigationParams {
  actionType: 'category_click' | 'tag_click' | 'related_post_click' | 'author_click';
  targetLabel: string; // Category name, tag name, or post title
  targetUrl: string;
  sourceLocation: 'sidebar' | 'post_header' | 'post_footer' | 'related_posts';
}

export function trackBlogNavigation(params: BlogNavigationParams): void {
  analytics.track('blog_navigation', {
    action_type: params.actionType,
    target_label: params.targetLabel,
    target_url: params.targetUrl,
    source_location: params.sourceLocation,
    page_path: window.location.pathname
  });
}

// ============================================
// SOCIAL SHARING TRACKING
// ============================================

export interface SocialShareParams {
  postId: string;
  postTitle: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'email' | 'copy_link';
  language: 'en' | 'fr';
}

export function trackSocialShare(params: SocialShareParams): void {
  analytics.track('blog_social_share', {
    post_id: params.postId,
    post_title: params.postTitle,
    platform: params.platform,
    language: params.language,
    page_path: window.location.pathname
  });
}

// ============================================
// READING PROGRESS HOOK (React Hook for Auto-Tracking)
// ============================================

import { useEffect, useRef } from 'react';

export function useReadingProgress(postId: string, postSlug: string) {
  const milestones = useRef<Set<number>>(new Set()); // Track which milestones hit
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate scroll percentage
      const scrollPercentage = Math.round(
        (scrollTop / (documentHeight - windowHeight)) * 100
      );

      // Check milestones: 25%, 50%, 75%, 100%
      const checkpoints = [25, 50, 75, 100];
      checkpoints.forEach(checkpoint => {
        if (scrollPercentage >= checkpoint && !milestones.current.has(checkpoint)) {
          milestones.current.add(checkpoint);

          const timeSpent = Math.round((Date.now() - startTime.current) / 1000);

          trackReadingProgress({
            postId,
            postSlug,
            percentage: checkpoint,
            timeSpent
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [postId, postSlug]);
}

// ============================================
// BLOG ANALYTICS EXPORT (Consolidated)
// ============================================

export const blogAnalytics = {
  trackPostView: trackBlogPostView,
  trackReadingProgress: trackReadingProgress,
  trackNavigation: trackBlogNavigation,
  trackSocialShare: trackSocialShare,
  useReadingProgress
};
```

---

### Step 8: i18next Translation Keys (Blog)

**File:** `client/src/locales/en.json`

**Action:** Add blog translations to EXISTING file (append to end)

```json
{
  // ... existing translations ...

  "blog": {
    "title": "Blog",
    "subtitle": "Insights on modular housing, sustainability, and Canadian housing programs",
    "readMore": "Read More",
    "backToBlog": "Back to Blog",
    "readingTime": "{{minutes}} min read",
    "publishedOn": "Published on {{date}}",
    "updatedOn": "Updated on {{date}}",
    "writtenBy": "Written by",
    "inCategory": "in {{category}}",
    "relatedPosts": "Related Posts",
    "categories": "Categories",
    "tags": "Tags",
    "allPosts": "All Posts",
    "noPosts": "No blog posts found.",
    "loadMore": "Load More",
    "share": "Share",
    "shareOn": "Share on {{platform}}",
    "copyLink": "Copy Link",
    "linkCopied": "Link copied to clipboard!"
  }
}
```

**File:** `client/src/locales/fr.json`

**Action:** Add French blog translations

```json
{
  // ... existing translations ...

  "blog": {
    "title": "Blog",
    "subtitle": "Perspectives sur le logement modulaire, la durabilité et les programmes canadiens de logement",
    "readMore": "Lire la suite",
    "backToBlog": "Retour au blog",
    "readingTime": "{{minutes}} min de lecture",
    "publishedOn": "Publié le {{date}}",
    "updatedOn": "Mis à jour le {{date}}",
    "writtenBy": "Écrit par",
    "inCategory": "dans {{category}}",
    "relatedPosts": "Articles connexes",
    "categories": "Catégories",
    "tags": "Étiquettes",
    "allPosts": "Tous les articles",
    "noPosts": "Aucun article de blog trouvé.",
    "loadMore": "Charger plus",
    "share": "Partager",
    "shareOn": "Partager sur {{platform}}",
    "copyLink": "Copier le lien",
    "linkCopied": "Lien copié dans le presse-papiers !"
  }
}
```

---

### Step 9: Blog Landing Page Component

**File:** `client/src/pages/BlogLanding.tsx` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: string;
  readingTime: number;
  viewCount: number;
  authorName: string;
  authorAvatar: string | null;
  categoryName: string;
  categorySlug: string;
}

interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BlogLanding() {
  const { lang } = useParams<{ lang: 'en' | 'fr' }>();
  const { t, i18n } = useTranslation();
  const currentLang = lang || i18n.language || 'en';

  // Fetch blog posts
  const { data, isLoading, error } = useQuery<BlogPostsResponse>({
    queryKey: ['blog-posts', currentLang, 1],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts?lang=${currentLang}&page=1&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery<Array<{ id: string; slug: string; name: string }>>({
    queryKey: ['blog-categories', currentLang],
    queryFn: async () => {
      const response = await fetch(`/api/blog/categories?lang=${currentLang}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Error loading blog posts. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('blog.subtitle')}
        </p>
      </div>

      {/* Categories Filter */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Link href={`/${currentLang}/blog`}>
            <Button variant="outline">{t('blog.allPosts')}</Button>
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/${currentLang}/blog/category/${category.slug}`}>
              <Button variant="outline">{category.name}</Button>
            </Link>
          ))}
        </div>
      )}

      {/* Blog Posts Grid */}
      {data && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {data.posts.map((post) => (
            <Link key={post.id} href={`/${currentLang}/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  {post.categoryName && (
                    <div className="text-sm text-primary font-medium mb-2">
                      {post.categoryName}
                    </div>
                  )}
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString(
                          currentLang === 'fr' ? 'fr-CA' : 'en-CA',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{t('blog.readingTime', { minutes: post.readingTime })}</span>
                    </div>
                  </div>
                  {post.authorName && (
                    <div className="flex items-center gap-2 mt-4">
                      {post.authorAvatar && (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-4 h-4" />
                        <span>{post.authorName}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t('blog.noPosts')}</p>
        </div>
      )}

      {/* Pagination (TODO: Implement in future iterations) */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Button variant="outline">{t('blog.loadMore')}</Button>
        </div>
      )}
    </div>
  );
}
```

---

### Step 10: Blog Post Page Component (with SEO & Analytics)

**File:** `client/src/pages/BlogPost.tsx` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { blogAnalytics } from '@/lib/blog-analytics';

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  ogImage: string | null;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  viewCount: number;
  authorId: string;
  authorName: string;
  authorBio: string;
  authorTitle: string;
  authorAvatar: string | null;
  authorLinkedIn: string | null;
  categoryName: string;
  categorySlug: string;
}

export default function BlogPost() {
  const { lang, slug } = useParams<{ lang: 'en' | 'fr'; slug: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = lang || i18n.language || 'en';

  // Fetch blog post
  const { data: post, isLoading, error } = useQuery<BlogPostData>({
    queryKey: ['blog-post', slug, currentLang],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/${slug}?lang=${currentLang}`);
      if (!response.ok) {
        throw new Error('Blog post not found');
      }
      return response.json();
    },
    enabled: !!slug
  });

  // Track reading progress (25%, 50%, 75%, 100% milestones)
  useEffect(() => {
    if (post) {
      blogAnalytics.trackPostView({
        postId: post.id,
        postTitle: post.title,
        postSlug: post.slug,
        category: post.categoryName,
        author: post.authorName,
        language: currentLang,
        readingTime: post.readingTime
      });
    }
  }, [post, currentLang]);

  // Use reading progress hook for scroll tracking
  blogAnalytics.useReadingProgress(post?.id || '', post?.slug || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">404 - Post Not Found</h1>
        <Link href={`/${currentLang}/blog`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.backToBlog')}
          </Button>
        </Link>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    blogAnalytics.trackSocialShare({
      postId: post.id,
      postTitle: post.title,
      platform: platform as any,
      language: currentLang
    });

    const url = window.location.href;
    const title = post.title;

    const shareUrls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    } else if (platform === 'copy_link') {
      navigator.clipboard.writeText(url);
      alert(t('blog.linkCopied'));
    }
  };

  return (
    <>
      {/* SEO Meta Tags (Phase 1 - Item 1.1) */}
      <Helmet>
        <title>{post.metaTitle || post.title}</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />

        {/* Open Graph (Social Sharing) */}
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {post.ogImage && <meta property="og:image" content={post.ogImage} />}
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.authorName} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle || post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        {post.ogImage && <meta name="twitter:image" content={post.ogImage} />}

        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />

        {/* Hreflang (Bilingual) */}
        <link rel="alternate" hrefLang="en" href={`https://illummaa.com/en/blog/${post.slug}`} />
        <link rel="alternate" hrefLang="fr" href={`https://illummaa.com/fr/blog/${post.slug}`} />
      </Helmet>

      <article className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back Button */}
        <Link href={`/${currentLang}/blog`}>
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.backToBlog')}
          </Button>
        </Link>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="aspect-video overflow-hidden rounded-lg mb-8">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Category Badge */}
        {post.categoryName && (
          <Link href={`/${currentLang}/blog/category/${post.categorySlug}`}>
            <Button variant="outline" size="sm" className="mb-4">
              {post.categoryName}
            </Button>
          </Link>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            {post.authorAvatar && (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                <User className="w-4 h-4" />
                <span>{post.authorName}</span>
              </div>
              {post.authorTitle && (
                <div className="text-xs">{post.authorTitle}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(post.publishedAt).toLocaleDateString(
                currentLang === 'fr' ? 'fr-CA' : 'en-CA',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            <span>{t('blog.readingTime', { minutes: post.readingTime })}</span>
          </div>
        </div>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Buttons */}
        <div className="flex items-center gap-4 py-8 border-t border-b">
          <span className="font-medium">{t('blog.share')}:</span>
          <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')}>
            LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
            Twitter
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare('copy_link')}>
            <Share2 className="w-4 h-4 mr-2" />
            {t('blog.copyLink')}
          </Button>
        </div>

        {/* Author Bio */}
        {post.authorBio && (
          <Card className="mt-12">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {post.authorAvatar && (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-16 h-16 rounded-full flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg mb-1">{post.authorName}</h3>
                  {post.authorTitle && (
                    <p className="text-sm text-muted-foreground mb-2">{post.authorTitle}</p>
                  )}
                  <p className="text-sm mb-3">{post.authorBio}</p>
                  {post.authorLinkedIn && (
                    <a
                      href={post.authorLinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Connect on LinkedIn →
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </article>
    </>
  );
}
```

---

### Step 11: Blog Category Page Component

**File:** `client/src/pages/BlogCategory.tsx` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: string;
  readingTime: number;
  authorName: string;
}

interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BlogCategory() {
  const { lang, category } = useParams<{ lang: 'en' | 'fr'; category: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = lang || i18n.language || 'en';

  const { data, isLoading } = useQuery<BlogPostsResponse>({
    queryKey: ['blog-category', category, currentLang],
    queryFn: async () => {
      const response = await fetch(
        `/api/blog/posts?lang=${currentLang}&category=${category}&page=1&limit=20`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    enabled: !!category
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Link href={`/${currentLang}/blog`}>
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlog')}
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-12 capitalize">
        {category.replace(/-/g, ' ')}
      </h1>

      {data && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.posts.map((post) => (
            <Link key={post.id} href={`/${currentLang}/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="aspect-video object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readingTime} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('blog.noPosts')}</p>
      )}
    </div>
  );
}
```

---

## Testing Checklist

### ✅ Week 1 Testing (Database & Backend)

```bash
# 1. Database Migration
[ ] Tables created successfully (blog_posts, authors, blog_categories, blog_tags, post_tags, post_versions)
[ ] Seed data inserted (default author, 5 categories, 5 tags)
[ ] Indexes created (slug_en, slug_fr, status, published_at)

# 2. API Endpoints (Use Postman, curl, or browser)
[ ] GET /api/blog/posts?lang=en - Returns empty array (no posts yet)
[ ] GET /api/blog/categories?lang=en - Returns 5 categories
[ ] POST /api/blog/admin/posts - Creates new post successfully
[ ] GET /api/blog/posts/:slug?lang=en - Returns created post
[ ] PUT /api/blog/admin/posts/:id - Updates post
[ ] DELETE /api/blog/admin/posts/:id - Deletes post

# 3. RSS Feeds
[ ] GET /en/rss.xml - Returns valid XML (test in browser)
[ ] GET /fr/rss.xml - Returns valid XML
[ ] Validate RSS with https://validator.w3.org/feed/

# 4. Security Verification (NEVER modify protected files)
[ ] analytics.ts unchanged (391 lines)
[ ] scoring.ts unchanged (217 lines)
[ ] routes.ts lines 218-352 unchanged (security headers intact)
```

### ✅ Week 2 Testing (Frontend & Code Splitting)

```bash
# 1. Code Splitting Verification
[ ] npm run build - Succeeds without errors
[ ] Bundle size reduced 40% (660KB → ~360KB initial load)
[ ] Multiple chunk files created (vendor-react, ui-radix, blog, etc.)
[ ] Blog chunks load only when visiting /blog routes

# 2. Blog Routes
[ ] /en/blog - Displays blog landing page
[ ] /fr/blog - Displays French blog landing page
[ ] /en/blog/:slug - Displays single post
[ ] /fr/blog/:slug - Displays French single post
[ ] /en/blog/category/:category - Displays category page
[ ] 404 handling for non-existent posts

# 3. Analytics Tracking (Check GA4 Debug Mode)
[ ] blog_post_view event fires on post page load
[ ] blog_reading_progress fires at 25%, 50%, 75%, 100%
[ ] blog_navigation fires on category clicks
[ ] blog_social_share fires on share button clicks
[ ] Existing 8 GA4 events still fire correctly (CRITICAL)

# 4. Bilingual Functionality
[ ] Language switcher works (/en/blog ↔ /fr/blog)
[ ] Content displays in correct language
[ ] Hreflang tags present in HTML head
[ ] i18next translations load correctly

# 5. SEO Meta Tags (View page source)
[ ] <title> tag correct (60 chars max)
[ ] <meta name="description"> present (160 chars max)
[ ] Open Graph tags (og:title, og:description, og:image)
[ ] Twitter Card tags
[ ] Canonical URL present
[ ] Hreflang links present (en + fr)

# 6. Performance (Lighthouse Audit)
[ ] Performance: 95+ (maintained from baseline)
[ ] Accessibility: 100 (WCAG AA compliance)
[ ] Best Practices: 100
[ ] SEO: 100

# 7. Responsive Design (Test on 320px, 768px, 1920px)
[ ] Blog landing responsive
[ ] Blog post readable on mobile
[ ] Images scale correctly
[ ] No horizontal scroll
```

---

## Rollback Plan

### If Week 1 Fails (Database Issues)

```bash
# Option 1: Drop all blog tables (safe if no production data)
psql "$DATABASE_URL" << 'EOF'
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS blog_tags CASCADE;
DROP TABLE IF EXISTS post_versions CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
EOF

# Option 2: Restore from git
git stash
# Or
git reset --hard HEAD

# Option 3: Use Neon branch (rollback by deleting branch)
# Via Neon Console: Delete development branch, keep main intact
```

### If Week 2 Fails (Frontend Issues)

```bash
# Restore vite.config.ts
git checkout HEAD -- vite.config.ts

# Restore App.tsx
git checkout HEAD -- client/src/App.tsx

# Remove blog components
rm -rf client/src/pages/Blog*.tsx
rm -f client/src/lib/blog-analytics.ts

# Rebuild with original config
npm run build
```

---

## Next Steps After Week 1-2

**Week 3-4: Admin Dashboard & Rich Text Editor**
- Tiptap integration for WYSIWYG editing
- Image upload to Cloudinary
- Draft/publish workflow
- Scheduled publishing

**Week 5-6: SEO Phases 1-3 Implementation**
- Enhanced schema markup (Article, BreadcrumbList)
- Image optimization (WebP, lazy loading)
- E-E-A-T content enhancements

**Week 7-8: LLM/AEO Optimization (Phase 6)**
- SpeakableSpecification schema
- FAQ schema markup
- Voice search optimization
- Google SGE preparation

---

## Support & Resources

**Replit Documentation:**
- https://docs.replit.com/

**Neon PostgreSQL:**
- https://neon.tech/docs/introduction

**Drizzle ORM:**
- https://orm.drizzle.team/docs/overview

**React Query:**
- https://tanstack.com/query/latest

**Need Help?**
Ask me any questions about implementation, debugging, or next steps!

---

**End of Week 1-2 Implementation Guide**
