import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Consumer form schema - Contact information only
const consumerFormSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name must contain only letters and spaces"),
  
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name must contain only letters and spaces"),
  
  email: z.string()
    .email("Please enter a valid email address"),
  
  phone: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val;
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length === 10 && !cleaned.startsWith('1')) {
        return `+1${cleaned}`;
      }
      if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
      }
      return val;
    },
    z.string()
      .min(1, "Phone number is required")
      .regex(/^\+1\d{10}$/, "Please enter a valid Canadian phone number (10 digits: area code + 7 digits, or 11 digits starting with 1)")
  ),
  
  company: z.string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

type ConsumerFormData = z.infer<typeof consumerFormSchema>;

interface ConsumerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConsumerForm({ open, onOpenChange }: ConsumerFormProps) {
  const [showResidentialOptions, setShowResidentialOptions] = useState(false);
  const [contactData, setContactData] = useState<ConsumerFormData | null>(null);
  const [residentialPathway, setResidentialPathway] = useState('');
  const [residentialData, setResidentialData] = useState({
    province: '',
    description: ''
  });
  const [residentialSubmissionSuccess, setResidentialSubmissionSuccess] = useState(false);
  const [remaxRedirectSuccess, setRemaxRedirectSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConsumerFormData>({
    resolver: zodResolver(consumerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
    },
  });

  // Residential submission mutation
  const residentialMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/submit-residential', data);
    },
    onSuccess: () => {
      setResidentialSubmissionSuccess(true);
      toast({
        title: "Success!",
        description: "Your residential inquiry has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/residential'] });
    },
    onError: (error: any) => {
      console.error('Residential submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit your inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsumerFormData) => {
    setContactData(data);
    setShowResidentialOptions(true);
    toast({
      title: "Contact Information Received",
      description: "Thank you! Please select your preferred service option below.",
    });
  };

  const handleInHouseSelection = () => {
    setResidentialPathway('in-house');
  };

  const handleRemaxSelection = () => {
    setResidentialPathway('remax');
    // Simulate Remax redirect
    setRemaxRedirectSuccess(true);
    toast({
      title: "Remax Partnership",
      description: "Redirecting you to our Remax partnership program...",
    });
  };

  const handleResidentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData) return;

    // Prepare data for residential submission matching the API schema
    const submissionData = {
      first_name: contactData.firstName,
      last_name: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      company: contactData.company || "Personal",
      source: "Consumer Information Request Form",
      project_unit_count: 1, // Pre-filled as per instructions
      budget: "Under $5M", // Pre-filled as per instructions
      construction_province: residentialData.province,
      project_description: residentialData.description,
      residential_pathway: residentialPathway,
      lead_type: "Consumer Information Request Form", // Pre-filled as per instructions
      submission_timestamp: new Date().toISOString()
    };

    residentialMutation.mutate(submissionData);
  };

  const resetForm = () => {
    form.reset();
    setShowResidentialOptions(false);
    setContactData(null);
    setResidentialPathway('');
    setResidentialData({ province: '', description: '' });
    setResidentialSubmissionSuccess(false);
    setRemaxRedirectSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-consumer-form">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center" data-testid="heading-consumer-title">
            Consumer Information Request
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2" data-testid="text-consumer-subtitle">
            Tell us about your modular housing needs. We'll connect you with the right pathway.
          </p>
        </DialogHeader>

        {!showResidentialOptions && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-first-name">First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John" 
                            {...field} 
                            data-testid="input-first-name"
                            className="focus-ring interactive-hover transition-all duration-200"
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
                          <Input type="email" placeholder="john.smith@email.com" {...field} data-testid="input-email" />
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
                          <Input 
                            type="tel" 
                            placeholder="(XXX) XXX-XXXX" 
                            {...field} 
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel data-testid="label-company">Company Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Personal" {...field} data-testid="input-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2"
                      data-testid="button-next"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Residential Options Section */}
        {showResidentialOptions && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
          <div className="space-y-6 mt-6" data-testid="section-residential-options">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Residential Projects (Under 50 Units)</h2>
              <p className="text-gray-600">ILLÜMMAA offers two pathways for residential projects:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer card-hover group transition-all duration-300 hover:border-primary/50" 
                onClick={handleInHouseSelection}
                data-testid="card-in-house"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-200">
                    In-House First-Time Home Buyer Service
                  </h3>
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="transition-transform duration-200 group-hover:translate-x-1">• Direct consultation with ILLÜMMAA specialists</li>
                    <li className="transition-transform duration-200 group-hover:translate-x-1 delay-75">• No real estate agents involved</li>
                    <li className="transition-transform duration-200 group-hover:translate-x-1 delay-150">• For clients preferring direct builder relationship</li>
                  </ul>
                  <Button className="w-full interactive-hover group-hover:scale-105 transition-all duration-200">
                    Choose In-House Service
                  </Button>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer card-hover group transition-all duration-300 hover:border-accent/50" 
                onClick={handleRemaxSelection}
                data-testid="card-remax"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors duration-200">
                    Remax Partnership Program
                  </h3>
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="transition-transform duration-200 group-hover:translate-x-1">• Full real estate agent support</li>
                    <li className="transition-transform duration-200 group-hover:translate-x-1 delay-75">• Land acquisition assistance</li>
                    <li className="transition-transform duration-200 group-hover:translate-x-1 delay-150">• Complete guided home buying process</li>
                  </ul>
                  <Button className="w-full interactive-hover group-hover:scale-105 transition-all duration-200">
                    Choose Remax Partnership
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* In-House Residential Form */}
        {residentialPathway === 'in-house' && !residentialSubmissionSuccess && !remaxRedirectSuccess && (
          <div className="space-y-6 mt-6" data-testid="section-in-house-form">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">In-House Residential Service</h2>
              <p className="text-gray-600">We'll connect you with our residential specialists.</p>
            </div>
            
            <form onSubmit={handleResidentialSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none">Number of Units</label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                  1 unit (consumer inquiry)
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pre-filled for consumer information requests
                </p>
              </div>
              
              <div>
                <label htmlFor="res_province" className="text-sm font-medium leading-none">Construction Province</label>
                <select 
                  value={residentialData.province} 
                  onChange={(e) => setResidentialData({...residentialData, province: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md"
                  required
                  data-testid="select-province"
                >
                  <option value="">Select Province...</option>
                  <option value="Ontario">Ontario</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Quebec">Quebec</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                  <option value="New Brunswick">New Brunswick</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                  <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                  <option value="Prince Edward Island">Prince Edward Island</option>
                  <option value="Northwest Territories">Northwest Territories</option>
                  <option value="Nunavut">Nunavut</option>
                  <option value="Yukon">Yukon</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="res_description" className="text-sm font-medium leading-none">Project Description (Optional)</label>
                <textarea
                  value={residentialData.description}
                  onChange={(e) => setResidentialData({...residentialData, description: e.target.value})}
                  placeholder="Describe your housing needs, timeline, or any specific requirements..."
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md min-h-[100px] resize-none"
                  maxLength={1000}
                  data-testid="textarea-description"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {residentialData.description.length}/1000 characters
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResidentialPathway('')}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                  disabled={residentialMutation.isPending}
                  data-testid="button-submit-residential"
                >
                  {residentialMutation.isPending ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Success States */}
        {residentialSubmissionSuccess && (
          <div className="text-center py-8" data-testid="section-success">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in ILLÜMMAA's residential services. Our team will contact you within 24-48 hours.
            </p>
            <Button onClick={resetForm} data-testid="button-close-success">
              Close
            </Button>
          </div>
        )}

        {remaxRedirectSuccess && (
          <div className="text-center py-8" data-testid="section-remax-success">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to Remax Partnership</h3>
            <p className="text-gray-600 mb-6">
              You'll be connected with our Remax partners who specialize in residential land acquisition and home buying support.
            </p>
            <Button onClick={resetForm} data-testid="button-close-remax">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}