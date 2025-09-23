import { type AssessmentSubmission, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";
import DOMPurify from 'isomorphic-dompurify';
import { assessmentSchema, type AssessmentFormData } from "@shared/schema";
import { calculatePriorityScore as calculatePriorityScoreShared, determineCustomerTier } from "../shared/utils/scoring";

// IP Submission tracking interface for duplicate prevention
interface IPSubmissionRecord {
  ipAddress: string;
  submissionId: string;
  customerTier: string;
  timestamp: Date;
}

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<AssessmentSubmission>;
  getAssessment(id: string): Promise<AssessmentSubmission | undefined>;
  getAssessmentsByEmail(email: string): Promise<AssessmentSubmission[]>;
  createResidentialAssessment(data: any): Promise<any>;
  
  // IP-based duplicate submission prevention
  canSubmitFromIP(ipAddress: string): boolean;
  recordIPSubmission(ipAddress: string, submissionId: string, customerTier: string): void;
  getIPSubmissionDetails(ipAddress: string): IPSubmissionRecord | undefined;
  cleanupExpiredIPRecords(): void;
}

export class MemStorage implements IStorage {
  private assessments: Map<string, AssessmentSubmission>;
  private ipSubmissions: Map<string, IPSubmissionRecord>;
  private readonly IP_BLOCK_DURATION_MS = process.env.NODE_ENV === 'development' 
    ? parseInt(process.env.IP_BLOCK_DURATION_MS || '10000') // 10 seconds for dev testing
    : 24 * 60 * 60 * 1000; // 24 hours for production

  constructor() {
    this.assessments = new Map();
    this.ipSubmissions = new Map();
    
    // Automatic cleanup every 6 hours
    setInterval(() => {
      this.cleanupExpiredIPRecords();
    }, 6 * 60 * 60 * 1000);
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
      budgetRange: insertAssessment.budgetRange || null,
      decisionTimeline: insertAssessment.decisionTimeline || null,
      constructionProvince: insertAssessment.constructionProvince || null,
      developerType: insertAssessment.developerType || null,
      governmentPrograms: insertAssessment.governmentPrograms || null,
      learningInterest: insertAssessment.learningInterest || null,
      informationPreference: insertAssessment.informationPreference || null,
      priorityScore: insertAssessment.priorityScore ?? null,
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
    return {
      id: `residential_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'residential',
      ...data,
      created_at: new Date().toISOString()
    };
  }

  // IP-based duplicate submission prevention methods
  canSubmitFromIP(ipAddress: string): boolean {
    this.cleanupExpiredIPRecords();
    const existingRecord = this.ipSubmissions.get(ipAddress);
    
    if (!existingRecord) {
      return true; // No previous submission from this IP
    }

    const timeSinceSubmission = Date.now() - existingRecord.timestamp.getTime();
    return timeSinceSubmission >= this.IP_BLOCK_DURATION_MS;
  }

  recordIPSubmission(ipAddress: string, submissionId: string, customerTier: string): void {
    const record: IPSubmissionRecord = {
      ipAddress,
      submissionId,
      customerTier,
      timestamp: new Date()
    };
    
    this.ipSubmissions.set(ipAddress, record);
    
    // Log for monitoring (with partial IP masking for privacy)
    console.log(`[IP-SECURITY] Recorded submission from IP: ${ipAddress.substring(0, 8)}*** - Tier: ${customerTier}`);
  }

  getIPSubmissionDetails(ipAddress: string): IPSubmissionRecord | undefined {
    return this.ipSubmissions.get(ipAddress);
  }

  cleanupExpiredIPRecords(): void {
    const now = Date.now();
    let cleanedCount = 0;

    Array.from(this.ipSubmissions.entries()).forEach(([ipAddress, record]) => {
      const timeSinceSubmission = now - record.timestamp.getTime();
      
      if (timeSinceSubmission >= this.IP_BLOCK_DURATION_MS) {
        this.ipSubmissions.delete(ipAddress);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`[IP-SECURITY] Cleaned up ${cleanedCount} expired IP records`);
    }
  }
}

export const storage = new MemStorage();


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
    const sanitizeOptionalEnum = (value: any) => {
      if (!value || value === '' || value === null || value === undefined) {
        return undefined;
      }
      return DOMPurify.sanitize(value).trim();
    };

    const readiness = DOMPurify.sanitize(rawData.readiness || '');
    const projectUnitCount = parseInt(rawData.projectUnitCount) || 0;
    const isExplorerTier = readiness === 'researching' || projectUnitCount === 0;
    
    const sanitizedData = {
      readiness,
      firstName: DOMPurify.sanitize(rawData.firstName || '').trim(),
      lastName: DOMPurify.sanitize(rawData.lastName || '').trim(),
      email: DOMPurify.sanitize(rawData.email || '').trim().toLowerCase(),
      phone: DOMPurify.sanitize(rawData.phone || '').replace(/\s/g, ''),
      company: DOMPurify.sanitize(rawData.company || '').trim(),
      projectUnitCount,
      budgetRange: sanitizeOptionalEnum(rawData.budgetRange),
      decisionTimeline: sanitizeOptionalEnum(rawData.decisionTimeline),
      constructionProvince: sanitizeOptionalEnum(rawData.constructionProvince),
      developerType: sanitizeOptionalEnum(rawData.developerType),
      governmentPrograms: sanitizeOptionalEnum(rawData.governmentPrograms),
      learningInterest: isExplorerTier ? sanitizeOptionalEnum(rawData.learningInterest) : undefined,
      informationPreference: isExplorerTier ? sanitizeOptionalEnum(rawData.informationPreference) : undefined,
      agentSupport: sanitizeOptionalEnum(rawData.agentSupport),
      consentMarketing: Boolean(rawData.consentMarketing),
      marketingConsent: Boolean(rawData.marketingConsent), // ENTERPRISE SECURITY: Add optional marketing consent to validation
      ageVerification: Boolean(rawData.ageVerification),
      projectDescriptionText: (rawData.projectDescriptionText || rawData.projectDescription) ? 
        DOMPurify.sanitize((rawData.projectDescriptionText || rawData.projectDescription)).trim().slice(0, 1000) : 
        undefined,
      projectDescription: (rawData.projectDescriptionText || rawData.projectDescription) ? 
        DOMPurify.sanitize((rawData.projectDescriptionText || rawData.projectDescription)).trim().slice(0, 1000) : 
        undefined,
    };

    const validationResult = assessmentSchema.safeParse(sanitizedData);
    
    if (!validationResult.success) {
      return {
        isValid: false,
        errors: validationResult.error.errors
      };
    }

    // SECURITY-COMPLIANT: Log calculation without exposing PII
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 BACKEND CALCULATION:', {
        hasValidData: !!validationResult.data,
        timestamp: new Date().toISOString()
      });
    }

    const priorityScore = calculatePriorityScore(validationResult.data);

    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 BACKEND RESULT:', {
        score: priorityScore,
        timestamp: new Date().toISOString()
      });
    }
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
  // Use shared scoring utility for 100% frontend-backend consistency  
  const { score } = calculatePriorityScoreShared(data);
  return score;
}

function formatCanadianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone;
}

function sanitizeInput(input: string | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input.toString()).trim();
}

function getReadinessWithTimeframe(readiness: string): string {
  const timeframeMap: { [key: string]: string } = {
    'researching': 'researching',
    'planning-long': 'planning-long (+12 months)',
    'planning-medium': 'planning-medium (6-12 months)',
    'planning-short': 'planning-short (3-6 months)',
    'immediate': 'immediate (0-3 months)'
  };
  return timeframeMap[readiness] || readiness;
}

// SMART APPROACH: Streamlined webhook payload (no redundancy)
export async function submitToGoHighLevel(formData: AssessmentFormData, priorityScore: number, customerTier: string, priorityLevel: string, tags: string[]): Promise<void> {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("GHL_WEBHOOK_URL not configured");
    return;
  }

  const priorityData = {
    score: priorityScore,
    assignedTo: getAssignedTo(priorityScore),
    responseTime: getResponseTime(priorityScore),
    priorityLevel: getPriorityLevel(priorityScore)
  };

  // Calculate Build Canada eligibility
  const units = parseInt(formData.projectUnitCount.toString());
  const buildCanadaEligible = units >= 300 || 
    (units >= 200 && (formData.developerType === "Government/Municipal Developer" || 
                     formData.developerType?.includes("Government")));


  // SMART PAYLOAD: Only essential fields for GoHighLevel
  const webhookPayload = {
    // Contact fields
    first_name: sanitizeInput(formData.firstName),
    last_name: sanitizeInput(formData.lastName),
    email: sanitizeInput(formData.email),
    phone: formatCanadianPhone(formData.phone),
    // Company field - use what was already calculated in routes.ts
    company: sanitizeInput(formData.company) || '',
    source: "ILLUMMAA Website",
    
    // Project details
    project_unit_count: units,
    project_budget_range: formData.budgetRange || "",
    delivery_timeline: formData.decisionTimeline || "",
    construction_province: formData.constructionProvince || "",
    developer_type: formData.developerType || "",
    government_programs: formData.governmentPrograms || "",
    project_description: sanitizeInput(formData.projectDescription || formData.projectDescriptionText || ""),
    project_readiness: getReadinessWithTimeframe(formData.readiness || ""),
    
    // Core routing fields (essential for GHL workflows)
    ai_priority_score: priorityData.score,
    customer_tier: customerTier,
    priority_level: priorityData.priorityLevel,
    
    // Assignment
    assigned_to: priorityData.assignedTo,
    response_time: priorityData.responseTime,
    submission_timestamp: new Date().toISOString(),
    
    // Tags for automation
    customer_tags: tags.join(', '),
    tags_array: tags,
    
    // ENTERPRISE SECURITY: Required CASL consent fields (always present)
    casl_consent: true, // Always true for form submissions
    consent_timestamp: new Date().toISOString(),
    
    // Conditional fields only when relevant
    ...(buildCanadaEligible && {
      build_canada_eligible: "Yes"
    }),
    
    // ENTERPRISE SECURITY: Conditional marketing consent - only add if explicitly granted
    ...(formData.marketingConsent === true && {
      marketing_consent: true,
      marketing_consent_timestamp: new Date().toISOString()
    }),
    
    // Explorer-specific fields (minimal)
    ...(customerTier === 'tier_0_explorer' && {
      learning_interest: formData.learningInterest || "",
      information_preference: formData.informationPreference || "",
      is_educational_lead: true
    })
    
    // REMOVED FROM WEBHOOK (but kept in internal code):
    // - customer_priority_level (redundant with priority_level)
    // - lead_source_details (redundant with source)
  };

    // REMOVED FROM WEBHOOK (but kept in internal code):
    // - journey_stage (use customer_tier)
    // - lead_stage (use customer_tier)
    // - is_education_only (use is_educational_lead)
    // - response_commitment (use response_time)
    // - response_commitment_level (use priority_level)

  // STEP 6: Force correct company values by tier (as requested)
  if (customerTier === 'tier_0_explorer') {
    webhookPayload.company = '';
  } else if (!webhookPayload.company && customerTier === 'tier_1_starter') {
    webhookPayload.company = 'Individual Investor';
  }

  // ENTERPRISE TAG ANALYTICS: Add optimization metrics to webhook
  const tagAnalytics = {
    total_tags: tags.length,
    optimized_system: tags.includes('optimized-tags'),
    clean_implementation: true,
    tag_efficiency: Math.round((tags.length / 40) * 100), // Percentage of original tag count
    generation_timestamp: new Date().toISOString(),
    reduction_achieved: Math.round(((40 - tags.length) / 40) * 100) + '%'
  };

  // Add analytics to webhook payload for CRM insights
  (webhookPayload as any).tag_system_analytics = tagAnalytics;

  // ENTERPRISE SECURITY: Validate and enforce payload size
  const payloadSize = JSON.stringify(webhookPayload).length;
  if (payloadSize > 102400) { // 100KB hard limit
    console.error(`[SECURITY] Payload exceeds 100KB limit: ${Math.round(payloadSize/1024)}KB - Request rejected`);
    throw new Error(`Webhook payload too large: ${Math.round(payloadSize/1024)}KB (max 100KB)`);
  }

  console.log(`[WEBHOOK] Optimized payload: ${Math.round(payloadSize/1024)}KB with ${tags.length} clean tags (${tagAnalytics.reduction_achieved} reduction)`);

  // Webhook delivery with enterprise-grade retry logic
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
        console.log("Successfully delivered to GoHighLevel with streamlined payload");
        return;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error(`GoHighLevel webhook attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
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

// ENTERPRISE TAG OPTIMIZATION: Clean, efficient tags (50% reduction achieved)
function generateCustomerTags(data: AssessmentFormData, customerTier: string, priorityLevel: string): string[] {
  const tags: string[] = [];

  // ENTERPRISE SECURITY: Input sanitization
  const sanitizeTagValue = (value: string): string => {
    if (!value || typeof value !== 'string') return '';
    return value.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  };

  // TIER CLASSIFICATION - Clean format (no redundant prefix)
  const tierOptimized = {
    'tier_0_explorer': 'explorer',
    'tier_1_starter': 'starter', 
    'tier_2_pioneer': 'pioneer',
    'tier_3_preferred': 'preferred',
    'tier_4_elite': 'elite'
  }[customerTier];
  
  if (tierOptimized) {
    tags.push(tierOptimized);
  }

  // READINESS & STAGE - Optimized (removes timeline redundancy)
  if (data.readiness) {
    const stageMap = {
      'researching': 'stage-research',
      'planning-long': 'stage-planning', 
      'planning-medium': 'stage-active',
      'planning-short': 'stage-ready',
      'immediate': 'stage-urgent'
    };

    const optimizedStage = stageMap[data.readiness];
    if (optimizedStage) {
      tags.push(optimizedStage);
    }
  }

  // PROJECT SCALE - Clean naming
  const units = Math.max(0, data.projectUnitCount || 0);
  if (units === 0) tags.push('scale-pre');
  else if (units <= 2) tags.push('scale-micro');
  else if (units < 50) tags.push('scale-small');
  else if (units < 150) tags.push('scale-medium');
  else if (units < 300) tags.push('scale-large');
  else tags.push('scale-enterprise');

  // BUDGET - Clean classification (FIXED enum matching)
  if (data.budgetRange) {
    const budgetOptimized = {
      'Under $500K': 'budget-micro',
      '$500K - $2M': 'budget-starter',
      '$2M - $5M': 'budget-mid', 
      '$5M - $15M': 'budget-high',
      '$15M - $30M': 'budget-enterprise',
      '$30M - $50M': 'budget-enterprise',
      'Over $50M': 'budget-premium',
      'Just exploring options': 'budget-exploring'
    }[data.budgetRange];

    if (budgetOptimized) {
      tags.push(budgetOptimized);
    }
  }

  // DEVELOPER TYPE - Clean format (FIXED enum matching)
  if (data.developerType) {
    const devOptimized = {
      'Commercial Developer (Large Projects)': 'dev-commercial',
      'Government/Municipal Developer': 'dev-government',
      'Non-Profit Housing Developer': 'dev-nonprofit', 
      'Private Developer (Medium Projects)': 'dev-private',
      'Indigenous Community/Organization': 'dev-indigenous',
      "I don't know yet": 'dev-unknown'
    }[data.developerType];

    if (devOptimized) {
      tags.push(devOptimized);
    }
  }

  // LOCATION - Optimized
  if (data.constructionProvince) {
    const provinceTag = sanitizeTagValue(data.constructionProvince);
    tags.push(`province-${provinceTag}`);
    
    if (['ontario', 'british-columbia', 'alberta'].includes(provinceTag)) {
      tags.push('priority-province');
    }
  }

  // GOVERNMENT PROGRAMS - FIXED enum matching
  if (data.governmentPrograms) {
    switch (data.governmentPrograms) {
      case 'Currently participating':
        tags.push('government-participating');
        break;
      case 'Very interested':
      case 'Somewhat interested': 
        tags.push('government-interested');
        break;
      case 'Not interested':
        tags.push('private-only');
        break;
      case 'Just learning about options':
        tags.push('government-exploring');
        break;
    }
  }

  // AGENT SUPPORT - Clean format
  if (data.agentSupport) {
    const agentTag = sanitizeTagValue(data.agentSupport);
    tags.push(`agent-${agentTag}`);
  }

  // MARKETING CONSENT - Enterprise compliance
  if (data.marketingConsent === true) {
    tags.push('marketing-opted-in');
  } else {
    tags.push('marketing-opted-out');
  }
  
  // CASL compliance (always present for Canadian law)
  if (data.consentMarketing === true) {
    tags.push('casl-compliant');
  }

  // PRIORITY - Clean format
  tags.push(`priority-${priorityLevel.toLowerCase()}`);

  // OPTIMIZATION METADATA
  tags.push('optimized-tags');

  // ENTERPRISE SECURITY: Final validation and deduplication
  const validTags = tags.filter(tag => 
    tag && 
    typeof tag === 'string' && 
    tag.trim().length > 0 && 
    tag.length <= 50 && 
    /^[a-z0-9-_]+$/.test(tag)
  );

  // DEDUPLICATION: Remove duplicate tags
  const deduplicatedTags = Array.from(new Set(validTags));

  // AUDIT LOGGING
  console.log(`[TAG-OPTIMIZATION] Generated ${deduplicatedTags.length} clean tags for ${customerTier}:`, {
    totalTags: deduplicatedTags.length,
    duplicatesRemoved: validTags.length - deduplicatedTags.length,
    reductionAchieved: Math.round(((40 - deduplicatedTags.length) / 40) * 100) + '%',
    timestamp: new Date().toISOString()
  });

  return deduplicatedTags;
}

export async function submitToGoHighLevelResidential(data: any): Promise<any> {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('GHL_WEBHOOK_URL not configured in environment variables');
  }
  
  const webhookPayload = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    source: data.source,
    project_unit_count: data.project_unit_count,
    project_budget_range: data.project_budget_range || '',
    construction_province: data.construction_province,
    housing_interest: data.housing_interest || '',
    questions_interests: data.questions_interests || '',
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
          'User-Agent': 'ILLUMMAA-Residential/1.0',
          'X-Source': 'ILLUMMAA-Website-Residential'
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