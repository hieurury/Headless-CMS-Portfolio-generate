import { useEditorContext } from '../../context/EditorContext';
import type { LayoutSection } from '../../types/layout.types';
import { SectionRenderer } from '../SectionRenderer';
import _FlexEditGrid from './FlexEditGrid';

const GAP_MAP: Record<string, string> = {
  none: '0', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem',
};
const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end',
  between: 'space-between', around: 'space-around', evenly: 'space-evenly',
};
const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline',
};

const FlexGridRenderer: React.FC<{
  section: LayoutSection;
  depth: number;
}> = ({ section, depth }) => {
  const { isEditorMode, previewMode } = useEditorContext();
  const isEditing = isEditorMode && !previewMode;

  const direction = (section.props?.direction as string) ?? 'row';
  const gap = (section.props?.gap as string) ?? 'md';
  const justify = (section.props?.justify as string) ?? 'start';
  const align = (section.props?.align as string) ?? 'center';
  const wrap = (section.props?.wrap as string) ?? 'wrap';

  const flexStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction as React.CSSProperties['flexDirection'],
    gap: GAP_MAP[gap] || '0',
    justifyContent: JUSTIFY_MAP[justify] || 'flex-start',
    alignItems: ALIGN_MAP[align] || 'center',
    flexWrap: wrap as React.CSSProperties['flexWrap'],
    width: '100%',
  };

  // ── PREVIEW / PRODUCTION path ──────────────────────────────────────────
  if (!isEditing) {
    const validChildren = (section.children ?? []).filter(
      (c) => c && c.type !== '_colpad' && c.type !== '_column' && c.type !== '_empty'
    );
    return (
      <div id={section.name || section.id} style={flexStyle}>
        {validChildren.map((child) => (
          <div key={child.id} style={{ flexShrink: 0 }}>
            <SectionRenderer section={child} isChild depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  // ── EDIT path ──────────────────────────────────────────────────────────
  return (
    <_FlexEditGrid
      section={section}
      depth={depth}
      flexStyle={flexStyle}
    />
  );
};

export default FlexGridRenderer;
