import React, { useState, useEffect } from 'react';

// TypeScript interfaces
interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  unitCount?: number;
  budget?: string;
  timeline?: string;
  province?: string;
  readiness?: string;
  projectDescription?: string;
  consentCommunications?: boolean;
  ageVerification?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface BudgetScores {
  [key: string]: number;
}

interface TimelineScores {
  [key: string]: number;
}

interface ProvinceCodes {
  [key: string]: string;
}

// Global gtag declaration
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        event_category?: string;
        event_label?: string;
        value?: number;
      }
    ) => void;
  }
}

const IllummaaAssessmentForm = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [priorityScore, setPriorityScore] = useState<number>(0);
  const [isExplorer, setIsExplorer] = useState<boolean>(false);
  
  const TOTAL_STEPS = 4;

  // Enhanced input handler with Explorer detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Explorer detection and auto-handling
    if (name === 'readiness') {
      const explorerStatus = value.includes('researching') || value.includes('learn more');
      setIsExplorer(explorerStatus);
      
      if (explorerStatus) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
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

  // Canadian phone formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0 && !value.startsWith('1')) {
      value = '1' + value;
    }
    
    if (value.length >= 1) {
      value = '+' + value;
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
    const units = parseInt(String(formData.unitCount || 0)) || 0;
    if (units >= 1000) score += 50;
    else if (units >= 500) score += 40;
    else if (units >= 200) score += 30;
    else if (units >= 100) score += 20;
    else if (units >= 50) score += 10;
    else score += 5;
    
    // Budget (40 points max)
    const budgetScores: BudgetScores = {
      'Over $50M': 40, '$30M - $50M': 35, '$15M - $30M': 30,
      '$5M - $15M': 25, '$2M - $5M': 20, '$500K - $2M': 15,
      'Under $500K': 10
    };
    score += budgetScores[formData.budget || ''] || 0;
    
    // Timeline (30 points max)
    const timelineScores: TimelineScores = {
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
    
    // Explorer cap
    if (isExplorer) {
      score = Math.min(score, 25);
    }
    
    setPriorityScore(Math.min(score, 150));
  };

  // Form validation with Explorer logic
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name required';
        if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Valid email required';
        }
        if (!formData.phone?.trim() || formData.phone.length < 12) {
          newErrors.phone = 'Valid Canadian phone number required';
        }
        if (!formData.readiness) newErrors.readiness = 'Please select your journey stage';
        
        // Company only required for non-explorers
        if (!isExplorer && !formData.company?.trim()) {
          newErrors.company = 'Company name required for business inquiries';
        }
        
        // Consent validation
        if (!formData.consentCommunications) {
          newErrors.consentCommunications = 'Communications consent required by Canadian law';
        }
        if (!formData.ageVerification) {
          newErrors.ageVerification = 'Age verification required';
        }
        break;
        
      case 2:
        if (!isExplorer) {
          if (!formData.unitCount || formData.unitCount < 1) {
            newErrors.unitCount = 'Number of units required';
          }
          if (!formData.budget) newErrors.budget = 'Budget range required';
        }
        break;
        
      case 3:
        if (!formData.timeline) newErrors.timeline = 'Timeline required';
        if (!formData.province) newErrors.province = 'Province required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Advanced tagging system
  const generateAdvancedTags = (): string[] => {
    const tags: string[] = [];
    
    // Customer type
    if (isExplorer) {
      tags.push('Customer-Consumer-Individual', 'Scale-Individual', 'Ready-Exploring');
    } else if ((formData.unitCount || 0) >= 200) {
      tags.push('Customer-Enterprise-Scale', 'Scale-Enterprise-Community');
    } else if ((formData.unitCount || 0) >= 50) {
      tags.push('Customer-Partnership-Large', 'Scale-Large-Partnership');
    } else {
      tags.push('Customer-Residential-Small', 'Scale-Small-Residential');
    }
    
    // Priority and response
    if (priorityScore >= 100) {
      tags.push('Priority-High-150', 'Response-1Hour-Required');
    } else if (priorityScore >= 50) {
      tags.push('Priority-Medium-75', 'Response-4Hour-Standard');
    } else {
      tags.push('Priority-Standard-25', 'Response-24Hour-Follow');
    }
    
    // Geographic
    if (formData.province) {
      const provinceCode = getProvinceCode(formData.province);
      tags.push(`Location-${provinceCode}-${formData.province.replace(/\s+/g, '')}`);
      
      if (['Ontario', 'British Columbia', 'Alberta'].includes(formData.province)) {
        tags.push('Market-Primary');
      } else {
        tags.push('Market-Secondary');
      }
    }
    
    tags.push('Source-Website-Direct', 'Channel-Digital-High');
    return tags;
  };

  const getProvinceCode = (province: string): string => {
    const codes: ProvinceCodes = {
      'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
      'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
      'Northwest Territories': 'NT', 'Nova Scotia': 'NS', 'Nunavut': 'NU',
      'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC',
      'Saskatchewan': 'SK', 'Yukon': 'YT'
    };
    return codes[province] || 'XX';
  };

  const getAssignedTeam = (): string => {
    if (isExplorer) return 'ILLÜMMAA Education Team';
    if (priorityScore >= 100) return 'Senior Partnership Manager';
    if (priorityScore >= 50) return 'Partnership Representative';
    return 'Residential Specialist';
  };

  const getResponseTime = (): string => {
    if (isExplorer) return '48 hours';
    if (priorityScore >= 100) return '1 hour';
    if (priorityScore >= 50) return '4 hours';
    return '24 hours';
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const tags = generateAdvancedTags();
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: isExplorer ? (formData.company || '') : formData.company,
        unitCount: isExplorer ? 1 : (formData.unitCount || 0),
        budget: isExplorer ? 'Under $500K' : formData.budget,
        timeline: formData.timeline,
        province: formData.province,
        readiness: formData.readiness,
        projectDescription: formData.projectDescription || '',
        isExplorer: isExplorer,
        illummaaOnly: 'TRUE',
        noExternalReferrals: 'TRUE',
        priorityScore: priorityScore,
        assignedTo: getAssignedTeam(),
        responseTime: getResponseTime(),
        tags: tags,
        contactTags: tags.join(','),
        consentCommunications: formData.consentCommunications ? 'true' : 'false',
        ageVerification: formData.ageVerification ? 'true' : 'false',
        consentTimestamp: new Date().toISOString(),
        source: 'ILLÜMMAA Website Assessment',
        submissionId: `ILLUMMAA-${Date.now()}`,
        userAgent: navigator.userAgent
      };
      
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Submission failed');
      }
      
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          event_category: 'Assessment',
          event_label: getAssignedTeam(),
          value: priorityScore
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
    <section id="assessment" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
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

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            
            {/* STEP 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Contact Information</h3>
                
                {/* Journey Stage */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <label className="block text-sm font-medium mb-3 text-gray-900">
                    Where are you in your modular home journey? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="readiness"
                    value={formData.readiness || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] transition-colors text-gray-900"
                    required
                  >
                    <option value="">Select your stage...</option>
                    <option value="Just researching - want to learn more">Just researching - want to learn more</option>
                    <option value="Planning active project (0-6 months)">Planning active project (0-6 months)</option>
                    <option value="Planning future project (6+ months)">Planning future project (6+ months)</option>
                    <option value="Ready to move forward immediately">Ready to move forward immediately</option>
                  </select>
                  {errors.readiness && <p className="text-red-500 text-sm mt-1">{errors.readiness}</p>}
                  
                  {isExplorer && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Perfect! We'll focus on education and learning resources for you.
                      </p>
                    </div>
                  )}
                </div>

                {/* Legal Consent */}
                <div className="space-y-3 bg-gray-50 p-6 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentCommunications"
                      checked={formData.consentCommunications || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530]"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      <strong>I consent to ILLÜMMAA contacting me via email, phone, and text about modular home solutions and understand I can unsubscribe anytime</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentCommunications && <p className="text-red-500 text-sm">{errors.consentCommunications}</p>}
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="ageVerification"
                      checked={formData.ageVerification || false}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#2C5530] rounded focus:ring-[#2C5530]"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      <strong>I am 18+ years old</strong> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.ageVerification && <p className="text-red-500 text-sm">{errors.ageVerification}</p>}
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
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-[#2C5530]'
                      }`}
                      required
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
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-[#2C5530]'
                      }`}
                      required
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
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#2C5530]'
                      }`}
                      required
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
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#2C5530]'
                      }`}
                      required
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Company Name {isExplorer ? '(Optional)' : <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      placeholder={isExplorer ? "Company Name (Optional)" : "Company Name *"}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.company ? 'border-red-500' : 'border-gray-200 focus:border-[#2C5530]'
                      }`}
                      required={!isExplorer}
                    />
                    {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                    {isExplorer && (
                      <p className="text-xs text-gray-500 mt-1">Company name is optional for research-phase inquiries</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Project Details</h3>
                
                {isExplorer ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h4 className="text-xl font-semibold mb-3">Education Journey - No Specific Project Yet</h4>
                    <p className="text-gray-600 mb-6">
                      Perfect! We'll focus on providing you with helpful resources and education about modular construction.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Budget planning will be discussed during your educational consultation</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
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
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                          errors.unitCount ? 'border-red-500' : 'border-gray-200 focus:border-[#2C5530]'
                        }`}
                        placeholder="Select the scope that best matches your project needs"
                        required
                      />
                      {errors.unitCount && <p className="text-red-500 text-sm mt-1">{errors.unitCount}</p>}
                      <p className="text-xs text-gray-500 mt-1">Education journey - no specific project yet</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">
                        Project Budget Range (CAD) <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="budget"
                        value={formData.budget || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] transition-colors"
                        required
                      >
                        <option value="">Total project budget for modular construction and site preparation</option>
                        <option value="Under $500K">Under $500K</option>
                        <option value="$500K - $2M">$500K - $2M</option>
                        <option value="$2M - $5M">$2M - $5M</option>
                        <option value="$5M - $15M">$5M - $15M</option>
                        <option value="$15M - $30M">$15M - $30M</option>
                        <option value="$30M - $50M">$30M - $50M</option>
                        <option value="Over $50M">Over $50M</option>
                      </select>
                      {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                      <p className="text-xs text-gray-500 mt-1">Budget planning will be discussed during your educational consultation</p>
                    </div>
                  </div>
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
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] transition-colors"
                      required
                    >
                      <option value="">Select timeline</option>
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
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] transition-colors"
                      required
                    >
                      <option value="">Select location</option>
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">
                    Tell us about your vision (optional)
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#2C5530] transition-colors resize-none"
                    placeholder="Share any specific requirements, design preferences, or questions about modular construction..."
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review & Priority Score */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Review & Submit</h3>
                
                {/* Priority Score Display */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-[#2C5530] rounded-2xl p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-3">Your Priority Score</h4>
                    <div className="text-5xl font-bold text-[#2C5530] mb-2">
                      {priorityScore}
                      <span className="text-2xl text-gray-500 font-normal">/150</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {isExplorer 
                        ? "EDUCATION TRACK: Our team will contact you within 48 hours with helpful resources"
                        : priorityScore >= 100 
                          ? "HIGH PRIORITY: Senior Partnership Manager will contact within 1 hour"
                          : priorityScore >= 50 
                            ? "QUALIFIED: Partnership Representative will contact within 4 hours"
                            : "STANDARD: Our team will contact you within 24 hours"
                      }
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h5 className="font-semibold mb-3">Assessment Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Journey Stage:</span>
                      <span className="font-medium">{formData.readiness}</span>
                    </div>
                    {!isExplorer && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project Scale:</span>
                          <span className="font-medium">{formData.unitCount} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium">{formData.budget}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-medium">{formData.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{formData.province}</span>
                    </div>
                    <div className="flex justify-between">
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
            <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn">
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
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-3 bg-[#2C5530] text-white rounded-xl hover:bg-[#1e3d21] transition-colors"
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

export default IllummaaAssessmentForm;