import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ResidentialSectionProps {
  // Pre-filled consumer defaults
  projectUnitCount?: number;
  budgetRange?: string;
  leadType?: string;
}

export default function ResidentialSection({ 
  projectUnitCount = 0, 
  budgetRange = "Under $5 Million",
  leadType = "Consumer Information Request Form" 
}: ResidentialSectionProps) {
  const [residentialPathway, setResidentialPathway] = useState('');
  const [residentialData, setResidentialData] = useState({
    province: '',
    description: ''
  });
  const [residentialSubmissionSuccess, setResidentialSubmissionSuccess] = useState(false);
  const [remaxRedirectSuccess, setRemaxRedirectSuccess] = useState(false);
  
  const { toast } = useToast();

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
      first_name: "Consumer",
      last_name: "Inquiry",
      email: "consumer.inquiry@illummaa.com",
      phone: "0000000000",
      company: "Consumer Inquiry",
      source: "ILLÜMMAA Website - Residential (Learn More)",
      project_unit_count: projectUnitCount,
      budget_range: budgetRange,
      construction_province: residentialData.province,
      project_description: residentialData.description,
      residential_pathway: "In-House Service",
      lead_type: leadType,
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

  // Success states
  if (residentialSubmissionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-scroll-target="residential-success">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Residential Inquiry Submitted Successfully!</h1>
          <p className="text-gray-600">
            Our residential specialist will contact you within 24-48 hours to discuss your {projectUnitCount}-unit project in {residentialData.province}.
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
        </div>
      </div>
    );
  }

  if (remaxRedirectSuccess) {
    return (
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
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Initial residential options */}
      {!residentialPathway && (
        <div className="space-y-6 mt-8" data-scroll-target="residential-options">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Residential Projects (Under 50 Units)</h2>
            <p className="text-gray-600">ILLÜMMAA offers two pathways for residential projects:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer card-hover group transition-all duration-300 hover:border-primary/50" onClick={() => handleInHouseSelection()} data-testid="card-inhouse">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-200">In-House First-Time Home Buyer Service</h3>
                <ul className="space-y-2 text-gray-600 mb-4">
                  <li className="transition-transform duration-200 group-hover:translate-x-1">• Direct consultation with ILLÜMMAA specialists</li>
                  <li className="transition-transform duration-200 group-hover:translate-x-1 delay-75">• No real estate agents involved</li>
                  <li className="transition-transform duration-200 group-hover:translate-x-1 delay-150">• For clients preferring direct builder relationship</li>
                </ul>
                <Button 
                  className="w-full interactive-hover group-hover:scale-105 transition-all duration-200"
                  data-testid="button-choose-inhouse"
                >
                  Choose In-House Service
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer card-hover group transition-all duration-300 hover:border-accent/50" onClick={() => handleRemaxSelection()} data-testid="card-remax">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors duration-200">Remax Partnership Program</h3>
                <ul className="space-y-2 text-gray-600 mb-4">
                  <li className="transition-transform duration-200 group-hover:translate-x-1">• Full real estate agent support</li>
                  <li className="transition-transform duration-200 group-hover:translate-x-1 delay-75">• Land acquisition assistance</li>
                  <li className="transition-transform duration-200 group-hover:translate-x-1 delay-150">• Complete guided home buying process</li>
                </ul>
                <Button 
                  className="w-full interactive-hover group-hover:scale-105 transition-all duration-200"
                  data-testid="button-choose-remax"
                >
                  Choose Remax Partnership
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* In-house form */}
      {residentialPathway === 'in-house' && (
        <div className="space-y-6 mt-8" data-scroll-target="residential-form">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">In-House Residential Service</h2>
            <p className="text-gray-600">We'll connect you with our residential specialists.</p>
          </div>
          
          <form onSubmit={handleResidentialSubmit} className="space-y-4">
            <div>
              <Label>Number of Units</Label>
              <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                {projectUnitCount} units (consumer request)
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Using consumer project defaults
              </p>
            </div>
            
            <div>
              <Label htmlFor="res_province">Construction Province</Label>
              <Select value={residentialData.province} onValueChange={(value) => setResidentialData({...residentialData, province: value})}>
                <SelectTrigger data-testid="select-province">
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
                data-testid="input-project-description"
              />
            </div>
            
            <Button type="submit" className="w-full" data-testid="button-submit-residential">Submit Residential Inquiry</Button>
          </form>
        </div>
      )}
    </div>
  );
}