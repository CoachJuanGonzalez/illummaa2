import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [location, navigate] = useLocation();

  // Get current language (normalize fr and fr-CA to 'fr')
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  // Update URL when language changes
  useEffect(() => {
    const pathWithoutLang = location.replace(/^\/(en|fr)(\/|$)/, '/');
    const newPath = `/${currentLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;

    if (location !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [currentLang, location, navigate]);

  const changeLanguage = (lang: string) => {
    // Change language
    i18n.changeLanguage(lang === 'fr' ? 'fr-CA' : 'en');

    // Update URL
    const pathWithoutLang = location.replace(/^\/(en|fr)(\/|$)/, '/');
    const newPath = `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    navigate(newPath);
  };

  return (
    <div
      className="flex items-center gap-2 ml-4"
      data-testid="language-switcher"
    >
      <button
        onClick={() => changeLanguage('en')}
        className={`
          text-sm font-semibold px-3 py-1 rounded transition-all duration-200
          min-h-[44px] min-w-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${currentLang === 'en'
            ? 'text-primary border-b-2 border-primary'
            : 'text-foreground hover:text-primary hover:bg-gray-100'
          }
        `}
        aria-label="Switch to English"
        aria-current={currentLang === 'en' ? 'true' : 'false'}
        data-testid="lang-button-en"
      >
        EN
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => changeLanguage('fr')}
        className={`
          text-sm font-semibold px-3 py-1 rounded transition-all duration-200
          min-h-[44px] min-w-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${currentLang === 'fr'
            ? 'text-primary border-b-2 border-primary'
            : 'text-foreground hover:text-primary hover:bg-gray-100'
          }
        `}
        aria-label="Passer au français"
        aria-current={currentLang === 'fr' ? 'true' : 'false'}
        data-testid="lang-button-fr"
      >
        FR
      </button>
    </div>
  );
}
