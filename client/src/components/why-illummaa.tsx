import { Rocket, TrendingUp, Leaf } from "lucide-react";

export default function WhyIllummaa() {
  return (
    <section id="why" className="py-20 bg-muted" data-testid="section-why-illummaa">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-why-illummaa">
            Why ILLÜMMAA
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-why-subtitle">
            Industrial precision meets sustainable innovation for the next generation of Canadian housing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="container-value-props">
          {/* Speed at Scale */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-speed-scale">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="text-primary" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-speed-scale">Speed at Scale</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-speed-description">
              72-hour assembly with fewer labor hours. Transform months into weeks.
            </p>
            <div className="text-primary font-semibold" data-testid="text-speed-metric">4x Faster Construction</div>
          </div>
          
          {/* Proven ROI */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-proven-roi">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="text-accent" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-proven-roi">Proven ROI</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-roi-description">
              30-40% cost savings vs traditional builds. Predictable budgets and timelines.
            </p>
            <div className="text-accent font-semibold" data-testid="text-roi-metric">30-40% Cost Savings</div>
          </div>
          
          {/* Sustainability */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-sustainability">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Leaf className="text-blue-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-sustainability">Sustainability</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-sustainability-description">
              Eco-certified, net-zero ready, future-proof designs for tomorrow's standards.
            </p>
            <div className="text-blue-600 font-semibold" data-testid="text-sustainability-metric">Net-Zero Ready</div>
          </div>
        </div>
      </div>
    </section>
  );
}
