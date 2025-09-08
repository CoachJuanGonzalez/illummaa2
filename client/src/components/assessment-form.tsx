import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

const TOTAL_STEPS = 5;

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
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

  const { toast } = useToast();

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
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
    let score = 0;
    const values = form.getValues();

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
    if (["Ontario", "British Columbia", "Alberta"].includes(values.constructionProvince)) {
      score += 5;
    }

    setPriorityScore(score);
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

  const validateCurrentStep = async () => {
    const fields = getStepFields(currentStep);
    const result = await form.trigger(fields);
    return result;
  };

  const getStepFields = (step: number): (keyof AssessmentFormData)[] => {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "email", "phone", "company"];
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
    
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Include the isolated project description value
    const submissionData = {
      ...data,
      projectDescriptionText: projectDescriptionValue
    };
    console.log("Form submitted with isolated description:", submissionData);
    submitMutation.mutate(submissionData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 fade-in-up" data-testid="step-contact-info" data-scroll-target="step-1">
            <h3 className="font-display font-bold text-2xl mb-6 slide-in-right" data-testid="heading-step-1">Contact Information</h3>
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
                        <Input placeholder="Your Development Company" {...field} data-testid="input-company" />
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
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="1000" 
                      placeholder="Enter number of units (1-1000)" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          field.onChange('');
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1 && numValue <= 1000) {
                            field.onChange(numValue);
                          }
                          // Reject values outside 1-1000 range
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          field.onChange(50); // Default to 50 (commercial pathway)
                          e.target.value = '50';
                        }
                      }}
                      onFocus={(e) => {
                        e.target.select(); // Select all text for easy editing
                      }}
                      data-testid="input-unit-count"
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value > 0 && field.value < 50 && (
                    <div className="text-amber-600 text-sm mt-1" data-testid="warning-unit-count">
                      ⚠️ Projects under 50 units are handled through our residential program.
                    </div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-budget-range">Budget Range (CAD) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-budget-range">
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
            <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-step-3">Timeline & Location</h3>
            <FormField
              control={form.control}
              name="decisionTimeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-decision-timeline">Decision Timeline *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-decision-timeline">
                        <SelectValue placeholder="Select timeline..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Immediate (0-3 months)">Immediate (0-3 months)</SelectItem>
                      <SelectItem value="Short-term (3-6 months)">Short-term (3-6 months)</SelectItem>
                      <SelectItem value="Medium-term (6-12 months)">Medium-term (6-12 months)</SelectItem>
                      <SelectItem value="Long-term (12+ months)">Long-term (12+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constructionProvince"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-construction-province">Construction Province *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-construction-province">
                        <SelectValue placeholder="Select province..." />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-government-programs">
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

  const handleRemaxSelection = () => {
    window.open('https://www.remax.ca/', '_blank');
    setRemaxRedirectSuccess(true);
    toast({
      title: "Redirecting to Remax Partnership",
      description: "You will be redirected to our Remax partnership program.",
    });
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
                  Partner Qualification Assessment
                </h2>
                <p className="text-xl text-muted-foreground" data-testid="text-assessment-subtitle">
                  Join Canada's leading developers. Complete our assessment to unlock partnership opportunities.
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
            }} className={`bg-card rounded-2xl p-8 shadow-xl transition-all duration-500 ${isStepChanging ? 'form-slide-out' : 'form-slide-in'}`} data-testid="form-assessment">
              <div className={`transition-all duration-300 ${isStepChanging ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {renderStep()}
              </div>
              
              {/* Enhanced Form Navigation with Animations */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border fade-in-up" data-testid="container-form-navigation">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  className={`transition-all duration-300 interactive-hover ${currentStep === 1 ? "invisible" : "hover:scale-105"}`}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" size={16} />
                  Previous
                </Button>
                
                <div className="flex-1"></div>
                
                {currentStep < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nextStep();
                    }}
                    className={`btn-primary group transition-all duration-300 hover:scale-105 ${isStepChanging ? 'button-loading' : ''}`}
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
                        Next
                        <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" size={16} />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)(e);
                    }}
                    className={`w-full bg-green-600 hover:bg-green-700 text-lg py-4 font-semibold group transition-all duration-300 hover:scale-105 ${submitMutation.isPending ? 'button-loading' : ''}`}
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
                
                <Card className="cursor-pointer card-hover group transition-all duration-300 hover:border-accent/50" onClick={() => handleRemaxSelection()}>
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
