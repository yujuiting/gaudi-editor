import React from 'react';
import styled from 'styled-components';
import ComponentPool from 'ui/widget/panel/ComponentPool';
import Hierarchy from 'ui/widget/panel/Hierarchy';

const Container = styled.div``;

const ComponentPoolAndHierarchy: React.FC = () => {
  return (
    <Container>
      <ComponentPool />
      <Hierarchy />
    </Container>
  );
};

export default ComponentPoolAndHierarchy;
