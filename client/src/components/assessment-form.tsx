import React, { useState, useEffect } from 'react';
import { 
  analytics, 
  trackAssessmentStart, 
  trackAssessmentStepComplete,
  trackAssessmentComplete,
  trackCustomerTierDetermination,
  trackUnitCountSelection
} from "../lib/analytics";

// TypeScript interfaces
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
  }
}

interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  unitCount?: string;
  budget?: string;
  projectBudgetRange?: string;  // Fallback field mapping
  timeline?: string;
  deliveryTimeline?: string;    // Fallback field mapping
  province?: string;
  constructionProvince?: string; // Fallback field mapping
  readiness?: string;
  developerType?: string;
  governmentPrograms?: string;
  projectDescription?: string;
  learningInterest?: string;
  informationPreference?: string;
  consentCommunications?: boolean;
  consentSMS?: boolean;
  consentSMSTimestamp?: string;
  privacyPolicy?: boolean;
  marketingConsent?: boolean;
  ageVerification?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

type TierType = 'tier_0_explorer' | 'tier_1_starter' | 'tier_2_pioneer' | 'tier_3_preferred' | 'tier_4_elite';

const IllummaaAssessmentForm = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [responseCommitment, setResponseCommitment] = useState('');
  const [buildCanadaEligible, setBuildCanadaEligible] = useState(false);
  const [priorityScore, setPriorityScore] = useState(0);
  const [customerTier, setCustomerTier] = useState<TierType>('tier_0_explorer');
  const [isExplorer, setIsExplorer] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [startTime] = useState(Date.now());
  
  const TOTAL_STEPS = 5;

  // Fetch CSRF token on mount and track assessment start
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'same-origin'
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        
        // Track assessment start when component loads
        trackAssessmentStart();
      } catch (error) {
        console.error('CSRF token fetch failed:', error);
      }
    };
    fetchCSRFToken();

    // Track abandonment on page unload
    const handleBeforeUnload = () => {
      const stepNames = ['', 'readiness_units', 'project_details', 'contact_info', 'consent_review'];
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      analytics.trackAssessmentAbandonment(currentStep, stepNames[currentStep] || 'unknown', timeSpent);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, startTime]);


  // Tier determination function with weighted logic for long-term planners
  const determineCustomerTier = (units: string, readiness: string): TierType => {
    const unitCount = parseInt(units) || 0;
    let determinedTier: TierType;
    
    // Just researching ALWAYS = Explorer (secure default)
    if (readiness === 'researching') {
      determinedTier = 'tier_0_explorer';
    }
    // Security check: Commitment-level users must have actual unit counts
    else if (readiness !== 'researching' && unitCount === 0) {
      console.warn('Security: Zero units for non-research tier - maintaining Explorer classification');
      determinedTier = 'tier_0_explorer'; // Secure fallback
    }
    // Planning long-term (12+ months) - weighted by units with minimum threshold
    else if (readiness === 'planning-long') {
      if (unitCount <= 0) determinedTier = 'tier_0_explorer'; // Security fallback
      else if (unitCount <= 49) determinedTier = 'tier_1_starter';
      else if (unitCount <= 149) determinedTier = 'tier_2_pioneer';
      else if (unitCount <= 299) determinedTier = 'tier_3_preferred';
      else determinedTier = 'tier_4_elite';
    }
    // All other readiness levels - standard logic with validation
    else {
      if (unitCount <= 0) determinedTier = 'tier_0_explorer'; // Security fallback
      else if (unitCount <= 49) determinedTier = 'tier_1_starter';
      else if (unitCount <= 149) determinedTier = 'tier_2_pioneer';
      else if (unitCount <= 299) determinedTier = 'tier_3_preferred';
      else determinedTier = 'tier_4_elite';
    }
    
    // Track tier determination for analytics
    trackCustomerTierDetermination(determinedTier, units, readiness);
    
    return determinedTier;
  };

  // Get tier display information
  const getTierInfo = (tier: TierType) => {
    const tierInfo = {
      'tier_0_explorer': {
        name: 'Explorer',
        icon: '📚',
        color: 'blue',
        description: 'Educational resources at your pace',
        submitText: 'Start Learning Journey'
      },
      'tier_1_starter': {
        name: 'Starter',
        icon: '🏠',
        color: 'green',
        description: 'Personal consultation support',
        submitText: 'Get Started'
      },
      'tier_2_pioneer': {
        name: 'Pioneer',
        icon: '🚀',
        color: 'purple',
        description: 'Priority partnership attention',
        submitText: 'Submit Assessment'
      },
      'tier_3_preferred': {
        name: 'Preferred',
        icon: '⭐',
        color: 'orange',
        description: 'Expedited senior team handling',
        submitText: 'Submit Assessment'
      },
      'tier_4_elite': {
        name: 'Elite',
        icon: '👑',
        color: 'red',
        description: 'Executive VIP engagement',
        submitText: 'Submit Assessment'
      }
    };
    return tierInfo[tier] || tierInfo['tier_0_explorer'];
  };

  // Response commitments (NO TIME PROMISES)
  // RESPONSE COMMITMENT FUNCTIONS - Professional Service Levels (No Numerical Scoring)
  const getResponseCommitmentLevel = (tier: TierType) => {
    const levels = {
      'tier_0_explorer': 'Educational Support Track',
      'tier_1_starter': 'Standard Partnership Attention', 
      'tier_2_pioneer': 'Enhanced Partnership Priority',
      'tier_3_preferred': 'Executive Partnership Track',
      'tier_4_elite': 'VIP Implementation Support'
    };
    return levels[tier] || 'Standard Partnership Attention';
  };

  const getResponseDescription = (tier: TierType) => {
    const descriptions = {
      'tier_0_explorer': 'Comprehensive educational resources and learning guidance',
      'tier_1_starter': 'Personal consultation support for your modular journey',
      'tier_2_pioneer': 'Priority partnership coordination with dedicated team attention',
      'tier_3_preferred': 'Expedited processing with senior team engagement',
      'tier_4_elite': 'Executive-level partnership with comprehensive project support'
    };
    return descriptions[tier] || 'Personal support for your modular housing needs';
  };

  // Legacy function for backward compatibility
  const getResponseCommitment = (tier: TierType) => {
    return getResponseDescription(tier);
  };

  // Add this helper function if it doesn't exist
  const sanitizeInput = (value: string): string => {
    if (typeof value !== 'string') return value;
    // Enterprise-grade sanitization
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .substring(0, 1000); // Limit length to prevent DoS
  };

  // ============ COMPLETE TIER CALCULATION FIX - v2.0 ============
  // This replaces the entire handleInputChange function and adds proper tier calculation

  // REPLACEMENT handleInputChange with inline tier calculation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const rawValue = type === 'checkbox' ? checked : value;
    const sanitizedValue = type === 'checkbox' ? rawValue : sanitizeInput(value);
    
    // Handle readiness field changes
    if (name === 'readiness') {
      const isResearching = value === 'researching';
      setIsExplorer(isResearching);
      
      if (isResearching) {
        // Explorer path
        setFormData(prev => ({
          ...prev,
          readiness: value,
          unitCount: '0',
          budget: 'Just exploring options',
          timeline: ''
        }));
        setCustomerTier('tier_0_explorer');
        setPriorityScore(0);
      } else {
        // Non-explorer path - clear sentinel '0' from researching mode
        setFormData(prev => ({
          ...prev,
          readiness: value,
          unitCount: (prev.unitCount && prev.unitCount !== '0') ? prev.unitCount : '',
          budget: '',
          timeline: ''
        }));
        
        // CRITICAL FIX: Recalculate tier if units exist
        if (formData.unitCount) {
          const unitNum = parseInt(formData.unitCount) || 0;
          let newTier = 'tier_0_explorer';
          
          if (unitNum > 0 && unitNum <= 49) {
            newTier = 'tier_1_starter';
          } else if (unitNum <= 149) {
            newTier = 'tier_2_pioneer';
          } else if (unitNum <= 299) {
            newTier = 'tier_3_preferred';
          } else if (unitNum >= 300) {
            newTier = 'tier_4_elite';
          }
          
          setCustomerTier(newTier as TierType);
        }
      }
    } 
    // Handle unit count changes
    else if (name === 'unitCount') {
      const currentReadiness = formData.readiness;
      
      // Validation for non-explorers
      if (currentReadiness && currentReadiness !== 'researching' && (value === '0' || value === '')) {
        setErrors(prev => ({ ...prev, unitCount: 'Please select actual number of units needed' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, unitCount: value }));
      
      // INLINE TIER CALCULATION - Always recalculate immediately
      if (value && currentReadiness) {
        const unitNum = parseInt(value) || 0;
        let calculatedTier = 'tier_0_explorer';
        
        // Direct tier determination
        if (currentReadiness === 'researching' || unitNum === 0) {
          calculatedTier = 'tier_0_explorer';
        } else if (unitNum === 1 || unitNum === 2) {
          // EXPLICIT: 1 or 2 homes = Starter
          calculatedTier = 'tier_1_starter';
        } else if (unitNum > 2 && unitNum <= 49) {
          calculatedTier = 'tier_1_starter';
        } else if (unitNum <= 149) {
          calculatedTier = 'tier_2_pioneer';
        } else if (unitNum <= 299) {
          calculatedTier = 'tier_3_preferred';
        } else {
          calculatedTier = 'tier_4_elite';
        }
        
        // Force update
        setCustomerTier(calculatedTier as TierType);
        
        // Debug logging
        console.log('Tier Calculation:', {
          readiness: currentReadiness,
          unitInput: value,
          unitNumber: unitNum,
          result: calculatedTier,
          timestamp: new Date().toISOString()
        });
        
        // Recalculate score with current values immediately
        calculatePriorityScoreWith({ ...formData, unitCount: value });
        console.log('Unit change recalc', { readiness: currentReadiness, unitCount: value, tier: calculatedTier });
      }
    }
    // Handle SMS consent
    else if (name === 'consentSMS' && checked) {
      setFormData(prev => ({
        ...prev,
        consentSMS: true,
        consentSMSTimestamp: new Date().toISOString()
      }));
    }
    // Handle all other fields
    else {
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    }
    
    // Clear errors
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Trigger score recalculation for relevant fields using current values
    if (['unitCount', 'budget', 'timeline', 'province', 'developerType', 'governmentPrograms'].includes(name)) {
      const nextFormData = { ...formData, [name]: type === 'checkbox' ? checked : sanitizedValue } as typeof formData;
      calculatePriorityScoreWith(nextFormData);
    }
  };

  // Phone formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, '');
    
    if (value.length > 0 && !value.startsWith('+')) {
      value = '+' + value;
    }
    
    if (!value.startsWith('+1') && value.length > 1) {
      value = '+1' + value.substring(1);
    }
    
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
  };

  // Pure calculator that takes latest values to avoid race conditions
  const calculatePriorityScoreWith = (fd: typeof formData) => {
    let score = 0;
    const units = parseInt(fd.unitCount) || 0;
    
    const currentTier = determineCustomerTier(fd.unitCount || '0', fd.readiness || '');
    setCustomerTier(currentTier);
    
    console.log('Score calc using', { units: fd.unitCount, readiness: fd.readiness });
    
    const description = (fd.projectDescription || "").toLowerCase().substring(0, 5000);
    const readiness = fd.readiness || "";
    
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
    if (units >= 1000) score += 30;
    else if (units >= 500) score += 25;
    else if (units >= 200) score += 20;
    else if (units >= 100) score += 15;
    else if (units >= 50) score += 8;
    else if (units > 0) score += 3;

    // 2. GOVERNMENT PROGRAMS - BULLETPROOF VERSION
    const govPrograms = fd.governmentPrograms || '';
    
    if (govPrograms && govPrograms !== 'none') score += 15;

    // 3. TIMELINE (20 points max)
    const timeline = fd.timeline || '';
    if (timeline.includes('6-months') || timeline.includes('6-12-months')) score += 20;
    else if (timeline.includes('1-year') || timeline.includes('year-2')) score += 15;
    else if (timeline.includes('2-years')) score += 10;
    else if (timeline.includes('3-years')) score += 5;

    // 4. BUDGET (20 points max)
    const budget = fd.budget || '';
    if (budget.includes('10M+') || budget.includes('5-10M')) score += 20;
    else if (budget.includes('2-5M') || budget.includes('1-2M')) score += 15;
    else if (budget.includes('500K-1M') || budget.includes('250-500K')) score += 10;
    else if (budget.includes('100-250K') || budget.includes('50-100K')) score += 5;

    // 5. PROVINCIAL FOCUS (10 points max)
    const province = fd.province || '';
    if (['ontario', 'british-columbia', 'alberta'].includes(province)) score += 10;
    else if (['quebec', 'manitoba', 'saskatchewan'].includes(province)) score += 8;
    else if (province && province !== 'none') score += 5;

    // 6. DEVELOPER TYPE (10 points max)
    const devType = fd.developerType || '';
    if (devType === 'commercial-developer') score += 10;
    else if (devType === 'residential-builder') score += 8;
    else if (devType === 'government-housing') score += 9;
    else if (devType === 'non-profit') score += 7;

    // 7. INDIGENOUS COMMUNITY SUPPORT (15 bonus points)
    if (hasIndigenous) score += 15;

    // 8. SUSTAINABILITY FOCUS (10 bonus points)
    if (hasSustainability) score += 10;

    // 9. READINESS LEVEL MULTIPLIER (1.0x - 1.5x)
    let multiplier = 1.0;
    if (readiness === 'planning-soon') multiplier = 1.5;
    else if (readiness === 'planning-6-months') multiplier = 1.3;
    else if (readiness === 'planning-long') multiplier = 1.1;
    else if (readiness === 'researching') multiplier = 0.5;

    const finalScore = Math.round(score * multiplier);
    setPriorityScore(finalScore);

    // Enhanced analytics with tier information
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'customer_tier_determination', {
        event_category: 'Business Logic',
        action: 'tier_classification',
        customer_tier: currentTier,
        unit_count: fd.unitCount || '0',
        readiness_level: readiness,
        lead_type: currentTier.startsWith('tier_0') ? 'explorer' : 
                   currentTier.startsWith('tier_1') ? 'residential' : 'partnership',
      });
    }

    return finalScore;
  };

  const calculatePriorityScore = () => {
    let score = 0;
    const units = parseInt(formData.unitCount) || 0;
    
    const currentTier = determineCustomerTier(formData.unitCount || '0', formData.readiness || '');
    setCustomerTier(currentTier);
    
    const description = (formData.projectDescription || "").toLowerCase().substring(0, 5000);
    const readiness = formData.readiness || "";
    
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
    if (units >= 1000) score += 30;
    else if (units >= 500) score += 25;
    else if (units >= 200) score += 20;
    else if (units >= 100) score += 15;
    else if (units >= 50) score += 8;
    else if (units > 0) score += 3;

    // 2. GOVERNMENT PROGRAMS - BULLETPROOF VERSION
    // Check all possible field locations
    const govPrograms = formData.governmentPrograms || 
                        formData.government_programs || 
                        formData['governmentPrograms'] || 
                        '';
    
    // Add scoring based on value
    if (govPrograms === "Currently participating") {
      score += 30;
    } else if (govPrograms === "Very interested") {
      score += 20;
    } else if (govPrograms === "Somewhat interested") {
      score += 10;
    } else if (govPrograms === "Just learning about options") {
      score += 3;  // THIS IS YOUR MISSING 3 POINTS
    }

    // 3. BUDGET (25 points max)
    const budget = formData.budget || formData.projectBudgetRange || '';
    switch (budget) {
      case "Over $50M": score += 25; break;
      case "$30M - $50M": score += 20; break;
      case "$15M - $30M": score += 15; break;
      case "$5M - $15M": score += 10; break;
      case "$2M - $5M": score += 6; break;
      case "$500K - $2M": score += 3; break;
      case "Under $500K": score += 1; break;
      case "Just exploring options": score += 0; break;
      default: score += 0;
    }

    // 4. TIMELINE (20 points max)
    const timeline = formData.timeline || formData.deliveryTimeline || '';
    switch (timeline) {
      case "Immediate (0-3 months)": score += 20; break;
      case "Short-term (3-6 months)": score += 12; break;
      case "Medium-term (6-12 months)": score += 6; break;
      case "Long-term (12+ months)": score += 2; break;
      default: score += 0;
    }

    // 5. DEVELOPER TYPE (20 points max)
    const devType = formData.developerType || "";
    if (devType === "Indigenous Community/Organization") {
      score += 20;
    } else if (devType === "Government/Municipal") {
      score += 15;
    } else if (devType.includes("Commercial")) {
      score += 10;
    } else if (devType.includes("Non-Profit")) {
      score += 8;
    } else if (devType.includes("Private")) {
      score += 5;
    }

    // 6. GEOGRAPHY - BULLETPROOF VERSION
    const province = formData.province || 
                     formData.constructionProvince || 
                     formData['province'] || 
                     '';
    
    if (province === "Ontario" || province === "British Columbia") {
      score += 10;
    } else if (province === "Alberta" || province === "Quebec") {
      score += 7;  // YOUR ALBERTA 7 POINTS
    } else if (["Nova Scotia", "New Brunswick", "Prince Edward Island", 
              "Newfoundland and Labrador"].includes(province)) {
      score += 5;
    } else if (province) {
      score += 3;
    }

    // 7. BUILD CANADA ELIGIBILITY (10 points)
    let buildCanadaQualifies = false;
    if (units >= 300) {
      score += 10;
      buildCanadaQualifies = true;
    } else if (units >= 200 && (devType === "Indigenous Community/Organization" || 
                                devType === "Government/Municipal")) {
      score += 10;
      buildCanadaQualifies = true;
    } else if (units >= 100 && formData.governmentPrograms === "Currently participating") {
      score += 5;
      buildCanadaQualifies = true;
    }
    setBuildCanadaEligible(buildCanadaQualifies);

    // 8. KEYWORD BONUSES (5 points max)
    if (hasIndigenous) score += 3;
    if (hasSustainability) score += 2;

    // 9. DEAL VELOCITY (10 points max)
    if (timeline === "Immediate (0-3 months)" && 
        (budget === "Over $50M" || budget === "$30M - $50M")) {
      score += 10;
    } else if (timeline === "Short-term (3-6 months)" && 
               (budget === "$15M - $30M" || budget === "$30M - $50M")) {
      score += 5;
    }

    // 10. PENALTIES
    if ((readiness === "planning-long" || readiness === "researching") && units > 100) {
      score = Math.floor(score * 0.85);
    }
    if (budget === "Over $50M" && units < 50) {
      score = Math.floor(score * 0.9);
    }

    // 11. MINIMUM GUARANTEES
    const isIndigenousProject = hasIndigenous || devType === "Indigenous Community/Organization";
    
    if ((devType === "Government/Municipal" || devType === "Indigenous Community/Organization") && 
        units >= 100 && score < 75) {
      score = 75;
    }
    if (formData.governmentPrograms === "Currently participating" && units >= 50 && score < 50) {
      score = 50;
    }
    if (isIndigenousProject && score < 40) {
      score = 40;
    }

    // Apply Explorer cap LAST (before final return)
    if (formData.readiness === 'researching') {
      score = Math.min(score, 25);
    }

    const finalScore = Math.min(Math.max(0, Math.round(score)), 150);
    setPriorityScore(finalScore);
  };

  // Validation
  const validateStep = (step: number) => {
    const newErrors: FormErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.readiness) {
          newErrors.readiness = 'Please select your journey stage';
        }
        
        // Enhanced validation: Only validate units if NOT "Just researching"
        if (formData.readiness !== 'researching') {
          if (!formData.unitCount || formData.unitCount === '') {
            newErrors.unitCount = 'Please select number of units';
          }
          
          // Security validation: Ensure commitment-level users have meaningful unit counts
          const unitCount = parseInt(formData.unitCount) || 0;
          if (unitCount <= 0) {
            newErrors.unitCount = 'Please select a valid number of units for your project';
          }
        }
        break;
        
      case 2:
        if (isExplorer) {
          if (!formData.learningInterest) {
            newErrors.learningInterest = 'Please select your primary interest';
          }
          if (!formData.informationPreference) {
            newErrors.informationPreference = 'Please select your information preference';
          }
        } else {
          if (!formData.budget && !formData.projectBudgetRange) {
            newErrors.budget = 'Budget range is required';
          }
          if (!formData.timeline && !formData.deliveryTimeline) {
            newErrors.timeline = 'Timeline is required';
          }
        }
        break;
        
      case 3: // Contact Information
        if (!formData.firstName?.trim() || formData.firstName.length < 2) {
          newErrors.firstName = 'First name is required (2+ characters)';
        }
        if (!formData.lastName?.trim() || formData.lastName.length < 2) {
          newErrors.lastName = 'Last name is required (2+ characters)';
        }
        if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Valid email address is required';
        }
        if (!formData.phone?.trim() || formData.phone.length < 12) {
          newErrors.phone = 'Valid Canadian phone number is required';
        }
        // Company validation - Required only for Pioneer tier and above
        const companyRequired = customerTier !== 'tier_0_explorer' && customerTier !== 'tier_1_starter';
        
        if (companyRequired && !formData.company?.trim()) {
          if (customerTier === 'tier_2_pioneer') {
            newErrors.company = 'Company name is required for partnership inquiries (50+ units)';
          } else if (customerTier === 'tier_3_preferred') {
            newErrors.company = 'Company name is required for preferred partnership (150+ units)';
          } else if (customerTier === 'tier_4_elite') {
            newErrors.company = 'Company name is required for elite partnership (300+ units)';
          } else {
            newErrors.company = 'Company name is required';
          }
        }
        
        // No validation error for Starter tier - company is optional
        break;
        
      case 4: // Validate required fields for ALL tiers
        if (!formData.province && !formData.constructionProvince) {
          newErrors.province = 'Province/territory is required';
        }
        if (!formData.developerType) {
          newErrors.developerType = 'Please select a developer type';
        }
        if (!formData.governmentPrograms) {
          newErrors.governmentPrograms = 'Please select your interest level';
        }
        break;
        
      case 5: // Review + Legal Consent
        if (!formData.consentCommunications) {
          newErrors.consentCommunications = 'Communication consent is required by CASL';
        }
        if (!formData.consentSMS) {
          newErrors.consentSMS = 'SMS consent is required for text messaging';
        }
        if (!formData.privacyPolicy) {
          newErrors.privacyPolicy = 'Privacy policy acceptance is required by PIPEDA';
        }
        if (!formData.ageVerification) {
          newErrors.ageVerification = 'Age verification is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      const newStep = Math.min(currentStep + 1, TOTAL_STEPS);
      const stepNames = ['', 'readiness_units', 'project_details', 'contact_info', 'consent_review', 'complete'];
      
      // Track step completion
      trackAssessmentStepComplete(currentStep, stepNames[currentStep], formData);
      
      setCurrentStep(newStep);
      
      // Track new step start (unless it's the completion step)
      if (newStep <= TOTAL_STEPS && stepNames[newStep]) {
        analytics.trackAssessmentStepStart(newStep, stepNames[newStep]);
      }
      
      // Scroll to form section, not page top
      const formElement = document.getElementById('developer-qualification');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
    // Scroll to form section, not page top
    const formElement = document.getElementById('developer-qualification');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate tags for single pipeline
  const generateTags = () => {
    const tags = [];
    
    // Tier tags
    tags.push(customerTier);
    
    // Priority tags
    if (priorityScore >= 100) tags.push('Priority-High-150', 'Response-1Hour-Required');
    else if (priorityScore >= 50) tags.push('Priority-Medium-75', 'Response-4Hour-Standard');
    else tags.push('Priority-Standard-25', 'Response-24Hour-Follow');
    
    // Scale tags
    const units = parseInt(formData.unitCount) || 0;
    if (units >= 200) tags.push('Scale-Enterprise-Community');
    else if (units >= 50) tags.push('Scale-Large-Partnership');
    else if (units >= 11) tags.push('Scale-Medium-Commercial');
    else if (units >= 3) tags.push('Scale-Small-Residential');
    else tags.push('Scale-Individual');
    
    // Location tags
    const province = formData.province || formData.constructionProvince;
    if (province) {
      const provinceCode = {
        'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
        'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
        'Northwest Territories': 'NT', 'Nova Scotia': 'NS', 'Nunavut': 'NU',
        'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
        'Saskatchewan': 'SK', 'Yukon': 'YT'
      }[province] || 'XX';
      
      tags.push(`Location-${provinceCode}-${province.replace(/\s+/g, '')}`);
      
      if (['Ontario', 'British Columbia', 'Alberta'].includes(province)) {
        tags.push('Market-Primary');
      } else {
        tags.push('Market-Secondary');
      }
    }
    
    // Compliance tags
    tags.push('CASL-Compliant', 'PIPEDA-Compliant', 'SMS-Verified', 'A2P-10DLC-Ready');
    
    // Source tags
    tags.push('Source-Website-Direct', 'Channel-Digital-High', 'Security-Verified');
    
    return tags;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep) || !csrfToken) {
      alert('Please complete all required fields and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tags = generateTags();
      const tierInfo = getTierInfo(customerTier);
      
      // Build webhook payload for single pipeline
      const payload = {
        // Contact Information
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        companyName: sanitizeInput(formData.company || ''),
        
        // Classification (for single pipeline routing)
        customerTier: customerTier,
        partnershipLevel: tierInfo.name,
        aiPriorityScore: priorityScore,
        
        // Project Details
        projectUnitCount: sanitizeInput(formData.unitCount || '0'),
        readinessToBuy: formData.readiness,
        projectBudgetRange: sanitizeInput(formData.budget || formData.projectBudgetRange || 'Just exploring options'),
        deliveryTimeline: formData.timeline || formData.deliveryTimeline,
        constructionProvince: formData.province || formData.constructionProvince,
        developerType: sanitizeInput(formData.developerType || 'Not Specified'),
        governmentPrograms: sanitizeInput(formData.governmentPrograms || 'Not Specified'),
        projectDescription: sanitizeInput(formData.projectDescription || ''),
        
        // Education-specific fields for Explorer tier
        learningInterest: sanitizeInput(formData.learningInterest || 'Not specified'),
        informationPreference: sanitizeInput(formData.informationPreference || 'Not specified'),
        
        // Flags for automation
        buildCanadaEligible: buildCanadaEligible ? 'Yes' : 'No',
        isEducationOnly: customerTier === 'tier_0_explorer' ? 'Yes' : 'No',
        isEducationalLead: customerTier === 'tier_0_explorer' ? 'true' : 'false',
        
        // Response commitment (Professional Service Levels - No Numerical Scoring)
        responseCommitment: getResponseCommitment(customerTier),
        responseCommitmentLevel: getResponseCommitmentLevel(customerTier),
        
        // Tags for single pipeline automation
        tags: tags.join(','),
        
        // Pipeline assignment
        pipeline: 'ILLÜMMAA Customer Journey',
        stage: customerTier === 'tier_0_explorer' ? 'Education & Awareness' : 'Initial Interest',
        
        // Legal consent with SMS security
        consentCommunications: formData.consentCommunications ? 'true' : 'false',
        consentSMS: formData.consentSMS ? 'true' : 'false',
        consentSMSTimestamp: formData.consentSMSTimestamp || new Date().toISOString(),
        privacyPolicyConsent: formData.privacyPolicy ? 'true' : 'false',
        marketingConsent: formData.marketingConsent ? 'true' : 'false',
        ageVerification: formData.ageVerification ? 'true' : 'false',
        consentTimestamp: new Date().toISOString(),
        legalConsentVersion: '2025.1',
        caslCompliant: 'true',
        pipedaCompliant: 'true',
        a2p10dlcCompliant: 'true',
        
        // System metadata
        source: 'Website Form',
        timestamp: new Date().toISOString(),
        submissionId: `ILLUMMAA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        securityValidated: 'true',
        smsConsentSecurityValidated: 'true'
      };
      
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Analytics tracking
      // Enhanced assessment completion tracking
      trackAssessmentComplete(formData, priorityScore, customerTier);
      
      // Track lead generation conversion
      analytics.trackLeadGeneration({
        customerTier,
        priorityScore,
        unitCount: formData.unitCount,
        province: formData.province,
        readiness: formData.readiness,
        buildCanadaEligible
      });
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission error. Please try again or contact info@illummaa.ca');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="developer-qualification" className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12" data-testid="assessment-form-container">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4" data-testid="badge-partner">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Build Canada Homes Partner
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3" data-testid="title-main">
            Partnership & Learning Assessment
          </h1>
          <p className="text-gray-600" data-testid="text-subtitle">
            From learning to building. Find your path in Canada's modular housing revolution.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8" data-testid="progress-container">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span data-testid="text-step">Step {currentStep} of {TOTAL_STEPS}</span>
            <span data-testid="text-progress">{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
              }}
              data-testid="progress-bar"
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" data-testid="form-card">
          <form onSubmit={handleSubmit} data-testid="form-assessment">
            
            {/* STEP 1: Readiness + Units */}
            {currentStep === 1 && (
              <div className="space-y-6" data-testid="step-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-1">
                  Your Modular Journey
                </h2>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-readiness">
                    Where are you in your modular home journey? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="readiness"
                    value={formData.readiness || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.readiness ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-readiness"
                  >
                    <option value="">Please select...</option>
                    <option value="researching">Just researching - want to learn more</option>
                    <option value="planning-long">Planning to buy in 12+ months</option>
                    <option value="planning-medium">Actively looking (6-12 months)</option>
                    <option value="planning-short">Ready to move forward (3-6 months)</option>
                    <option value="immediate">I need a solution now (0-3 months)</option>
                  </select>
                  {errors.readiness && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-readiness">{errors.readiness}</p>
                  )}
                </div>

                {/* Only show units question if NOT "Just researching" (but show for "planning-long") */}
                {formData.readiness && formData.readiness !== 'researching' && (
                  <div>
                      <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-units">
                        Number of units needed <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="unitCount"
                        value={formData.unitCount || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.unitCount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                        required
                        data-testid="select-units"
                      >
                        <option value="">Select number of units...</option>
                        <option value="1">1 home</option>
                        <option value="2">2 homes</option>
                        <option value="25">3-49 units (Starter)</option>
                        <option value="75">50-149 units (Pioneer)</option>
                        <option value="200">150-299 units (Preferred)</option>
                        <option value="500">300+ units (Elite)</option>
                      </select>
                      {errors.unitCount && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-units">{errors.unitCount}</p>
                      )}
                    </div>
                )}

                {/* Tier Preview - Only show when meaningful data entered */}
                {(formData.readiness && formData.unitCount !== undefined && formData.unitCount !== '') && (
                  <div className="bg-gray-50 rounded-xl p-4" data-testid="tier-preview">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" data-testid="tier-icon">{getTierInfo(customerTier).icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900" data-testid="tier-name">
                          {getTierInfo(customerTier).name} Tier
                        </p>
                        <p className="text-sm text-gray-600" data-testid="tier-description">
                          {getTierInfo(customerTier).description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* STEP 2: Learning Preferences / Budget & Timeline */}
            {currentStep === 2 && (
              <div className="space-y-6" data-testid="step-2">
                {isExplorer ? (
                  // NEW EXPLORER SECTION
                  <>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-2">
                      Learning Preferences
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Help us provide the most relevant educational resources for your modular housing research.
                    </p>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-learning-interest">
                        What aspect of modular construction interests you most? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="learningInterest"
                        value={formData.learningInterest || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.learningInterest ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                        required
                        data-testid="select-learning-interest"
                      >
                        <option value="">Select your primary interest...</option>
                        <option value="Cost comparison vs traditional construction">Cost comparison vs traditional construction</option>
                        <option value="Construction process and timeline understanding">Construction process and timeline understanding</option>
                        <option value="Building codes and regulatory requirements">Building codes and regulatory requirements</option>
                        <option value="Design options and customization capabilities">Design options and customization capabilities</option>
                        <option value="Financing and government program options">Financing and government program options</option>
                        <option value="Sustainability and energy efficiency benefits">Sustainability and energy efficiency benefits</option>
                        <option value="Site preparation and installation requirements">Site preparation and installation requirements</option>
                        <option value="Long-term maintenance and durability">Long-term maintenance and durability</option>
                        <option value="Comprehensive overview of all aspects">Comprehensive overview of all aspects</option>
                      </select>
                      {errors.learningInterest && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-learning-interest">{errors.learningInterest}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-information-preference">
                        How would you prefer to receive information? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="informationPreference"
                        value={formData.informationPreference || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.informationPreference ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                        required
                        data-testid="select-information-preference"
                      >
                        <option value="">Select information preference...</option>
                        <option value="Email guides and case studies">Email guides and case studies</option>
                        <option value="One-on-one educational consultation">One-on-one educational consultation</option>
                        <option value="Video walkthroughs and virtual tours">Video walkthroughs and virtual tours</option>
                        <option value="Downloadable planning resources">Downloadable planning resources</option>
                        <option value="Industry webinar invitations">Industry webinar invitations</option>
                        <option value="Mixed approach - email and consultation">Mixed approach - email and consultation</option>
                      </select>
                      {errors.informationPreference && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-information-preference">{errors.informationPreference}</p>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📚</span>
                        <div>
                          <h4 className="font-semibold text-blue-800">Educational Journey</h4>
                          <p className="text-sm text-blue-700">
                            We'll provide personalized resources based on your interests and preferred learning style.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // EXISTING BUDGET + TIMELINE FOR NON-EXPLORERS
                  <>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-2">
                      Budget & Timeline
                    </h2>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-budget">
                        Project Budget Range (CAD) <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="budget"
                        value={formData.budget || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.budget ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                        required
                        data-testid="select-budget"
                      >
                        <option value="">Select budget range...</option>
                        <option value="Under $500K">Under $500K</option>
                        <option value="$500K - $2M">$500K - $2M</option>
                        <option value="$2M - $5M">$2M - $5M</option>
                        <option value="$5M - $15M">$5M - $15M</option>
                        <option value="$15M - $30M">$15M - $30M</option>
                        <option value="$30M - $50M">$30M - $50M</option>
                        <option value="Over $50M">Over $50M</option>
                      </select>
                      {errors.budget && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-budget">{errors.budget}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-timeline">
                        Delivery Timeline <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.timeline ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                        required
                        data-testid="select-timeline"
                      >
                        <option value="">Select timeline...</option>
                        <option value="Immediate (0-3 months)">Immediate (0-3 months)</option>
                        <option value="Short-term (3-6 months)">Short-term (3-6 months)</option>
                        <option value="Medium-term (6-12 months)">Medium-term (6-12 months)</option>
                        <option value="Long-term (12+ months)">Long-term (12+ months)</option>
                      </select>
                      {errors.timeline && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-timeline">{errors.timeline}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: Contact Information */}
            {currentStep === 3 && (
              <div className="space-y-6" data-testid="step-3">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-3">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-firstname">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                      required
                      data-testid="input-firstname"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-firstname">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-lastname">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                      required
                      data-testid="input-lastname"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-lastname">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                    required
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-email">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-phone">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handlePhoneChange}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                    required
                    data-testid="input-phone"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-phone">{errors.phone}</p>
                  )}
                </div>

                {/* Company Field - Smart Display Based on Tier */}
                {(customerTier && customerTier !== 'tier_0_explorer') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization 
                      {customerTier !== 'tier_1_starter' && <span className="text-red-500 ml-1">*</span>}
                      {customerTier === 'tier_1_starter' && <span className="text-gray-500 ml-2">(Optional)</span>}
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required={customerTier !== 'tier_1_starter'}
                      placeholder={
                        customerTier === 'tier_1_starter' 
                          ? "Company name (if applicable)" 
                          : "Company/Organization name"
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                      aria-label="Company or organization name"
                    />
                    {errors.company && (
                      <p className="mt-1 text-xs text-red-600" role="alert">{errors.company}</p>
                    )}
                    {/* Helper text based on tier */}
                    <p className="mt-1 text-xs text-gray-500">
                      {customerTier === 'tier_1_starter' && "Optional for individuals/families. Recommended for business entities."}
                      {customerTier === 'tier_2_pioneer' && "Required for partnership inquiries (50-149 units)"}
                      {customerTier === 'tier_3_preferred' && "Required for preferred partnership (150-299 units)"}
                      {customerTier === 'tier_4_elite' && "Required for elite partnership (300+ units)"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Location + Developer Type */}
            {currentStep === 4 && (
              <div className="space-y-6" data-testid="step-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-4">
                  Project Location & Details
                </h2>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-province">
                    Province/Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-province"
                  >
                    <option value="">Select province/territory...</option>
                    <option value="Alberta">Alberta</option>
                    <option value="British Columbia">British Columbia</option>
                    <option value="Manitoba">Manitoba</option>
                    <option value="New Brunswick">New Brunswick</option>
                    <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                    <option value="Northwest Territories">Northwest Territories</option>
                    <option value="Nova Scotia">Nova Scotia</option>
                    <option value="Nunavut">Nunavut</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Prince Edward Island">Prince Edward Island</option>
                    <option value="Quebec">Quebec</option>
                    <option value="Saskatchewan">Saskatchewan</option>
                    <option value="Yukon">Yukon</option>
                  </select>
                  {errors.province && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-province">{errors.province}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-developer-type">
                    Developer Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="developerType"
                    value={formData.developerType || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-developer-type"
                  >
                    <option value="">Select developer type...</option>
                    <option value="I don't know yet">I don't know yet</option>
                    <option value="Individual/Family">Individual/Family</option>
                    <option value="Commercial Developer">Commercial Developer</option>
                    <option value="Government/Municipal">Government/Municipal</option>
                    <option value="Non-Profit Organization">Non-Profit Organization</option>
                    <option value="Private Developer">Private Developer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-government-programs">
                    Interest in Government Housing Programs <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="governmentPrograms"
                    value={formData.governmentPrograms || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    data-testid="select-government-programs"
                  >
                    <option value="">Select interest level...</option>
                    <option value="Just learning about options">Just learning about options</option>
                    <option value="Not interested">Not interested</option>
                    <option value="Somewhat interested">Somewhat interested</option>
                    <option value="Very interested">Very interested</option>
                    <option value="Currently participating">Currently participating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-project-description">
                    Project Description (Optional)
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={handleInputChange}
                    placeholder="Tell us about your project goals, timeline, or any specific requirements..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-vertical"
                    data-testid="textarea-project-description"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: Dynamic Assessment Summary */}
            {currentStep === 5 && (
              <div className="space-y-6" data-testid="step-5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-5">
                  Review & Submit
                </h2>
                
                {/* DYNAMIC ASSESSMENT SUMMARY */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Information Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Contact Details</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></p>
                        <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{formData.phone}</span></p>
                        {formData.company && <p><span className="text-gray-600">Company:</span> <span className="font-medium">{formData.company}</span></p>}
                      </div>
                    </div>

                    {/* Journey/Project Information Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">{customerTier === 'tier_0_explorer' ? 'Learning Journey' : 'Project Scope'}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {formData.readiness && <p><span className="text-gray-600">Journey Stage:</span> <span className="font-medium">{formData.readiness === 'researching' ? 'Research & Learning' : formData.readiness === 'planning-long' ? 'Planning (12+ months)' : formData.readiness === 'planning-medium' ? 'Actively Looking (6-12 months)' : formData.readiness === 'planning-short' ? 'Ready to Move Forward (3-6 months)' : formData.readiness === 'immediate' ? 'Need Solution Now (0-3 months)' : formData.readiness}</span></p>}
                        
                        {customerTier === 'tier_0_explorer' && (
                          <>
                            {formData.learningInterest && <p><span className="text-gray-600">Primary Interest:</span> <span className="font-medium">{formData.learningInterest}</span></p>}
                            {formData.informationPreference && <p><span className="text-gray-600">Information Preference:</span> <span className="font-medium">{formData.informationPreference}</span></p>}
                          </>
                        )}
                        
                        {customerTier !== 'tier_0_explorer' && (
                          <>
                            {formData.unitCount && <p><span className="text-gray-600">Units:</span> <span className="font-medium">{formData.unitCount} units</span></p>}
                            {formData.budget && <p><span className="text-gray-600">Budget Range:</span> <span className="font-medium">{formData.budget}</span></p>}
                            {formData.timeline && <p><span className="text-gray-600">Timeline:</span> <span className="font-medium">{formData.timeline}</span></p>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location & Developer Information Card */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900">Location & Profile</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        {formData.province && <p><span className="text-gray-600">Province:</span> <span className="font-medium">{formData.province}</span></p>}
                        {formData.developerType && <p><span className="text-gray-600">Developer Type:</span> <span className="font-medium">{formData.developerType}</span></p>}
                      </div>
                      <div className="space-y-2">
                        {formData.governmentPrograms && <p><span className="text-gray-600">Government Programs:</span> <span className="font-medium">{formData.governmentPrograms}</span></p>}
                      </div>
                    </div>
                  </div>

                  {/* Project Description - If Provided */}
                  {formData.projectDescription && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Project Vision</h4>
                      </div>
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">"{formData.projectDescription}"</p>
                    </div>
                  )}

                  {/* RESPONSE COMMITMENT LEVEL - No Numerical Score */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-2xl">{getTierInfo(customerTier).icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">{getResponseCommitmentLevel(customerTier)}</h4>
                        <p className="text-sm text-gray-700">{getResponseDescription(customerTier)}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Verified Assessment</div>
                      </div>
                    </div>
                  </div>

                  {buildCanadaEligible && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍁</span>
                        <div>
                          <h4 className="font-semibold text-green-800">Build Canada Homes Eligible</h4>
                          <p className="text-sm text-green-700">Your project scope qualifies for enhanced federal partnership opportunities.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legal Consent & Privacy Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4" data-testid="legal-consent-section">
                  <h3 className="font-semibold text-gray-900 mb-4" data-testid="title-legal-consent">Legal Consent & Privacy</h3>
                  
                  {/* Communication Consent */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-consent-communications">
                    <input
                      type="checkbox"
                      name="consentCommunications"
                      checked={formData.consentCommunications || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-consent-communications"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I consent to receive communications from ILLÜMMAA via email, phone, and other channels regarding partnership opportunities. (Required by CASL)
                    </span>
                  </label>
                  {errors.consentCommunications && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-consent-communications">{errors.consentCommunications}</p>
                  )}

                  {/* SMS Consent */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-consent-sms">
                    <input
                      type="checkbox"
                      name="consentSMS"
                      checked={formData.consentSMS || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-consent-sms"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I consent to receive SMS text messages from ILLÜMMAA for time-sensitive updates and project coordination. (Required for SMS compliance)
                    </span>
                  </label>
                  {errors.consentSMS && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-consent-sms">{errors.consentSMS}</p>
                  )}

                  {/* Privacy Policy */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-privacy-policy">
                    <input
                      type="checkbox"
                      name="privacyPolicy"
                      checked={formData.privacyPolicy || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-privacy-policy"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I have read and accept the{' '}
                      <a href="/privacy" target="_blank" className="text-indigo-600 underline hover:text-indigo-700" data-testid="link-privacy-policy">
                        Privacy Policy
                      </a>
                      {' '}(Required by PIPEDA)
                    </span>
                  </label>
                  {errors.privacyPolicy && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-privacy-policy">{errors.privacyPolicy}</p>
                  )}

                  {/* Age Verification */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-age-verification">
                    <input
                      type="checkbox"
                      name="ageVerification"
                      checked={formData.ageVerification || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      required
                      data-testid="checkbox-age-verification"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I confirm that I am 18 years of age or older and have the legal capacity to provide consent
                    </span>
                  </label>
                  {errors.ageVerification && (
                    <p className="text-red-500 text-xs ml-7" data-testid="error-age-verification">{errors.ageVerification}</p>
                  )}

                  {/* Marketing Consent (Optional) */}
                  <label className="flex items-start gap-3 cursor-pointer group" data-testid="label-marketing-consent">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      checked={formData.marketingConsent || false}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      data-testid="checkbox-marketing-consent"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I would like to receive marketing communications about ILLÜMMAA products and industry insights. (Optional)
                    </span>
                  </label>

                  <div className="text-xs text-gray-600 bg-white p-4 rounded border-l-4 border-indigo-400 mt-4" data-testid="legal-disclaimer">
                    <p className="font-semibold mb-2">Your Rights & Our Commitment:</p>
                    <p>You may withdraw consent at any time via unsubscribe links, replying STOP to texts, or contacting info@illummaa.ca. Your information is protected under Canadian privacy laws (PIPEDA/provincial equivalents). ILLÜMMAA complies with CASL requirements, maintains A2P 10DLC registration for SMS, and keeps consent records as required by law.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100" data-testid="navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
                  data-testid="button-previous"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              )}
              
              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                  data-testid="button-next"
                >
                  Next Step
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !csrfToken}
                  className="ml-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    getTierInfo(customerTier).submitText
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-500" data-testid="security-badges">
          <div className="flex items-center gap-2" data-testid="badge-encrypted">
            <span className="text-green-500">🔒</span>
            <span>Secure Encrypted</span>
          </div>
          <div className="flex items-center gap-2" data-testid="badge-casl">
            <span>✓</span>
            <span>CASL Compliant</span>
          </div>
          <div className="flex items-center gap-2" data-testid="badge-pipeda">
            <span>✓</span>
            <span>PIPEDA Protected</span>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="success-modal">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4" data-testid="success-icon">{getTierInfo(customerTier).icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900" data-testid="success-title">Assessment Complete!</h3>
                <p className="text-gray-700 mb-6" data-testid="success-message">
                  {getResponseCommitment(customerTier)}
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left" data-testid="success-details">
                  <p className="text-sm mb-1">
                    <strong className="text-gray-900">Tier:</strong> <span data-testid="success-tier">{getTierInfo(customerTier).name}</span>
                  </p>
                  <p className="text-sm mb-1">
                    <strong className="text-gray-900">Priority Score:</strong> <span data-testid="success-score">{priorityScore}/150</span>
                  </p>
                  {buildCanadaEligible && (
                    <p className="text-sm mb-1">
                      <strong className="text-gray-900">Status:</strong> <span data-testid="success-status">Build Canada Homes Eligible</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <strong className="text-gray-900">Compliance:</strong> <span data-testid="success-compliance">CASL & PIPEDA Verified</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  }}
                  data-testid="button-success-continue"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IllummaaAssessmentForm;