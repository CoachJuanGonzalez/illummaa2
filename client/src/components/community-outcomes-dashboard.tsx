import { TrendingUp, Users, Building2, Leaf, DollarSign, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  color: string;
}

function MetricCard({ icon, value, label, trend, color }: MetricCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-primary transition-all">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
      <p className="text-muted-foreground mb-2">{label}</p>
      {trend && (
        <div className="flex items-center text-sm text-green-600 font-semibold">
          <TrendingUp size={14} className="mr-1" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function CommunityOutcomesDashboard() {
  const [animatedValues, setAnimatedValues] = useState({
    units: 0,
    jobs: 0,
    savings: 0,
    co2: 0,
    families: 0,
    timeline: 0
  });

  const targetValues = {
    units: 750,
    jobs: 135,
    savings: 24.8,
    co2: 975,
    families: 750,
    timeline: 40
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        units: Math.floor(targetValues.units * progress),
        jobs: Math.floor(targetValues.jobs * progress),
        savings: parseFloat((targetValues.savings * progress).toFixed(1)),
        co2: Math.floor(targetValues.co2 * progress),
        families: Math.floor(targetValues.families * progress),
        timeline: Math.floor(targetValues.timeline * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(targetValues);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-muted" data-testid="section-outcomes-dashboard">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-outcomes-title">
            Community Impact Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-outcomes-subtitle">
            Real-time metrics showcasing the transformative impact of ILLÜMMAA partnerships across Canada.
          </p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <MetricCard
            icon={<Building2 size={24} className="text-primary" />}
            value={`${animatedValues.units}+`}
            label="Units Delivered Nationwide"
            trend="+22% YoY"
            color="bg-primary/10"
          />
          <MetricCard
            icon={<Users size={24} className="text-blue-600" />}
            value={`${animatedValues.jobs}+`}
            label="Construction Jobs Created"
            trend="+18% YoY"
            color="bg-blue-100"
          />
          <MetricCard
            icon={<DollarSign size={24} className="text-green-600" />}
            value={`$${animatedValues.savings}M`}
            label="Total Cost Savings for Partners"
            trend="+35% vs Traditional"
            color="bg-green-100"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            icon={<Leaf size={24} className="text-green-700" />}
            value={`${animatedValues.co2}T`}
            label="CO₂ Emissions Saved"
            color="bg-green-50"
          />
          <MetricCard
            icon={<Users size={24} className="text-purple-600" />}
            value={`${animatedValues.families}+`}
            label="Canadian Families Housed"
            color="bg-purple-100"
          />
          <MetricCard
            icon={<Clock size={24} className="text-orange-600" />}
            value={`${animatedValues.timeline}%`}
            label="Faster Than Traditional Construction"
            color="bg-orange-100"
          />
        </div>

        {/* Detailed Impact Breakdown */}
        <div className="bg-card rounded-2xl shadow-2xl p-8 lg:p-12">
          <h3 className="font-bold text-3xl mb-8 text-center">Partnership Success Breakdown</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Economic Impact */}
            <div>
              <h4 className="font-bold text-xl mb-4 flex items-center">
                <DollarSign className="text-primary mr-2" size={24} />
                Economic Impact
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Average Project ROI</span>
                  <span className="font-bold text-lg">41%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Cost Savings vs Traditional</span>
                  <span className="font-bold text-lg text-green-600">32%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Average Project Value</span>
                  <span className="font-bold text-lg">$33M</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Total Economic Impact</span>
                  <span className="font-bold text-lg text-primary">$187M+</span>
                </div>
              </div>
            </div>

            {/* Social Impact */}
            <div>
              <h4 className="font-bold text-xl mb-4 flex items-center">
                <Users className="text-blue-600 mr-2" size={24} />
                Social Impact
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Families Housed</span>
                  <span className="font-bold text-lg">750+</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Affordable Housing Units</span>
                  <span className="font-bold text-lg">480</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Indigenous Partnership Projects</span>
                  <span className="font-bold text-lg">3</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Provinces Served</span>
                  <span className="font-bold text-lg text-primary">6</span>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div>
              <h4 className="font-bold text-xl mb-4 flex items-center">
                <Leaf className="text-green-600 mr-2" size={24} />
                Environmental Impact
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Total CO₂ Saved</span>
                  <span className="font-bold text-lg">975 Tons</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Construction Waste Reduced</span>
                  <span className="font-bold text-lg text-green-600">68%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Energy Efficient Units</span>
                  <span className="font-bold text-lg">100%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Net-Zero Ready Units</span>
                  <span className="font-bold text-lg text-primary">420</span>
                </div>
              </div>
            </div>

            {/* Operational Excellence */}
            <div>
              <h4 className="font-bold text-xl mb-4 flex items-center">
                <Clock className="text-orange-600 mr-2" size={24} />
                Operational Excellence
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Average Timeline Reduction</span>
                  <span className="font-bold text-lg">40%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">On-Time Completion Rate</span>
                  <span className="font-bold text-lg text-green-600">97%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Quality Control Pass Rate</span>
                  <span className="font-bold text-lg">99.8%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Partner Satisfaction Score</span>
                  <span className="font-bold text-lg text-primary">9.4/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Federal Alignment */}
          <div className="mt-8 bg-muted rounded-xl p-6">
            <h4 className="font-bold text-lg mb-4 text-center">Federal Housing Strategy Alignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary mb-1">100%</p>
                <p className="text-sm text-muted-foreground">Housing Accelerator Fund Eligible</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary mb-1">$18M</p>
                <p className="text-sm text-muted-foreground">Federal Funding Secured</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary mb-1">480</p>
                <p className="text-sm text-muted-foreground">Affordable Housing Units Delivered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Dashboard last updated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </section>
  );
}