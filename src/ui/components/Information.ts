import styled from 'styled-components';
import { Input, Label, Select } from './Input';

export const Group = styled.fieldset`
  ${Label}, ${Input} {
    width: 100%;
  }

  ${Input}, ${Select} {
    margin: 4px 0px;
  }
`;

export const GroupTitle = styled.legend``;
