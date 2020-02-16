import styled, { css } from 'styled-components';
import { getLength, ifDefined } from 'base/css';

export interface StackProps {
  grow?: number;
  height?: string | number;
  width?: string | number;
}

export const HStack = styled.div<StackProps>`
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
`;

export const VStack = styled(HStack)`
  flex-direction: column;
`;
