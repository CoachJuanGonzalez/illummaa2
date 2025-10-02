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
  decisionTimeline: text("decision_timeline"),
  constructionProvince: text("construction_province"),
  developerType: text("developer_type"),
  governmentPrograms: text("government_programs"),
  buildCanadaEligible: text("build_canada_eligible"),
  // B2B-only: Removed Explorer fields (learningInterest, informationPreference)
  agentSupport: text("agent_support"),
  consentMarketing: boolean("consent_marketing").default(false),
  consentSMS: boolean("consent_sms").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  ageVerification: boolean("age_verification").default(false),
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
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  
  projectUnitCount: z.number()
    .min(0, "Please enter a valid number of units")
    .max(10000, "Number of units must be 10,000 or less"),
  projectUnitRange: z.string().optional(),
  
  decisionTimeline: z.enum([
    "Immediate (0-3 months)",
    "Short-term (3-6 months)",
    "Medium-term (6-12 months)", 
    "Long-term (12+ months)"
  ]).optional(),
  
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
  ]).optional(),
  
  developerType: z.enum([
    "Indigenous Community/Organization",
    "Commercial Developer (Large Projects)",
    "Government/Municipal Developer",
    "Non-Profit Housing Developer",
    "Private Developer (Medium Projects)",
    "Individual/Family Developer"
  ]),
  
  governmentPrograms: z.enum([
    "Participating in government programs",
    "Not participating"
  ]).optional().describe("Government housing program participation status"),
  
  buildCanadaEligible: z.enum([
    "Yes",
    "No",
    "I don't know"
  ]).optional().describe("User self-certification of Build Canada eligibility"),
  
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
  
  projectDescriptionText: z.string()
    .max(1000, "Project description must be less than 1000 characters")
    .optional(),
  
  projectDescription: z.string()
    .max(1000, "Project description must be less than 1000 characters")
    .optional(),
}).superRefine((data, ctx) => {
  // B2B-ONLY: All users must provide business-related fields (no Explorer tier)
  // Minimum 10 units required for B2B partnership track
    if (!data.decisionTimeline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['decisionTimeline'],
        message: 'Please select a delivery timeline'
      });
    }
    
    if (!data.constructionProvince) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['constructionProvince'],
        message: 'Please select an installation province'
      });
    }
    
    if (!data.developerType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['developerType'],
        message: 'Please select a developer type'
      });
    }
    
    if (!data.governmentPrograms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['governmentPrograms'],
        message: 'Please select government program participation'
      });
    }
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

export const insertAssessmentSchema = createInsertSchema(assessmentSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;
