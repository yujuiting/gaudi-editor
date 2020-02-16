import React from 'react';
import { RendererService } from 'editor/RendererService';
import { useMethod } from 'editor/di';

export interface Props {
  rootName: string;
}

const Blueprint: React.FC<Props> = props => {
  const { rootName } = props;

  const getElement = useMethod(RendererService, 'getElement');

  return <div>{getElement(rootName)}</div>;
};

export default Blueprint;
