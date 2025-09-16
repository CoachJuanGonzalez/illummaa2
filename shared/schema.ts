import { pgTable, text, integer, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  budgetRange: text("budget_range"),
  decisionTimeline: text("decision_timeline"),
  constructionProvince: text("construction_province"),
  developerType: text("developer_type"),
  governmentPrograms: text("government_programs"),
  agentSupport: text("agent_support"),
  consentMarketing: boolean("consent_marketing").default(false),
  ageVerification: boolean("age_verification").default(false),
  projectDescription: text("project_description"),
  priorityScore: integer("priority_score").notNull(),
  customerTier: text("customer_tier").notNull(),
  priorityLevel: text("priority_level").notNull(),
  tags: text("tags").array(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Assessment form schema with v13.1 exact validation
export const assessmentSchema = z.object({
  readiness: z.enum([
    "researching",
    "planning-long", 
    "planning-medium",
    "planning-short",
    "immediate"
  ], { required_error: "Please select where you are in your modular home journey" }),
  
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
      // Remove all non-digit characters
      const cleaned = val.replace(/\D/g, '');
      
      // If it's exactly 10 digits AND doesn't start with 1, add +1 prefix
      if (cleaned.length === 10 && !cleaned.startsWith('1')) {
        return `+1${cleaned}`;
      }
      
      // If it's exactly 11 digits starting with 1, add + prefix
      if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
      }
      
      // For invalid cases, return original to trigger refine error
      return val;
    })
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '');
      
      // Must result in +1 followed by exactly 10 digits
      if (!/^\+1\d{10}$/.test(val)) {
        return false;
      }
      
      // Additional check: reject 10-digit numbers starting with 1 (incomplete 11-digit)
      if (cleaned.length === 10 && cleaned.startsWith('1')) {
        return false;
      }
      
      return true;
    }, {
      message: "Please enter a valid Canadian phone number (10 digits: area code + 7 digits, or 11 digits starting with 1)"
    }),
  
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .default("Individual Investor"),
  
  projectUnitCount: z.number()
    .min(0, "Please select the number of units for your project")
    .max(1000, "Number of units must be less than 1000"),
  
  budgetRange: z.enum([
    "Under $5 Million",
    "$5M - $15 Million", 
    "$15M - $30 Million",
    "$30M - $50 Million",
    "Over $50 Million"
  ]).optional(),
  
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
    "Commercial Developer (Large Projects)",
    "Government/Municipal Developer",
    "Non-Profit Housing Developer",
    "Private Developer (Medium Projects)"
  ]).optional(),
  
  governmentPrograms: z.enum([
    "Yes - Currently participating",
    "Interested - Tell us more",
    "No - Private development only"
  ]).optional(),
  
  agentSupport: z.enum([
    "no-direct",
    "no-agent", 
    "yes"
  ]).optional(),
  
  consentMarketing: z.boolean()
    .refine((val) => val === true, {
      message: "LEGAL REQUIREMENT: You must consent to communications before continuing. This is required under Canadian privacy law (CASL) to process your inquiry."
    }),
  
  ageVerification: z.boolean()
    .refine((val) => val === true, {
      message: "LEGAL REQUIREMENT: Age verification (18+) is required. Only adults can provide valid consent under Canadian law."
    }),
  
  projectDescriptionText: z.string()
    .max(1000, "Project description must be less than 1000 characters")
    .optional(),
}).superRefine((data, ctx) => {
  // Determine if this is Explorer or Starter tier based on Customer Journey logic
  const isExplorerTier = data.readiness === 'researching' || data.projectUnitCount === 0;
  const isStarterTier = !isExplorerTier && data.projectUnitCount <= 49;
  
  // For Pioneer, Preferred, and Elite tiers (non-Explorer/Starter), require these fields
  if (!isExplorerTier && !isStarterTier) {
    if (!data.budgetRange) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgetRange'],
        message: 'Please select a project budget range'
      });
    }
    
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
  }
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

export const insertAssessmentSchema = createInsertSchema(assessmentSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;
