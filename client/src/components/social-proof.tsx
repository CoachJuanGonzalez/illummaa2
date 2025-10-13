import { DollarSign, Zap, Shield, Settings, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SocialProof() {
  const { t } = useTranslation();
  return (
    <section id="why" className="py-20 bg-muted" data-testid="section-social-proof">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          {/* Professional badge credential */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {t('socialProof.badge')}
          </div>

          {/* Main heading */}
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-social-proof-title">
            {t('socialProof.title')}
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-social-proof-subtitle">
            {t('socialProof.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto" data-testid="container-value-props">
          {/* Cost Efficiency */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-cost-efficiency">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <DollarSign className="text-emerald-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-cost-efficiency">{t('socialProof.costEfficiency.title')}</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-cost-description">
              {t('socialProof.costEfficiency.description')}
            </p>
            <div className="text-emerald-600 font-semibold" data-testid="text-cost-metric">{t('socialProof.costEfficiency.metric')}</div>
          </div>
          
          {/* Speed of Construction */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-speed-construction">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-yellow-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-speed-construction">{t('socialProof.speed.title')}</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-speed-construction-description">
              {t('socialProof.speed.description')}
            </p>
            <div className="text-yellow-600 font-semibold" data-testid="text-speed-construction-metric">{t('socialProof.speed.metric')}</div>
          </div>
          
          {/* Consistency and Quality Control */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-quality-control">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="text-blue-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-quality-control">{t('socialProof.quality.title')}</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-quality-control-description">
              {t('socialProof.quality.description')}
            </p>
            <div className="text-blue-600 font-semibold" data-testid="text-quality-control-metric">{t('socialProof.quality.metric')}</div>
          </div>

          {/* Flexibility and Customization */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg" data-testid="card-flexibility">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Settings className="text-orange-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="heading-flexibility">{t('socialProof.flexibility.title')}</h3>
            <p className="text-muted-foreground text-lg mb-4" data-testid="text-flexibility-description">
              {t('socialProof.flexibility.description')}
            </p>
            <div className="text-orange-600 font-semibold" data-testid="text-flexibility-metric">{t('socialProof.flexibility.metric')}</div>
          </div>
          
          {/* Sustainability - Centered in grid */}
          <div className="card-hover bg-card rounded-2xl p-8 shadow-lg md:col-span-2 md:max-w-lg md:mx-auto" data-testid="card-sustainability">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Leaf className="text-teal-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4 text-left" data-testid="heading-sustainability">{t('socialProof.sustainability.title')}</h3>
            <p className="text-muted-foreground text-lg mb-4 text-left" data-testid="text-sustainability-description">
              {t('socialProof.sustainability.description')}
            </p>
            <div className="text-teal-600 font-semibold text-left" data-testid="text-sustainability-metric">{t('socialProof.sustainability.metric')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
