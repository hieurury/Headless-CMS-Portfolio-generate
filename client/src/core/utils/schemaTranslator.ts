import type { FieldSchema } from '../types/registry.types';

// Mapping: componentType.fieldKey → translation path
const SCHEMA_TRANSLATION_MAP: Record<string, Record<string, string>> = {
  'nav-bar-wrapper': {
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    sticky: 'components.navBarWrapper.sticky',
    transparent: 'components.navBarWrapper.transparent',
    background: 'components.navBarWrapper.background',
    padding: 'components.navBarWrapper.padding',
    maxWidth: 'components.navBarWrapper.maxWidth',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
  },
  columns: {
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    columns: 'components.columns.numColumns',
    gap: 'components.columns.columnGap',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
  },
  rows: {
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    rows: 'components.rows.numRows',
    gap: 'components.rows.rowGap',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
  },
  heading: {
    text: 'components.heading.text',
    level: 'components.heading.level',
    align: 'components.heading.align',
    fontSize: 'components.heading.fontSize',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    fontWeight: 'components.heading.fontWeight',
    gradientEffect: 'components.heading.gradientEffect',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  link: {
    linkText: 'components.link.linkText',
    href: 'components.link.url',
    style: 'components.link.style',
    size: 'components.link.size',
    external: 'components.link.openInNewTab',
    showArrowIcon: 'components.link.showArrowIcon',
    underline: 'components.link.underline',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    hoverColor: 'components.link.hoverColor',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  button: {
    text: 'components.button.buttonText',
    label: 'components.button.label',
    icon: 'components.button.icon',
    href: 'components.button.url',
    variant: 'components.button.variant',
    size: 'components.button.size',
    shape: 'components.button.shape',
    iconPosition: 'components.button.iconPosition',
    fullWidth: 'components.button.fullWidth',
    external: 'components.link.openInNewTab',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  image: {
    src: 'components.image.imageUrl',
    alt: 'components.image.altText',
    width: 'components.image.width',
    height: 'components.image.height',
    objectFit: 'components.image.objectFit',
    aspectRatio: 'components.image.aspectRatio',
    borderRadius: 'components.common.borderRadius',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  description: {
    text: 'components.description.descriptionText',
    fontSize: 'components.description.fontSize',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    align: 'components.heading.align',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  badge: {
    text: 'components.badge.badgeText',
    variant: 'components.badge.variant',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  flex: {
    direction: 'components.flex.direction',
    gap: 'components.flex.gap',
    justify: 'components.flex.justify',
    align: 'components.flex.align',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  container: {
    margin: 'components.common.margin',
    padding: 'components.common.padding',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    borderRadius: 'components.common.borderRadius',
  },
  icon: {
    name: 'components.icon.iconName',
    size: 'components.icon.size',
    color: 'components.icon.color',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    backgroundShape: 'components.icon.bgShape',
    accentColor: 'components.icon.accentColor',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
    margin: 'components.common.margin',
    padding: 'components.common.padding',
  },
  table: {
    data: 'components.table.tableData',
    textColor: 'components.common.textColor',
    backgroundColor: 'components.common.backgroundColor',
    headerBackgroundColor: 'components.table.headerBgColor',
    borderColor: 'components.table.borderColor',
    stripedRows: 'components.table.striped',
    bordered: 'components.table.bordered',
    alignX: 'components.common.alignmentX',
    alignY: 'components.common.alignmentY',
  },
};

/**
 * Get translated schema field label for a component
 * @param componentType - e.g., "heading", "link", "columns"
 * @param fieldKey - e.g., "text", "href", "columns"
 * @param translationDict - Full translation dictionary for current language
 * @returns Translated label or original if not found
 */
export function getTranslatedLabel(
  componentType: string,
  fieldKey: string,
  translationDict: Record<string, any>,
): string | undefined {
  const translationPath = SCHEMA_TRANSLATION_MAP[componentType]?.[fieldKey];
  if (!translationPath) return undefined;

  const keys = translationPath.split('.');
  let value: any = translationDict;
  for (const key of keys) {
    value = value?.[key];
    if (!value) return undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

/**
 * Create a localized copy of schema with translated labels
 */
export function localizeSchema(
  schema: Record<string, FieldSchema>,
  componentType: string,
  translationDict: Record<string, any>,
): Record<string, FieldSchema> {
  const localized: Record<string, FieldSchema> = {};

  for (const [fieldKey, fieldSchema] of Object.entries(schema)) {
    const translatedLabel = getTranslatedLabel(
      componentType,
      fieldKey,
      translationDict,
    );
    localized[fieldKey] = {
      ...fieldSchema,
      label: translatedLabel || fieldSchema.label,
    };
  }

  return localized;
}
