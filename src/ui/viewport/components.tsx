import React, { useMemo, createElement } from 'react';
import styled, { css } from 'styled-components';
import * as theme from 'base/theme';
import { Rect } from 'base/math';
import { getLength } from 'base/css';

export interface ViewportProps {
  cursor?: 'grab' | 'grabbing' | 'zoom-in' | 'zoom-out' | 'auto';
}

const viewportCursor = (props: ViewportProps) =>
  css`
    cursor: ${props.cursor};
  `;

export const Viewport = styled.div`
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  user-select: none;
  width: 100%;
  height: 100%;
  background-color: ${theme.get('viewport.background')};
  ${viewportCursor}
`;

export const Canvas = styled.div`
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  transform-origin: top left;
  background-size: 10px 10px;
  background-image: linear-gradient(
      to right,
      ${theme.get('canvas.grid.color')} 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, ${theme.get('canvas.grid.color')} 1px, transparent 1px);
`;

export interface ViewProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const View = styled.div.attrs<ViewProps>(props => ({
  style: {
    left: `${props.x || 0}px`,
    top: `${props.y || 0}px`,
    width: `${props.width || 0}px`,
    height: `${props.height || 0}px`,
  },
}))`
  position: absolute;
  margin: 0;
  padding: 0;
  width: fit-content;
  height: fit-content;
`;

const HighlightRectEdge = styled.div`
  position: absolute;
  background-color: cyan;
`;

const HighlightRectWrapper = styled.div`
  ${HighlightRectEdge} {
    background-color: ${props => props.theme['viewport.hover.color']};
  }
`;

export interface HighlightProps {
  rect: Rect;
  thickness?: number;
}

export const HighlightRect: React.FC<HighlightProps> = ({ rect, thickness = 1 }) => {
  const top = useMemo<React.CSSProperties>(
    () => ({
      left: rect.position.x,
      top: rect.position.y - thickness,
      width: rect.size.width,
      height: thickness,
    }),
    [rect, thickness]
  );

  const left = useMemo<React.CSSProperties>(
    () => ({
      left: rect.position.x - thickness,
      top: rect.position.y,
      width: thickness,
      height: rect.size.height,
    }),
    [rect, thickness]
  );

  const bottom = useMemo<React.CSSProperties>(
    () => ({
      left: rect.position.x,
      top: rect.position.y + rect.size.height,
      width: rect.size.width,
      height: thickness,
    }),
    [rect, thickness]
  );

  const right = useMemo<React.CSSProperties>(
    () => ({
      left: rect.position.x + rect.size.width,
      top: rect.position.y,
      width: thickness,
      height: rect.size.height,
    }),
    [rect, thickness]
  );

  return (
    <HighlightRectWrapper>
      <HighlightRectEdge style={top} />
      <HighlightRectEdge style={left} />
      <HighlightRectEdge style={bottom} />
      <HighlightRectEdge style={right} />
    </HighlightRectWrapper>
  );
};
