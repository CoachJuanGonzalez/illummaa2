-- ============================================
-- ILLUMMAA Blog Infrastructure Migration
-- Created: 2025-10-14
-- Purpose: Week 1-2 Blog Implementation (Bilingual + 2025+ Future-Proofing)
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

-- Blog Posts Table (Full Schema with 2025+ Future-Proofing)
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
  author_id UUID NOT NULL,
  category_id UUID,

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
  post_id UUID NOT NULL,
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
  post_id UUID NOT NULL,
  tag_id UUID NOT NULL,
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

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify the migration was successful:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND (table_name LIKE 'blog%' OR table_name = 'authors');
--
-- SELECT name, email FROM authors;
-- SELECT name_en, slug_en FROM blog_categories;
-- ============================================
