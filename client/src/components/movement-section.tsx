import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ConsumerForm from "./consumer-form";

export default function MovementSection() {
  const [showConsumerForm, setShowConsumerForm] = useState(false);
  const [isLearnMoreUsed, setIsLearnMoreUsed] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Security constants for Learn More button tracking - use sessionStorage to reset on page reload
  const LEARN_MORE_SESSION_KEY = 'illummaa_learn_more_used';
  const SUCCESS_MESSAGE_KEY = 'illummaa_success_shown';

  // Reset state on page load and check session storage
  useEffect(() => {
    // Always start fresh on page load - clear any previous state
    sessionStorage.removeItem(LEARN_MORE_SESSION_KEY);
    sessionStorage.removeItem(SUCCESS_MESSAGE_KEY);
    setIsLearnMoreUsed(false);
    setShowSuccessMessage(false);
  }, []);

  const openConsumerForm = () => {
    if (isLearnMoreUsed || showSuccessMessage) {
      return; // Prevent opening if already used or success shown
    }
    
    // Mark as used in sessionStorage (resets on page reload)
    const sessionData = {
      used: true,
      component: 'learn_more_button',
      usedAt: new Date().toISOString()
    };
    sessionStorage.setItem(LEARN_MORE_SESSION_KEY, JSON.stringify(sessionData));
    setIsLearnMoreUsed(true);
    
    setShowConsumerForm(true);
  };

  const handleFormSuccess = () => {
    // Hide the form and show inline success message
    setShowConsumerForm(false);
    setShowSuccessMessage(true);
    
    // Store success state in sessionStorage (resets on page reload)
    const successData = {
      shown: true,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem(SUCCESS_MESSAGE_KEY, JSON.stringify(successData));
  };

  return (
    <section className="py-20" data-testid="section-movement">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Aerial view of modern modular home community development" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-community-aerial"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-8" data-testid="heading-movement-title">
                Building Canada's Housing Future
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-movement-description">
                From housing shortage to housing abundance. From traditional delays to industrial precision. 
                Join the movement transforming how Canada builds homes.
              </p>
              <div className="space-y-4 mb-8" data-testid="container-movement-points">
                <div className="flex items-center space-x-3" data-testid="point-housing-needed">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="text-lg">500,000+ homes needed annually</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="point-modular-solution">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="text-lg">Industrial modular: The scalable solution</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="point-opportunity">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="text-lg">Your opportunity to lead the transformation</span>
                </div>
              </div>
              <Button 
                onClick={openConsumerForm} 
                disabled={isLearnMoreUsed || showSuccessMessage}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  isLearnMoreUsed || showSuccessMessage
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
                    : 'btn-primary text-white hover:transform hover:translateY(-1px)'
                }`}
                data-testid="button-learn-more"
                title={showSuccessMessage ? "Inquiry submitted successfully" : isLearnMoreUsed ? "Form already accessed - please reload page for new submission" : "Learn More"}
              >
                {showSuccessMessage ? "Inquiry Submitted" : isLearnMoreUsed ? "Form Already Accessed" : "Learn More"}
              </Button>
            </div>
          </div>
          
          {/* Inline Success Message */}
          {showSuccessMessage && (
            <div className="mt-16 max-w-4xl mx-auto" data-testid="success-message-inline">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-white" size={24} />
                </div>
                <h3 className="font-display font-bold text-2xl text-green-800 mb-4" data-testid="heading-success">
                  Thank You for Your Interest!
                </h3>
                <p className="text-lg text-green-700 mb-4" data-testid="text-success-message">
                  Your residential inquiry has been submitted successfully. Our team will contact you within 24 hours to discuss your project and explore how ILLÜMMAA can help bring your housing vision to life.
                </p>
                <p className="text-base text-green-600" data-testid="text-next-steps">
                  We'll provide information about our modular home solutions, financing options, and partnership opportunities tailored to your specific needs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consumer Form Modal */}
      <ConsumerForm 
        open={showConsumerForm} 
        onOpenChange={setShowConsumerForm}
        onSuccess={handleFormSuccess}
      />
    </section>
  );
}
