import React, { forwardRef } from 'react';
import {
  Direction,
  AlignConfig,
  getHorizontalAlignCSS,
  getVerticalAlignCSS,
  TransformConfig,
  getTransformCSS,
} from './shared';

const getFlexWrap = (v?: boolean) => (v ? 'wrap' : 'nowrap');

const getAlignCSS = (direction?: Direction, align?: AlignConfig) =>
  direction === 'horizontal' ? getHorizontalAlignCSS(align) : getVerticalAlignCSS(align);

export interface Props {
  direction?: Direction;
  wrap?: boolean;
  scroll?: boolean;
  align?: AlignConfig;
  transform?: TransformConfig;
}

const Stack = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { direction = 'vertical', wrap, scroll, children, align, transform } = props;
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    flexWrap: getFlexWrap(wrap),
    overflow: scroll ? 'auto' : 'hidden',
    ...getAlignCSS(direction, align),
    ...getTransformCSS(transform),
  };
  return (
    <div style={style} ref={ref}>
      {children}
    </div>
  );
});

Stack.displayName = 'Stack';

export default Stack;
