import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Send, Home, Clock } from "lucide-react";
import { assessmentSchema, type AssessmentFormData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SecurityModule } from "@/lib/security";

const TOTAL_STEPS = 5;

// CASL/PIPEDA Compliant Consent Validation Functions
function validateConsentCompliance(formData: any) {
    if (!formData.consentMarketing) {
        return { valid: false, message: 'Please consent to communications to continue' };
    }
    if (!formData.ageVerification) {
        return { valid: false, message: 'Age verification required' };
    }
    return { valid: true };
}

function validateStep1() {
    // Check all required fields first
    const firstName = document.getElementById('firstName') as HTMLInputElement;
    const lastName = document.getElementById('lastName') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    const phone = document.getElementById('phone') as HTMLInputElement;
    const readiness = (document.getElementById('readiness') || document.querySelector('[name="readiness"]')) as HTMLInputElement;
    
    // Basic field validation
    if (!firstName || !firstName.value.trim()) {
        alert('Please enter your first name');
        firstName?.focus();
        return false;
    }
    
    if (!lastName || !lastName.value.trim()) {
        alert('Please enter your last name');
        lastName?.focus();
        return false;
    }
    
    if (!email || !email.value.trim()) {
        alert('Please enter your email address');
        email?.focus();
        return false;
    }
    
    if (!phone || !phone.value.trim()) {
        alert('Please enter your phone number');
        phone?.focus();
        return false;
    }
    
    if (!readiness || !readiness.value) {
        alert('Please select where you are in your modular home journey');
        readiness?.focus();
        return false;
    }
    
    // CRITICAL: Legal consent validation - BLOCKS progression without consent
    const consentComm = document.getElementById('consentCommunications') as HTMLInputElement;
    const ageVerif = document.getElementById('ageVerification') as HTMLInputElement;
    
    if (!consentComm || !consentComm.checked) {
        alert('LEGAL REQUIREMENT: You must consent to communications before continuing.\n\nThis is required under Canadian privacy law (CASL) to process your inquiry.');
        // Scroll to consent section
        consentComm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    if (!ageVerif || !ageVerif.checked) {
        alert('LEGAL REQUIREMENT: Age verification (18+) is required.\n\nOnly adults can provide valid consent under Canadian law.');
        ageVerif?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    return true;
}

// Form validation function with security checks
function validateFormData(formData: any) {
    const errors: string[] = [];
    
    // Check honeypot
    const honeypotField = document.getElementById('email_confirm') as HTMLInputElement;
    if (honeypotField?.value) {
        console.warn('Bot detected');
        return { valid: false, bot: true };
    }
    
    // Validate names
    if (!SecurityModule.validateName(formData.firstName)) {
        errors.push('Please enter a valid first name (2-50 characters, letters only)');
    }
    
    if (!SecurityModule.validateName(formData.lastName)) {
        errors.push('Please enter a valid last name (2-50 characters, letters only)');
    }
    
    // Validate email
    if (!SecurityModule.validateEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Validate phone
    if (!SecurityModule.validatePhone(formData.phone)) {
        errors.push('Please enter a valid 10-digit phone number');
    }
    
    // Check for injection attempts
    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string' && !SecurityModule.checkSQLInjection(value)) {
            errors.push('Invalid characters detected. Please remove special characters.');
            break;
        }
    }
    
    // CASL/PIPEDA Consent validation
    const consentValidation = validateConsentCompliance(formData);
    if (!consentValidation.valid) {
        errors.push(consentValidation.message || 'Consent validation failed');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors,
        bot: false
    };
}

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 2: Add Next button validation event listener (as per instructions)
  useEffect(() => {
    const addNextButtonValidation = () => {
      // Find and enhance the Next button
      const nextBtn = document.getElementById('nextBtn') || 
                     document.querySelector('.btn-primary') || 
                     document.querySelector('[onclick*="next"]') ||
                     document.querySelector('button[type="button"]');
      
      if (nextBtn) {
        // Remove existing onclick if present
        nextBtn.removeAttribute('onclick');
        
        // Add proper validation
        const handleNextClick = (e: Event) => {
          e.preventDefault();
          
          // Check if we're on step 1
          const currentStepEl = document.querySelector('.form-step.active')?.getAttribute('data-step') || 
                               (document.querySelector('#currentStep')?.textContent) || '1';
          
          if (currentStepEl === '1' || parseInt(currentStepEl) === 1 || currentStep === 1) {
            if (validateStep1()) {
              // Only proceed if validation passes
              nextStep();
            }
          } else {
            // For other steps, proceed normally
            nextStep();
          }
        };
        
        // Remove existing listeners and add new one
        nextBtn.removeEventListener('click', handleNextClick);
        nextBtn.addEventListener('click', handleNextClick);
      }
    };
    
    // Add validation when component mounts and when step changes
    addNextButtonValidation();
    const timer = setTimeout(addNextButtonValidation, 100); // Retry in case DOM isn't ready
    
    return () => clearTimeout(timer);
  }, [currentStep]);
  const [priorityScore, setPriorityScore] = useState(0);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [projectDescriptionValue, setProjectDescriptionValue] = useState('');
  
  // ADD RESIDENTIAL STATE MANAGEMENT (preserve all existing state)
  const [showResidentialOptions, setShowResidentialOptions] = useState(false);
  const [residentialPathway, setResidentialPathway] = useState('');
  const [residentialData, setResidentialData] = useState({
    province: '',
    description: ''
  });
  const [residentialSubmissionSuccess, setResidentialSubmissionSuccess] = useState(false);
  const [remaxRedirectSuccess, setRemaxRedirectSuccess] = useState(false);

  // Micro-interaction states
  const [isStepChanging, setIsStepChanging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [priorityScoreAnimating, setPriorityScoreAnimating] = useState(false);
  
  // STEP 1 - State for form logic consistency (per step-by-step instructions)
  const [isUnitFieldDisabled, setIsUnitFieldDisabled] = useState(false);
  const [showResearchNote, setShowResearchNote] = useState(false);
  
  // CASL/PIPEDA Consent state
  const [showConsentDetails, setShowConsentDetails] = useState(false);

  const { toast } = useToast();

  // Global error handling - Step 7 security requirement
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error('Application error:', e.error);
      // Don't expose errors to users
      return true;
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // STEP 7 - Handle browser back button (per step-by-step instructions)
  useEffect(() => {
    const readiness = form.getValues('readiness');
    if (readiness) {
      handleReadinessChange();
    }
  }, []);

  // Prevent right-click on form - Step 7 security requirement  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      readiness: undefined,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      projectUnitCount: 50,
      budgetRange: undefined,
      decisionTimeline: undefined,
      constructionProvince: undefined,
      developerType: undefined,
      governmentPrograms: undefined,
      agentSupport: undefined,
      consentMarketing: false,
      ageVerification: false,
      projectDescriptionText: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      return apiRequest("POST", "/api/submit-assessment", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Assessment Submitted Successfully",
        description: "Our team will contact you according to your priority level.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const watchedValues = form.watch();

  // CORRECTED: Tier determination - handle high units with planning-long properly
  const determineCustomerTier = (units: string | number, readiness: string) => {
    const unitCount = parseInt(String(units)) || 0;
    
    // Debug log
    console.log('Determining tier - unitCount:', unitCount, 'readiness:', readiness);
    
    // CRITICAL FIX: Only force Explorer for researching or zero units
    if (readiness === 'researching' || unitCount === 0) {
      return 'tier_0_explorer';
    }

    // For planning-long: Calculate based on units but cap at Preferred level 
    if (readiness === 'planning-long') {
      if (unitCount >= 300) return 'tier_3_preferred'; // Elite downgraded to Preferred
      if (unitCount >= 150) return 'tier_3_preferred';
      if (unitCount >= 50) return 'tier_2_pioneer';
      if (unitCount >= 1) return 'tier_1_starter';
      return 'tier_0_explorer';
    }

    // Normal tiers for immediate/short/medium planning (FIXED LOGIC - was backwards!)
    if (unitCount >= 300) return 'tier_4_elite';
    if (unitCount >= 150) return 'tier_3_preferred';
    if (unitCount >= 50) return 'tier_2_pioneer';
    if (unitCount >= 1) return 'tier_1_starter';
    
    return 'tier_0_explorer';
  };

  // Handle readiness change - CRITICAL FIX for data consistency (per step-by-step instructions)
  const handleReadinessChange = () => {
    const readiness = form.getValues('readiness');
    
    if (readiness === 'researching' || readiness === 'planning-long') {
        // Force Explorer path for researchers
        form.setValue('projectUnitCount', 0);
        setIsUnitFieldDisabled(true);
        setShowResearchNote(true);
        
        // Calculate tier (will be Explorer)
        calculateTier();
        
    } else {
        // Re-enable for actual buyers
        setIsUnitFieldDisabled(false);
        setShowResearchNote(false);
        form.setValue('projectUnitCount', 50); // Reset to default
        
        // Clear tier display until units selected
        // Note: Tier indicator will be updated when calculateTier runs
    }
  };

  // Real-time tier display (CORRECTED VERSION per instructions)
  const calculateTier = () => {
    // Get both values
    const units = form.getValues('projectUnitCount');
    const readiness = form.getValues('readiness');
    
    // STEP 3 - Safety check - researchers must be Explorer (per step-by-step instructions)
    if (readiness === 'researching' || readiness === 'planning-long') {
        if (units !== 0) {
            form.setValue('projectUnitCount', 0);
            console.warn('Corrected: Researchers must have 0 units');
        }
    }
    
    // Debug to console
    console.log('calculateTier called - Units:', units, 'Readiness:', readiness);
    
    // CRITICAL FIX: If readiness is not selected yet, don't force Explorer
    // Only force Explorer if explicitly "researching" or "planning-long"
    if (!readiness && units && parseInt(String(units)) > 0) {
        // User selected units but hasn't selected readiness yet
        // Calculate tier based on units alone for preview
        const unitCount = parseInt(String(units));
        
        let tier;
        if (unitCount >= 300) tier = 'tier_4_elite';
        else if (unitCount >= 150) tier = 'tier_3_preferred';
        else if (unitCount >= 50) tier = 'tier_2_pioneer';
        else if (unitCount >= 1) tier = 'tier_1_starter';
        else tier = 'tier_0_explorer';
        
        updateTierDisplay(tier);
        return;
    }
    
    // Normal flow when both fields have values
    const tier = determineCustomerTier(units, readiness || '');
    updateTierDisplay(tier);
    
    // Check agent support
    checkAgentSupport();
  };

  // ADD this helper function to update the display (per instructions):
  const updateTierDisplay = (tier: string) => {
    const tierConfig = {
      'tier_0_explorer': {
        badge: 'Explorer Journey',
        class: 'tier-explorer',
        description: 'Perfect! Start your modular home education journey.',
        response: 'Educational resources at your pace'
      },
      'tier_1_starter': {
        badge: 'Starter Partnership',
        class: 'tier-starter',
        description: 'Great! Personal consultation and support await.',
        response: 'Personal consultation support'
      },
      'tier_2_pioneer': {
        badge: 'Pioneer Partnership',
        class: 'tier-pioneer',
        description: 'Excellent! Priority partnership attention.',
        response: 'Priority partnership attention'
      },
      'tier_3_preferred': {
        badge: 'Preferred Partnership',
        class: 'tier-preferred',
        description: 'Outstanding! Senior team ready.',
        response: 'Expedited senior team handling'
      },
      'tier_4_elite': {
        badge: 'Elite Partnership',
        class: 'tier-elite',
        description: 'VIP Status! Executive engagement confirmed.',
        response: 'Executive VIP engagement'
      }
    };
    
    const config = tierConfig[tier as keyof typeof tierConfig];
    
    // Update badge
    const badge = document.getElementById('tierBadge');
    if (badge) {
        badge.textContent = config.badge;
        badge.className = `tier-badge ${config.class}`;
    }
    
    // Update description
    const description = document.getElementById('tierDescription');
    if (description) {
        description.innerHTML = `<strong>${config.description}</strong><br>${config.response}`;
    }
    
    // Show the indicator
    const indicator = document.getElementById('tierIndicator');
    if (indicator) {
        indicator.classList.add('show');
    }
    
    // Adjust form fields
    adjustFormFields(tier);
  };

  // Show agent support for 1-10 units (as per instructions)
  const checkAgentSupport = () => {
    const units = parseInt(String(form.getValues('projectUnitCount')));
    const agentGroup = document.getElementById('agentSupportGroup');
    
    if (agentGroup) {
      if (units >= 1 && units <= 10) {
        agentGroup.style.display = 'block';
      } else {
        agentGroup.style.display = 'none';
      }
    }
  };

  // Field adjustments per tier (as per instructions)
  const adjustFormFields = (tier: string) => {
    const companyField = document.getElementById('companyName');
    const budgetGroup = document.getElementById('budget')?.parentElement;
    const governmentGroup = document.getElementById('government')?.parentElement;
    
    // Company optional for Explorer/Starter
    if (tier === 'tier_0_explorer' || tier === 'tier_1_starter') {
      if (companyField) {
        (companyField as HTMLInputElement).required = false;
        (companyField as HTMLInputElement).placeholder = 'Company Name (optional)';
      }
    } else {
      if (companyField) {
        (companyField as HTMLInputElement).required = true;
        (companyField as HTMLInputElement).placeholder = 'Company Name *';
      }
    }
    
    // Hide budget/government for Explorer
    if (tier === 'tier_0_explorer') {
      if (budgetGroup) budgetGroup.style.display = 'none';
      if (governmentGroup) governmentGroup.style.display = 'none';
    } else {
      if (budgetGroup) budgetGroup.style.display = 'block';
      if (governmentGroup) governmentGroup.style.display = 'block';
    }
  };

  // STEP 1: Debug form state corruption
  useEffect(() => {
    console.log('=== FORM DEBUG INFO ===');
    console.log('Current Step:', currentStep);
    console.log('Form values:', form.getValues());
    console.log('Form field states:', form.formState);
    console.log('Registered fields:', Object.keys(form.control._fields || {}));
    console.log('Project Description Value:', form.getValues('projectDescriptionText'));
    console.log('=======================');
  }, [currentStep, form]);

  useEffect(() => {
    calculatePriorityScore();
  }, [watchedValues]);

  // Trigger priority score animation when score changes
  useEffect(() => {
    setPriorityScoreAnimating(true);
    const timer = setTimeout(() => setPriorityScoreAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, [priorityScore]);

  // STEP 2: Aggressive field contamination fix
  useEffect(() => {
    if (currentStep === 5) {
      console.log('=== STEP 5 AGGRESSIVE FIELD RESET ===');
      
      // Multiple reset attempts to force clean state
      const forceCleanField = () => {
        form.unregister('projectDescriptionText');
        form.setValue('projectDescriptionText', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        
        // Also clear any potential cross-contamination
        const currentValues = form.getValues();
        if (currentValues.projectDescriptionText !== '') {
          console.log('Detected contamination, forcing clean:', currentValues.projectDescriptionText);
          form.resetField('projectDescriptionText', { defaultValue: '' });
        }
      };
      
      forceCleanField();
      setTimeout(forceCleanField, 10);
      setTimeout(forceCleanField, 50);
      
      console.log('Aggressive reset complete. Final value:', form.getValues('projectDescriptionText'));
    }
  }, [currentStep, form]);

  // UNIVERSAL AUTO-SCROLL SYSTEM FOR ALL DEVICES
  interface ScrollOptions {
    offset?: number;
    delay?: number;
    behavior?: 'auto' | 'smooth';
    block?: 'start' | 'center' | 'end' | 'nearest';
  }

  // Universal scroll utility with device-specific optimizations
  const universalScrollToContent = (targetSelector: string, options: ScrollOptions = {}) => {
    const {
      offset = -20,
      delay = 150,
      behavior = 'smooth',
      block = 'center'
    } = options;

    setTimeout(() => {
      const element = document.querySelector(targetSelector);
      if (!element) return;

      // Device detection for optimized scrolling
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isTablet = /(iPad|tablet)/i.test(navigator.userAgent) || 
                      (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);

      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const elementRect = element.getBoundingClientRect();
      
      // Calculate optimal scroll position based on device
      let scrollPosition;
      
      if (isMobile || isTablet) {
        // Mobile/tablet: account for browser UI and keyboards
        const safeOffset = isIOS ? -100 : -80; // iOS has different browser UI
        scrollPosition = elementRect.top + window.pageYOffset + safeOffset;
      } else {
        // Desktop: center content in viewport
        scrollPosition = elementRect.top + window.pageYOffset - (viewportHeight / 2) + (elementRect.height / 2);
      }

      // Ensure we don't scroll past the top
      scrollPosition = Math.max(0, scrollPosition);

      // Use appropriate scroll method based on device capabilities
      if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers with smooth scroll support
        window.scrollTo({
          top: scrollPosition,
          behavior: behavior as ScrollBehavior
        });
      } else {
        // Legacy devices fallback
        window.scrollTo(0, scrollPosition);
      }

      // Additional handling for iOS viewport issues
      if (isIOS) {
        setTimeout(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }, delay);
  };

  // Viewport change handler for mobile devices
  const handleViewportChange = () => {
    // Recalculate scroll positions when viewport changes (keyboard, orientation)
    if (showResidentialOptions || residentialPathway || residentialSubmissionSuccess || remaxRedirectSuccess) {
      setTimeout(() => {
        if (showResidentialOptions) {
          universalScrollToContent('[data-scroll-target="residential-options"]');
        } else if (residentialPathway === 'in-house') {
          universalScrollToContent('[data-scroll-target="residential-form"]');
        } else if (residentialSubmissionSuccess) {
          universalScrollToContent('[data-scroll-target="residential-success"]');
        } else if (remaxRedirectSuccess) {
          universalScrollToContent('[data-scroll-target="remax-success"]');
        }
      }, 300);
    }
  };

  // Add viewport change listeners
  useEffect(() => {
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, [showResidentialOptions, residentialPathway, residentialSubmissionSuccess, remaxRedirectSuccess]);

  // AUTO-SCROLL FOR ALL DYNAMIC CONTENT SCENARIOS

  // 1. Residential pathway display
  useEffect(() => {
    if (showResidentialOptions) {
      universalScrollToContent('[data-scroll-target="residential-options"]', {
        delay: 200,
        offset: -50
      });
    }
  }, [showResidentialOptions]);

  // 2. In-House form display
  useEffect(() => {
    if (residentialPathway === 'in-house') {
      universalScrollToContent('[data-scroll-target="residential-form"]', {
        delay: 200,
        offset: -30
      });
    }
  }, [residentialPathway]);

  // 3. Residential success state
  useEffect(() => {
    if (residentialSubmissionSuccess) {
      universalScrollToContent('[data-scroll-target="residential-success"]', {
        delay: 300,
        block: 'start'
      });
    }
  }, [residentialSubmissionSuccess]);

  // 4. Remax redirect success
  useEffect(() => {
    if (remaxRedirectSuccess) {
      universalScrollToContent('[data-scroll-target="remax-success"]', {
        delay: 300,
        block: 'start'
      });
    }
  }, [remaxRedirectSuccess]);

  // 5. B2B success state
  useEffect(() => {
    if (isSubmitted) {
      universalScrollToContent('[data-scroll-target="b2b-success"]', {
        delay: 300,
        block: 'start'
      });
    }
  }, [isSubmitted]);

  const calculatePriorityScore = () => {
    const values = form.getValues();
    
    // STEP 4 - Force 0 score for researchers (per step-by-step instructions)
    if (values.readiness === 'researching' || values.readiness === 'planning-long' || values.projectUnitCount === 0) {
        setPriorityScore(0);
        return;
    }
    
    let score = 0;

    // Unit count scoring
    const units = values.projectUnitCount || 0;
    if (units >= 1000) score += 50;
    else if (units >= 500) score += 40;
    else if (units >= 200) score += 30;
    else if (units >= 100) score += 20;
    else if (units >= 50) score += 10;

    // Budget scoring
    switch (values.budgetRange) {
      case "Over $50 Million": score += 40; break;
      case "$30M - $50 Million": score += 35; break;
      case "$15M - $30 Million": score += 25; break;
      case "$5M - $15 Million": score += 15; break;
      case "Under $5 Million": score += 5; break;
    }

    // Timeline scoring
    switch (values.decisionTimeline) {
      case "Immediate (0-3 months)": score += 30; break;
      case "Short-term (3-6 months)": score += 20; break;
      case "Medium-term (6-12 months)": score += 10; break;
      case "Long-term (12+ months)": score += 5; break;
    }

    // Government programs scoring
    switch (values.governmentPrograms) {
      case "Yes - Currently participating": score += 20; break;
      case "Interested - Tell us more": score += 10; break;
    }

    // Developer type scoring
    if (values.developerType === "Commercial Developer (Large Projects)" || 
        values.developerType === "Government/Municipal Developer") {
      score += 10;
    } else if (values.developerType === "Private Developer (Medium Projects)" || 
               values.developerType === "Non-Profit Housing Developer") {
      score += 5;
    }

    // Geography scoring
    if (values.constructionProvince && ["Ontario", "British Columbia", "Alberta"].includes(values.constructionProvince)) {
      score += 5;
    }

    setPriorityScore(Math.min(score, 150));
  };

  const generateTags = () => {
    const values = form.getValues();
    const tier = determineCustomerTier(values.projectUnitCount || 0, values.readiness || '');
    
    // STEP 5 - Ensure Explorer tier gets correct tags (per step-by-step instructions)
    if (tier === 'tier_0_explorer') {
        return ['Tier-0-Explorer', 'Not-Ready', 'Education-Journey', 'Priority-EDUCATION'];
    }
    
    const tags: string[] = [];

    // Partnership tier tags
    tags.push(`tier-${tier.toLowerCase()}`);

    // Readiness level tags
    if (values.readiness) {
      tags.push(`readiness-${values.readiness.replace(/\s+/g, '-').toLowerCase()}`);
      if (values.readiness.includes('immediate')) tags.push('urgent');
      if (values.readiness.includes('planning')) tags.push('planning-phase');
      if (values.readiness.includes('researching')) tags.push('early-stage');
    }

    // Unit count category tags
    const units = values.projectUnitCount || 0;
    if (units === 0) tags.push('pre-development');
    else if (units <= 2) tags.push('single-multi-unit');
    else if (units < 50) tags.push('small-scale');
    else if (units < 150) tags.push('medium-scale');
    else if (units < 300) tags.push('large-scale');
    else tags.push('enterprise-scale');

    // Budget category tags
    if (values.budgetRange) {
      if (values.budgetRange.includes('50 Million')) tags.push('premium-budget');
      else if (values.budgetRange.includes('30M')) tags.push('high-budget');
      else if (values.budgetRange.includes('15M')) tags.push('medium-budget');
      else if (values.budgetRange.includes('5M')) tags.push('standard-budget');
      else tags.push('entry-budget');
    }

    // Timeline urgency tags
    if (values.decisionTimeline) {
      if (values.decisionTimeline.includes('Immediate')) tags.push('immediate-timeline');
      else if (values.decisionTimeline.includes('Short-term')) tags.push('short-timeline');
      else if (values.decisionTimeline.includes('Medium-term')) tags.push('medium-timeline');
      else tags.push('long-timeline');
    }

    // Geographic tags
    if (values.constructionProvince) {
      tags.push(`province-${values.constructionProvince.toLowerCase().replace(/\s+/g, '-')}`);
      if (['Ontario', 'British Columbia', 'Alberta'].includes(values.constructionProvince)) {
        tags.push('priority-province');
      }
    }

    // Developer type tags
    if (values.developerType) {
      tags.push(`developer-${values.developerType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
      if (values.developerType.includes('Commercial') || values.developerType.includes('Government')) {
        tags.push('institutional-developer');
      }
    }

    // Government program tags
    if (values.governmentPrograms) {
      if (values.governmentPrograms.includes('Yes')) tags.push('government-active');
      else if (values.governmentPrograms.includes('Interested')) tags.push('government-interested');
      else tags.push('private-only');
    }

    // Priority level tags based on score
    const score = Math.min(priorityScore, 150);
    if (score >= 100) tags.push('priority-lead');
    else if (score >= 50) tags.push('qualified-lead');
    else tags.push('standard-lead');

    // Agent support tags
    if (values.agentSupport) {
      tags.push(`agent-${values.agentSupport}`);
    }

    // Consent and compliance tags
    if (values.consentMarketing) {
      tags.push('marketing-consent');
    }

    return tags.filter(Boolean);
  };

  const getPriorityMessage = () => {
    if (priorityScore >= 100) {
      return "PRIORITY PROJECT: Senior Sales Manager will contact within 1 hour after assessment submission";
    } else if (priorityScore >= 50) {
      return "QUALIFIED PROJECT: Sales Representative will contact within 4 hours after assessment submission";
    } else {
      return "FUTURE OPPORTUNITY: Lead Development team will contact within 24 hours after assessment submission";
    }
  };

  const getResponseCommitment = () => {
    if (priorityScore >= 100) {
      return "Senior Sales Manager will respond within 1 hour after assessment submission";
    } else if (priorityScore >= 50) {
      return "Sales Representative will respond within 4 hours after assessment submission";
    } else {
      return "Lead Development Team will respond within 24 hours after assessment submission";
    }
  };

  const getPriorityLevel = () => {
    if (priorityScore >= 100) {
      return "PRIORITY";
    } else if (priorityScore >= 50) {
      return "QUALIFIED";
    } else {
      return "STANDARD";
    }
  };

  const getTimelineText = (timeline: string) => {
    const timelineMap: Record<string, string> = {
      "Immediate (0-3 months)": "immediate delivery needs",
      "Short-term (3-6 months)": "short-term delivery requirements", 
      "Medium-term (6-12 months)": "medium-term delivery schedule",
      "Long-term (12+ months)": "long-term delivery planning"
    };
    return timelineMap[timeline] || timeline;
  };

  const validateCurrentStep = async () => {
    const fields = getStepFields(currentStep);
    const result = await form.trigger(fields);
    return result;
  };

  const getStepFields = (step: number): (keyof AssessmentFormData)[] => {
    switch (step) {
      case 1:
        return ["readiness", "consentMarketing", "ageVerification", "firstName", "lastName", "email", "phone", "company"];
      case 2:
        return ["projectUnitCount", "budgetRange"];
      case 3:
        return ["decisionTimeline", "constructionProvince"];
      case 4:
        return ["developerType", "governmentPrograms"];
      case 5:
        return ["projectDescriptionText"];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      // Add shake animation for invalid fields
      const currentFields = getStepFields(currentStep);
      const newErrors: Record<string, boolean> = {};
      currentFields.forEach(field => {
        if (form.formState.errors[field]) {
          newErrors[field] = true;
        }
      });
      setValidationErrors(newErrors);
      // Clear errors after animation
      setTimeout(() => setValidationErrors({}), 500);
      return;
    }

    // ADD RESIDENTIAL ROUTING LOGIC - When project_unit_count < 50, set showResidentialOptions = true instead of error
    if (currentStep === 2) {
      const units = form.getValues("projectUnitCount");
      if (units < 50) {
        setShowResidentialOptions(true);
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      // Add step transition animation
      setIsStepChanging(true);
      setTimeout(() => {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        setIsStepChanging(false);
        // Auto-scroll to next step
        universalScrollToContent(`[data-scroll-target="step-${newStep}"]`, {
          delay: 100
        });
      }, 200);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: AssessmentFormData) => {
    // Only allow submission on the final step
    if (currentStep !== TOTAL_STEPS) {
      console.warn('Form submission attempted on step', currentStep, 'but should only submit on step', TOTAL_STEPS);
      return;
    }

    // STEP 2 - Validation BEFORE payload creation (per step-by-step instructions)
    const readiness = data.readiness;
    const units = parseInt(String(data.projectUnitCount));

    if ((readiness === 'researching' || readiness === 'planning-long') && units > 0) {
        toast({
          title: "Configuration Error",
          description: "Researchers cannot have unit counts. Please refresh and try again.",
          variant: "destructive",
        });
        return;
    }

    // Force Explorer tier data consistency
    if (readiness === 'researching' || readiness === 'planning-long') {
        data.projectUnitCount = 0;
    }

    try {
      // Collect and sanitize data using SecurityModule
      const sanitizedData = {
        firstName: SecurityModule.sanitizeInput(data.firstName),
        lastName: SecurityModule.sanitizeInput(data.lastName), 
        email: SecurityModule.sanitizeInput(data.email),
        phone: SecurityModule.sanitizeInput(data.phone),
        company: SecurityModule.sanitizeInput(data.company || ''),
        readiness: SecurityModule.sanitizeInput(data.readiness || ''),
        projectUnitCount: data.projectUnitCount || 0,
        budgetRange: SecurityModule.sanitizeInput(data.budgetRange || ''),
        decisionTimeline: SecurityModule.sanitizeInput(data.decisionTimeline || ''),
        constructionProvince: SecurityModule.sanitizeInput(data.constructionProvince),
        developerType: SecurityModule.sanitizeInput(data.developerType || ''),
        governmentPrograms: SecurityModule.sanitizeInput(data.governmentPrograms || ''),
        agentSupport: SecurityModule.sanitizeInput(data.agentSupport || ''),
        projectDescriptionText: SecurityModule.sanitizeInput(projectDescriptionValue || '').substring(0, 500),
        consentMarketing: data.consentMarketing,
        ageVerification: data.ageVerification
      };

      // Security validation
      const validation = validateFormData(sanitizedData);
      
      if (validation.bot) {
        // Silently handle bot submissions
        toast({
          title: "Thank you!",
          description: "Your submission is being processed.",
        });
        setTimeout(() => {
          setIsSubmitted(true);
        }, 1000);
        return;
      }

      if (!validation.valid) {
        toast({
          title: "Validation Error", 
          description: validation.errors?.join('\n') || "Please check your form data",
          variant: "destructive",
        });
        return;
      }

      // Calculate tier and score with sanitized data
      const customerTier = determineCustomerTier(sanitizedData.projectUnitCount, sanitizedData.readiness);
      const priorityLevel = getPriorityLevel();
      const tags = generateTags();
      const sessionToken = SecurityModule.generateToken();

      // Build secure payload
      const securePayload = {
        // Session validation
        sessionToken: sessionToken,
        timestamp: new Date().toISOString(),
        
        // Sanitized form data
        data: sanitizedData,
        
        // Customer Journey classification
        customerTier: customerTier,
        priorityScore: Math.min(Math.max(priorityScore, 0), 150),
        priorityLevel: priorityLevel,
        
        // Enhanced routing logic
        buildCanadaEligible: (sanitizedData.projectUnitCount >= 300 || 
          (sanitizedData.projectUnitCount >= 200 && sanitizedData.developerType === 'Government/Municipal Developer')) ? 'Yes' : 'No',
        
        // Comprehensive tags
        tags: tags.join(','),
        
        // Pipeline routing
        pipeline: 'ILLÜMMAA Customer Journey',
        stage: customerTier === 'tier_0_explorer' ? 'Education & Awareness' : 'Initial Interest',
        
        // Privacy & Security compliance
        consent: {
          marketing: sanitizedData.consentMarketing,
          timestamp: new Date().toISOString(),
          version: 'v2.0'
        },
        dataSharedWithThirdParty: false,
        
        // Metadata
        source: 'Website Form',
        userAgent: navigator.userAgent.substring(0, 200)
      };

      // CASL/PIPEDA Consent Record (as per instructions)
      const consentRecord = {
        timestamp: new Date().toISOString(),
        version: 'v2.0-casl-compliant',
        communicationsConsent: sanitizedData.consentMarketing,
        ageVerified: sanitizedData.ageVerification,
        withdrawalMethod: 'privacy@illummaa.ca or text STOP'
      };
      
      // Add consent record to payload
      (securePayload as any).consentRecord = consentRecord;

      // STEP 6 - Update payload for Explorer tier (per step-by-step instructions)
      if (customerTier === 'tier_0_explorer') {
        securePayload.priorityScore = 0; // Researchers always score 0
        securePayload.stage = 'Education & Awareness'; // Different pipeline stage
        (securePayload as any).isEducationOnly = 'Yes';
        securePayload.tags = 'Tier-0-Explorer,Not-Ready,Education-Journey,Priority-EDUCATION';
        securePayload.data.projectUnitCount = 0; // Force 0 units
      }

      console.log("Secure form submission with Customer Journey data:", {
        tier: customerTier,
        priorityLevel,
        priorityScore,
        tags,
        consentMarketing: sanitizedData.consentMarketing,
        sessionToken: sessionToken.substring(0, 8) + '...' // Only log first 8 chars for security
      });

      // Submit with enhanced security
      submitMutation.mutate(securePayload as any);

    } catch (error) {
      console.error('Secure submission error:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 fade-in-up" data-testid="step-contact-info" data-scroll-target="step-1">
            <h3 className="font-display font-bold text-2xl mb-6 slide-in-right" data-testid="heading-step-1">Contact Information</h3>
            
            {/* Readiness Question - FIRST question as per instructions */}
            <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <FormField
                control={form.control}
                name="readiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-readiness" className="text-lg font-semibold">Where are you in your modular home journey? *</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); handleReadinessChange(); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-readiness">
                          <SelectValue placeholder="Please select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="researching">Just researching - want to learn more</SelectItem>
                        <SelectItem value="planning-long">Planning to buy in 12+ months</SelectItem>
                        <SelectItem value="planning-medium">Actively looking (6-12 months)</SelectItem>
                        <SelectItem value="planning-short">Ready to move forward (3-6 months)</SelectItem>
                        <SelectItem value="immediate">I need a solution now (0-3 months)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Enhanced CASL/PIPEDA Compliant Consent Section */}
            <div className="consent-section-enhanced">
              <div className="consent-primary">
                <FormField
                  control={form.control}
                  name="consentMarketing"
                  render={({ field }) => (
                    <FormItem>
                      <label className="consent-checkbox-label">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            id="consentCommunications" 
                            name="consentCommunications" 
                            checked={field.value}
                            onChange={field.onChange}
                            required 
                            className="consent-checkbox-input"
                            data-testid="checkbox-consent-communications"
                          />
                        </FormControl>
                        <span className="consent-checkbox-custom"></span>
                        <span className="consent-text-main">
                          I consent to ILLÜMMAA contacting me via email, phone, and text about modular home solutions and understand I can unsubscribe anytime
                          <button 
                            type="button" 
                            className="consent-details-toggle" 
                            onClick={() => setShowConsentDetails(!showConsentDetails)}
                            aria-label="Show details"
                            data-testid="button-consent-details-toggle"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 9l6 6 6-6"/>
                            </svg>
                          </button>
                        </span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={`consent-details-panel ${showConsentDetails ? 'expanded' : ''}`}>
                <div className="consent-details-content">
                  <div className="consent-grid">
                    <div className="consent-column">
                      <h5>Communication Methods:</h5>
                      <ul>
                        <li>Email at address provided</li>
                        <li>Text/SMS messages</li>
                        <li>Phone calls when appropriate</li>
                      </ul>
                    </div>
                    <div className="consent-column">
                      <h5>Types of Communications:</h5>
                      <ul>
                        <li>Response to your inquiry</li>
                        <li>Product information</li>
                        <li>Educational resources</li>
                        <li>Event invitations</li>
                      </ul>
                    </div>
                  </div>
                  <div className="consent-footer">
                    <p>Consent is voluntary and can be withdrawn anytime by emailing <strong>privacy@illummaa.ca</strong> or texting STOP. View our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</p>
                  </div>
                </div>
              </div>

              <div className="consent-age-verification">
                <FormField
                  control={form.control}
                  name="ageVerification"
                  render={({ field }) => (
                    <FormItem>
                      <label className="consent-checkbox-label">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            id="ageVerification" 
                            name="ageVerification" 
                            checked={field.value}
                            onChange={field.onChange}
                            required 
                            className="consent-checkbox-input"
                            data-testid="checkbox-age-verification"
                          />
                        </FormControl>
                        <span className="consent-checkbox-custom"></span>
                        <span className="consent-text-secondary">I am 18+ years old</span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className={`field-focus ${validationErrors.firstName ? 'error-shake' : ''}`}>
                    <FormLabel data-testid="label-first-name" className="floating-label">First Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        {...field} 
                        data-testid="input-first-name"
                        className="focus-ring interactive-hover transition-all duration-200"
                        onFocus={() => setFieldTouched({...fieldTouched, firstName: true})}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-last-name">Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-email">Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@company.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-phone">Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1XXXXXXXXXX" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-company">Company Name *</FormLabel>
                      <FormControl>
                        <Input id="companyName" placeholder="Your Development Company" {...field} data-testid="input-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6" data-testid="step-project-details" data-scroll-target="step-2">
            <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-step-2">Project Details</h3>
            <FormField
              control={form.control}
              name="projectUnitCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-unit-count">Number of Units *</FormLabel>
                  <FormDescription>
                    Select the scope that best matches your project needs
                  </FormDescription>
                  <Select 
                    onValueChange={(value) => { field.onChange(parseInt(value)); calculateTier(); checkAgentSupport(); }} 
                    defaultValue={field.value?.toString()}
                    disabled={isUnitFieldDisabled}
                  >
                    <FormControl>
                      <SelectTrigger 
                        data-testid="select-unit-count"
                        className={isUnitFieldDisabled ? "bg-gray-100 text-gray-600" : ""}
                      >
                        <SelectValue placeholder="Please select..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isUnitFieldDisabled ? (
                        <SelectItem value="0">Just exploring options</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="0">Just exploring options</SelectItem>
                          <SelectItem value="1">1 home</SelectItem>
                          <SelectItem value="2">2 homes</SelectItem>
                          <SelectItem value="25">3-49 units (Starter)</SelectItem>
                          <SelectItem value="75">50-149 units (Pioneer)</SelectItem>
                          <SelectItem value="200">150-299 units (Preferred)</SelectItem>
                          <SelectItem value="500">300+ units (Elite)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {showResearchNote && (
                    <p className="text-sm text-gray-600 italic mt-1">
                      Education journey - no specific project yet
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tier Indicator - Added after unit selection as per instructions */}
            <div className="tier-indicator hidden" id="tierIndicator" data-testid="tier-indicator">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                <p className="font-semibold text-lg mb-3" data-testid="tier-label">
                  <strong>Your Partnership Level:</strong>
                </p>
                <span className="tier-badge inline-block px-4 py-2 rounded-full font-semibold text-white mb-3" id="tierBadge" data-testid="tier-badge"></span>
                <p className="tier-description text-gray-700 mb-2" id="tierDescription" data-testid="tier-description"></p>
                <p className="tier-progress text-sm text-gray-600 mb-3" id="tierProgress" data-testid="tier-progress"></p>
                <div className="disclaimer text-xs text-gray-500 italic" data-testid="tier-disclaimer">
                  *Response times vary based on project urgency and current volume.
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-budget-range">Project Budget Range (CAD) *</FormLabel>
                  <FormDescription>
                    Total project budget for modular construction and site preparation
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="budget" data-testid="select-budget-range">
                        <SelectValue placeholder="Select budget range..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Under $5 Million">Under $5 Million</SelectItem>
                      <SelectItem value="$5M - $15 Million">$5M - $15 Million</SelectItem>
                      <SelectItem value="$15M - $30 Million">$15M - $30 Million</SelectItem>
                      <SelectItem value="$30M - $50 Million">$30M - $50 Million</SelectItem>
                      <SelectItem value="Over $50 Million">Over $50 Million</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6" data-testid="step-timeline-location" data-scroll-target="step-3">
            <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-step-3">Delivery Schedule & Location</h3>
            <FormField
              control={form.control}
              name="decisionTimeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-decision-timeline">Delivery Timeline *</FormLabel>
                  <FormDescription>
                    When modular units need to be completed and delivered for project scheduling
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-decision-timeline">
                        <SelectValue placeholder="Select delivery timeline..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Immediate (0-3 months)">Immediate delivery (0-3 months)</SelectItem>
                      <SelectItem value="Short-term (3-6 months)">Short-term delivery (3-6 months)</SelectItem>
                      <SelectItem value="Medium-term (6-12 months)">Medium-term delivery (6-12 months)</SelectItem>
                      <SelectItem value="Long-term (12+ months)">Long-term delivery (12+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Agent Support Question - Added after timeline field as per instructions */}
            <div className="form-group hidden" id="agentSupportGroup" data-testid="agent-support-group">
              <FormField
                control={form.control}
                name="agentSupport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-agent-support">Do you have a real estate agent?</FormLabel>
                    <Select onValueChange={(value) => { 
                      field.onChange(value);
                      const remaxNotice = document.getElementById('remaxNotice');
                      if (remaxNotice) {
                        remaxNotice.style.display = value === 'no-agent' ? 'block' : 'none';
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-agent-support">
                          <SelectValue placeholder="Please select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-direct">No - I want to work directly with ILLÜMMAA</SelectItem>
                        <SelectItem value="no-agent">No - I'd like real estate agent support</SelectItem>
                        <SelectItem value="yes">Yes - I have an agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="remax-redirect-notice hidden mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg" id="remaxNotice" data-testid="remax-notice">
                <small className="text-blue-700">
                  <strong>Note:</strong> Selecting agent support will redirect you to Remax.ca where you'll register separately. Your information stays with ILLÜMMAA only.
                </small>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="constructionProvince"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-construction-province">Installation Province *</FormLabel>
                  <FormDescription>
                    Province/territory where modular units will be installed for building code compliance
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-construction-province">
                        <SelectValue placeholder="Select installation province..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ontario">Ontario</SelectItem>
                      <SelectItem value="British Columbia">British Columbia</SelectItem>
                      <SelectItem value="Alberta">Alberta</SelectItem>
                      <SelectItem value="Quebec">Quebec</SelectItem>
                      <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                      <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                      <SelectItem value="Manitoba">Manitoba</SelectItem>
                      <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                      <SelectItem value="Newfoundland and Labrador">Newfoundland and Labrador</SelectItem>
                      <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                      <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                      <SelectItem value="Nunavut">Nunavut</SelectItem>
                      <SelectItem value="Yukon">Yukon</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6" data-testid="step-developer-classification" data-scroll-target="step-4">
            <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-step-4">Developer Classification</h3>
            <FormField
              control={form.control}
              name="developerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-developer-type">Developer Type *</FormLabel>
                  <FormDescription>
                    Type of development organization for customized sales approach and volume pricing
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-developer-type">
                        <SelectValue placeholder="Select developer type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Commercial Developer (Large Projects)">Commercial Developer (Large Projects)</SelectItem>
                      <SelectItem value="Government/Municipal Developer">Government/Municipal Developer</SelectItem>
                      <SelectItem value="Non-Profit Housing Developer">Non-Profit Housing Developer</SelectItem>
                      <SelectItem value="Private Developer (Medium Projects)">Private Developer (Medium Projects)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="governmentPrograms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-government-programs">Government Programs *</FormLabel>
                  <FormDescription>
                    Government housing program participation for compliance and incentive eligibility
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="government" data-testid="select-government-programs">
                        <SelectValue placeholder="Select participation level..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes - Currently participating">Yes - Currently participating</SelectItem>
                      <SelectItem value="Interested - Tell us more">Interested - Tell us more</SelectItem>
                      <SelectItem value="No - Private development only">No - Private development only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6" data-testid="step-submission" data-scroll-target="step-5">
            <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-step-5">Project Description & Submission</h3>
            {/* EMERGENCY: Isolated Project Description Component */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" data-testid="label-project-description">
                Project Description (Optional)
              </label>
              <textarea
                value={projectDescriptionValue}
                onChange={(e) => setProjectDescriptionValue(e.target.value)}
                placeholder="Describe your project requirements, timeline, or any specific details..."
                className="flex min-h-[120px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={1000}
                rows={4}
                data-testid="textarea-project-description"
              />
              <div className="text-sm text-muted-foreground mt-1" data-testid="text-char-count">
                {projectDescriptionValue.length}/1000 characters
              </div>
            </div>
            
            {/* Enhanced Priority Score Display with Animation */}
            <div className="bg-gradient-to-br from-muted to-accent/10 rounded-2xl p-6 bounce-in" data-testid="container-priority-score">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2" data-testid="label-priority-score">Your Priority Score</div>
                <div className={`priority-score text-5xl font-bold mb-2 transition-all duration-700 ${priorityScoreAnimating ? 'priority-score-animate scale-110' : 'scale-100'}`} data-testid="text-priority-score">
                  {priorityScore}
                </div>
                <div className="text-sm text-muted-foreground mb-4" data-testid="text-score-range">out of 150 points</div>
                <div className={`text-sm font-medium transition-all duration-500 ${priorityScore >= 100 ? 'text-green-600 animate-pulse' : priorityScore >= 50 ? 'text-blue-600' : 'text-yellow-600'}`} data-testid="text-priority-message">
                  {getPriorityMessage()}
                </div>
                {/* Visual score indicator */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      priorityScore >= 100 ? 'bg-green-500' : 
                      priorityScore >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((priorityScore / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Visual emphasis for submission requirement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-blue-800 text-sm font-medium text-center">
                  Complete your submission below to activate this response timeline
                </p>
              </div>
            </div>
            
            {/* Response Time Commitment */}
            <div className="bg-card border border-border rounded-2xl p-6" data-testid="container-response-commitment">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="text-primary" size={20} />
                <span className="font-semibold" data-testid="label-response-commitment">Response Time Commitment</span>
              </div>
              <div className="text-muted-foreground" data-testid="text-response-commitment">
                {getResponseCommitment()}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ADD RESIDENTIAL HANDLERS (do not modify any existing handlers)
  const handleInHouseSelection = () => {
    setResidentialPathway('in-house');
  };

  // Secure Remax redirect function - NEVER pass user data in URL
  const secureRemaxRedirect = () => {
    const REMAX_URL = 'https://www.remax.ca/';
    
    // Validate URL
    try {
      const url = new URL(REMAX_URL);
      if (url.protocol !== 'https:' || url.hostname !== 'www.remax.ca') {
        console.error('Invalid redirect URL');
        return;
      }
      
      // Clear sensitive data from memory (reset form)
      form.reset();
      
      // Clear session data
      SecurityModule.sessionManager.clear();
      
      // Open with security attributes
      window.open(REMAX_URL, '_blank', 'noopener,noreferrer');
      
      setRemaxRedirectSuccess(true);
      toast({
        title: "Redirecting to Remax Partnership",
        description: "You will be redirected to our Remax partnership program.",
      });
      
    } catch (error) {
      console.error('Redirect failed:', error);
      toast({
        title: "Redirect Error",
        description: "Unable to redirect to Remax. Please visit remax.ca directly.",
        variant: "destructive",
      });
    }
  };


  const handleResidentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const residentialPayload = {
      first_name: form.getValues('firstName'),
      last_name: form.getValues('lastName'),
      email: form.getValues('email'),
      phone: form.getValues('phone'),
      company: form.getValues('company'),
      source: "ILLÜMMAA Website - Residential",
      project_unit_count: form.getValues('projectUnitCount'),
      construction_province: residentialData.province,
      project_description: residentialData.description,
      residential_pathway: "In-House Service",
      lead_type: "B2C Residential",
      submission_timestamp: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/submit-residential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residentialPayload),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResidentialSubmissionSuccess(true);
        toast({
          title: "Residential inquiry submitted successfully!",
          description: "Our residential specialist will contact you within 24-48 hours.",
        });
      } else {
        toast({
          title: "Error",
          description: "Error submitting residential inquiry. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Residential submission error:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <section id="developer-qualification" className="py-20 qualification-section" data-testid="section-assessment-success" data-scroll-target="b2b-success">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="text-green-600" size={32} />
            </div>
            <h2 className="font-display font-bold text-3xl mb-4" data-testid="heading-success">Assessment Submitted Successfully!</h2>
            <p className="text-xl text-muted-foreground mb-6" data-testid="text-success-message">
              Thank you for your submission. Our team will contact you according to your priority level.
            </p>
            <div className="text-primary font-semibold text-lg" data-testid="text-final-score">
              Final Priority Score: {priorityScore}/150
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="developer-qualification" className="py-20 qualification-section" data-testid="section-assessment">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {!residentialSubmissionSuccess && !remaxRedirectSuccess && (
            <>
              <div className="text-center mb-12">
                <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-assessment-title">
                  Discover Your Partnership Path
                </h2>
                <p className="text-xl text-muted-foreground" data-testid="text-assessment-subtitle">
                  From first-time learners to enterprise developers - find your place in Canada's modular revolution
                </p>
              </div>
          
          {/* Enhanced Progress Bar with Animation */}
          <div className="mb-8 fade-in-up" data-testid="container-progress">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground" data-testid="label-progress">Progress</span>
              <span className={`text-sm font-medium text-primary step-indicator ${currentStep === TOTAL_STEPS ? 'active' : ''}`} data-testid="text-step-indicator">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full progress-bar-fill relative" 
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                data-testid="progress-bar"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < currentStep 
                      ? 'bg-primary scale-110 shadow-lg' 
                      : i === currentStep - 1 
                        ? 'bg-accent scale-125 animate-pulse' 
                        : 'bg-border scale-100'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Assessment Form */}
          <Form {...form}>
            <form onSubmit={(e) => {
              // Always prevent default form submission - we handle it manually via buttons
              e.preventDefault();
              e.stopPropagation();
              console.log('Form submit prevented, current step:', currentStep);
              return false;
            }} onContextMenu={handleContextMenu} className={`bg-card rounded-2xl p-8 shadow-xl transition-all duration-500 ${isStepChanging ? 'form-slide-out' : 'form-slide-in'}`} data-testid="form-assessment">
              
              {/* Honeypot for bot detection */}
              <div style={{opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1}}>
                <label htmlFor="email_confirm">Leave this field empty</label>
                <input 
                  type="text" 
                  name="email_confirm" 
                  id="email_confirm" 
                  tabIndex={-1} 
                  autoComplete="off"
                  onChange={() => {}} // Prevent React warnings
                />
              </div>
              
              <div className={`transition-all duration-300 ${isStepChanging ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {renderStep()}
              </div>
              
              {/* Universal Responsive Button Layout - Professional Multi-Device Optimization */}
              <div className="mt-8 pt-6 border-t border-border fade-in-up w-full" data-testid="container-form-navigation">
                {currentStep < TOTAL_STEPS ? (
                  <>
                    {/* Mobile Layout (< 640px) - Stacked with proper spacing */}
                    <div className="block sm:hidden space-y-4">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextStep();
                        }}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg min-h-[52px] text-center leading-tight group transition-all duration-300 hover:scale-105 ${isStepChanging ? 'button-loading' : ''}`}
                        disabled={isStepChanging}
                        data-testid="button-next"
                      >
                        {isStepChanging ? (
                          <span>Processing...</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-base font-semibold">Next</div>
                            <div className="text-sm opacity-90">Continue Assessment</div>
                          </div>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className={`w-full border-2 border-gray-300 hover:border-gray-400 py-3 px-6 min-h-[48px] font-medium transition-all duration-300 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                        disabled={currentStep === 1}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Previous
                      </Button>
                    </div>
                    
                    {/* Tablet Layout (640px - 1024px) - Horizontal with generous spacing */}
                    <div className="hidden sm:flex lg:hidden justify-between items-center gap-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className={`border-2 border-gray-300 hover:border-gray-400 py-3 px-8 font-medium min-w-[140px] transition-all duration-300 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                        disabled={currentStep === 1}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Previous
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextStep();
                        }}
                        className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg flex-1 max-w-md group transition-all duration-300 hover:scale-105 ${isStepChanging ? 'button-loading' : ''}`}
                        disabled={isStepChanging}
                        data-testid="button-next"
                      >
                        {isStepChanging ? (
                          <>
                            <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Next - Continue Assessment
                            <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Desktop Layout (1024px+) - Professional spacing and alignment */}
                    <div className="hidden lg:flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className={`border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 py-3 px-8 font-medium min-w-[160px] transition-all duration-200 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                        disabled={currentStep === 1}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-3 transition-transform duration-200 group-hover:-translate-x-1" />
                        Previous
                      </Button>
                      
                      <div className="flex-1 flex justify-end">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            nextStep();
                          }}
                          className={`bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[300px] text-lg group ${isStepChanging ? 'button-loading' : ''}`}
                          disabled={isStepChanging}
                          data-testid="button-next"
                        >
                          {isStepChanging ? (
                            <span className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Processing...
                            </span>
                          ) : (
                            <>
                              Next - Continue Assessment
                              <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" size={16} />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mobile Layout (< 640px) - Stacked submit button */}
                    <div className="block sm:hidden space-y-4">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)(e);
                        }}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg min-h-[52px] text-center leading-tight group transition-all duration-300 hover:scale-105 ${submitMutation.isPending ? 'button-loading' : ''}`}
                        disabled={submitMutation.isPending}
                        data-testid="button-submit"
                      >
                        {submitMutation.isPending ? (
                          <span>Submitting Assessment...</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-base font-semibold">Submit Assessment</div>
                            <div className="text-sm opacity-90">Secure Your {getPriorityLevel()} Response Time</div>
                          </div>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className={`w-full border-2 border-gray-300 hover:border-gray-400 py-3 px-6 min-h-[48px] font-medium transition-all duration-300 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                        disabled={currentStep === 1}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Previous
                      </Button>
                    </div>
                    
                    {/* Tablet Layout (640px - 1024px) - Horizontal submit layout */}
                    <div className="hidden sm:flex lg:hidden justify-between items-center gap-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className={`border-2 border-gray-300 hover:border-gray-400 py-3 px-8 font-medium min-w-[140px] transition-all duration-300 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                        disabled={currentStep === 1}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                        Previous
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)(e);
                        }}
                        className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg flex-1 max-w-md group transition-all duration-300 hover:scale-105 ${submitMutation.isPending ? 'button-loading' : ''}`}
                        disabled={submitMutation.isPending}
                        data-testid="button-submit"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Submitting Assessment...
                          </>
                        ) : (
                          <>
                            Submit Assessment - Secure Your {getPriorityLevel()} Response Time
                            <Send className="ml-2 transition-transform duration-200 group-hover:translate-x-1" size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Desktop Layout (1024px+) - Professional submit layout */}
                    <div className="hidden lg:flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className={`border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 py-3 px-8 font-medium min-w-[160px] transition-all duration-200 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                        disabled={currentStep === 1}
                        data-testid="button-previous"
                      >
                        <ArrowLeft className="w-4 h-4 mr-3 transition-transform duration-200 group-hover:-translate-x-1" />
                        Previous
                      </Button>
                      
                      <div className="flex-1 flex justify-end">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)(e);
                          }}
                          className={`bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[400px] text-lg group ${submitMutation.isPending ? 'button-loading' : ''}`}
                          disabled={submitMutation.isPending}
                          data-testid="button-submit"
                        >
                          {submitMutation.isPending ? (
                            <span className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Submitting Assessment...
                            </span>
                          ) : (
                            <>
                              Submit Assessment - Secure Your {getPriorityLevel()} Response Time
                              <Send className="ml-2 transition-transform duration-200 group-hover:translate-x-1" size={16} />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </form>
          </Form>

          {/* RESIDENTIAL PATHWAY - COMPLETE CONDITIONAL REPLACEMENT */}
          {showResidentialOptions && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
            <div className="space-y-6 mt-8" data-scroll-target="residential-options">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Residential Projects (Under 50 Units)</h2>
                <p className="text-gray-600">ILLÜMMAA offers two pathways for residential projects:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="cursor-pointer card-hover group transition-all duration-300 hover:border-primary/50" onClick={() => handleInHouseSelection()}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-200">In-House First-Time Home Buyer Service</h3>
                    <ul className="space-y-2 text-gray-600 mb-4">
                      <li className="transition-transform duration-200 group-hover:translate-x-1">• Direct consultation with ILLÜMMAA specialists</li>
                      <li className="transition-transform duration-200 group-hover:translate-x-1 delay-75">• No real estate agents involved</li>
                      <li className="transition-transform duration-200 group-hover:translate-x-1 delay-150">• For clients preferring direct builder relationship</li>
                    </ul>
                    <Button className="w-full interactive-hover group-hover:scale-105 transition-all duration-200">Choose In-House Service</Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer card-hover group transition-all duration-300 hover:border-accent/50" onClick={() => secureRemaxRedirect()}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors duration-200">Remax Partnership Program</h3>
                    <ul className="space-y-2 text-gray-600 mb-4">
                      <li className="transition-transform duration-200 group-hover:translate-x-1">• Full real estate agent support</li>
                      <li className="transition-transform duration-200 group-hover:translate-x-1 delay-75">• Land acquisition assistance</li>
                      <li className="transition-transform duration-200 group-hover:translate-x-1 delay-150">• Complete guided home buying process</li>
                    </ul>
                    <Button className="w-full interactive-hover group-hover:scale-105 transition-all duration-200">Choose Remax Partnership</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {residentialPathway === 'in-house' && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
            <div className="space-y-6 mt-8" data-scroll-target="residential-form">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">In-House Residential Service</h2>
                <p className="text-gray-600">We'll connect you with our residential specialists.</p>
              </div>
              
              <form onSubmit={handleResidentialSubmit} className="space-y-4">
                <div>
                  <Label>Number of Units</Label>
                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                    {form.watch('projectUnitCount')} units (from assessment)
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Using the unit count from your Partner Qualification Assessment
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="res_province">Construction Province</Label>
                  <Select value={residentialData.province} onValueChange={(value) => setResidentialData({...residentialData, province: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ontario">Ontario</SelectItem>
                      <SelectItem value="British Columbia">British Columbia</SelectItem>
                      <SelectItem value="Alberta">Alberta</SelectItem>
                      <SelectItem value="Quebec">Quebec</SelectItem>
                      <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                      <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                      <SelectItem value="Manitoba">Manitoba</SelectItem>
                      <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                      <SelectItem value="Newfoundland and Labrador">Newfoundland and Labrador</SelectItem>
                      <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                      <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                      <SelectItem value="Nunavut">Nunavut</SelectItem>
                      <SelectItem value="Yukon">Yukon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="res_description">Project Description (Optional)</Label>
                  <Textarea 
                    id="res_description" 
                    placeholder="Describe your residential project requirements..." 
                    rows={4}
                    value={residentialData.description}
                    onChange={(e) => setResidentialData({...residentialData, description: e.target.value})}
                  />
                </div>
                
                <Button type="submit" className="w-full">Submit Residential Inquiry</Button>
              </form>
            </div>
          )}
            </>
          )}

          {/* SUCCESS STATES - REPLACE ALL CONTENT */}
          {residentialSubmissionSuccess && (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-scroll-target="residential-success">
              <div className="max-w-md w-full space-y-8 text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Residential Inquiry Submitted Successfully!</h1>
                <p className="text-gray-600">
                  Our residential specialist will contact you within 24-48 hours to discuss your {form.getValues('projectUnitCount')}-unit project in {residentialData.province}.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="font-semibold text-gray-900 mb-2">What's Next:</h3>
                  <ul className="text-sm text-gray-700 space-y-1 text-left">
                    <li>• Confirmation email sent to your inbox</li>
                    <li>• Residential specialist will review your project</li>
                    <li>• Direct consultation within 24-48 hours</li>
                    <li>• Personalized service without real estate agents</li>
                  </ul>
                </div>
                {/* REMOVED Start New Assessment button */}
              </div>
            </div>
          )}

          {remaxRedirectSuccess && (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-scroll-target="remax-success">
              <div className="max-w-md w-full space-y-8 text-center">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M14 6h-2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Redirected to Remax Partnership</h1>
                <p className="text-gray-600">
                  We've opened the Remax partnership program in a new browser tab. Our Remax partners will guide you through the complete home buying process with full real estate agent support.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <p className="text-sm text-gray-700">
                    <strong>Next steps:</strong> Complete your information on the Remax website to connect with a qualified real estate agent in your area who specializes in new construction projects.
                  </p>
                </div>
                {/* REMOVED Start New Assessment button */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Under 50 Units Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md" data-testid="modal-rejection">
          <DialogHeader>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="text-blue-600" size={32} />
            </div>
            <DialogTitle className="text-center" data-testid="heading-rejection-modal">Residential Program Available</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="text-muted-foreground mb-6" data-testid="text-rejection-message">
              We appreciate your interest. Projects under 50 units are handled through our individual home program. 
              Our residential team specializes in smaller developments and custom solutions.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowRejectionModal(false)} 
                className="w-full btn-primary"
                data-testid="button-contact-residential"
              >
                Contact Residential Team
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRejectionModal(false)} 
                className="w-full"
                data-testid="button-close-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
