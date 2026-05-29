/**
 * Template Library — pre-built layout trees composed from existing Layout + Block components.
 *
 * Each template is a function that returns a LayoutSection tree.
 * When added to the canvas, the entire tree is injected (not just a single node).
 *
 * This replaces the old Sections tab concept:
 *   - Old: Section = monolithic component with no element-level schema
 *   - New: Template = section-wrapper (or layout root) + atomic blocks with full schema
 */

import type { LayoutSection } from '../types/layout.types';

export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'contact' | 'layout' | 'other';
  emoji: string;
  /** Builds and returns the LayoutSection tree to inject into the canvas */
  build: () => LayoutSection;
}

// ─── ID Helpers ───────────────────────────────────────────────────────────────

let _counter = 0;
function uid(prefix = 'tpl'): string {
  return `${prefix}-${Date.now()}-${++_counter}`;
}

// ─── Template Definitions ─────────────────────────────────────────────────────

export const templateLibrary: TemplateEntry[] = [

  // ─── Hero Templates ─────────────────────────────────────────────────────────

  {
    id: 'hero-centered',
    name: 'Hero — Centered',
    description: 'Full-width hero with badge, heading, description, and two CTA buttons centered.',
    category: 'hero',
    emoji: '🚀',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'hero',
      props: {
        background: 'gradient',
        padding: 'xl',
        align: 'center',
        maxWidth: 'lg',
      },
      children: [
        {
          id: uid('badge'),
          type: 'badge',
          name: '',
          props: { label: '✨ Available for opportunities', variant: 'indigo', align: 'center' },
          children: [],
        },
        {
          id: uid('heading'),
          type: 'heading',
          name: '',
          props: { text: "Hi, I'm Your Name", level: 'h1', size: '5xl', align: 'center', gradient: true },
          children: [],
        },
        {
          id: uid('text'),
          type: 'text',
          name: '',
          props: { content: 'Full Stack Developer · Problem Solver · Creator. I build beautiful digital products that users love.', size: 'lg', align: 'center', muted: true },
          children: [],
        },
        {
          id: uid('row'),
          type: 'row',
          name: '',
          props: { gap: 'sm', align: 'center' },
          children: [
            {
              id: uid('btn1'),
              type: 'button',
              name: '',
              props: { label: 'View My Work', href: '#projects', variant: 'primary', size: 'lg', align: 'center' },
              children: [],
            },
            {
              id: uid('btn2'),
              type: 'button',
              name: '',
              props: { label: 'Get In Touch', href: '#contact', variant: 'secondary', size: 'lg', align: 'center' },
              children: [],
            },
          ],
        },
      ],
    }),
  },

  {
    id: 'hero-split',
    name: 'Hero — Split',
    description: 'Two-column hero: text left, image right.',
    category: 'hero',
    emoji: '⚡',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'hero',
      props: { background: 'default', padding: 'xl', align: 'left', maxWidth: 'xl' },
      children: [
        {
          id: uid('split'),
          type: 'split',
          name: '',
          props: { leftWidth: '50', verticalAlign: 'center', gap: 'xl', reverse: false },
          children: [
            {
              id: uid('left'),
              type: '_column',
              name: '',
              props: { align: 'start', gap: 'md' },
              children: [
                {
                  id: uid('badge'),
                  type: 'badge',
                  name: '',
                  props: { label: '👋 Hello World', variant: 'indigo', align: 'left' },
                  children: [],
                },
                {
                  id: uid('heading'),
                  type: 'heading',
                  name: '',
                  props: { text: "I'm a Full Stack Developer", level: 'h1', size: '4xl', align: 'left', gradient: true },
                  children: [],
                },
                {
                  id: uid('text'),
                  type: 'text',
                  name: '',
                  props: { content: 'I craft beautiful, performant web applications that solve real-world problems.', size: 'lg', align: 'left', muted: true },
                  children: [],
                },
                {
                  id: uid('btn'),
                  type: 'button',
                  name: '',
                  props: { label: 'Explore My Work', href: '#projects', variant: 'primary', size: 'lg', align: 'left' },
                  children: [],
                },
              ],
            },
            {
              id: uid('right'),
              type: '_column',
              name: '',
              props: { align: 'center', gap: 'md' },
              children: [
                {
                  id: uid('img'),
                  type: 'image',
                  name: '',
                  props: { src: '', alt: 'Profile photo', width: '100%', borderRadius: '2xl', align: 'center' },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // ─── About Templates ─────────────────────────────────────────────────────────

  {
    id: 'about-split',
    name: 'About — Split',
    description: 'Split layout: photo left, bio and highlights right.',
    category: 'about',
    emoji: '👤',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'about',
      props: { title: 'About Me', subtitle: 'A little about who I am', background: 'alternate', padding: 'lg', align: 'center', maxWidth: 'xl' },
      children: [
        {
          id: uid('split'),
          type: 'split',
          name: '',
          props: { leftWidth: '40', verticalAlign: 'center', gap: 'xl', reverse: false },
          children: [
            {
              id: uid('left'),
              type: '_column',
              name: '',
              props: { align: 'center', gap: 'sm' },
              children: [
                {
                  id: uid('img'),
                  type: 'image',
                  name: '',
                  props: { src: '', alt: 'Profile photo', width: '100%', borderRadius: '2xl', align: 'center' },
                  children: [],
                },
              ],
            },
            {
              id: uid('right'),
              type: '_column',
              name: '',
              props: { align: 'start', gap: 'md' },
              children: [
                {
                  id: uid('heading'),
                  type: 'heading',
                  name: '',
                  props: { text: "I'm a passionate developer", level: 'h3', size: '2xl', align: 'left' },
                  children: [],
                },
                {
                  id: uid('text'),
                  type: 'text',
                  name: '',
                  props: { content: 'I have 5+ years of experience building full-stack applications. I love clean code, great UX, and solving complex problems with simple solutions.', size: 'base', align: 'left', muted: true },
                  children: [],
                },
                {
                  id: uid('text2'),
                  type: 'text',
                  name: '',
                  props: { content: '✓ 5+ years of experience\n✓ 50+ projects delivered\n✓ Open source contributor', size: 'sm', align: 'left', muted: true },
                  children: [],
                },
                {
                  id: uid('btn'),
                  type: 'button',
                  name: '',
                  props: { label: 'Download CV', href: '#', variant: 'secondary', size: 'md', align: 'left' },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // ─── Skills Templates ─────────────────────────────────────────────────────────

  {
    id: 'skills-features',
    name: 'Skills — Feature Cards',
    description: '3-column grid of feature cards for skills/services.',
    category: 'skills',
    emoji: '⚡',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'skills',
      props: { title: 'Skills & Technologies', subtitle: 'Technologies I work with every day', background: 'default', padding: 'lg', align: 'center', maxWidth: 'xl' },
      children: [
        {
          id: uid('cols'),
          type: 'columns',
          name: '',
          props: { columns: '3', gap: 'md', align: 'start' },
          children: [
            {
              id: uid('col1'),
              type: '_column',
              name: '',
              props: {},
              children: [
                {
                  id: uid('fc1'),
                  type: 'feature-card',
                  name: '',
                  props: { icon: '⚛️', title: 'Frontend', description: 'React, TypeScript, Next.js, TailwindCSS', variant: 'glass', accent: 'indigo' },
                  children: [],
                },
              ],
            },
            {
              id: uid('col2'),
              type: '_column',
              name: '',
              props: {},
              children: [
                {
                  id: uid('fc2'),
                  type: 'feature-card',
                  name: '',
                  props: { icon: '🔧', title: 'Backend', description: 'Node.js, NestJS, Express, REST & GraphQL APIs', variant: 'glass', accent: 'violet' },
                  children: [],
                },
              ],
            },
            {
              id: uid('col3'),
              type: '_column',
              name: '',
              props: {},
              children: [
                {
                  id: uid('fc3'),
                  type: 'feature-card',
                  name: '',
                  props: { icon: '🗄️', title: 'Database', description: 'MongoDB, PostgreSQL, Redis, Prisma', variant: 'glass', accent: 'emerald' },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  {
    id: 'stats-row',
    name: 'Stats Row',
    description: 'Row of 4 stat counters — great for years, projects, clients.',
    category: 'skills',
    emoji: '📊',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'stats',
      props: { background: 'alternate', padding: 'md', align: 'center', maxWidth: 'xl' },
      children: [
        {
          id: uid('cols'),
          type: 'columns',
          name: '',
          props: { columns: '4', gap: 'md', align: 'center' },
          children: [
            { id: uid('c1'), type: '_column', name: '', props: {}, children: [{ id: uid('s1'), type: 'stat', name: '', props: { value: '5+', label: 'Years Experience', icon: '🏆', variant: 'card', accent: 'indigo', align: 'center' }, children: [] }] },
            { id: uid('c2'), type: '_column', name: '', props: {}, children: [{ id: uid('s2'), type: 'stat', name: '', props: { value: '50+', label: 'Projects Built', icon: '🚀', variant: 'card', accent: 'violet', align: 'center' }, children: [] }] },
            { id: uid('c3'), type: '_column', name: '', props: {}, children: [{ id: uid('s3'), type: 'stat', name: '', props: { value: '30+', label: 'Happy Clients', icon: '😊', variant: 'card', accent: 'emerald', align: 'center' }, children: [] }] },
            { id: uid('c4'), type: '_column', name: '', props: {}, children: [{ id: uid('s4'), type: 'stat', name: '', props: { value: '99%', label: 'Satisfaction Rate', icon: '⭐', variant: 'card', accent: 'amber', align: 'center' }, children: [] }] },
          ],
        },
      ],
    }),
  },

  // ─── Experience Templates ─────────────────────────────────────────────────────

  {
    id: 'experience-timeline',
    name: 'Experience Timeline',
    description: 'Vertical timeline of work experience entries.',
    category: 'experience',
    emoji: '💼',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'experience',
      props: { title: 'Work Experience', subtitle: 'My professional journey', background: 'default', padding: 'lg', align: 'center', maxWidth: 'lg' },
      children: [
        {
          id: uid('row'),
          type: 'row',
          name: '',
          props: { gap: 'lg', align: 'stretch', padding: 'none' },
          children: [
            {
              id: uid('tl1'),
              type: 'timeline-item',
              name: '',
              props: {
                role: 'Senior Developer',
                company: 'Tech Company Inc.',
                startDate: 'Jan 2022',
                endDate: 'Present',
                location: 'Remote',
                description: 'Led development of scalable microservices and mentored junior developers.',
                highlights: [{ value: 'Improved performance by 40%' }, { value: 'Shipped 15+ features' }],
                variant: 'card',
                accent: 'indigo',
                showDot: true,
              },
              children: [],
            },
            {
              id: uid('tl2'),
              type: 'timeline-item',
              name: '',
              props: {
                role: 'Frontend Developer',
                company: 'Startup XYZ',
                startDate: 'Mar 2020',
                endDate: 'Dec 2021',
                location: 'Ho Chi Minh City',
                description: 'Built the product UI from scratch using React and TypeScript.',
                highlights: [{ value: 'Reduced load time by 60%' }, { value: 'Grew team from 2 to 8' }],
                variant: 'card',
                accent: 'violet',
                showDot: true,
              },
              children: [],
            },
          ],
        },
      ],
    }),
  },

  // ─── Projects Templates ─────────────────────────────────────────────────────

  {
    id: 'projects-cards',
    name: 'Projects Grid',
    description: '3-column grid of project cards with image, title, and description.',
    category: 'projects',
    emoji: '🗂️',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'projects',
      props: { title: 'My Projects', subtitle: 'Things I have built', background: 'alternate', padding: 'lg', align: 'center', maxWidth: 'xl' },
      children: [
        {
          id: uid('cols'),
          type: 'columns',
          name: '',
          props: { columns: '3', gap: 'md', align: 'start' },
          children: [
            {
              id: uid('c1'),
              type: '_column',
              name: '',
              props: {},
              children: [
                {
                  id: uid('card1'),
                  type: 'card',
                  name: '',
                  props: { variant: 'glass', padding: 'md', radius: 'xl', showHeader: true, title: 'Project Alpha', subtitle: 'React · NestJS · MongoDB' },
                  children: [
                    { id: uid('img1'), type: 'image', name: '', props: { src: '', alt: 'Project screenshot', borderRadius: 'lg', align: 'center' }, children: [] },
                    { id: uid('txt1'), type: 'text', name: '', props: { content: 'A description of your awesome project and what problems it solves.', size: 'sm', muted: true }, children: [] },
                    { id: uid('btn1'), type: 'button', name: '', props: { label: 'View Demo', href: '#', variant: 'ghost', size: 'sm', align: 'left' }, children: [] },
                  ],
                },
              ],
            },
            {
              id: uid('c2'),
              type: '_column',
              name: '',
              props: {},
              children: [
                {
                  id: uid('card2'),
                  type: 'card',
                  name: '',
                  props: { variant: 'glass', padding: 'md', radius: 'xl', showHeader: true, title: 'Project Beta', subtitle: 'TypeScript · Prisma · PostgreSQL' },
                  children: [
                    { id: uid('img2'), type: 'image', name: '', props: { src: '', alt: 'Project screenshot', borderRadius: 'lg', align: 'center' }, children: [] },
                    { id: uid('txt2'), type: 'text', name: '', props: { content: 'Another amazing project with great features and excellent performance.', size: 'sm', muted: true }, children: [] },
                    { id: uid('btn2'), type: 'button', name: '', props: { label: 'View on GitHub', href: '#', variant: 'ghost', size: 'sm', align: 'left' }, children: [] },
                  ],
                },
              ],
            },
            {
              id: uid('c3'),
              type: '_column',
              name: '',
              props: {},
              children: [
                {
                  id: uid('card3'),
                  type: 'card',
                  name: '',
                  props: { variant: 'glass', padding: 'md', radius: 'xl', showHeader: true, title: 'Project Gamma', subtitle: 'Next.js · TailwindCSS · Vercel' },
                  children: [
                    { id: uid('img3'), type: 'image', name: '', props: { src: '', alt: 'Project screenshot', borderRadius: 'lg', align: 'center' }, children: [] },
                    { id: uid('txt3'), type: 'text', name: '', props: { content: 'A third project showcasing your versatility and technical skills.', size: 'sm', muted: true }, children: [] },
                    { id: uid('btn3'), type: 'button', name: '', props: { label: 'Live Site', href: '#', variant: 'ghost', size: 'sm', align: 'left' }, children: [] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // ─── Contact Templates ───────────────────────────────────────────────────────

  {
    id: 'contact-simple',
    name: 'Contact — Simple',
    description: 'Contact section with heading, text, and email button.',
    category: 'contact',
    emoji: '📬',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'contact',
      props: { title: "Let's Work Together", subtitle: "Have a project in mind? I'd love to hear about it.", background: 'gradient', padding: 'xl', align: 'center', maxWidth: 'md' },
      children: [
        {
          id: uid('row'),
          type: 'row',
          name: '',
          props: { gap: 'sm', align: 'center' },
          children: [
            { id: uid('btn1'), type: 'button', name: '', props: { label: '📧 Send Email', href: 'mailto:you@example.com', variant: 'primary', size: 'lg', align: 'center' }, children: [] },
            { id: uid('btn2'), type: 'button', name: '', props: { label: 'LinkedIn', href: 'https://linkedin.com', variant: 'secondary', size: 'lg', align: 'center' }, children: [] },
          ],
        },
      ],
    }),
  },

  // ─── Navigation / Wrapper Templates ─────────────────────────────────────────

  {
    id: 'navbar-default',
    name: 'Navbar',
    description: 'Sticky navigation bar with logo, links, and CTA button.',
    category: 'layout',
    emoji: '🧭',
    build: (): LayoutSection => ({
      id: uid('navbar'),
      type: 'navbar',
      name: 'nav',
      props: {
        logo: 'My Portfolio',
        links: [
          { label: 'About', href: '#about' },
          { label: 'Work', href: '#work' },
          { label: 'Contact', href: '#contact' },
        ],
        ctaLabel: 'Hire Me',
        ctaHref: '#contact',
        sticky: true,
        transparent: true,
      },
      children: [],
    }),
  },

  {
    id: 'footer-simple',
    name: 'Footer',
    description: 'Site footer with copyright, links, and social icons.',
    category: 'layout',
    emoji: '⬇️',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'footer',
      props: { background: 'dark', padding: 'md', align: 'center', maxWidth: 'xl' },
      children: [
        {
          id: uid('row'),
          type: 'row',
          name: '',
          props: { gap: 'sm', align: 'center', padding: 'none' },
          children: [
            { id: uid('copy'), type: 'text', name: '', props: { content: `© ${new Date().getFullYear()} My Portfolio. All rights reserved.`, size: 'sm', align: 'center', muted: true }, children: [] },
            { id: uid('div'), type: 'divider', name: '', props: { style: 'gradient', spacing: 'sm' }, children: [] },
            {
              id: uid('links'),
              type: 'row',
              name: '',
              props: { gap: 'sm', align: 'center', padding: 'none' },
              children: [
                { id: uid('b1'), type: 'button', name: '', props: { label: 'Privacy', href: '/privacy', variant: 'ghost', size: 'sm', align: 'center' }, children: [] },
                { id: uid('b2'), type: 'button', name: '', props: { label: 'Resume', href: '#', variant: 'ghost', size: 'sm', align: 'center' }, children: [] },
              ],
            },
          ],
        },
      ],
    }),
  },

  // ─── Education Template ──────────────────────────────────────────────────────

  {
    id: 'education-timeline',
    name: 'Education',
    description: 'Timeline of academic degrees and achievements.',
    category: 'experience',
    emoji: '🎓',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'education',
      props: { title: 'Education', subtitle: 'Academic background', background: 'alternate', padding: 'lg', align: 'center', maxWidth: 'lg' },
      children: [
        {
          id: uid('row'),
          type: 'row',
          name: '',
          props: { gap: 'md', align: 'stretch', padding: 'none' },
          children: [
            {
              id: uid('tl1'),
              type: 'timeline-item',
              name: '',
              props: {
                role: "Bachelor's in Computer Science",
                company: 'University of Technology',
                startDate: '2018',
                endDate: '2022',
                location: 'Ho Chi Minh City',
                description: 'Focus on algorithms, distributed systems, and software engineering.',
                highlights: [{ value: 'GPA: 3.8/4.0' }, { value: 'Dean\'s List 3 years' }],
                variant: 'card',
                accent: 'indigo',
                showDot: true,
              },
              children: [],
            },
          ],
        },
      ],
    }),
  },

  // ─── Skills Badge Cloud ──────────────────────────────────────────────────────

  {
    id: 'skills-badges',
    name: 'Skills — Badge Cloud',
    description: 'Section-wrapper with a dense grid of skill badges.',
    category: 'skills',
    emoji: '🏷️',
    build: (): LayoutSection => ({
      id: uid('section'),
      type: 'section-wrapper',
      name: 'skills',
      props: { title: 'Tech Stack', subtitle: 'Technologies I use every day', background: 'default', padding: 'lg', align: 'center', maxWidth: 'lg' },
      children: [
        {
          id: uid('cols'),
          type: 'columns',
          name: '',
          props: { columns: '4', gap: 'sm', align: 'start' },
          children: [
            { id: uid('c1'), type: '_column', name: '', props: {}, children: [{ id: uid('b1'), type: 'badge', name: '', props: { label: 'React', variant: 'indigo', align: 'center' }, children: [] }] },
            { id: uid('c2'), type: '_column', name: '', props: {}, children: [{ id: uid('b2'), type: 'badge', name: '', props: { label: 'TypeScript', variant: 'violet', align: 'center' }, children: [] }] },
            { id: uid('c3'), type: '_column', name: '', props: {}, children: [{ id: uid('b3'), type: 'badge', name: '', props: { label: 'Node.js', variant: 'emerald', align: 'center' }, children: [] }] },
            { id: uid('c4'), type: '_column', name: '', props: {}, children: [{ id: uid('b4'), type: 'badge', name: '', props: { label: 'NestJS', variant: 'rose', align: 'center' }, children: [] }] },
            { id: uid('c5'), type: '_column', name: '', props: {}, children: [{ id: uid('b5'), type: 'badge', name: '', props: { label: 'Next.js', variant: 'slate', align: 'center' }, children: [] }] },
            { id: uid('c6'), type: '_column', name: '', props: {}, children: [{ id: uid('b6'), type: 'badge', name: '', props: { label: 'MongoDB', variant: 'emerald', align: 'center' }, children: [] }] },
            { id: uid('c7'), type: '_column', name: '', props: {}, children: [{ id: uid('b7'), type: 'badge', name: '', props: { label: 'Docker', variant: 'sky', align: 'center' }, children: [] }] },
            { id: uid('c8'), type: '_column', name: '', props: {}, children: [{ id: uid('b8'), type: 'badge', name: '', props: { label: 'PostgreSQL', variant: 'indigo', align: 'center' }, children: [] }] },
          ],
        },
      ],
    }),
  },
];

// ─── Category Meta ────────────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES: Record<TemplateEntry['category'], { label: string; emoji: string }> = {
  hero:       { label: 'Hero',       emoji: '🚀' },
  about:      { label: 'About',      emoji: '👤' },
  skills:     { label: 'Skills',     emoji: '⚡' },
  projects:   { label: 'Projects',   emoji: '🗂️' },
  experience: { label: 'Experience', emoji: '💼' },
  contact:    { label: 'Contact',    emoji: '📬' },
  layout:     { label: 'Layout',     emoji: '🧱' },
  other:      { label: 'Other',      emoji: '✨' },
};

