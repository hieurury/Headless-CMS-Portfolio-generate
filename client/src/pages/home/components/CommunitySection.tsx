import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { ExternalLink, Globe, Loader2 } from 'lucide-react';
import { publicService } from '../../../services/public.service';
import { CATEGORY_LABELS } from '../../../core/types/layout.types';

gsap.registerPlugin(ScrollTrigger);

interface CommunityItem {
  id: string;
  creator: string;
  siteName: string;
  slug: string;
  description: string;
  categories: string[];
  avatar: string;
  icon?: string;
}

interface CommunityCardProps {
  item: CommunityItem;
  visitLabel: string;
  language: 'en' | 'vi';
}

const CommunityCard: React.FC<CommunityCardProps> = ({ item, visitLabel, language }) => {
  return (
    <div className="community-card" id={`community-card-${item.id}`}>
      <div className="community-card__header">
        <div className="community-card__avatar">
          {item.icon ? (
            <span className="text-base leading-none">{item.icon}</span>
          ) : (
            item.avatar
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="community-card__creator">{item.creator}</div>
          <div className="community-card__site">{item.siteName}</div>
        </div>
      </div>
      <p className="community-card__desc">{item.description}</p>
      <div className="community-card__footer">
        <div className="community-card__tags">
          {item.categories.slice(0, 2).map((cat) => {
            const labelObj = CATEGORY_LABELS[cat];
            const label = labelObj ? labelObj[language] : cat;
            return (
              <span key={cat} className="community-card__tag">
                {label}
              </span>
            );
          })}
        </div>
        <Link
          to={`/p/${item.slug}`}
          className="community-card__link"
          aria-label={`Visit ${item.siteName}`}
        >
          {visitLabel}
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
};

export const CommunitySection: React.FC = () => {
  const { language } = useUIStore();
  const tr = t(language);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch only real published portfolios
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    publicService
      .listAll('', 1, 20)
      .then((res) => {
        if (!isMounted) return;
        if (res.data && res.data.length > 0) {
          const mapped: CommunityItem[] = res.data.map((p) => {
            const rawCategories = (p.meta as any)?.categories || ['technology'];
            const categories = Array.isArray(rawCategories) && rawCategories.length > 0 ? rawCategories : ['technology'];
            const avatarLetter = (p.ownerName || p.title || 'P').charAt(0).toUpperCase();
            return {
              id: p._id,
              creator: p.ownerName || (language === 'vi' ? 'Tác giả' : 'Creator'),
              siteName: p.title,
              slug: p.slug,
              description: p.description || (language === 'vi' ? 'Portfolio chuyên nghiệp xây dựng trên Ruryfo CMS.' : 'Professional portfolio built on Ruryfo CMS.'),
              categories,
              avatar: avatarLetter,
              icon: (p.meta as any)?.icon,
            };
          });
          setItems(mapped);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  // GSAP ScrollTrigger for header
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      },
    );
  }, []);

  // Build duplicated rows for seamless infinite marquee loop when real items exist
  const buildRow = (list: CommunityItem[]) => {
    if (list.length === 0) return [];
    let row = [...list];
    while (row.length < 6) {
      row = [...row, ...list];
    }
    return [...row, ...row];
  };

  const row1 = buildRow(items);
  const row2 = buildRow([...items.slice(Math.floor(items.length / 2)), ...items.slice(0, Math.floor(items.length / 2))]);

  return (
    <section ref={sectionRef} id="community-section" className="community-section">
      <div ref={headerRef} className="community-header">
        <span className="section-label" id="community-label">{tr.community.sectionLabel}</span>
        <h2 className="community-title" id="community-title">
          {tr.community.title}
          <br />
          <span className="community-title__accent">{tr.community.titleAccent}</span>
        </h2>
        <p className="community-subtitle">{tr.community.subtitle}</p>
      </div>

      {loading ? (
        <div className="community-empty">
          <Loader2 size={24} className="animate-spin text-[var(--home-text-muted)]" />
          <p className="community-empty__desc">
            {language === 'vi' ? 'Đang tải danh sách showcase...' : 'Loading showcase list...'}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="community-empty" id="community-empty-state">
          <Globe size={28} className="community-empty__icon" />
          <h3 className="community-empty__title">
            {language === 'vi' ? 'Chưa có portfolio nào được công bố' : 'No published portfolios yet'}
          </h3>
          <p className="community-empty__desc">
            {language === 'vi'
              ? 'Hiện tại chưa có portfolio công khai nào trong hệ thống. Hãy đăng nhập và xuất bản portfolio đầu tiên của bạn!'
              : 'There are currently no public portfolios on the system. Sign in and publish your first portfolio showcase!'}
          </p>
        </div>
      ) : (
        <>
          {/* Marquee row 1 — left */}
          <div className="marquee-wrapper" id="marquee-row-1" aria-label="Community portfolios">
            <div className="marquee-track marquee-track--left">
              {row1.map((item, i) => (
                <CommunityCard
                  key={`r1-${item.id}-${i}`}
                  item={item}
                  visitLabel={tr.community.visitBtn}
                  language={language}
                />
              ))}
            </div>
          </div>

          {/* Marquee row 2 — right */}
          <div className="marquee-wrapper" id="marquee-row-2" aria-hidden="true">
            <div className="marquee-track marquee-track--right">
              {row2.map((item, i) => (
                <CommunityCard
                  key={`r2-${item.id}-${i}`}
                  item={item}
                  visitLabel={tr.community.visitBtn}
                  language={language}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
