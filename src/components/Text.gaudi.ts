import { ComponentMetadata } from 'editor';
import Text from './Text';
import { alignOptions } from './shared';

export const metadata: ComponentMetadata = {
  props: {
    children: { category: 'prop', type: 'string', defaultValue: '', label: 'text' },
    'transform.width': { category: 'style', type: 'length', defaultValue: 'fit-content' },
    'transform.height': { category: 'style', type: 'length', defaultValue: 'fit-content' },
    'align.horizontal': {
      category: 'style',
      type: 'string',
      options: alignOptions,
      defaultValue: 'start',
    },
    'align.vertical': {
      category: 'style',
      type: 'string',
      options: alignOptions,
      defaultValue: 'start',
    },
  },
};

export default Text;
