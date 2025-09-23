// Shared Priority Score Calculation - Frontend/Backend Alignment
// This ensures 100% consistency between frontend preview and backend processing

import { type AssessmentFormData } from '../schema';

// Frontend form data interface (for compatibility)
export interface FrontendFormData {
  unitCount?: string;
  projectDescription?: string;
  readiness?: string;
  budget?: string;
  budgetRange?: string;
  projectBudgetRange?: string;
  timeline?: string;
  decisionTimeline?: string;
  deliveryTimeline?: string;
  province?: string;
  constructionProvince?: string;
  developerType?: string;
  governmentPrograms?: string;
}

// Map frontend field names to backend field names
function mapFrontendToBackend(frontendData: FrontendFormData): Partial<AssessmentFormData> {
  return {
    projectUnitCount: frontendData.unitCount ? parseInt(frontendData.unitCount) || 0 : 0,
    projectDescription: frontendData.projectDescription || '',
    readiness: frontendData.readiness as AssessmentFormData['readiness'],
    budgetRange: (frontendData.budgetRange || frontendData.budget || frontendData.projectBudgetRange) as AssessmentFormData['budgetRange'],
    decisionTimeline: (frontendData.decisionTimeline || frontendData.timeline || frontendData.deliveryTimeline) as AssessmentFormData['decisionTimeline'],
    constructionProvince: (frontendData.constructionProvince || frontendData.province) as AssessmentFormData['constructionProvince'],
    developerType: frontendData.developerType as AssessmentFormData['developerType'],
    governmentPrograms: frontendData.governmentPrograms as AssessmentFormData['governmentPrograms']
  };
}

export interface ScoringBreakdown {
  units: number;
  budget: number;
  timeline: number;
  province: number;
  government: number;
  developer: number;
  buildCanada: number;
  keywords: number;
  velocity: number;
  penalties: number;
  explorerCap: boolean;
  finalScore: number;
}

// Overloaded function signatures for frontend and backend compatibility
export function calculatePriorityScore(data: AssessmentFormData): { score: number; breakdown: ScoringBreakdown };
export function calculatePriorityScore(data: FrontendFormData): { score: number; breakdown: ScoringBreakdown };
export function calculatePriorityScore(data: AssessmentFormData | FrontendFormData): { score: number; breakdown: ScoringBreakdown } {
  // Map frontend data to backend format if needed
  const backendData = 'unitCount' in data ? mapFrontendToBackend(data as FrontendFormData) : data as AssessmentFormData;
  let score = 0;
  let unitScore = 0, govScore = 0, budgetScore = 0, timelineScore = 0, devScore = 0,
      provinceScore = 0, buildCanadaScore = 0, keywordScore = 0, velocityScore = 0,
      penaltyAmount = 0, wasCapApplied = false;

  // Parse and validate unit count
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

  // Prepare string data
  const description = String(backendData.projectDescription || "").toLowerCase().substring(0, 5000);
  const readiness = String(backendData.readiness || "");
  const budget = String(backendData.budgetRange || "");
  const timeline = String(backendData.decisionTimeline || "");
  const province = String(backendData.constructionProvince || "");
  const devType = String(backendData.developerType || "");
  const govPrograms = String(backendData.governmentPrograms || "");

  // Keyword arrays for scoring
  const indigenousKeywords = [
    "indigenous", "first nation", "first nations", "métis", "metis",
    "inuit", "aboriginal", "treaty", "reserve", "band council"
  ];

  const sustainabilityKeywords = [
    "net-zero", "net zero", "passive house", "passivhaus", "leed",
    "carbon neutral", "sustainable", "green building", "energy efficient",
    "solar", "geothermal", "heat pump"
  ];

  const hasIndigenous = indigenousKeywords.some(keyword => description.includes(keyword));
  const hasSustainability = sustainabilityKeywords.some(keyword => description.includes(keyword));

  // 1. UNIT COUNT (30 points max)
  if (units >= 1000) { unitScore = 30; score += 30; }
  else if (units >= 500) { unitScore = 25; score += 25; }
  else if (units >= 200) { unitScore = 20; score += 20; }
  else if (units >= 100) { unitScore = 15; score += 15; }
  else if (units >= 50) { unitScore = 8; score += 8; }
  else if (units > 0) { unitScore = 3; score += 3; }

  // 2. GOVERNMENT PROGRAMS (30 points max)
  switch (govPrograms) {
    case "Currently participating": govScore = 30; score += 30; break;
    case "Very interested": govScore = 20; score += 20; break;
    case "Somewhat interested": govScore = 10; score += 10; break;
    case "Just learning about options": govScore = 3; score += 3; break;
    case "Not interested": govScore = 0; break;
    default: govScore = 0;
  }

  // 3. BUDGET (25 points max)
  switch (budget) {
    case "Over $50M": budgetScore = 25; score += 25; break;
    case "$30M - $50M": budgetScore = 20; score += 20; break;
    case "$15M - $30M": budgetScore = 15; score += 15; break;
    case "$5M - $15M": budgetScore = 10; score += 10; break;
    case "$2M - $5M": budgetScore = 6; score += 6; break;
    case "$500K - $2M": budgetScore = 3; score += 3; break;
    case "Under $500K": budgetScore = 1; score += 1; break;
    case "Just exploring options": budgetScore = 0; break;
    default: budgetScore = 0;
  }

  // 4. TIMELINE (20 points max)
  switch (timeline) {
    case "Immediate (0-3 months)": timelineScore = 20; score += 20; break;
    case "Short-term (3-6 months)": timelineScore = 15; score += 15; break;
    case "Medium-term (6-12 months)": timelineScore = 10; score += 10; break;
    case "Long-term (12+ months)": timelineScore = 2; score += 2; break;
    default: timelineScore = 0;
  }

  // 5. DEVELOPER TYPE (20 points max)
  switch (devType) {
    case "Indigenous Community/Organization": devScore = 20; score += 20; break;
    case "Government/Municipal Developer": devScore = 15; score += 15; break;
    case "Commercial Developer (Large Projects)": devScore = 12; score += 12; break;
    case "Non-Profit Housing Developer": devScore = 10; score += 10; break;
    case "Private Developer (Medium Projects)": devScore = 6; score += 6; break;
    case "I don't know yet": devScore = 0; break;
    default: devScore = 0;
  }

  // 6. PROVINCE/TERRITORY (10 points max)
  switch (province) {
    case "Ontario":
    case "British Columbia": provinceScore = 10; score += 10; break;
    case "Alberta":
    case "Quebec": provinceScore = 8; score += 8; break;
    case "Nova Scotia":
    case "New Brunswick":
    case "Manitoba":
    case "Saskatchewan": provinceScore = 6; score += 6; break;
    case "Newfoundland and Labrador":
    case "Prince Edward Island": provinceScore = 4; score += 4; break;
    case "Northwest Territories":
    case "Nunavut":
    case "Yukon": provinceScore = 8; score += 8; break;
    default: provinceScore = 0;
  }

  // 7. BUILD CANADA ELIGIBILITY BONUS (10 points max)
  const isBuildCanadaEligible = 
    units >= 50 || 
    devType === "Indigenous Community/Organization" ||
    devType === "Government/Municipal Developer" || 
    govPrograms === "Currently participating" || 
    govPrograms === "Very interested";
    
  if (isBuildCanadaEligible) {
    buildCanadaScore = 10;
    score += 10;
  }

  // 8. KEYWORD BONUSES (5 points max)
  if (hasIndigenous) { keywordScore += 3; score += 3; }
  if (hasSustainability) { keywordScore += 2; score += 2; }

  // 9. DEAL VELOCITY BONUS (5 points max) 
  if (timeline === "Immediate (0-3 months)" && 
      (budget === "Over $50M" || budget === "$30M - $50M" || budget === "$15M - $30M")) {
    velocityScore = 5;
    score += 5;
  }

  // 10. PENALTIES
  // Long timeline + high unit penalty
  if (timeline === "Long-term (12+ months)" && units >= 200) {
    penaltyAmount = 8;
    score = Math.max(0, score - 8);
  }
  // Large budget + low units penalty  
  else if ((budget === "Over $50M" || budget === "$30M - $50M") && units < 50) {
    penaltyAmount = 5;
    score = Math.max(0, score - 5);
  }

  // 11. MINIMUM GUARANTEES
  // Indigenous communities get minimum 25 points
  if (devType === "Indigenous Community/Organization") {
    score = Math.max(score, 25);
  }
  // 100+ units get minimum 20 points
  else if (units >= 100) {
    score = Math.max(score, 20);
  }
  // Government participation gets minimum 15 points
  else if (govPrograms === "Currently participating") {
    score = Math.max(score, 15);
  }

  // 12. EXPLORER CAP - If researching, cap at 25 points
  if (readiness === "researching") {
    if (score > 25) {
      wasCapApplied = true;
      score = 25;
    }
  }

  // Final cap at maximum possible score
  const finalScore = Math.min(score, 150);

  const breakdown: ScoringBreakdown = {
    units: unitScore,
    budget: budgetScore,
    timeline: timelineScore,
    province: provinceScore,
    government: govScore,
    developer: devScore,
    buildCanada: buildCanadaScore,
    keywords: keywordScore,
    velocity: velocityScore,
    penalties: penaltyAmount,
    explorerCap: wasCapApplied,
    finalScore: finalScore
  };

  // Debug logging
  console.log('🎯 ILLUMMAA Priority Score Calculation:', {
    units: unitScore,
    budget: budgetScore,
    timeline: timelineScore,
    province: provinceScore,
    government: govScore,
    developer: devScore,
    buildCanada: buildCanadaScore,
    keywords: keywordScore,
    velocity: velocityScore,
    penalties: penaltyAmount,
    explorerCap: wasCapApplied,
    TOTAL: finalScore,
    inputs: {
      unitCount: units,
      readiness: readiness,
      budget: budget,
      timeline: timeline,
      province: province,
      devType: devType,
      govPrograms: govPrograms
    }
  });

  return { score: finalScore, breakdown };
}

// Helper function to determine customer tier based on score and units
export function determineCustomerTier(units: number, readiness: string): string {
  // Explorer tier for research phase or zero units
  if (readiness === 'researching' || units === 0) {
    return 'tier_0_explorer';
  }

  // Tier calculation based on units (cleaner ranges)
  if (units >= 1 && units <= 49) {
    return 'tier_1_starter';
  } else if (units >= 50 && units <= 149) {
    return 'tier_2_pioneer';
  } else if (units >= 150 && units <= 299) {
    return 'tier_3_preferred';
  } else {
    return 'tier_4_elite';
  }
}

// Helper function to determine Build Canada eligibility
export function isBuildCanadaEligible(data: AssessmentFormData | FrontendFormData): boolean {
  const backendData = 'unitCount' in data ? mapFrontendToBackend(data as FrontendFormData) : data as AssessmentFormData;
  
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

  const devType = String(backendData.developerType || "");
  const govPrograms = String(backendData.governmentPrograms || "");

  return units >= 50 || 
         devType === "Indigenous Community/Organization" ||
         devType === "Government/Municipal Developer" || 
         govPrograms === "Currently participating" || 
         govPrograms === "Very interested";
}