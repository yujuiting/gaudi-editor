import styled, { css } from 'styled-components';
import * as theme from 'base/theme';

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
  /* background-size: 10px 10px;
  background-image: linear-gradient(
      to right,
      ${theme.get('canvas.grid.color')} 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, ${theme.get('canvas.grid.color')} 1px, transparent 1px); */
`;

export interface ViewProps {
  x?: number;
  y?: number;
}

export const View = styled.div.attrs((props: ViewProps) => ({
  style: {
    left: `${props.x || 0}px`,
    top: `${props.y || 0}px`,
  },
}))`
  position: absolute;
  margin: 0;
  padding: 0;
  width: fit-content;
  height: fit-content;
`;
