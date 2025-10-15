import { Link, useLocation } from "wouter";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

export default function NotFound() {
  const [location] = useLocation();
  const isEnglish = !location.startsWith('/fr');

  useSEO({
    title: "404 - Page Not Found | ILLUMMAA",
    titleFr: "404 - Page Non Trouvée | ILLUMMAA",
    description: "The page you're looking for doesn't exist. Return to homepage or browse our modular home models.",
    descriptionFr: "La page que vous recherchez n'existe pas. Retournez à l'accueil ou parcourez nos modèles de maisons modulaires.",
    language: isEnglish ? 'en' : 'fr'
  });

  const content = {
    en: {
      title: "Page Not Found",
      subtitle: "Sorry, we couldn't find the page you're looking for.",
      description: "The page may have been moved or doesn't exist.",
      backHome: "Back to Homepage",
      goBack: "Go Back",
      popularPages: "Popular Pages:",
      model1br: "1BR Compact Model",
      model2br: "2BR Family Model",
      model3br: "3BR Executive Model",
      viewModels: "View All Models",
      partnerWithUs: "Partner With Us"
    },
    fr: {
      title: "Page Non Trouvée",
      subtitle: "Désolé, nous n'avons pas pu trouver la page que vous recherchez.",
      description: "La page a peut-être été déplacée ou n'existe pas.",
      backHome: "Retour à l'accueil",
      goBack: "Retour",
      popularPages: "Pages Populaires:",
      model1br: "Modèle Compact 1 CH",
      model2br: "Modèle Familial 2 CH",
      model3br: "Modèle Exécutif 3 CH",
      viewModels: "Voir Tous les Modèles",
      partnerWithUs: "Devenez Partenaire"
    }
  };

  const t = isEnglish ? content.en : content.fr;
  const langPrefix = isEnglish ? '/en' : '/fr';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-2xl text-center">
        <h1 className="font-display font-bold text-9xl text-primary mb-4">404</h1>
        <h2 className="font-display font-bold text-4xl text-foreground mb-4">
          {t.title}
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          {t.subtitle} {t.description}
        </p>

        {/* Helpful Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href={langPrefix}>
            <Button size="lg" className="w-full sm:w-auto">
              <Home size={20} className="mr-2" />
              {t.backHome}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => history.back()}
          >
            <ArrowLeft size={20} className="mr-2" />
            {t.goBack}
          </Button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-border pt-8">
          <h3 className="font-semibold text-lg mb-4">{t.popularPages}</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`${langPrefix}/models/1br-compact`} className="text-primary hover:underline">
              {t.model1br}
            </Link>
            <Link href={`${langPrefix}/models/2br-family`} className="text-primary hover:underline">
              {t.model2br}
            </Link>
            <Link href={`${langPrefix}/models/3br-executive`} className="text-primary hover:underline">
              {t.model3br}
            </Link>
            <Link href={`${langPrefix}/#models`} className="text-primary hover:underline">
              {t.viewModels}
            </Link>
            <Link href={`${langPrefix}/#developer-qualification`} className="text-primary hover:underline">
              {t.partnerWithUs}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
