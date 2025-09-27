import { MapPin, Building2, Users, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Partnership {
  id: number;
  name: string;
  location: string;
  province: string;
  units: number;
  status: 'completed' | 'in-progress' | 'planned';
  completionDate?: string;
  impact: {
    jobsCreated: number;
    co2Saved: number;
    costSavings: string;
  };
  image: string;
}

export default function PartnershipsImpact() {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const partnerships: Partnership[] = [
    {
      id: 1,
      name: "Aurora Commons",
      location: "Toronto, ON",
      province: "ON",
      units: 250,
      status: 'completed',
      completionDate: "Q2 2024",
      impact: {
        jobsCreated: 45,
        co2Saved: 320,
        costSavings: "$8.2M"
      },
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "Fraser Valley Development",
      location: "Vancouver, BC",
      province: "BC",
      units: 180,
      status: 'in-progress',
      completionDate: "Q4 2024",
      impact: {
        jobsCreated: 38,
        co2Saved: 245,
        costSavings: "$6.1M"
      },
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Montreal Sustainable Housing",
      location: "Montreal, QC",
      province: "QC",
      units: 320,
      status: 'planned',
      completionDate: "Q1 2025",
      impact: {
        jobsCreated: 52,
        co2Saved: 410,
        costSavings: "$10.5M"
      },
      image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const provinces = [
    { code: 'all', name: 'All Provinces' },
    { code: 'ON', name: 'Ontario' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'QC', name: 'Quebec' },
    { code: 'AB', name: 'Alberta' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'SK', name: 'Saskatchewan' }
  ];

  const filteredPartnerships = selectedProvince === 'all'
    ? partnerships
    : partnerships.filter(p => p.province === selectedProvince);

  const totalImpact = partnerships.reduce((acc, p) => ({
    units: acc.units + p.units,
    jobs: acc.jobs + p.impact.jobsCreated,
    co2: acc.co2 + p.impact.co2Saved
  }), { units: 0, jobs: 0, co2: 0 });

  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-muted" data-testid="section-partnerships-impact">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-partnerships-title">
            Partnership Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-partnerships-subtitle">
            Proven track record of delivering large-scale modular construction projects across Canada.
          </p>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-lg text-center">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-4xl font-bold text-primary mb-2">{totalImpact.units}+</p>
            <p className="text-muted-foreground">Units Delivered</p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-lg text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-4xl font-bold text-primary mb-2">{totalImpact.jobs}+</p>
            <p className="text-muted-foreground">Jobs Created</p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-lg text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-4xl font-bold text-primary mb-2">{totalImpact.co2}T</p>
            <p className="text-muted-foreground">CO₂ Emissions Saved</p>
          </div>
        </div>

        {/* Province Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {provinces.map((province) => (
            <Button
              key={province.code}
              variant={selectedProvince === province.code ? "default" : "outline"}
              onClick={() => setSelectedProvince(province.code)}
              className={selectedProvince === province.code ? "btn-primary" : ""}
              data-testid={`button-filter-${province.code}`}
            >
              {province.name}
            </Button>
          ))}
        </div>

        {/* Partnership Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {filteredPartnerships.map((partnership) => (
            <div
              key={partnership.id}
              className="card-hover bg-card rounded-2xl overflow-hidden shadow-xl"
              data-testid={`card-partnership-${partnership.id}`}
            >
              {/* Status Badge */}
              <div className="relative">
                <img
                  src={partnership.image}
                  alt={`${partnership.name} project`}
                  className="w-full h-48 object-cover"
                  data-testid={`img-partnership-${partnership.id}`}
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      partnership.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : partnership.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {partnership.status === 'completed'
                      ? 'Completed'
                      : partnership.status === 'in-progress'
                      ? 'In Progress'
                      : 'Planned'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-2xl mb-2" data-testid={`heading-partnership-${partnership.id}`}>
                  {partnership.name}
                </h3>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin size={16} className="mr-2" />
                  <span>{partnership.location}</span>
                </div>

                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Units</p>
                      <p className="text-xl font-bold text-primary">{partnership.units}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion</p>
                      <p className="text-xl font-bold text-primary">{partnership.completionDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobs Created:</span>
                    <span className="font-semibold">{partnership.impact.jobsCreated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CO₂ Saved:</span>
                    <span className="font-semibold">{partnership.impact.co2Saved}T</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost Savings:</span>
                    <span className="font-semibold text-primary">{partnership.impact.costSavings}</span>
                  </div>
                </div>

                <div className="flex items-center text-green-600 text-sm">
                  <Check size={16} className="mr-2" />
                  <span>Federal Housing Accelerator Fund Qualified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-card rounded-2xl shadow-xl p-12">
          <h3 className="font-bold text-3xl mb-4">Ready to Create Impact Together?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing network of successful development partners across Canada.
          </p>
          <Button
            onClick={scrollToAssessment}
            size="lg"
            className="btn-primary text-white"
            data-testid="button-become-partner"
          >
            Become a Development Partner
          </Button>
        </div>
      </div>
    </section>
  );
}