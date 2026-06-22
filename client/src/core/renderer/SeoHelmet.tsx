import React, { useEffect } from 'react';
import type { PortfolioMeta } from '../types/layout.types';

interface SeoHelmetProps {
  portfolioTitle: string;
  pageTitle: string;
  meta?: PortfolioMeta;
}

export const SeoHelmet: React.FC<SeoHelmetProps> = ({ portfolioTitle, pageTitle, meta }) => {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = meta?.seo?.title || `${pageTitle} — ${portfolioTitle}`;
    document.title = finalTitle;

    // Helper to set meta tags
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Set Meta Description
    if (meta?.seo?.description) {
      setMetaTag('name', 'description', meta.seo.description);
      setMetaTag('property', 'og:description', meta.seo.description);
    }

    // 3. Set Open Graph Image
    if (meta?.seo?.ogImage) {
      setMetaTag('property', 'og:image', meta.seo.ogImage);
    }

    // 4. Set Keywords
    if (meta?.seo?.keywords && meta.seo.keywords.length > 0) {
      setMetaTag('name', 'keywords', meta.seo.keywords.join(', '));
    }

    // 5. Inject JSON-LD (AIO Context)
    let jsonLdScript = document.querySelector('script[id="portfolio-json-ld"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('id', 'portfolio-json-ld');
      document.head.appendChild(jsonLdScript);
    }

    if (meta?.aio) {
      const { authorName, jobTitle, bio, socialLinks } = meta.aio;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: authorName || portfolioTitle,
        jobTitle: jobTitle || undefined,
        description: bio || meta?.seo?.description || undefined,
        sameAs: socialLinks || [],
        url: window.location.href,
      };
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else {
      // Default basic JSON-LD
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: portfolioTitle,
        url: window.location.href,
      };
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // Cleanup omitted for SPA transitions unless necessary
    };
  }, [portfolioTitle, pageTitle, meta]);

  return null; // This component doesn't render anything visible
};
