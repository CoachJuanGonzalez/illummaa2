import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOConfig {
  title: string;
  titleFr?: string; // French title
  description: string;
  descriptionFr?: string; // French description
  keywords?: string;
  keywordsFr?: string; // French keywords
  canonicalUrl?: string;
  ogImage?: string;
  language?: 'en' | 'fr'; // Current language
}

export function useSEO(config: SEOConfig) {
  const [location] = useLocation();

  useEffect(() => {
    const baseUrl = 'https://illummaa.com';
    const lang = config.language || detectLanguageFromPath(location);
    const fullUrl = `${baseUrl}${location}`;

    // Determine canonical URL based on language
    const canonicalUrl = config.canonicalUrl || fullUrl;

    // Use French content if available and language is French
    const title = lang === 'fr' && config.titleFr ? config.titleFr : config.title;
    const description = lang === 'fr' && config.descriptionFr ? config.descriptionFr : config.description;
    const keywords = lang === 'fr' && config.keywordsFr ? config.keywordsFr : config.keywords;

    // Update document title
    document.title = title;

    // Update or create meta tags
    updateMetaTag('description', description);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:locale', lang === 'fr' ? 'fr_CA' : 'en_CA', 'property');
    updateMetaTag('og:type', 'website', 'property');
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage, 'property');
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (config.ogImage) {
      updateMetaTag('twitter:image', config.ogImage);
    }

    // Update canonical link
    updateCanonicalLink(canonicalUrl);

    // Add hreflang links for language alternatives
    updateHreflangLinks(location);

    // Cleanup function
    return () => {
      // Reset to default values if needed
    };
  }, [location, config]);
}

function detectLanguageFromPath(path: string): 'en' | 'fr' {
  if (path.startsWith('/fr')) return 'fr';
  if (path.startsWith('/en')) return 'en';
  // Default to English for legacy URLs
  return 'en';
}

function updateMetaTag(name: string, content: string, attributeName: string = 'name') {
  let element = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}

function updateHreflangLinks(currentPath: string) {
  // Remove existing hreflang links
  const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existingHreflangs.forEach(link => link.remove());

  // Determine the base path without language prefix
  let basePath = currentPath;
  if (basePath.startsWith('/en/')) {
    basePath = basePath.substring(3);
  } else if (basePath.startsWith('/fr/')) {
    basePath = basePath.substring(3);
  } else if (basePath === '/en' || basePath === '/fr') {
    basePath = '/';
  }

  // Add new hreflang links
  const baseUrl = 'https://illummaa.com';

  // English version
  const enLink = document.createElement('link');
  enLink.setAttribute('rel', 'alternate');
  enLink.setAttribute('hreflang', 'en');
  enLink.setAttribute('href', `${baseUrl}/en${basePath}`);
  document.head.appendChild(enLink);

  // French version
  const frLink = document.createElement('link');
  frLink.setAttribute('rel', 'alternate');
  frLink.setAttribute('hreflang', 'fr');
  frLink.setAttribute('href', `${baseUrl}/fr${basePath}`);
  document.head.appendChild(frLink);

  // x-default (for users without language preference)
  const defaultLink = document.createElement('link');
  defaultLink.setAttribute('rel', 'alternate');
  defaultLink.setAttribute('hreflang', 'x-default');
  defaultLink.setAttribute('href', `${baseUrl}/en${basePath}`);
  document.head.appendChild(defaultLink);
}
