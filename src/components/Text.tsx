import React, { forwardRef } from 'react';
import { TransformConfig, AlignConfig, getHorizontalAlignCSS, getTransformCSS } from './shared';

export interface Props {
  transform?: TransformConfig;
  align?: AlignConfig;
  children?: string;
}

export default forwardRef<HTMLDivElement, Props>(function Text(props, ref) {
  const { children, transform, align } = props;
  return (
    <div
      style={{
        display: 'flex',
        ...getHorizontalAlignCSS(align),
        ...getTransformCSS(transform),
      }}
      ref={ref}
    >
      <div>{children}</div>
    </div>
  );
});
