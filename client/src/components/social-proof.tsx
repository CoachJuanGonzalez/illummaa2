import { DollarSign, Zap, Shield, Settings, Leaf } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="py-20 bg-muted" data-testid="section-social-proof">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-social-proof-title">
            Why Partner with Canada's Modular Leader
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-social-proof-subtitle">
            Proven advantages that position ILLUMMAA as your strategic construction partner for large-scale development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto" data-testid="container-value-props">
          {/* Cost Efficiency */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-cost-efficiency">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <DollarSign className="text-primary" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-cost-efficiency">Cost Efficiency</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-cost-description">
              Factory-precision manufacturing delivers 30-40% cost savings versus traditional construction. Economies of scale maximize your project ROI while maintaining premium quality standards.
            </p>
            <div className="text-primary font-semibold" data-testid="text-cost-metric">30-40% More Affordable</div>
          </div>
          
          {/* Speed of Construction */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-speed-construction">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-accent" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-speed-construction">Speed of Construction</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-speed-construction-description">
              Factory-controlled construction enables faster project delivery regardless of weather conditions. Meet tight deadlines and accelerate revenue generation with proven industrial timelines.
            </p>
            <div className="text-accent font-semibold" data-testid="text-speed-construction-metric">Faster Build Times</div>
          </div>
          
          {/* Consistency and Quality Control */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-quality-control">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="text-blue-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-quality-control">Consistency and Quality Control</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-quality-control-description">
              ISO-certified factory production ensures consistent quality across every unit. Minimize on-site variables and eliminate costly construction delays.
            </p>
            <div className="text-blue-600 font-semibold" data-testid="text-quality-control-metric">Factory Precision</div>
          </div>
          
          {/* Flexibility and Customization */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-flexibility">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Settings className="text-orange-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-flexibility">Flexibility and Customization</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-flexibility-description">
              Scalable design system adapts from 50-unit projects to 500+ unit developments. Customize specifications while maintaining production efficiency.
            </p>
            <div className="text-orange-600 font-semibold" data-testid="text-flexibility-metric">Diverse Designs</div>
          </div>
          
          {/* Sustainability - Centered in grid */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg md:col-span-2 md:max-w-lg md:mx-auto" data-testid="card-sustainability">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
              <Leaf className="text-green-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4 text-center md:text-left" data-testid="heading-sustainability">Sustainability</h3>
            <p className="text-muted-foreground text-lg mb-4 text-center md:text-left" data-testid="text-sustainability-description">
              Meet federal sustainability requirements and qualify for green building incentives. Align with Canada's Net Zero goals while delivering market-leading efficiency.
            </p>
            <div className="text-green-600 font-semibold text-center md:text-left" data-testid="text-sustainability-metric">Eco-Friendly Design</div>
          </div>
        </div>
      </div>
    </section>
  );
}
