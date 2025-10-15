import { pgTable, text, integer, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

// Assessment submission table
export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  readiness: text("readiness").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  projectUnitCount: integer("project_unit_count").notNull(),
  decisionTimeline: text("decision_timeline").notNull(),
  constructionProvince: text("construction_province").notNull(),
  developerType: text("developer_type").notNull(),
  governmentPrograms: text("government_programs").notNull(),
  buildCanadaEligible: text("build_canada_eligible").notNull(),
  // B2B-only: Removed Explorer fields (learningInterest, informationPreference)
  agentSupport: text("agent_support"),
  consentMarketing: boolean("consent_marketing").default(false),
  consentSMS: boolean("consent_sms").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  ageVerification: boolean("age_verification").default(false),
  privacyPolicy: boolean("privacy_policy").default(false),
  projectDescription: text("project_description"),
  priorityScore: integer("priority_score"),
  customerTier: text("customer_tier").notNull(),
  priorityLevel: text("priority_level").notNull(),
  tags: text("tags").array(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Assessment form schema with v13.1 exact validation
export const assessmentSchema = z.object({
  readiness: z.enum([
    "planning-long",     // 12+ months  
    "planning-medium",   // 6-12 months
    "planning-short",    // 3-6 months
    "immediate"          // 0-3 months
  ], { required_error: "Please select your project timeline" }),
  
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name must contain only letters and spaces"),
  
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name must contain only letters and spaces"),
  
  email: z.string()
    .email("Please enter a valid email address"),
  
  phone: z.string()
    .min(1, "Phone number is required")
    .transform((val) => {
      // Remove whitespace
      const trimmed = val.trim();
      
      // Try to parse as international number
      try {
        // CRITICAL FIX: If already in E.164 format, validate and return AS-IS
        // Do NOT re-parse, as it can corrupt international numbers (e.g., Aruba +297 → +1297)
        if (trimmed.startsWith('+')) {
          // Validate it's a valid E.164 number
          if (isValidPhoneNumber(trimmed)) {
            return trimmed; // Return unchanged - already in correct format
          }
          // If invalid, try to parse it (might have wrong format)
          const parsed = parsePhoneNumber(trimmed);
          return parsed.number;
        }
        
        // Legacy Canadian format: 10-digit number without country code
        const cleaned = trimmed.replace(/\D/g, '');
        if (cleaned.length === 10 && !cleaned.startsWith('1')) {
          const parsed = parsePhoneNumber(cleaned, 'CA');
          return parsed.number; // Returns E.164 format like +14165551234
        }
        
        // Legacy Canadian format: 11-digit number starting with 1
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
          const parsed = parsePhoneNumber(cleaned, 'CA');
          return parsed.number; // Returns E.164 format
        }
        
        // Try parsing with default country detection
        const parsed = parsePhoneNumber(trimmed);
        return parsed.number;
      } catch {
        // If parsing fails, return as-is for validation error
        return trimmed;
      }
    })
    .refine((val) => {
      // Validate the normalized E.164 number
      try {
        return isValidPhoneNumber(val);
      } catch {
        return false;
      }
    }, {
      message: "Please enter a valid phone number with country code (e.g., +1 for Canada/US, +297 for Aruba)"
    }),
  
  company: z.string()
    .min(1, "Company/Organization name is required")
    .max(100, "Company name must be less than 100 characters"),
  
  projectUnitCount: z.number()
    .min(0, "Please enter a valid number of units")
    .max(1000000, "For projects over 1 million units, please contact our enterprise team"),
  projectUnitRange: z.string().optional(),
  
  decisionTimeline: z.enum([
    "Immediate (0-3 months)",
    "Short-term (3-6 months)",
    "Medium-term (6-12 months)", 
    "Long-term (12+ months)"
  ], { required_error: "Please select a delivery timeline" }),
  
  constructionProvince: z.enum([
    "Ontario",
    "British Columbia", 
    "Alberta",
    "Quebec",
    "Nova Scotia",
    "New Brunswick",
    "Manitoba",
    "Saskatchewan",
    "Newfoundland and Labrador",
    "Prince Edward Island",
    "Northwest Territories",
    "Nunavut",
    "Yukon"
  ], { required_error: "Please select a construction province/territory" }),
  
  developerType: z.enum([
    "Indigenous Community/Organization",
    "Commercial Developer (Large Projects)",
    "Government/Municipal Developer",
    "Non-Profit Housing Developer",
    "Private Developer (Medium Projects)",
    "Individual/Family Developer"
  ], { required_error: "Please select a developer type" }),
  
  governmentPrograms: z.enum([
    "Participating in government programs",
    "Not participating"
  ], { required_error: "Please select government program participation" })
    .describe("Government housing program participation status"),
  
  buildCanadaEligible: z.enum([
    "Yes",
    "No",
    "I don't know"
  ], { required_error: "Please select Build Canada eligibility status" })
    .describe("User self-certification of Build Canada eligibility"),
  
  // B2B-only: Explorer education fields removed for pure B2B focus
  
  agentSupport: z.enum([
    "no-direct",
    "no-agent", 
    "yes"
  ]).optional(),
  
  // ENTERPRISE SECURITY: Separate required CASL consent from optional marketing consent
  consentMarketing: z.boolean()
    .refine((val) => val === true, {
      message: "LEGAL REQUIREMENT: You must consent to communications before continuing. This is required under Canadian privacy law (CASL) to process your inquiry."
    }),
  
  // Add optional marketing consent field
  marketingConsent: z.boolean()
    .optional()
    .default(false),
  
  // Add optional SMS consent field
  consentSMS: z.boolean()
    .optional()
    .default(false),
  
  ageVerification: z.boolean()
    .refine((val) => val === true, {
      message: "LEGAL REQUIREMENT: Age verification (18+) is required. Only adults can provide valid consent under Canadian law."
    }),
  
  privacyPolicy: z.boolean()
    .refine((val) => val === true, {
      message: "LEGAL REQUIREMENT: You must accept the Privacy Policy to continue. This is required under Canadian privacy law (PIPEDA)."
    }),
  
  projectDescriptionText: z.string()
    .max(1000, "Project description must be less than 1000 characters")
    .optional(),
  
  projectDescription: z.string()
    .max(1000, "Project description must be less than 1000 characters")
    .optional(),
});
// B2B REQUIRED FIELDS VALIDATION:
// All 12 required fields are now properly enforced at the schema level:
// - readiness, projectUnitCount, firstName, lastName, email, phone (already required)
// - company, decisionTimeline, constructionProvince, developerType, governmentPrograms, buildCanadaEligible (now required)
// This ensures complete B2B data for every submission and eliminates validation conflicts

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

export const insertAssessmentSchema = createInsertSchema(assessmentSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;

// ============================================
// BLOG INFRASTRUCTURE (Phase 1-7 SEO)
// Added: 2025-10-14 for bilingual blog with 2025+ future-proofing
// ============================================

import { pgTable, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Authors Table
export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  bio_en: text('bio_en'),
  bio_fr: text('bio_fr'),
  title_en: varchar('title_en', { length: 255 }),
  title_fr: varchar('title_fr', { length: 255 }),
  avatar_url: text('avatar_url'),
  linkedin_url: text('linkedin_url'),
  twitter_url: text('twitter_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  emailIdx: index('authors_email_idx').on(table.email)
}));

// Blog Categories Table
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

// Blog Posts Table (Bilingual + 2025+ Future-Proofing)
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Bilingual content (separate columns)
  slug_en: varchar('slug_en', { length: 255 }).notNull().unique(),
  slug_fr: varchar('slug_fr', { length: 255 }).notNull().unique(),
  title_en: text('title_en').notNull(),
  title_fr: text('title_fr').notNull(),
  excerpt_en: text('excerpt_en'),
  excerpt_fr: text('excerpt_fr'),
  content_en: text('content_en').notNull(),
  content_fr: text('content_fr').notNull(),

  // SEO metadata (bilingual)
  meta_title_en: varchar('meta_title_en', { length: 60 }),
  meta_title_fr: varchar('meta_title_fr', { length: 60 }),
  meta_description_en: varchar('meta_description_en', { length: 160 }),
  meta_description_fr: varchar('meta_description_fr', { length: 160 }),
  focus_keyword_en: varchar('focus_keyword_en', { length: 100 }),
  focus_keyword_fr: varchar('focus_keyword_fr', { length: 100 }),

  // Relationships
  author_id: uuid('author_id').notNull(),
  category_id: uuid('category_id'),

  // Media
  featured_image_url: text('featured_image_url'),
  featured_image_alt_en: varchar('featured_image_alt_en', { length: 255 }),
  featured_image_alt_fr: varchar('featured_image_alt_fr', { length: 255 }),
  og_image_url: text('og_image_url'),

  // Publishing workflow
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  published_at: timestamp('published_at'),
  scheduled_publish_at: timestamp('scheduled_publish_at'),

  // Engagement metrics
  view_count: integer('view_count').notNull().default(0),
  reading_time_minutes: integer('reading_time_minutes'),

  // 2025+ future-proofing columns
  ai_suggested_title_en: text('ai_suggested_title_en'),
  ai_suggested_title_fr: text('ai_suggested_title_fr'),
  speakable_summary_en: text('speakable_summary_en'),
  speakable_summary_fr: text('speakable_summary_fr'),
  ai_content_quality_score: integer('ai_content_quality_score'),
  ai_seo_score: integer('ai_seo_score'),
  version: integer('version').notNull().default(1),
  last_reviewed_at: timestamp('last_reviewed_at'),
  consent_tracking_enabled: boolean('consent_tracking_enabled').notNull().default(true),

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

// Post Version History
export const postVersions = pgTable('post_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  post_id: uuid('post_id').notNull(),
  version_number: integer('version_number').notNull(),
  title_en: text('title_en').notNull(),
  title_fr: text('title_fr').notNull(),
  content_en: text('content_en').notNull(),
  content_fr: text('content_fr').notNull(),
  changed_by: uuid('changed_by').notNull(),
  change_description: text('change_description'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  postVersionIdx: index('post_versions_post_id_idx').on(table.post_id, table.version_number)
}));

// Blog Tags
export const blogTags = pgTable('blog_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug_en: varchar('slug_en', { length: 100 }).notNull().unique(),
  slug_fr: varchar('slug_fr', { length: 100 }).notNull().unique(),
  name_en: varchar('name_en', { length: 100 }).notNull(),
  name_fr: varchar('name_fr', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow()
});

// Post Tags Junction Table
export const postTags = pgTable('post_tags', {
  post_id: uuid('post_id').notNull(),
  tag_id: uuid('tag_id').notNull(),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  postTagIdx: index('post_tags_post_id_idx').on(table.post_id),
  tagPostIdx: index('post_tags_tag_id_idx').on(table.tag_id)
}));

// Drizzle ORM Relations
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
