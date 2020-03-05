import { ComponentMetadata, PropMetadata } from 'editor/type';

const defaultStyleProps: Record<string, PropMetadata> = {
  // transform
  'style.width': { category: 'style', group: 'transform', label: 'width', type: 'length' },
  'style.height': { category: 'style', group: 'transform', label: 'height', type: 'length' },
  // background
  'style.backgroundColor': {
    category: 'style',
    group: 'background',
    label: 'color',
    type: 'color',
  },
  // typography
  'style.fontSize': { category: 'style', group: 'typography', label: 'fontSize', type: 'length' },
  'style.lineHeight': {
    category: 'style',
    group: 'typography',
    label: 'lineHeight',
    type: 'length',
  },
  'style.textAlign': {
    category: 'style',
    group: 'typography',
    label: 'textAlign',
    type: 'string',
    options: [
      { label: 'left', value: 'left' },
      { label: 'center', value: 'center' },
      { label: 'right', value: 'right' },
    ],
  },
  'style.color': { category: 'style', group: 'typography', label: 'color', type: 'color' },
  // margin
  'style.marginTop': { category: 'style', group: 'margin', label: 'Top', type: 'length' },
  'style.marginBottom': {
    category: 'style',
    group: 'margin',
    label: 'Bottom',
    type: 'length',
  },
  'style.marginLeft': { category: 'style', group: 'margin', label: 'Left', type: 'length' },
  'style.marginRight': { category: 'style', group: 'margin', label: 'Right', type: 'length' },
  // padding
  'style.paddingTop': { category: 'style', group: 'padding', label: 'Top', type: 'length' },
  'style.paddingBottom': {
    category: 'style',
    group: 'padding',
    label: 'Bottom',
    type: 'length',
  },
  'style.paddingLeft': {
    category: 'style',
    group: 'padding',
    label: 'Left',
    type: 'length',
  },
  'style.paddingRight': {
    category: 'style',
    group: 'padding',
    label: 'Right',
    type: 'length',
  },
  // border
  'style.boarderTop': { category: 'style', group: 'border', label: 'Top', type: 'border' },
  'style.boarderBottom': {
    category: 'style',
    group: 'border',
    label: 'Bottom',
    type: 'border',
  },
  'style.boarderLeft': { category: 'style', group: 'border', label: 'Left', type: 'border' },
  'style.boarderRight': {
    category: 'style',
    group: 'border',
    label: 'Right',
    type: 'border',
  },
};

export default {
  img: {
    props: {
      src: { category: 'prop', type: 'string' },
      alt: { category: 'prop', type: 'string' },
      loading: {
        category: 'prop',
        type: 'string',
        options: [
          { label: 'eager', value: 'eager', default: true },
          { label: 'lazy', value: 'lazy' },
        ],
      },
      ...defaultStyleProps,
    },
    constraint: {
      children: { max: 0 },
    },
  },
  a: {
    props: {
      href: { category: 'prop', type: 'string' },
      target: {
        category: 'prop',
        type: 'string',
        defaultValue: '_self',
        options: [
          { label: 'self', value: '_self', default: true },
          { label: 'blank', value: '_blank' },
          { label: 'parent', value: '_parent' },
          { label: 'top', value: '_top' },
        ],
      },
      children: { category: 'prop', type: 'string', label: 'text' },
      ...defaultStyleProps,
    },
  },
  button: {
    props: {
      children: { category: 'prop', type: 'string', label: 'text' },
      ...defaultStyleProps,
    },
    constraint: {
      children: { forbids: ['button'] },
    },
  },
} as Record<string, ComponentMetadata | undefined>;
