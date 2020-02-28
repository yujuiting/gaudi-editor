import React, { useEffect, useState } from 'react';
import { RendererService } from 'editor/RendererService';
import { useMethodCall, useMethod } from 'editor/di';

export interface Props {
  scope: string;
}

const Blueprint: React.FC<Props> = props => {
  const { scope } = props;

  const [, update] = useState(0);

  const element = useMethodCall(RendererService, 'getElement', [scope]);

  const watch = useMethod(RendererService, 'watch');

  useEffect(() => {
    const subscription = watch(scope).subscribe(() => update(c => c + 1));
    return () => subscription.unsubscribe();
  }, [watch, scope]);

  return <>{element}</>;
};

export default Blueprint;
