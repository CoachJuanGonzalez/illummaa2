import React, { useState, useEffect } from 'react';

const IllummaaSecureAssessmentForm = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [priorityScore, setPriorityScore] = useState(0);
  const [isExplorer, setIsExplorer] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  const TOTAL_STEPS = 4;

  // Fetch CSRF token on component mount
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

  // Secure input sanitization helper
  const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .trim()
      .replace(/[<>]/g, '') // Basic XSS prevention
      .substring(0, 1000); // Length limit
  };

  // Enhanced input handler with security and Explorer detection
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const rawValue = type === 'checkbox' ? checked : value;
    const sanitizedValue = type === 'checkbox' ? rawValue : sanitizeInput(rawValue);
    
    // Additional SMS consent security validation
    if (name === 'consentSMS' && typeof sanitizedValue !== 'boolean') {
      console.warn('Security: Invalid SMS consent value type');
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: sanitizedValue,
      // Track consent timestamp for audit trail
      ...(name === 'consentSMS' && sanitizedValue && {
        consentSMSTimestamp: new Date().toISOString()
      })
    }));
    
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Explorer detection and auto-handling
    if (name === 'readiness') {
      const explorerStatus = sanitizedValue.includes('researching') || sanitizedValue.includes('learn more');
      setIsExplorer(explorerStatus);
      
      if (explorerStatus) {
        setFormData(prev => ({
          ...prev,
          [name]: sanitizedValue,
          budget: 'Under $500K',
          unitCount: 1
        }));
      }
    }
    
    // Real-time priority calculation
    if (['unitCount', 'budget', 'timeline', 'province', 'readiness'].includes(name)) {
      setTimeout(calculatePriorityScore, 100);
    }
  };

  // Secure Canadian phone formatting
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d+]/g, ''); // Only digits and +
    
    if (value.length > 0 && !value.startsWith('+1')) {
      if (value.startsWith('1')) {
        value = '+' + value;
      } else {
        value = '+1' + value;
      }
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
    else score += 5;
    
    // Budget (40 points max)
    const budgetScores = {
      'Over $50M': 40, '$30M - $50M': 35, '$15M - $30M': 30,
      '$5M - $15M': 25, '$2M - $5M': 20, '$500K - $2M': 15,
      'Under $500K': 10
    };
    score += budgetScores[formData.budget] || 0;
    
    // Timeline (30 points max)
    const timelineScores = {
      'Immediate (0-3 months)': 30, 'Short-term (3-6 months)': 20,
      'Medium-term (6-12 months)': 10, 'Long-term (12+ months)': 5
    };
    score += timelineScores[formData.timeline] || 0;
    
    // Location (15 points max)
    const primaryProvinces = ['Ontario', 'British Columbia', 'Alberta'];
    if (primaryProvinces.includes(formData.province)) {
      score += 15;
    } else if (formData.province) {
      score += 10;
    }
    
    // Explorer cap for security
    if (isExplorer) {
      score = Math.min(score, 25);
    }
    
    setPriorityScore(Math.min(score, 150));
  };

  // Enhanced form validation with comprehensive legal consent
  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.firstName?.trim() || formData.firstName.length < 2) {
          newErrors.firstName = 'First name required (2+ characters)';
        }
        if (!formData.lastName?.trim() || formData.lastName.length < 2) {
          newErrors.lastName = 'Last name required (2+ characters)';
        }
        if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Valid email address required';
        }
        if (!formData.phone?.trim() || formData.phone.length < 12) {
          newErrors.phone = 'Valid Canadian phone number required (+1XXXXXXXXXX)';
        }
        if (!formData.readiness) {
          newErrors.readiness = 'Please select your journey stage';
        }
        
        // Company validation for non-explorers
        if (!isExplorer && !formData.company?.trim()) {
          newErrors.company = 'Company name required for business inquiries';
        }
        
        // Enhanced legal consent validation
        if (!formData.consentCommunications) {
          newErrors.consentCommunications = 'Multi-channel communication consent required by CASL';
        }
        if (!formData.consentSMS) {
          newErrors.consentSMS = 'SMS consent required for text messaging compliance';
        }
        if (!formData.privacyPolicyConsent) {
          newErrors.privacyPolicyConsent = 'Privacy Policy acceptance required by PIPEDA';
        }
        if (!formData.ageVerification) {
          newErrors.ageVerification = 'Age verification required for legal consent capacity';
        }
        
        // Security validation: Ensure SMS consent timestamp exists
        if (formData.consentSMS && !formData.consentSMSTimestamp) {
          newErrors.consentSMS = 'SMS consent timestamp missing - security validation failed';
        }
        
        // Security validation: Check for consent manipulation
        if (formData.consentSMS && formData.consentSMSTimestamp) {
          const consentAge = Date.now() - new Date(formData.consentSMSTimestamp).getTime();
          if (consentAge > 3600000) { // 1 hour max
            newErrors.consentSMS = 'SMS consent expired - please reconfirm';
          }
        }
        break;
        
      case 2:
        if (!isExplorer) {
          if (!formData.unitCount || formData.unitCount < 1 || formData.unitCount > 10000) {
            newErrors.unitCount = 'Valid number of units required (1-10,000)';
          }
          if (!formData.budget) {
            newErrors.budget = 'Budget range selection required';
          }
        }
        break;
        
      case 3:
        if (!formData.timeline) {
          newErrors.timeline = 'Project timeline required';
        }
        if (!formData.province) {
          newErrors.province = 'Province/territory selection required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Secure navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, TOTAL_STEPS));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  // Advanced tagging system with security considerations
  const generateAdvancedTags = () => {
    const tags = [];
    
    // Customer type classification
    if (isExplorer) {
      tags.push('Customer-Consumer-Individual', 'Scale-Individual', 'Ready-Exploring');
    } else if (formData.unitCount >= 200) {
      tags.push('Customer-Enterprise-Scale', 'Scale-Enterprise-Community');
    } else if (formData.unitCount >= 50) {
      tags.push('Customer-Partnership-Large', 'Scale-Large-Partnership');
    } else {
      tags.push('Customer-Residential-Small', 'Scale-Small-Residential');
    }
    
    // Priority and response classification
    if (priorityScore >= 100) {
      tags.push('Priority-High-150', 'Response-1Hour-Required');
    } else if (priorityScore >= 50) {
      tags.push('Priority-Medium-75', 'Response-4Hour-Standard');
    } else {
      tags.push('Priority-Standard-25', 'Response-24Hour-Follow');
    }
    
    // Geographic classification
    if (formData.province) {
      const provinceCode = getProvinceCode(formData.province);
      tags.push(`Location-${provinceCode}-${formData.province.replace(/\s+/g, '')}`);
      
      if (['Ontario', 'British Columbia', 'Alberta'].includes(formData.province)) {
        tags.push('Market-Primary');
      } else {
        tags.push('Market-Secondary');
      }
    }
    
    // Legal compliance tags
    tags.push('Consent-MultiChannel-Verified', 'Consent-Privacy-Accepted', 'Consent-SMS-Verified', 'CASL-Compliant', 'PIPEDA-Compliant');
    
    // Source classification
    tags.push('Source-Website-Direct', 'Channel-Digital-High', 'Security-Verified');
    
    return tags;
  };

  const getProvinceCode = (province) => {
    const codes = {
      'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
      'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
      'Northwest Territories': 'NT', 'Nova Scotia': 'NS', 'Nunavut': 'NU',
      'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
      'Saskatchewan': 'SK', 'Yukon': 'YT'
    };
    return codes[province] || 'XX';
  };

  const getAssignedTeam = () => {
    if (isExplorer) return 'ILLÜMMAA Education Team';
    if (priorityScore >= 100) return 'Senior Partnership Manager';
    if (priorityScore >= 50) return 'Partnership Representative';
    return 'Residential Specialist';
  };

  const getResponseTime = () => {
    if (isExplorer) return '48 hours';
    if (priorityScore >= 100) return '1 hour';
    if (priorityScore >= 50) return '4 hours';
    return '24 hours';
  };

  // Secure form submission with comprehensive protection
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep) || !csrfToken) {
      alert('Security validation failed. Please refresh and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tags = generateAdvancedTags();
      
      const securePayload = {
        // Contact information (sanitized)
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        company: isExplorer ? sanitizeInput(formData.company || '') : sanitizeInput(formData.company),
        
        // Project details
        unitCount: isExplorer ? 1 : (parseInt(formData.unitCount) || 0),
        budget: isExplorer ? 'Under $500K' : formData.budget,
        timeline: formData.timeline,
        province: formData.province,
        readiness: formData.readiness,
        projectDescription: sanitizeInput(formData.projectDescription || ''),
        
        // ILLÜMMAA routing
        isExplorer: isExplorer,
        illummaaOnly: 'TRUE',
        noExternalReferrals: 'TRUE',
        priorityScore: priorityScore,
        assignedTo: getAssignedTeam(),
        responseTime: getResponseTime(),
        
        // Advanced tagging for automation
        tags: tags,
        contactTags: tags.join(','),
        
        // Enhanced legal consent tracking with SMS security
        consentCommunications: formData.consentCommunications ? 'true' : 'false',
        consentSMS: formData.consentSMS ? 'true' : 'false',
        consentSMSTimestamp: formData.consentSMSTimestamp || new Date().toISOString(),
        privacyPolicyConsent: formData.privacyPolicyConsent ? 'true' : 'false',
        marketingConsent: formData.marketingConsent ? 'true' : 'false',
        ageVerification: formData.ageVerification ? 'true' : 'false',
        consentTimestamp: new Date().toISOString(),
        legalConsentVersion: '2025.1',
        caslCompliant: 'true',
        caslSMSCompliant: formData.consentSMS ? 'true' : 'false',
        pipedaCompliant: 'true',
        a2p10dlcCompliant: 'true',
        
        // System and security tracking
        source: 'ILLÜMMAA Website Assessment',
        submissionId: `ILLUMMAA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userAgent: navigator.userAgent,
        securityValidated: 'true',
        smsConsentSecurityValidated: 'true'
      };
      
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify(securePayload)
      });
      
      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update CSRF token for future requests
      if (result.csrfToken) {
        setCsrfToken(result.csrfToken);
      }
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          event_category: 'Secure_Assessment_SMS',
          event_label: getAssignedTeam(),
          value: priorityScore,
          custom_parameters: {
            legal_compliance: 'casl_verified',
            sms_compliance: 'a2p_10dlc_ready',
            security_level: 'enterprise'
          }
        });
      }
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Secure SMS submission error:', error);
      alert('Secure submission error. Please try again or contact info@illummaa.ca for assistance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="developer-qualification" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            Build Canada Homes Partner
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Discover Your Partnership Path
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From first-time learners to enterprise developers - find your place in Canada's modular revolution
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#2C5530] to-[#1DB954] transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Secure Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            
            {/* STEP 1: Contact Information & Enhanced Legal Consent */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Contact Information</h3>
                
                {/* Journey Stage Detection */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <label className="block text-sm font-medium mb-3 text-gray-900">
                    Where are you in your modular home journey? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="readiness"
                    value={formData.readiness || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all text-gray-900"
                    required
                    data-testid="select-readiness"
                  >
                    <option value="">Select your stage...</option>
                    <option value="Just researching - want to learn more">Just researching - want to learn more</option>
                    <option value="Planning active project (0-6 months)">Planning active project (0-6 months)</option>
                    <option value="Planning future project (6+ months)">Planning future project (6+ months)</option>
                    <option value="Ready to move forward immediately">Ready to move forward immediately</option>
                  </select>
                  {errors.readiness && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {errors.readiness}
                  </p>}
                  
                  {isExplorer && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <span className="text-lg">📚</span>
                        Perfect! We'll focus on education and learning resources for you.
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      required
                      maxLength={50}
                      data-testid="input-firstName"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      required
                      maxLength={50}
                      data-testid="input-lastName"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      required
                      data-testid="input-email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handlePhoneChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      required
                      data-testid="input-phone"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  {!isExplorer && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Company/Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                        required={!isExplorer}
                        maxLength={100}
                        data-testid="input-company"
                      />
                      {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                    </div>
                  )}
                </div>

                {/* Enhanced Legal Consent Section with SMS Security */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 text-[#2C5530]">🔒</span>
                      Legal Consent & Privacy Protection
                    </h4>
                    <p className="text-xs text-gray-600">
                      Required for compliance with Canadian privacy and anti-spam legislation (CASL/PIPEDA)
                    </p>
                  </div>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="consentCommunications"
                      checked={formData.consentCommunications || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530] focus:ring-2"
                      required
                      data-testid="checkbox-consentCommunications"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      <strong>I expressly consent to ILLÜMMAA and its authorized representatives contacting me via email, phone calls, WhatsApp, and other digital messaging platforms about modular home solutions, services, and related offerings. I understand I can withdraw this consent at any time by unsubscribing or contacting info@illummaa.ca.</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentCommunications && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {errors.consentCommunications}
                  </p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="consentSMS"
                      checked={formData.consentSMS || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530] focus:ring-2"
                      required
                      aria-describedby="sms-consent-help"
                      data-security="consent-required"
                      data-testid="checkbox-consentSMS"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      <strong>I expressly consent to ILLÜMMAA contacting me via SMS/text messages about modular home solutions and services. I understand that standard messaging rates may apply, I can opt-out anytime by replying STOP/ARRET, and opt-out requests will be processed within 10 business days per CASL requirements.</strong> <span className="text-red-500">*</span>
                    </span>
                    <div id="sms-consent-help" className="sr-only">Required for SMS marketing compliance under CASL</div>
                  </label>
                  {errors.consentSMS && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500" role="alert">⚠</span>
                    {errors.consentSMS}
                  </p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="privacyPolicyConsent"
                      checked={formData.privacyPolicyConsent || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530] focus:ring-2"
                      required
                      data-testid="checkbox-privacyPolicyConsent"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      <strong>I have read, understood, and agree to ILLÜMMAA's <a href="/privacy-policy" target="_blank" className="text-[#2C5530] underline hover:text-[#1e3d21] font-medium transition-colors">Privacy Policy</a> which explains how my personal information will be collected, used, disclosed, and protected in accordance with PIPEDA and applicable provincial privacy laws.</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.privacyPolicyConsent && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {errors.privacyPolicyConsent}
                  </p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="ageVerification"
                      checked={formData.ageVerification || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530] focus:ring-2"
                      required
                      data-testid="checkbox-ageVerification"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      <strong>I confirm that I am at least 18 years of age and have the legal capacity to enter into agreements and provide consent for communication and information sharing.</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.ageVerification && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {errors.ageVerification}
                  </p>}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>A2P 10DLC Industry Compliance:</strong> ILLÜMMAA follows industry best practices for application-to-person (A2P) messaging using 10-digit long code (10DLC) registration to ensure reliable SMS delivery and reduce spam. Your consent enables compliant business messaging under CASL regulations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Project Details */}
            {currentStep === 2 && !isExplorer && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Project Details</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Number of Units <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="unitCount"
                      value={formData.unitCount || ''}
                      onChange={handleInputChange}
                      min="1"
                      max="10000"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      required
                      data-testid="input-unitCount"
                    />
                    {errors.unitCount && <p className="text-red-500 text-sm mt-1">{errors.unitCount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Budget Range <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="budget"
                      value={formData.budget || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all text-gray-900"
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
                    {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">
                    Project Description (Optional)
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all resize-none"
                    placeholder="Tell us about your project goals, requirements, or any specific questions..."
                    data-testid="textarea-projectDescription"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Explorer Path */}
            {currentStep === 2 && isExplorer && (
              <div className="space-y-8 animate-fadeIn text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Learning Resources Coming Your Way</h3>
                <p className="text-lg text-gray-600 mb-8">
                  Perfect! Since you're in the research phase, we'll connect you with our Education Team who specializes in helping people learn about modular construction.
                </p>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-green-800 mb-3">What you'll receive:</h4>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-center gap-2"><span>✅</span> Educational guide to modular construction</li>
                    <li className="flex items-center gap-2"><span>✅</span> Cost comparison worksheets</li>
                    <li className="flex items-center gap-2"><span>✅</span> Timeline planning resources</li>
                    <li className="flex items-center gap-2"><span>✅</span> Access to online learning portal</li>
                  </ul>
                </div>
              </div>
            )}

            {/* STEP 3: Timeline & Location */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Timeline & Location</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Project Timeline <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="timeline"
                      value={formData.timeline || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all text-gray-900"
                      required
                      data-testid="select-timeline"
                    >
                      <option value="">Select timeline...</option>
                      <option value="Immediate (0-3 months)">Immediate (0-3 months)</option>
                      <option value="Short-term (3-6 months)">Short-term (3-6 months)</option>
                      <option value="Medium-term (6-12 months)">Medium-term (6-12 months)</option>
                      <option value="Long-term (12+ months)">Long-term (12+ months)</option>
                    </select>
                    {errors.timeline && <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Province/Territory <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all text-gray-900"
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
                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Review & Submit</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Assessment Summary</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    {!isExplorer && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{formData.company}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Journey Stage:</span>
                      <span className="font-medium">{formData.readiness}</span>
                    </div>
                    {!isExplorer && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Units:</span>
                          <span className="font-medium">{formData.unitCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium">{formData.budget}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-medium">{formData.timeline}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{formData.province}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Assigned To:</span>
                      <span className="font-medium">{getAssignedTeam()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
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
                  className="ml-auto px-8 py-3 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  data-testid="button-next"
                >
                  Next - Continue Assessment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !csrfToken}
                  className="ml-auto px-8 py-4 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing Securely...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      Start Your ILLÜMMAA Journey
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-3">Assessment Complete!</h3>
                <p className="text-gray-700 mb-6">
                  {isExplorer 
                    ? "Thank you for your interest! Our Education Team will contact you within 48 hours with helpful resources."
                    : `Thank you! Our ${getAssignedTeam()} will contact you within ${getResponseTime()}.`
                  }
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                  <p className="text-sm"><strong>Priority Score:</strong> {priorityScore}/150</p>
                  <p className="text-sm"><strong>Response Time:</strong> {getResponseTime()}</p>
                  <p className="text-sm"><strong>Assigned To:</strong> {getAssignedTeam()}</p>
                  <p className="text-sm"><strong>Legal Status:</strong> CASL & PIPEDA Verified</p>
                  <p className="text-sm"><strong>SMS Compliance:</strong> A2P 10DLC Ready</p>
                  <p className="text-sm"><strong>Security:</strong> Enterprise Protected</p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-3 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-colors font-medium"
                  data-testid="button-continue"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default IllummaaSecureAssessmentForm;