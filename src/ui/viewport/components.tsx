import React, { useMemo, useContext } from 'react';
import styled, { css, ThemeContext, StyledComponent, DefaultTheme } from 'styled-components';
import * as theme from 'base/theme';
import { Rect } from 'base/math';

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

export const View: StyledComponent<'div', DefaultTheme, ViewProps, never> = styled.div.attrs<
  ViewProps
>(props => ({
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

export interface HighlightProps {
  rect: Rect;
  thickness?: number;
  type: 'selected' | 'hovered';
  dndHovered?: boolean;
}

export const HighlightRect = styled.div<HighlightProps>`
  ${props => {
    let color = 'red';
    switch (props.type) {
      case 'hovered':
        color = props.theme['viewport.hovered.color'];
        break;
      case 'selected':
        color = props.theme['viewport.selected.color'];
        break;
    }
    return css`
      border: ${props.thickness || 1}px solid ${color};
      background-color: ${props.dndHovered ? color : 'none'};
    `;
  }}
  position: absolute;
  left: ${props => props.rect.position.x}px;
  top: ${props => props.rect.position.y}px;
  width: ${props => props.rect.size.width}px;
  height: ${props => props.rect.size.height}px;
`;
