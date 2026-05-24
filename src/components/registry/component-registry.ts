import { ComponentCategory } from '../schemas/component.schema';

/**
 * Built-in Component Registry seed data.
 *
 * These components are seeded into MongoDB on application startup.
 * Each entry defines the "contract" between the CMS layout JSON and
 * the frontend renderer (implemented in future phases).
 *
 * Schema field follows JSON Schema draft-07 conventions.
 * AI generation (Phase 2+) will use these schemas to validate layouts.
 */
export const BUILT_IN_COMPONENTS = [
  {
    type: 'navbar',
    name: 'Navigation Bar',
    description: 'Top navigation bar with logo, links, and optional CTA button',
    category: ComponentCategory.NAVIGATION,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', description: 'Text or image URL for the logo' },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              href: { type: 'string' },
            },
            required: ['label', 'href'],
          },
        },
        ctaLabel: { type: 'string', description: 'Call-to-action button label' },
        ctaHref: { type: 'string', description: 'Call-to-action button link' },
        sticky: { type: 'boolean', description: 'Whether the navbar sticks to top' },
      },
      required: ['logo', 'links'],
    },
    defaultProps: {
      logo: 'My Portfolio',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Projects', href: '/projects' },
        { label: 'Contact', href: '/contact' },
      ],
      ctaLabel: 'Hire Me',
      ctaHref: '/contact',
      sticky: true,
    },
  },

  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Full-width hero banner with heading, subtitle, and call-to-action',
    category: ComponentCategory.LAYOUT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        heading: { type: 'string', description: 'Main hero heading' },
        subheading: { type: 'string', description: 'Supporting subtitle text' },
        ctaLabel: { type: 'string', description: 'Primary CTA button label' },
        ctaHref: { type: 'string', description: 'Primary CTA button link' },
        secondaryCtaLabel: { type: 'string' },
        secondaryCtaHref: { type: 'string' },
        backgroundImage: { type: 'string', description: 'URL of background image' },
        alignment: {
          type: 'string',
          enum: ['left', 'center', 'right'],
          default: 'center',
        },
      },
      required: ['heading'],
    },
    defaultProps: {
      heading: "Hi, I'm [Your Name]",
      subheading: 'Full Stack Developer | Problem Solver | Creator',
      ctaLabel: 'View My Work',
      ctaHref: '/projects',
      secondaryCtaLabel: 'Contact Me',
      secondaryCtaHref: '/contact',
      alignment: 'center',
    },
  },

  {
    type: 'about',
    name: 'About Section',
    description: 'Personal bio section with text content and optional profile image',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        bio: { type: 'string', description: 'Rich text or plain text biography' },
        profileImage: { type: 'string', description: 'URL of profile photo' },
        highlights: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key facts or highlights about yourself',
        },
        imagePosition: {
          type: 'string',
          enum: ['left', 'right'],
          default: 'right',
        },
      },
      required: ['bio'],
    },
    defaultProps: {
      title: 'About Me',
      bio: 'I am a passionate developer with experience building web applications...',
      highlights: [
        '5+ years of experience',
        'Open source contributor',
        'Remote-first',
      ],
      imagePosition: 'right',
    },
  },

  {
    type: 'skills',
    name: 'Skills Grid',
    description: 'Grid display of technical skills grouped by category',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Category name, e.g. Frontend' },
              skills: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    level: {
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Proficiency percentage',
                    },
                    icon: { type: 'string', description: 'Icon URL or slug' },
                  },
                  required: ['name'],
                },
              },
            },
            required: ['name', 'skills'],
          },
        },
      },
      required: ['categories'],
    },
    defaultProps: {
      title: 'Skills & Technologies',
      subtitle: 'Technologies I work with',
      categories: [
        {
          name: 'Frontend',
          skills: [
            { name: 'React', level: 90 },
            { name: 'TypeScript', level: 85 },
            { name: 'CSS/TailwindCSS', level: 80 },
          ],
        },
        {
          name: 'Backend',
          skills: [
            { name: 'NestJS', level: 85 },
            { name: 'Node.js', level: 80 },
            { name: 'MongoDB', level: 75 },
          ],
        },
      ],
    },
  },

  {
    type: 'projects',
    name: 'Projects Grid',
    description: 'Card grid showcasing portfolio projects with links',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        projects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              image: { type: 'string', description: 'Cover image URL' },
              tags: { type: 'array', items: { type: 'string' } },
              demoUrl: { type: 'string' },
              githubUrl: { type: 'string' },
              featured: { type: 'boolean' },
            },
            required: ['name', 'description'],
          },
        },
        columns: {
          type: 'number',
          enum: [2, 3, 4],
          default: 3,
          description: 'Number of columns in the grid',
        },
      },
      required: ['projects'],
    },
    defaultProps: {
      title: 'My Projects',
      subtitle: 'Things I have built',
      columns: 3,
      projects: [
        {
          name: 'Project Alpha',
          description: 'A description of your awesome project',
          tags: ['React', 'NestJS', 'MongoDB'],
          featured: true,
        },
      ],
    },
  },

  {
    type: 'experience',
    name: 'Work Experience Timeline',
    description: 'Timeline of professional work experience',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        jobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              role: { type: 'string' },
              startDate: { type: 'string', description: 'e.g. Jan 2022' },
              endDate: { type: 'string', description: 'e.g. Present' },
              description: { type: 'string' },
              highlights: { type: 'array', items: { type: 'string' } },
              logo: { type: 'string' },
              location: { type: 'string' },
            },
            required: ['company', 'role', 'startDate'],
          },
        },
      },
      required: ['jobs'],
    },
    defaultProps: {
      title: 'Work Experience',
      jobs: [
        {
          company: 'Example Corp',
          role: 'Senior Developer',
          startDate: 'Jan 2022',
          endDate: 'Present',
          description: 'Led development of...',
          highlights: ['Increased performance by 40%', 'Mentored junior devs'],
          location: 'Remote',
        },
      ],
    },
  },

  {
    type: 'education',
    name: 'Education',
    description: 'Education history section',
    category: ComponentCategory.CONTENT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              institution: { type: 'string' },
              degree: { type: 'string' },
              field: { type: 'string', description: 'Field of study' },
              startYear: { type: 'string' },
              endYear: { type: 'string' },
              gpa: { type: 'string' },
              description: { type: 'string' },
              logo: { type: 'string' },
            },
            required: ['institution', 'degree'],
          },
        },
      },
      required: ['entries'],
    },
    defaultProps: {
      title: 'Education',
      entries: [
        {
          institution: 'University of Technology',
          degree: "Bachelor's",
          field: 'Computer Science',
          startYear: '2018',
          endYear: '2022',
        },
      ],
    },
  },

  {
    type: 'contact',
    name: 'Contact Section',
    description: 'Contact form and/or social media links',
    category: ComponentCategory.FORM,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        email: { type: 'string', format: 'email' },
        showForm: { type: 'boolean', description: 'Display contact form' },
        socials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['github', 'linkedin', 'twitter', 'instagram', 'website', 'other'],
              },
              url: { type: 'string', format: 'uri' },
              label: { type: 'string' },
            },
            required: ['platform', 'url'],
          },
        },
      },
      required: ['email'],
    },
    defaultProps: {
      title: 'Get In Touch',
      subtitle: "I'm always open to new opportunities",
      showForm: true,
      socials: [
        { platform: 'github', url: 'https://github.com/yourusername', label: 'GitHub' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/yourusername', label: 'LinkedIn' },
      ],
    },
  },

  {
    type: 'footer',
    name: 'Footer',
    description: 'Site footer with copyright text and optional links',
    category: ComponentCategory.LAYOUT,
    version: '1.0.0',
    isBuiltIn: true,
    schema: {
      type: 'object',
      properties: {
        copyright: { type: 'string' },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              href: { type: 'string' },
            },
            required: ['label', 'href'],
          },
        },
        showSocials: { type: 'boolean' },
      },
      required: ['copyright'],
    },
    defaultProps: {
      copyright: `© ${new Date().getFullYear()} My Portfolio. All rights reserved.`,
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
      showSocials: true,
    },
  },
];
