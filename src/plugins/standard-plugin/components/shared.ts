export type Direction = 'horizontal' | 'vertical';
export const aligns = ['start', 'center', 'end', 'stretch'] as const;
export const alignOptions = aligns.map(align => ({ label: align, value: align }));
export type Align = typeof aligns[number];

export interface AlignConfig {
  horizontal?: Align;
  vertical?: Align;
}

const getJustifyContent = (v?: Align) => {
  switch (v) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    default:
      return v;
  }
};

const getAlignItems = (v?: Align) => {
  switch (v) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    default:
      return v;
  }
};

export function getHorizontalAlignCSS({
  horizontal,
  vertical,
}: AlignConfig = {}): React.CSSProperties {
  return {
    justifyContent: getJustifyContent(horizontal),
    alignItems: getAlignItems(vertical),
  };
}

export function getVerticalAlignCSS({
  horizontal,
  vertical,
}: AlignConfig = {}): React.CSSProperties {
  return {
    justifyContent: getJustifyContent(vertical),
    alignItems: getAlignItems(horizontal),
  };
}

export interface TransformConfig {
  width?: number | string;
  height?: number | string;
}

export function getTransformCSS({ width, height }: TransformConfig = {}): React.CSSProperties {
  return { width, height };
}
