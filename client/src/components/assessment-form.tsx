import React, { useState, useEffect } from 'react';

interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  readiness?: string;
  unitCount?: number | string;
  budget?: string;
  timeline?: string;
  province?: string;
  projectDescription?: string;
  consentCommunications?: boolean;
  privacyPolicyConsent?: boolean;
  ageVerification?: boolean;
  marketingConsent?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const IllummaaSecureAssessmentForm = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
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
  const sanitizeInput = (value: any) => {
    if (typeof value !== 'string') return value;
    return value
      .trim()
      .replace(/[<>]/g, '') // Basic XSS prevention
      .substring(0, 1000); // Length limit
  };

  // Enhanced input handler with security and Explorer detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const rawValue = type === 'checkbox' ? checked : value;
    const sanitizedValue = type === 'checkbox' ? rawValue : sanitizeInput(rawValue);
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Explorer detection and auto-handling
    if (name === 'readiness') {
      const explorerStatus = String(sanitizedValue).includes('researching') || String(sanitizedValue).includes('learn more');
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
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const units = parseInt(String(formData.unitCount)) || 0;
    if (units >= 1000) score += 50;
    else if (units >= 500) score += 40;
    else if (units >= 200) score += 30;
    else if (units >= 100) score += 20;
    else if (units >= 50) score += 10;
    else score += 5;
    
    // Budget (40 points max)
    const budgetScores: Record<string, number> = {
      'Over $50M': 40, '$30M - $50M': 35, '$15M - $30M': 30,
      '$5M - $15M': 25, '$2M - $5M': 20, '$500K - $2M': 15,
      'Under $500K': 10
    };
    score += budgetScores[formData.budget || ''] || 0;
    
    // Timeline (30 points max)
    const timelineScores: Record<string, number> = {
      'Immediate (0-3 months)': 30, 'Short-term (3-6 months)': 20,
      'Medium-term (6-12 months)': 10, 'Long-term (12+ months)': 5
    };
    score += timelineScores[formData.timeline || ''] || 0;
    
    // Location (15 points max)
    const primaryProvinces = ['Ontario', 'British Columbia', 'Alberta'];
    if (primaryProvinces.includes(formData.province || '')) {
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
  const validateStep = (step: number) => {
    const newErrors: FormErrors = {};
    
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
        if (!formData.privacyPolicyConsent) {
          newErrors.privacyPolicyConsent = 'Privacy Policy acceptance required by PIPEDA';
        }
        if (!formData.ageVerification) {
          newErrors.ageVerification = 'Age verification required for legal consent capacity';
        }
        break;
        
      case 2:
        if (!isExplorer) {
          if (!formData.unitCount || Number(formData.unitCount) < 1 || Number(formData.unitCount) > 10000) {
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
    } else if (Number(formData.unitCount) >= 200) {
      tags.push('Customer-Enterprise-Scale', 'Scale-Enterprise-Community');
    } else if (Number(formData.unitCount) >= 50) {
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
    tags.push('Consent-MultiChannel-Verified', 'Consent-Privacy-Accepted', 'CASL-Compliant', 'PIPEDA-Compliant');
    
    // Source classification
    tags.push('Source-Website-Direct', 'Channel-Digital-High', 'Security-Verified');
    
    return tags;
  };

  const getProvinceCode = (province: string) => {
    const codes: Record<string, string> = {
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        unitCount: isExplorer ? 1 : (parseInt(String(formData.unitCount)) || 0),
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
        
        // Enhanced legal consent tracking
        consentCommunications: formData.consentCommunications ? 'true' : 'false',
        privacyPolicyConsent: formData.privacyPolicyConsent ? 'true' : 'false',
        marketingConsent: formData.marketingConsent ? 'true' : 'false',
        ageVerification: formData.ageVerification ? 'true' : 'false',
        consentTimestamp: new Date().toISOString(),
        legalConsentVersion: '2025.1',
        caslCompliant: 'true',
        pipedaCompliant: 'true',
        
        // System and security tracking
        source: 'ILLÜMMAA Website Assessment',
        submissionId: `ILLUMMAA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userAgent: navigator.userAgent,
        securityValidated: 'true'
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
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'conversion', {
          event_category: 'Secure_Assessment',
          event_label: getAssignedTeam(),
          value: priorityScore,
          custom_parameters: {
            legal_compliance: 'verified',
            security_level: 'enterprise'
          }
        });
      }
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Secure submission error:', error);
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

                {/* Enhanced Legal Consent Section */}
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
                    />
                    <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      <strong>I expressly consent to ILLÜMMAA and its authorized representatives contacting me via email, phone calls, SMS/text messages, WhatsApp, and other digital messaging platforms about modular home solutions, services, and related offerings. I understand I can withdraw this consent at any time by unsubscribing or contacting info@illummaa.ca.</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentCommunications && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {errors.consentCommunications}
                  </p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="privacyPolicyConsent"
                      checked={formData.privacyPolicyConsent || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530] focus:ring-2"
                      required
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      <strong>I acknowledge I have read and agree to ILLÜMMAA's <a href="/privacy-policy" target="_blank" className="text-[#2C5530] underline hover:text-[#1e3d21] font-medium transition-colors">Privacy Policy</a> and understand how my personal information will be collected, used, and protected in accordance with Canadian privacy laws.</strong> <span className="text-red-500">*</span>
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
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      <strong>I am 18+ years old and have the legal capacity to enter into this communication agreement.</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.ageVerification && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4 text-red-500">⚠</span>
                    {errors.ageVerification}
                  </p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      checked={formData.marketingConsent || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530] focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      <strong>Optional:</strong> I would like to receive updates about industry news, Build Canada Homes opportunities, and modular construction innovations.
                    </span>
                  </label>

                  <div className="text-xs text-gray-600 bg-white p-3 rounded border-l-4 border-[#2C5530] mt-4">
                    <strong>Your Rights:</strong> You may withdraw consent at any time. Your information is protected under Canadian privacy laws (PIPEDA/provincial equivalents). Standard messaging rates may apply. ILLÜMMAA complies with CASL requirements for commercial electronic messages.
                  </div>
                </div>

                {/* Contact Fields */}
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
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.firstName}
                    </p>}
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
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.lastName}
                    </p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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
                      placeholder="your@email.com"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.email}
                    </p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Canadian Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      placeholder="+1XXXXXXXXXX"
                      required
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.phone}
                    </p>}
                  </div>
                </div>

                {!isExplorer && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Company/Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all"
                      placeholder="Your company name"
                      required
                    />
                    {errors.company && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.company}
                    </p>}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                {isExplorer ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">📚</div>
                    <h4 className="text-xl font-semibold mb-3">Education Journey - No Specific Project Yet</h4>
                    <p className="text-gray-600 mb-6">
                      Perfect! Since you're researching and learning, we'll skip project-specific details and focus on providing you with educational resources.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                      <h5 className="font-semibold text-blue-900 mb-2">What's Next:</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Educational materials about modular construction</li>
                        <li>• Canadian regulations and standards</li>
                        <li>• Cost planning guides</li>
                        <li>• Timeline planning resources</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <>
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
                          placeholder="e.g. 50"
                          required
                        />
                        {errors.unitCount && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span className="w-4 h-4 text-red-500">⚠</span>
                          {errors.unitCount}
                        </p>}
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
                        {errors.budget && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span className="w-4 h-4 text-red-500">⚠</span>
                          {errors.budget}
                        </p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: Timeline & Location */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
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
                    >
                      <option value="">Select timeline...</option>
                      <option value="Immediate (0-3 months)">Immediate (0-3 months)</option>
                      <option value="Short-term (3-6 months)">Short-term (3-6 months)</option>
                      <option value="Medium-term (6-12 months)">Medium-term (6-12 months)</option>
                      <option value="Long-term (12+ months)">Long-term (12+ months)</option>
                    </select>
                    {errors.timeline && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.timeline}
                    </p>}
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
                    {errors.province && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.province}
                    </p>}
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] focus:ring-2 focus:ring-[#2C5530] focus:ring-opacity-20 transition-all resize-none"
                    placeholder="Tell us about your project goals, vision, or any specific requirements..."
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Review & Submit</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">Assessment Summary</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                      {!isExplorer && <p><strong>Company:</strong> {formData.company}</p>}
                    </div>
                    <div>
                      <p><strong>Journey Stage:</strong> {formData.readiness}</p>
                      {!isExplorer && <p><strong>Units:</strong> {formData.unitCount}</p>}
                      {!isExplorer && <p><strong>Budget:</strong> {formData.budget}</p>}
                      <p><strong>Timeline:</strong> {formData.timeline}</p>
                      <p><strong>Location:</strong> {formData.province}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <p className="text-sm"><strong>Priority Score:</strong> {priorityScore}/150</p>
                    <p className="text-sm"><strong>Assigned Team:</strong> {getAssignedTeam()}</p>
                    <p className="text-sm"><strong>Response Time:</strong> {getResponseTime()}</p>
                    <p className="text-sm"><strong>Legal Status:</strong> CASL & PIPEDA Verified</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  Previous
                </button>
              )}
              
              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-8 py-3 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-all flex items-center gap-2 font-medium"
                >
                  Next - Continue Assessment
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-8 py-4 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-all disabled:opacity-50 flex items-center gap-3 font-semibold text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    'Start Your ILLÜMMAA Journey'
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
                  <p className="text-sm"><strong>Security:</strong> Enterprise Protected</p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-3 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-colors font-medium"
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