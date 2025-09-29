// AI Priority Score Calculation - 2025+ B2B Only (3 Tiers)
// Minimum 10 units - redirect to Remax.ca for residential

import { type AssessmentFormData } from '../schema';

// Frontend form data interface (for compatibility)
export interface FrontendFormData {
  unitCount?: string;
  projectDescription?: string;
  timeline?: string;
  decisionTimeline?: string;
  province?: string;
  constructionProvince?: string;
  developerType?: string;
  governmentPrograms?: string;
  buildCanadaEligible?: string;
}

// Map frontend field names to backend field names
function mapFrontendToBackend(frontendData: FrontendFormData): Partial<AssessmentFormData> {
  return {
    projectUnitCount: frontendData.unitCount ? parseInt(frontendData.unitCount) || 0 : 0,
    projectDescription: frontendData.projectDescription || '',
    decisionTimeline: (frontendData.decisionTimeline || frontendData.timeline) as AssessmentFormData['decisionTimeline'],
    constructionProvince: (frontendData.constructionProvince || frontendData.province) as AssessmentFormData['constructionProvince'],
    developerType: frontendData.developerType as AssessmentFormData['developerType'],
    governmentPrograms: frontendData.governmentPrograms as AssessmentFormData['governmentPrograms'],
    buildCanadaEligible: frontendData.buildCanadaEligible as AssessmentFormData['buildCanadaEligible']
  };
}

// NEW AI Scoring Breakdown - Simplified 5-factor model
export interface AIScoringBreakdown {
  unitVolume: number;      // 50 points max
  government: number;       // 20 points max
  indigenous: number;       // 15 points max
  province: number;         // 10 points max
  esgAffordability: number; // 5 points max
  urgencyBonus: number;     // 5 points bonus
  rawScore: number;         // Before normalization
  normalizedScore: number;  // 0-100 scale
  responseTime: string;     // "2 hours", "6 hours", "24 hours", "72 hours"
  tier: string;            // "pioneer", "preferred", or "elite" ONLY
}

// Get response time based on normalized score
function getResponseTime(normalizedScore: number): string {
  if (normalizedScore >= 80) return "2 hours";
  if (normalizedScore >= 60) return "6 hours";
  if (normalizedScore >= 40) return "24 hours";
  return "72 hours";
}

// Main scoring function - B2B ONLY (10+ units)
export function calculatePriorityScore(data: AssessmentFormData | FrontendFormData): {
  score: number;
  breakdown: AIScoringBreakdown;
} {
  // Map frontend data to backend format if needed
  const backendData = 'unitCount' in data ? mapFrontendToBackend(data as FrontendFormData) : data as AssessmentFormData;

  let score = 0;
  let unitVolumeScore = 0, govScore = 0, indigenousScore = 0, provinceScore = 0,
      esgScore = 0, urgencyBonus = 0;

  // Parse unit count
  let units = 0;
  const unitValue = backendData.projectUnitCount;
  if (unitValue !== undefined && unitValue !== null) {
    if (typeof unitValue === 'string' && unitValue !== '') {
      const parsed = parseInt(unitValue);
      units = isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, 10000));
    } else if (typeof unitValue === 'number') {
      units = Math.max(0, Math.min(unitValue, 10000));
    }
  }

  // Determine tier (3-tier B2B system)
  // NOTE: <10 units should be redirected to Remax on frontend
  let tier = '';
  if (units >= 200) {
    tier = 'elite';
  } else if (units >= 50 && units <= 200) {  // FIXED: Upper bound 199 → 200
    tier = 'preferred';
  } else if (units >= 10 && units <= 49) {
    tier = 'pioneer';
  } else {
    // Fallback if somehow <10 units reach here
    console.warn('⚠️ Units < 10 reached scoring. Should redirect to Remax.ca');
    tier = 'pioneer';
    units = 10;
  }

  // Extract data
  const timeline = String(backendData.decisionTimeline || "");
  const province = String(backendData.constructionProvince || "");
  const devType = String(backendData.developerType || "");
  const govPrograms = String(backendData.governmentPrograms || "");

  // 1. UNIT VOLUME (50 points max)
  switch (tier) {
    case 'pioneer':      // 10-49 units
      unitVolumeScore = 15;
      score += 15;
      break;
    case 'preferred':    // 50-200 units (FIXED: range corrected)
      unitVolumeScore = 40;  // FIXED: Changed from 30 to 40 per matrix
      score += 40;           // FIXED: Changed from 30 to 40 per matrix
      break;
    case 'elite':        // 200+ units
      unitVolumeScore = 50;
      score += 50;
      break;
  }

  // Urgency bonus for immediate timeline + high volume (preferred or elite)
  if (timeline === "Immediate (0-3 months)" && (tier === 'preferred' || tier === 'elite')) {
    urgencyBonus = 5;
    score += 5;
  }

  // 2. GOVERNMENT CONTRACTS (20 points)
  if (govPrograms === "Currently participating") {
    govScore = 20;
    score += 20;
  }

  // 3. INDIGENOUS COMMUNITIES (15 points)
  if (devType === "Indigenous Community/Organization") {
    indigenousScore = 15;
    score += 15;
  }

  // 4. PRIORITY PROVINCES (10 points)
  const priorityProvinces = ["Alberta", "British Columbia", "Ontario", "Northwest Territories"];
  if (priorityProvinces.includes(province)) {
    provinceScore = 10;
    score += 10;
  }

  // 5. ESG/BUILD CANADA (5 points) - User self-certification per matrix
  const buildCanadaValue = backendData.buildCanadaEligible;

  // Award points ONLY for explicit "Yes" self-certification
  if (buildCanadaValue === "Yes") {
    esgScore = 5;
    score += 5;
    console.log('✅ Build Canada Eligible: +5 ESG points awarded');
  } else {
    esgScore = 0;  // No points for "No", "I don't know", or undefined
    console.log(`ℹ️ Build Canada: ${buildCanadaValue || 'Not specified'} - No ESG points`);
  }

  // Normalize score
  const rawScore = score;
  const normalizedScore = Math.min(100, score);
  const responseTime = getResponseTime(normalizedScore);

  const breakdown: AIScoringBreakdown = {
    unitVolume: unitVolumeScore,
    government: govScore,
    indigenous: indigenousScore,
    province: provinceScore,
    esgAffordability: esgScore,
    urgencyBonus: urgencyBonus,
    rawScore: rawScore,
    normalizedScore: normalizedScore,
    responseTime: responseTime,
    tier: tier
  };

  console.log('🎯 AI Priority Score (2025+):', {
    tier,
    units,
    normalizedScore,
    responseTime,
    breakdown
  });

  return { score: normalizedScore, breakdown };
}

// Customer tier determination - 3 TIERS ONLY (B2B Partnership System)
export function determineCustomerTier(units: number): 'pioneer' | 'preferred' | 'elite' {
  if (units >= 200) return 'elite';
  if (units >= 50 && units <= 200) return 'preferred';  // FIXED: Upper bound 199 → 200
  if (units >= 10 && units <= 49) return 'pioneer';

  // Should not reach here - redirect to Remax
  console.warn('determineCustomerTier: Units < 10, should redirect to Remax.ca');
  return 'pioneer';
}

// Build Canada eligibility
export function isBuildCanadaEligible(data: AssessmentFormData | FrontendFormData): boolean {
  const backendData = 'unitCount' in data ? mapFrontendToBackend(data as FrontendFormData) : data as AssessmentFormData;

  let units = 0;
  const unitValue = backendData.projectUnitCount;
  if (unitValue !== undefined && unitValue !== null) {
    units = typeof unitValue === 'number' ? unitValue : parseInt(unitValue) || 0;
  }

  const devType = String(backendData.developerType || "");
  const govPrograms = String(backendData.governmentPrograms || "");

  return units >= 50 ||
         devType === "Indigenous Community/Organization" ||
         devType === "Government/Municipal Developer" ||
         govPrograms === "Currently participating" ||
         govPrograms === "Very interested";
}

// REMOVE ALL OLD FUNCTIONS AND EXPORTS
// No more: ScoringBreakdown, old calculatePriorityScore logic, Explorer/Starter logic