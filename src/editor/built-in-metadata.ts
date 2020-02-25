import { ComponentMetadata, PropMetadata } from 'editor/type';

const defaultStyleProps: Record<string, PropMetadata> = {
  // transform
  'style.width': { type: 'length', uiGroup: 'transform' },
  'style.height': { type: 'length', uiGroup: 'transform' },
  // background
  'style.backgroundColor': { type: 'color', uiGroup: 'background' },
  // typography
  'style.fontSize': { type: 'length', uiGroup: 'typography' },
  'style.lineHeight': { type: 'length', uiGroup: 'typography' },
  'style.textAlign': {
    type: 'string',
    options: [
      { label: 'left', value: 'left' },
      { label: 'center', value: 'center' },
      { label: 'right', value: 'right' },
    ],
    uiGroup: 'typography',
  },
  'style.color': { type: 'color', uiGroup: 'typography' },
  // margin
  'style.marginTop': { type: 'length', uiGroup: 'margin' },
  'style.marginBottom': { type: 'length', uiGroup: 'margin' },
  'style.marginLeft': { type: 'length', uiGroup: 'margin' },
  'style.marginRight': { type: 'length', uiGroup: 'margin' },
  // padding
  'style.paddingTop': { type: 'length', uiGroup: 'padding' },
  'style.paddingBottom': { type: 'length', uiGroup: 'padding' },
  'style.paddingLeft': { type: 'length', uiGroup: 'padding' },
  'style.paddingRight': { type: 'length', uiGroup: 'padding' },
  // border
  'style.boarderTop': { type: 'border', uiGroup: 'border' },
  'style.boarderBottom': { type: 'border', uiGroup: 'border' },
  'style.boarderLeft': { type: 'border', uiGroup: 'border' },
  'style.boarderRight': { type: 'border', uiGroup: 'border' },
};

export default {
  img: {
    props: {
      src: { type: 'string' },
      alt: { type: 'string' },
      loading: {
        type: 'string',
        options: [
          { label: 'eager', value: 'eager', default: true },
          { label: 'lazy', value: 'lazy' },
        ],
      },
      ...defaultStyleProps,
    },
  },
  a: {
    props: {
      href: { type: 'string' },
      target: {
        type: 'string',
        defaultValue: '_self',
        options: [
          { label: 'self', value: '_self', default: true },
          { label: 'blank', value: '_blank' },
          { label: 'parent', value: '_parent' },
          { label: 'top', value: '_top' },
        ],
      },
      children: { type: 'string', uiLabel: 'text' },
      ...defaultStyleProps,
    },
  },
} as Record<string, ComponentMetadata | undefined>;
