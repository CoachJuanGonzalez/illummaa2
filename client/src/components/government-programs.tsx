import { Rocket, Home, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function GovernmentPrograms() {
  const { t } = useTranslation();
  const programs = [
    {
      name: t('governmentPrograms.programs.accelerator.name'),
      description: t('governmentPrograms.programs.accelerator.description'),
      icon: <Rocket className="text-blue-600" size={24} />,
      iconBg: "bg-blue-100"
    },
    {
      name: t('governmentPrograms.programs.buildCanada.name'),
      description: t('governmentPrograms.programs.buildCanada.description'),
      icon: <Home className="text-green-600" size={24} />,
      iconBg: "bg-green-100"
    },
    {
      name: t('governmentPrograms.programs.provincial.name'),
      description: t('governmentPrograms.programs.provincial.description'),
      icon: <MapPin className="text-purple-600" size={24} />,
      iconBg: "bg-purple-100"
    },
    {
      name: t('governmentPrograms.programs.municipal.name'),
      description: t('governmentPrograms.programs.municipal.description'),
      icon: <Clock className="text-orange-600" size={24} />,
      iconBg: "bg-orange-100"
    }
  ];

  return (
    <section className="py-20 bg-muted" data-testid="section-government-programs">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-government-title">
            {t('governmentPrograms.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-government-subtitle">
            {t('governmentPrograms.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="container-government-programs">
          {programs.map((program, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-6 shadow-lg"
              data-testid={`card-program-${index}`}
            >
              <div className={`w-12 h-12 ${program.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                {program.icon}
              </div>
              <h3 className="font-semibold text-lg mb-3" data-testid={`heading-program-${index}-name`}>
                {program.name}
              </h3>
              <p className="text-muted-foreground text-sm" data-testid={`text-program-${index}-description`}>
                {program.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16" data-testid="container-government-showcase">
          <img
            src="https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400"
            alt={t('governmentPrograms.imageAlt')}
            className="w-full h-64 object-cover rounded-2xl shadow-xl"
            data-testid="img-government-project"
          />
        </div>
      </div>
    </section>
  );
}
