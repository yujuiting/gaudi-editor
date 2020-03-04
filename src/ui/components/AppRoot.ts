import styled from 'styled-components';
import * as theme from 'base/theme';

export default styled.div`
  background-color: ${theme.get('app.background')};
  color: ${theme.get('color.text')};
  font-size: ${theme.get('fontSize.normal')};
  width: 100%;
  min-width: 800px;
  height: 100%;
  min-height: 600px;
  overflow: hidden;

  button {
    font-size: ${theme.get('fontSize.small')};
    :disabled {
      color: ${theme.get('color.disable')};
    }
  }

  button:not(:disabled),
  a {
    :hover {
      color: ${theme.get('color.highlight')};
    }
  }
`;
