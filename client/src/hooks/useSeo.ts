import { useEffect } from 'react';
import { useI18n } from './useI18n';

interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'profile' | 'article';
  jsonLd?: Record<string, any>;
}

const SITE_URL = 'https://cms.hieurury.id.vn';

const setMetaTag = (attr: string, key: string, content: string) => {
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return element;
};

const setLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  return element;
};

export const useSeo = ({
  title,
  description,
  keywords,
  ogImage,
  noindex,
  type = 'website',
  jsonLd,
}: SeoOptions) => {
  const { language } = useI18n();

  useEffect(() => {
    // Save original title to restore later
    const originalTitle = document.title;
    
    // Set title
    document.title = title;

    // Canonical URL
    const canonicalUrl = window.location.href.split('?')[0];
    setLinkTag('canonical', canonicalUrl);

    // Meta Description
    const defaultDesc =
      language === 'en'
        ? 'Ruryfo CMS is a Headless CMS platform that helps you build and share your personal portfolio automatically, quickly, and beautifully.'
        : 'Ruryfo CMS là nền tảng Headless CMS giúp bạn xây dựng và chia sẻ portfolio cá nhân một cách tự động, nhanh chóng và đẹp mắt.';
    const finalDescription = description || defaultDesc;
    setMetaTag('name', 'description', finalDescription);

    // Robots
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
    setMetaTag('name', 'robots', robotsContent);

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'Ruryfo CMS');
    setMetaTag('property', 'og:locale', language === 'en' ? 'en_US' : 'vi_VN');
    setMetaTag('property', 'og:type', type);

    const finalOgImage = ogImage || `${SITE_URL}/og-image.png`;
    setMetaTag('property', 'og:image', finalOgImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:image', finalOgImage);

    // Keywords
    if (keywords && keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    } else {
      setMetaTag(
        'name',
        'keywords',
        'ruryfo, ruryfo cms, cms portfolio cá nhân, tạo portfolio tự động, headless cms việt nam, trang cá nhân online'
      );
    }

    // JSON-LD
    let jsonLdScript = document.querySelector('script[id="dynamic-json-ld"]');
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.setAttribute('type', 'application/ld+json');
        jsonLdScript.setAttribute('id', 'dynamic-json-ld');
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }

    // Cleanup function
    return () => {
      document.title = originalTitle;
      // Restore default title
      document.title = 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động';
      
      // Restore default description
      setMetaTag('name', 'description', defaultDesc);
      
      // Restore robots
      setMetaTag('name', 'robots', 'index, follow');
      
      // Restore Open Graph
      setMetaTag('property', 'og:title', 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động');
      setMetaTag('property', 'og:description', defaultDesc);
      setMetaTag('property', 'og:type', 'website');
      const defaultImage = `${SITE_URL}/og-image.png`;
      setMetaTag('property', 'og:image', defaultImage);
      
      // Restore Twitter Card
      setMetaTag('name', 'twitter:title', 'Ruryfo CMS — Nền tảng tạo Portfolio cá nhân tự động');
      setMetaTag('name', 'twitter:description', defaultDesc);
      setMetaTag('property', 'og:image', defaultImage);
      setMetaTag('name', 'twitter:image', defaultImage);

      const script = document.querySelector('script[id="dynamic-json-ld"]');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, ogImage, noindex, type, language, jsonLd]);
};
