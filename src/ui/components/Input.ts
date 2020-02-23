import styled from 'styled-components';
import * as theme from 'base/theme';

export const Input = styled.input`
  text-overflow: ellipsis;
  overflow: hidden;
  box-sizing: border-box;
  padding: 2px 4px;
  background: ${theme.get('component.input.background')};
  color: ${theme.get('color.text')};
`;

export const Label = styled.label`
  text-overflow: ellipsis;
  overflow: hidden;

  :after {
    display: inline-block;
    content: ':';
    margin-right: 8px;
  }
`;

export const Select = styled.select`
  background: ${theme.get('component.input.background')};
  color: ${theme.get('color.text')};
`;

export const Option = styled.option``;
