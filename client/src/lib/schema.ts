// Schema.org structured data for SEO
// Implements Organization, Product, BreadcrumbList, and other schemas

interface SchemaOrganization {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    "@type": string;
    addressCountry: string;
  };
  contactPoint?: {
    "@type": string;
    contactType: string;
    email?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
}

interface SchemaProduct {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  image: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: string;
  };
}

interface SchemaBreadcrumb {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item?: string;
  }>;
}

interface SchemaArticle {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: {
    "@type": string;
    name: string;
  };
  publisher: {
    "@type": string;
    name: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
}

/**
 * Get Organization schema markup
 * @param language - 'en' or 'fr'
 */
export function getOrganizationSchema(language: 'en' | 'fr' = 'en'): SchemaOrganization {
  const descriptions = {
    en: "Building Homes, Strengthening Communities. Premium modular homes for Canadian developers and builders.",
    fr: "Construire des maisons, renforcer les communautés. Maisons modulaires haut de gamme pour les développeurs et constructeurs canadiens."
  };

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ILLUMMAA",
    "url": "https://illummaa.com",
    "logo": "https://illummaa.com/favicon-512x512.png",
    "description": descriptions[language],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Business Inquiries",
      "email": "info@illummaa.com",
      "availableLanguage": ["English", "French"]
    },
    "sameAs": [
      // Add social media profiles when available
      // "https://www.linkedin.com/company/illummaa",
      // "https://twitter.com/illummaa"
    ]
  };
}

/**
 * Get Product schema markup for modular home models
 * @param name - Product name
 * @param description - Product description
 * @param image - Product image URL
 * @param price - Product price (string without currency symbol)
 * @param url - Product page URL
 * @param language - 'en' or 'fr'
 */
export function getProductSchema(
  name: string,
  description: string,
  image: string,
  price: string,
  url: string,
  language: 'en' | 'fr' = 'en'
): SchemaProduct {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "CAD",
      "availability": "https://schema.org/InStock",
      "url": url
    }
    // Add aggregateRating when you have reviews
  };
}

/**
 * Get BreadcrumbList schema markup for navigation
 * @param items - Array of breadcrumb items [{ name, url }]
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): SchemaBreadcrumb {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { item: item.url })
    }))
  };
}

/**
 * Get Article schema markup for blog posts
 * @param headline - Article headline
 * @param description - Article description
 * @param image - Article featured image URL
 * @param datePublished - ISO date string
 * @param dateModified - ISO date string
 * @param authorName - Author name
 */
export function getArticleSchema(
  headline: string,
  description: string,
  image: string,
  datePublished: string,
  dateModified: string,
  authorName: string
): SchemaArticle {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "image": image,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "ILLUMMAA",
      "logo": {
        "@type": "ImageObject",
        "url": "https://illummaa.com/favicon-512x512.png"
      }
    }
  };
}

/**
 * Inject schema markup into document head
 * @param schema - Schema object to inject
 * @param id - Optional ID to identify specific schema (for multiple schemas)
 */
export function injectSchema(schema: object, id?: string) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  if (id) {
    script.id = `schema-${id}`;
  }

  // If ID provided, remove existing schema with same ID
  if (id) {
    const existing = document.querySelector(`#schema-${id}`);
    if (existing) {
      existing.remove();
    }
  } else {
    // Remove any existing generic schema
    const existing = document.querySelector('script[type="application/ld+json"]:not([id])');
    if (existing) {
      existing.remove();
    }
  }

  document.head.appendChild(script);
}

/**
 * Inject multiple schemas at once
 * @param schemas - Array of schema objects with optional IDs
 */
export function injectMultipleSchemas(schemas: Array<{ schema: object; id?: string }>) {
  schemas.forEach(({ schema, id }) => {
    injectSchema(schema, id);
  });
}
