import React, { useEffect, useReducer } from 'react';
import { RendererService } from 'editor/RendererService';
import { useMethod } from 'editor/di';

export interface Props {
  scope: string;
}

const Blueprint: React.FC<Props> = props => {
  const { scope } = props;

  const [, update] = useReducer(c => c + 1, 0);

  const getElement = useMethod(RendererService, 'getElement');

  const watch = useMethod(RendererService, 'watch');

  useEffect(() => {
    const subscription = watch(scope).subscribe(() => update());
    return () => subscription.unsubscribe();
  }, [watch, scope]);

  return <>{getElement(scope)}</>;
};

export default Blueprint;
