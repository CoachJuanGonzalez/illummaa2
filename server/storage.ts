import { type AssessmentSubmission, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<AssessmentSubmission>;
  getAssessment(id: string): Promise<AssessmentSubmission | undefined>;
  getAssessmentsByEmail(email: string): Promise<AssessmentSubmission[]>;
  createResidentialAssessment(data: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private assessments: Map<string, AssessmentSubmission>;

  constructor() {
    this.assessments = new Map();
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<AssessmentSubmission> {
    const id = randomUUID();
    const assessment: AssessmentSubmission = {
      ...insertAssessment,
      id,
      submittedAt: new Date(),
      projectDescription: insertAssessment.projectDescription || null,
      agentSupport: insertAssessment.agentSupport || null,
      consentMarketing: insertAssessment.consentMarketing ?? false,
      ageVerification: insertAssessment.ageVerification ?? false,
      tags: insertAssessment.tags ?? null,
      // Handle optional fields for Explorer/Starter tiers
      budgetRange: insertAssessment.budgetRange || null,
      decisionTimeline: insertAssessment.decisionTimeline || null,
      constructionProvince: insertAssessment.constructionProvince || null,
      developerType: insertAssessment.developerType || null,
      governmentPrograms: insertAssessment.governmentPrograms || null,
    };
    
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessment(id: string): Promise<AssessmentSubmission | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentsByEmail(email: string): Promise<AssessmentSubmission[]> {
    return Array.from(this.assessments.values()).filter(
      (assessment) => assessment.email === email
    );
  }

  async createResidentialAssessment(data: any): Promise<any> {
    // Simple implementation for now - can be enhanced later with database schema
    return {
      id: `residential_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'residential',
      ...data,
      created_at: new Date().toISOString()
    };
  }
}

export const storage = new MemStorage();

// Assessment handler functions
import DOMPurify from 'isomorphic-dompurify';
import { assessmentSchema, type AssessmentFormData } from "@shared/schema";

export async function validateFormData(rawData: any): Promise<{
  isValid: boolean;
  data?: AssessmentFormData;
  errors?: any[];
  priorityScore?: number;
  customerTier?: string;
  priorityLevel?: string;
  tags?: string[];
}> {
  try {
    // Helper function to handle optional enum fields
    const sanitizeOptionalEnum = (value: any) => {
      if (!value || value === '' || value === null || value === undefined) {
        return undefined;
      }
      return DOMPurify.sanitize(value).trim();
    };

    // Sanitize input data
    const sanitizedData = {
      readiness: DOMPurify.sanitize(rawData.readiness || ''),
      firstName: DOMPurify.sanitize(rawData.firstName || '').trim(),
      lastName: DOMPurify.sanitize(rawData.lastName || '').trim(),
      email: DOMPurify.sanitize(rawData.email || '').trim().toLowerCase(),
      phone: DOMPurify.sanitize(rawData.phone || '').replace(/\s/g, ''),
      company: DOMPurify.sanitize(rawData.company || '').trim(),
      projectUnitCount: parseInt(rawData.projectUnitCount) || 0,
      budgetRange: sanitizeOptionalEnum(rawData.budgetRange),
      decisionTimeline: sanitizeOptionalEnum(rawData.decisionTimeline),
      constructionProvince: sanitizeOptionalEnum(rawData.constructionProvince),
      developerType: sanitizeOptionalEnum(rawData.developerType),
      governmentPrograms: sanitizeOptionalEnum(rawData.governmentPrograms),
      agentSupport: sanitizeOptionalEnum(rawData.agentSupport),
      consentMarketing: Boolean(rawData.consentMarketing),
      ageVerification: Boolean(rawData.ageVerification),
      projectDescriptionText: rawData.projectDescriptionText ? 
        DOMPurify.sanitize(rawData.projectDescriptionText).trim().slice(0, 1000) : 
        undefined,
    };

    // Validate with Zod schema
    const validationResult = assessmentSchema.safeParse(sanitizedData);
    
    if (!validationResult.success) {
      return {
        isValid: false,
        errors: validationResult.error.errors
      };
    }

    // Calculate priority score
    const priorityScore = calculatePriorityScore(validationResult.data);
    
    // Calculate Customer Journey fields
    const customerTier = determineCustomerTier(validationResult.data.projectUnitCount, validationResult.data.readiness);
    const priorityLevel = getPriorityLevel(priorityScore);
    const tags = generateCustomerTags(validationResult.data, customerTier, priorityLevel);

    return {
      isValid: true,
      data: validationResult.data,
      priorityScore,
      customerTier,
      priorityLevel,
      tags
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [{ message: "Invalid form data" }]
    };
  }
}

export function calculatePriorityScore(data: AssessmentFormData): number {
  let score = 0;

  // Unit count scoring (v13.1 exact)
  const units = data.projectUnitCount;
  if (units >= 1000) score += 50;
  else if (units >= 500) score += 40;
  else if (units >= 200) score += 30;
  else if (units >= 100) score += 20;
  else if (units >= 50) score += 10;

  // Budget scoring (v13.1 exact) - handle optional field
  if (data.budgetRange) {
    switch (data.budgetRange) {
      case "Over $50 Million": score += 40; break;
      case "$30M - $50 Million": score += 35; break;
      case "$15M - $30 Million": score += 25; break;
      case "$5M - $15 Million": score += 15; break;
      case "Under $5 Million": score += 5; break;
    }
  }

  // Timeline scoring (v13.1 exact) - handle optional field
  if (data.decisionTimeline) {
    switch (data.decisionTimeline) {
      case "Immediate (0-3 months)": score += 30; break;
      case "Short-term (3-6 months)": score += 20; break;
      case "Medium-term (6-12 months)": score += 10; break;
      case "Long-term (12+ months)": score += 5; break;
    }
  }

  // Government programs scoring (v13.1 exact) - handle optional field
  if (data.governmentPrograms) {
    switch (data.governmentPrograms) {
      case "Yes - Currently participating": score += 20; break;
      case "Interested - Tell us more": score += 10; break;
      case "No - Private development only": score += 0; break;
    }
  }

  // Developer type scoring (v13.1 exact) - handle optional field
  if (data.developerType) {
    if (data.developerType === "Commercial Developer (Large Projects)" || 
        data.developerType === "Government/Municipal Developer") {
      score += 10;
    } else if (data.developerType === "Private Developer (Medium Projects)" || 
               data.developerType === "Non-Profit Housing Developer") {
      score += 5;
    }
  }

  // Geography scoring (v13.1 exact) - handle optional field
  if (data.constructionProvince && ["Ontario", "British Columbia", "Alberta"].includes(data.constructionProvince)) {
    score += 5;
  }

  return Math.min(score, 150); // Cap at 150 points
}

// Add missing formatCanadianPhone function
function formatCanadianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone; // Return original if format unclear
}

// Add missing sanitizeInput function
function sanitizeInput(input: string | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input.toString()).trim();
}

export async function submitToGoHighLevel(formData: AssessmentFormData, priorityScore: number, customerTier: string, priorityLevel: string, tags: string[]): Promise<void> {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("GHL_WEBHOOK_URL not configured");
    return;
  }

  // Priority data for consistency with payload structure
  const priorityData = {
    score: priorityScore,
    assignedTo: getAssignedTo(priorityScore),
    responseTime: getResponseTime(priorityScore),
    priorityLevel: getPriorityLevel(priorityScore)
  };

  // Build webhook payload (exact structure as verified)
  const webhookPayload = {
    // Standard contact fields (VERIFIED CORRECT)
    first_name: sanitizeInput(formData.firstName),
    last_name: sanitizeInput(formData.lastName),
    email: sanitizeInput(formData.email),
    phone: formatCanadianPhone(formData.phone),
    company: sanitizeInput(formData.company),
    source: "ILLUMMAA Website",
    
    // Custom fields (handle optional fields with defaults)
    project_unit_count: parseInt(formData.projectUnitCount.toString()),
    project_budget_range: formData.budgetRange || "",
    delivery_timeline: formData.decisionTimeline || "",
    construction_province: formData.constructionProvince || "",
    developer_type: formData.developerType || "",
    government_programs: formData.governmentPrograms || "",
    project_description: sanitizeInput(formData.projectDescriptionText || ""),
    ai_priority_score: priorityData.score,
    lead_source_details: "ILLUMMAA Website - Advanced Multi-Step Form",
    
    submission_timestamp: new Date().toISOString(),
    assigned_to: priorityData.assignedTo,
    response_time: priorityData.responseTime,
    priority_level: priorityData.priorityLevel,
    
    // Customer Journey fields for external pipeline
    customer_tier: customerTier,
    customer_priority_level: priorityLevel,
    customer_tags: tags.join(', '),
    tags_array: tags
  };

  // Webhook delivery with retry logic (v13.1 required)
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ILLUMMAA-Assessment/1.0',
          'X-Source': 'ILLUMMAA-Website'
        },
        body: JSON.stringify(webhookPayload),
      });

      if (response.ok) {
        console.log("Successfully delivered to GoHighLevel");
        return;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error(`GoHighLevel webhook attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

function getAssignedTo(score: number): string {
  if (score >= 100) return "Senior Sales Manager";
  if (score >= 50) return "Sales Representative";
  return "Lead Development Team";
}

function getResponseTime(score: number): string {
  if (score >= 100) return "1 hour";
  if (score >= 50) return "4 hours";
  return "24 hours";
}

function getPriorityLevel(score: number): string {
  if (score >= 100) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

// Tier determination function for 5-tier system
function determineCustomerTier(units: number, readiness?: string): string {
  if (readiness === 'researching' || units === 0) return 'tier_0_explorer';
  if (units <= 49) return 'tier_1_starter';
  if (units <= 149) return 'tier_2_pioneer';
  if (units <= 299) return 'tier_3_preferred';
  return 'tier_4_elite';
}

// Generate customer tags for Customer Journey system
function generateCustomerTags(data: AssessmentFormData, customerTier: string, priorityLevel: string): string[] {
  const tags: string[] = [];

  // Tier tags
  tags.push(`tier-${customerTier.toLowerCase()}`);

  // Readiness level tags
  if (data.readiness) {
    tags.push(`readiness-${data.readiness.replace(/\s+/g, '-').toLowerCase()}`);
    if (data.readiness.includes('immediate')) tags.push('urgent');
    if (data.readiness.includes('planning')) tags.push('planning-phase');
    if (data.readiness.includes('researching')) tags.push('early-stage');
  }

  // Unit count category tags
  const units = data.projectUnitCount || 0;
  if (units === 0) tags.push('pre-development');
  else if (units <= 2) tags.push('single-multi-unit');
  else if (units < 50) tags.push('small-scale');
  else if (units < 150) tags.push('medium-scale');
  else if (units < 300) tags.push('large-scale');
  else tags.push('enterprise-scale');

  // Budget category tags
  if (data.budgetRange) {
    const budgetTag = data.budgetRange.toLowerCase().replace(/[\s$-]/g, '_');
    tags.push(`budget-${budgetTag}`);
    if (data.budgetRange.includes('Over $50 Million')) tags.push('high-budget');
    if (data.budgetRange.includes('Under $5 Million')) tags.push('starter-budget');
  }

  // Timeline urgency tags
  if (data.decisionTimeline) {
    if (data.decisionTimeline.includes('Immediate')) tags.push('immediate-need');
    if (data.decisionTimeline.includes('Short-term')) tags.push('short-term');
    if (data.decisionTimeline.includes('Long-term')) tags.push('long-term');
  }

  // Developer type tags
  if (data.developerType) {
    const devTypeTag = data.developerType.toLowerCase().replace(/[\s()/-]/g, '_');
    tags.push(`dev-type-${devTypeTag}`);
    if (data.developerType.includes('Government')) tags.push('government');
    if (data.developerType.includes('Commercial')) tags.push('commercial');
    if (data.developerType.includes('Non-Profit')) tags.push('non-profit');
  }

  // Province tags
  if (data.constructionProvince) {
    tags.push(`province-${data.constructionProvince.toLowerCase().replace(/\s+/g, '-')}`);
    if (['Ontario', 'British Columbia', 'Alberta'].includes(data.constructionProvince)) {
      tags.push('priority-province');
    }
  }

  // Government programs tags
  if (data.governmentPrograms) {
    if (data.governmentPrograms.includes('Yes')) tags.push('government-participating');
    if (data.governmentPrograms.includes('Interested')) tags.push('government-interested');
    if (data.governmentPrograms.includes('No')) tags.push('private-only');
  }

  // Agent support tags
  if (data.agentSupport) {
    tags.push(`agent-${data.agentSupport}`);
  }

  // Consent and compliance tags
  if (data.consentMarketing) {
    tags.push('marketing-consent');
  }

  // Priority level tags
  tags.push(`priority-${priorityLevel.toLowerCase()}`);

  return tags.filter(Boolean);
}

// Residential GoHighLevel webhook function
export async function submitToGoHighLevelResidential(data: any): Promise<any> {
  const webhookUrl = process.env.GHL_RESIDENTIAL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('GHL_RESIDENTIAL_WEBHOOK_URL not configured in environment variables');
  }
  
  const webhookPayload = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    source: data.source,
    project_unit_count: data.project_unit_count,
    project_budget_range: data.project_budget_range || '', // NEW FIELD
    construction_province: data.construction_province,
    housing_interest: data.housing_interest || '', // NEW FIELD  
    questions_interests: data.questions_interests || '', // NEW FIELD
    residential_pathway: data.residential_pathway,
    lead_type: data.lead_type,
    submission_timestamp: data.submission_timestamp
  };
  
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ILLÜMMAA-Residential/1.0',
          'X-Source': 'ILLÜMMAA-Website-Residential'
        },
        body: JSON.stringify(webhookPayload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
