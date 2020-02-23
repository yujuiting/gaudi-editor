import { ComponentMetadata } from 'editor/type';

export default {
  img: {
    props: {
      src: {
        type: 'string',
      },
      alt: {
        type: 'string',
      },
      loading: {
        type: 'string',
        options: [
          { label: 'eager', value: 'eager', default: true },
          { label: 'lazy', value: 'lazy' },
        ],
      },
    },
  },
  a: {
    props: {
      href: {
        type: 'string',
      },
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
    },
  },
} as Record<string, ComponentMetadata | undefined>;
