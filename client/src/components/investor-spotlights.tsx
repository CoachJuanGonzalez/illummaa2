import { Play, Quote, Building2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Investor {
  id: number;
  name: string;
  title: string;
  company: string;
  videoUrl?: string;
  videoThumbnail: string;
  quote: string;
  metrics: {
    units: number;
    roi: string;
    timeline: string;
  };
}

export default function InvestorSpotlights() {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const investors: Investor[] = [
    {
      id: 1,
      name: "Michael Chen",
      title: "CEO",
      company: "Aurora Development Group",
      videoThumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      quote: "ILLÜMMAA's modular approach cut our construction timeline by 60% while delivering superior quality. This partnership transformed our business model.",
      metrics: {
        units: 250,
        roi: "38%",
        timeline: "18 months"
      }
    },
    {
      id: 2,
      name: "Sarah Thompson",
      title: "Director of Development",
      company: "Fraser Valley Housing Corp",
      videoThumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      quote: "The factory-precision manufacturing gave us consistent quality across all 180 units. Our buyers immediately noticed the difference in craftsmanship.",
      metrics: {
        units: 180,
        roi: "42%",
        timeline: "14 months"
      }
    },
    {
      id: 3,
      name: "David Lavoie",
      title: "Managing Partner",
      company: "Montreal Sustainable Developments",
      videoThumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      quote: "ILLÜMMAA's team understood Quebec's unique building codes and bilingual requirements. True Canadian partnership excellence.",
      metrics: {
        units: 320,
        roi: "45%",
        timeline: "22 months"
      }
    }
  ];

  const handlePlayVideo = (id: number) => {
    setSelectedVideo(id);
    // Actual video player integration would go here
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <section className="py-20" data-testid="section-investor-spotlights">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-spotlights-title">
            Partnership Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-spotlights-subtitle">
            Hear directly from development partners who've transformed their projects with ILLÜMMAA's modular construction expertise.
          </p>
        </div>

        {/* Investor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="card-hover bg-card rounded-2xl overflow-hidden shadow-xl"
              data-testid={`card-investor-${investor.id}`}
            >
              {/* Video Thumbnail */}
              <div className="relative group cursor-pointer" onClick={() => handlePlayVideo(investor.id)}>
                <img
                  src={investor.videoThumbnail}
                  alt={`${investor.name} testimonial`}
                  className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity"
                  data-testid={`img-investor-${investor.id}`}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                    <Play className="text-primary ml-1" size={28} />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                  📹 Video Testimonial
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <Quote className="text-primary flex-shrink-0 mr-3 mt-1" size={24} />
                  <p className="text-muted-foreground italic leading-relaxed" data-testid={`quote-investor-${investor.id}`}>
                    "{investor.quote}"
                  </p>
                </div>

                <div className="border-t border-muted pt-4 mb-4">
                  <h4 className="font-bold text-lg">{investor.name}</h4>
                  <p className="text-sm text-muted-foreground">{investor.title}</p>
                  <p className="text-sm text-primary font-semibold">{investor.company}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-muted rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{investor.metrics.units}</p>
                    <p className="text-xs text-muted-foreground">Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{investor.metrics.roi}</p>
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{investor.metrics.timeline}</p>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="bg-primary text-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <p className="text-4xl font-bold mb-2">750+</p>
              <p className="text-lg opacity-90">Total Units Delivered</p>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <p className="text-4xl font-bold mb-2">41%</p>
              <p className="text-lg opacity-90">Average Partner ROI</p>
            </div>
            <div>
              <Quote className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <p className="text-4xl font-bold mb-2">100%</p>
              <p className="text-lg opacity-90">Partner Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* Video Notice */}
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 inline-block">
            <p className="text-sm text-yellow-800">
              📹 <span className="font-semibold">Video testimonials pending</span> - Requires recording and hosting setup
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal Placeholder */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeVideo}
          data-testid="modal-video"
        >
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Play size={64} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Video player would load here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Requires video hosting (Wistia/Vimeo) integration
                </p>
              </div>
            </div>
            <Button onClick={closeVideo} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}