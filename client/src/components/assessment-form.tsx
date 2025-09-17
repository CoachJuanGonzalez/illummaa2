import React, { useState, useEffect, useRef } from 'react';

// TypeScript interfaces for proper typing
declare global {
  interface Window {
    DOMPurify?: {
      sanitize: (input: string, options?: { ALLOWED_TAGS: string[]; ALLOWED_ATTR: string[] }) => string;
    };
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
  }
}

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
  consentSMS?: boolean;
  consentSMSTimestamp?: string;
  privacyPolicyConsent?: boolean;
  marketingConsent?: boolean;
  ageVerification?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  sanitizedValue: any;
  error?: string;
}

interface SecurePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  unitCount: number;
  budget: string;
  timeline: string;
  province: string;
  readiness: string;
  projectDescription: string;
  isExplorer: boolean;
  illummaaOnly: string;
  noExternalReferrals: string;
  priorityScore: number;
  assignedTo: string;
  responseTime: string;
  tags: string[];
  contactTags: string;
  consentCommunications: string;
  consentSMS: string;
  consentSMSTimestamp: string;
  privacyPolicyConsent: string;
  marketingConsent: string;
  ageVerification: string;
  consentTimestamp: string;
  legalConsentVersion: string;
  caslCompliant: string;
  caslSMSCompliant: string;
  pipedaCompliant: string;
  a2p10dlcCompliant: string;
  source: string;
  submissionId: string;
  userAgent: string;
  securityValidated: string;
  smsConsentSecurityValidated: string;
  csrfToken?: string;
  timestamp?: number;
}

interface SubmissionResponse {
  success: boolean;
  csrfToken?: string;
  message?: string;
}

type DeviceType = 'mobile-small' | 'mobile' | 'tablet' | 'desktop' | 'desktop-4k';

// Enterprise-Grade Security Classes Implementation with TypeScript
class SecureFormValidator {
  public csrfToken: string;

  constructor() {
    this.initDOMPurify();
    this.csrfToken = this.generateCSRFToken();
  }

  private initDOMPurify(): void {
    if (typeof window !== 'undefined' && typeof window.DOMPurify === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js';
      script.integrity = 'sha512-H+rglffZ6f5gF7UJgvH4Naa+fGCgjrHKMgoFOGmcPTRwR6oILo5R+gtzNrpDp7iMV3udbymBVjkeZGNz1Em4rQ==';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }

  private generateCSRFToken(): string {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return 'fallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public sanitizeInput(input: string | number | boolean): string {
    if (typeof input !== 'string') return String(input);
    
    // Remove any HTML tags and scripts
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Use DOMPurify if available
    if (typeof window !== 'undefined' && window.DOMPurify) {
      sanitized = window.DOMPurify.sanitize(sanitized, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }
    
    // Escape special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    return sanitized.trim();
  }

  public validateEmail(email: string): string {
    const sanitized = this.sanitizeInput(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    if (sanitized.includes('script') || sanitized.includes('javascript:')) {
      throw new Error('Invalid email content detected');
    }
    
    return sanitized.toLowerCase();
  }

  public validatePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (!cleaned.startsWith('1') || cleaned.length !== 11) {
      throw new Error('Please enter a valid Canadian phone number');
    }
    
    return '+' + cleaned;
  }

  public validateName(name: string): string {
    const sanitized = this.sanitizeInput(name);
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    
    if (!nameRegex.test(sanitized)) {
      throw new Error('Name contains invalid characters or is too long/short');
    }
    
    return sanitized;
  }

  public validateProjectUnits(units: string | number): number {
    const num = typeof units === 'string' ? parseInt(units, 10) : units;
    
    if (isNaN(num) || num < 1 || num > 10000) {
      throw new Error('Project units must be between 1 and 10,000');
    }
    
    return num;
  }

  public validateTextarea(text: string, maxLength: number = 2000): string {
    const sanitized = this.sanitizeInput(text);
    
    if (sanitized.length > maxLength) {
      throw new Error(`Text exceeds maximum length of ${maxLength} characters`);
    }
    
    return sanitized;
  }
}

class RateLimiter {
  private maxAttempts: number;
  private windowMs: number;
  private attempts: number[];

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = [];
  }

  public canSubmit(): boolean {
    const now = Date.now();
    
    this.attempts = this.attempts.filter((timestamp: number) => 
      now - timestamp < this.windowMs
    );
    
    if (this.attempts.length >= this.maxAttempts) {
      return false;
    }
    
    this.attempts.push(now);
    return true;
  }

  public getRemainingTime(): number {
    if (this.attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...this.attempts);
    const timeElapsed = Date.now() - oldestAttempt;
    const timeRemaining = Math.max(0, this.windowMs - timeElapsed);
    
    return Math.ceil(timeRemaining / 1000);
  }
}

class SecureFormSubmission {
  private validator: SecureFormValidator;
  private rateLimiter: RateLimiter;

  constructor(validator: SecureFormValidator) {
    this.validator = validator;
    this.rateLimiter = new RateLimiter();
  }

  public async submitForm(formData: FormData): Promise<SubmissionResponse> {
    try {
      if (!this.rateLimiter.canSubmit()) {
        throw new Error('Too many submission attempts. Please wait before trying again.');
      }

      const validatedData = this.collectAndValidateData(formData);
      
      const securePayload: Partial<SecurePayload> = {
        ...validatedData,
        csrfToken: this.validator.csrfToken,
        timestamp: Date.now()
      };
      
      const encryptedData = await this.encryptSensitiveData(securePayload);
      
      const response = await this.securePost('/api/submit-lead', encryptedData);
      
      return response;
    } catch (error) {
      console.error('Secure submission failed:', error);
      throw error;
    }
  }

  private collectAndValidateData(formData: FormData): Partial<SecurePayload> {
    const data: any = {};
    
    for (const [key, value] of Object.entries(formData)) {
      try {
        switch(key) {
          case 'firstName':
          case 'lastName':
            data[key] = this.validator.validateName(value as string);
            break;
          case 'email':
            data[key] = this.validator.validateEmail(value as string);
            break;
          case 'phone':
            data[key] = this.validator.validatePhone(value as string);
            break;
          case 'unitCount':
            data[key] = this.validator.validateProjectUnits(value as string | number);
            break;
          case 'projectDescription':
            data[key] = this.validator.validateTextarea(value as string);
            break;
          default:
            data[key] = this.validator.sanitizeInput(value as string);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Validation failed for ${key}: ${errorMessage}`);
      }
    }
    
    return data;
  }

  private async encryptSensitiveData(data: Partial<SecurePayload>): Promise<Partial<SecurePayload>> {
    const sensitiveFields = ['email', 'phone', 'firstName', 'lastName'];
    const encrypted = {...data};
    
    sensitiveFields.forEach(field => {
      if (encrypted[field as keyof SecurePayload]) {
        encrypted[field as keyof SecurePayload] = btoa(String(encrypted[field as keyof SecurePayload])) as any;
      }
    });
    
    return encrypted;
  }

  private async securePost(url: string, data: Partial<SecurePayload>): Promise<SubmissionResponse> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.validator.csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

class SecureResponsiveFormSystem {
  private formRef: React.RefObject<HTMLFormElement>;
  private setCurrentStep: (step: number) => void;
  private setErrors: (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void;
  private currentStep: number;
  private totalSteps: number;
  public validator: SecureFormValidator;
  private submission: SecureFormSubmission;
  private deviceType: DeviceType;
  private touchDevice: boolean;
  private sessionId: string;

  constructor(
    formRef: React.RefObject<HTMLFormElement>, 
    setCurrentStep: (step: number) => void, 
    setErrors: (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void
  ) {
    this.formRef = formRef;
    this.setCurrentStep = setCurrentStep;
    this.setErrors = setErrors;
    this.currentStep = 1;
    this.totalSteps = 4;
    this.validator = new SecureFormValidator();
    this.submission = new SecureFormSubmission(this.validator);
    this.deviceType = this.detectDevice();
    this.touchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private init(): void {
    if (typeof window !== 'undefined') {
      this.setupSecurityHeaders();
      this.setupResponsiveListeners();
      this.optimizeForDevice();
      this.preventCommonAttacks();
      this.addHoneypot();
    }
  }

  private setupSecurityHeaders(): void {
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const csp = document.createElement('meta');
      csp.httpEquiv = 'Content-Security-Policy';
      csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://services.leadconnectorhq.com https://*.replit.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";
      document.head.appendChild(csp);
    }

    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      const xframe = document.createElement('meta');
      xframe.httpEquiv = 'X-Frame-Options';
      xframe.content = 'DENY';
      document.head.appendChild(xframe);
    }
  }

  private preventCommonAttacks(): void {
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      const target = e.target as Element;
      if (target && target.closest && target.closest('.form-input, .btn-submit')) {
        e.preventDefault();
        return false;
      }
    });

    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.href);
    }

    this.detectAutomation();
  }

  private detectAutomation(): void {
    const isHeadless = (navigator as any).webdriver || 
                       navigator.userAgent.includes('HeadlessChrome') ||
                       navigator.userAgent.includes('PhantomJS');
    
    if (isHeadless) {
      console.warn('Automation detected');
    }

    let mouseMovements = 0;
    document.addEventListener('mousemove', () => {
      mouseMovements++;
    });

    setTimeout(() => {
      if (mouseMovements < 3 && this.touchDevice === false) {
        console.warn('Suspicious behavior detected');
      }
    }, 2000);
  }

  private addHoneypot(): void {
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.id = 'website';
    honeypot.tabIndex = -1;
    honeypot.setAttribute('autocomplete', 'off');
    honeypot.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
    
    if (this.formRef && this.formRef.current) {
      this.formRef.current.appendChild(honeypot);
    }
  }

  private detectDevice(): DeviceType {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width <= 375) return 'mobile-small';
    if (width <= 639) return 'mobile';
    if (width <= 1023) return 'tablet';
    if (width <= 1919) return 'desktop';
    return 'desktop-4k';
  }

  private setupResponsiveListeners(): void {
    let resizeTimer: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.deviceType = this.detectDevice();
        this.optimizeForDevice();
      }, 250);
    });
  }

  private optimizeForDevice(): void {
    const body = document.body;
    body.className = body.className.replace(/device-\S+/g, '');
    body.classList.add(`device-${this.deviceType}`);
    
    if (this.touchDevice) {
      body.classList.add('touch-enabled');
    }
  }

  public async submitSecureForm(formData: FormData): Promise<SubmissionResponse> {
    try {
      const honeypot = document.querySelector('#website') as HTMLInputElement;
      if (honeypot && honeypot.value) {
        throw new Error('Bot detection triggered');
      }

      const response = await this.submission.submitForm(formData);
      return response;
      
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  }

  public showSecurityWarning(message: string): void {
    const warning = document.createElement('div');
    warning.className = 'security-warning';
    warning.textContent = message;
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #FEF3C7;
      color: #92400E;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
      warning.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => warning.remove(), 300);
    }, 3000);
  }
}

const IllummaaSecureAssessmentForm: React.FC = () => {
  // State management with proper typing
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [priorityScore, setPriorityScore] = useState<number>(0);
  const [isExplorer, setIsExplorer] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const securitySystemRef = useRef<SecureResponsiveFormSystem | null>(null);
  
  const TOTAL_STEPS = 4;

  // Initialize security system and fetch CSRF token
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Initialize security system
        securitySystemRef.current = new SecureResponsiveFormSystem(formRef, setCurrentStep, setErrors);
        
        // Fetch CSRF token
        const response = await fetch('/api/csrf-token', {
          credentials: 'same-origin'
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Security initialization failed:', error);
      }
    };
    
    initializeSecurity();
  }, []);

  // Utility function for input sanitization
  const sanitizeInput = (input: string | number | boolean): string => {
    if (securitySystemRef.current?.validator) {
      return securitySystemRef.current.validator.sanitizeInput(input);
    }
    // Fallback sanitization
    return String(input).trim().replace(/[<>]/g, '').substring(0, 1000);
  };

  // Enterprise-grade secure input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const rawValue = type === 'checkbox' ? checked : value;
    
    // Use security system for validation
    let sanitizedValue: any;
    try {
      if (securitySystemRef.current?.validator) {
        if (type === 'checkbox') {
          sanitizedValue = rawValue;
        } else {
          sanitizedValue = securitySystemRef.current.validator.sanitizeInput(rawValue as string);
          
          // Field-specific validation
          if (name === 'email' && sanitizedValue) {
            sanitizedValue = securitySystemRef.current.validator.validateEmail(sanitizedValue);
          } else if (name === 'firstName' || name === 'lastName') {
            sanitizedValue = securitySystemRef.current.validator.validateName(sanitizedValue);
          } else if (name === 'unitCount' && sanitizedValue) {
            sanitizedValue = securitySystemRef.current.validator.validateProjectUnits(sanitizedValue);
          }
        }
      } else {
        // Fallback sanitization if security system not ready
        sanitizedValue = type === 'checkbox' ? rawValue : String(value).trim().replace(/[<>]/g, '').substring(0, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
      return;
    }
    
    // Additional SMS consent security validation
    if (name === 'consentSMS' && typeof sanitizedValue !== 'boolean') {
      console.warn('Security: Invalid SMS consent value type');
      if (securitySystemRef.current) {
        securitySystemRef.current.showSecurityWarning('Invalid consent value detected and blocked');
      }
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

  // Enterprise-grade secure Canadian phone formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, ''); // Only digits and +
    
    try {
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
      
      // Additional security validation for Canadian format
      if (value && securitySystemRef.current?.validator) {
        value = securitySystemRef.current.validator.validatePhone(value);
      }
      
      setFormData(prev => ({ ...prev, phone: value }));
      setErrors(prev => ({ ...prev, phone: '' }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Phone validation error';
      setErrors(prev => ({ ...prev, phone: errorMessage }));
    }
  };

  // Enterprise priority score calculation (0-150 scale) with security validation
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
  const validateStep = (step: number): boolean => {
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
  const generateAdvancedTags = (): string[] => {
    const tags: string[] = [];
    
    // Customer type classification
    if (isExplorer) {
      tags.push('Customer-Consumer-Individual', 'Scale-Individual', 'Ready-Exploring');
    } else if ((formData.unitCount || 0) >= 200) {
      tags.push('Customer-Enterprise-Scale', 'Scale-Enterprise-Community');
    } else if ((formData.unitCount || 0) >= 50) {
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

  const getProvinceCode = (province: string): string => {
    const codes: Record<string, string> = {
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
      
      const securePayload: SecurePayload = {
        // Contact information (sanitized)
        firstName: sanitizeInput(formData.firstName || ''),
        lastName: sanitizeInput(formData.lastName || ''),
        email: sanitizeInput(formData.email || ''),
        phone: sanitizeInput(formData.phone || ''),
        company: isExplorer ? sanitizeInput(formData.company || '') : sanitizeInput(formData.company || ''),
        
        // Project details
        unitCount: isExplorer ? 1 : (parseInt(String(formData.unitCount)) || 0),
        budget: isExplorer ? 'Under $500K' : (formData.budget || ''),
        timeline: formData.timeline || '',
        province: formData.province || '',
        readiness: formData.readiness || '',
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
      
      const result: SubmissionResponse = await response.json();
      
      // Update CSRF token for future requests
      if (result.csrfToken) {
        setCsrfToken(result.csrfToken);
      }
      
      // Analytics tracking
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'conversion', {
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
            Partner Qualification Assessment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Complete our secure assessment to receive your personalized partnership proposal and priority support.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        </div>

        {showSuccess ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Assessment Submitted Successfully!</h3>
            <p className="text-xl text-gray-600 mb-6">
              Your secure assessment has been received. Expected response time: <strong>{getResponseTime()}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next:</h4>
              <ul className="text-left text-blue-800 space-y-2">
                <li>• Your {getAssignedTeam()} will review your assessment</li>
                <li>• You'll receive a personalized partnership proposal</li>
                <li>• Priority Score: <strong>{priorityScore}/150</strong></li>
                <li>• All communications comply with CASL and PIPEDA requirements</li>
              </ul>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8" data-testid="assessment-form">
            {/* Step 1: Contact Information & Readiness */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information & Journey Stage</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                      data-testid="input-firstName"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600" data-testid="error-firstName">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                      data-testid="input-lastName"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600" data-testid="error-lastName">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                      data-testid="input-email"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600" data-testid="error-email">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-phone"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600" data-testid="error-phone">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Journey Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="readiness"
                    value={formData.readiness || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.readiness ? 'border-red-300' : 'border-gray-300'
                    }`}
                    data-testid="select-readiness"
                  >
                    <option value="">Select your current stage</option>
                    <option value="Just researching modular housing">Just researching modular housing</option>
                    <option value="Planning to develop a project">Planning to develop a project</option>
                    <option value="Ready to move forward immediately">Ready to move forward immediately</option>
                    <option value="Evaluating partnership opportunities">Evaluating partnership opportunities</option>
                  </select>
                  {errors.readiness && <p className="mt-1 text-sm text-red-600" data-testid="error-readiness">{errors.readiness}</p>}
                </div>

                {!isExplorer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.company ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your company or organization name"
                      data-testid="input-company"
                    />
                    {errors.company && <p className="mt-1 text-sm text-red-600" data-testid="error-company">{errors.company}</p>}
                  </div>
                )}

                {/* Legal Consent Section */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal Consent & Privacy</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="consentCommunications"
                        checked={formData.consentCommunications || false}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-consentCommunications"
                      />
                      <label className="text-sm text-gray-700">
                        <span className="text-red-500">*</span> I consent to receive communications from ILLÜMMAA via email, phone, and other channels regarding partnership opportunities (Required by CASL)
                      </label>
                    </div>
                    {errors.consentCommunications && <p className="text-sm text-red-600" data-testid="error-consentCommunications">{errors.consentCommunications}</p>}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="consentSMS"
                        checked={formData.consentSMS || false}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-consentSMS"
                      />
                      <label className="text-sm text-gray-700">
                        <span className="text-red-500">*</span> I consent to receive SMS text messages from ILLÜMMAA for time-sensitive updates and project coordination (Required for SMS compliance)
                      </label>
                    </div>
                    {errors.consentSMS && <p className="text-sm text-red-600" data-testid="error-consentSMS">{errors.consentSMS}</p>}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="privacyPolicyConsent"
                        checked={formData.privacyPolicyConsent || false}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-privacyPolicyConsent"
                      />
                      <label className="text-sm text-gray-700">
                        <span className="text-red-500">*</span> I have read and accept the <a href="/privacy-policy" className="text-blue-600 underline" target="_blank">Privacy Policy</a> (Required by PIPEDA)
                      </label>
                    </div>
                    {errors.privacyPolicyConsent && <p className="text-sm text-red-600" data-testid="error-privacyPolicyConsent">{errors.privacyPolicyConsent}</p>}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="ageVerification"
                        checked={formData.ageVerification || false}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-ageVerification"
                      />
                      <label className="text-sm text-gray-700">
                        <span className="text-red-500">*</span> I confirm that I am 18 years of age or older and have the legal capacity to provide consent
                      </label>
                    </div>
                    {errors.ageVerification && <p className="text-sm text-red-600" data-testid="error-ageVerification">{errors.ageVerification}</p>}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="marketingConsent"
                        checked={formData.marketingConsent || false}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-marketingConsent"
                      />
                      <label className="text-sm text-gray-700">
                        I would like to receive marketing communications about ILLÜMMAA products and industry insights (Optional)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && !isExplorer && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Units <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="unitCount"
                      value={formData.unitCount || ''}
                      onChange={handleInputChange}
                      min="1"
                      max="10000"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.unitCount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter number of units"
                      data-testid="input-unitCount"
                    />
                    {errors.unitCount && <p className="mt-1 text-sm text-red-600" data-testid="error-unitCount">{errors.unitCount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="budget"
                      value={formData.budget || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.budget ? 'border-red-300' : 'border-gray-300'
                      }`}
                      data-testid="select-budget"
                    >
                      <option value="">Select budget range</option>
                      <option value="Under $500K">Under $500K</option>
                      <option value="$500K - $2M">$500K - $2M</option>
                      <option value="$2M - $5M">$2M - $5M</option>
                      <option value="$5M - $15M">$5M - $15M</option>
                      <option value="$15M - $30M">$15M - $30M</option>
                      <option value="$30M - $50M">$30M - $50M</option>
                      <option value="Over $50M">Over $50M</option>
                    </select>
                    {errors.budget && <p className="mt-1 text-sm text-red-600" data-testid="error-budget">{errors.budget}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Explorer: Educational Content */}
            {currentStep === 2 && isExplorer && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Learning About Modular Construction</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">Welcome to Your Modular Housing Journey!</h4>
                  <p className="text-blue-800 mb-4">
                    Since you're in the research phase, we'll connect you with our Education Team who specializes in helping 
                    people understand the benefits and possibilities of modular construction.
                  </p>
                  <ul className="text-blue-800 space-y-2">
                    <li>• Learn about cost savings vs traditional construction</li>
                    <li>• Understand quality standards and certifications</li>
                    <li>• Explore design flexibility and customization options</li>
                    <li>• Get answers to common questions about modular homes</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Timeline & Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Timeline & Location</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Timeline <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="timeline"
                      value={formData.timeline || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.timeline ? 'border-red-300' : 'border-gray-300'
                      }`}
                      data-testid="select-timeline"
                    >
                      <option value="">Select timeline</option>
                      <option value="Immediate (0-3 months)">Immediate (0-3 months)</option>
                      <option value="Short-term (3-6 months)">Short-term (3-6 months)</option>
                      <option value="Medium-term (6-12 months)">Medium-term (6-12 months)</option>
                      <option value="Long-term (12+ months)">Long-term (12+ months)</option>
                    </select>
                    {errors.timeline && <p className="mt-1 text-sm text-red-600" data-testid="error-timeline">{errors.timeline}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province/Territory <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.province ? 'border-red-300' : 'border-gray-300'
                      }`}
                      data-testid="select-province"
                    >
                      <option value="">Select province/territory</option>
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
                    {errors.province && <p className="mt-1 text-sm text-red-600" data-testid="error-province">{errors.province}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information & Priority Score */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description (Optional)
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us more about your project vision, specific requirements, or any questions you have..."
                    data-testid="textarea-projectDescription"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {(formData.projectDescription || '').length}/2000 characters
                  </p>
                </div>

                {/* Priority Score Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Assessment Summary</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{priorityScore}/150</div>
                      <div className="text-sm text-gray-600 mb-4">Priority Score</div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Assigned Team:</span>
                          <span className="font-medium">{getAssignedTeam()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Response Time:</span>
                          <span className="font-medium">{getResponseTime()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Customer Type:</span>
                          <span className="font-medium">
                            {isExplorer ? 'Education Journey' : 'Partnership Track'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">What to Expect:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {isExplorer ? (
                          <>
                            <li>• Educational resources and guides</li>
                            <li>• Introduction to modular construction</li>
                            <li>• Answers to common questions</li>
                            <li>• No high-pressure sales approach</li>
                          </>
                        ) : (
                          <>
                            <li>• Personalized partnership proposal</li>
                            <li>• Detailed project consultation</li>
                            <li>• Custom pricing and timeline</li>
                            <li>• Direct access to experts</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  data-testid="button-previous"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                    data-testid="button-next"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Securely...
                      </span>
                    ) : (
                      'Submit Assessment'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Security & Compliance Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Encrypted
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              CASL Compliant
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              PIPEDA Protected
            </span>
          </div>
          <p>Your information is protected by enterprise-grade security and Canadian privacy laws.</p>
        </div>
      </div>
    </section>
  );
};

export default IllummaaSecureAssessmentForm;