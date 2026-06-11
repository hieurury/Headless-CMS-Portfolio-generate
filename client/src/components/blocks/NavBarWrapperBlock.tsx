import React from 'react';
import { useEditorContext } from '../../core/context/EditorContext';

interface NavBarWrapperBlockProps {
  /** Stick to top of viewport while scrolling */
  sticky?: boolean;
  /** Become transparent when scrolled to very top (e.g. hero pages) */
  transparent?: boolean;
  /** Horizontal padding preset */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  /** Max-width constraint for inner content */
  maxWidth?: 'lg' | 'xl' | '2xl' | 'full';
  /** Background style */
  background?: 'dark' | 'glass' | 'light' | 'none';
  textColor?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  sectionId?: string;
  [key: string]: unknown;
}

const PADDING_X: Record<string, string> = {
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
};

const MAX_WIDTH: Record<string, string> = {
  lg:    '1024px',
  xl:    '1280px',
  '2xl': '1536px',
  full:  '100%',
};

const BG_STYLES: Record<string, React.CSSProperties> = {
  dark:  { backgroundColor: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  glass: { backgroundColor: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  light: { backgroundColor: 'rgba(255, 255, 255, 0.98)', borderBottom: '1px solid rgba(0,0,0,0.08)' },
  none:  {},
};

/**
 * NavBarWrapperBlock — composable sticky navigation container.
 *
 * This is a LAYOUT block (isContainer: true), not atomic.
 * Place inside it: Columns(2) → left cell [Logo/Heading] | right cell [Links + Button].
 */
export const NavBarWrapperBlock: React.FC<NavBarWrapperBlockProps> = ({
  sticky = true,
  transparent = false,
  padding = 'lg',
  maxWidth = 'xl',
  background = 'dark',
  textColor,
  backgroundColor,
  children,
  sectionId,
}) => {
  const [scrolled, setScrolled] = React.useState(false);
  const { isEditorMode, previewMode } = useEditorContext();
  const isEditing = isEditorMode && !previewMode;

  React.useEffect(() => {
    if (isEditing || !transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEditing, transparent]);

  const isTransparentNow = transparent && !scrolled && !isEditing;

  const bgStyle: React.CSSProperties = isTransparentNow
    ? { backgroundColor: 'transparent', borderBottom: '1px solid transparent' }
    : backgroundColor ? { backgroundColor } : BG_STYLES[background] ?? BG_STYLES.dark;

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    zIndex: 50,
    transition: 'background-color 300ms ease, border-color 300ms ease',
    ...(sticky ? { position: 'sticky', top: 0 } : {}),
    ...bgStyle,
    color: textColor,
  };

  return (
    <header id={sectionId} style={wrapperStyle}>
      <div
        style={{
          maxWidth: MAX_WIDTH[maxWidth] ?? MAX_WIDTH.xl,
          margin: '0 auto',
          paddingLeft:  PADDING_X[padding] ?? '40px',
          paddingRight: PADDING_X[padding] ?? '40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {children ?? (
          <span
            style={{
              fontSize: '12px',
              color: '#4b5563',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '8px 16px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            Drop a Columns block here → left: Heading · right: Links + Button
          </span>
        )}
      </div>
    </header>
  );
};
