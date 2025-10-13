import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LeadershipTeam() {
  const { t } = useTranslation();
  const coreExecutives = [
    {
      name: "Baillargeon-Kemener Office",
      title: t('leadership.executives.executive0.title'),
      category: t('leadership.executives.executive0.department')
    },
    {
      name: "Howard Smolar",
      title: t('leadership.executives.executive1.title'),
      category: t('leadership.executives.executive1.department')
    },
    {
      name: "Marvin Garellek",
      title: t('leadership.executives.executive2.title'),
      category: t('leadership.executives.executive2.department')
    },
    {
      name: "Dan Hatahet",
      title: t('leadership.executives.executive3.title'),
      category: t('leadership.executives.executive3.department')
    },
    {
      name: "Lili Zunhua",
      title: t('leadership.executives.executive4.title'),
      category: t('leadership.executives.executive4.department')
    },
    {
      name: "Ian Lajoie",
      title: t('leadership.executives.executive5.title'),
      category: t('leadership.executives.executive5.department')
    },
    {
      name: "Choukhrate Rasoulev",
      title: t('leadership.executives.executive6.title'),
      category: t('leadership.executives.executive6.department')
    }
  ];

  const visionExecutives = [
    {
      name: "Juan Grey",
      title: t('leadership.executives.executive7.title'),
      category: t('leadership.executives.executive7.department')
    },
    {
      name: "Coach Juan Gonzalez",
      title: t('leadership.executives.executive8.title'),
      category: t('leadership.executives.executive8.department')
    }
  ];

  const renderExecutiveCard = (executive: any, index: number) => (
    <div 
      key={index} 
      className="card-hover bg-card rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
      data-testid={`card-executive-${index}`}
    >
      {/* Professional placeholder avatar */}
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
        <User className="text-primary" size={32} />
      </div>
      
      {/* Executive name */}
      <h3 className="font-bold text-lg text-center mb-2 text-foreground" data-testid={`name-executive-${index}`}>
        {executive.name}
      </h3>
      
      {/* Title/role */}
      <p className="text-muted-foreground text-center text-sm leading-relaxed" data-testid={`title-executive-${index}`}>
        {executive.title}
      </p>
      
      {/* Category badge */}
      <div className="mt-4 flex justify-center">
        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full" data-testid={`category-executive-${index}`}>
          {executive.category}
        </span>
      </div>
    </div>
  );

  return (
    <section id="leadership" className="py-20 bg-background" data-testid="section-leadership">
      <div className="container mx-auto px-6">
        {/* Main Leadership Team Heading */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-leadership-title">
            {t('leadership.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-leadership-subtitle">
            {t('leadership.subtitle')}
          </p>
        </div>
        
        {/* Core Leadership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-testid="container-leadership-grid">
          {coreExecutives.map((executive, index) => renderExecutiveCard(executive, index))}
        </div>

        {/* Vision, Innovation & Market Leadership Subsection */}
        <div className="mt-12 md:mt-16">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground px-4" data-testid="heading-vision-subsection">
              {t('leadership.badge')}
            </h3>
          </div>
          
          {/* Vision Executives - Centered Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full md:max-w-2xl">
              {visionExecutives.map((executive, index) => renderExecutiveCard(executive, index + 7))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}