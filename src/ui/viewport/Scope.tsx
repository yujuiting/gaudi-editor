import React, { useEffect, useReducer } from 'react';
import { RendererService } from 'editor/RendererService';
import { useMethod } from 'editor/di';

export interface Props {
  scopeName: string;
}

const Scope: React.FC<Props> = props => {
  const { scopeName } = props;

  const [, update] = useReducer(c => c + 1, 0);

  const getElement = useMethod(RendererService, 'getElement');

  const watch = useMethod(RendererService, 'watch');

  useEffect(() => {
    const subscription = watch(scopeName).subscribe(() => update());
    return () => subscription.unsubscribe();
  }, [watch, scopeName]);

  return <>{getElement(scopeName)}</>;
};

export default Scope;
