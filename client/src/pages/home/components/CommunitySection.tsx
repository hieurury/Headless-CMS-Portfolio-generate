import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../../../store/uiStore';
import { t } from '../../../i18n';
import { ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_COMMUNITIES = [
  {
    id: '1',
    avatar: 'A',
    avatarColor: '#2a2a2a',
    creator: 'Anh Nguyen',
    siteName: 'Design Portfolio',
    slug: 'anh-design',
    description: 'UI/UX designer showcasing brand identity and digital products.',
    tags: ['Design', 'Branding'],
  },
  {
    id: '2',
    avatar: 'M',
    avatarColor: '#252525',
    creator: 'Minh Tran',
    siteName: 'Dev Showcase',
    slug: 'minh-dev',
    description: 'Full-stack developer portfolio with open source projects.',
    tags: ['Dev', 'Open Source'],
  },
  {
    id: '3',
    avatar: 'L',
    avatarColor: '#1e1e1e',
    creator: 'Linh Ho',
    siteName: 'Photography',
    slug: 'linh-photo',
    description: 'Street and portrait photography from Vietnam and Southeast Asia.',
    tags: ['Photo', 'Art'],
  },
  {
    id: '4',
    avatar: 'K',
    avatarColor: '#222',
    creator: 'Khoa Le',
    siteName: 'Motion Studio',
    slug: 'khoa-motion',
    description: 'Motion graphics and animation for brands and startups.',
    tags: ['Motion', 'Video'],
  },
  {
    id: '5',
    avatar: 'T',
    avatarColor: '#282828',
    creator: 'Tuan Pham',
    siteName: 'Tech Blog',
    slug: 'tuan-tech',
    description: 'Writing about software architecture, systems design and performance.',
    tags: ['Tech', 'Writing'],
  },
  {
    id: '6',
    avatar: 'H',
    avatarColor: '#202020',
    creator: 'Hoa Dinh',
    siteName: 'Creative Lab',
    slug: 'hoa-lab',
    description: 'Experimental creative work at the intersection of art and technology.',
    tags: ['Creative', 'Experimental'],
  },
  {
    id: '7',
    avatar: 'P',
    avatarColor: '#242424',
    creator: 'Phuc Vu',
    siteName: 'Product Design',
    slug: 'phuc-product',
    description: 'Product designer focused on accessible and inclusive design systems.',
    tags: ['Product', 'Accessibility'],
  },
  {
    id: '8',
    avatar: 'N',
    avatarColor: '#1c1c1c',
    creator: 'Nam Do',
    siteName: 'Data Science',
    slug: 'nam-data',
    description: 'Visualizing complex datasets and machine learning research.',
    tags: ['Data', 'ML'],
  },
  {
    id: '9',
    avatar: 'B',
    avatarColor: '#212121',
    creator: 'Bao Ly',
    siteName: 'Architecture',
    slug: 'bao-arch',
    description: 'Architectural concepts, renders and sustainable building projects.',
    tags: ['Architecture', '3D'],
  },
  {
    id: '10',
    avatar: 'Q',
    avatarColor: '#1e2020',
    creator: 'Quynh Ngo',
    siteName: 'Illustration',
    slug: 'quynh-art',
    description: 'Digital illustrations, character design and visual storytelling.',
    tags: ['Illustration', 'Art'],
  },
];

interface CommunityCardProps {
  item: (typeof MOCK_COMMUNITIES)[number];
  visitLabel: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ item, visitLabel }) => (
  <div className="community-card" id={`community-card-${item.id}`}>
    <div className="community-card__header">
      <div
        className="community-card__avatar"
        style={{ background: item.avatarColor }}
      >
        {item.avatar}
      </div>
      <div>
        <div className="community-card__creator">{item.creator}</div>
        <div className="community-card__site">{item.siteName}</div>
      </div>
    </div>
    <p className="community-card__desc">{item.description}</p>
    <div className="community-card__footer">
      <div className="community-card__tags">
        {item.tags.map((tag) => (
          <span key={tag} className="community-card__tag">{tag}</span>
        ))}
      </div>
      <a
        href={`/p/${item.slug}`}
        className="community-card__link"
        aria-label={`Visit ${item.siteName}`}
      >
        {visitLabel}
        <ExternalLink size={12} />
      </a>
    </div>
  </div>
);

export const CommunitySection: React.FC = () => {
  const { language } = useUIStore();
  const tr = t(language);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  // Duplicate for infinite loop
  const row1 = [...MOCK_COMMUNITIES, ...MOCK_COMMUNITIES];
  const row2 = [...MOCK_COMMUNITIES.slice(5), ...MOCK_COMMUNITIES.slice(0, 5), ...MOCK_COMMUNITIES.slice(5), ...MOCK_COMMUNITIES.slice(0, 5)];

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

      {/* Marquee row 1 — left */}
      <div className="marquee-wrapper" id="marquee-row-1" aria-label="Community portfolios">
        <div className="marquee-track marquee-track--left">
          {row1.map((item, i) => (
            <CommunityCard key={`r1-${item.id}-${i}`} item={item} visitLabel={tr.community.visitBtn} />
          ))}
        </div>
      </div>

      {/* Marquee row 2 — right */}
      <div className="marquee-wrapper" id="marquee-row-2" aria-hidden="true">
        <div className="marquee-track marquee-track--right">
          {row2.map((item, i) => (
            <CommunityCard key={`r2-${item.id}-${i}`} item={item} visitLabel={tr.community.visitBtn} />
          ))}
        </div>
      </div>
    </section>
  );
};
