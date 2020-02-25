import * as CSS from 'csstype';
import styled, { css } from 'styled-components';
import { getLength, ifDefined } from 'base/css';

export interface Props {
  grow?: number;
  alignItems?: CSS.AlignItemsProperty;
  height?: string | number;
  width?: string | number;
}

export const HStack = styled.div<Props>`
  position: relative;
  display: flex;
  ${ifDefined(
    'width',
    props =>
      css`
        width: ${getLength(props.width, 'px')};
      `
  )}
  ${ifDefined(
    'height',
    props =>
      css`
        height: ${getLength(props.height, 'px')};
      `
  )}
  ${ifDefined(
    'grow',
    props => css`
      flex-grow: ${props.grow};
      overflow: hidden;
    `
  )}
  ${ifDefined(
    'alignItems',
    props =>
      css`
        align-items: ${props.alignItems};
      `
  )}
`;

export const VStack = styled(HStack)`
  flex-direction: column;
`;
