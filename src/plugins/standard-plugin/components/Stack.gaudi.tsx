import { ComponentMetadata } from 'editor';
import Stack from './Stack';
import { alignOptions } from './shared';

export const metadata: ComponentMetadata = {
  props: {
    'transform.width': {
      category: 'style',
      group: 'transform',
      label: 'width',
      type: 'length',
      defaultValue: 'fit-content',
    },
    'transform.height': {
      category: 'style',
      group: 'transform',
      label: 'height',
      type: 'length',
      defaultValue: 'fit-content',
    },
    direction: {
      category: 'style',
      group: 'layout',
      type: 'string',
      options: [
        { label: 'horizontal', value: 'horizontal' },
        { label: 'vertical', value: 'vertical' },
      ],
      defaultValue: 'vertical',
    },
    wrap: { category: 'style', group: 'layout', type: 'boolean', defaultValue: false },
    scroll: { category: 'style', group: 'layout', type: 'boolean', defaultValue: false },
    'align.horizontal': {
      category: 'style',
      group: 'align',
      label: 'horizontal',
      type: 'string',
      options: alignOptions,
      defaultValue: 'start',
    },
    'align.vertical': {
      category: 'style',
      group: 'align',
      label: 'vertical',
      type: 'string',
      options: alignOptions,
      defaultValue: 'start',
    },
  },
};

export default Stack;
