import React, { forwardRef } from 'react';
import { TransformConfig, AlignConfig, getHorizontalAlignCSS, getTransformCSS } from './shared';

export interface Props {
  transform?: TransformConfig;
  align?: AlignConfig;
  children?: string;
}

// eslint-disable-next-line react/display-name
const Text = forwardRef<HTMLDivElement, Props>((props, ref) => {
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

export default Text;
