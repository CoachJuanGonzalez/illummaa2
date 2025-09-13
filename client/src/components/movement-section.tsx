import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ConsumerForm from "./consumer-form";

export default function MovementSection() {
  const [showConsumerForm, setShowConsumerForm] = useState(false);
  const [isLearnMoreUsed, setIsLearnMoreUsed] = useState(false);

  // Security constants for Learn More button tracking
  const LEARN_MORE_SESSION_KEY = 'illummaa_learn_more_used';
  const PAGE_LOAD_KEY = 'illummaa_page_load_time';

  // Track page loads and reset button state on actual page reload
  useEffect(() => {
    try {
      const currentPageLoad = Date.now();
      const previousPageLoad = sessionStorage.getItem(PAGE_LOAD_KEY);
      
      // If this is a new page load (different timestamp), clear the Learn More usage
      if (!previousPageLoad || (currentPageLoad - parseInt(previousPageLoad)) > 1000) {
        sessionStorage.removeItem(LEARN_MORE_SESSION_KEY);
        sessionStorage.setItem(PAGE_LOAD_KEY, currentPageLoad.toString());
        setIsLearnMoreUsed(false);
      } else {
        // Same page session - check if button was already used
        const sessionData = sessionStorage.getItem(LEARN_MORE_SESSION_KEY);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          if (parsed.used && parsed.component === 'learn_more_button') {
            setIsLearnMoreUsed(true);
          }
        }
      }
    } catch (error) {
      console.error('Error managing learn more session data:', error);
      sessionStorage.removeItem(LEARN_MORE_SESSION_KEY);
      sessionStorage.removeItem(PAGE_LOAD_KEY);
    }
  }, []);

  const openConsumerForm = () => {
    if (isLearnMoreUsed) {
      return; // Prevent opening if already used
    }
    
    // Mark as used in session storage
    const sessionData = {
      used: true,
      component: 'learn_more_button',
      usedAt: new Date().toISOString()
    };
    sessionStorage.setItem(LEARN_MORE_SESSION_KEY, JSON.stringify(sessionData));
    setIsLearnMoreUsed(true);
    
    setShowConsumerForm(true);
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
                disabled={isLearnMoreUsed}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  isLearnMoreUsed 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
                    : 'btn-primary text-white hover:transform hover:translateY(-1px)'
                }`}
                data-testid="button-learn-more"
                title={isLearnMoreUsed ? "Form already accessed - please reload page for new submission" : "Learn More"}
              >
                {isLearnMoreUsed ? "Form Already Accessed" : "Learn More"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Consumer Form Modal */}
      <ConsumerForm 
        open={showConsumerForm} 
        onOpenChange={setShowConsumerForm} 
      />
    </section>
  );
}
