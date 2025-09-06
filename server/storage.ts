import { type AssessmentSubmission, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<AssessmentSubmission>;
  getAssessment(id: string): Promise<AssessmentSubmission | undefined>;
  getAssessmentsByEmail(email: string): Promise<AssessmentSubmission[]>;
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
}> {
  try {
    // Sanitize input data
    const sanitizedData = {
      firstName: DOMPurify.sanitize(rawData.firstName || '').trim(),
      lastName: DOMPurify.sanitize(rawData.lastName || '').trim(),
      email: DOMPurify.sanitize(rawData.email || '').trim().toLowerCase(),
      phone: DOMPurify.sanitize(rawData.phone || '').replace(/\s/g, ''),
      company: DOMPurify.sanitize(rawData.company || '').trim(),
      projectUnitCount: parseInt(rawData.projectUnitCount) || 0,
      budgetRange: DOMPurify.sanitize(rawData.budgetRange || ''),
      decisionTimeline: DOMPurify.sanitize(rawData.decisionTimeline || ''),
      constructionProvince: DOMPurify.sanitize(rawData.constructionProvince || ''),
      developerType: DOMPurify.sanitize(rawData.developerType || ''),
      governmentPrograms: DOMPurify.sanitize(rawData.governmentPrograms || ''),
      projectDescriptionText: rawData.projectDescriptionText ? 
        DOMPurify.sanitize(rawData.projectDescriptionText).trim().slice(0, 1000) : 
        "",
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

    return {
      isValid: true,
      data: validationResult.data,
      priorityScore
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

  // Budget scoring (v13.1 exact)
  switch (data.budgetRange) {
    case "Over $50 Million": score += 40; break;
    case "$30M - $50 Million": score += 35; break;
    case "$15M - $30 Million": score += 25; break;
    case "$5M - $15 Million": score += 15; break;
    case "Under $5 Million": score += 5; break;
  }

  // Timeline scoring (v13.1 exact)
  switch (data.decisionTimeline) {
    case "Immediate (0-3 months)": score += 30; break;
    case "Short-term (3-6 months)": score += 20; break;
    case "Medium-term (6-12 months)": score += 10; break;
    case "Long-term (12+ months)": score += 5; break;
  }

  // Government programs scoring (v13.1 exact)
  switch (data.governmentPrograms) {
    case "Yes - Currently participating": score += 20; break;
    case "Interested - Tell us more": score += 10; break;
    case "No - Private development only": score += 0; break;
  }

  // Developer type scoring (v13.1 exact)
  if (data.developerType === "Commercial Developer (Large Projects)" || 
      data.developerType === "Government/Municipal Developer") {
    score += 10;
  } else if (data.developerType === "Private Developer (Medium Projects)" || 
             data.developerType === "Non-Profit Housing Developer") {
    score += 5;
  }

  // Geography scoring (v13.1 exact)
  if (["Ontario", "British Columbia", "Alberta"].includes(data.constructionProvince)) {
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
function sanitizeInput(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input.toString()).trim();
}

export async function submitToGoHighLevel(formData: AssessmentFormData, priorityScore: number): Promise<void> {
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
    
    // Custom fields
    project_unit_count: parseInt(formData.projectUnitCount.toString()),
    budget_range_cad: formData.budgetRange,
    decision_timeline: formData.decisionTimeline,
    construction_province: formData.constructionProvince,
    developer_type: formData.developerType,
    government_programs: formData.governmentPrograms,
    project_description: sanitizeInput(formData.projectDescriptionText || ""),
    ai_priority_score: priorityData.score,
    lead_source_details: "ILLUMMAA Website - Advanced Multi-Step Form",
    
    submission_timestamp: new Date().toISOString(),
    assigned_to: priorityData.assignedTo,
    response_time: priorityData.responseTime,
    priority_level: priorityData.priorityLevel
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
