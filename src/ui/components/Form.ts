import styled, { css } from 'styled-components';
import * as theme from 'base/theme';

export interface InputProps {
  invalid?: boolean;
}

const inputInvalidCss = css`
  border-color: ${theme.get('component.input.invalid.border-color')};
  background: ${theme.get('component.input.invalid.background')};
`;

export const Input = styled.input<InputProps>`
  text-overflow: ellipsis;
  overflow: hidden;
  box-sizing: border-box;
  padding: 4px 8px;
  border: 1px solid;
  border-radius: 4px;
  color: ${theme.get('color.text')};
  background: ${theme.get('component.input.background')};
  :hover {
    background: ${theme.get('component.input.hovered.background')};
  }
  ${theme.props('invalid', inputInvalidCss)}
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
  border: 1px solid;
  width: 100%;
  height: 2rem;
  color: ${theme.get('color.text')};
  background: ${theme.get('component.input.background')};
  :hover {
    background: ${theme.get('component.input.hovered.background')};
  }
`;

export const Option = styled.option``;

export const FieldSet = styled.fieldset`
  border-radius: 4px;

  ${Label}, ${Input} {
    width: 100%;
  }

  ${Input}, ${Select} {
    margin: 4px 0px;
  }

  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const Field = styled.div`
  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const Legend = styled.legend``;

export const Form = styled.form``;
