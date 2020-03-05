import React from 'react';
import styled from 'styled-components';
import { Blueprint } from 'gaudi';
import PresetBlueprint from './PresetBlueprint';

interface PresetBlueprint {
  name: string;
  blueprint: Blueprint;
}

const presetBlueprints: PresetBlueprint[] = [
  { name: 'Stack', blueprint: { type: 'Stack' } },
  { name: 'button', blueprint: { type: 'button' } },
];

const Container = styled.div``;

const ComponentPool: React.FC = () => {
  function rederPresetBlueprint({ name, blueprint }: PresetBlueprint) {
    return <PresetBlueprint key={name} name={name} blueprint={blueprint} />;
  }

  return <Container>{presetBlueprints.map(rederPresetBlueprint)}</Container>;
};

export default ComponentPool;
