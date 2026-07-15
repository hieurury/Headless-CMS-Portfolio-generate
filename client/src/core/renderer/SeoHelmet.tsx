import React, { useEffect } from 'react';
import type { PortfolioMeta } from '../types/layout.types';

interface SeoHelmetProps {
  portfolioTitle: string;
  pageTitle: string;
  meta?: PortfolioMeta;
}

const SITE_URL = 'https://cms.hieurury.id.vn';

export const SeoHelmet: React.FC<SeoHelmetProps> = ({ portfolioTitle, pageTitle, meta }) => {
  useEffect(() => {
    // ── Helper: set/update a <meta> tag ──────────────────────────────
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // ── Helper: set/update a <link> tag ──────────────────────────────
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 1. Title
    const finalTitle = meta?.seo?.title
      ? meta.seo.title
      : `${pageTitle} — ${portfolioTitle} | Ruryfo CMS`;
    document.title = finalTitle;

    // 2. Canonical URL — prevents duplicate content issues
    const canonicalUrl = window.location.href.split('?')[0]; // strip query params
    setLinkTag('canonical', canonicalUrl);

    // 3. Meta Description
    const description = meta?.seo?.description ||
      `${portfolioTitle} — portfolio trên Ruryfo CMS`;
    setMetaTag('name', 'description', description);

    // 4. Robots
    setMetaTag('name', 'robots', 'index, follow');

    // 5. Open Graph tags
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'Ruryfo CMS');
    setMetaTag('property', 'og:locale', 'vi_VN');
    setMetaTag('property', 'og:type', meta?.aio ? 'profile' : 'website');

    // OG Image: prefer user-set, then site default (absolute URL)
    const ogImage = meta?.seo?.ogImage || `${SITE_URL}/og-image.png`;
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');

    // 6. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 7. Keywords — merge user SEO keywords with AIO-derived terms
    const keywords = new Set<string>();
    if (meta?.seo?.keywords && meta.seo.keywords.length > 0) {
      meta.seo.keywords.forEach(k => keywords.add(k));
    }
    if (meta?.aio?.authorName) {
      keywords.add(meta.aio.authorName);
      keywords.add(`${meta.aio.authorName} portfolio`);
    }
    if (meta?.aio?.jobTitle) {
      keywords.add(meta.aio.jobTitle);
    }
    // Always add platform-level keywords
    keywords.add('ruryfo cms');
    if (keywords.size > 0) {
      setMetaTag('name', 'keywords', Array.from(keywords).join(', '));
    }

    // 8. JSON-LD Structured Data
    let jsonLdScript = document.querySelector('script[id="portfolio-json-ld"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('id', 'portfolio-json-ld');
      document.head.appendChild(jsonLdScript);
    }

    if (meta?.aio) {
      // Portfolio with author info → ProfilePage schema
      const { authorName, jobTitle, bio, socialLinks } = meta.aio;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: canonicalUrl,
        name: finalTitle,
        mainEntity: {
          '@type': 'Person',
          name: authorName || portfolioTitle,
          jobTitle: jobTitle || undefined,
          description: bio || description || undefined,
          sameAs: socialLinks?.length ? socialLinks : undefined,
          url: `${SITE_URL}/p/${window.location.pathname.split('/p/')[1]?.split('/')[0] || ''}`,
          knowsAbout: meta?.seo?.keywords?.length ? meta.seo.keywords : undefined,
          image: meta?.seo?.ogImage || undefined,
        },
        isPartOf: {
          '@type': ['WebSite', 'SoftwareApplication'],
          '@id': `${SITE_URL}/#website`,
          name: 'Ruryfo CMS',
          url: SITE_URL,
        },
      };
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else {
      // Generic portfolio without AIO → WebPage schema
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: canonicalUrl,
        name: finalTitle,
        description: description,
        isPartOf: {
          '@type': ['WebSite', 'SoftwareApplication'],
          '@id': `${SITE_URL}/#website`,
          name: 'Ruryfo CMS',
          url: SITE_URL,
        },
      };
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // Cleanup omitted for SPA transitions — handled on next mount
    };
  }, [portfolioTitle, pageTitle, meta]);

  return null; // This component doesn't render anything visible
};
