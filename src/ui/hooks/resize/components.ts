import styled, { css } from 'styled-components';
import * as theme from 'base/theme';
import { getLength } from 'base/css';

export interface HitboxProps {
  thickness: number;
  debug: boolean;
}

const redBackgroundColor = css`
  background-color: red;
`;

const transparentBackgroundColor = css`
  background-color: transparent;
`;

export const Hitbox = styled.div<HitboxProps>`
  position: absolute;
  ${theme.props('debug', redBackgroundColor, transparentBackgroundColor)};
`;

const VerticalHitbox = styled(Hitbox)`
  left: 0;
  cursor: ns-resize;
  width: 100%;
  height: ${props => getLength(props.thickness, 'px')};
`;

export const UpHitbox = styled(VerticalHitbox)`
  top: 0;
`;

export const DownHitbox = styled(VerticalHitbox)`
  bottom: 0;
`;

const HorizontalHitbox = styled(Hitbox)`
  top: 0;
  cursor: ew-resize;
  width: ${props => getLength(props.thickness, 'px')};
  height: 100%;
`;

export const LeftHitbox = styled(HorizontalHitbox)`
  left: 0;
`;

export const RightHitbox = styled(HorizontalHitbox)`
  right: 0;
`;

const CornerHitbox = styled(Hitbox)`
  width: ${props => getLength(props.thickness, 'px')};
  height: ${props => getLength(props.thickness, 'px')};
`;

export const UpLeftHitbox = styled(CornerHitbox)`
  cursor: nwse-resize;
  top: 0;
  left: 0;
`;

export const DownRightHitbox = styled(CornerHitbox)`
  cursor: nwse-resize;
  bottom: 0;
  right: 0;
`;

export const UpRightHitbox = styled(CornerHitbox)`
  cursor: nesw-resize;
  top: 0;
  right: 0;
`;

export const DownLefttHitbox = styled(CornerHitbox)`
  cursor: nesw-resize;
  bottom: 0;
  left: 0;
`;
