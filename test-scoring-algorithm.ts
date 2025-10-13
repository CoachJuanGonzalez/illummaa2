// AI Priority Scoring Algorithm Test Suite
// Comprehensive validation against 2025+ specification

import { calculatePriorityScore, determineCustomerTier, type AIScoringBreakdown } from './shared/utils/scoring';
import type { AssessmentFormData } from './shared/schema';

interface TestCase {
  name: string;
  input: Partial<AssessmentFormData>;
  expected: {
    score: number;
    tier: 'pioneer' | 'preferred' | 'elite';
    unitVolume: number;
    government: number;
    indigenous: number;
    province: number;
    esgAffordability: number;
    urgencyBonus: number;
    responseTime: string;
  };
}

const testCases: TestCase[] = [
  // ===== SPECIFICATION EXAMPLE =====
  {
    name: "Spec Example: 200 units, Elite, Immediate, Government, Indigenous, BC, ESG",
    input: {
      projectUnitCount: 200,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Participating in government programs",
      developerType: "Indigenous Community/Organization",
      constructionProvince: "British Columbia",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 100, // 50+5+20+15+10+5 = 105 capped at 100
      tier: 'elite',
      unitVolume: 50,
      government: 20,
      indigenous: 15,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 5,
      responseTime: "2 hours"
    }
  },

  // ===== PIONEER TIER TESTS (10-49 units) =====
  {
    name: "Pioneer Minimum: 10 units, no bonuses",
    input: {
      projectUnitCount: 10,
      decisionTimeline: "Long-term (12+ months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 15,
      tier: 'pioneer',
      unitVolume: 15,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },
  {
    name: "Pioneer: 25 units + Government",
    input: {
      projectUnitCount: 25,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Participating in government programs",
      developerType: "Non-Profit Housing Developer",
      constructionProvince: "Nova Scotia",
      buildCanadaEligible: "I don't know"
    },
    expected: {
      score: 35, // 15 (pioneer) + 20 (gov)
      tier: 'pioneer',
      unitVolume: 15,
      government: 20,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },
  {
    name: "Pioneer Maximum: 49 units + Priority Province",
    input: {
      projectUnitCount: 49,
      decisionTimeline: "Short-term (3-6 months)",
      governmentPrograms: "Not participating",
      developerType: "Commercial Developer (Large Projects)",
      constructionProvince: "Alberta",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 25, // 15 (pioneer) + 10 (province)
      tier: 'pioneer',
      unitVolume: 15,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },
  {
    name: "Pioneer: NO urgency bonus (not preferred/elite)",
    input: {
      projectUnitCount: 30,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Ontario",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 30, // 15 (pioneer) + 10 (province) + 5 (ESG) - NO urgency bonus
      tier: 'pioneer',
      unitVolume: 15,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },

  // ===== PREFERRED TIER TESTS (50-200 units) =====
  {
    name: "Preferred Minimum: 50 units",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Long-term (12+ months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Manitoba",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Preferred: 100 units + Urgent + ESG",
    input: {
      projectUnitCount: 100,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Not participating",
      developerType: "Commercial Developer (Large Projects)",
      constructionProvince: "Saskatchewan",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 50, // 40 (preferred) + 5 (urgency) + 5 (ESG)
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 5,
      urgencyBonus: 5,
      responseTime: "24 hours"
    }
  },
  {
    name: "Preferred: 150 units + All bonuses",
    input: {
      projectUnitCount: 150,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Participating in government programs",
      developerType: "Indigenous Community/Organization",
      constructionProvince: "Northwest Territories",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 95, // 40 + 5 (urgency) + 20 (gov) + 15 (indigenous) + 10 (province) + 5 (ESG)
      tier: 'preferred',
      unitVolume: 40,
      government: 20,
      indigenous: 15,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 5,
      responseTime: "2 hours"
    }
  },
  {
    name: "Preferred Maximum: 200 units (BOUNDARY TEST)",
    input: {
      projectUnitCount: 200,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 50, // Should be ELITE (200 units) = 50 points
      tier: 'elite',
      unitVolume: 50,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },

  // ===== ELITE TIER TESTS (200+ units) =====
  {
    name: "Elite Minimum: 200 units",
    input: {
      projectUnitCount: 200,
      decisionTimeline: "Long-term (12+ months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 50,
      tier: 'elite',
      unitVolume: 50,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Elite: 300 units + Urgent",
    input: {
      projectUnitCount: 300,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Not participating",
      developerType: "Commercial Developer (Large Projects)",
      constructionProvince: "Manitoba",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 55, // 50 (elite) + 5 (urgency)
      tier: 'elite',
      unitVolume: 50,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 5,
      responseTime: "24 hours"
    }
  },
  {
    name: "Elite: 500 units + All bonuses (MAX SCORE TEST)",
    input: {
      projectUnitCount: 500,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Participating in government programs",
      developerType: "Indigenous Community/Organization",
      constructionProvince: "Ontario",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 100, // 50 + 5 + 20 + 15 + 10 + 5 = 105 capped at 100
      tier: 'elite',
      unitVolume: 50,
      government: 20,
      indigenous: 15,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 5,
      responseTime: "2 hours"
    }
  },
  {
    name: "Elite: 1000 units (Large project)",
    input: {
      projectUnitCount: 1000,
      decisionTimeline: "Short-term (3-6 months)",
      governmentPrograms: "Not participating",
      developerType: "Commercial Developer (Large Projects)",
      constructionProvince: "British Columbia",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 65, // 50 (elite) + 10 (province) + 5 (ESG)
      tier: 'elite',
      unitVolume: 50,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 0,
      responseTime: "6 hours"
    }
  },

  // ===== GOVERNMENT PROGRAMS TESTS =====
  {
    name: "Government: Participating (+20 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Participating in government programs",
      developerType: "Government/Municipal Developer",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 60, // 40 (preferred) + 20 (gov)
      tier: 'preferred',
      unitVolume: 40,
      government: 20,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "6 hours"
    }
  },
  {
    name: "Government: Not participating (0 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Government/Municipal Developer",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40, // 40 (preferred) only
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },

  // ===== INDIGENOUS TESTS =====
  {
    name: "Indigenous: Community/Organization (+15 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Short-term (3-6 months)",
      governmentPrograms: "Not participating",
      developerType: "Indigenous Community/Organization",
      constructionProvince: "Manitoba",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 55, // 40 (preferred) + 15 (indigenous)
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 15,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },

  // ===== PRIORITY PROVINCE TESTS =====
  {
    name: "Priority Province: Alberta (+10 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Alberta",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 50, // 40 (preferred) + 10 (province)
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Priority Province: British Columbia (+10 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "British Columbia",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 50,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Priority Province: Ontario (+10 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Ontario",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 50,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Priority Province: Northwest Territories (+10 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Northwest Territories",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 50,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Non-Priority Province: Quebec (0 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },

  // ===== BUILD CANADA / ESG TESTS =====
  {
    name: "Build Canada: Yes (+5 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 45, // 40 (preferred) + 5 (ESG)
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 5,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Build Canada: No (0 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Build Canada: I don't know (0 points)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "I don't know"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },

  // ===== URGENCY BONUS TESTS =====
  {
    name: "Urgency: Immediate + Preferred (+5 bonus)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 45, // 40 (preferred) + 5 (urgency)
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 5,
      responseTime: "24 hours"
    }
  },
  {
    name: "Urgency: Immediate + Elite (+5 bonus)",
    input: {
      projectUnitCount: 200,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 55, // 50 (elite) + 5 (urgency)
      tier: 'elite',
      unitVolume: 50,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 5,
      responseTime: "24 hours"
    }
  },
  {
    name: "Urgency: Immediate + Pioneer (NO bonus - not preferred/elite)",
    input: {
      projectUnitCount: 30,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 15, // 15 (pioneer) - NO urgency bonus
      tier: 'pioneer',
      unitVolume: 15,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },
  {
    name: "Urgency: Short-term + Preferred (NO bonus - not immediate)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Short-term (3-6 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40, // 40 (preferred) - NO urgency bonus
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },

  // ===== SLA / RESPONSE TIME TESTS =====
  {
    name: "SLA: 2 hours (score 80-100)",
    input: {
      projectUnitCount: 200,
      decisionTimeline: "Immediate (0-3 months)",
      governmentPrograms: "Participating in government programs",
      developerType: "Indigenous Community/Organization",
      constructionProvince: "Ontario",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 100,
      tier: 'elite',
      unitVolume: 50,
      government: 20,
      indigenous: 15,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 5,
      responseTime: "2 hours"
    }
  },
  {
    name: "SLA: 6 hours (score 60-79)",
    input: {
      projectUnitCount: 200,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Ontario",
      buildCanadaEligible: "Yes"
    },
    expected: {
      score: 65, // 50 + 10 + 5
      tier: 'elite',
      unitVolume: 50,
      government: 0,
      indigenous: 0,
      province: 10,
      esgAffordability: 5,
      urgencyBonus: 0,
      responseTime: "6 hours"
    }
  },
  {
    name: "SLA: 24 hours (score 40-59)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "SLA: 72 hours (score 0-39)",
    input: {
      projectUnitCount: 10,
      decisionTimeline: "Long-term (12+ months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 15,
      tier: 'pioneer',
      unitVolume: 15,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },

  // ===== EDGE CASES =====
  {
    name: "Edge: Boundary 49 units (Pioneer max)",
    input: {
      projectUnitCount: 49,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 15,
      tier: 'pioneer',
      unitVolume: 15,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "72 hours"
    }
  },
  {
    name: "Edge: Boundary 50 units (Preferred min)",
    input: {
      projectUnitCount: 50,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  },
  {
    name: "Edge: Boundary 199 units (Preferred max - SHOULD BE PREFERRED)",
    input: {
      projectUnitCount: 199,
      decisionTimeline: "Medium-term (6-12 months)",
      governmentPrograms: "Not participating",
      developerType: "Private Developer (Medium Projects)",
      constructionProvince: "Quebec",
      buildCanadaEligible: "No"
    },
    expected: {
      score: 40,
      tier: 'preferred',
      unitVolume: 40,
      government: 0,
      indigenous: 0,
      province: 0,
      esgAffordability: 0,
      urgencyBonus: 0,
      responseTime: "24 hours"
    }
  }
];

// Test runner
function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('AI PRIORITY SCORING ALGORITHM - COMPREHENSIVE TEST SUITE');
  console.log('Specification: 2025+ Optimized (B2B Only, 3 Tiers)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;
  const failures: Array<{name: string, errors: string[]}> = [];

  testCases.forEach((testCase, index) => {
    const result = calculatePriorityScore(testCase.input as AssessmentFormData);
    const errors: string[] = [];

    // Validate all fields
    if (result.score !== testCase.expected.score) {
      errors.push(`Score: Expected ${testCase.expected.score}, got ${result.score}`);
    }
    if (result.breakdown.tier !== testCase.expected.tier) {
      errors.push(`Tier: Expected ${testCase.expected.tier}, got ${result.breakdown.tier}`);
    }
    if (result.breakdown.unitVolume !== testCase.expected.unitVolume) {
      errors.push(`Unit Volume: Expected ${testCase.expected.unitVolume}, got ${result.breakdown.unitVolume}`);
    }
    if (result.breakdown.government !== testCase.expected.government) {
      errors.push(`Government: Expected ${testCase.expected.government}, got ${result.breakdown.government}`);
    }
    if (result.breakdown.indigenous !== testCase.expected.indigenous) {
      errors.push(`Indigenous: Expected ${testCase.expected.indigenous}, got ${result.breakdown.indigenous}`);
    }
    if (result.breakdown.province !== testCase.expected.province) {
      errors.push(`Province: Expected ${testCase.expected.province}, got ${result.breakdown.province}`);
    }
    if (result.breakdown.esgAffordability !== testCase.expected.esgAffordability) {
      errors.push(`ESG/Affordability: Expected ${testCase.expected.esgAffordability}, got ${result.breakdown.esgAffordability}`);
    }
    if (result.breakdown.urgencyBonus !== testCase.expected.urgencyBonus) {
      errors.push(`Urgency Bonus: Expected ${testCase.expected.urgencyBonus}, got ${result.breakdown.urgencyBonus}`);
    }
    if (result.breakdown.responseTime !== testCase.expected.responseTime) {
      errors.push(`Response Time: Expected "${testCase.expected.responseTime}", got "${result.breakdown.responseTime}"`);
    }

    if (errors.length === 0) {
      console.log(`✅ Test ${index + 1}/${testCases.length}: PASS - ${testCase.name}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}/${testCases.length}: FAIL - ${testCase.name}`);
      errors.forEach(error => console.log(`   ${error}`));
      failed++;
      failures.push({ name: testCase.name, errors });
    }
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('FAILED TEST DETAILS');
    console.log('═══════════════════════════════════════════════════════════════');
    failures.forEach((failure, index) => {
      console.log(`\n${index + 1}. ${failure.name}`);
      failure.errors.forEach(error => console.log(`   - ${error}`));
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  return { passed, failed, total: testCases.length, failures };
}

// Run the tests
const results = runTests();
process.exit(results.failed > 0 ? 1 : 0);

export { runTests, testCases };
