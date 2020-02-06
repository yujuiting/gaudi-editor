import styled, { css } from 'styled-components';
import { getLength } from 'base/css';

export interface StackProps {
  grow?: number;
  height?: string | number;
  width?: string | number;
}

export const HStack = styled.div<StackProps>`
  position: relative;
  display: flex;
  width: ${props => getLength(props.width, 'px')};
  height: ${props => getLength(props.height, 'px')};
  ${props =>
    props.grow &&
    css`
      flex-grow: ${props.grow};
      overflow: hidden;
    `}
`;

export const VStack = styled(HStack)`
  flex-direction: column;
`;
