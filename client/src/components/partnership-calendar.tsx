import { Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PartnershipCalendar() {
  const handleBookConsultation = () => {
    // Calendly or Cal.com integration - requires API key setup
    // For now, opens placeholder
    window.open('https://calendly.com/illummaa-partnerships', '_blank');
  };

  const consultationTypes = [
    {
      title: "Exploratory Call",
      duration: "15 minutes",
      description: "Quick introduction to ILLUMMAA's partnership opportunities",
      icon: <User size={24} />,
      suitable: "Explorer & Starter Tiers"
    },
    {
      title: "Partnership Consultation",
      duration: "30 minutes",
      description: "Detailed discussion of your project requirements and partnership structure",
      icon: <Clock size={24} />,
      suitable: "Pioneer & Preferred Tiers"
    },
    {
      title: "Executive Strategy Session",
      duration: "60 minutes",
      description: "Comprehensive strategic planning with senior leadership team",
      icon: <Calendar size={24} />,
      suitable: "Elite Tier (300+ units)"
    }
  ];

  return (
    <section className="py-20 bg-muted" data-testid="section-partnership-calendar">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-calendar-title">
            Schedule Your Partnership Consultation
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-calendar-subtitle">
            Choose the consultation format that best matches your project scale and timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {consultationTypes.map((type, index) => (
            <div
              key={index}
              className="card-hover bg-card rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-primary transition-all"
              data-testid={`card-consultation-${index}`}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                {type.icon}
              </div>
              <h3 className="font-display font-bold text-2xl mb-2 text-center" data-testid={`heading-consultation-${index}`}>
                {type.title}
              </h3>
              <p className="text-primary text-center font-semibold mb-4">{type.duration}</p>
              <p className="text-muted-foreground text-center mb-4">{type.description}</p>
              <div className="bg-muted rounded-lg p-3 mb-6">
                <p className="text-sm text-center">
                  <span className="font-semibold">Suitable for:</span> {type.suitable}
                </p>
              </div>
              <Button
                onClick={handleBookConsultation}
                className="w-full btn-primary"
                data-testid={`button-book-${index}`}
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>

        {/* Calendar Integration Placeholder */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="font-bold text-2xl mb-4">Ready to Schedule?</h3>
            <p className="text-muted-foreground mb-6">
              Our partnership team is available Monday-Friday, 9 AM - 6 PM EST
            </p>
            <Button
              onClick={handleBookConsultation}
              size="lg"
              className="btn-primary text-white"
              data-testid="button-book-main"
            >
              View Available Times
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              📅 Calendar integration requires Calendly/Cal.com API key setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}