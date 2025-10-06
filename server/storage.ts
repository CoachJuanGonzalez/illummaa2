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
      consentSMS: insertAssessment.consentSMS ?? false,
      marketingConsent: insertAssessment.marketingConsent ?? false,
      ageVerification: insertAssessment.ageVerification ?? false,
      tags: insertAssessment.tags ?? null,
      decisionTimeline: insertAssessment.decisionTimeline,
      constructionProvince: insertAssessment.constructionProvince,
      developerType: insertAssessment.developerType,
      governmentPrograms: insertAssessment.governmentPrograms,
      buildCanadaEligible: insertAssessment.buildCanadaEligible,
      // B2B-only: Explorer fields removed
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`[IP-SECURITY] Recorded submission from IP: ${ipAddress.substring(0, 8)}*** - Tier: ${customerTier}`);
    }
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IP-SECURITY] Cleaned up ${cleanedCount} expired IP records`);
      }
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
    
    // DEBUG: Log phone processing BEFORE sanitization
    const rawPhone = rawData.phone;
    const sanitizedPhone = DOMPurify.sanitize(rawData.phone || '').replace(/\s/g, '');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [BACKEND DEBUG] Phone in validateFormData:', {
        raw: rawPhone,
        sanitized: sanitizedPhone,
        hasPlus: sanitizedPhone.startsWith('+')
      });
    }
    
    const sanitizedData = {
      readiness,
      firstName: DOMPurify.sanitize(rawData.firstName || '').trim(),
      lastName: DOMPurify.sanitize(rawData.lastName || '').trim(),
      email: DOMPurify.sanitize(rawData.email || '').trim().toLowerCase(),
      phone: sanitizedPhone,
      
      company: DOMPurify.sanitize(rawData.company).trim(),
      projectUnitCount,
      projectUnitRange: DOMPurify.sanitize(rawData.projectUnitRange || '').trim(),
      decisionTimeline: DOMPurify.sanitize(rawData.decisionTimeline).trim(),
      constructionProvince: DOMPurify.sanitize(rawData.constructionProvince).trim(),
      developerType: DOMPurify.sanitize(rawData.developerType).trim(),
      governmentPrograms: DOMPurify.sanitize(rawData.governmentPrograms).trim(),
      buildCanadaEligible: DOMPurify.sanitize(rawData.buildCanadaEligible).trim(),
      // B2B-only: Remove explorer-specific fields for pure B2B focus
      agentSupport: sanitizeOptionalEnum(rawData.agentSupport),
      consentMarketing: Boolean(rawData.consentMarketing),
      consentSMS: Boolean(rawData.consentSMS), // A2P 10DLC SMS consent
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
    const customerTier = determineCustomerTier(validationResult.data.projectUnitCount);
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

function formatPhoneNumber(phone: string): string {
  // DEBUG: Log input to this function
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [FORMAT PHONE] Input:', phone);
  }

  if (!phone) return '';

  // CRITICAL: If phone already has + prefix (E.164 format), return unchanged
  if (phone.startsWith('+')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [FORMAT PHONE] Has + prefix, returning unchanged:', phone);
    }
    return phone;
  }

  // Log when phone is missing + prefix
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ [FORMAT PHONE] Phone missing + prefix, attempting to fix...');
  }

  // Strip non-digit characters for processing
  const cleaned = phone.replace(/\D/g, '');

  // Handle 10-digit numbers (assume North American if no country code)
  if (cleaned.length === 10) {
    const result = `+1${cleaned}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 [FORMAT PHONE] 10 digits, added +1:', result);
    }
    return result;
  }

  // Handle 11-digit numbers starting with 1 (North American with country code but no +)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const result = `+${cleaned}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 [FORMAT PHONE] 11 digits starting with 1, added +:', result);
    }
    return result;
  }

  // For international numbers (>11 digits), add + prefix
  if (cleaned.length > 11) {
    const result = `+${cleaned}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 [FORMAT PHONE] International number, added +:', result);
    }
    return result;
  }

  // Fallback: return original
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ [FORMAT PHONE] Fallback, returning original:', phone);
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

// Convert representative unit value back to accurate display range
function getUnitRangeFromRepresentative(units: number): string {
  if (units >= 500) return "300+ units (Elite)";
  if (units >= 200) return "150-299 units (Preferred)";
  if (units >= 75) return "50-149 units (Pioneer)";
  if (units >= 25) return "3-49 units (Starter)";
  if (units === 2) return "2 homes";
  if (units === 1) return "1 home";
  return "0 units";
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

  // Use user's self-certified Build Canada value (now preserved from form)
  const units = parseInt(formData.projectUnitCount.toString());
  // formData.buildCanadaEligible contains "Yes", "No", or "I don't know" from user's selection

  // Transform readiness value with enhanced timeframe display
  const readinessValue = getReadinessWithTimeframe(formData.readiness || "");

  // DEBUG: Log projectUnitRange mapping for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [DEBUG] projectUnitRange data flow:', {
      received: formData.projectUnitRange,
      units: units,
      fallback: getUnitRangeFromRepresentative(units),
      final: formData.projectUnitRange || getUnitRangeFromRepresentative(units)
    });
  }

  // DEBUG: Log complete phone processing chain
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [WEBHOOK PAYLOAD] Final phone value:', {
      input: formData.phone,
      output: formatPhoneNumber(formData.phone)
    });
  }

  // OPTIMIZED PAYLOAD: Essential fields only (Phase 1)
  const webhookPayload = {
    // Core Contact Fields (5)
    first_name: sanitizeInput(formData.firstName),
    last_name: sanitizeInput(formData.lastName),
    email: sanitizeInput(formData.email),
    phone: formatPhoneNumber(formData.phone),
    company: sanitizeInput(formData.company) ||
             (customerTier === 'pioneer' ? 'Individual Investor' : ''),

    // Core Project Fields (6)
    project_unit_count: units,
    delivery_timeline: formData.decisionTimeline,
    construction_province: formData.constructionProvince,
    developer_type: formData.developerType,
    government_programs: formData.governmentPrograms,
    project_description: sanitizeInput(formData.projectDescription || ""),

    // Scoring & Routing Fields (4 - removed redundant priority_level from webhook)
    ai_priority_score: priorityData.score,
    customer_tier: customerTier,
    build_canada_eligible: formData.buildCanadaEligible,
    tags_array: tags,

    // SLA Field (1)
    response_time: priorityData.responseTime,

    // A2P 10DLC
    a2p_campaign_id: process.env.A2P_CAMPAIGN_ID || 'PLACEHOLDER_CAMPAIGN_ID',

    // Consent fields
    ...(formData.consentMarketing && {
      casl_consent: true,
      casl_timestamp: new Date().toISOString()
    }),
    ...(formData.consentSMS && {
      sms_consent: true,
      sms_timestamp: new Date().toISOString()
    }),
    ...(formData.marketingConsent && {
      marketing_consent: true,
      marketing_timestamp: new Date().toISOString()
    })
  };

  // ENTERPRISE SECURITY: Validate and enforce payload size
  const payloadSize = JSON.stringify(webhookPayload).length;
  if (payloadSize > 102400) { // 100KB hard limit
    console.error(`[SECURITY] Payload exceeds 100KB limit: ${Math.round(payloadSize/1024)}KB - Request rejected`);
    throw new Error(`Webhook payload too large: ${Math.round(payloadSize/1024)}KB (max 100KB)`);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[WEBHOOK] Optimized payload: ${Math.round(payloadSize/1024)}KB with ${tags.length} tags`);
  }

  // Webhook delivery (single attempt - GHL ignores Idempotency-Key)
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully delivered to GoHighLevel`);
    }
    return;
  } catch (error) {
    console.error(`GoHighLevel webhook failed:`, error);
    // Don't throw - let form submission succeed even if webhook fails
  }
}

function getAssignedTo(score: number): string {
  if (score >= 100) return "Senior Sales Manager";
  if (score >= 50) return "Sales Representative";
  return "Lead Development Team";
}

function getResponseTime(score: number): string {
  if (score >= 80) return "2 hours";   // Critical: 80-100
  if (score >= 60) return "6 hours";   // High: 60-79
  if (score >= 40) return "24 hours";  // Standard: 40-59
  return "72 hours";                    // Low: 0-39
}

function getPriorityLevel(score: number): string {
  if (score >= 100) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

// ENTERPRISE TAG OPTIMIZATION: Simplified, efficient tags (max 12)
function generateCustomerTags(data: AssessmentFormData, customerTier: string, priorityLevel: string): string[] {
  const tags: string[] = [];
  const units = parseInt(data.projectUnitCount.toString());

  // 1. Tier tag
  if (units >= 200) tags.push('Elite');
  else if (units >= 50) tags.push('Preferred');
  else if (units >= 10) tags.push('Pioneer');

  // 2. Priority tags removed - use ai_priority_score in GHL workflows instead
  // (priorityLevel parameter kept for backward compatibility but not used for tags)

  // 3. Conditional tags
  if (data.developerType?.includes('Indigenous')) {
    tags.push('Dev-Indigenous');
  }

  if (['Participating in government programs', 'Currently participating']
      .includes(data.governmentPrograms || '')) {
    tags.push('Government-Participating');
  }

  const priorityProvinces = ['Alberta', 'British Columbia', 'Ontario', 'Northwest Territories'];
  if (priorityProvinces.includes(data.constructionProvince || '')) {
    tags.push('Priority-Province');
  }

  // ESG Tag Debug - helps identify why tag might not be added
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [ESG TAG DEBUG]:', {
      buildCanadaEligible: data.buildCanadaEligible,
      type: typeof data.buildCanadaEligible,
      willAddTag: data.buildCanadaEligible === 'Yes'
    });
  }

  if (data.buildCanadaEligible === 'Yes') {
    tags.push('ESG-Eligible');
  }

  if (data.decisionTimeline === 'Immediate (0-3 months)' && units >= 50) {
    tags.push('Urgent');
  }

  // 4. Consent tags
  if (data.consentMarketing === true) tags.push('CASL-Compliant');
  if (data.consentSMS === true) tags.push('SMS-Opted-In');
  if (data.marketingConsent === true) tags.push('Marketing-Opted-In');

  // Remove legacy tags
  const legacyTags = new Set([
    'optimized-tags', 'agent-yes', 'no-agent', 'no-direct',
    'government-active', 'government-priority'
  ]);

  const cleanedTags = tags.filter(tag => !legacyTags.has(tag));
  return Array.from(new Set(cleanedTags)).slice(0, 12);
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
    construction_province: data.construction_province,
    housing_interest: data.housing_interest || '',
    questions_interests: data.questions_interests || '',
    residential_pathway: data.residential_pathway,
    lead_type: data.lead_type,
    submission_timestamp: data.submission_timestamp
  };
  
  // Webhook delivery (single attempt - GHL ignores Idempotency-Key)
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

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully delivered residential lead to GoHighLevel`);
    }

    return await response.json();
  } catch (error) {
    console.error(`GoHighLevel residential webhook failed:`, error);
    throw error; // Residential throws to match expected behavior
  }
}