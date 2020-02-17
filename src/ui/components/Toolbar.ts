import styled, { css } from 'styled-components';
import * as theme from 'base/theme';
import { VStack, HStack } from './Stack';

/**
 * ToolBar
 *
 * @structure
 *  <ToolRow>
 *    <ToolGroup group="file">
 *      <Tool info={saveProjectTool} />
 *    </ToolGroup>
 *  </ToolRow>
 */

export interface ToolProps {
  active?: boolean;
  size?: 'small' | 'large';
}

const toolActiveStyle = css`
  color: ${theme.get('color.highlight')};
`;

export const Tool = styled.button<ToolProps>`
  width: ${theme.options('size', 'toolbar.size', '16px')};
  height: ${theme.options('size', 'toolbar.size', '16px')};
  box-sizing: content-box;
  border: none;
  background: inherit;
  color: inherit;
  outline: none;
  overflow-y: hidden;

  :not(:disabled) {
    cursor: pointer;
  }

  > svg {
    width: 100%;
    height: 100%;
  }

  ${props => props.active && toolActiveStyle}
  ${theme.props('active', toolActiveStyle)}
`;

const toolGroupStyle = css`
  position: relative;
  padding: 8px;

  :not(:last-child) {
    :after {
      content: '';
      background-color: ${theme.get('toolbar.divider.color')};
      display: block;
      position: absolute;
    }
  }
`;

export const HToolGroup = styled(HStack)`
  ${Tool} {
    padding: 2px 7px;
  }
  ${toolGroupStyle}
  ${toolGroupStyle} :not(:last-child) {
    :after {
      width: 1px;
      height: 60%;
      top: 20%;
      right: 0;
    }
  }
`;

export const VToolGroup = styled(VStack)`
  ${Tool} {
    padding: 7px 2px;
  }
  ${toolGroupStyle} :not(:last-child) {
    :after {
      width: 60%;
      height: 1px;
      bottom: 0;
      right: 20%;
    }
  }
`;

const toolbarStyle = css`
  background-color: ${theme.get('toolbar.background')};
`;

export const HToolbar = styled(HStack)`
  ${toolbarStyle}
`;

export const VToolbar = styled(VStack)`
  ${toolbarStyle}
`;
