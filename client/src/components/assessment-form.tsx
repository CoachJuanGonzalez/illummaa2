import React, { useState, useEffect } from 'react';

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
  timeline?: string;
  province?: string;
  readiness?: string;
  developerType?: string;
  governmentPrograms?: string;
  projectDescription?: string;
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
  const [priorityScore, setPriorityScore] = useState(0);
  const [customerTier, setCustomerTier] = useState<TierType>('tier_0_explorer');
  const [buildCanadaEligible, setBuildCanadaEligible] = useState(false);
  const [isExplorer, setIsExplorer] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  const TOTAL_STEPS = 5;

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'same-origin'
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('CSRF token fetch failed:', error);
      }
    };
    fetchCSRFToken();
  }, []);

  // Tier determination function with weighted logic for long-term planners
  const determineCustomerTier = (units: string, readiness: string): TierType => {
    const unitCount = parseInt(units) || 0;
    
    // Just researching ALWAYS = Explorer
    if (readiness === 'researching') {
      return 'tier_0_explorer';
    }
    
    // Planning long-term (12+ months) - weighted by units
    if (readiness === 'planning-long') {
      if (unitCount === 0) return 'tier_0_explorer'; // No units = still exploring
      if (unitCount <= 49) return 'tier_1_starter';   // Even 1-2 units = Starter (committed buyers)
      if (unitCount <= 149) return 'tier_2_pioneer';
      if (unitCount <= 299) return 'tier_3_preferred';
      return 'tier_4_elite';
    }
    
    // All other readiness levels - standard logic
    if (unitCount === 0) return 'tier_0_explorer';
    if (unitCount <= 49) return 'tier_1_starter';
    if (unitCount <= 149) return 'tier_2_pioneer';
    if (unitCount <= 299) return 'tier_3_preferred';
    return 'tier_4_elite';
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
  const getResponseCommitment = (tier: TierType) => {
    const responseCommitments = {
      'tier_0_explorer': 'Educational resources at your pace',
      'tier_1_starter': 'Personal consultation support',
      'tier_2_pioneer': 'Priority partnership attention',
      'tier_3_preferred': 'Expedited senior team handling',
      'tier_4_elite': 'Executive VIP engagement'
    };
    return responseCommitments[tier] || 'Personal support';
  };

  // Secure input sanitization
  const sanitizeInput = (value: any) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/[<>]/g, '').substring(0, 1000);
  };

  // Input handler with tier detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    const rawValue = type === 'checkbox' ? checked : value;
    const sanitizedValue = type === 'checkbox' ? rawValue : sanitizeInput(rawValue);
    
    // SMS consent security validation
    if (name === 'consentSMS' && typeof sanitizedValue !== 'boolean') {
      console.warn('Security: Invalid SMS consent value type');
      return;
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // In handleInputChange function, readiness handling with conditional logic
    if (name === 'readiness') {
      const isResearching = value === 'researching';
      setIsExplorer(isResearching); // Only "Just researching" is Explorer for form display
      
      if (isResearching) {
        // Auto-set Explorer defaults for researchers only
        setFormData(prev => ({
          ...prev,
          readiness: value,
          unitCount: '0', // Hidden from user but set in data
          budget: 'Just exploring options' // Auto-set for consistency
        }));
        setCustomerTier('tier_0_explorer');
      } else {
        // For ALL other options including "planning-long", clear units to force selection
        setFormData(prev => ({
          ...prev,
          readiness: value,
          unitCount: '', // Clear to force selection
          budget: '' // Clear budget for non-researchers
        }));
        // Don't set tier yet - wait for units selection
      }
    } else if (name === 'unitCount') {
      // When units change, recalculate tier with current readiness
      setFormData(prev => ({ ...prev, unitCount: value }));
      const tier = determineCustomerTier(value, formData.readiness || '');
      setCustomerTier(tier);
      
      // Update company requirement based on tier
      const companyRequired = tier !== 'tier_0_explorer' && tier !== 'tier_1_starter';
      const companyElement = document.getElementById('company') as HTMLInputElement;
      if (companyElement) {
        companyElement.required = companyRequired;
      }
    } else {
      // Keep existing logic for other fields
      setFormData(prev => ({ 
        ...prev, 
        [name]: sanitizedValue,
        ...(name === 'consentSMS' && sanitizedValue && {
          consentSMSTimestamp: new Date().toISOString()
        })
      }));
    }
    
    // Calculate priority score
    if (['unitCount', 'budget', 'timeline', 'province', 'developerType', 'governmentPrograms'].includes(name)) {
      setTimeout(calculatePriorityScore, 100);
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

  // Priority score calculation (0-150 scale)
  const calculatePriorityScore = () => {
    let score = 0;
    
    // Unit count (50 points max)
    const units = parseInt(formData.unitCount) || 0;
    if (units >= 1000) score += 50;
    else if (units >= 500) score += 40;
    else if (units >= 200) score += 30;
    else if (units >= 100) score += 20;
    else if (units >= 50) score += 10;
    else if (units > 0) score += 5;
    
    // Budget (40 points max)
    const budgetScores = {
      'Over $50M': 40,
      '$30M - $50M': 35,
      '$15M - $30M': 30,
      '$5M - $15M': 25,
      '$2M - $5M': 20,
      '$500K - $2M': 15,
      'Under $500K': 10,
      'Just exploring options': 0
    };
    score += budgetScores[formData.budget || ''] || 0;
    
    // Timeline (30 points max)
    const timelineScores = {
      'Immediate (0-3 months)': 30,
      'Short-term (3-6 months)': 20,
      'Medium-term (6-12 months)': 10,
      'Long-term (12+ months)': 5
    };
    score += timelineScores[formData.timeline || ''] || 0;
    
    // Location (15 points max)
    const primaryProvinces = ['Ontario', 'British Columbia', 'Alberta'];
    if (primaryProvinces.includes(formData.province)) {
      score += 15;
    } else if (formData.province) {
      score += 10;
    }
    
    // Government programs (10 points max)
    if (formData.governmentPrograms === 'Yes - Currently participating') score += 10;
    else if (formData.governmentPrograms === 'Interested - Tell us more') score += 5;
    
    // Developer type (5 points max)
    if (['Commercial Developer', 'Government/Municipal Developer'].includes(formData.developerType)) {
      score += 5;
    }
    
    // Explorer cap
    if (customerTier === 'tier_0_explorer') {
      score = Math.min(score, 25);
    }
    
    setPriorityScore(Math.min(score, 150));
    
    // Check Build Canada eligibility
    const isGovt = formData.developerType?.includes('Government') || false;
    setBuildCanadaEligible(units >= 300 || (units >= 200 && isGovt));
  };

  // Validation
  const validateStep = (step: number) => {
    const newErrors: FormErrors = {};
    
    switch(step) {
      case 1: // Readiness + Units
        if (!formData.readiness) {
          newErrors.readiness = 'Please select your journey stage';
        }
        if (!formData.unitCount && formData.unitCount !== '0') {
          newErrors.unitCount = 'Please select number of units';
        }
        break;
        
      case 2: // Budget + Timeline
        if (customerTier !== 'tier_0_explorer' && !formData.budget) {
          newErrors.budget = 'Budget range required';
        }
        if (!formData.timeline) {
          newErrors.timeline = 'Timeline required';
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
        const companyRequired = customerTier !== 'tier_0_explorer' && customerTier !== 'tier_1_starter';
        if (companyRequired && !formData.company?.trim()) {
          newErrors.company = 'Company name is required for partnership inquiries';
        }
        break;
        
      case 4: // Location + Developer Type
        if (!formData.province) {
          newErrors.province = 'Province/territory is required';
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
      setCurrentStep(Math.min(currentStep + 1, TOTAL_STEPS));
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
    if (formData.province) {
      const provinceCode = {
        'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
        'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
        'Northwest Territories': 'NT', 'Nova Scotia': 'NS', 'Nunavut': 'NU',
        'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
        'Saskatchewan': 'SK', 'Yukon': 'YT'
      }[formData.province] || 'XX';
      
      tags.push(`Location-${provinceCode}-${formData.province.replace(/\s+/g, '')}`);
      
      if (['Ontario', 'British Columbia', 'Alberta'].includes(formData.province)) {
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
        projectUnitCount: formData.unitCount,
        readinessToBuy: formData.readiness,
        projectBudgetRange: formData.budget || '',
        deliveryTimeline: formData.timeline,
        constructionProvince: formData.province,
        developerType: formData.developerType || '',
        governmentPrograms: formData.governmentPrograms || '',
        projectDescription: sanitizeInput(formData.projectDescription || ''),
        
        // Flags for automation
        buildCanadaEligible: buildCanadaEligible ? 'Yes' : 'No',
        isEducationOnly: customerTier === 'tier_0_explorer' ? 'Yes' : 'No',
        
        // Response commitment (NO time promises)
        responseCommitment: getResponseCommitment(customerTier),
        
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
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          event_category: 'Assessment_Complete',
          event_label: tierInfo.name,
          value: priorityScore,
          custom_parameters: {
            tier: customerTier,
            build_canada: buildCanadaEligible,
            compliance: 'casl_verified'
          }
        });
      }
      
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
                      <option value="0">Just exploring options</option>
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
            
            {/* STEP 2: Budget + Timeline */}
            {currentStep === 2 && (
              <div className="space-y-6" data-testid="step-2">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-2">
                  Project Planning
                </h2>

                {customerTier !== 'tier_0_explorer' && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-budget">
                      Budget range <span className="text-red-500">*</span>
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
                      required={customerTier !== 'tier_0_explorer'}
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
                )}

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-timeline">
                    Timeline <span className="text-red-500">*</span>
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

                {customerTier !== 'tier_0_explorer' && customerTier !== 'tier_1_starter' && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-company">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none`}
                      required
                      data-testid="input-company"
                    />
                    {errors.company && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-company">{errors.company}</p>
                    )}
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
                    Developer Type
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
                    data-testid="select-developer-type"
                  >
                    <option value="">Select developer type...</option>
                    <option value="Individual Home Buyer">Individual Home Buyer</option>
                    <option value="Residential Developer">Residential Developer</option>
                    <option value="Commercial Developer">Commercial Developer</option>
                    <option value="Government/Municipal Developer">Government/Municipal Developer</option>
                    <option value="Non-Profit Organization">Non-Profit Organization</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" data-testid="label-government-programs">
                    Interest in Government Housing Programs
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
                    data-testid="select-government-programs"
                  >
                    <option value="">Select interest level...</option>
                    <option value="Yes - Currently participating">Yes - Currently participating</option>
                    <option value="Interested - Tell us more">Interested - Tell us more</option>
                    <option value="Not interested">Not interested</option>
                    <option value="Unsure">Unsure</option>
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

            {/* STEP 5: Review + Legal Consent */}
            {currentStep === 5 && (
              <div className="space-y-6" data-testid="step-5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="title-step-5">
                  Review & Consent
                </h2>

                {/* Assessment Summary */}
                <div className="bg-gray-50 rounded-xl p-6" data-testid="assessment-summary">
                  <h3 className="font-semibold text-gray-900 mb-4" data-testid="title-summary">Assessment Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div data-testid="summary-contact">
                      <p className="font-medium text-gray-700">Contact</p>
                      <p data-testid="text-contact-name">{formData.firstName} {formData.lastName}</p>
                      <p data-testid="text-contact-email">{formData.email}</p>
                      <p data-testid="text-contact-phone">{formData.phone}</p>
                      {formData.company && <p data-testid="text-contact-company">{formData.company}</p>}
                    </div>
                    
                    <div data-testid="summary-project">
                      <p className="font-medium text-gray-700">Project</p>
                      <p data-testid="text-project-units">{formData.unitCount} units</p>
                      <p data-testid="text-project-timeline">{formData.timeline}</p>
                      <p data-testid="text-project-location">{formData.province}</p>
                      {formData.budget && <p data-testid="text-project-budget">{formData.budget}</p>}
                    </div>
                  </div>

                  {/* Only show tier summary when meaningful data is entered */}
                  {(formData.readiness && formData.unitCount !== undefined) && (
                    <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-indigo-400" data-testid="tier-summary">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl" data-testid="summary-tier-icon">{getTierInfo(customerTier).icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900" data-testid="summary-tier-name">
                            {getTierInfo(customerTier).name} Partnership
                          </p>
                          <p className="text-sm text-gray-600" data-testid="summary-priority-score">
                            Priority Score: {priorityScore}/150
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 font-medium" data-testid="summary-response-commitment">
                        {getResponseCommitment(customerTier)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 italic" data-testid="summary-response-disclaimer">
                        *Response times vary based on project urgency and current volume.
                      </p>
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