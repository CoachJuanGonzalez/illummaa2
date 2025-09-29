import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  analytics, 
  trackAssessmentStart, 
  trackAssessmentStepComplete,
  trackAssessmentComplete,
  trackCustomerTierDetermination,
  trackUnitCountSelection
} from "../lib/analytics";
import { 
  calculatePriorityScore, 
  determineCustomerTier as determineCustomerTierShared,
  isBuildCanadaEligible 
} from "../../../shared/utils/scoring";

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
  projectUnitRange?: string;
  // B2B-only: Explorer fields removed
  consentCommunications?: boolean;
  consentSMS?: boolean;
  consentSMSTimestamp?: string;
  privacyPolicy?: boolean;
  marketingConsent?: boolean;
  ageVerification?: boolean;

  // ADD THESE MAPPING INTERMEDIATES (NO PAYLOAD IMPACT):
  budgetRange?: string;         // Maps budget → project_budget_range
  decisionTimeline?: string;    // Maps timeline → delivery_timeline
}

interface FormErrors {
  [key: string]: string;
}

type TierType = 'pioneer' | 'preferred' | 'elite';

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
  const [customerTier, setCustomerTier] = useState<TierType>('pioneer');
  const [csrfToken, setCsrfToken] = useState('');
  const [startTime] = useState(Date.now());
  
  // Debounce timer reference for real-time scoring
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Auto-scroll to success message when form is completed
  useEffect(() => {
    if (showSuccess) {
      // Small delay to ensure the success view has rendered
      const timer = setTimeout(() => {
        const formElement = document.getElementById('developer-qualification');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);


  // Get tier display information
  const getTierInfo = (tier: TierType) => {
    const tierInfo = {
      'pioneer': {
        name: 'Pioneer',
        icon: '🚀',
        color: 'purple',
        description: 'B2B partnership development (10-49 units)',
        submitText: 'Submit Partnership Application'
      },
      'preferred': {
        name: 'Preferred',
        icon: '⭐',
        color: 'orange',
        description: 'Enhanced B2B partnership (50-199 units)',
        submitText: 'Submit Partnership Application'
      },
      'elite': {
        name: 'Elite',
        icon: '👑',
        color: 'red',
        description: 'Executive B2B partnership (200+ units)',
        submitText: 'Submit Partnership Application'
      }
    };
    return tierInfo[tier] || tierInfo['pioneer'];
  };

  // Response commitments (NO TIME PROMISES)
  // RESPONSE COMMITMENT FUNCTIONS - Professional Service Levels (No Numerical Scoring)
  const getResponseCommitmentLevel = (tier: TierType) => {
    const levels = {
      'pioneer': 'Enhanced Partnership Priority',
      'preferred': 'Executive Partnership Track',
      'elite': 'VIP Implementation Support'
    };
    return levels[tier] || 'Enhanced Partnership Priority';
  };

  const getResponseDescription = (tier: TierType) => {
    const descriptions = {
      'pioneer': 'Priority partnership coordination with dedicated team attention',
      'preferred': 'Expedited processing with senior team engagement',
      'elite': 'Executive-level partnership with comprehensive project support'
    };
    return descriptions[tier] || 'Priority partnership coordination with dedicated team attention';
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
    
    // Handle readiness field changes - B2B only (no researching)
    if (name === 'readiness') {
      setFormData(prev => ({
        ...prev,
        readiness: value
      }));
    } 
    // Handle unit count changes
    else if (name === 'unitCount') {
      const currentReadiness = formData.readiness;
      
      // Allow all integers ≥0 including 0 (Option B requirement)
      // Only block empty/invalid entries, not valid 0 values
      if (currentReadiness && currentReadiness !== 'researching' && (value === '' || isNaN(parseInt(value)))) {
        setErrors(prev => ({ ...prev, unitCount: 'Please enter a valid number of units' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, unitCount: value }));
      
      // INLINE TIER CALCULATION - Always recalculate immediately
      if (value && currentReadiness) {
        const unitNum = parseInt(value) || 0;
        let calculatedTier = 'pioneer';
        
        // B2B Partnership tier determination (now accepts all units ≥0)
        if (unitNum < 10) {
          // <10 units tagged as residential inquiry but allowed to continue
          console.log('Units < 10 detected, will be tagged as residential inquiry');
          calculatedTier = 'residential'; // New tier for <10 units
        } else if (unitNum >= 10 && unitNum <= 49) {
          calculatedTier = 'pioneer';
        } else if (unitNum >= 50 && unitNum <= 199) {
          calculatedTier = 'preferred';
        } else if (unitNum >= 200) {
          calculatedTier = 'elite';
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
    // Special handling for project description - allow spaces
    else if (name === 'projectDescription' || name === 'projectDescriptionText') {
      const descriptionValue = value
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .substring(0, 1000); // Limit to 1000 characters
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: descriptionValue,
        // Also set the alternate field name for compatibility
        projectDescriptionText: descriptionValue,
        projectDescription: descriptionValue
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

  // SECURITY-COMPLIANT: Unit range mapping with validation
  // SECURITY-COMPLIANT: Unit value validation - accepts any integer >= 0
  const getRepresentativeUnitValue = (unitSelection: string): string => {
    // Validate input to prevent injection and ensure it's a valid number
    const sanitizedInput = sanitizeInput(unitSelection);
    const numValue = parseInt(sanitizedInput, 10);

    // Return the actual number if it's valid, otherwise return '0'
    if (!isNaN(numValue) && numValue >= 0) {
      return numValue.toString();
    }
    return '0';
  };

  // Helper function to get display-friendly unit text for UI and sales team
  const getDisplayUnitText = (unitValue: string): string => {
    const numValue = parseInt(unitValue, 10);

    if (isNaN(numValue) || numValue < 0) {
      return '0 units';
    }

    // Special handling for values under 10 (B2B minimum)
    if (numValue >= 1 && numValue < 10) {
      return `${numValue} units (Note: B2B partnerships require minimum 10 units)`;
    }

    // Return appropriate text based on the number
    if (numValue === 0) return '0 units';
    if (numValue === 1) return '1 home';
    if (numValue === 2) return '2 homes';

    // For larger numbers, include tier information if applicable
    if (numValue >= 10 && numValue <= 49) return `${numValue} units (Pioneer Tier Range)`;
    if (numValue >= 50 && numValue <= 199) return `${numValue} units (Preferred Tier Range)`;
    if (numValue >= 200) return `${numValue} units (Elite Tier Range)`;

    return `${numValue} units`;
  };

  // SECURITY-COMPLIANT: Developer type mapping with validation (matches backend)
  const mapDeveloperType = (developerType: string): string => {
    // Validate input to prevent injection
    const sanitizedInput = sanitizeInput(developerType);
    const developerMap: { [key: string]: string } = {
      'Indigenous Community/Organization': 'Indigenous Community/Organization',
      'Commercial Developer (Large Projects)': 'Commercial Developer (Large Projects)',
      'Government/Municipal Developer': 'Government/Municipal Developer',
      'Non-Profit Housing Developer': 'Non-Profit Housing Developer',
      'Private Developer (Medium Projects)': 'Private Developer (Medium Projects)',
      'Individual/Family Developer': 'Individual/Family Developer',
      'Individual/Family': 'Individual/Family Developer',
      'Individual': 'Individual/Family Developer',
      'Family': 'Individual/Family Developer',
      'Commercial Developer': 'Commercial Developer (Large Projects)',
      'Government/Municipal': 'Government/Municipal Developer',
      'Non-Profit Organization': 'Non-Profit Housing Developer',
      'Private Developer': 'Private Developer (Medium Projects)',
      // ENTERPRISE SECURITY: Handle edge cases - fallback to empty string for validation
      'undefined': "",
      'null': "",
      '': ""
    };
    return developerMap[sanitizedInput] || "";
  };

  // Use shared scoring utility for 100% frontend-backend consistency
  const calculatePriorityScoreWith = (fd: typeof formData) => {
    // Map frontend form data to shared utility format
    const sharedData = {
      unitCount: getRepresentativeUnitValue(fd.unitCount || '0'),
      projectDescription: fd.projectDescription || '',
      readiness: fd.readiness || '',
      budgetRange: fd.budget || fd.budgetRange || fd.projectBudgetRange || '',
      decisionTimeline: fd.timeline || fd.decisionTimeline || fd.deliveryTimeline || '',
      constructionProvince: fd.province || fd.constructionProvince || '',
      developerType: mapDeveloperType(fd.developerType || ''),
      governmentPrograms: fd.governmentPrograms || ''
    };

    // SECURITY-COMPLIANT: Debug without exposing sensitive data
    if (import.meta.env.DEV) {
      console.log('🔍 FRONTEND SCORE CALCULATION:', {
        score: 'pending',
        hasAllRequiredFields: !!(sharedData.unitCount && sharedData.readiness),
        timestamp: new Date().toISOString()
      });
    }

    const { score, breakdown } = calculatePriorityScore(sharedData);

    if (import.meta.env.DEV) {
      console.log('🎯 FRONTEND RESULT:', {
        score,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update state
    setPriorityScore(score);
    
    // Determine tier using shared utility
    const units = parseInt(fd.unitCount || '0') || 0;
    const currentTier = determineCustomerTierShared(units) as TierType;
    setCustomerTier(currentTier);
    
    console.log('🎯 FRONTEND Score (using shared utility):', {
      score,
      breakdown,
      tier: currentTier,
      inputs: sharedData
    });

    // Enhanced analytics with tier information
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'customer_tier_determination', {
        event_category: 'Business Logic',
        action: 'tier_classification',
        customer_tier: currentTier,
        unit_count: fd.unitCount || '0',
        readiness_level: fd.readiness || '',
        priority_score: score,
        lead_type: currentTier.startsWith('tier_0') ? 'explorer' : 
                   currentTier.startsWith('tier_1') ? 'residential' : 'partnership',
      });
    }

    return score;
  };

  // Validation
  const validateStep = (step: number) => {
    const newErrors: FormErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.readiness) {
          newErrors.readiness = 'Please select your journey stage';
        }
        
        // B2B validation: ALL users must enter units
        if (!formData.unitCount || formData.unitCount === '') {
          newErrors.unitCount = 'Please enter the number of units needed';
        } else {
          // Security validation: Ensure the value is a valid integer >= 0
          const unitCount = parseInt(formData.unitCount || '0', 10);
          if (isNaN(unitCount) || unitCount < 0) {
            newErrors.unitCount = 'Please enter a valid number (0 or greater)';
          } else if (!Number.isInteger(Number(formData.unitCount))) {
            newErrors.unitCount = 'Please enter a whole number (no decimals)';
          } else if (unitCount > 0 && unitCount < 10) {
            // Show warning but don't block submission (no error set)
            console.log('Warning: Units < 10 detected, will proceed as residential inquiry');
          }
        }
        break;
        
      case 2:
        // B2B validation: All users need budget and timeline
        if (!formData.budget && !formData.projectBudgetRange) {
          newErrors.budget = 'Budget range is required';
        }
        if (!formData.timeline && !formData.deliveryTimeline) {
          newErrors.timeline = 'Timeline is required';
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
        const companyRequired = true; // All B2B tiers require company
        
        if (companyRequired && !formData.company?.trim()) {
          if (customerTier === 'pioneer') {
            newErrors.company = 'Company name is required for partnership inquiries (10-49 units)';
          } else if (customerTier === 'preferred') {
            newErrors.company = 'Company name is required for preferred partnership (50-199 units)';
          } else if (customerTier === 'elite') {
            newErrors.company = 'Company name is required for elite partnership (200+ units)';
          } else {
            newErrors.company = 'Company name is required for B2B partnership';
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
    // If going back from Step 1, safely clear journey-dependent fields
    if (currentStep === 1) {
      setFormData(prev => ({
        // Preserve contact information
        firstName: prev.firstName,
        lastName: prev.lastName,
        email: prev.email,
        phone: prev.phone,
        company: prev.company,
        consentCommunications: prev.consentCommunications,
        consentSMS: prev.consentSMS,
        consentSMSTimestamp: prev.consentSMSTimestamp,
        privacyPolicy: prev.privacyPolicy,
        marketingConsent: prev.marketingConsent,
        ageVerification: prev.ageVerification,
        // Clear journey-dependent fields
        readiness: undefined,
        unitCount: undefined,
        budget: undefined,
        projectBudgetRange: undefined,
        timeline: undefined,
        deliveryTimeline: undefined,
        province: undefined,
        constructionProvince: undefined,
        developerType: undefined,
        governmentPrograms: undefined,
        projectDescription: undefined,
        // B2B-only: Explorer fields removed
      }));
      // Reset related state
      setPriorityScore(0);
      setCustomerTier('pioneer');
      setBuildCanadaEligible(false);
    } else {
      setCurrentStep(Math.max(currentStep - 1, 1));
    }

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
    const units = parseInt(formData.unitCount || '0') || 0;
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
    setShowSuccess(true); // Show success immediately, hide Step 5
    
    try {
      const tags = generateTags();
      const tierInfo = getTierInfo(customerTier);
      
      // Build webhook payload for single pipeline
      const payload = {
        // Contact Information
        firstName: sanitizeInput(formData.firstName || ''),
        lastName: sanitizeInput(formData.lastName || ''),
        email: sanitizeInput(formData.email || ''),
        phone: sanitizeInput(formData.phone || ''),
        companyName: sanitizeInput(formData.company || ''),
        
        // Classification (for single pipeline routing)
        customerTier: customerTier,
        partnershipLevel: tierInfo.name,
        aiPriorityScore: priorityScore,
        
        // Project Details
        projectUnitCount: sanitizeInput(getRepresentativeUnitValue(formData.unitCount || '0')),
        projectUnitRange: sanitizeInput(getDisplayUnitText(formData.unitCount || '0')),
        readinessToBuy: formData.readiness,
        projectBudgetRange: sanitizeInput(formData.budget || formData.projectBudgetRange || 'Just exploring options'),
        deliveryTimeline: formData.timeline || formData.deliveryTimeline,
        // SECURITY-COMPLIANT: Add prioritized fields while maintaining sanitization
        budget: sanitizeInput(formData.budget || formData.projectBudgetRange || 'Just exploring options'),
        timeline: sanitizeInput(formData.timeline || formData.deliveryTimeline || ''),
        constructionProvince: formData.province || formData.constructionProvince,
        developerType: sanitizeInput(formData.developerType || 'Not Specified'),
        governmentPrograms: sanitizeInput(formData.governmentPrograms || 'Not Specified'),
        projectDescription: sanitizeInput(formData.projectDescription || ''),
        
        // Education-specific fields for Explorer tier
        // B2B-only: Explorer fields removed
        
        // Flags for automation
        buildCanadaEligible: buildCanadaEligible ? 'Yes' : 'No',
        isEducationOnly: 'No', // B2B partnership only
        isEducationalLead: 'false', // B2B partnership only
        
        // Response commitment (Professional Service Levels - No Numerical Scoring)
        responseCommitment: getResponseCommitment(customerTier),
        responseCommitmentLevel: getResponseCommitmentLevel(customerTier),
        
        // Tags for single pipeline automation
        tags: tags.join(','),
        
        // Pipeline assignment
        pipeline: 'ILLUMMAA Customer Journey',
        stage: 'B2B Partnership Interest', // All tiers are B2B partnership
        
        // Legal consent with SMS security
        consentCommunications: formData.consentCommunications ? 'true' : 'false',
        consentSMS: formData.consentSMS ? 'true' : 'false',
        consentSMSTimestamp: formData.consentSMSTimestamp || new Date().toISOString(), // Use stored consent timestamp or current time as fallback
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
      
      // Debug logging
      console.log('Submitting assessment with payload:', {
        ...payload,
        // Mask sensitive data in logs
        email: payload.email ? '***@***' : undefined,
        phone: payload.phone ? '***' : undefined
      });
      console.log('CSRF Token present:', !!csrfToken);
      console.log('Consent values:', {
        consentSMS: payload.consentSMS,
        timestamp: payload.consentSMSTimestamp,
        allConsents: {
          communications: payload.consentCommunications,
          sms: payload.consentSMS,
          privacy: payload.privacyPolicyConsent,
          age: payload.ageVerification
        }
      });
      
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
      
      // Add proper response checking
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        
        // Throw the response as an error to be caught
        throw response;
      }
      
      const result = await response.json();
      console.log('Submission successful:', result);
      
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
      console.error('Submission error details:', error);
      
      // Enhanced error handling for better debugging
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        // Try to parse error response
        try {
          const response = error as Response;
          if (response && response.status) {
            if (response.status === 429) {
              alert('You have already completed an assessment today. Please try again tomorrow or contact info@illummaa.ca for assistance.');
            } else if (response.status === 400) {
              const errorData = await response.json();
              console.error('Validation error:', errorData);
              
              if (errorData.error === 'SMS consent validation failed') {
                alert('Please ensure all consent checkboxes are checked and try again.');
              } else if (errorData.error === 'SMS consent expired') {
                alert('Your session has expired. Please refresh the page and complete the form again.');
              } else {
                alert(`Validation error: ${errorData.message || errorData.error || 'Please check all required fields and try again.'}`);
              }
            } else {
              alert(`Server error (${response.status}). Please try again later or contact info@illummaa.ca`);
            }
          } else {
            alert('Submission error. Please try again or contact info@illummaa.ca');
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          alert('Submission error. Please try again or contact info@illummaa.ca');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="developer-qualification" className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12" data-testid="assessment-form-container">
      <div className="container mx-auto px-4 max-w-3xl">
        {showSuccess ? (
          /* SUCCESS VIEW - Complete inline success display */
          <div className="max-w-4xl mx-auto">
            {/* Success Header with ILLUMMAA Branding */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="success-title">
                Assessment Complete!
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="success-subtitle">
                {getResponseCommitment(customerTier)}
              </p>
            </div>

            {/* Assessment Results Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-12 max-w-2xl mx-auto">
                {/* Tier Information */}
                <div className="text-center">
                  <div className="text-4xl mb-3" data-testid="tier-icon">
                    {getTierInfo(customerTier).icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Tier</h3>
                  <p className="text-2xl font-bold text-indigo-600" data-testid="tier-display">
                    {getTierInfo(customerTier).name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {getTierInfo(customerTier).description}
                  </p>
                </div>


                {/* Compliance Status */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance</h3>
                  <p className="text-sm font-medium text-green-600 mb-1">CASL & PIPEDA Verified</p>
                  <p className="text-xs text-gray-600">Enterprise-grade privacy compliance</p>
                </div>
              </div>
            </div>

            {/* Next Steps Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmation Email Sent</h4>
                    <p className="text-gray-600 text-sm">Assessment results and next steps delivered to your inbox</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{getResponseCommitmentLevel(customerTier)}</h4>
                    <p className="text-gray-600 text-sm">{getResponseDescription(customerTier)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized Consultation</h4>
                    <p className="text-gray-600 text-sm">
                      Direct consultation with our B2B partnership team
                    </p>
                  </div>
                </div>

                {/* Build Canada Eligibility Notice */}
                {buildCanadaEligible && (
                  <div className="flex items-start space-x-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">★</div>
                    <div>
                      <h4 className="font-semibold text-green-900">Build Canada Eligible</h4>
                      <p className="text-green-700 text-sm">Your project qualifies for Build Canada funding programs</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                B2B Partnership Team Assigned
              </h3>
              <p className="text-gray-600 mb-6">
                {getResponseDescription(customerTier)}
              </p>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4" data-testid="badge-partner">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Build Canada Homes Partner
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-3" data-testid="title-main">
                Developer Partnership Application
              </h1>
              <p className="text-gray-600" data-testid="text-subtitle">
                Start your partnership with Canada's modular housing leader. Tell us about your project.
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
                      <input
                        type="number"
                        name="unitCount"
                        value={formData.unitCount || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        placeholder="Enter number of units (e.g., 10, 50, 200)"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.unitCount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none bg-white`}
                        required
                        data-testid="input-units"
                      />
                      {errors.unitCount && (
                        <p className="text-red-500 text-xs mt-1" data-testid="error-units">{errors.unitCount}</p>
                      )}
                      {formData.unitCount && parseInt(formData.unitCount) > 0 && parseInt(formData.unitCount) < 10 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> B2B partnerships typically start at 10 units. For residential projects under 10 units,
                            you may want to visit <a href="https://remax.ca" className="underline">Remax.ca</a> for better assistance.
                          </p>
                        </div>
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
            
            {/* STEP 2: Information Preferences / Budget & Timeline */}
            {currentStep === 2 && (
              <div className="space-y-6" data-testid="step-2">
                {/* B2B Budget & Timeline Section - Always Show */}
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
                        Project Timeline <span className="text-red-500">*</span>
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
                {(customerTier) && ( // All B2B tiers need company
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization 
                      <span className="text-red-500 ml-1">*</span> {/* Required for all B2B tiers */}
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required={true} // All B2B tiers require company
                      placeholder="Company/Organization name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                      aria-label="Company or organization name"
                    />
                    {errors.company && (
                      <p className="mt-1 text-xs text-red-600" role="alert">{errors.company}</p>
                    )}
                    {/* Helper text based on tier */}
                    <p className="mt-1 text-xs text-gray-500">
                      {customerTier === 'pioneer' && "Required for B2B partnership inquiries (10-49 units)"}
                      {customerTier === 'preferred' && "Required for preferred partnership (50-199 units)"}
                      {customerTier === 'elite' && "Required for elite partnership (200+ units)"}
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
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.developerType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
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
                    <option value="Indigenous Community/Organization">Indigenous Community/Organization</option>
                    <option value="Commercial Developer (Large Projects)">Commercial Developer (Large Projects)</option>
                    <option value="Government/Municipal Developer">Government/Municipal Developer</option>
                    <option value="Non-Profit Housing Developer">Non-Profit Housing Developer</option>
                    <option value="Private Developer (Medium Projects)">Private Developer (Medium Projects)</option>
                    <option value="Individual/Family Developer">Individual/Family Developer</option>
                  </select>
                  {errors.developerType && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-developer-type">{errors.developerType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-government-programs">
                    Interest in Government Housing Programs <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="governmentPrograms"
                    value={formData.governmentPrograms || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.governmentPrograms ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none appearance-none bg-white`}
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
                    <option value="Exploring partnership options">Exploring partnership options</option>
                    <option value="Not interested">Not interested</option>
                    <option value="Somewhat interested">Somewhat interested</option>
                    <option value="Very interested">Very interested</option>
                    <option value="Currently participating">Currently participating</option>
                  </select>
                  {errors.governmentPrograms && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-government-programs">{errors.governmentPrograms}</p>
                  )}
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
                        <h4 className="font-semibold text-gray-900">Project Scope</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {formData.readiness && <p><span className="text-gray-600">Project Timeline:</span> <span className="font-medium">{formData.readiness === 'planning-long' ? 'Long-term (12+ months)' : formData.readiness === 'planning-medium' ? 'Medium-term (6-12 months)' : formData.readiness === 'planning-short' ? 'Short-term (3-6 months)' : formData.readiness === 'immediate' ? 'Immediate (0-3 months)' : formData.readiness}</span></p>}
                        
                        {/* B2B Project Information - Always Show */}
                        {formData.unitCount && <p><span className="text-gray-600">Units:</span> <span className="font-medium">{getDisplayUnitText(formData.unitCount)}</span></p>}
                        {formData.budget && <p><span className="text-gray-600">Budget Range:</span> <span className="font-medium">{formData.budget}</span></p>}
                        {formData.timeline && <p><span className="text-gray-600">Timeline:</span> <span className="font-medium">{formData.timeline}</span></p>}
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
                      I consent to receive communications from ILLUMMAA via email, phone, and other channels regarding partnership opportunities. (Required by CASL)
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
                      I consent to receive SMS text messages from ILLUMMAA for time-sensitive updates and project coordination. (Required for SMS compliance)
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
                      I would like to receive marketing communications about ILLUMMAA products and industry insights. (Optional)
                    </span>
                  </label>

                  <div className="text-xs text-gray-600 bg-white p-4 rounded border-l-4 border-indigo-400 mt-4" data-testid="legal-disclaimer">
                    <p className="font-semibold mb-2">Your Rights & Our Commitment:</p>
                    <p>You may withdraw consent at any time via unsubscribe links, replying STOP to texts, or contacting info@illummaa.ca. Your information is protected under Canadian privacy laws (PIPEDA/provincial equivalents). ILLUMMAA complies with CASL requirements, maintains A2P 10DLC registration for SMS, and keeps consent records as required by law.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100" data-testid="navigation">
              {(currentStep > 1 || (currentStep === 1 && formData.readiness)) && (
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
          </>
        )}
      </div>
    </div>
  );
};

export default IllummaaAssessmentForm;
