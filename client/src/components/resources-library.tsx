import { FileText, Download, BookOpen, BarChart3, Calculator, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Resource {
  id: number;
  title: string;
  description: string;
  category: 'whitepaper' | 'case-study' | 'report' | 'calculator' | 'guide' | 'compliance';
  fileSize: string;
  fileType: 'PDF' | 'XLSX' | 'Interactive';
  downloadUrl: string;
  icon: React.ReactNode;
  featured?: boolean;
}

export default function ResourcesLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const resources: Resource[] = [
    {
      id: 1,
      title: "Modular Construction ROI Calculator",
      description: "Interactive tool to compare modular vs traditional construction costs, timelines, and profitability for 50-500+ unit projects.",
      category: 'calculator',
      fileSize: "2.5 MB",
      fileType: 'Interactive',
      downloadUrl: "/resources/roi-calculator.xlsx",
      icon: <Calculator size={24} />,
      featured: true
    },
    {
      id: 2,
      title: "Federal Housing Programs Guide 2025",
      description: "Comprehensive overview of Build Canada Homes, Housing Accelerator Fund, and provincial partnership opportunities.",
      category: 'guide',
      fileSize: "4.2 MB",
      fileType: 'PDF',
      downloadUrl: "/resources/federal-housing-guide-2025.pdf",
      icon: <BookOpen size={24} />,
      featured: true
    },
    {
      id: 3,
      title: "Canadian Modular Housing Market Report",
      description: "2024-2025 industry analysis: market trends, growth projections, and competitive landscape across all provinces.",
      category: 'report',
      fileSize: "6.8 MB",
      fileType: 'PDF',
      downloadUrl: "/resources/market-report-2025.pdf",
      icon: <BarChart3 size={24} />
    },
    {
      id: 4,
      title: "Partnership Success: Aurora Commons Case Study",
      description: "Deep dive into 250-unit Toronto project: timelines, cost savings, and partnership structure analysis.",
      category: 'case-study',
      fileSize: "3.1 MB",
      fileType: 'PDF',
      downloadUrl: "/resources/aurora-commons-case-study.pdf",
      icon: <FileText size={24} />,
      featured: true
    },
    {
      id: 5,
      title: "Provincial Building Code Compliance Guide",
      description: "Province-by-province regulatory requirements, permits, and compliance timelines for modular construction.",
      category: 'compliance',
      fileSize: "5.4 MB",
      fileType: 'PDF',
      downloadUrl: "/resources/provincial-compliance-guide.pdf",
      icon: <Shield size={24} />
    },
    {
      id: 6,
      title: "Large-Scale Development Partnership Whitepaper",
      description: "Strategic framework for 150+ unit projects: financing, phasing, and partnership structures.",
      category: 'whitepaper',
      fileSize: "2.9 MB",
      fileType: 'PDF',
      downloadUrl: "/resources/partnership-whitepaper.pdf",
      icon: <FileText size={24} />
    }
  ];

  const categories = [
    { value: 'all', label: 'All Resources' },
    { value: 'whitepaper', label: 'Whitepapers' },
    { value: 'case-study', label: 'Case Studies' },
    { value: 'report', label: 'Market Reports' },
    { value: 'calculator', label: 'Calculators' },
    { value: 'guide', label: 'Guides' },
    { value: 'compliance', label: 'Compliance' }
  ];

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  const handleDownload = (resource: Resource) => {
    // Actual download logic - requires PDF files to be uploaded
    console.log(`Downloading: ${resource.title}`);
    // In production: window.open(resource.downloadUrl, '_blank');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      whitepaper: 'bg-blue-100 text-blue-800',
      'case-study': 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800',
      calculator: 'bg-orange-100 text-orange-800',
      guide: 'bg-yellow-100 text-yellow-800',
      compliance: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section className="py-20" data-testid="section-resources-library">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-resources-title">
            Partnership Resources Library
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-resources-subtitle">
            Downloadable guides, calculators, and insights to support your modular construction partnership journey.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value ? "btn-primary" : ""}
              data-testid={`button-filter-${category.value}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className={`card-hover bg-card rounded-2xl p-8 shadow-lg ${resource.featured ? 'border-2 border-primary' : ''}`}
              data-testid={`card-resource-${resource.id}`}
            >
              {resource.featured && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                  Featured
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {resource.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(resource.category)}`}>
                  {resource.category.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-xl mb-3" data-testid={`heading-resource-${resource.id}`}>
                {resource.title}
              </h3>

              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {resource.description}
              </p>

              <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                <span>{resource.fileType}</span>
                <span>{resource.fileSize}</span>
              </div>

              <Button
                onClick={() => handleDownload(resource)}
                className="w-full btn-primary"
                data-testid={`button-download-${resource.id}`}
              >
                <Download size={18} className="mr-2" />
                Download Resource
              </Button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-white rounded-2xl shadow-2xl p-12 text-center">
          <h3 className="font-bold text-3xl mb-4">Need Custom Analysis for Your Project?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Our partnership team can provide tailored financial models, feasibility studies, and market analysis for projects over 150 units.
          </p>
          <Button
            onClick={() => {
              const element = document.getElementById("developer-qualification");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            data-testid="button-request-custom-analysis"
          >
            Request Custom Analysis
          </Button>
        </div>

        {/* Setup Notice */}
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 inline-block">
            <p className="text-sm text-yellow-800">
              📄 <span className="font-semibold">PDF resources pending</span> - Requires content creation and file upload
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}