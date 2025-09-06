import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Assessment submission table
export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  projectUnitCount: integer("project_unit_count").notNull(),
  budgetRange: text("budget_range").notNull(),
  decisionTimeline: text("decision_timeline").notNull(),
  constructionProvince: text("construction_province").notNull(),
  developerType: text("developer_type").notNull(),
  governmentPrograms: text("government_programs").notNull(),
  projectDescription: text("project_description"),
  priorityScore: integer("priority_score").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Assessment form schema with v13.1 exact validation
export const assessmentSchema = z.object({
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
    .max(100, "Company name must be less than 100 characters"),
  
  projectUnitCount: z.number()
    .min(1, "Number of units must be at least 1")
    .max(1000, "Number of units must be less than 1000"),
  
  budgetRange: z.enum([
    "Under $5 Million",
    "$5M - $15 Million", 
    "$15M - $30 Million",
    "$30M - $50 Million",
    "Over $50 Million"
  ], { required_error: "Please select a budget range" }),
  
  decisionTimeline: z.enum([
    "Immediate (0-3 months)",
    "Short-term (3-6 months)",
    "Medium-term (6-12 months)", 
    "Long-term (12+ months)"
  ], { required_error: "Please select a decision timeline" }),
  
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
  ], { required_error: "Please select a province" }),
  
  developerType: z.enum([
    "Commercial Developer (Large Projects)",
    "Government/Municipal Developer",
    "Non-Profit Housing Developer",
    "Private Developer (Medium Projects)"
  ], { required_error: "Please select a developer type" }),
  
  governmentPrograms: z.enum([
    "Yes - Currently participating",
    "Interested - Tell us more",
    "No - Private development only"
  ], { required_error: "Please select government program participation" }),
  
  projectDescriptionText: z.string()
    .max(1000, "Project description must be less than 1000 characters")
    .optional(),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

export const insertAssessmentSchema = createInsertSchema(assessmentSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;
