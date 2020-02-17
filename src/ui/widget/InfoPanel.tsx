import React from 'react';
import styled from 'styled-components';
import { HToolGroup, Tool } from 'ui/components/Toolbar';
import * as Icon from 'ui/components/icons';

const Wrapper = styled.div`
  width: ${props => props.theme['info-panel.width']};
`;

const InfoPanel: React.FC = () => {
  return (
    <Wrapper>
      <HToolGroup>
        <Tool>
          <Icon.Target size={16} title="View" />
        </Tool>
        <Tool>
          <Icon.Info size={16} title="Props" />
        </Tool>
        <Tool>
          <Icon.Style size={16} title="Styles" />
        </Tool>
      </HToolGroup>
    </Wrapper>
  );
};

export default InfoPanel;
