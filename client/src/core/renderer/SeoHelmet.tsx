import React, { useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { PortfolioMeta } from '../types/layout.types';

interface SeoHelmetProps {
  portfolioTitle: string;
  pageTitle: string;
  meta?: PortfolioMeta;
}

const SITE_URL = 'https://cms.hieurury.id.vn';

export const SeoHelmet: React.FC<SeoHelmetProps> = ({ portfolioTitle, pageTitle, meta }) => {
  const { language } = useI18n();

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

    // OG Image: prefer user-set, then author avatar, then site default
    const ogImage = meta?.seo?.ogImage || (meta?.aio as any)?.avatar || `${SITE_URL}/og-image.png`;
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

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const isPost = pathParts.includes('post');

    // BreadcrumbList
    const itemListElement = pathParts.map((part, index) => {
      const currentPath = '/' + pathParts.slice(0, index + 1).join('/');
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: part, // fallback, ideally we have real names
        item: `${SITE_URL}${currentPath}`,
      };
    });

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };

    const mainSchemaLd: any = meta?.aio
      ? {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          url: canonicalUrl,
          name: finalTitle,
          mainEntity: {
            '@type': 'Person',
            name: meta.aio.authorName || portfolioTitle,
            jobTitle: meta.aio.jobTitle || undefined,
            description: meta.aio.bio || description || undefined,
            sameAs: meta.aio.socialLinks?.length ? meta.aio.socialLinks : undefined,
            url: `${SITE_URL}${window.location.pathname}`,
            knowsAbout: meta?.seo?.keywords?.length ? meta.seo.keywords : undefined,
            image: meta?.seo?.ogImage || undefined,
          },
          isPartOf: {
            '@type': ['WebSite', 'SoftwareApplication'],
            '@id': `${SITE_URL}/#website`,
            name: 'Ruryfo CMS',
            url: SITE_URL,
          },
        }
      : {
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

    // If it's a post, we add a BlogPosting schema
    let blogPostingLd = undefined;
    if (isPost) {
      blogPostingLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: pageTitle,
        description: description,
        image: meta?.seo?.ogImage || `${SITE_URL}/og-image.png`,
        url: canonicalUrl,
        author: {
          '@type': 'Person',
          name: meta?.aio?.authorName || portfolioTitle,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Ruryfo CMS',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        }
      };
    }

    // Combine all schemas into an array
    const jsonLdArray = [mainSchemaLd, breadcrumbLd];
    if (blogPostingLd) {
      jsonLdArray.push(blogPostingLd);
    }
    jsonLdScript.textContent = JSON.stringify(jsonLdArray);

    return () => {
      // Cleanup on unmount - restore default site meta
      const defaultDesc =
        language === 'en'
          ? 'Ruryfo CMS is a Headless CMS platform that helps you build and share your personal portfolio automatically, quickly, and beautifully.'
          : 'Ruryfo CMS là nền tảng Headless CMS giúp bạn xây dựng và chia sẻ portfolio cá nhân một cách tự động, nhanh chóng và đẹp mắt.';

      document.title = 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động';
      setMetaTag('name', 'description', defaultDesc);
      setMetaTag('name', 'robots', 'index, follow');
      setMetaTag('property', 'og:title', 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động');
      setMetaTag('property', 'og:description', defaultDesc);
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('property', 'og:image', `${SITE_URL}/og-image.png`);
      setMetaTag('name', 'twitter:title', 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động');
      setMetaTag('name', 'twitter:description', defaultDesc);
      setMetaTag('name', 'twitter:image', `${SITE_URL}/og-image.png`);

      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [portfolioTitle, pageTitle, meta, language]);

  return null; // This component doesn't render anything visible
};
