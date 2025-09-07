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
    units: '',
    province: '',
    description: ''
  });
  const [residentialSubmissionSuccess, setResidentialSubmissionSuccess] = useState(false);
  const [remaxRedirectSuccess, setRemaxRedirectSuccess] = useState(false);

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
      return "PRIORITY PROJECT: Senior Sales Manager will contact within 1 hour";
    } else if (priorityScore >= 50) {
      return "QUALIFIED PROJECT: Sales Representative will contact within 4 hours";
    } else {
      return "FUTURE OPPORTUNITY: Lead Development team will contact within 24 hours";
    }
  };

  const getResponseCommitment = () => {
    if (priorityScore >= 100) {
      return "Senior Sales Manager will respond within 1 hour";
    } else if (priorityScore >= 50) {
      return "Sales Representative will respond within 4 hours";
    } else {
      return "Lead Development Team will respond within 24 hours";
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
    if (!isValid) return;

    // ADD RESIDENTIAL ROUTING LOGIC - When project_unit_count < 50, set showResidentialOptions = true instead of error
    if (currentStep === 2) {
      const units = form.getValues("projectUnitCount");
      if (units < 50) {
        setShowResidentialOptions(true);
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
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
          <div className="space-y-6" data-testid="step-contact-info">
            <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-step-1">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-first-name">First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} data-testid="input-first-name" />
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
          <div className="space-y-6" data-testid="step-project-details">
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
                      placeholder="150" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
          <div className="space-y-6" data-testid="step-timeline-location">
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
          <div className="space-y-6" data-testid="step-developer-classification">
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
          <div className="space-y-6" data-testid="step-submission">
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
            
            {/* Priority Score Display */}
            <div className="bg-muted rounded-2xl p-6" data-testid="container-priority-score">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2" data-testid="label-priority-score">Your Priority Score</div>
                <div className="priority-score text-4xl font-bold mb-2" data-testid="text-priority-score">{priorityScore}</div>
                <div className="text-sm text-muted-foreground mb-4" data-testid="text-score-range">out of 150 points</div>
                <div className="text-sm font-medium" data-testid="text-priority-message">{getPriorityMessage()}</div>
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
      project_unit_count: parseInt(residentialData.units),
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
      <section id="developer-qualification" className="py-20 qualification-section" data-testid="section-assessment-success">
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
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-assessment-title">
              Partner Qualification Assessment
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="text-assessment-subtitle">
              Join Canada's leading developers. Complete our assessment to unlock partnership opportunities.
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8" data-testid="container-progress">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground" data-testid="label-progress">Progress</span>
              <span className="text-sm font-medium text-primary" data-testid="text-step-indicator">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                data-testid="progress-bar"
              ></div>
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
            }} className="bg-card rounded-2xl p-8 shadow-xl" data-testid="form-assessment">
              {renderStep()}
              
              {/* Form Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border" data-testid="container-form-navigation">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  className={currentStep === 1 ? "invisible" : ""}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="mr-2" size={16} />
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
                    className="btn-primary"
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)(e);
                    }}
                    className="btn-primary"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Assessment"}
                    <Send className="ml-2" size={16} />
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {/* RESIDENTIAL PATHWAY - COMPLETE CONDITIONAL REPLACEMENT */}
          {showResidentialOptions && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
            <div className="space-y-6 mt-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Residential Projects (Under 50 Units)</h2>
                <p className="text-gray-600">ILLÜMMAA offers two pathways for residential projects:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleInHouseSelection()}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">In-House First-Time Home Buyer Service</h3>
                    <ul className="space-y-2 text-gray-600 mb-4">
                      <li>• Direct consultation with ILLÜMMAA specialists</li>
                      <li>• No real estate agents involved</li>
                      <li>• For clients preferring direct builder relationship</li>
                    </ul>
                    <Button className="w-full">Choose In-House Service</Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRemaxSelection()}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">Remax Partnership Program</h3>
                    <ul className="space-y-2 text-gray-600 mb-4">
                      <li>• Full real estate agent support</li>
                      <li>• Land acquisition assistance</li>
                      <li>• Complete guided home buying process</li>
                    </ul>
                    <Button className="w-full">Choose Remax Partnership</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {residentialPathway === 'in-house' && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
            <div className="space-y-6 mt-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">In-House Residential Service</h2>
                <p className="text-gray-600">We'll connect you with our residential specialists.</p>
              </div>
              
              <form onSubmit={handleResidentialSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="res_units">Number of Units</Label>
                  <Input 
                    type="number" 
                    id="res_units" 
                    placeholder="Number of Units (1-49)" 
                    min="1" 
                    max="49" 
                    value={residentialData.units}
                    onChange={(e) => setResidentialData({...residentialData, units: e.target.value})}
                    required 
                  />
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

          {/* SUCCESS STATES - REPLACE ALL CONTENT */}
          {residentialSubmissionSuccess && (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
              <div className="max-w-md w-full space-y-8 text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Residential Inquiry Submitted Successfully!</h1>
                <p className="text-gray-600">
                  Our residential specialist will contact you within 24-48 hours to discuss your {residentialData.units}-unit project in {residentialData.province}.
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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
